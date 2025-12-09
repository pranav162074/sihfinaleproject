# OptiRake DSS — Quick Start & Optimization Guide

## 🎯 What This System Does

OptiRake DSS solves the **Rake Formation Problem** for SAIL steel plants:

**Input:** 100+ customer orders with destinations, materials, quantities, deadlines  
**Output:** Optimized rake assignments that:
- Group orders efficiently to maximize wagon utilization
- Meet customer SLA deadlines
- Minimize transport and idle costs
- Provide plain-English reasoning for every decision

---

## ⚡ 5-Minute Quick Start

### Step 1: Open OptiRake DSS
Go to the **Data Input** tab in the app.

### Step 2: Load Data
Choose one of two options:

**Option A: Use Sample Data (Fastest)**
- Click **"Use Sample Data"** button
- System loads 10 example orders, 3 rakes, 3 stockyards
- Click through to see how optimization works

**Option B: Upload Your Own CSVs (Real Data)**
- Click upload button for each of 6 files
- Prepare your SAIL data in the format defined in `DATA_SCHEMA.md`
- System validates and optimizes

### Step 3: Review Results
After optimization completes, you'll see:

1. **AI Reasoning Steps** — What the system did (5 numbered steps)
2. **4 Summary Cards:**
   - Rakes Formed
   - Total Quantity (MT)
   - Average Utilization %
   - Total Cost (₹)
3. **Action Buttons** → Go to Rake Planner or Order Allocations

### Step 4: Dive Into Details
- **Rake Planner Tab** → Click any rake card for why it was formed
- **Orders Tab** → Click "Best Fit" on any order for its explanation

---

## 📊 Understanding the Output

### The 4 Summary KPIs

**1. Rakes Formed**
```
Example: "8 rakes planned today"
What it means: System divided all orders into 8 optimized trains
Why it matters: Fewer rakes = lower idle costs
```

**2. Total Quantity Processed**
```
Example: "1,095 MT"
What it means: Sum of all order tonnes assigned to rakes
Why it matters: Confirms all/most orders are included
```

**3. Average Rake Utilization**
```
Example: "82%"
What it means: Average % fill rate across all rakes
Why it matters: >80% is excellent (less wasted space)
```

**4. Total Estimated Cost**
```
Example: "₹2,45,600"
What it means: Transport + loading + demurrage costs for all rakes
Why it matters: Lower is better (but verify against actual rates)
```

---

## 🚂 Rake-Level Explanations

### What You'll See
Each rake card shows:
```
┌─────────────────────────────────────┐
│ Rake #001 (RAKE_001)               │
│ Destination: DELHI                  │
│ 34 wagons (type BOXN)              │
│ 850 MT assigned                     │
│ 89% utilization                     │
│ Status: On-time                     │
│ Cost: ₹1,85,000                    │
└─────────────────────────────────────┘
```

### Click the Rake → See 4 Bullet Explanation

**Example Rake Explanation:**
```
Why This Rake:

• Consolidation: Combines 5 orders for DELHI, avoiding 
  2 extra rakes

• Utilization: 89% full — efficient wagon packing with 
  no wasted space

• Delivery: Arrives 1 day before all customer SLA deadlines

• Cost: ₹1,85,000 for 850 MT (₹217/tonne transport)
```

**What each bullet tells you:**
- **Consolidation** → Why orders were grouped together
- **Utilization** → How full the rake is (higher = better)
- **Delivery** → Will SLA be met? How much buffer time?
- **Cost** → Total expense vs. per-tonne breakdown

---

## 📋 Order-Level Explanations

### What You'll See in Orders Table

| Order ID | Material | Qty | Rake | Status | Action |
|----------|----------|-----|------|--------|--------|
| ORD001 | COILS | 28.5 | RAKE_001 | On-time | Best Fit |
| ORD002 | PLATES | 35.0 | RAKE_001 | On-time | Best Fit |

### Click "Best Fit" → See Single-Sentence Explanation

**Example Order Explanation:**

> ORDER #ORD001 (28.5t COILS from CUST_A) → RAKE_001 at LP1 (DELHI)
> 
> **Because:**
> - Destination matches Delhi-bound high-priority orders
> - Material (COILS) is compatible with BOXN wagons  
> - Rake reaches 89% utilization (near full)
> - Arrival is on-time (2 days before SLA)

---

## 🔍 Interpreting Results

### Good Signs ✅

| Indicator | What It Means | Action |
|-----------|---------------|--------|
| **Utilization > 80%** | Wagons are well-packed | Approve rake for dispatch |
| **All Orders "On-time"** | No SLA risks | Ready to go |
| **Cost matches estimates** | Pricing is accurate | Proceed |
| **Few rakes formed** | Consolidation worked | Efficient plan |

