# SAIL Rake Formation DSS - System Architecture & Design

## 1. System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │  Data Upload     │  │  Dashboard       │              │
│  │  & Schema Page   │  │  Control Tower   │              │
│  └────────┬─────────┘  └────────┬─────────┘              │
│           │                     │                         │
│  ┌────────┴──────────┬──────────┴─────┐                  │
│  │                   │                 │                  │
│  │  Rake Planner   │ Orders View   │ Chat Assistant   │
│  │  (Result Viz)   │ (Allocation)  │ (LLM Explain)    │
│  │                   │                 │                  │
│  └───────────────────┴─────────────────┴──────────────────┘
│                                                             │
└────────────┬──────────────────────────────────────────────┘
             │
             │ HTTP/JSON (React Query)
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API LAYER (Express)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /api/upload-data         → Validates & stores CSV  │
│  POST /api/optimize-rakes      → Runs MILP + ML          │
│  GET /api/explain-plan/{id}    → Returns natural-lang    │
│  GET /api/sample-dataset       → Returns test data       │
│                                                             │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                 OPTIMIZATION & ML LAYER                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  MILP Optimization Engine (OR-Tools via PuLP)     │ │
│  │  - Variables: x(order,rake), y(order)             │ │
│  │  - Objective: minimize cost                        │ │
│  │  - Constraints: capacity, inventory, time, SLA    │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ML Risk Prediction Model (Synthetic Training)    │ │
│  │  - Model: Logistic Regression + XGBoost          │ │
│  │  - Input: route, distance, mode, priority        │ │
│  │  - Output: LOW/MEDIUM/HIGH risk flags            │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  LLM Explanation Engine (Claude API via prompt)   │ │
│  │  - Context: rake plan, orders, costs             │ │
│  │  - Output: natural-language justifications       │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  In-Memory Data Store (for prototype phase)               │
│  - Stockyards.csv                                          │
│  - Orders.csv                                              │
│  - Rakes.csv                                               │
│  - Product Wagon Matrix.csv                                │
│  - Loading Points.csv                                      │
│  - Routes & Costs.csv                                      │
│  - Optimization Results Cache                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend:**
- User data import & schema validation
- Visualization of optimization results (rake plans, order allocation)
- Configuration UI for optimization parameters
- Chat interface for asking questions about decisions
- Responsive design for desktop/tablet/mobile

**Backend:**
- Receive structured CSV/JSON data
- Validate against expected schemas
- Orchestrate MILP optimization
- Apply ML risk predictions
- Cache results
- Generate natural-language explanations

**Optimization Engine:**
- Formulate MILP problem from input data
- Solve using OR-Tools (via Python or integrated solver)
- Return rake assignments and cost breakdown

**ML Layer:**
- Train risk prediction model on synthetic data
- Predict delay/cost risk for each assignment
- Influence optimization to avoid high-risk paths

**LLM Assistant:**
- Consume optimization results & ML predictions
- Generate human-readable explanations
- Answer follow-up questions via chat interface

---

## 2. Data Schemas

### Input Data Files

#### 2.1 stockyards.csv
Represents warehouse/stockyard locations with material inventory.

| Column | Type | Example | Required | Description |
|--------|------|---------|----------|-------------|
| stockyard_id | string | BOKARO_SY_1 | Yes | Unique identifier for stockyard |
| location | string | Bokaro, Jharkhand | Yes | Geographic location |
| material_id | string | HRC (Hot Rolled Coils) | Yes | Material type stored |
| available_tonnage | float | 450.5 | Yes | Tonnes of material in stock |
| safety_stock | float | 50.0 | No | Minimum stock level to maintain |
| loading_point_id | string | BOKARO_LP_1 | Yes | Associated loading point |

**Sample Row:**
```json
{
  "stockyard_id": "BOKARO_SY_1",
  "location": "Bokaro, Jharkhand",
  "material_id": "HRC",
  "available_tonnage": 450.5,
  "safety_stock": 50.0,
  "loading_point_id": "BOKARO_LP_1"
}
```

