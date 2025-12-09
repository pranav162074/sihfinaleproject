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
  destination: string;
  orders: RakePlanItem[];
  totalQuantity: number;
  totalOrders: number;
  totalCost: number;
  utilization: number;
}

// ========== HARD CONSTRAINTS ==========
const RAKE_CAPACITY_TONNES = 1170;
const MAX_ORDERS_PER_RAKE = 18;
const MAX_DESTINATIONS_PER_RAKE = 1;
const MIN_RAKE_UTILIZATION_PERCENT = 85;
const CRANE_CAPACITY_TONNES = 30;

// ========== COST MODEL ==========
const COST_PER_TONNE_RAIL = 350;
const COST_PER_TONNE_ROAD = 765;
const FIXED_RAKE_COST = 2500;

/**
 * Determine transport mode
 */
function determineTransportMode(
  quantity: number,
  distance: number,
  priority: number
): "rail" | "road" {
  if (quantity >= 80 && distance > 1000 && priority >= 2) {
    return "rail";
  }
  if (priority <= 2 || distance < 500) {
    return "road";
  }
  return "rail";
}

/**
 * Calculate cost for an order
 */
function calculateOrderCost(quantity: number, mode: "rail" | "road"): number {
  const perTonneCost = mode === "rail" ? COST_PER_TONNE_RAIL : COST_PER_TONNE_ROAD;
  return Math.round(quantity * perTonneCost);
}

/**
 * Map destinations to geographic regions for intelligent consolidation
 */
function getRegionForDestination(destination: string): string {
  const dest = destination.toUpperCase().trim();

  // Northern Region
  if (
    ["DELHI", "NOIDA", "FARIDABAD", "GURGAON", "GURUGRAM", "AGRA", "KANPUR", "BAREILLY", "HARIDWAR", "MEERUT"].includes(
      dest
    )
  ) {
    return "NORTH";
  }

  // Western Region
  if (["MUMBAI", "PUNE", "NASHIK", "SURAT", "AHMEDABAD", "JAIPUR", "AJMER", "INDORE", "RATLAM", "BIKANER"].includes(dest)) {
    return "WEST";
  }

  // Southern Region
  if (
    ["BANGALORE", "HYDERABAD", "CHENNAI", "MADURAI", "TRICHY", "MANGALORE", "COCHIN", "TIRUPATI", "VELLORE", "KURNOOL"].includes(
      dest
    )
  ) {
    return "SOUTH";
  }

  // Eastern Region
  if (
    ["KOLKATA", "VARANASI", "PATNA", "JAMSHEDPUR", "RANCHI", "LUCKNOW", "GORAKHPUR", "REWA", "SILCHAR", "GUWAHATI"].includes(
      dest
    )
  ) {
    return "EAST";
  }

  // Central Region
  if (["RAIPUR", "BHILAI", "BHUBANESWAR", "GWALIOR", "UDAIPUR", "JALGAON", "AURANGABAD", "DHARMAPURI", "HISAR"].includes(dest)) {
    return "CENTRAL";
  }

  // Default
  return "OTHER";
}

/**
 * Intelligent packing: Group by region first, then pack greedily
 * This allows multiple destinations to be in same rake if they're in same region
 */
