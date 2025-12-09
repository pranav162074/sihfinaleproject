/**
 * OptiRake Cost-Optimized Rake Scheduling Engine
 * Minimizes total logistics cost while respecting operational constraints
 */

export interface OrderData {
  order_id: string;
  customer_name: string;
  product_type: string;
  destination: string;
  quantity_tonnes: number;
  distance_km?: number;
  priority?: number;
  due_date?: string;
  preferred_mode?: string;
}

export interface RakePlanItem {
  order_id: string;
  customer_name: string;
  product_type: string;
  destination: string;
  quantity_tonnes: number;
  rake_id: string;
  wagon_id: string;
  wagon_index: number;
  platform_id: string;
  crane_capacity_tonnes: number;
  utilization_percent: number;
  estimated_cost: number;
  explanation: string;
  reason: string;
  transport_mode: "rail" | "road";
  origin: string;
  status?: "pending" | "approved" | "overridden";
}

interface RakeInfo {
  rake_id: string;
  orders: RakePlanItem[];
  totalQuantity: number;
  totalOrders: number;
  destinations: Set<string>;
  totalCost: number;
  utilization: number;
  explanation: string;
}

// ========== HARD CONSTRAINTS ==========
const RAKE_CAPACITY_TONNES = 1170; // 18 wagons × 65 tonnes per wagon
const WAGON_CAPACITY_TONNES = 65;
const MAX_ORDERS_PER_RAKE = 18;
const MAX_DESTINATIONS_PER_RAKE = 1;
const MIN_RAKE_UTILIZATION_PERCENT = 85;
const CRANE_CAPACITY_TONNES = 30;

// ========== COST MODEL PARAMETERS ==========
const COST_PER_TONNE_RAIL = 350;
const COST_PER_TONNE_ROAD = 765;
const FIXED_RAKE_COST = 2500; // Fixed cost per rake (platforms, administrative overhead)
const DEMURRAGE_COST_PER_HOUR = 50; // Cost for idle/waiting time
const PENALTY_PER_DAY_LATE = 1000; // Penalty for SLA violations
const UNDERUTILIZATION_PENALTY_PER_PERCENT = 15; // Penalty for rakes below 85% utilization

/**
 * Complete cost model for rake planning
 */
function calculateRakePlanCost(rakes: RakeInfo[]): {
  totalCost: number;
  railCost: number;
  roadCost: number;
  fixedRakeCost: number;
  utilizationPenalty: number;
  slaPenalty: number;
  demurrageCost: number;
  details: string;
} {
  let railCost = 0;
  let roadCost = 0;
  let utilizationPenalty = 0;
  let slaPenalty = 0;
  let demurrageCost = 0;

  rakes.forEach((rake, idx) => {
    const isLastRake = idx === rakes.length - 1;

    rake.orders.forEach((order) => {
      if (order.transport_mode === "rail") {
        railCost += order.estimated_cost;
      } else {
        roadCost += order.estimated_cost;
      }

      // SLA penalty: if due_date is early (high priority), add penalty for late delivery risk
      if (order.priority && order.priority <= 2 && order.due_date) {
        // For high-priority orders, assume 5% risk of 1-day delay
        slaPenalty += order.quantity_tonnes > 100 ? PENALTY_PER_DAY_LATE * 0.05 : 0;
      }
    });

    // Utilization penalty: penalize underfilled rakes (except last one)
    if (!isLastRake && rake.utilization < MIN_RAKE_UTILIZATION_PERCENT) {
      const underutilizationGap = MIN_RAKE_UTILIZATION_PERCENT - rake.utilization;
      utilizationPenalty += underutilizationGap * UNDERUTILIZATION_PENALTY_PER_PERCENT;
    }

    // Demurrage: estimate based on rake complexity (multi-destination = longer loading)
    if (rake.destinations.size > 1) {
      const estimatedLoadingHours = rake.destinations.size * 4;
      demurrageCost += estimatedLoadingHours * DEMURRAGE_COST_PER_HOUR;
    }
  });

  const fixedRakeCostTotal = FIXED_RAKE_COST * rakes.length;
  const totalCost = railCost + roadCost + fixedRakeCostTotal + utilizationPenalty + slaPenalty + demurrageCost;

  return {
    totalCost: Math.round(totalCost),
    railCost: Math.round(railCost),
    roadCost: Math.round(roadCost),
    fixedRakeCost: Math.round(fixedRakeCostTotal),
    utilizationPenalty: Math.round(utilizationPenalty),
    slaPenalty: Math.round(slaPenalty),
    demurrageCost: Math.round(demurrageCost),
    details: `Rail: ₹${Math.round(railCost / 1000)}k | Road: ₹${Math.round(roadCost / 1000)}k | Fixed Rakes: ₹${Math.round(fixedRakeCostTotal / 1000)}k`,
  };
}

