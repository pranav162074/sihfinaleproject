# SAIL Rake Formation DSS - Complete End-to-End Example

## Scenario: Daily Optimization Run - January 14, 2024

This document walks through a complete optimization scenario using the SAIL Bokaro sample dataset, showing inputs, optimization process, outputs, and detailed natural-language explanations.

---

## 1. Input Data Setup

### Current State: January 14, 2024, 6:00 AM

#### Stockyards Inventory
```
BOKARO_SY_1 (Bokaro, Jharkhand) - HRC
  Available: 450.5 tonnes
  Safety Stock: 50.0 tonnes
  Usable: 400.5 tonnes

BOKARO_SY_2 (Bokaro, Jharkhand) - CRC  
  Available: 320.0 tonnes
  Safety Stock: 40.0 tonnes
  Usable: 280.0 tonnes

DURGAPUR_SY_1 (Durgapur, West Bengal) - HRC
  Available: 280.5 tonnes
  Safety Stock: 35.0 tonnes
  Usable: 245.5 tonnes
```

#### Pending Orders
```
ORD_2024_001: ABC Pipes Ltd, Delhi, 28.5 tonnes HRC
  Priority: 1 (HIGHEST)
  Due: 2024-01-17 10:00 (72 hours from now)
  Penalty: ₹500/day late
  Preferred: Rail
  
ORD_2024_002: XYZ Auto, Ghaziabad, 45.0 tonnes HRC
  Priority: 1 (HIGHEST)
  Due: 2024-01-17 14:00 (72 hours from now)
  Penalty: ₹600/day late
  Preferred: Rail
  
ORD_2024_003: MNO Mills, Kanpur, 35.0 tonnes CRC
  Priority: 3 (MEDIUM)
  Due: 2024-01-18 08:00 (98 hours from now)
  Penalty: ₹300/day late
  Preferred: Either (flexible)
  
ORD_2024_004: PQR Trade, Pune, 15.5 tonnes HRC
  Priority: 2 (HIGH)
  Due: 2024-01-19 12:00 (150 hours from now)
  Penalty: ₹400/day late
  Preferred: Road
```

#### Available Rakes
```
RAKE_001: BOXN wagons
  34 wagons × 28.0 tonnes/wagon = 952.0 tonnes total capacity
  Available from: 2024-01-14 08:00 (in 2 hours)
  Location: BOKARO
  
RAKE_002: BOXN wagons
  34 wagons × 28.0 tonnes/wagon = 952.0 tonnes total capacity
  Available from: 2024-01-14 16:00 (in 10 hours)
  Location: DURGAPUR
```

#### Route Options & Costs
```
BOKARO → DELHI (Rail)
  Distance: 1400 km | Transit: 72 hours
  Cost: ₹350/tonne | Idle Cost: ₹25/hour
  
BOKARO → GHAZIABAD (Rail)
  Distance: 1350 km | Transit: 68 hours
  Cost: ₹345/tonne | Idle Cost: ₹25/hour
  
BOKARO → KANPUR (Rail)
  Distance: 900 km | Transit: 45 hours
  Cost: ₹280/tonne | Idle Cost: ₹20/hour
  
BOKARO → KANPUR (Road)
  Distance: 750 km | Transit: 24 hours
  Cost: ₹280/tonne | Idle Cost: ₹20/hour
  
BOKARO → PUNE (Road)
  Distance: 1200 km | Transit: 36 hours
  Cost: ₹400/tonne | Idle Cost: ₹25/hour
```

---

## 2. Optimization Configuration

**User Settings:**
```json
{
  "cost_vs_sla_weight": 0.6,           // Balanced: 60% cost, 40% SLA
  "allow_multi_destination_rakes": true,
  "min_utilization_percent": 75,
  "rail_bias_factor": 1.1,             // Slight preference for rail
  "optimize_timeout_seconds": 60
}
```

**Baseline Cost Calculation** (all orders via road):
- ORD_001: 28.5t × ₹380 = ₹10,830
- ORD_002: 45.0t × ₹380 = ₹17,100
- ORD_003: 35.0t × ₹280 = ₹9,800
- ORD_004: 15.5t × ₹400 = ₹6,200
- **Total Baseline: ₹44,930**

---

## 3. Optimization Run

### Algorithm Execution

**Step 1: Sort orders by priority**
1. ORD_2024_001 (Priority 1, High-value)
2. ORD_2024_002 (Priority 1, High-value)
3. ORD_2024_004 (Priority 2)
4. ORD_2024_003 (Priority 3)

**Step 2: Allocate high-priority orders to rails**

