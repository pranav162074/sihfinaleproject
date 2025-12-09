/**
 * Utilities for building internal data model from CSV orders
 */

import type { Order, Rake, Wagon, Platform } from "./rake-planner";

export interface InternalModel {
  orders: Order[];
  rakes: Rake[];
  wagons: Wagon[];
  platforms: Platform[];
  constraints: {
    min_rake_utilization_percent: number;
    max_rakes_per_day_overall: number;
    allow_multi_destination_rakes: boolean;
    cost_weight: number;
    sla_weight: number;
    rail_vs_road_bias: string;
  };
}

export interface CSVOrder {
  order_id: string;
  customer_name: string;
  customer_location: string;
  region?: string;
  product_type: string;
  material_grade: string;
  quantity_tonnes: number;
  destination: string;
  priority?: string;
  due_date?: string;
  preferred_mode?: string;
  distance_km?: number;
  penalty_rate_per_day?: number;
}

// Default distances from Bokaro to major cities
const DEFAULT_DISTANCES: Record<string, number> = {
  DELHI: 1250,
  KOLKATA: 380,
  PATNA: 450,
  RAIPUR: 870,
  HYDERABAD: 1400,
  CHENNAI: 1800,
  BANGALORE: 1650,
  MUMBAI: 1200,
  PUNE: 1100,
  AHMEDABAD: 1100,
};

/**
 * Normalize customer ID from customer name
 */
function normalizeCustomerId(name: string): string {
  return (
    "CUST_" +
    name
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/gi, "")
      .toUpperCase()
      .slice(0, 20)
  );
}

/**
 * Normalize material ID from product type and grade
 */
function normalizeMaterialId(productType: string, grade: string): string {
  const typeCode = productType.slice(0, 4).toUpperCase();
  const gradeCode = grade.slice(0, 6).toUpperCase();
  return `MAT_${typeCode}_${gradeCode}`;
}

/**
 * Build enriched order from CSV row
 */
function buildOrder(csvOrder: CSVOrder, index: number): Order | null {
  // Validate mandatory fields
  if (
    !csvOrder.order_id ||
    !csvOrder.customer_name ||
    !csvOrder.destination ||
    !csvOrder.quantity_tonnes
  ) {
    console.warn(`Row ${index}: Missing mandatory field. Skipping.`);
    return null;
  }

  const priority = csvOrder.priority || "Medium";
  const dueDate =
    csvOrder.due_date ||
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const preferredMode = csvOrder.preferred_mode || "rail";
  const distanceKm =
    csvOrder.distance_km ||
    DEFAULT_DISTANCES[csvOrder.destination.toUpperCase()] ||
    1000;
  const penaltyRate = csvOrder.penalty_rate_per_day || 600;

  return {
    order_id: csvOrder.order_id,
    customer_id: normalizeCustomerId(csvOrder.customer_name),
    customer_name: csvOrder.customer_name,
    material_id: normalizeMaterialId(
      csvOrder.product_type,
      csvOrder.material_grade,
    ),
    material_name: `${csvOrder.product_type} (${csvOrder.material_grade})`,
    product_type: csvOrder.product_type,
    destination: csvOrder.destination.toUpperCase(),
    quantity_tonnes: csvOrder.quantity_tonnes,
    priority,
    due_date: dueDate,
    preferred_mode: preferredMode,
    penalty_rate_per_day: penaltyRate,
    partial_allowed: true,
    distance_km: distanceKm,
  };
}

/**
 * Build internal model from CSV orders
 */