/**
 * Determine transport mode based on order characteristics
 */
function determineTransportMode(
  quantity: number,
  distance: number,
  priority: number
): "rail" | "road" {
  // Prefer rail for high-quantity, long-distance, non-urgent orders
  if (quantity >= 80 && distance > 1000 && priority >= 2) {
    return "rail";
  }
  // Use road for urgent orders or short distances
  if (priority <= 2 || distance < 500) {
    return "road";
  }
  // Default: rail for cost efficiency
  return "rail";
}

/**
 * Calculate transport cost for an order
 */
function calculateOrderCost(quantity: number, mode: "rail" | "road"): number {
  const perTonneCost = mode === "rail" ? COST_PER_TONNE_RAIL : COST_PER_TONNE_ROAD;
  return Math.round(quantity * perTonneCost);
}

/**
 * Check if adding order to rake violates hard constraints
 */
function canAddOrderToRake(
  rake: RakeInfo,
  order: OrderData,
  allowMultiDestination: boolean = false
): { canAdd: boolean; reason: string } {
  // Constraint 1: Check destination
  if (rake.destinations.size > 0 && !rake.destinations.has(order.destination)) {
    if (!allowMultiDestination || rake.destinations.size >= MAX_DESTINATIONS_PER_RAKE) {
      return {
        canAdd: false,
        reason: `Destination mismatch: rake serves ${Array.from(rake.destinations).join(", ")}, order goes to ${order.destination}`,
      };
    }
  }

  // Constraint 2: Check max orders per rake
  if (rake.totalOrders >= MAX_ORDERS_PER_RAKE) {
    return {
      canAdd: false,
      reason: `Rake has max ${MAX_ORDERS_PER_RAKE} orders`,
    };
  }

  // Constraint 3: Check capacity
  if (rake.totalQuantity + order.quantity_tonnes > RAKE_CAPACITY_TONNES) {
    return {
      canAdd: false,
      reason: `Would exceed capacity: ${rake.totalQuantity} + ${order.quantity_tonnes} > ${RAKE_CAPACITY_TONNES} MT`,
    };
  }

  return { canAdd: true, reason: "Constraints satisfied" };
}

/**
 * Group orders by destination and SLA urgency for intelligent clustering
 */
function clusterOrdersByDestinationAndSLA(orders: OrderData[]): Map<string, OrderData[]> {
  const clusters = new Map<string, OrderData[]>();

  const sorted = [...orders].sort((a, b) => {
    // Sort by destination, then by priority (urgent first), then by due_date
    if (a.destination !== b.destination) {
      return a.destination.localeCompare(b.destination);
    }
    const priorityDiff = (a.priority || 3) - (b.priority || 3);
    if (priorityDiff !== 0) return priorityDiff;
    return (a.due_date || "").localeCompare(b.due_date || "");
  });

  sorted.forEach((order) => {
    const dest = order.destination;
    if (!clusters.has(dest)) {
      clusters.set(dest, []);
    }
    clusters.get(dest)!.push(order);
  });

  return clusters;
}

/**
 * Pack orders into rakes using first-fit-decreasing heuristic
 * This prevents the "1 rake per order" problem while keeping utilization high
 */