- **RAKE_001** (Bokaro, available 08:00)
  - Order ORD_001: 28.5t HRC → DELHI
  - Order ORD_002: 45.0t HRC → GHAZIABAD
  - Total: 73.5t / 952t = **7.7% utilization**
  - **Decision**: Despite low utilization, allocate both HIGH-PRIORITY orders to same rake for:
    - Quick consolidation (same loading point, same departure window)
    - Shared multi-destination routing (Delhi + Ghaziabad are adjacent)
    - Cost avoidance (avoid spinning up second rake just for 73.5t)
  
  **Rail Consolidation Bonus Applied**: +10% cost reduction for multi-destination efficiency

**Step 3: Allocate remaining orders**

- **ORD_003** (CRC, 35.0t, Kanpur)
  - Remaining RAKE_002 capacity: 952t (available 16:00 from Durgapur)
  - Distance to Kanpur: 400 km rail = only 20 hours
  - Problem: ORD_003 has 98-hour deadline (comfortable), but CRC sourced from Durgapur
  - **Decision**: Allocate to RAKE_002 via DURGAPUR_LP_1 for:
    - Shorter transit (20h vs 45h)
    - Lower cost (₹180/t vs ₹280/t)
    - Ample time buffer before 2024-01-18 08:00 due date
  - **Assigned**: WAGON 1-2 of RAKE_002

- **ORD_004** (HRC, 15.5t, Pune)
  - No more high-capacity rakes available
  - Pune is far for rail (not listed)
  - **Decision**: ROAD TRANSPORT
    - Use 1 truck batch (road limit: 25t/truck)
    - Cost: 15.5t × ₹400 = ₹6,200
    - Transit: 36 hours (comfortable, 150h deadline)

---

## 4. Optimization Output

### Planned Rakes

#### PLANNED_RAKE_1 (RAKE_001)

```json
{
  "planned_rake_id": "PLANNED_RAKE_1",
  "rake_id": "RAKE_001",
  "wagon_type": "BOXN",
  "num_wagons": 34,
  "loading_point_id": "BOKARO_LP_1",
  "departure_time": "2024-01-14T12:30:00Z",
  "primary_destination": "Delhi",
  "secondary_destinations": ["Ghaziabad"],
  "total_tonnage_assigned": 73.5,
  "utilization_percent": 7.7,
  "orders_allocated": [
    {
      "order_id": "ORD_2024_001",
      "customer_id": "ABC_PIPES",
      "quantity_allocated_tonnes": 28.5,
      "assigned_wagons": [2, 3],
      "estimated_arrival": "2024-01-17T12:30:00Z"
    },
    {
      "order_id": "ORD_2024_002",
      "customer_id": "XYZ_AUTO",
      "quantity_allocated_tonnes": 45.0,
      "assigned_wagons": [4, 5, 6],
      "estimated_arrival": "2024-01-17T08:30:00Z"
    }
  ],
  "cost_breakdown": {
    "loading_cost": 9400,
    "transport_cost": 25500,
    "penalty_cost": 0,
    "idle_freight_cost": 0,
    "total_cost": 34900
  },
  "sla_status": "On-time",
  "risk_flag": "LOW",
  "cost_multiplier": 0.95,
  "explanation_tags": [
    "high_priority_consolidation",
    "multi_destination",
    "low_delay_risk",
    "cost_optimized"
  ]
}
```

#### PLANNED_RAKE_2 (RAKE_002)

```json
{
  "planned_rake_id": "PLANNED_RAKE_2",
  "rake_id": "RAKE_002",
  "wagon_type": "BOXN",
  "num_wagons": 34,
  "loading_point_id": "DURGAPUR_LP_1",
  "departure_time": "2024-01-14T18:00:00Z",
  "primary_destination": "Kanpur",
  "secondary_destinations": [],
  "total_tonnage_assigned": 35.0,
  "utilization_percent": 3.7,
  "orders_allocated": [
    {
      "order_id": "ORD_2024_003",
      "customer_id": "MNO_MILLS",
      "quantity_allocated_tonnes": 35.0,
      "assigned_wagons": [1, 2],
      "estimated_arrival": "2024-01-15T14:00:00Z"
    }
  ],
  "cost_breakdown": {
    "loading_cost": 8750,
    "transport_cost": 6300,
    "penalty_cost": 0,
    "idle_freight_cost": 0,
    "total_cost": 15050
  },
  "sla_status": "On-time",
  "risk_flag": "LOW",
  "cost_multiplier": 0.92,
  "explanation_tags": [
    "efficient_sourcing",
    "short_haul_advantage",
    "comfortable_timeline",
    "cost_optimized"
  ]
}
```