export function optimizeRakeAllocation(orders: OrderData[]): RakePlanItem[] {
  if (!orders || orders.length === 0) return [];

  // Group orders by geographic region first
  const groupsByRegion: { [region: string]: OrderData[] } = {};
  orders.forEach((order) => {
    const region = getRegionForDestination(order.destination);
    if (!groupsByRegion[region]) {
      groupsByRegion[region] = [];
    }
    groupsByRegion[region].push(order);
  });

  const result: RakePlanItem[] = [];
  let globalRakeCounter = 1;
  const allRakes: RakeInfo[] = [];

  // For each region, pack orders greedily
  Object.entries(groupsByRegion).forEach(([region, regionOrders]) => {
    // Sort by quantity descending (largest first = better packing)
    const sorted = [...regionOrders].sort((a, b) => b.quantity_tonnes - a.quantity_tonnes);

    // Pack orders into rakes
    sorted.forEach((order) => {
      let placed = false;

      // Try to fit into existing rake (any rake, not just same destination)
      for (const rake of allRakes) {
        // Check hard constraints
        const newQuantity = rake.totalQuantity + order.quantity_tonnes;
        const newOrders = rake.totalOrders + 1;

        // Constraint checks: capacity and order count
        if (newQuantity <= RAKE_CAPACITY_TONNES && newOrders <= MAX_ORDERS_PER_RAKE) {
          // This order fits in this rake!
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
            platform_id: `P${Math.min(rake.orders.length % 3 + 1, 3)}`,
            crane_capacity_tonnes: CRANE_CAPACITY_TONNES,
            utilization_percent: Math.min((order.quantity_tonnes / CRANE_CAPACITY_TONNES) * 100, 100),
            estimated_cost: cost,
            explanation: `Order #${order.order_id} (${order.quantity_tonnes} MT from ${order.customer_name}) → ${rake.rake_id}`,
            reason: `Regional consolidation: ${region} region. Rake now ${Math.round((newQuantity / RAKE_CAPACITY_TONNES) * 100)}% utilized.`,
            transport_mode: transportMode,
            origin: "Bokaro Steel Plant",
            status: "pending",
          };

          result.push(item);
          rake.orders.push(item);
          rake.totalQuantity = newQuantity;
          rake.totalOrders = newOrders;
          rake.totalCost += cost;
          rake.utilization = (newQuantity / RAKE_CAPACITY_TONNES) * 100;
          rake.destination = `${rake.destination}, ${order.destination}`; // Add destination

          placed = true;
          break;
        }
      }

      // If not placed, create new rake
      if (!placed) {
        const transportMode = determineTransportMode(
          order.quantity_tonnes,
          order.distance_km || 800,
          order.priority || 3
        );

        const cost = calculateOrderCost(order.quantity_tonnes, transportMode);

        const newRake: RakeInfo = {
          rake_id: `R${globalRakeCounter}`,
          destination: order.destination,
          orders: [],
          totalQuantity: order.quantity_tonnes,
          totalOrders: 1,
          totalCost: cost,
          utilization: (order.quantity_tonnes / RAKE_CAPACITY_TONNES) * 100,
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
          explanation: `Order #${order.order_id} (${order.quantity_tonnes} MT from ${order.customer_name}) → ${newRake.rake_id}`,
          reason: `New rake for ${region} region: ${order.destination}-bound freight.`,
          transport_mode: transportMode,
          origin: "Bokaro Steel Plant",
          status: "pending",
        };

        result.push(item);
        newRake.orders.push(item);
        allRakes.push(newRake);
        globalRakeCounter++;
      }
    });
  });

  return result;
}

/**
 * Validate rake formations
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
    if (rakeItems.length > MAX_ORDERS_PER_RAKE) {
      violations.push(`${rakeId}: ${rakeItems.length} orders exceeds max ${MAX_ORDERS_PER_RAKE}`);
    }

    const totalQty = rakeItems.reduce((sum, item) => sum + item.quantity_tonnes, 0);
    if (totalQty > RAKE_CAPACITY_TONNES) {
      violations.push(`${rakeId}: ${Math.round(totalQty)} MT exceeds capacity ${RAKE_CAPACITY_TONNES} MT`);
    }

    const dests = new Set(rakeItems.map((item) => item.destination));
    if (dests.size > MAX_DESTINATIONS_PER_RAKE) {
      violations.push(`${rakeId}: ${dests.size} destinations exceed max ${MAX_DESTINATIONS_PER_RAKE}`);
    }
  });

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Calculate KPI summary
 */
export function calculateKPISummary(rakePlan: RakePlanItem[]) {
  const totalOrders = rakePlan.length;
  const railOrders = rakePlan.filter((item) => item.transport_mode === "rail").length;
  const roadOrders = rakePlan.filter((item) => item.transport_mode === "road").length;

  const totalQuantity = rakePlan.reduce((sum, item) => sum + item.quantity_tonnes, 0);
  const totalDirectCost = rakePlan.reduce((sum, item) => sum + item.estimated_cost, 0);

  const rakeMap = new Map<string, RakePlanItem[]>();
  rakePlan.forEach((item) => {
    if (!rakeMap.has(item.rake_id)) {
      rakeMap.set(item.rake_id, []);
    }
    rakeMap.get(item.rake_id)!.push(item);
  });

  const rakesFormed = rakeMap.size;
  const totalFixedCost = rakesFormed * FIXED_RAKE_COST;
  const totalCost = totalDirectCost + totalFixedCost;

  const rakeUtilizations = Array.from(rakeMap.values()).map((items) => {
    const qty = items.reduce((sum, item) => sum + item.quantity_tonnes, 0);
    return (qty / RAKE_CAPACITY_TONNES) * 100;
  });

  const avgUtilization =
    rakeUtilizations.length > 0
      ? Math.round((rakeUtilizations.reduce((a, b) => a + b, 0) / rakeUtilizations.length) * 10) / 10
      : 0;

  const baselineCost = totalQuantity * COST_PER_TONNE_ROAD;
  const savings = baselineCost - totalCost;
  const savingsPercent = totalQuantity > 0 ? ((savings / baselineCost) * 100).toFixed(1) : "0";

  return {
    totalOrders,
    railOrders,
    roadOrders,
    totalQuantity: Math.round(totalQuantity * 10) / 10,
    totalCost: Math.round(totalCost),
    baselineCost: Math.round(baselineCost),
    costSavings: Math.round(savings),
    costSavingsPercent: savingsPercent,
    rakesFormed,
    avgUtilization,
    costBreakdown: `Direct: ₹${Math.round(totalDirectCost / 1000)}k | Fixed: ₹${Math.round(totalFixedCost / 1000)}k`,
  };
}