function packOrdersIntoRakes(orders: OrderData[]): RakePlanItem[] {
  const clusters = clusterOrdersByDestinationAndSLA(orders);
  const result: RakePlanItem[] = [];
  const rakes: RakeInfo[] = [];

  let rakeCounter = 1;

  // Process each destination cluster
  clusters.forEach((clusterOrders) => {
    // Sort within cluster by quantity (descending) to improve packing
    const sorted = [...clusterOrders].sort((a, b) => b.quantity_tonnes - a.quantity_tonnes);

    sorted.forEach((order) => {
      let assigned = false;

      // Try to fit into existing rake with SAME destination (critical fix!)
      for (let i = 0; i < rakes.length; i++) {
        const rake = rakes[i];
        // Only consider rakes that serve the same destination
        if (!rake.destinations.has(order.destination)) {
          continue; // Skip rakes with different destinations
        }

        const check = canAddOrderToRake(rake, order, false);

        if (check.canAdd) {
          // Add to this rake
          const transportMode = determineTransportMode(
            order.quantity_tonnes,
            order.distance_km || 800,
            order.priority || 3
          );

          const cost = calculateOrderCost(order.quantity_tonnes, transportMode);

          const rakePlanItem: RakePlanItem = {
            order_id: order.order_id,
            customer_name: order.customer_name,
            product_type: order.product_type,
            destination: order.destination,
            quantity_tonnes: order.quantity_tonnes,
            rake_id: rake.rake_id,
            wagon_id: `W${rake.rake_id}-${rake.totalOrders + 1}`,
            wagon_index: rake.totalOrders + 1,
            platform_id: `P${Math.min(rake.orders.length % 3 + 1, 3)}`,
            crane_capacity_tonnes: CRANE_CAPACITY_TONNES,
            utilization_percent: Math.min(
              (order.quantity_tonnes / CRANE_CAPACITY_TONNES) * 100,
              100
            ),
            estimated_cost: cost,
            explanation: `Order #${order.order_id} (${order.product_type}, ${order.quantity_tonnes} MT from ${order.customer_name}) assigned to ${rake.rake_id}.`,
            reason: `Consolidation with other ${order.destination}-bound orders. Rake utilization optimized for cost efficiency.`,
            transport_mode: transportMode,
            origin: "Bokaro Steel Plant",
            status: "pending",
          };

          result.push(rakePlanItem);
          rake.orders.push(rakePlanItem);
          rake.totalQuantity += order.quantity_tonnes;
          rake.totalOrders += 1;
          rake.destinations.add(order.destination);
          rake.totalCost += cost;
          rake.utilization = (rake.totalQuantity / RAKE_CAPACITY_TONNES) * 100;

          assigned = true;
          break;
        }
      }

      // If not assigned to any existing rake, create new one
      if (!assigned) {
        const transportMode = determineTransportMode(
          order.quantity_tonnes,
          order.distance_km || 800,
          order.priority || 3
        );

        const cost = calculateOrderCost(order.quantity_tonnes, transportMode);

        const newRake: RakeInfo = {
          rake_id: `R${rakeCounter}`,
          orders: [],
          totalQuantity: 0,
          totalOrders: 0,
          destinations: new Set(),
          totalCost: 0,
          utilization: 0,
          explanation: "",
        };

        const rakePlanItem: RakePlanItem = {
          order_id: order.order_id,
          customer_name: order.customer_name,
          product_type: order.product_type,
          destination: order.destination,
          quantity_tonnes: order.quantity_tonnes,
          rake_id: newRake.rake_id,
          wagon_id: `W${newRake.rake_id}-1`,
          wagon_index: 1,
          platform_id: "P1",
          crane_capacity_tonnes: CRANE_CAPACITY_TONNES,
          utilization_percent: Math.min(
            (order.quantity_tonnes / CRANE_CAPACITY_TONNES) * 100,
            100
          ),
          estimated_cost: cost,
          explanation: `Order #${order.order_id} (${order.product_type}, ${order.quantity_tonnes} MT from ${order.customer_name}) allocated to new ${newRake.rake_id}.`,
          reason: `No existing rake had capacity. New rake created for ${order.destination}-bound freight.`,
          transport_mode: transportMode,
          origin: "Bokaro Steel Plant",
          status: "pending",
        };

        result.push(rakePlanItem);
        newRake.orders.push(rakePlanItem);
        newRake.totalQuantity = order.quantity_tonnes;
        newRake.totalOrders = 1;
        newRake.destinations.add(order.destination);
        newRake.totalCost = cost;
        newRake.utilization = (order.quantity_tonnes / RAKE_CAPACITY_TONNES) * 100;

        rakes.push(newRake);
        rakeCounter++;
      }
    });
  });

  // Generate detailed explanations for each rake
  const rakeMap = new Map<string, RakeInfo>();
  rakes.forEach((rake) => {
    rakeMap.set(rake.rake_id, rake);
  });

  result.forEach((item) => {
    const rake = rakeMap.get(item.rake_id);
    if (rake) {
      const totalOrders = rake.totalOrders;
      const totalQty = rake.totalQuantity;
      const util = Math.round(rake.utilization);
      const destList = Array.from(rake.destinations).join(", ");

      item.reason = `Order consolidated with ${totalOrders > 1 ? totalOrders - 1 + " other orders" : "others"} in ${item.rake_id} serving ${destList}. Rake at ${util}% capacity (${Math.round(totalQty)} / ${RAKE_CAPACITY_TONNES} MT). Transport mode: ${item.transport_mode.toUpperCase()}. Cost: ₹${Math.round(item.estimated_cost / 1000)}k.`;
    }
  });

  return result;
}

/**
 * Main optimization function - produces cost-minimized rake plan
 */