#### 2.2 orders.csv
Represents pending customer orders.

| Column | Type | Example | Required | Description |
|--------|------|---------|----------|-------------|
| order_id | string | ORD_2024_001 | Yes | Unique order identifier |
| customer_id | string | ABC_PIPES | Yes | Customer identifier |
| destination | string | Delhi | Yes | Delivery location |
| material_id | string | HRC | Yes | Material type requested |
| quantity_tonnes | float | 28.5 | Yes | Order quantity in tonnes |
| priority | int | 1 | Yes | 1=highest, 5=lowest |
| due_date | datetime | 2024-01-15 10:00 | Yes | Delivery deadline |
| penalty_rate_per_day | float | 500.0 | No | Cost per day late (INR) |
| preferred_mode | string | rail | No | Preference: rail/road/either |
| partial_allowed | bool | false | No | Allow split across rakes |

**Sample Row:**
```json
{
  "order_id": "ORD_2024_001",
  "customer_id": "ABC_PIPES",
  "destination": "Delhi",
  "material_id": "HRC",
  "quantity_tonnes": 28.5,
  "priority": 1,
  "due_date": "2024-01-15T10:00:00Z",
  "penalty_rate_per_day": 500.0,
  "preferred_mode": "rail",
  "partial_allowed": false
}
```

#### 2.3 rakes.csv
Represents available rakes/trains for transport.

| Column | Type | Example | Required | Description |
|--------|------|---------|----------|-------------|
| rake_id | string | RAKE_001 | Yes | Unique rake identifier |
| wagon_type | string | BOXN (Box/Covered) | Yes | Type of wagons |
| num_wagons | int | 34 | Yes | Number of wagons in rake |
| per_wagon_capacity_tonnes | float | 28.0 | Yes | Capacity per wagon |
| total_capacity_tonnes | float | 952.0 | Yes | Total rake capacity |
| available_from_time | datetime | 2024-01-14 08:00 | Yes | When rake becomes available |
| current_location | string | BOKARO | Yes | Current location |

**Sample Row:**
```json
{
  "rake_id": "RAKE_001",
  "wagon_type": "BOXN",
  "num_wagons": 34,
  "per_wagon_capacity_tonnes": 28.0,
  "total_capacity_tonnes": 952.0,
  "available_from_time": "2024-01-14T08:00:00Z",
  "current_location": "BOKARO"
}
```

#### 2.4 product_wagon_matrix.csv
Compatibility matrix between materials and wagon types.

| Column | Type | Example | Required | Description |
|--------|------|---------|----------|-------------|
| material_id | string | HRC | Yes | Material type |
| wagon_type | string | BOXN | Yes | Compatible wagon type |
| max_load_per_wagon_tonnes | float | 26.0 | Yes | Safe loading limit |
| allowed | bool | true | Yes | Is combination allowed |

**Sample Row:**
```json
{
  "material_id": "HRC",
  "wagon_type": "BOXN",
  "max_load_per_wagon_tonnes": 26.0,
  "allowed": true
}
```

#### 2.5 loading_points.csv
Represents sidings/loading facilities.

| Column | Type | Example | Required | Description |
|--------|------|---------|----------|-------------|
| loading_point_id | string | BOKARO_LP_1 | Yes | Unique loading point ID |
| stockyard_id | string | BOKARO_SY_1 | Yes | Associated stockyard |
| max_rakes_per_day | int | 3 | Yes | Max rakes can load per day |
| loading_rate_tonnes_per_hour | float | 120.0 | Yes | Tonnage loading speed |
| operating_hours_start | int | 6 | Yes | Start hour (24h format) |
| operating_hours_end | int | 22 | Yes | End hour (24h format) |
| siding_capacity_rakes | int | 5 | Yes | Physical siding capacity |

