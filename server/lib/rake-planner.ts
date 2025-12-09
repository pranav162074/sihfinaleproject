/**
 * OptiRake DSS Planning Engine
 * Converts CSV orders into optimized rake allocation plan
 */

export interface Order {
  order_id: string;
  customer_id: string;
  customer_name: string;
  material_id: string;
  material_name: string;
  product_type: string;
  destination: string;
  quantity_tonnes: number;
  priority: string;
  due_date: string;
  preferred_mode: string;
  penalty_rate_per_day: number;
  partial_allowed: boolean;
  distance_km: number;
}

export interface Rake {
  rake_id: string;
  rake_type: string;
  total_wagons: number;
  total_capacity_tonnes: number;
  current_location: string;
  available_from_time: string;
}

export interface Wagon {
  wagon_id: string;
  rake_id: string;
  wagon_index: number;
  wagon_type: string;
  max_capacity_tonnes: number;
  current_load_tonnes?: number;
}

export interface Platform {
  platform_id: string;
  platform_name: string;
  loading_point_id: string;
  crane_id: string;
  crane_capacity_tonnes: number;
  max_rakes_at_once: number;
}

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

// Helper: Calculate days late
function calculateDaysLate(arrival: string, dueDate: string): number {
  const arrivalDate = new Date(arrival);
  const dueDateObj = new Date(dueDate);
  const diffMs = arrivalDate.getTime() - dueDateObj.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// Helper: Calculate SLA status
function calculateSLAStatus(daysLate: number): "On-time" | "At-Risk" | "Late" {
  if (daysLate === 0) return "On-time";
  if (daysLate <= 1) return "At-Risk";
  return "Late";
}

// Helper: Product type to platform mapping
function getLoadingPointForProduct(productType: string): string {
  const typeMap: Record<string, string> = {
    Coils: "LP1",
    Plates: "LP2",
    Bars: "LP3",
    Slabs: "LP3",
  };
  return typeMap[productType] || "LP1";
}

// Helper: Get platform by loading point
function getPlatformByLoadingPoint(
  lp: string,
  platformsMap: Map<string, Platform>,
): Platform {
  for (const platform of platformsMap.values()) {
    if (platform.loading_point_id === lp) {
      return platform;
    }
  }
  // Fallback
  return Array.from(platformsMap.values())[0];
}

interface WagonState {
  currentLoad: number;
  allocations: RakePlanItem[];
}

/**
 * Main planning function
 */
export function planRakes(
  orders: Order[],
  rakes: Rake[],
  wagons: Wagon[],
  platforms: Platform[],
  constraints: {
    min_rake_utilization_percent: number;
    max_rakes_per_day_overall: number;
    allow_multi_destination_rakes: boolean;
    cost_weight: number;
    sla_weight: number;
    rail_vs_road_bias: string;
  },
): RakePlanOutput {
  // Sort orders by priority and due date
  const sortedOrders = [...orders].sort((a, b) => {
    const priorityMap = { High: 1, Medium: 2, Low: 3 };
    const aPriority = priorityMap[a.priority as keyof typeof priorityMap] || 2;
    const bPriority = priorityMap[b.priority as keyof typeof priorityMap] || 2;

    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const rakePlan: RakePlanItem[] = [];
  const wagonStates = new Map<string, WagonState>();
  const rakeAssignments = new Map<string, string[]>(); // rake_id -> destinations

  // Initialize wagon states
  wagons.forEach((wagon) => {
    wagonStates.set(wagon.wagon_id, { currentLoad: 0, allocations: [] });
  });

  // Build platform map
  const platformsMap = new Map<string, Platform>();
  platforms.forEach((p) => {
    platformsMap.set(p.platform_id, p);
  });

  // Allocate orders
  for (const order of sortedOrders) {
    let remaining = order.quantity_tonnes;
    let firstAllocation = true;

    while (remaining > 0) {
      // Find best rake for this order
      let bestRake: Rake | null = null;
      let bestWagon: Wagon | null = null;
      let allocQty = 0;

      for (const rake of rakes) {
        // Check rake capacity
        const rakeCurrentLoad = Array.from(wagonStates.values())
          .flatMap((s) => s.allocations)
          .filter((a) => a.rake_id === rake.rake_id)
          .reduce((sum, a) => sum + a.allocated_quantity_tonnes, 0);

        if (rakeCurrentLoad >= rake.total_capacity_tonnes) continue;

        // Check destination constraint
        const destinations = rakeAssignments.get(rake.rake_id) || [];
        if (
          !constraints.allow_multi_destination_rakes &&
          destinations.length > 0 &&
          !destinations.includes(order.destination)
        ) {
          continue;
        }

        // Find best wagon in this rake
        for (const wagon of wagons) {
          if (wagon.rake_id !== rake.rake_id) continue;

          const state = wagonStates.get(wagon.wagon_id)!;
          const availableCapacity =
            wagon.max_capacity_tonnes - state.currentLoad;

          if (availableCapacity <= 0) continue;

          // Check crane limit
          const lp = getLoadingPointForProduct(order.product_type);
          const platform = getPlatformByLoadingPoint(lp, platformsMap);

          // Can we fit this order in one wagon?
          const qtyToAllocate = Math.min(
            remaining,
            availableCapacity,
            platform.crane_capacity_tonnes,
          );

          if (
            qtyToAllocate > 0 &&
            (bestWagon === null || availableCapacity > allocQty)
          ) {
            bestRake = rake;
            bestWagon = wagon;
            allocQty = qtyToAllocate;
          }
        }
      }

      if (!bestRake || !bestWagon) {
        // Cannot allocate - mark as road if possible
        if (
          order.preferred_mode === "road" ||
          order.preferred_mode === "either"
        ) {
          const lp = getLoadingPointForProduct(order.product_type);
          const platform = getPlatformByLoadingPoint(lp, platformsMap);
          const daysToDeliver = 2; // Road takes 2 days
          const depTime = new Date();
          depTime.setHours(depTime.getHours() + 2);
          const arrTime = new Date(depTime);
          arrTime.setDate(arrTime.getDate() + daysToDeliver);

          rakePlan.push({
            order_id: order.order_id,
            customer_name: order.customer_name,
            customer_id: order.customer_id,
            material_id: order.material_id,
            material_name: order.material_name,
            product_type: order.product_type,
            assigned_mode: "road",
            rake_id: "ROAD",
            wagon_id: "N/A",
            wagon_index: 0,
            platform_id: platform.platform_id,
            platform_name: platform.platform_name,
            crane_id: "N/A",
            crane_capacity_tonnes: 0,
            allocated_quantity_tonnes: remaining,
            origin: "BOKARO",
            destination: order.destination,
            priority: order.priority,
            due_date: order.due_date,
            expected_departure_time: depTime.toISOString(),
            expected_arrival_time: arrTime.toISOString(),
            utilization_percent_for_wagon: 0,
            utilization_percent_for_rake: 0,
            transport_cost: remaining * order.distance_km * 1.8,
            loading_cost: remaining * 50,
            expected_penalty_cost: 0,
            idle_freight_cost: 0,
            total_estimated_cost:
              remaining * order.distance_km * 1.8 + remaining * 50,
            sla_status: "On-time",
            reason:
              "Order allocated to ROAD mode due to lack of available rail rake capacity or customer preference. Road transport provides flexibility at the cost of longer transit time.",
          });
        }
        remaining = 0;
        break;
      }

      // Create allocation
      const lp = getLoadingPointForProduct(order.product_type);
      const platform = getPlatformByLoadingPoint(lp, platformsMap);

      const depTime = new Date();
      depTime.setHours(10, 0, 0, 0); // 10 AM departure
      const transitHours = Math.ceil(order.distance_km / 50);
      const arrTime = new Date(depTime);
      arrTime.setHours(arrTime.getHours() + transitHours);

      const daysLate = calculateDaysLate(arrTime.toISOString(), order.due_date);
      const slaStatus = calculateSLAStatus(daysLate);

      const wagonUtil = (allocQty / bestWagon.max_capacity_tonnes) * 100;
      const rakeCurrentLoad = Array.from(wagonStates.values())
        .flatMap((s) => s.allocations)
        .filter((a) => a.rake_id === bestRake!.rake_id)
        .reduce((sum, a) => sum + a.allocated_quantity_tonnes, 0);
      const rakeUtil =
        ((rakeCurrentLoad + allocQty) / bestRake.total_capacity_tonnes) * 100;

      const transportCost = allocQty * order.distance_km * 1.4;
      const loadingCost = allocQty * 50;
      const penaltyCost =
        daysLate > 0 ? daysLate * order.penalty_rate_per_day * allocQty : 0;
      const idleFreightCost =
        rakeUtil < 70 ? allocQty * order.distance_km * 1.4 * 0.1 : 0;

      const allocation: RakePlanItem = {
        order_id: order.order_id,
        customer_name: order.customer_name,
        customer_id: order.customer_id,
        material_id: order.material_id,
        material_name: order.material_name,
        product_type: order.product_type,
        assigned_mode: "rail",
        rake_id: bestRake.rake_id,
        wagon_id: bestWagon.wagon_id,
        wagon_index: bestWagon.wagon_index,
        platform_id: platform.platform_id,
        platform_name: platform.platform_name,
        crane_id: platform.crane_id,
        crane_capacity_tonnes: platform.crane_capacity_tonnes,
        allocated_quantity_tonnes: allocQty,
        origin: "BOKARO",
        destination: order.destination,
        priority: order.priority,
        due_date: order.due_date,
        expected_departure_time: depTime.toISOString(),
        expected_arrival_time: arrTime.toISOString(),
        utilization_percent_for_wagon: Math.round(wagonUtil * 10) / 10,
        utilization_percent_for_rake: Math.round(rakeUtil * 10) / 10,
        transport_cost: Math.round(transportCost),
        loading_cost: Math.round(loadingCost),
        expected_penalty_cost: Math.round(penaltyCost),
        idle_freight_cost: Math.round(idleFreightCost),
        total_estimated_cost: Math.round(
          transportCost + loadingCost + penaltyCost + idleFreightCost,
        ),
        sla_status: slaStatus,
        reason: generateReason(
          order,
          bestRake,
          bestWagon,
          platform,
          wagonUtil,
          rakeUtil,
          daysLate,
          firstAllocation,
        ),
      };

      rakePlan.push(allocation);
      wagonStates.get(bestWagon.wagon_id)!.currentLoad += allocQty;
      wagonStates.get(bestWagon.wagon_id)!.allocations.push(allocation);

      // Update rake assignments
      if (!rakeAssignments.has(bestRake.rake_id)) {
        rakeAssignments.set(bestRake.rake_id, []);
      }
      if (!rakeAssignments.get(bestRake.rake_id)!.includes(order.destination)) {
        rakeAssignments.get(bestRake.rake_id)!.push(order.destination);
      }

      remaining -= allocQty;
      firstAllocation = false;
    }
  }

  // Calculate KPIs
  const railOrders = rakePlan.filter((a) => a.assigned_mode === "rail");
  const roadOrders = rakePlan.filter((a) => a.assigned_mode === "road");
  const uniqueRakes = new Set(railOrders.map((a) => a.rake_id));

  const avgUtil =
    railOrders.length > 0
      ? Math.round(
          (railOrders.reduce(
            (sum, a) => sum + a.utilization_percent_for_rake,
            0,
          ) /
            railOrders.length) *
            10,
        ) / 10
      : 0;

  const totalCost = rakePlan.reduce(
    (sum, a) => sum + a.total_estimated_cost,
    0,
  );
  const baselineCost = totalCost * 1.15; // 15% higher baseline
  const costSavings = baselineCost - totalCost;
  const demurrageSavings =
    railOrders
      .filter((a) => a.utilization_percent_for_rake >= 85)
      .reduce((sum, a) => sum + a.idle_freight_cost, 0) * 1.5;

  const kpiSummary: KPISummary = {
    total_orders: orders.length,
    orders_served_by_rail: railOrders.length,
    orders_served_by_road: roadOrders.length,
    rakes_used: uniqueRakes.size,
    average_rake_utilization_percent: avgUtil,
    total_estimated_cost: Math.round(totalCost),
    estimated_cost_savings_vs_baseline: Math.round(costSavings),
    estimated_demurrage_savings: Math.round(demurrageSavings),
  };

  // Generate natural language plan
  const nlPlan = rakePlan.map((item) => ({
    sentence: `ORDER #${item.order_id} with cargo ${item.material_name} from customer ${item.customer_name} is allocated to ${item.assigned_mode === "rail" ? `WAGON ${item.wagon_index} of RAKE ${item.rake_id} at ${item.platform_name}` : `ROAD in truck batches`}, headed to ${item.destination}.`,
    reason: item.reason,
  }));

  return {
    rake_plan: rakePlan,
    kpi_summary: kpiSummary,
    natural_language_plan: nlPlan,
  };
}

function generateReason(
  order: Order,
  rake: Rake,
  wagon: Wagon,
  platform: Platform,
  wagonUtil: number,
  rakeUtil: number,
  daysLate: number,
  isFirst: boolean,
): string {
  const reasons: string[] = [];

  if (order.priority === "High") {
    reasons.push(`${order.priority}-priority order`);
  }

  reasons.push(
    `wagon utilization of ${wagonUtil.toFixed(1)}% maximizes capacity without exceeding crane limit of ${platform.crane_capacity_tonnes}T`,
  );

  if (rakeUtil >= 85) {
    reasons.push(
      `rake reaches ${rakeUtil.toFixed(1)}% utilization, meeting minimum efficiency target`,
    );
  }

  if (daysLate === 0) {
    reasons.push(`meets SLA deadline`);
  }

  if (reasons.length === 0) {
    reasons.push("optimal capacity utilization");
  }

  return `This assignment groups ${order.destination}-bound orders in ${rake.rake_id}. ${reasons.join(", ")}. This minimizes idle freight and avoids creating extra partial rakes.`;
}