export function optimizeRakeAllocation(orders: OrderData[]): RakePlanItem[] {
  if (!orders || orders.length === 0) return [];

  // Run packing algorithm
  let plan = packOrdersIntoRakes(orders);

  // Validation check: Ensure we're not creating 1 rake per order or 1 rake for all
  const uniqueRakes = new Set(plan.map((item) => item.rake_id)).size;
  const orderCount = orders.length;

  // Guardrail 1: If we have 1 rake for all orders
  if (uniqueRakes === 1 && orderCount > 1) {
    // Check if this is truly justified (all same destination, fits capacity)
    const totalQty = plan.reduce((sum, item) => sum + item.quantity_tonnes, 0);
    if (totalQty <= RAKE_CAPACITY_TONNES) {
      // Single rake is valid - high utilization possible
      // This is OK if all orders have same destination and fit
    } else {
      // This shouldn't happen, but if it does, recompute
      plan = packOrdersIntoRakes(orders);
    }
  }

  // Guardrail 2: If we have 1 rake per order (bad packing)
  if (uniqueRakes >= orderCount * 0.8) {
    // Too many rakes - this is excessive. Reattempt with relaxed constraints
    // Try allowing multi-destination rakes temporarily
    const altPlan: RakePlanItem[] = [];
    const rakes: RakeInfo[] = [];
    let rakeCounter = 1;

    const sorted = [...orders].sort((a, b) => b.quantity_tonnes - a.quantity_tonnes);

    sorted.forEach((order) => {
      let assigned = false;

      // Try to fit into any existing rake with SAME destination
      for (const rake of rakes) {
        if (!rake.destinations.has(order.destination)) {
          continue; // Only match destinations
        }
        const check = canAddOrderToRake(rake, order, true);
        if (check.canAdd) {
          const transportMode = determineTransportMode(
            order.quantity_tonnes,
            order.distance_km || 800,
            order.priority || 3
          );
          const cost = calculateOrderCost(order.quantity_tonnes, transportMode);

          const item: RakePlanItem = {
            order_id: order.order_id,
            customer_name: order.customer_name,
            product_type: order.product_type,
            destination: order.destination,
            quantity_tonnes: order.quantity_tonnes,
            rake_id: rake.rake_id,
            wagon_id: `W${rake.rake_id}-${rake.totalOrders + 1}`,
            wagon_index: rake.totalOrders + 1,
            platform_id: `P${(rake.orders.length % 3) + 1}`,
            crane_capacity_tonnes: CRANE_CAPACITY_TONNES,
            utilization_percent: Math.min((order.quantity_tonnes / CRANE_CAPACITY_TONNES) * 100, 100),
            estimated_cost: cost,
            explanation: `Order assigned to ${rake.rake_id}.`,
            reason: `Packed for cost optimization.`,
            transport_mode: transportMode,
            origin: "Bokaro Steel Plant",
            status: "pending",
          };

          altPlan.push(item);
          rake.orders.push(item);
          rake.totalQuantity += order.quantity_tonnes;
          rake.totalOrders += 1;
          rake.destinations.add(order.destination);
          rake.totalCost += cost;
          rake.utilization = (rake.totalQuantity / RAKE_CAPACITY_TONNES) * 100;

          assigned = true;
          break;
        }
      }

      if (!assigned) {
        const transportMode = determineTransportMode(
          order.quantity_tonnes,
          order.distance_km || 800,
          order.priority || 3
        );
        const cost = calculateOrderCost(order.quantity_tonnes, transportMode);

        const newRake: RakeInfo = {
          rake_id: `R${rakeCounter}`,
          orders: [],
          totalQuantity: order.quantity_tonnes,
          totalOrders: 1,
          destinations: new Set([order.destination]),
          totalCost: cost,
          utilization: (order.quantity_tonnes / RAKE_CAPACITY_TONNES) * 100,
          explanation: "",
        };

        const item: RakePlanItem = {
          order_id: order.order_id,
          customer_name: order.customer_name,
          product_type: order.product_type,
          destination: order.destination,
          quantity_tonnes: order.quantity_tonnes,
          rake_id: newRake.rake_id,
          wagon_id: `W${newRake.rake_id}-1`,
          wagon_index: 1,
          platform_id: "P1",
          crane_capacity_tonnes: CRANE_CAPACITY_TONNES,
          utilization_percent: Math.min((order.quantity_tonnes / CRANE_CAPACITY_TONNES) * 100, 100),
          estimated_cost: cost,
          explanation: `Order assigned to new ${newRake.rake_id}.`,
          reason: `No existing rake had capacity.`,
          transport_mode: transportMode,
          origin: "Bokaro Steel Plant",
          status: "pending",
        };

        altPlan.push(item);
        newRake.orders.push(item);
        rakes.push(newRake);
        rakeCounter++;
      }
    });

    // Check if alternative plan is better
    const altRakeCount = new Set(altPlan.map((item) => item.rake_id)).size;
    if (altRakeCount < uniqueRakes && altRakeCount > 1) {
      plan = altPlan;
    }
  }

  return plan;
}

