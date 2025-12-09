/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

// ============================================================================
// Input Data Types
// ============================================================================

export interface Stockyard {
  stockyard_id: string;
  location: string;
  material_id: string;
  available_tonnage: number;
  safety_stock?: number;
  loading_point_id: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  destination: string;
  material_id: string;
  quantity_tonnes: number;
  priority: number; // 1 (highest) to 5 (lowest)
  due_date: string; // ISO datetime string
  penalty_rate_per_day?: number;
  preferred_mode?: "rail" | "road" | "either";
  partial_allowed?: boolean;
}

export interface Rake {
  rake_id: string;
  wagon_type: string;
  num_wagons: number;
  per_wagon_capacity_tonnes: number;
  total_capacity_tonnes: number;
  available_from_time: string; // ISO datetime string
  current_location: string;
}

export interface ProductWagonMatrix {
  material_id: string;
  wagon_type: string;
  max_load_per_wagon_tonnes: number;
  allowed: boolean;
}

export interface LoadingPoint {
  loading_point_id: string;
  stockyard_id: string;
  max_rakes_per_day: number;
  loading_rate_tonnes_per_hour: number;
  operating_hours_start: number; // 0-23
  operating_hours_end: number; // 0-23
  siding_capacity_rakes: number;
}

export interface RouteCost {
  origin: string;
  destination: string;
  mode: "rail" | "road";
  distance_km: number;
  transit_time_hours: number;
  cost_per_tonne: number;
  idle_freight_cost_per_hour?: number;
}

export interface InputDataset {
  stockyards: Stockyard[];
  orders: Order[];
  rakes: Rake[];
  product_wagon_matrix: ProductWagonMatrix[];
  loading_points: LoadingPoint[];
  routes_costs: RouteCost[];
}

// ============================================================================
// Optimization Configuration
// ============================================================================

export interface OptimizationConfig {
  cost_vs_sla_weight?: number; // 0.0 to 1.0 (0 = pure cost, 1 = pure SLA)
  allow_multi_destination_rakes?: boolean;
  min_utilization_percent?: number; // e.g., 75
  rail_bias_factor?: number; // > 1.0 to prefer rail
  optimize_timeout_seconds?: number;
}

// ============================================================================
// Optimization Request/Response
// ============================================================================

export interface OptimizeRakesRequest {
  stockyards: Stockyard[];
  orders: Order[];
  rakes: Rake[];
  product_wagon_matrix: ProductWagonMatrix[];
  loading_points: LoadingPoint[];
  routes_costs: RouteCost[];
  config: OptimizationConfig;
}

export interface OrderAllocation {
  order_id: string;
  customer_id: string;
  quantity_allocated_tonnes: number;
  assigned_wagons: number[];
  estimated_arrival: string; // ISO datetime
}

export interface CostBreakdown {
  loading_cost: number;
  transport_cost: number;
  penalty_cost: number;
  idle_freight_cost: number;
  total_cost: number;
}

export interface PlannedRake {
  planned_rake_id: string;
  rake_id: string;
  wagon_type: string;
  num_wagons: number;
  loading_point_id: string;
  departure_time: string; // ISO datetime
  primary_destination: string;
  secondary_destinations?: string[];
  total_tonnage_assigned: number;
  utilization_percent: number;
  orders_allocated: OrderAllocation[];
  cost_breakdown: CostBreakdown;
  sla_status: "On-time" | "At-Risk" | "Late";
  risk_flag: "LOW" | "MEDIUM" | "HIGH";
  cost_multiplier: number;
  explanation_tags: string[];
}

export interface RailVsRoadAssignment {
  order_id: string;
  assigned_mode: "rail" | "road";
  assigned_rake_id?: string;
  planned_truck_batches?: number;
  expected_ship_date: string; // ISO datetime
  expected_arrival_date: string; // ISO datetime
  confidence_percent: number;
}

export interface ProductionSuggestion {
  material_id: string;
  current_inventory_tonnes: number;
  recommended_production_tonnage: number;
  reasoning: string;
}

export interface KPISummary {
  total_cost_optimized: number;
  cost_savings_vs_baseline: number;
  average_rake_utilization_percent: number;
  number_of_rakes_planned: number;
  demurrage_savings: number;
  on_time_delivery_percent: number;
}

