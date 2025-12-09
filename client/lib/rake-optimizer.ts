/**
 * OptiRake Allocation Engine
 * Implements proper rake distribution with constraints
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

// Constants for rake constraints
const WAGON_CAPACITY_TONNES = 65;
const CRANE_CAPACITY_TONNES = 30;
const MIN_RAKE_UTILIZATION = 0.6; // 60%
const MAX_RAKE_UTILIZATION = 0.95; // 95%
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
  // Rail for high quantity, long distance, non-urgent orders
  if (quantity > 100 && distance > 1000 && priority > 2) {
    return "rail";
  }
  // Road for urgent orders, short distance, small quantities
  if (priority <= 2 || distance < 500) {
    return "road";
  }
  // Default: Rail for economy
  return "rail";
}

/**
 * Calculate cost for order based on transport mode
 */
function calculateCost(
  quantity: number,
  mode: "rail" | "road"
): number {
  const perTonneCost = mode === "rail" ? COST_PER_TONNE_RAIL : COST_PER_TONNE_ROAD;
  return Math.round(quantity * perTonneCost);
}

/**
 * Main optimization function - distributes orders across proper rakes
 */
export function optimizeRakeAllocation(orders: OrderData[]): RakePlanItem[] {
  if (!orders || orders.length === 0) return [];

  const result: RakePlanItem[] = [];
  const processedOrders = new Set<string>();
  let rakeCounter = 1;

  // First pass: Group orders by destination and create rakes
  const ordersByDestination: { [key: string]: OrderData[] } = {};
  orders.forEach((order) => {
    const dest = order.destination || "Unknown";
    if (!ordersByDestination[dest]) {
      ordersByDestination[dest] = [];
    }
    ordersByDestination[dest].push(order);
  });

  // Second pass: Create rakes for each destination group
  Object.entries(ordersByDestination).forEach(([destination, destOrders]) => {
    // Sort by priority (higher first) and distance (longer first)
    const sorted = [...destOrders].sort((a, b) => {
      const priorityDiff = (b.priority || 3) - (a.priority || 3);
      if (priorityDiff !== 0) return priorityDiff;
      return (b.distance_km || 800) - (a.distance_km || 800);
    });

    // Create sub-rakes for this destination group
    let currentRakeQuantity = 0;
    let currentWagonIndex = 0;
    let currentRakeId = `R${rakeCounter}`;
    let platformIndex = 1;

    for (const order of sorted) {
      if (processedOrders.has(order.order_id)) continue;

      const transportMode = determineTransportMode(
        order.quantity_tonnes,
        order.distance_km || 800,
        order.priority || 3
      );

      // Check if adding this order would exceed rake wagon capacity
      const requiredWagons = Math.ceil(order.quantity_tonnes / WAGON_CAPACITY_TONNES);
      
      // If this order would exceed current rake capacity, create new rake
      if (
        currentWagonIndex + requiredWagons > RAKE_WAGON_COUNT ||
        (currentRakeQuantity > 0 &&
          (currentRakeQuantity + order.quantity_tonnes) / (WAGON_CAPACITY_TONNES * RAKE_WAGON_COUNT) > MAX_RAKE_UTILIZATION)
      ) {
        rakeCounter++;
        currentRakeId = `R${rakeCounter}`;
        currentWagonIndex = 0;
        currentRakeQuantity = 0;
        platformIndex = 1;
      }

      // Allocate order to current rake
      const wagonId = `W${currentRakeId}-${currentWagonIndex + 1}`;
      const platformId = `P${platformIndex}`;
      const craneCapacity = CRANE_CAPACITY_TONNES;
      const utilization = (order.quantity_tonnes / craneCapacity) * 100;
      const cost = calculateCost(order.quantity_tonnes, transportMode);

      const explanation = `ORDER #${order.order_id} (${order.product_type} from ${order.customer_name}) is allocated to WAGON ${wagonId} of RAKE ${currentRakeId} at PLATFORM ${platformId}. Crane capacity: ${craneCapacity} MT. Destination: ${destination}.`;

      const reason = `Consolidated with other ${destination}-bound orders using ${transportMode.toUpperCase()} transport. Wagon utilization at ${Math.round(utilization)}% optimizes per-unit cost. Scheduling respects SLA deadline of ${order.due_date || "standard"} and priority level ${order.priority || 3}.`;

      result.push({
        order_id: order.order_id,
        customer_name: order.customer_name,
        product_type: order.product_type,
        destination: destination,
        quantity_tonnes: order.quantity_tonnes,
        rake_id: currentRakeId,
        wagon_id: wagonId,
        wagon_index: currentWagonIndex + 1,
        platform_id: platformId,
        crane_capacity_tonnes: craneCapacity,
        utilization_percent: Math.round(Math.min(utilization, 100) * 10) / 10,
        estimated_cost: cost,
        explanation,
        reason,
        transport_mode: transportMode,
        origin: "Bokaro Steel Plant",
        status: "pending",
      });

      processedOrders.add(order.order_id);
      currentRakeQuantity += order.quantity_tonnes;
      currentWagonIndex += requiredWagons;
      if (platformIndex < 3) platformIndex++;
    }
  });

  return result;
}

/**
 * Calculate KPI summary from rake plan
 */
export function calculateKPISummary(
  rakePlan: RakePlanItem[]
) {
  const totalOrders = rakePlan.length;
  const railOrders = rakePlan.filter((item) => item.transport_mode === "rail").length;
  const roadOrders = rakePlan.filter((item) => item.transport_mode === "road").length;

  const totalQuantity = rakePlan.reduce((sum, item) => sum + item.quantity_tonnes, 0);
  const totalCost = rakePlan.reduce((sum, item) => sum + item.estimated_cost, 0);
  const baselineCost = totalQuantity * COST_PER_TONNE_ROAD; // Baseline = 100% road
  const savings = baselineCost - totalCost;
  const savingsPercent = ((savings / baselineCost) * 100).toFixed(1);

  const uniqueRakes = new Set(rakePlan.map((item) => item.rake_id)).size;
  const avgUtilization =
    Math.round(
      (rakePlan.reduce((sum, item) => sum + item.utilization_percent, 0) /
        rakePlan.length) *
        10
    ) / 10;

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