### Rail vs Road Assignment

```json
[
  {
    "order_id": "ORD_2024_001",
    "assigned_mode": "rail",
    "assigned_rake_id": "PLANNED_RAKE_1",
    "expected_ship_date": "2024-01-14T12:30:00Z",
    "expected_arrival_date": "2024-01-17T12:30:00Z",
    "confidence_percent": 95
  },
  {
    "order_id": "ORD_2024_002",
    "assigned_mode": "rail",
    "assigned_rake_id": "PLANNED_RAKE_1",
    "expected_ship_date": "2024-01-14T12:30:00Z",
    "expected_arrival_date": "2024-01-17T08:30:00Z",
    "confidence_percent": 95
  },
  {
    "order_id": "ORD_2024_003",
    "assigned_mode": "rail",
    "assigned_rake_id": "PLANNED_RAKE_2",
    "expected_ship_date": "2024-01-14T18:00:00Z",
    "expected_arrival_date": "2024-01-15T14:00:00Z",
    "confidence_percent": 93
  },
  {
    "order_id": "ORD_2024_004",
    "assigned_mode": "road",
    "planned_truck_batches": 1,
    "expected_ship_date": "2024-01-14T08:00:00Z",
    "expected_arrival_date": "2024-01-15T20:00:00Z",
    "confidence_percent": 85
  }
]
```

### KPI Summary

```json
{
  "total_cost_optimized": 49950,
  "cost_savings_vs_baseline": -5020,
  "average_rake_utilization_percent": 5.7,
  "number_of_rakes_planned": 2,
  "demurrage_savings": 4800,
  "on_time_delivery_percent": 100.0
}
```

**Note**: Negative cost savings indicate this scenario prioritizes SLA compliance (100% on-time) over pure cost. If cost weight increased to 0.8, savings would flip positive.

### Production Suggestions

```json
[
  {
    "material_id": "HRC",
    "current_inventory_tonnes": 730.5,
    "recommended_production_tonnage": 250.0,
    "reasoning": "High rail capacity + 3 pending high-priority HRC orders. Current inventory covers only 75% of orders through all modes. Recommend ramping up HRC production to maintain service level."
  },
  {
    "material_id": "CRC",
    "current_inventory_tonnes": 280.0,
    "recommended_production_tonnage": 0.0,
    "reasoning": "CRC inventory sufficient for current orders. Monitor for new demand."
  }
]
```

---

## 5. Detailed Explanations

### ORDER #ORD_2024_001: ABC Pipes Ltd - Complete Explanation

> **ORDER #ORD_2024_001** with cargo **Hot Rolled Coils (HRC), 28.5 tonnes** from customer **ABC Pipes Ltd** is allocated to **WAGONS 2-3** of **RAKE 7 (PLANNED_RAKE_1)** at **PLATFORM 9** (BOKARO_LP_1), loaded via **Crane C-2** (30-ton capacity) at **Bokaro Siding A**, headed to **Delhi** with secondary stop in **Ghaziabad**.
> 
> This plan was chosen because:
> 
> **(a) High-Priority Consolidation with Peer Order:**
> This is your highest-priority order (Priority=1, top 2%). Rake 7 already carries order ORD_2024_002 (45.0t, also Priority=1) from XYZ Auto bound for Ghaziabad, a neighboring destination. By consolidating both orders in one rake, we:
> - Load the rake only once, reducing crane setup time and labor costs
> - Share transit through Delhi-NCR region (Ghaziabad is just 50 km beyond Delhi)
> - Maintain critical-customer service (both are high-value, time-sensitive orders)
> 
> **(b) Wagon Capacity Precision:**
> Your 28.5-tonne order exactly fits **WAGONS 2-3** (each 28-tonne capacity, safe limit 26.0t for HRC). This gives **96.4% wagon utilization** (28.5 / 29.6 accounting for safety margin), leaving minimal wasted capacity while respecting material-wagon compatibility rules. Alternative smaller wagon combinations would provide 70-80% utilization, wasting 4-8 tonnes of headroom.
> 
> **(c) SLA Guarantee with Buffer:**
> Rail transit from Bokaro takes 72 hours. Departure at 12:30 on Jan 14 → Arrival at 12:30 on Jan 17. Your due date: **10:00 on Jan 17**. 
> - **Result: 2-hour early arrival** (flagged as "On-time with margin")
> - Avoids ₹500/day penalty entirely
> - If we routed via road (₹380/tonne vs ₹350/tonne by rail), transit would be 42 hours; still on-time but eliminates the safety buffer and adds ₹2,850 in additional cost
> 
> **(d) System-Wide Efficiency:**
> This allocation avoids spinning up a second rake just for 73.5 tonnes of high-priority cargo. Alternative: Use two half-loaded rakes (each ~35% utilization). This would incur:
> - ₹12,000+ in additional crane time and siding costs
> - Doubled demurrage risk if one rake faces delays
> - Wasted siding capacity at Bokaro Loading Point
> 
> By consolidating, we keep rake utilization lean but cost-conscious.
> 
> **Quantitative Impact:**
> - Direct cost for this order: ₹9,975 (₹350/t × 28.5t)
> - Demurrage savings: ₹1,000 (early arrival buffer)
> - **Net cost per tonne: ₹347.56** (vs ₹380 by road, **8.5% savings**)
> - Risk: **LOW** (historical delays on this route: <5%)
> - Confidence: **95%**

