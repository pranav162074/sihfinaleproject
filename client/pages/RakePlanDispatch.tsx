import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Share2, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface RakePlanItem {
  order_id: string;
  customer_name: string;
  product_type: string;
  destination: string;
  quantity_tonnes: number;
  rake_id: string;
  wagon_id: string;
  platform_id: string;
  crane_capacity_tonnes: number;
  utilization_percent: number;
  estimated_cost: number;
  explanation: string;
  reason: string;
}

const generateMockPlan = (): RakePlanItem[] => {
  return [
    {
      order_id: "ORD-001",
      customer_name: "ABC Steel Corp",
      product_type: "Hot Rolled Coils",
      destination: "Delhi",
      quantity_tonnes: 45,
      rake_id: "R1",
      wagon_id: "W3",
      platform_id: "P9",
      crane_capacity_tonnes: 30,
      utilization_percent: 94,
      estimated_cost: 15750,
      explanation:
        "ORDER #ORD-001 with cargo Hot Rolled Coils from ABC Steel Corp is allocated to WAGON 3 of RAKE R1 at PLATFORM P9, which has a crane capacity of 30 tons, headed to DELHI.",
      reason:
        "Grouped with other high-priority Delhi orders for optimal consolidation. Wagon utilization at 94% minimizes transport cost per tonne. Avoids creating a partial rake and reduces expected demurrage penalties.",
    },
    {
      order_id: "ORD-002",
      customer_name: "XYZ Materials Ltd",
      product_type: "Galvanized Steel",
      destination: "Mumbai",
      quantity_tonnes: 52,
      rake_id: "R2",
      wagon_id: "W4",
      platform_id: "P10",
      crane_capacity_tonnes: 35,
      utilization_percent: 87,
      estimated_cost: 18200,
      explanation:
        "ORDER #ORD-002 with cargo Galvanized Steel from XYZ Materials Ltd is allocated to WAGON 4 of RAKE R2 at PLATFORM P10 with 35-ton crane capacity, headed to MUMBAI.",
      reason:
        "Paired with Mumbai-bound orders in Rake R2 for destination consolidation. Platform P10 allows loading within SLA window. Utilization at 87% keeps costs reasonable while meeting delivery deadlines.",
    },
    {
      order_id: "ORD-003",
      customer_name: "Steel Solutions India",
      product_type: "Cold Rolled Sheets",
      destination: "Bangalore",
      quantity_tonnes: 38,
      rake_id: "R3",
      wagon_id: "W5",
      platform_id: "P11",
      crane_capacity_tonnes: 40,
      utilization_percent: 77,
      estimated_cost: 13300,
      explanation:
        "ORDER #ORD-003 with cargo Cold Rolled Sheets from Steel Solutions India is allocated to WAGON 5 of RAKE R3 at PLATFORM P11 with 40-ton crane capacity, headed to BANGALORE.",
      reason:
        "Allocated to Rake R3 destined for Bangalore. P11 offers next available loading slot. 77% utilization still meets profitability threshold. Order scheduled within SLA with minimal demurrage risk.",
    },
  ];
};