**Sample Row:**
```json
{
  "loading_point_id": "BOKARO_LP_1",
  "stockyard_id": "BOKARO_SY_1",
  "max_rakes_per_day": 3,
  "loading_rate_tonnes_per_hour": 120.0,
  "operating_hours_start": 6,
  "operating_hours_end": 22,
  "siding_capacity_rakes": 5
}
```

#### 2.6 routes_costs.csv
Transport routes with cost parameters.

| Column | Type | Example | Required | Description |
|--------|------|---------|----------|-------------|
| origin | string | BOKARO | Yes | Origin location code |
| destination | string | DELHI | Yes | Destination location code |
| mode | string | rail | Yes | Transport mode: rail/road |
| distance_km | float | 1400.0 | Yes | Distance in km |
| transit_time_hours | float | 72.0 | Yes | Expected travel time |
| cost_per_tonne | float | 350.0 | Yes | Transport cost per tonne |
| idle_freight_cost_per_hour | float | 25.0 | No | Demurrage/idle cost per hour |

**Sample Row:**
```json
{
  "origin": "BOKARO",
  "destination": "DELHI",
  "mode": "rail",
  "distance_km": 1400.0,
  "transit_time_hours": 72.0,
  "cost_per_tonne": 350.0,
  "idle_freight_cost_per_hour": 25.0
}
```

---

## 3. MILP Optimization Formulation

### Decision Variables

- **x(o, r)**: tonnes of order `o` assigned to rake `r` (continuous, ≥ 0)
- **y(o)**: binary variable, 1 if order `o` is shipped by rail, 0 if road
- **r_active(r)**: binary, 1 if rake `r` is used in the plan
- **t_depart(r)**: departure time of rake `r` (continuous)

### Objective Function

```
Minimize:
  Σ_r [ loading_cost(r) + transport_cost(r) + penalty_late(r) + idle_freight_cost(r) ]
  - 0.5 * Σ_r [ utilization_bonus(r) ]  # Encourage high utilization
```

Where:
- **loading_cost(r)** = Σ_o x(o, r) / loading_rate × crane_cost_per_hour
- **transport_cost(r)** = Σ_o x(o, r) × cost_per_tonne(route)
- **penalty_late(r)** = Σ_o [max(0, t_depart(r) + transit_time - due_date(o)) × penalty_rate(o)]
- **idle_freight_cost(r)** = (max_rakes_per_day - num_rakes_used) × daily_idle_cost
- **utilization_bonus(r)** = utilization_percent(r) × rake_efficiency_factor

### Constraints

1. **Order Fulfillment** (every order assigned fully or flagged late):
   - Σ_r x(o, r) ≥ quantity(o) ∀ o
   - OR allocate_status(o) ∈ {on_time, at_risk, late}

2. **Rake Capacity**:
   - Σ_o x(o, r) ≤ total_capacity(r) ∀ r

3. **Stockyard Inventory**:
   - Σ_r,o x(o, r) where material_id(o) = m ≤ available_tonnage(m) + production ∀ m

4. **Product-Wagon Compatibility**:
   - x(o, r) > 0 ⟹ allowed(material_id(o), wagon_type(r)) = true

5. **Loading Point Capacity**:
   - Σ_r r_active(r) where lp(r) = lp_i ≤ max_rakes_per_day(lp_i)

6. **Loading Time Windows**:
   - t_depart(r) ≥ (Σ_o x(o, r)) / loading_rate(lp) + operating_start ∀ r

7. **Minimum Rake Utilization** (optional threshold):
   - Σ_o x(o, r) / total_capacity(r) ≥ 0.75 ∨ r_active(r) = 0

8. **Multi-Destination Rakes** (optional):
   - If multi_destination_allowed = true, allow rakes to serve 2-3 destinations
   - Otherwise: constrain destinations per rake

9. **Rail vs Road Balance**:
   - Σ_o y(o) ≥ min_rail_percent × total_orders
   - Ensures minimum rail utilization per business rules

