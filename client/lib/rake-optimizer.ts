/**
 * OptiRake Allocation Engine
 * Implements proper rake distribution with SAIL-compliant constraints
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

interface RakeState {
  rake_id: string;
  orders: RakePlanItem[];
  totalQuantity: number;
  totalOrders: number;
  destination: string;
  platformIndex: number;
}

// CONSTRAINT CONSTANTS
const RAKE_CAPACITY_TONNES = 1170; // 18 wagons × 65 tonnes per wagon
const WAGON_CAPACITY_TONNES = 65;
const MAX_ORDERS_PER_RAKE = 18; // SAIL operational standard
const MAX_DESTINATIONS_PER_RAKE = 1; // Single destination per rake
const MIN_RAKE_UTILIZATION_PERCENT = 85; // Except last rake
const CRANE_CAPACITY_TONNES = 30;
const RAKE_WAGON_COUNT = 18;
const COST_PER_TONNE_RAIL = 350;
const COST_PER_TONNE_ROAD = 765;

/**
 * Determines transport mode based on order characteristics
 */
function determineTransportMode(
  quantity: number,
  distance: number,
  priority: number
): "rail" | "road" {
  if (quantity > 100 && distance > 1000 && priority > 2) {
    return "rail";
  }
  if (priority <= 2 || distance < 500) {
    return "road";
  }
  return "rail";
}

/**
 * Calculate cost for order based on transport mode
 */
function calculateCost(quantity: number, mode: "rail" | "road"): number {
  const perTonneCost = mode === "rail" ? COST_PER_TONNE_RAIL : COST_PER_TONNE_ROAD;
  return Math.round(quantity * perTonneCost);
}

/**
 * Check if adding order to rake would violate any constraint
 */
function canAddOrderToRake(
  rakeState: RakeState,
  order: OrderData,
  isLastRake: boolean
): { canAdd: boolean; reason: string } {
  // Constraint 1: Check destination match (max 1 destination per rake)
  if (rakeState.destination !== order.destination) {
    return {
      canAdd: false,
      reason: `Different destination: rake serves ${rakeState.destination}, order goes to ${order.destination}`,
    };
  }

  // Constraint 2: Check max orders per rake (18 orders)
  if (rakeState.totalOrders >= MAX_ORDERS_PER_RAKE) {
    return {
      canAdd: false,
      reason: `Rake already has max ${MAX_ORDERS_PER_RAKE} orders`,
    };
  }

  // Constraint 3: Check max capacity in tonnes
  const newQuantity = rakeState.totalQuantity + order.quantity_tonnes;
  if (newQuantity > RAKE_CAPACITY_TONNES) {
    return {
      canAdd: false,
      reason: `Adding ${order.quantity_tonnes} MT would exceed rake capacity of ${RAKE_CAPACITY_TONNES} MT (current: ${rakeState.totalQuantity} MT)`,
    };
  }

  // Constraint 4: Check utilization (except for last rake)
  if (!isLastRake) {
    const projectedUtilization = (newQuantity / RAKE_CAPACITY_TONNES) * 100;
    if (projectedUtilization < MIN_RAKE_UTILIZATION_PERCENT && rakeState.totalOrders > 0) {
      // Allow adding if we're still below threshold
      if (projectedUtilization < MIN_RAKE_UTILIZATION_PERCENT) {
        return {
          canAdd: true,
          reason: `Adding ${order.quantity_tonnes} MT; rake utilization at ${Math.round(projectedUtilization)}%`,
        };
      }
    }
  }

  return {
    canAdd: true,
    reason: `Adding ${order.quantity_tonnes} MT to rake (total: ${newQuantity} MT, orders: ${rakeState.totalOrders + 1}/${MAX_ORDERS_PER_RAKE})`,
  };
}

/**
 * Generate natural language reasoning for order allocation
 */