export interface OptimizeRakesResponse {
  success: boolean;
  optimization_id: string;
  timestamp: string; // ISO datetime
  solver_status: "OPTIMAL" | "SUB_OPTIMAL" | "INFEASIBLE" | "TIMEOUT";
  execution_time_seconds: number;
  kpi_summary: KPISummary;
  planned_rakes: PlannedRake[];
  rail_vs_road_assignment: RailVsRoadAssignment[];
  production_suggestions: ProductionSuggestion[];
  late_or_at_risk_orders: string[]; // order_ids
}

// ============================================================================
// Explanation Request/Response
// ============================================================================

export interface ExplainPlanRequest {
  order_id: string;
  optimization_id?: string;
}

export interface QuantitativeBreakdown {
  allocated_quantity: number;
  utilization_achieved: number;
  cost_per_tonne: number;
  demurrage_saved_inr: number;
  arrival_prediction: string; // ISO datetime
  delay_probability: number;
  risk_tag: "LOW" | "MEDIUM" | "HIGH";
}

export interface AlternativeConsidered {
  alternative_rake_id: string;
  utilization_if_used: number;
  additional_cost: number;
  reason_not_chosen: string;
}

export interface ExplainPlanResponse {
  order_id: string;
  explanation: string; // Natural language explanation
  quantitative_breakdown: QuantitativeBreakdown;
  alternatives_considered: AlternativeConsidered[];
}

// ============================================================================
// Data Upload Request/Response
// ============================================================================

export interface FileValidationResult {
  rows: number;
  errors: string[];
}

export interface UploadDataResponse {
  success: boolean;
  uploaded_at: string; // ISO datetime
  files_processed: number;
  validation_results: {
    stockyards?: FileValidationResult;
    orders?: FileValidationResult;
    rakes?: FileValidationResult;
    product_wagon_matrix?: FileValidationResult;
    loading_points?: FileValidationResult;
    routes_costs?: FileValidationResult;
  };
  ready_to_optimize: boolean;
}

// ============================================================================
// Sample Dataset Response
// ============================================================================

export interface SampleDatasetResponse extends InputDataset {}

// ============================================================================
// Example response type for /api/demo
// ============================================================================

export interface DemoResponse {
  message: string;
}

// ============================================================================
// ML Model Prediction Types
// ============================================================================

export interface MLFeatures {
  distance_km: number;
  transit_time_hours: number;
  priority: number;
  material_weight: number;
  loading_point_congestion: number;
  route_historical_delays_pct: number;
  time_until_due_date_hours: number;
  mode: 0 | 1; // 0 = road, 1 = rail
  season_factor: number;
}

export interface MLPrediction {
  delay_risk_probability: number;
  risk_flag: "LOW" | "MEDIUM" | "HIGH";
  additional_cost_multiplier: number;
}

// ============================================================================
// Data Schema Definitions (for UI display)
// ============================================================================

export interface ColumnDefinition {
  name: string;
  type: "string" | "int" | "float" | "datetime" | "bool";
  example: string | number | boolean;
  required: boolean;
  description: string;
}

export interface DataSchemaDefinition {
  table_name: string;
  description: string;
  columns: ColumnDefinition[];
  sample_row: Record<string, any>;
}