### Solution Output

The solver returns:
- **Planned Rakes**: list of rakes with assigned orders
- **Cost Breakdown**: loading, transport, penalties, idle costs
- **Utilization Metrics**: per-rake, average, by material
- **SLA Status**: on-time, at-risk, late for each order
- **Explanation Tags**: why each order was assigned to its rake

---

## 4. Machine Learning Model Specification

### Model Purpose
Predict delay risk and additional cost for each rake/order combination to influence optimizer.

### Input Features (per rake + order pair)

| Feature | Type | Source | Example |
|---------|------|--------|---------|
| distance_km | float | routes_costs | 1400.0 |
| transit_time_hours | float | routes_costs | 72.0 |
| priority | int | orders | 1 (high) |
| material_weight | float | orders | 28.5 |
| loading_point_congestion | float | derived | 0.75 |
| route_historical_delays_pct | float | synthetic | 0.12 |
| time_until_due_date_hours | float | derived | 48.0 |
| mode (rail=1, road=0) | int | routes | 1 |
| season_factor | float | synthetic | 1.05 (monsoon) |

### Model Architecture

**Primary Model: Logistic Regression**
- **Target**: binary delay_risk (0=low, 1=high/medium)
- **Training Data**: Synthetic dataset of 5,000 scenarios
  - 80% historical simulations
  - 20% edge cases (monsoon, high congestion)
- **Threshold**: Probability > 0.6 → flagged as "at-risk"

**Secondary Model: XGBoost (for cost prediction)**
- **Target**: additional_cost_multiplier (1.0 to 1.5)
- **Features**: same as above
- **Output**: cost adjustment factor applied by optimizer

### Training Approach (Synthetic)

```python
# Generate synthetic training data
np.random.seed(42)
n_samples = 5000

data = {
    'distance_km': np.random.uniform(500, 2000, n_samples),
    'priority': np.random.choice([1,2,3,4,5], n_samples),
    'transit_time': np.random.uniform(24, 120, n_samples),
    # ... other features
}

# Labels: delay if 
# (priority == 5) & (transit_time > 72) → high delay risk
# OR (route_historical_delays > 15%) & (time_until_due < 24h)
labels = (
    ((data['priority'] == 5) & (data['transit_time'] > 72)) |
    ((data['route_historical_delays'] > 0.15) & (data['time_until_due'] < 24))
).astype(int)

# Train & validate
model = LogisticRegression()
model.fit(X_train, y_train)
accuracy = model.score(X_test, y_test)  # Expected ~85%
```

### Integration with Optimizer

```python
# After optimization solve:
for each rake in solution:
    risk_score = ml_model.predict_proba([rake_features])[0][1]
    rake.risk_flag = 'HIGH' if risk_score > 0.6 else 'MEDIUM' if risk_score > 0.3 else 'LOW'
    rake.cost_multiplier = cost_model.predict([rake_features])[0]
    rake.adjusted_cost = rake.total_cost * rake.cost_multiplier
```

---

## 5. API Design

### Endpoint 1: POST /api/optimize-rakes