export default function RakePlanDispatch() {
  const { toast } = useToast();
  const [plan, setPlan] = useState<RakePlanItem[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedRake, setSelectedRake] = useState<string | null>(null);

  useEffect(() => {
    const mockPlan = generateMockPlan();
    setPlan(mockPlan);
    if (mockPlan.length > 0) {
      setSelectedRake(mockPlan[0].rake_id);
    }
  }, []);

  const uniqueRakes = [...new Set(plan.map((item) => item.rake_id))];
  const selectedItems = plan.filter((item) => item.rake_id === selectedRake);

  const handleExportCSV = () => {
    if (plan.length === 0) return;

    const headers = [
      "Order ID",
      "Customer",
      "Product",
      "Destination",
      "Quantity (MT)",
      "Rake",
      "Wagon",
      "Platform",
      "Utilization %",
      "Cost",
    ];
    const rows = plan.map((item) => [
      item.order_id,
      item.customer_name,
      item.product_type,
      item.destination,
      item.quantity_tonnes,
      item.rake_id,
      item.wagon_id,
      item.platform_id,
      item.utilization_percent,
      item.estimated_cost,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rake_plan.csv";
    a.click();

    toast({
      title: "Downloaded",
      description: "Rake plan exported to CSV",
    });
  };

  const kpiStats = {
    rakes: uniqueRakes.length,
    orders: plan.length,
    avgUtil: (plan.reduce((sum, p) => sum + p.utilization_percent, 0) / plan.length).toFixed(1),
    totalCost: (plan.reduce((sum, p) => sum + p.estimated_cost, 0) / 1000).toFixed(1),
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Rake Plan & Dispatch
            </h1>
            <p className="text-lg text-muted-foreground">
              AI-optimized rake formations with detailed allocation explanations
            </p>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-glow p-6 space-y-2 border-primary/30">
              <p className="kpi-label">Rakes Formed</p>
              <p className="kpi-value">{kpiStats.rakes}</p>
              <p className="text-xs text-emerald-400">Ready to dispatch</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-secondary/30">
              <p className="kpi-label">Total Orders</p>
              <p className="kpi-value">{kpiStats.orders}</p>
              <p className="text-xs text-muted-foreground">Processed</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-primary/30">
              <p className="kpi-label">Avg Utilization</p>
              <p className="kpi-value">{kpiStats.avgUtil}%</p>
              <p className="text-xs text-muted-foreground">Wagon fill rate</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-emerald-500/30">
              <p className="kpi-label">Est. Total Cost</p>
              <p className="kpi-value">₹{kpiStats.totalCost}k</p>
              <p className="text-xs text-emerald-400">Consolidated rate</p>
            </div>
          </div>

          {/* Rake Selection Tabs */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Formed Rakes</h2>
            <div className="flex flex-wrap gap-2">
              {uniqueRakes.map((rakeId) => (
                <button
                  key={rakeId}
                  onClick={() => setSelectedRake(rakeId)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedRake === rakeId
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground border border-primary/50"
                      : "card-glass border border-border/30 hover:border-primary/50 text-foreground"
                  }`}
                >
                  {rakeId}
                </button>
              ))}
            </div>
          </div>

          {/* Rake Plan Table with NL Explanations */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedRake} • {selectedItems.length} Orders
              </h2>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline" className="gap-2 border-primary/30">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button variant="outline" className="gap-2 border-primary/30">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="card-glow overflow-hidden border border-border/30">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/20">
                      <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase">
                        Order ID
                      </th>
                      <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase">
                        Customer
                      </th>
                      <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase">
                        Product
                      </th>
                      <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase">
                        Destination
                      </th>
                      <th className="text-right p-4 font-semibold text-muted-foreground text-xs uppercase">
                        Quantity
                      </th>
                      <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase">
                        Util %
                      </th>
                      <th className="text-right p-4 font-semibold text-muted-foreground text-xs uppercase">
                        Cost
                      </th>
                      <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase">
                        Info
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item) => (
                      <tr
                        key={item.order_id}
                        onMouseEnter={() => setHoveredRow(item.order_id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className="border-b border-border/20 hover:bg-muted/10 transition-colors group relative"
                      >
                        <td className="p-4 font-medium text-primary">{item.order_id}</td>
                        <td className="p-4 text-foreground/80">{item.customer_name}</td>
                        <td className="p-4 text-foreground/80">{item.product_type}</td>
                        <td className="p-4 text-foreground/80">{item.destination}</td>
                        <td className="p-4 text-right font-medium text-foreground">
                          {item.quantity_tonnes} MT
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              item.utilization_percent >= 85
                                ? "bg-emerald-500/20 text-emerald-400"
                                : item.utilization_percent >= 70
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {item.utilization_percent}%
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium text-foreground">
                          ₹{(item.estimated_cost / 1000).toFixed(1)}k
                        </td>
                        <td className="p-4 text-center">
                          <button className="p-1 hover:bg-muted/30 rounded transition-colors opacity-0 group-hover:opacity-100">
                            <HelpCircle className="w-4 h-4 text-primary" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Natural Language Explanations */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">AI Allocation Explanations</h2>

            <div className="space-y-4">
              {selectedItems.map((item) => (
                <div key={item.order_id} className="card-glow p-6 space-y-4 border border-border/30">
                  {/* Main NL Explanation */}
                  <div className="space-y-2">
                    <p className="font-semibold text-primary flex items-start gap-2">
                      <span className="text-sm mt-1">→</span>
                      <span className="text-foreground">{item.explanation}</span>
                    </p>
                  </div>

                  {/* Reasoning Section */}
                  <div className="pt-4 border-t border-border/30 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Why this allocation?</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{item.reason}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border/30">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Wagon/Platform</p>
                      <p className="text-sm font-semibold text-primary">
                        {item.wagon_id} / {item.platform_id}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Crane Capacity</p>
                      <p className="text-sm font-semibold text-foreground">{item.crane_capacity_tonnes} MT</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Utilization</p>
                      <p className="text-sm font-semibold text-emerald-400">{item.utilization_percent}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Est. Cost</p>
                      <p className="text-sm font-semibold text-foreground">
                        ₹{(item.estimated_cost / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium CTA */}
          <div className="card-glass p-12 space-y-6 border-primary/30 text-center">
            <h2 className="text-3xl font-bold text-foreground">Ready to dispatch?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Review the allocation explanations above and confirm the rake formations are optimal for your requirements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-gradient h-12 px-8 text-base font-semibold">
                Approve & Dispatch
              </Button>
              <Button variant="outline" className="h-12 px-8 border-primary/30">
                Back to Optimization
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
