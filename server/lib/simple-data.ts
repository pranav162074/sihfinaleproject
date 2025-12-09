/**
 * Simplified sample data generator for SAIL rake optimization
 * Uses only essential columns: order_id, destination, material_type, quantity_tonnes, priority, due_date, distance_km
 */

import {
  Order,
  Rake,
  ProductWagonMatrix,
  LoadingPoint,
  RouteCost,
  Stockyard,
  InputDataset,
} from "@shared/api";

export function generateSimpleSampleData(): InputDataset {
  // Minimal set of orders (extracted from real SAIL data, keeping only 7 essential columns)
  const orders: Order[] = [
    {
      order_id: "ORD001",
      customer_id: "CUST_A",
      destination: "DELHI",
      material_id: "COILS",
      quantity_tonnes: 28.5,
      priority: 1,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 500,
    },
    {
      order_id: "ORD002",
      customer_id: "CUST_B",
      destination: "DELHI",
      material_id: "PLATES",
      quantity_tonnes: 35.0,
      priority: 2,
      due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 600,
    },
    {
      order_id: "ORD003",
      customer_id: "CUST_C",
      destination: "MUMBAI",
      material_id: "COILS",
      quantity_tonnes: 42.0,
      priority: 1,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 700,
    },
    {
      order_id: "ORD004",
      customer_id: "CUST_D",
      destination: "BANGALORE",
      material_id: "PLATES",
      quantity_tonnes: 25.5,
      priority: 2,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 400,
    },
    {
      order_id: "ORD005",
      customer_id: "CUST_E",
      destination: "DELHI",
      material_id: "SLABS",
      quantity_tonnes: 55.0,
      priority: 3,
      due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 350,
    },
    {
      order_id: "ORD006",
      customer_id: "CUST_F",
      destination: "KOLKATA",
      material_id: "COILS",
      quantity_tonnes: 30.0,
      priority: 2,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 450,
    },
    {
      order_id: "ORD007",
      customer_id: "CUST_G",
      destination: "MUMBAI",
      material_id: "PLATES",
      quantity_tonnes: 48.0,
      priority: 1,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 550,
    },
    {
      order_id: "ORD008",
      customer_id: "CUST_H",
      destination: "BANGALORE",
      material_id: "SLABS",
      quantity_tonnes: 38.0,
      priority: 2,
      due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 480,
    },
    {
      order_id: "ORD009",
      customer_id: "CUST_I",
      destination: "DELHI",
      material_id: "COILS",
      quantity_tonnes: 32.0,
      priority: 1,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 520,
    },
    {
      order_id: "ORD010",
      customer_id: "CUST_J",
      destination: "KOLKATA",
      material_id: "PLATES",
      quantity_tonnes: 45.0,
      priority: 2,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      penalty_rate_per_day: 410,
    },
  ];

  // Minimal set of rakes
  const rakes: Rake[] = [
    {
      rake_id: "RAKE_001",
      wagon_type: "BOXN",
      num_wagons: 34,
      per_wagon_capacity_tonnes: 28.0,
      total_capacity_tonnes: 952.0,
      available_from_time: new Date().toISOString(),
      current_location: "BOKARO",
    },
    {
      rake_id: "RAKE_002",
      wagon_type: "BOXN",
      num_wagons: 34,
      per_wagon_capacity_tonnes: 28.0,
      total_capacity_tonnes: 952.0,
      available_from_time: new Date().toISOString(),
      current_location: "BOKARO",
    },
    {
      rake_id: "RAKE_003",
      wagon_type: "BOXX",
      num_wagons: 40,
      per_wagon_capacity_tonnes: 24.0,
      total_capacity_tonnes: 960.0,
      available_from_time: new Date().toISOString(),
      current_location: "BOKARO",
    },
  ];

  // Product-wagon compatibility matrix
  const productWagonMatrix: ProductWagonMatrix[] = [
    {
      material_id: "COILS",
      wagon_type: "BOXN",
      max_load_per_wagon_tonnes: 26.0,
      allowed: true,
    },
    {
      material_id: "COILS",
      wagon_type: "BOXX",
      max_load_per_wagon_tonnes: 22.0,
      allowed: true,
    },
    {
      material_id: "PLATES",
      wagon_type: "BOXN",
      max_load_per_wagon_tonnes: 25.0,
      allowed: true,
    },
    {
      material_id: "PLATES",
      wagon_type: "BOXX",
      max_load_per_wagon_tonnes: 20.0,
      allowed: true,
    },
    {
      material_id: "SLABS",
      wagon_type: "BOXN",
      max_load_per_wagon_tonnes: 24.0,
      allowed: true,
    },
    {
      material_id: "SLABS",
      wagon_type: "BOXX",
      max_load_per_wagon_tonnes: 19.0,
      allowed: true,
    },
  ];

  // Minimal loading points
  const loadingPoints: LoadingPoint[] = [
    {
      loading_point_id: "LP1",
      stockyard_id: "SY_BOKARO",
      max_rakes_per_day: 5,
      loading_rate_tonnes_per_hour: 120.0,
      operating_hours_start: 6,
      operating_hours_end: 22,
      siding_capacity_rakes: 5,
    },
  ];

  // Routes with distances for cost calculation
  const routesCosts: RouteCost[] = [
    {
      origin: "BOKARO",
      destination: "DELHI",
      mode: "rail",
      distance_km: 1400,
      transit_time_hours: 72,
      cost_per_tonne: 280,
    },
    {
      origin: "BOKARO",
      destination: "MUMBAI",
      mode: "rail",
      distance_km: 1200,
      transit_time_hours: 60,
      cost_per_tonne: 320,
    },
    {
      origin: "BOKARO",
      destination: "BANGALORE",
      mode: "rail",
      distance_km: 1600,
      transit_time_hours: 84,
      cost_per_tonne: 350,
    },
    {
      origin: "BOKARO",
      destination: "KOLKATA",
      mode: "rail",
      distance_km: 400,
      transit_time_hours: 18,
      cost_per_tonne: 150,
    },
  ];

  // Minimal stockyards
  const stockyards: Stockyard[] = [
    {
      stockyard_id: "SY_BOKARO",
      location: "BOKARO",
      material_id: "COILS",
      available_tonnage: 500,
      safety_stock: 50,
      loading_point_id: "LP1",
    },
    {
      stockyard_id: "SY_BOKARO",
      location: "BOKARO",
      material_id: "PLATES",
      available_tonnage: 450,
      safety_stock: 50,
      loading_point_id: "LP1",
    },
    {
      stockyard_id: "SY_BOKARO",
      location: "BOKARO",
      material_id: "SLABS",
      available_tonnage: 400,
      safety_stock: 50,
      loading_point_id: "LP1",
    },
  ];

  return {
    stockyards,
    orders,
    rakes,
    product_wagon_matrix: productWagonMatrix,
    loading_points: loadingPoints,
    routes_costs: routesCosts,
  };
}