**Request:**
```json
{
  "stockyards": [...],
  "orders": [...],
  "rakes": [...],
  "product_wagon_matrix": [...],
  "loading_points": [...],
  "routes_costs": [...],
  "config": {
    "cost_vs_sla_weight": 0.6,
    "allow_multi_destination_rakes": true,
    "min_utilization_percent": 75,
    "rail_bias_factor": 1.1,
    "optimize_timeout_seconds": 60
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "optimization_id": "OPT_20240115_001",
  "timestamp": "2024-01-15T10:00:00Z",
  "solver_status": "OPTIMAL",
  "execution_time_seconds": 12.5,
  "kpi_summary": {
    "total_cost_optimized": 125000.0,
    "cost_savings_vs_baseline": 18500.0,
    "average_rake_utilization_percent": 82.3,
    "number_of_rakes_planned": 5,
    "demurrage_savings": 3200.0,
    "on_time_delivery_percent": 94.5
  },
  "planned_rakes": [
    {
      "planned_rake_id": "PLANNED_RAKE_1",
      "rake_id": "RAKE_001",
      "wagon_type": "BOXN",
      "num_wagons": 34,
      "loading_point_id": "BOKARO_LP_1",
      "departure_time": "2024-01-14T12:30:00Z",
      "primary_destination": "Delhi",
      "secondary_destinations": ["Ghaziabad"],
      "total_tonnage_assigned": 780.5,
      "utilization_percent": 82.0,
      "orders_allocated": [
        {
          "order_id": "ORD_2024_001",
          "customer_id": "ABC_PIPES",
          "quantity_allocated_tonnes": 28.5,
          "assigned_wagons": [3],
          "estimated_arrival": "2024-01-17T10:30:00Z"
        }
      ],
      "cost_breakdown": {
        "loading_cost": 15600.0,
        "transport_cost": 273000.0,
        "penalty_cost": 0.0,
        "idle_freight_cost": 0.0,
        "total_cost": 288600.0
      },
      "sla_status": "On-time",
      "risk_flag": "LOW",
      "cost_multiplier": 0.95,
      "explanation_tags": [
        "high_utilization",
        "low_delay_risk",
        "cost_optimized"
      ]
    }
  ],
  "rail_vs_road_assignment": [
    {
      "order_id": "ORD_2024_001",
      "assigned_mode": "rail",
      "assigned_rake_id": "PLANNED_RAKE_1",
      "expected_ship_date": "2024-01-14T12:30:00Z",
      "expected_arrival_date": "2024-01-17T10:30:00Z",
      "confidence_percent": 95
    }
  ],
  "production_suggestions": [
    {
      "material_id": "HRC",
      "current_inventory_tonnes": 450.5,
      "recommended_production_tonnage": 200.0,
      "reasoning": "High rail capacity + 3 pending high-priority HRC orders"
    }
  ],
  "late_or_at_risk_orders": []
}
```

### Endpoint 2: GET /api/explain-plan/{order_id}

**Request:**
```
GET /api/explain-plan/ORD_2024_001
Headers: {"Optimization-ID": "OPT_20240115_001"}
```

**Response (200 OK):**
```json
{
  "order_id": "ORD_2024_001",
  "explanation": "ORDER #1234 with cargo Hot Rolled Coils from customer ABC Pipes Ltd is allocated to WAGON 3 of RAKE 7 at PLATFORM 9, loaded via Crane C-2 (30-ton capacity) at Bokaro Siding A, headed to Delhi. This plan was chosen because: (a) Rake 7 already serves Delhi-bound high-priority orders, (b) Wagon 3's remaining capacity closely matches this order's 28 tonnes, giving 96% utilization, and (c) this allocation avoids an additional rake and reduces expected demurrage by 12%.",
  "quantitative_breakdown": {
    "allocated_quantity": 28.5,
    "utilization_achieved": 96.0,
    "cost_per_tonne": 350.0,
    "demurrage_saved_inr": 1200.0,
    "arrival_prediction": "2024-01-17T10:30:00Z",
    "delay_probability": 0.05,
    "risk_tag": "LOW"
  },
  "alternatives_considered": [
    {
      "alternative_rake_id": "RAKE_002",
      "utilization_if_used": 15.0,
      "additional_cost": 45000.0,
      "reason_not_chosen": "Low utilization would trigger additional rake; this increases cost"
    }
  ]
}
```

### Endpoint 3: GET /api/sample-dataset

Returns pre-loaded SAIL Bokara sample data for quick prototyping.

**Response (200 OK):**
```json
{
  "stockyards": [...],
  "orders": [...],
  "rakes": [...],
  "product_wagon_matrix": [...],
  "loading_points": [...],
  "routes_costs": [...]
}
```

### Endpoint 4: POST /api/upload-data

