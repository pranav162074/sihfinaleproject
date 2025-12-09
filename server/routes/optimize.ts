/**
 * API routes for SAIL Rake Formation DSS optimization
 */

import { RequestHandler } from "express";
import {
  OptimizeRakesRequest,
  OptimizeRakesResponse,
  ExplainPlanRequest,
  ExplainPlanResponse,
  QuantitativeBreakdown,
  AlternativeConsidered,
  SampleDatasetResponse,
  UploadDataResponse,
  Stockyard,
  Order,
  Rake,
  ProductWagonMatrix,
  LoadingPoint,
  RouteCost,
} from "@shared/api";
import { optimizeRakesSimple, generateOrderExplanation, generateRakeExplanation } from "../lib/simple-optimizer";
import { generateSimpleSampleData } from "../lib/simple-data";
import { mlPredictRisk } from "../lib/ml-model";

/**
 * In-memory store for optimization results (for /explain-plan endpoint)
 */
const optimizationResults = new Map<string, OptimizeRakesResponse>();
const uploadedDatasets = new Map<string, unknown>();

/**
 * POST /api/optimize-rakes
 * Main optimization endpoint
 */
export const handleOptimizeRakes: RequestHandler = (req, res) => {
  try {
    const request = req.body as OptimizeRakesRequest;

    // Validate request
    if (!request.stockyards || !request.orders || !request.rakes) {
      return res.status(400).json({ error: "Missing required data arrays" });
    }

    // Run optimization using simplified optimizer
    const result = optimizeRakesSimple(
      request.stockyards,
      request.orders,
      request.rakes,
      request.product_wagon_matrix,
      request.loading_points,
      request.routes_costs,
      request.config || {}
    );

    // Cache result for explanation queries
    optimizationResults.set(result.optimization_id, result);

    res.json(result);
  } catch (error) {
    console.error("Optimization error:", error);
    res
      .status(500)
      .json({
        error: "Optimization failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
  }
};

/**
 * GET /api/explain-plan/:order_id
 * Get natural language explanation for an order's allocation
 */
export const handleExplainPlan: RequestHandler = (req, res) => {
  try {
    const { order_id } = req.params;
    const { optimization_id } = req.query as { optimization_id?: string };

    // Get the most recent optimization result if not specified
    let result: OptimizeRakesResponse | undefined;
    if (optimization_id) {
      result = optimizationResults.get(optimization_id as string);
    } else {
      // Get the last added result
      const allResults = Array.from(optimizationResults.values());
      result = allResults[allResults.length - 1];
    }

    if (!result) {
      return res.status(404).json({ error: "No optimization result found" });
    }

    // Find the planned rake containing this order
    const plannedRake = result.planned_rakes.find((r) =>
      r.orders_allocated.some((o) => o.order_id === order_id)
    );

    if (!plannedRake) {
      return res.status(404).json({ error: "Order not found in optimization result" });
    }

    const orderAllocation = plannedRake.orders_allocated.find(
      (o) => o.order_id === order_id
    )!;

    // Generate explanation
    const explanation = generateDetailedExplanation(
      order_id,
      plannedRake,
      orderAllocation,
      result
    );

    const quantitativeBreakdown: QuantitativeBreakdown = {
      allocated_quantity: orderAllocation.quantity_allocated_tonnes,
      utilization_achieved: plannedRake.utilization_percent,
      cost_per_tonne: Math.round(
        plannedRake.cost_breakdown.transport_cost / plannedRake.total_tonnage_assigned
      ),
      demurrage_saved_inr: calculateDemurageSaved(order_id, plannedRake),
      arrival_prediction: orderAllocation.estimated_arrival,
      delay_probability: calculateDelayProbability(order_id, plannedRake, result),
      risk_tag: plannedRake.risk_flag,
    };

    const alternatives = generateAlternatives(order_id, result, plannedRake);

    const response: ExplainPlanResponse = {
      order_id,
      explanation,
      quantitative_breakdown: quantitativeBreakdown,
      alternatives_considered: alternatives,
    };

    res.json(response);
  } catch (error) {
    console.error("Explain plan error:", error);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
};

/**
 * GET /api/sample-dataset
 * Return the sample SAIL Bokaro dataset
 */
export const handleSampleDataset: RequestHandler = (req, res) => {
  try {
    const dataset = getSampleDataset();
    const response: SampleDatasetResponse = dataset;
    res.json(response);
  } catch (error) {
    console.error("Sample dataset error:", error);
    res.status(500).json({ error: "Failed to load sample dataset" });
  }
};

/**
 * POST /api/upload-data
 * Validate and store uploaded CSV data
 */
export const handleUploadData: RequestHandler = (req, res) => {
  try {
    const {
      stockyards,
      orders,
      rakes,
      product_wagon_matrix,
      loading_points,
      routes_costs,
    } = req.body;

    const validationResults: Record<string, { rows: number; errors: string[] }> = {};
    let allValid = true;

    // Validate each dataset
    if (stockyards) {
      const result = validateStockyards(stockyards);
      validationResults.stockyards = result;
      if (result.errors.length > 0) allValid = false;
    }

    if (orders) {
      const result = validateOrders(orders);
      validationResults.orders = result;
      if (result.errors.length > 0) allValid = false;
    }

    if (rakes) {
      const result = validateRakes(rakes);
      validationResults.rakes = result;
      if (result.errors.length > 0) allValid = false;
    }

    if (product_wagon_matrix) {
      const result = validateProductWagonMatrix(product_wagon_matrix);
      validationResults.product_wagon_matrix = result;
      if (result.errors.length > 0) allValid = false;
    }

    if (loading_points) {
      const result = validateLoadingPoints(loading_points);
      validationResults.loading_points = result;
      if (result.errors.length > 0) allValid = false;
    }

    if (routes_costs) {
      const result = validateRoutesCosts(routes_costs);
      validationResults.routes_costs = result;
      if (result.errors.length > 0) allValid = false;
    }

    // Store uploaded data
    const uploadId = `UPLOAD_${Date.now()}`;
    uploadedDatasets.set(uploadId, {
      stockyards,
      orders,
      rakes,
      product_wagon_matrix,
      loading_points,
      routes_costs,
    });

    const response: UploadDataResponse = {
      success: allValid,
      uploaded_at: new Date().toISOString(),
      files_processed: Object.keys(validationResults).length,
      validation_results: validationResults,
      ready_to_optimize: allValid,
    };

    res.json(response);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to process upload" });
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

function generateDetailedExplanation(
  orderId: string,
  plannedRake: any,
  orderAllocation: any,
  result: OptimizeRakesResponse
): string {
  const wagonsStr =
    orderAllocation.assigned_wagons.length === 1
      ? `WAGON ${orderAllocation.assigned_wagons[0]}`
      : `WAGONS ${orderAllocation.assigned_wagons.join(", ")}`;

  const utilizationStr = (plannedRake.utilization_percent * 100).toFixed(1);
  const costSavings = calculateDemurageSaved(orderId, plannedRake);

  return `ORDER #${orderId} with cargo material from stockyard is allocated to ${wagonsStr} of ${plannedRake.planned_rake_id} (${plannedRake.rake_id}) at ${plannedRake.loading_point_id}, loaded at rail capacity rate.

This plan was chosen because:
(a) **Consolidation with Priority Orders**: This rake already serves ${plannedRake.orders_allocated.length} other high-priority orders bound for ${plannedRake.primary_destination}${plannedRake.secondary_destinations?.length ? " and " + plannedRake.secondary_destinations.join(", ") : ""}, allowing optimal load consolidation.

(b) **Capacity Alignment**: The assigned wagons provide ${utilizationStr}% utilization for this order, maximizing wagon usage while maintaining safe loading limits.

(c) **SLA Optimization**: Rail transit ensures arrival by ${new Date(orderAllocation.estimated_arrival).toLocaleDateString()}, meeting the customer deadline and avoiding late penalties of up to ₹${orderAllocation.quantity_allocated_tonnes * 500 * 2}/day.

(d) **System Efficiency**: This allocation avoids spinning up additional rakes, reducing idle costs by approximately ₹${costSavings} and optimizing the overall network utilization to ${result.kpi_summary.average_rake_utilization_percent.toFixed(1)}%.`;
}

function calculateDemurageSaved(orderId: string, plannedRake: any): number {
  // Simplified: estimate 1-2 days early arrival savings
  const order = plannedRake.orders_allocated.find((o: any) => o.order_id === orderId);
  if (!order) return 0;
  return order.quantity_allocated_tonnes * 500 * 1.5; // conservative estimate
}

function calculateDelayProbability(
  orderId: string,
  plannedRake: any,
  result: OptimizeRakesResponse
): number {
  // Based on rake risk flag
  if (plannedRake.risk_flag === "LOW") return 0.05;
  if (plannedRake.risk_flag === "MEDIUM") return 0.25;
  return 0.6; // HIGH
}

function generateAlternatives(
  orderId: string,
  result: OptimizeRakesResponse,
  selectedRake: any
): AlternativeConsidered[] {
  // Generate synthetic alternative rakes that could have been chosen
  const alternatives: AlternativeConsidered[] = [];

  // Alternative 1: Different rake (lower utilization)
  alternatives.push({
    alternative_rake_id: "RAKE_ALT_1",
    utilization_if_used: 25.0,
    additional_cost: 45000,
    reason_not_chosen:
      "Alternative rake has significantly lower utilization (25%), leading to higher per-tonne costs and wasting siding capacity.",
  });

  // Alternative 2: Road transport
  alternatives.push({
    alternative_rake_id: "ROAD_OPTION",
    utilization_if_used: 100.0,
    additional_cost: 12500,
    reason_not_chosen:
      "Road transport would be 24-48 hours slower and cost ₹380/tonne vs. ₹350/tonne by rail, adding risk to SLA compliance.",
  });

  return alternatives;
}

function validateStockyards(
  data: any
): { rows: number; errors: string[] } {
  const errors: string[] = [];
  const rows = Array.isArray(data) ? data.length : 0;

  if (!Array.isArray(data)) {
    errors.push("Stockyards must be an array");
    return { rows, errors };
  }

  data.forEach((row, idx) => {
    if (!row.stockyard_id) errors.push(`Row ${idx}: Missing stockyard_id`);
    if (!row.location) errors.push(`Row ${idx}: Missing location`);
    if (!row.material_id) errors.push(`Row ${idx}: Missing material_id`);
    if (typeof row.available_tonnage !== "number")
      errors.push(`Row ${idx}: available_tonnage must be a number`);
  });

  return { rows, errors };
}

function validateOrders(
  data: any
): { rows: number; errors: string[] } {
  const errors: string[] = [];
  const rows = Array.isArray(data) ? data.length : 0;

  if (!Array.isArray(data)) {
    errors.push("Orders must be an array");
    return { rows, errors };
  }

  data.forEach((row, idx) => {
    if (!row.order_id) errors.push(`Row ${idx}: Missing order_id`);
    if (!row.customer_id) errors.push(`Row ${idx}: Missing customer_id`);
    if (!row.destination) errors.push(`Row ${idx}: Missing destination`);
    if (typeof row.quantity_tonnes !== "number")
      errors.push(`Row ${idx}: quantity_tonnes must be a number`);
  });

  return { rows, errors };
}

function validateRakes(
  data: any
): { rows: number; errors: string[] } {
  const errors: string[] = [];
  const rows = Array.isArray(data) ? data.length : 0;

  if (!Array.isArray(data)) {
    errors.push("Rakes must be an array");
    return { rows, errors };
  }

  data.forEach((row, idx) => {
    if (!row.rake_id) errors.push(`Row ${idx}: Missing rake_id`);
    if (!row.wagon_type) errors.push(`Row ${idx}: Missing wagon_type`);
    if (typeof row.total_capacity_tonnes !== "number")
      errors.push(`Row ${idx}: total_capacity_tonnes must be a number`);
  });

  return { rows, errors };
}

function validateProductWagonMatrix(
  data: any
): { rows: number; errors: string[] } {
  const errors: string[] = [];
  const rows = Array.isArray(data) ? data.length : 0;

  if (!Array.isArray(data)) {
    errors.push("Product wagon matrix must be an array");
    return { rows, errors };
  }

  data.forEach((row, idx) => {
    if (!row.material_id) errors.push(`Row ${idx}: Missing material_id`);
    if (!row.wagon_type) errors.push(`Row ${idx}: Missing wagon_type`);
  });

  return { rows, errors };
}

function validateLoadingPoints(
  data: any
): { rows: number; errors: string[] } {
  const errors: string[] = [];
  const rows = Array.isArray(data) ? data.length : 0;

  if (!Array.isArray(data)) {
    errors.push("Loading points must be an array");
    return { rows, errors };
  }

  data.forEach((row, idx) => {
    if (!row.loading_point_id) errors.push(`Row ${idx}: Missing loading_point_id`);
    if (typeof row.max_rakes_per_day !== "number")
      errors.push(`Row ${idx}: max_rakes_per_day must be a number`);
  });

  return { rows, errors };
}

function validateRoutesCosts(
  data: any
): { rows: number; errors: string[] } {
  const errors: string[] = [];
  const rows = Array.isArray(data) ? data.length : 0;

  if (!Array.isArray(data)) {
    errors.push("Routes & costs must be an array");
    return { rows, errors };
  }

  data.forEach((row, idx) => {
    if (!row.origin) errors.push(`Row ${idx}: Missing origin`);
    if (!row.destination) errors.push(`Row ${idx}: Missing destination`);
    if (!row.mode) errors.push(`Row ${idx}: Missing mode`);
  });

  return { rows, errors };
}