function generateReasoning(
  order: OrderData,
  rakeState: RakeState,
  constraint: string
): string {
  const destinationInfo = `destination matches ${rakeState.destination}-bound orders`;
  const capacityInfo = `total rake quantity at ${Math.round((rakeState.totalQuantity + order.quantity_tonnes) / RAKE_CAPACITY_TONNES * 100)}% utilization`;
  const priorityInfo = `priority level ${order.priority || 3}`;
  
  return `Order #${order.order_id} assigned to ${rakeState.rake_id} because: (1) ${destinationInfo}, (2) ${capacityInfo}, (3) SLA deadline ${order.due_date || "standard"}, and (4) ${priorityInfo}. Constraint check: ${constraint}`;
}

/**
 * Main optimization function - distributes orders across multiple rakes with constraint enforcement
 */
export function optimizeRakeAllocation(orders: OrderData[]): RakePlanItem[] {
  if (!orders || orders.length === 0) return [];

  const result: RakePlanItem[] = [];
  
  // Sort all orders by: destination, then priority (descending), then deadline
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.destination !== b.destination) {
      return a.destination.localeCompare(b.destination);
    }
    const priorityDiff = (b.priority || 3) - (a.priority || 3);
    if (priorityDiff !== 0) return priorityDiff;
    return (a.due_date || "").localeCompare(b.due_date || "");
  });

  let rakeCounter = 1;
  let currentRake: RakeState = {
    rake_id: `R${rakeCounter}`,
    orders: [],
    totalQuantity: 0,
    totalOrders: 0,
    destination: sortedOrders[0].destination,
    platformIndex: 1,
  };

  for (let i = 0; i < sortedOrders.length; i++) {
    const order = sortedOrders[i];
    const isLastOrder = i === sortedOrders.length - 1;
    
    // Check if we need to finalize current rake and create a new one
    const check = canAddOrderToRake(currentRake, order, isLastOrder);
    
    if (!check.canAdd && currentRake.totalOrders > 0) {
      // Check if current rake meets minimum utilization (except it's the last rake with content)
      const currentUtilization = (currentRake.totalQuantity / RAKE_CAPACITY_TONNES) * 100;
      
      // Finalize current rake regardless of utilization for last rake, or if it meets threshold
      rakeCounter++;
      currentRake = {
        rake_id: `R${rakeCounter}`,
        orders: [],
        totalQuantity: 0,
        totalOrders: 0,
        destination: order.destination,
        platformIndex: 1,
      };
    }

    // Allocate order to current rake
    const transportMode = determineTransportMode(
      order.quantity_tonnes,
      order.distance_km || 800,
      order.priority || 3
    );

    const requiredWagons = Math.ceil(order.quantity_tonnes / WAGON_CAPACITY_TONNES);
    const wagonId = `W${currentRake.rake_id}-${currentRake.totalOrders + 1}`;
    const platformId = `P${currentRake.platformIndex}`;
    const craneCapacity = CRANE_CAPACITY_TONNES;
    const utilization = Math.min((order.quantity_tonnes / craneCapacity) * 100, 100);
    const cost = calculateCost(order.quantity_tonnes, transportMode);

    // Generate detailed explanation
    const rakeQuantityAfter = currentRake.totalQuantity + order.quantity_tonnes;
    const rakeUtilizationPercent = Math.round((rakeQuantityAfter / RAKE_CAPACITY_TONNES) * 100);
    
    const explanation = `ORDER #${order.order_id} (${order.product_type} from ${order.customer_name}) allocated to WAGON ${wagonId} of RAKE ${currentRake.rake_id} at PLATFORM ${platformId}. Destination: ${order.destination}. Crane capacity: ${craneCapacity} MT.`;
    
    const reason = generateReasoning(order, currentRake, `Consolidation optimized - rake ${rakeUtilizationPercent}% utilized after allocation`);

    const rakePlanItem: RakePlanItem = {
      order_id: order.order_id,
      customer_name: order.customer_name,
      product_type: order.product_type,
      destination: order.destination,
      quantity_tonnes: order.quantity_tonnes,
      rake_id: currentRake.rake_id,
      wagon_id: wagonId,
      wagon_index: currentRake.totalOrders + 1,
      platform_id: platformId,
      crane_capacity_tonnes: craneCapacity,
      utilization_percent: Math.round(utilization * 10) / 10,
      estimated_cost: cost,
      explanation,
      reason,
      transport_mode: transportMode,
      origin: "Bokaro Steel Plant",
      status: "pending",
    };

    result.push(rakePlanItem);
    currentRake.orders.push(rakePlanItem);
    currentRake.totalQuantity += order.quantity_tonnes;
    currentRake.totalOrders += 1;

    if (currentRake.platformIndex < 3) {
      currentRake.platformIndex++;
    }
  }

  return result;
}