// Export all schema definitions
export const DATA_SCHEMAS: Record<string, DataSchemaDefinition> = {
  stockyards: {
    table_name: "stockyards.csv",
    description: "Warehouse and stockyard locations with material inventory",
    columns: [
      {
        name: "stockyard_id",
        type: "string",
        example: "BOKARO_SY_1",
        required: true,
        description: "Unique identifier for stockyard",
      },
      {
        name: "location",
        type: "string",
        example: "Bokaro, Jharkhand",
        required: true,
        description: "Geographic location",
      },
      {
        name: "material_id",
        type: "string",
        example: "HRC",
        required: true,
        description: "Material type stored",
      },
      {
        name: "available_tonnage",
        type: "float",
        example: 450.5,
        required: true,
        description: "Tonnes of material in stock",
      },
      {
        name: "safety_stock",
        type: "float",
        example: 50.0,
        required: false,
        description: "Minimum stock level to maintain",
      },
      {
        name: "loading_point_id",
        type: "string",
        example: "BOKARO_LP_1",
        required: true,
        description: "Associated loading point",
      },
    ],
    sample_row: {
      stockyard_id: "BOKARO_SY_1",
      location: "Bokaro, Jharkhand",
      material_id: "HRC",
      available_tonnage: 450.5,
      safety_stock: 50.0,
      loading_point_id: "BOKARO_LP_1",
    },
  },
  orders: {
    table_name: "orders.csv",
    description: "Customer orders for materials",
    columns: [
      {
        name: "order_id",
        type: "string",
        example: "ORD_2024_001",
        required: true,
        description: "Unique order identifier",
      },
      {
        name: "customer_id",
        type: "string",
        example: "ABC_PIPES",
        required: true,
        description: "Customer identifier",
      },
      {
        name: "destination",
        type: "string",
        example: "Delhi",
        required: true,
        description: "Delivery location",
      },
      {
        name: "material_id",
        type: "string",
        example: "HRC",
        required: true,
        description: "Material type requested",
      },
      {
        name: "quantity_tonnes",
        type: "float",
        example: 28.5,
        required: true,
        description: "Order quantity in tonnes",
      },
      {
        name: "priority",
        type: "int",
        example: 1,
        required: true,
        description: "1=highest, 5=lowest",
      },
      {
        name: "due_date",
        type: "datetime",
        example: "2024-01-15T10:00:00Z",
        required: true,
        description: "Delivery deadline",
      },
      {
        name: "penalty_rate_per_day",
        type: "float",
        example: 500.0,
        required: false,
        description: "Cost per day late (INR)",
      },
      {
        name: "preferred_mode",
        type: "string",
        example: "rail",
        required: false,
        description: "Preference: rail/road/either",
      },
      {
        name: "partial_allowed",
        type: "bool",
        example: false,
        required: false,
        description: "Allow split across rakes",
      },
    ],
    sample_row: {
      order_id: "ORD_2024_001",
      customer_id: "ABC_PIPES",
      destination: "Delhi",
      material_id: "HRC",
      quantity_tonnes: 28.5,
      priority: 1,
      due_date: "2024-01-15T10:00:00Z",
      penalty_rate_per_day: 500.0,
      preferred_mode: "rail",
      partial_allowed: false,
    },
  },
  rakes: {
    table_name: "rakes.csv",
    description: "Available rakes/trains for transport",
    columns: [
      {
        name: "rake_id",
        type: "string",
        example: "RAKE_001",
        required: true,
        description: "Unique rake identifier",
      },
      {
        name: "wagon_type",
        type: "string",
        example: "BOXN",
        required: true,
        description: "Type of wagons",
      },
      {
        name: "num_wagons",
        type: "int",
        example: 34,
        required: true,
        description: "Number of wagons in rake",
      },
      {
        name: "per_wagon_capacity_tonnes",
        type: "float",
        example: 28.0,
        required: true,
        description: "Capacity per wagon",
      },
      {
        name: "total_capacity_tonnes",
        type: "float",
        example: 952.0,
        required: true,
        description: "Total rake capacity",
      },
      {
        name: "available_from_time",
        type: "datetime",
        example: "2024-01-14T08:00:00Z",
        required: true,
        description: "When rake becomes available",
      },
      {
        name: "current_location",
        type: "string",
        example: "BOKARO",
        required: true,
        description: "Current location",
      },
    ],
    sample_row: {
      rake_id: "RAKE_001",
      wagon_type: "BOXN",
      num_wagons: 34,
      per_wagon_capacity_tonnes: 28.0,
      total_capacity_tonnes: 952.0,
      available_from_time: "2024-01-14T08:00:00Z",
      current_location: "BOKARO",
    },
  },
  product_wagon_matrix: {
    table_name: "product_wagon_matrix.csv",
    description: "Compatibility matrix between materials and wagon types",
    columns: [
      {
        name: "material_id",
        type: "string",
        example: "HRC",
        required: true,
        description: "Material type",
      },
      {
        name: "wagon_type",
        type: "string",
        example: "BOXN",
        required: true,
        description: "Compatible wagon type",
      },
      {
        name: "max_load_per_wagon_tonnes",
        type: "float",
        example: 26.0,
        required: true,
        description: "Safe loading limit",
      },
      {
        name: "allowed",
        type: "bool",
        example: true,
        required: true,
        description: "Is combination allowed",
      },
    ],
    sample_row: {
      material_id: "HRC",
      wagon_type: "BOXN",
      max_load_per_wagon_tonnes: 26.0,
      allowed: true,
    },
  },
  loading_points: {
    table_name: "loading_points.csv",
    description: "Sidings and loading facilities",
    columns: [
      {
        name: "loading_point_id",
        type: "string",
        example: "BOKARO_LP_1",
        required: true,
        description: "Unique loading point ID",
      },
      {
        name: "stockyard_id",
        type: "string",
        example: "BOKARO_SY_1",
        required: true,
        description: "Associated stockyard",
      },
      {
        name: "max_rakes_per_day",
        type: "int",
        example: 3,
        required: true,
        description: "Max rakes can load per day",
      },
      {
        name: "loading_rate_tonnes_per_hour",
        type: "float",
        example: 120.0,
        required: true,
        description: "Tonnage loading speed",
      },
      {
        name: "operating_hours_start",
        type: "int",
        example: 6,
        required: true,
        description: "Start hour (24h format)",
      },
      {
        name: "operating_hours_end",
        type: "int",
        example: 22,
        required: true,
        description: "End hour (24h format)",
      },
      {
        name: "siding_capacity_rakes",
        type: "int",
        example: 5,
        required: true,
        description: "Physical siding capacity",
      },
    ],
    sample_row: {
      loading_point_id: "BOKARO_LP_1",
      stockyard_id: "BOKARO_SY_1",
      max_rakes_per_day: 3,
      loading_rate_tonnes_per_hour: 120.0,
      operating_hours_start: 6,
      operating_hours_end: 22,
      siding_capacity_rakes: 5,
    },
  },
  routes_costs: {
    table_name: "routes_costs.csv",
    description: "Transport routes with cost parameters",
    columns: [
      {
        name: "origin",
        type: "string",
        example: "BOKARO",
        required: true,
        description: "Origin location code",
      },
      {
        name: "destination",
        type: "string",
        example: "DELHI",
        required: true,
        description: "Destination location code",
      },
      {
        name: "mode",
        type: "string",
        example: "rail",
        required: true,
        description: "Transport mode: rail/road",
      },
      {
        name: "distance_km",
        type: "float",
        example: 1400.0,
        required: true,
        description: "Distance in km",
      },
      {
        name: "transit_time_hours",
        type: "float",
        example: 72.0,
        required: true,
        description: "Expected travel time",
      },
      {
        name: "cost_per_tonne",
        type: "float",
        example: 350.0,
        required: true,
        description: "Transport cost per tonne",
      },
      {
        name: "idle_freight_cost_per_hour",
        type: "float",
        example: 25.0,
        required: false,
        description: "Demurrage/idle cost per hour",
      },
    ],
    sample_row: {
      origin: "BOKARO",
      destination: "DELHI",
      mode: "rail",
      distance_km: 1400.0,
      transit_time_hours: 72.0,
      cost_per_tonne: 350.0,
      idle_freight_cost_per_hour: 25.0,
    },
  },
};