### Warning Signs ⚠️

| Indicator | What It Means | Action |
|-----------|---------------|--------|
| **Utilization < 50%** | Half-empty wagons | Review if orders can wait |
| **Orders marked "At-Risk"** | Tight delivery windows | Expedite loading |
| **Cost is very high** | Possible inefficiency | Check for road vs. rail |
| **Many rakes formed** | Orders scattered | Investigate delays |

---

## 🎓 Examples: Before & After

### Example 1: Consolidation Benefit

**Before (Manual Planning):**
```
Rake A: ORD001 (28.5t) DELHI          → 30% utilization
Rake B: ORD002 (35.0t) DELHI          → 37% utilization
Rake C: ORD003 (42.0t) MUMBAI         → 44% utilization
Total: 3 rakes, 105.5 MT, 37% avg utilization, ₹3,50,000
```

**After (OptiRake DSS):**
```
Rake 001: ORD001, ORD002, ORD005 (106.5t) DELHI   → 89% utilization
Rake 002: ORD003, ORD007 (90.0t) MUMBAI          → 82% utilization
Total: 2 rakes, 196.5 MT, 85.5% avg utilization, ₹4,10,000
```

**Benefit:**
- 33% fewer rakes (2 vs. 3)
- 130% more orders processed with same rake count
- 40% better utilization

---

### Example 2: SLA Meeting

**Scenario:** Customer ordered 40 MT of COILS to reach Delhi by 2024-01-17 10:00

**OptiRake Decision:**
```
Assign to RAKE_001 (departs 2024-01-14 16:00)
Transit time: 72 hours
Expected arrival: 2024-01-17 16:00
SLA deadline: 2024-01-17 10:00
Buffer: -6 hours (AT RISK)

→ System flags as "At-Risk" and suggests earlier rake or expedited loading
```

---

## 🔧 Troubleshooting

### Problem: "No rakes formed"
**Possible Cause:** Material type doesn't match any wagon type  
**Solution:** Check `product_wagon_matrix.csv` has your materials

### Problem: "Very few orders assigned"
**Possible Cause:** Orders are very large or have conflicting requirements  
**Solution:** Check quantity_tonnes and priority values; consider splitting large orders

### Problem: "High costs"
**Possible Cause:** Orders going to different destinations (can't consolidate)  
**Solution:** Review your order destinations; long-distance routes cost more

### Problem: "SLA at-risk"
**Possible Cause:** Due dates are too tight + loading constraints  
**Solution:** Increase due_date buffer or allocate rakes earlier

---

## 📈 Optimization Algorithm (What Happens Behind the Scenes)

**Step 1: Parse & Validate**
- Read all 6 CSV files
- Check all required columns present
- Validate data types (numbers are numbers, dates are dates)

**Step 2: Sort & Prioritize**
- Sort orders by priority (1=highest)
- High-priority orders get assigned first

**Step 3: Group by Destination**
- Organize orders by their delivery destination
- DELHI orders together, MUMBAI orders together, etc.

**Step 4: Assign to Rakes**
- For each destination, find available rakes
- Check material-wagon compatibility
- Fill rakes up to ~90% capacity
- Stop and assign to next rake when full

**Step 5: Calculate Costs & Times**
- Look up distance and cost from `routes_costs.csv`
- Calculate transit time based on distance
- Check if arrival meets SLA deadline
- Compute loading time and total cost

**Step 6: Generate Explanations**
- For each rake: why it was formed (consolidation, utilization, SLA, cost)
- For each order: why it was assigned there (destination match, compatibility, utilization, cost)

**Output:** Optimized plan with KPIs and natural-language reasoning

---

## 💡 Tips for Best Results

1. **Make sure all destinations have routes** → Check `routes_costs.csv`
2. **Set realistic due dates** → Too tight = more rakes needed
3. **Use consistent material names** → "COILS" not "COIL" or "COIL"
4. **Don't over-split orders** → One order per rake is wasteful
5. **Keep stockyard inventory updated** → No good optimizing if materials aren't available
6. **Review cost estimates** → Compare system estimates with actual SAIL rates

---

## 🚀 Next Steps

1. **Prepare your first dataset** → Use the template in `DATA_SCHEMA.md`
2. **Test with sample data** → See how it works with 10 example orders
3. **Upload your real SAIL data** → One file at a time
4. **Review results** → Understand the 4 KPI cards and explanations
5. **Approve & dispatch** → When confident, execute the plan
6. **Gather feedback** → Report issues or improvements to SAIL team

---

**Questions?** Check `DATA_SCHEMA.md` for detailed column definitions.  
**Ready to try?** Go to Data Input tab and click "Use Sample Data"!

---

**Version:** 1.0  
**Format:** Markdown  
**Last Updated:** December 2024