/**
 * Validate rake formations against all hard constraints
 */
export function validateRakeFormations(rakePlan: RakePlanItem[]): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  const rakeMap = new Map<string, RakePlanItem[]>();

  rakePlan.forEach((item) => {
    if (!rakeMap.has(item.rake_id)) {
      rakeMap.set(item.rake_id, []);
    }
    rakeMap.get(item.rake_id)!.push(item);
  });

  rakeMap.forEach((rakeItems, rakeId) => {
    // Constraint 1: Max orders
    if (rakeItems.length > MAX_ORDERS_PER_RAKE) {
      violations.push(`${rakeId}: ${rakeItems.length} orders exceeds max ${MAX_ORDERS_PER_RAKE}`);
    }

    // Constraint 2: Max capacity
    const totalQty = rakeItems.reduce((sum, item) => sum + item.quantity_tonnes, 0);
    if (totalQty > RAKE_CAPACITY_TONNES) {
      violations.push(`${rakeId}: ${Math.round(totalQty)} MT exceeds capacity ${RAKE_CAPACITY_TONNES} MT`);
    }

    // Constraint 3: Destinations
    const dests = new Set(rakeItems.map((item) => item.destination));
    if (dests.size > MAX_DESTINATIONS_PER_RAKE) {
      violations.push(`${rakeId}: ${dests.size} destinations exceed max ${MAX_DESTINATIONS_PER_RAKE}`);
    }
  });

  // Guardrail: Check for unreasonable rake distribution
  const rakeCount = rakeMap.size;
  const orderCount = rakePlan.length;
  if (rakeCount === 1 && orderCount > 5) {
    violations.push(`WARNING: All ${orderCount} orders in 1 rake - consider splitting for resilience`);
  }
  if (rakeCount >= orderCount * 0.7) {
    violations.push(`WARNING: ${rakeCount} rakes for ${orderCount} orders - excessive fragmentation`);
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Calculate comprehensive KPI summary
 */
export function calculateKPISummary(rakePlan: RakePlanItem[]) {
  const totalOrders = rakePlan.length;
  const railOrders = rakePlan.filter((item) => item.transport_mode === "rail").length;
  const roadOrders = rakePlan.filter((item) => item.transport_mode === "road").length;

  const totalQuantity = rakePlan.reduce((sum, item) => sum + item.quantity_tonnes, 0);
  const totalDirectCost = rakePlan.reduce((sum, item) => sum + item.estimated_cost, 0);

  // Reconstruct rakes for utilization calculation
  const rakeMap = new Map<string, RakePlanItem[]>();
  rakePlan.forEach((item) => {
    if (!rakeMap.has(item.rake_id)) {
      rakeMap.set(item.rake_id, []);
    }
    rakeMap.get(item.rake_id)!.push(item);
  });

  const rakes: RakeInfo[] = [];
  rakeMap.forEach((items, rakeId) => {
    const qty = items.reduce((sum, item) => sum + item.quantity_tonnes, 0);
    const dests = new Set(items.map((item) => item.destination));
    const cost = items.reduce((sum, item) => sum + item.estimated_cost, 0);

    rakes.push({
      rake_id: rakeId,
      orders: items,
      totalQuantity: qty,
      totalOrders: items.length,
      destinations: dests,
      totalCost: cost,
      utilization: (qty / RAKE_CAPACITY_TONNES) * 100,
      explanation: "",
    });
  });

  const costModel = calculateRakePlanCost(rakes);
  const baselineCost = totalQuantity * COST_PER_TONNE_ROAD;
  const savings = baselineCost - costModel.totalCost;
  const savingsPercent = totalQuantity > 0 ? ((savings / baselineCost) * 100).toFixed(1) : "0";

  const avgUtilization =
    rakes.length > 0
      ? Math.round(
          (rakes.reduce((sum, rake) => sum + rake.utilization, 0) / rakes.length) * 10
        ) / 10
      : 0;

  return {
    totalOrders,
    railOrders,
    roadOrders,
    totalQuantity: Math.round(totalQuantity * 10) / 10,
    totalCost: costModel.totalCost,
    baselineCost: Math.round(baselineCost),
    costSavings: Math.round(savings),
    costSavingsPercent: savingsPercent,
    rakesFormed: rakes.length,
    avgUtilization,
    costBreakdown: costModel.details,
  };
}