// ============================================================================
// OptiRake DSS Rake Planning Output Types
// ============================================================================

export interface RakePlanItem {
  order_id: string;
  customer_name: string;
  customer_id: string;
  material_id: string;
  material_name: string;
  product_type: string;
  assigned_mode: string;
  rake_id: string;
  wagon_id: string;
  wagon_index: number;
  platform_id: string;
  platform_name: string;
  crane_id: string;
  crane_capacity_tonnes: number;
  allocated_quantity_tonnes: number;
  origin: string;
  destination: string;
  priority: string;
  due_date: string;
  expected_departure_time: string;
  expected_arrival_time: string;
  utilization_percent_for_wagon: number;
  utilization_percent_for_rake: number;
  transport_cost: number;
  loading_cost: number;
  expected_penalty_cost: number;
  idle_freight_cost: number;
  total_estimated_cost: number;
  sla_status: "On-time" | "At-Risk" | "Late";
  reason: string;
}

export interface KPISummary {
  total_orders: number;
  orders_served_by_rail: number;
  orders_served_by_road: number;
  rakes_used: number;
  average_rake_utilization_percent: number;
  total_estimated_cost: number;
  estimated_cost_savings_vs_baseline: number;
  estimated_demurrage_savings: number;
}

export interface RakePlanOutput {
  rake_plan: RakePlanItem[];
  kpi_summary: KPISummary;
  natural_language_plan: Array<{
    sentence: string;
    reason: string;
  }>;
}