**Request:**
```
POST /api/upload-data
Content-Type: multipart/form-data

Files:
  - stockyards.csv
  - orders.csv
  - rakes.csv
  - product_wagon_matrix.csv
  - loading_points.csv
  - routes_costs.csv
```

**Response (200 OK):**
```json
{
  "success": true,
  "uploaded_at": "2024-01-15T10:00:00Z",
  "files_processed": 6,
  "validation_results": {
    "stockyards": { "rows": 2, "errors": [] },
    "orders": { "rows": 4, "errors": [] },
    "rakes": { "rows": 2, "errors": [] },
    "product_wagon_matrix": { "rows": 8, "errors": [] },
    "loading_points": { "rows": 1, "errors": [] },
    "routes_costs": { "rows": 4, "errors": [] }
  },
  "ready_to_optimize": true
}
```

---

## 6. UI Component Description

### 6.1 Data Upload Page
- **Left Panel**: Drag-and-drop zone for CSV files, "Use Sample SAIL Dataset" button
- **Right Panel**: Expected Schema table (columns, types, examples, required flag)
- **Bottom**: File validation results with error highlighting

### 6.2 Optimization Run Screen
- **Config Panel**: sliders for cost/SLA weight, toggle multi-destination, set min utilization
- **Status Display**: current data summary, solver progress log
- **Run Button** with auto-disable during optimization

### 6.3 Rake Plan Visualization
- **Rake Cards**: one card per planned rake with orders, cost breakdown, utilization gauge
- **Filters**: by destination, loading point, SLA risk, mode
- **Drill-Down**: click rake → see detailed order list with individual explanations
- **Export**: CSV/PDF download button

### 6.4 Orders View
- **Table**: order_id, customer, destination, quantity, assigned_rake, sla_status, risk_flag
- **Inline**: explain button → opens explanation modal
- **Bulk Actions**: re-run with different config, mark ready for dispatch

### 6.5 Chat Assistant Panel
- **Right sidebar** across all screens
- **Input**: text questions like "Why is ORDER #1234 in RAKE 7?"
- **Output**: contextual explanation from optimization results + LLM
- **History**: conversation history with previous Q&A

---

## 7. Sample End-to-End Scenario

### Input Data (Synthetic SAIL Bokaro Scenario)

**Stockyards:**
| stockyard_id | location | material_id | available_tonnage | safety_stock | loading_point_id |
|---|---|---|---|---|---|
| BOKARO_SY_1 | Bokaro, Jharkhand | HRC | 450.5 | 50.0 | BOKARO_LP_1 |
| DURGAPUR_SY_1 | Durgapur, WB | CRC | 320.0 | 40.0 | DURGAPUR_LP_1 |

**Orders:**
| order_id | customer_id | destination | material_id | quantity_tonnes | priority | due_date | penalty_rate_per_day | preferred_mode |
|---|---|---|---|---|---|---|---|---|
| ORD_001 | ABC_PIPES | Delhi | HRC | 28.5 | 1 | 2024-01-17 10:00 | 500 | rail |
| ORD_002 | XYZ_AUTO | Ghaziabad | HRC | 45.0 | 1 | 2024-01-17 14:00 | 600 | rail |
| ORD_003 | MNO_MILLS | Kanpur | CRC | 35.0 | 3 | 2024-01-18 08:00 | 300 | either |
| ORD_004 | PQR_TRADE | Pune | HRC | 15.5 | 2 | 2024-01-19 12:00 | 400 | road |

**Rakes:**
| rake_id | wagon_type | num_wagons | per_wagon_capacity_tonnes | total_capacity_tonnes | available_from_time | current_location |
|---|---|---|---|---|---|---|
| RAKE_001 | BOXN | 34 | 28.0 | 952.0 | 2024-01-14 08:00 | BOKARO |
| RAKE_002 | BOXN | 34 | 28.0 | 952.0 | 2024-01-14 16:00 | DURGAPUR |

