/**
 * API endpoints for rake planning
 */

import { RequestHandler } from "express";
import { planRakes, type RakePlanOutput } from "../lib/rake-planner";
import {
  buildInternalModel,
  validateInternalModel,
  generateSyntheticData,
  type CSVOrder,
} from "../lib/rake-planner-utils";

/**
 * POST /api/plan-rakes
 * Main endpoint: accepts CSV orders and returns optimized rake plan
 * Includes robust error handling and fallback logic
 */
export const handlePlanRakes: RequestHandler = (req, res) => {
  try {
    const { orders } = req.body as { orders: CSVOrder[] };

    // Validation: Check input
    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        status: "error",
        error: "Invalid input format",
        message: "Request must include 'orders' as an array",
        suggestion:
          "Provide orders: [{order_id, customer_name, destination, ...}]",
      });
    }

    if (orders.length === 0) {
      return res.status(400).json({
        status: "error",
        error: "Empty order list",
        message: "At least one order is required",
        suggestion: "Upload a CSV with order data or use the sample dataset",
      });
    }

    // Check for minimum required fields
    const requiredFields = [
      "order_id",
      "customer_name",
      "destination",
      "quantity_tonnes",
    ];
    const missingFieldsMap = new Map<string, string[]>();

    orders.forEach((order, idx) => {
      const missing = requiredFields.filter(
        (field) => !order[field as keyof CSVOrder],
      );
      if (missing.length > 0) {
        missingFieldsMap.set(`Row ${idx}`, missing);
      }
    });

    if (missingFieldsMap.size > 0) {
      const details = Array.from(missingFieldsMap.entries())
        .slice(0, 5)
        .map(([row, fields]) => `${row}: missing ${fields.join(", ")}`);

      return res.status(400).json({
        status: "error",
        error: "Missing required fields in order data",
        message: "Some orders are missing required columns",
        missing_fields: requiredFields,
        sample_issues: details,
        suggestion:
          "Ensure all orders have: order_id, customer_name, destination, quantity_tonnes",
      });
    }

    // Build internal model with validation
    let model;
    try {
      model = buildInternalModel(orders);
    } catch (buildError) {
      return res.status(400).json({
        status: "error",
        error: "Model building failed",
        message:
          buildError instanceof Error
            ? buildError.message
            : "Failed to process order data",
        suggestion:
          "Check that quantity_tonnes and distance_km are valid numbers",
      });
    }

    // Validate model
    const validation = validateInternalModel(model);
    if (!validation.valid) {
      return res.status(400).json({
        status: "error",
        error: "Validation failed",
        details: validation.errors.slice(0, 5),
        message: `${validation.errors.length} validation issues found`,
        suggestion: "Review the errors above and correct the data",
      });
    }

    // Plan rakes with fallback logic
    let rakePlan: RakePlanOutput;
    try {
      rakePlan = planRakes(
        model.orders,
        model.rakes,
        model.wagons,
        model.platforms,
        model.constraints,
      );

      // Ensure we have a valid result
      if (!rakePlan || !rakePlan.rake_plan || rakePlan.rake_plan.length === 0) {
        // Fallback: return a plan with all orders marked as road
        const roadPlan: RakePlanOutput = {
          rake_plan: model.orders.map((order, idx) => ({
            order_id: order.order_id,
            customer_name: order.customer_name,
            customer_id: order.customer_id,
            material_id: order.material_id,
            material_name: order.material_name,
            product_type: order.product_type,
            assigned_mode: "road",
            rake_id: "ROAD",
            wagon_id: "ROAD",
            wagon_index: 0,
            platform_id: "N/A",
            platform_name: "Road Transport",
            crane_id: "N/A",
            crane_capacity_tonnes: 0,
            allocated_quantity_tonnes: order.quantity_tonnes,
            origin: "BOKARO",
            destination: order.destination,
            priority: order.priority,
            due_date: order.due_date,
            expected_departure_time: new Date().toISOString(),
            expected_arrival_time: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            utilization_percent_for_wagon: 100,
            utilization_percent_for_rake: 100,
            transport_cost: order.quantity_tonnes * 765,
            loading_cost: order.quantity_tonnes * 50,
            expected_penalty_cost: 0,
            idle_freight_cost: 0,
            total_estimated_cost: order.quantity_tonnes * 815,
            sla_status: "On-time",
            reason: "Fallback: Road transport due to rail unavailability",
          })),
          kpi_summary: {
            total_orders: model.orders.length,
            orders_served_by_rail: 0,
            orders_served_by_road: model.orders.length,
            rakes_used: 0,
            average_rake_utilization_percent: 0,
            total_estimated_cost: model.orders.reduce(
              (sum, o) => sum + o.quantity_tonnes * 815,
              0,
            ),
            estimated_cost_savings_vs_baseline: 0,
            estimated_demurrage_savings: 0,
          },
          natural_language_plan: model.orders.map((order) => ({
            sentence: `ORDER #${order.order_id} with cargo ${order.material_name} from ${order.customer_name} is allocated to road transport to ${order.destination}.`,
            reason:
              "Rail capacity unavailable. Road transport selected as fallback with 2-day transit time.",
          })),
        };
        return res.json(roadPlan);
      }
    } catch (planError) {
      console.error("Planning error:", planError);
      return res.status(500).json({
        status: "error",
        error: "Optimization planning failed",
        message:
          planError instanceof Error
            ? planError.message
            : "An unexpected error occurred during planning",
        suggestion: "Try with a smaller dataset or different parameters",
      });
    }

    // Return successful plan
    res.json(rakePlan);
  } catch (error) {
    console.error("Request handling error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal server error",
      message: "An unexpected error occurred",
      suggestion: "Please contact support if this persists",
    });
  }
};

/**
 * GET /api/plan-rakes/demo
 * Returns a demo plan with synthetic data
 */
export const handlePlanRakesDemo: RequestHandler = (req, res) => {
  try {
    const syntheticOrders = generateSyntheticData();
    const model = buildInternalModel(syntheticOrders);

    const rakePlan = planRakes(
      model.orders,
      model.rakes,
      model.wagons,
      model.platforms,
      model.constraints,
    );

    res.json(rakePlan);
  } catch (error) {
    console.error("Demo planning error:", error);
    res.status(500).json({
      error: "Demo planning failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