---

### ORDER #ORD_2024_003: MNO Mills - Detailed Explanation

> **ORDER #ORD_2024_003** with cargo **Cold Rolled Coils (CRC), 35.0 tonnes** from customer **MNO Mills** is allocated to **WAGONS 1-2** of **RAKE 2 (PLANNED_RAKE_2)** at **DURGAPUR_LP_1**, headed to **Kanpur**.
> 
> This plan was chosen because:
> 
> **(a) Optimal Source Warehouse:**
> Your CRC inventory is housed at **DURGAPUR_SY_1** (280 tonnes available), not Bokaro. Rather than transporting CRC 400 km to Bokaro and then 900 km to Kanpur (1,300 km total via rail), we source directly from Durgapur:
> - **Rail distance: 400 km (20-hour transit)**
> - **Cost: ₹180/tonne** (vs ₹280/tonne Bokaro→Kanpur)
> - **Savings: ₹3,500** on this order alone
> 
> **(b) Comfortable Timeline with Early Arrival:**
> - Order due: **2024-01-18 08:00** (98 hours from Jan 14, 06:00)
> - Expected arrival: **2024-01-15 14:00** (56 hours from departure)
> - **Buffer: +42 hours** (nearly 2 days)
> - Zero penalty risk; customer receives early (often valued for inventory planning)
> 
> **(c) Wagon Compatibility & Utilization:**
> BOXN wagons support CRC with 24.0-tonne safe load limit. Your 35 tonnes spans 2 wagons (17.5t each = **145.8% safety** with double margin). This is well within limits and offers flexibility for mixed loads if needed.
> 
> **Quantitative Impact:**
> - Direct cost: ₹6,300 (₹180/t × 35t)
> - Early arrival advantage: ₹1,050 (2 days × ₹300/day penalty = avoided)
> - **Risk: LOW** (short-haul Durgapur→Kanpur, historically 3% delays)
> - **Cost per tonne: ₹180** (most efficient allocation in this scenario)

---

### ORDER #ORD_2024_004: PQR Trade - Road Assignment Rationale

> **ORDER #ORD_2024_004** with cargo **Hot Rolled Coils (HRC), 15.5 tonnes** from customer **PQR Trade** is allocated to **ROAD TRANSPORT** (1 truck batch of 25-tonne capacity).
> 
> Road assignment was chosen because:
> 
> **(a) All Rakes Committed to Higher-Priority Orders:**
> - RAKE_001: Fully allocated to Priority-1 orders (ORD_001, ORD_002)
> - RAKE_002: Allocated to Priority-3 order from superior source (Durgapur for CRC)
> - No additional rail capacity available within this dispatch cycle
> 
> **(b) Pune is Not on Current Rail Routes:**
> - No direct rail route from Bokaro/Durgapur to Pune in our cost matrix
> - Bokaro→Pune would require transshipment or extended routing (inefficient)
> - **Road direct: 1,200 km, 36-hour transit (optimal for distance)**
> 
> **(c) Order Flexibility & Timeline:**
> - Priority: 2 (high, but not critical like Priority-1)
> - Due: 2024-01-19 12:00 (150 hours away)
> - Road departure 08:00 Jan 14 + 36 hours transit = arrival 20:00 Jan 15
> - **Arrival buffer: 76 hours before due date**
> - Road feasible with ample time cushion
> 
> **(d) Cost Analysis:**
> - Road cost: ₹400/tonne × 15.5 = **₹6,200**
> - Truck batch efficiency: 15.5t in one 25-tonne truck (62% utilization, acceptable for single customer)
> 
> **Quantitative Impact:**
> - Cost per tonne: ₹400 (vs rail ₹350/t = premium ₹750 for road flexibility)
> - Delay probability: ~8% (longer distance, road congestion history in Pune corridor)
> - Risk: **MEDIUM** (acceptable given priority and timeline)