export function buildInternalModel(csvOrders: CSVOrder[]): InternalModel {
  // Build orders
  const orders = csvOrders
    .map((csv, idx) => buildOrder(csv, idx))
    .filter((o): o is Order => o !== null);

  // Create default rakes
  const rakes: Rake[] = [
    {
      rake_id: "R1",
      rake_type: "BOXN",
      total_wagons: 45,
      total_capacity_tonnes: 45 * 59,
      current_location: "BOKARO",
      available_from_time: new Date().toISOString(),
    },
    {
      rake_id: "R2",
      rake_type: "BOXN",
      total_wagons: 45,
      total_capacity_tonnes: 45 * 59,
      current_location: "BOKARO",
      available_from_time: new Date().toISOString(),
    },
    {
      rake_id: "R3",
      rake_type: "BOXN",
      total_wagons: 45,
      total_capacity_tonnes: 45 * 59,
      current_location: "BOKARO",
      available_from_time: new Date().toISOString(),
    },
  ];

  // Create wagons for each rake
  const wagons: Wagon[] = [];
  for (const rake of rakes) {
    for (let i = 1; i <= rake.total_wagons; i++) {
      wagons.push({
        wagon_id: `${rake.rake_id}-W${i}`,
        rake_id: rake.rake_id,
        wagon_index: i,
        wagon_type: "BOXN",
        max_capacity_tonnes: 59,
      });
    }
  }

  // Create platforms and loading points
  const platforms: Platform[] = [
    {
      platform_id: "P1",
      platform_name: "Platform 1 (Coils)",
      loading_point_id: "LP1",
      crane_id: "CRANE-P1",
      crane_capacity_tonnes: 30,
      max_rakes_at_once: 1,
    },
    {
      platform_id: "P2",
      platform_name: "Platform 2 (Plates)",
      loading_point_id: "LP2",
      crane_id: "CRANE-P2",
      crane_capacity_tonnes: 35,
      max_rakes_at_once: 1,
    },
    {
      platform_id: "P3",
      platform_name: "Platform 3 (Bars/Slabs)",
      loading_point_id: "LP3",
      crane_id: "CRANE-P3",
      crane_capacity_tonnes: 40,
      max_rakes_at_once: 1,
    },
  ];

  const constraints = {
    min_rake_utilization_percent: 86,
    max_rakes_per_day_overall: 3,
    allow_multi_destination_rakes: false,
    cost_weight: 0.6,
    sla_weight: 0.4,
    rail_vs_road_bias: "rail_first" as const,
  };

  return {
    orders,
    rakes,
    wagons,
    platforms,
    constraints,
  };
}

/**
 * Validate internal model
 */
export function validateInternalModel(model: InternalModel): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!model.orders || model.orders.length === 0) {
    errors.push("No valid orders found in input");
  }

  if (!model.rakes || model.rakes.length === 0) {
    errors.push("No rakes available");
  }

  if (!model.wagons || model.wagons.length === 0) {
    errors.push("No wagons configured");
  }

  if (!model.platforms || model.platforms.length === 0) {
    errors.push("No platforms available");
  }

  // Check for missing customer_id references
  const uniqueCustomerIds = new Set(model.orders.map((o) => o.customer_id));
  for (const customerId of uniqueCustomerIds) {
    if (!model.orders.find((o) => o.customer_id === customerId)) {
      errors.push(`Invalid customer reference: ${customerId}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate synthetic test data
 */
export function generateSyntheticData(): CSVOrder[] {
  return [
    {
      order_id: "ORD001",
      customer_name: "ABC Pipes Ltd",
      customer_location: "DELHI",
      product_type: "Coils",
      material_grade: "IS513 CR1",
      quantity_tonnes: 28.5,
      destination: "DELHI",
      priority: "High",
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      preferred_mode: "rail",
    },
    {
      order_id: "ORD002",
      customer_name: "XYZ Industries",
      customer_location: "KOLKATA",
      product_type: "Plates",
      material_grade: "IS2062 E250",
      quantity_tonnes: 35.2,
      destination: "KOLKATA",
      priority: "Medium",
      due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      preferred_mode: "rail",
    },
    {
      order_id: "ORD003",
      customer_name: "Steel Solutions Inc",
      customer_location: "PATNA",
      product_type: "Bars",
      material_grade: "IS1786 Fe500",
      quantity_tonnes: 42.0,
      destination: "PATNA",
      priority: "High",
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      preferred_mode: "rail",
    },
    {
      order_id: "ORD004",
      customer_name: "Metro Construction",
      customer_location: "RAIPUR",
      product_type: "Slabs",
      material_grade: "IS2041",
      quantity_tonnes: 50.0,
      destination: "RAIPUR",
      priority: "Medium",
      due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      preferred_mode: "rail",
    },
    {
      order_id: "ORD005",
      customer_name: "ABC Pipes Ltd",
      customer_location: "DELHI",
      product_type: "Coils",
      material_grade: "IS513 CR1",
      quantity_tonnes: 25.0,
      destination: "DELHI",
      priority: "Medium",
      due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      preferred_mode: "rail",
    },
    {
      order_id: "ORD006",
      customer_name: "Industrial Supplies Ltd",
      customer_location: "HYDERABAD",
      product_type: "Plates",
      material_grade: "IS2062 E250",
      quantity_tonnes: 30.5,
      destination: "HYDERABAD",
      priority: "Low",
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      preferred_mode: "either",
    },
  ];
}