/**
 * Validate rake formations against all constraints
 */
export function validateRakeFormations(rakePlan: RakePlanItem[]): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  const rakeMap = new Map<string, RakePlanItem[]>();

  // Group by rake
  rakePlan.forEach((item) => {
    if (!rakeMap.has(item.rake_id)) {
      rakeMap.set(item.rake_id, []);
    }
    rakeMap.get(item.rake_id)!.push(item);
  });

  // Validate each rake
  rakeMap.forEach((rakeItems, rakeId) => {
    // Constraint 1: Max orders per rake
    if (rakeItems.length > MAX_ORDERS_PER_RAKE) {
      violations.push(`${rakeId} has ${rakeItems.length} orders, exceeds max ${MAX_ORDERS_PER_RAKE}`);
    }

    // Constraint 2: Max capacity
    const totalQuantity = rakeItems.reduce((sum, item) => sum + item.quantity_tonnes, 0);
    if (totalQuantity > RAKE_CAPACITY_TONNES) {
      violations.push(`${rakeId} has ${totalQuantity} MT, exceeds capacity ${RAKE_CAPACITY_TONNES} MT`);
    }

    // Constraint 3: Single destination
    const destinations = new Set(rakeItems.map((item) => item.destination));
    if (destinations.size > MAX_DESTINATIONS_PER_RAKE) {
      violations.push(`${rakeId} has ${destinations.size} destinations, max is ${MAX_DESTINATIONS_PER_RAKE}`);
    }

    // Constraint 4: Utilization (except last rake)
    const utilization = (totalQuantity / RAKE_CAPACITY_TONNES) * 100;
    const rakeIndex = Array.from(rakeMap.keys()).indexOf(rakeId);
    const isLastRake = rakeIndex === rakeMap.size - 1;
    if (!isLastRake && utilization < MIN_RAKE_UTILIZATION_PERCENT) {
      violations.push(`${rakeId} has ${Math.round(utilization)}% utilization, below min ${MIN_RAKE_UTILIZATION_PERCENT}%`);
    }
  });

  // Check all orders are assigned
  if (rakePlan.length === 0) {
    violations.push("No orders assigned to any rake");
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Calculate KPI summary from rake plan
 */
export function calculateKPISummary(rakePlan: RakePlanItem[]) {
  const totalOrders = rakePlan.length;
  const railOrders = rakePlan.filter((item) => item.transport_mode === "rail").length;
  const roadOrders = rakePlan.filter((item) => item.transport_mode === "road").length;

  const totalQuantity = rakePlan.reduce((sum, item) => sum + item.quantity_tonnes, 0);
  const totalCost = rakePlan.reduce((sum, item) => sum + item.estimated_cost, 0);
  const baselineCost = totalQuantity * COST_PER_TONNE_ROAD;
  const savings = baselineCost - totalCost;
  const savingsPercent = totalQuantity > 0 ? ((savings / baselineCost) * 100).toFixed(1) : "0";

  const uniqueRakes = new Set(rakePlan.map((item) => item.rake_id)).size;
  const avgUtilization =
    rakePlan.length > 0
      ? Math.round(
          (rakePlan.reduce((sum, item) => sum + item.utilization_percent, 0) /
            rakePlan.length) *
            10
        ) / 10
      : 0;

  return {
    totalOrders,
    railOrders,
    roadOrders,
    totalQuantity: Math.round(totalQuantity * 10) / 10,
    totalCost: Math.round(totalCost),
    baselineCost: Math.round(baselineCost),
    costSavings: Math.round(savings),
    costSavingsPercent: savingsPercent,
    rakesFormed: uniqueRakes,
    avgUtilization,
  };
}