**Routes & Costs:**
| origin | destination | mode | distance_km | transit_time_hours | cost_per_tonne | idle_freight_cost_per_hour |
|---|---|---|---|---|---|---|
| BOKARO | DELHI | rail | 1400 | 72 | 350 | 25 |
| BOKARO | GHAZIABAD | rail | 1350 | 68 | 345 | 25 |
| BOKARO | KANPUR | road | 750 | 24 | 280 | 20 |
| DURGAPUR | KANPUR | rail | 400 | 12 | 180 | 15 |
| BOKARO | PUNE | road | 1200 | 36 | 400 | 25 |

### Optimization Run

**Configuration:**
```json
{
  "cost_vs_sla_weight": 0.6,
  "allow_multi_destination_rakes": true,
  "min_utilization_percent": 75,
  "rail_bias_factor": 1.1
}
```

### Solution

**Planned Rakes:**

1. **PLANNED_RAKE_1** (RAKE_001, BOKARO_LP_1)
   - Primary Destination: Delhi & Ghaziabad (multi-destination)
   - Orders: ORD_001 (28.5t) + ORD_002 (45.0t) = 73.5t
   - Utilization: 73.5 / 952 = 7.7% (sub-threshold, but high-priority)
   - Departure: 2024-01-14 12:30
   - Cost: Loading 9400 + Transport 25,725 + Penalty 0 = **35,125 INR**
   - Risk: LOW (both orders high priority, early due dates)

2. **ORD_003** → **Road to Kanpur** (Not by rake)
   - 35t CRC to Kanpur (Durgapur origin too short for rail)
   - Via road + 2 truck batches
   - Cost: 35 × 280 = **9,800 INR**
   - Risk: MEDIUM (3rd priority order, longer transit)

3. **ORD_004** → **Road to Pune** (Not by rake)
   - 15.5t HRC to Pune
   - Via road + 1 truck batch
   - Cost: 15.5 × 400 = **6,200 INR**
   - Risk: HIGH (2nd priority but very long road distance; alternative would use RAKE_002 if extended)

### Detailed Explanation for ORD_001

> ORDER #1001 with cargo Hot Rolled Coils (28.5 tonnes) from customer ABC Pipes Ltd is allocated to WAGONS 2-3 of RAKE 7 (PLANNED_RAKE_1) at PLATFORM 9, loaded via Crane C-2 (30-ton capacity) at Bokaro Siding A, headed to Delhi.
> 
> This plan was chosen because:
> (a) **Consolidation with High-Priority Partner**: Rake 7 already carries ORD_002 (45.0t) bound for Delhi/Ghaziabad with equal priority (priority=1), allowing 73.5t consolidated load.
> 
> (b) **Wagon Capacity Alignment**: Wagons 2-3 (2 × 28t = 56t capacity) accommodate this order with 96.4% utilization (28.5/29.6 after accounting for safety margin), minimizing waste.
> 
> (c) **Cost & SLA Optimization**: Rail transit (72 hours) guarantees on-time arrival by 2024-01-17 10:30, 16 hours before due date, avoiding ₹8,000 penalty. Total cost per tonne = ₹351 (vs. ₹400 for road alternative), saving ₹1,239 on this order alone.
> 
> (d) **System Efficiency**: Allocating both orders to one rake avoids spinning up a second rake that would sit at 7% utilization, incurring ₹12,000+ in additional idle costs.

---

## 8. Integration Summary

The complete system creates a seamless flow:
1. User uploads CSV files or clicks "Use Sample Dataset"
2. Backend validates against schemas
3. User configures optimization parameters
4. MILP solver runs, ML models predict risk, results cached
5. Frontend visualizes planned rakes with KPIs
6. User can click on any order/rake to see LLM-generated explanation
7. Chat assistant answers follow-up questions
8. Export functionality provides CSV/PDF for dispatch teams

This prototype demonstrates all core DSS capabilities while remaining implementable in the allocated timeframe.
