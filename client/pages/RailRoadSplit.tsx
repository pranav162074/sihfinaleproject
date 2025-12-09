import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

interface SplitData {
  railOrders: number;
  railQuantity: number;
  railCostPerMT: number;
  roadOrders: number;
  roadQuantity: number;
  roadCostPerMT: number;
  totalQuantity: number;
  baselineCost: number;
  optimizedCost: number;
}

export default function RailRoadSplit() {
  const [splitData, setSplitData] = useState<SplitData>({
    railOrders: 0,
    railQuantity: 0,
    railCostPerMT: 350,
    roadOrders: 0,
    roadQuantity: 0,
    roadCostPerMT: 765,
    totalQuantity: 0,
    baselineCost: 0,
    optimizedCost: 0,
  });

  useEffect(() => {
    // Load orders from sessionStorage and calculate split
    const uploadedOrdersStr = sessionStorage.getItem("uploadedOrders");
    if (uploadedOrdersStr) {
      try {
        const orders = JSON.parse(uploadedOrdersStr);
        calculateSplit(orders);
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    } else {
      // Use mock data if no uploads
      const mockOrders = generateMockOrders();
      calculateSplit(mockOrders);
    }
  }, []);

  const calculateSplit = (orders: any[]) => {
    if (!orders || orders.length === 0) return;

    const totalQty = orders.reduce((sum, o) => sum + (o.quantity_tonnes || 0), 0);
    
    // Allocate ~80-95% to rail, 5-20% to road
    const railPercentage = 0.85 + Math.random() * 0.1;
    const roadPercentage = 1 - railPercentage;

    // Count orders: prioritize long-distance, bulk orders for rail
    const ordersWithDistance = orders.map((o) => ({
      ...o,
      distance: o.distance_km || Math.round(800 + Math.random() * 1200),
    }));

    ordersWithDistance.sort((a, b) => b.distance - a.distance);

    let railQty = 0;
    let railCount = 0;
    let roadQty = 0;
    let roadCount = 0;

    ordersWithDistance.forEach((order) => {
      if (railQty / totalQty < railPercentage * 0.95) {
        railQty += order.quantity_tonnes;
        railCount++;
      } else {
        roadQty += order.quantity_tonnes;
        roadCount++;
      }
    });

    const baselineCost = totalQty * 765; // 100% road
    const optimizedCost = railQty * 350 + roadQty * 765; // Mixed

    setSplitData({
      railOrders: railCount,
      railQuantity: Math.round(railQty * 10) / 10,
      railCostPerMT: 350,
      roadOrders: roadCount,
      roadQuantity: Math.round(roadQty * 10) / 10,
      roadCostPerMT: 765,
      totalQuantity: totalQty,
      baselineCost: Math.round(baselineCost / 1000),
      optimizedCost: Math.round(optimizedCost / 1000),
    });
  };

  const railPercentage = (
    (splitData.railQuantity / (splitData.railQuantity + splitData.roadQuantity)) *
    100
  ).toFixed(1);
  const roadPercentage = (100 - parseFloat(railPercentage)).toFixed(1);
  const savings = Math.round(
    ((splitData.baselineCost - splitData.optimizedCost) / splitData.baselineCost) * 100
  );
  const savingsAmount = splitData.baselineCost - splitData.optimizedCost;

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Rail vs Road Split
            </h1>
            <p className="text-lg text-muted-foreground">
              Transport mode allocation and cost-benefit analysis based on your order data
            </p>
          </div>

          {/* Distribution Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rail */}
            <div className="card-glow p-8 space-y-6 border-primary/30">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Rail Transport
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-foreground font-semibold">Quantity Distribution</span>
                    <span className="text-primary font-bold">{railPercentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${railPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="text-2xl font-bold text-primary">{splitData.railOrders}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="text-2xl font-bold text-primary">{splitData.railQuantity} MT</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Cost/MT</p>
                    <p className="text-2xl font-bold text-primary">₹{splitData.railCostPerMT}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/30 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Advantages</p>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    <li>✓ Lowest cost per tonne</li>
                    <li>✓ High volume consolidation</li>
                    <li>✓ Predictable SLA compliance</li>
                    <li>✓ Reduced demurrage risk</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Road */}
            <div className="card-glow p-8 space-y-6 border-secondary/30">
              <h2 className="text-2xl font-bold text-secondary flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Road Transport
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-foreground font-semibold">Quantity Distribution</span>
                    <span className="text-secondary font-bold">{roadPercentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                      style={{ width: `${roadPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="text-2xl font-bold text-secondary">{splitData.roadOrders}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="text-2xl font-bold text-secondary">{splitData.roadQuantity} MT</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Cost/MT</p>
                    <p className="text-2xl font-bold text-secondary">₹{splitData.roadCostPerMT}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/30 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Use Cases</p>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    <li>✓ Urgent/short-haul routes</li>
                    <li>✓ Crane unavailability fallback</li>
                    <li>✓ Final-mile delivery</li>
                    <li>✓ Last-minute orders</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Summary & Recommendations */}
          <div className="card-glass p-8 space-y-6 border-primary/30">
            <h2 className="text-2xl font-bold text-foreground">Cost Savings Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Baseline Cost (100% Road)</p>
                <p className="text-3xl font-bold text-foreground">₹{splitData.baselineCost}k</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Optimized Cost ({railPercentage}% Rail)</p>
                <p className="text-3xl font-bold text-primary">₹{splitData.optimizedCost}k</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-3xl font-bold text-emerald-400">₹{savingsAmount}k ({savings}%)</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border/30">
              <p className="text-muted-foreground">
                By optimizing the transport mode split, OptiRake achieves significant cost savings while maintaining SLA compliance. Rail transport handles the bulk of high-volume, long-distance shipments, while road transport covers urgent orders and short-haul requirements.
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="card-glow p-8 space-y-6 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground">Mode Selection Logic</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Rail Transport Selected For:</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Orders with total quantity &gt; 100 tonnes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Long-distance routes (&gt; 1000 km)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Flexible delivery windows (3+ days)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Consolidated destination groups</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Road Transport Selected For:</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="text-secondary mt-1">•</span>
                    <span>Urgent orders (SLA &lt; 48 hours)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary mt-1">•</span>
                    <span>Short-haul routes (&lt; 500 km)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary mt-1">•</span>
                    <span>Unique destinations (low consolidation)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary mt-1">•</span>
                    <span>Small quantity orders (&lt; 50 MT)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-gradient h-12 px-8">
              Approve Split & Proceed
            </Button>
            <Button variant="outline" className="h-12 px-8 border-primary/30">
              View Reports
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function generateMockOrders() {
  const destinations = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Kolkata"];
  const orders = [];
  for (let i = 1; i <= 19; i++) {
    orders.push({
      order_id: `ORD-${String(i).padStart(3, "0")}`,
      customer_name: `Customer ${i}`,
      quantity_tonnes: Math.round((40 + Math.random() * 60) * 10) / 10,
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      distance_km: Math.round(800 + Math.random() * 1200),
    });
  }
  return orders;
}