---

## 6. ML Risk Predictions

### Delay Risk by Allocation

```
PLANNED_RAKE_1 (BOKARO → DELHI/GHAZIABAD):
  Predicted Delay Probability: 5%
  Risk Flag: LOW ✅
  Cost Multiplier: 0.95
  Reasoning: Short priority, high-traffic route, rail advantage
  
PLANNED_RAKE_2 (DURGAPUR → KANPUR):
  Predicted Delay Probability: 3%
  Risk Flag: LOW ✅
  Cost Multiplier: 0.92
  Reasoning: Short distance (400 km), rail efficiency, low congestion
  
ROAD (BOKARO → PUNE):
  Predicted Delay Probability: 8%
  Risk Flag: MEDIUM ⚠️
  Cost Multiplier: 1.08
  Reasoning: Long road distance, Pune corridor congestion (12% historical delays)
```

---

## 7. Summary & Next Steps

### What Was Optimized

✅ **100% on-time delivery** - All orders meet or beat deadlines
✅ **₹4,800 demurrage savings** - Early arrivals avoid penalties
✅ **Efficient rake consolidation** - Two rakes serve four orders
✅ **Warehouse optimization** - CRC sourced from Durgapur (efficient)

### Recommended Actions

1. **Approve Plan 1** (PLANNED_RAKE_1):
   - Load 73.5t HRC at Bokaro LP by 12:00 on Jan 14
   - Depart 12:30, arrive Delhi 12:30 Jan 17 (EARLY)
   
2. **Approve Plan 2** (PLANNED_RAKE_2):
   - Load 35.0t CRC at Durgapur LP by 17:00 on Jan 14
   - Depart 18:00, arrive Kanpur 14:00 Jan 15 (VERY EARLY)
   
3. **Schedule Road Transport** (ORD_004):
   - 15.5t HRC to Pune, depart Jan 14 08:00
   - Arrive Jan 15 20:00 (EARLY)

4. **Monitor** ORD_004 for potential congestion on Pune corridor; offer customer expedited delivery if available at +5% cost.

5. **Production Recommendation**: Increase HRC production by 250 tonnes over next week to meet upcoming high-priority rail orders and maintain service level.

---

## Appendix: API Request/Response Example

### Request to /api/optimize-rakes

```bash
curl -X POST http://localhost:3000/api/optimize-rakes \
  -H "Content-Type: application/json" \
  -d @request.json
```

### Request Body (request.json)

See SYSTEM_ARCHITECTURE.md Section 5 for full JSON schema.

### Response

```json
{
  "success": true,
  "optimization_id": "OPT_20240114_001",
  "timestamp": "2024-01-14T06:15:32Z",
  "solver_status": "OPTIMAL",
  "execution_time_seconds": 2.34,
  "kpi_summary": { /* ... */ },
  "planned_rakes": [ /* PLANNED_RAKE_1, PLANNED_RAKE_2 */ ],
  "rail_vs_road_assignment": [ /* 4 assignments */ ],
  "production_suggestions": [ /* HRC, CRC recommendations */ ],
  "late_or_at_risk_orders": []
}
```

### Request to /api/explain-plan/ORD_2024_001

```bash
curl -X GET "http://localhost:3000/api/explain-plan/ORD_2024_001?optimization_id=OPT_20240114_001"
```

### Response

```json
{
  "order_id": "ORD_2024_001",
  "explanation": "ORDER #ORD_2024_001 with cargo...",
  "quantitative_breakdown": {
    "allocated_quantity": 28.5,
    "utilization_achieved": 96.4,
    "cost_per_tonne": 347.56,
    "demurrage_saved_inr": 1000,
    "arrival_prediction": "2024-01-17T12:30:00Z",
    "delay_probability": 0.05,
    "risk_tag": "LOW"
  },
  "alternatives_considered": [ /* ... */ ]
}
```

---

## Conclusion

This end-to-end example demonstrates the DSS in action:
- **Smart consolidation**: High-priority orders grouped efficiently
- **Source optimization**: Orders sourced from nearest warehouse
- **Mode selection**: Rail preferred, road used strategically
- **Risk prediction**: ML flags delays and suggests alternatives
- **Natural language**: Detailed explanations for each decision

The system balances cost and SLA compliance, adapts to constraints (rake availability, routes, inventory), and provides justifications that logistics planners can trust and act upon.
