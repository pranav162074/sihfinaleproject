import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Database,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  optimizeRakeAllocation,
  calculateKPISummary,
} from "@/lib/rake-optimizer";

interface RakePlanItem {
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

interface KPISummary {
  totalOrders: number;
  railOrders: number;
  roadOrders: number;
  totalQuantity: number;
  totalCost: number;
  baselineCost: number;
  costSavings: number;
  costSavingsPercent: string;
  rakesFormed: number;
  avgUtilization: number;
}

export default function RakePlanDispatch() {
  const { toast } = useToast();
  const [plan, setPlan] = useState<RakePlanItem[]>([]);
  const [kpis, setKpis] = useState<KPISummary | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedRake, setSelectedRake] = useState<string | null>(null);

  useEffect(() => {
    // Load orders from sessionStorage and optimize
    const uploadedOrdersStr = sessionStorage.getItem("uploadedOrders");
    if (uploadedOrdersStr) {
      try {
        const uploadedOrders = JSON.parse(uploadedOrdersStr);
        const optimizedPlan = optimizeRakeAllocation(uploadedOrders);
        setPlan(optimizedPlan);
        setKpis(calculateKPISummary(optimizedPlan));

        if (optimizedPlan.length > 0) {
          setSelectedRake(optimizedPlan[0].rake_id);
        }
      } catch (error) {
        console.error("Error loading/optimizing orders:", error);
        toast({
          title: "Error",
          description: "Failed to optimize orders",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const uniqueRakes = [...new Set(plan.map((item) => item.rake_id))];
  const selectedItems = plan.filter((item) => item.rake_id === selectedRake);

  const handleApprove = (orderId: string) => {
    setPlan((prev) =>
      prev.map((item) =>
        item.order_id === orderId ? { ...item, status: "approved" } : item,
      ),
    );
    toast({
      title: "Approved",
      description: `Order ${orderId} approved for dispatch`,
    });
  };

  const handleOverride = (orderId: string) => {
    setPlan((prev) =>
      prev.map((item) =>
        item.order_id === orderId ? { ...item, status: "overridden" } : item,
      ),
    );
    toast({
      title: "Override Recorded",
      description: `Order ${orderId} marked for manual override`,
    });
  };

  const handleAddToDatabase = async () => {
    if (plan.length === 0) {
      toast({
        title: "No Plan Available",
        description: "Please generate a rake plan first",
        variant: "destructive",
      });
      return;
    }

    try {
      const planData = {
        timestamp: new Date().toISOString(),
        rakePlan: plan,
        kpis: kpis,
        totalOrders: plan.length,
        totalQuantity: plan.reduce(
          (sum, item) => sum + item.quantity_tonnes,
          0,
        ),
        totalCost: plan.reduce((sum, item) => sum + item.estimated_cost, 0),
      };

      // Save to localStorage as database persistence
      const existingPlans = JSON.parse(
        localStorage.getItem("savedRakePlans") || "[]",
      );
      existingPlans.push(planData);
      localStorage.setItem("savedRakePlans", JSON.stringify(existingPlans));

      toast({
        title: "Plan Saved Successfully",
        description: `Rake plan saved with timestamp ${new Date().toLocaleString()}. Total: ${plan.length} orders, ₹${(planData.totalCost / 1000).toFixed(1)}k cost`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save plan to database. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    if (plan.length === 0) return;

    const headers = [
      "Order ID",
      "Customer",
      "Product",
      "Origin",
      "Destination",
      "Quantity (MT)",
      "Rake",
      "Wagon",
      "Platform",
      "Mode",
      "Utilization %",
      "Cost",
      "Status",
    ];
    const rows = plan.map((item) => [
      item.order_id,
      item.customer_name,
      item.product_type,
      item.origin,
      item.destination,
      item.quantity_tonnes,
      item.rake_id,
      item.wagon_id,
      item.platform_id,
      item.transport_mode.toUpperCase(),
      item.utilization_percent,
      item.estimated_cost,
      item.status || "pending",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rake-plan-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Downloaded",
      description: "Rake plan exported to CSV",
    });
  };

  return (
    <Layout planData={plan}>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Rake Plan & Dispatch
            </h1>
            <p className="text-lg text-muted-foreground">
              AI-optimized rake formations with detailed allocation explanations
              and approval workflow
            </p>
          </div>

          {/* KPI Summary */}
          {kpis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-fade-in">
              <div className="card-glow p-6 space-y-2 border-primary/30 stagger-item">
                <p className="kpi-label">Rakes Formed</p>
                <p className="kpi-value">{kpis.rakesFormed}</p>
                <p className="text-xs text-emerald-400">Properly distributed</p>
              </div>

              <div className="card-glow p-6 space-y-2 border-secondary/30 stagger-item">
                <p className="kpi-label">Total Orders</p>
                <p className="kpi-value">{kpis.totalOrders}</p>
                <p className="text-xs text-muted-foreground">All processed</p>
              </div>

              <div className="card-glow p-6 space-y-2 border-primary/30 stagger-item">
                <p className="kpi-label">Avg Utilization</p>
                <p className="kpi-value">{kpis.avgUtilization}%</p>
                <p className="text-xs text-muted-foreground">Wagon fill rate</p>
              </div>

              <div className="card-glow p-6 space-y-2 border-emerald-500/30 stagger-item">
                <p className="kpi-label">Est. Total Cost</p>
                <p className="kpi-value">
                  ₹{(kpis.totalCost / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-emerald-400">Optimized rate</p>
              </div>

              <div className="card-glow p-6 space-y-2 border-emerald-500/30 stagger-item">
                <p className="kpi-label">Cost Savings</p>
                <p className="kpi-value">{kpis.costSavingsPercent}%</p>
                <p className="text-xs text-emerald-400">
                  ₹{(kpis.costSavings / 1000).toFixed(1)}k saved
                </p>
              </div>
            </div>
          )}

          {/* Rake Selection Tabs */}
          {plan.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                Formed Rakes ({uniqueRakes.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {uniqueRakes.map((rakeId, idx) => {
                  const rakeOrders = plan.filter((p) => p.rake_id === rakeId);
                  const rakeQuantity = rakeOrders.reduce(
                    (sum, p) => sum + p.quantity_tonnes,
                    0,
                  );
                  const rakeMode = rakeOrders[0]?.transport_mode || "mixed";
                  return (
                    <button
                      key={rakeId}
                      onClick={() => setSelectedRake(rakeId)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all stagger-item ${
                        selectedRake === rakeId
                          ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground border border-primary/50"
                          : "card-glass border border-border/30 hover:border-primary/50 text-foreground"
                      }`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold">{rakeId}</span>
                        <span className="text-xs opacity-75">
                          {rakeOrders.length} orders •{" "}
                          {Math.round(rakeQuantity)} MT •{" "}
                          {rakeMode.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rake Plan Table */}
          {selectedItems.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedRake} • {selectedItems.length} Orders
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    className="gap-2 border-primary/30"
                  >
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
              <div className="card-glow overflow-hidden border border-border/30 animate-fade-in">
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
                          Route
                        </th>
                        <th className="text-right p-4 font-semibold text-muted-foreground text-xs uppercase">
                          Quantity
                        </th>
                        <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase">
                          Mode
                        </th>
                        <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase">
                          Util %
                        </th>
                        <th className="text-right p-4 font-semibold text-muted-foreground text-xs uppercase">
                          Cost
                        </th>
                        <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase">
                          Status
                        </th>
                        <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item) => (
                        <tr
                          key={item.order_id}
                          onMouseEnter={() => setHoveredRow(item.order_id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          className="border-b border-border/20 hover:bg-muted/10 transition-colors group stagger-item"
                        >
                          <td className="p-4 font-medium text-primary">
                            {item.order_id}
                          </td>
                          <td className="p-4 text-foreground/80">
                            {item.customer_name}
                          </td>
                          <td className="p-4 text-foreground/80">
                            {item.product_type}
                          </td>
                          <td className="p-4 text-foreground/80 text-xs">
                            {item.origin} → {item.destination}
                          </td>
                          <td className="p-4 text-right font-medium text-foreground">
                            {item.quantity_tonnes} MT
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                item.transport_mode === "rail"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-secondary/20 text-secondary"
                              }`}
                            >
                              {item.transport_mode.toUpperCase()}
                            </span>
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
                            {item.status === "approved" ? (
                              <span className="flex items-center justify-center gap-1 text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                                Approved
                              </span>
                            ) : item.status === "overridden" ? (
                              <span className="flex items-center justify-center gap-1 text-amber-400">
                                <AlertCircle className="w-4 h-4" />
                                Override
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.status !== "approved" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(item.order_id)}
                                  className="h-7 px-3 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                                >
                                  Approve
                                </Button>
                              )}
                              {item.status !== "overridden" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleOverride(item.order_id)}
                                  variant="outline"
                                  className="h-7 px-3 text-xs border-amber-500/30"
                                >
                                  Override
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Natural Language Explanations */}
          {selectedItems.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                AI Allocation Reasoning
              </h2>

              <div className="space-y-4">
                {selectedItems.map((item, idx) => (
                  <div
                    key={item.order_id}
                    className="card-glow p-6 space-y-4 border border-border/30 stagger-item"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Main Explanation */}
                    <div className="space-y-2">
                      <p className="font-semibold text-primary flex items-start gap-2">
                        <span className="text-sm mt-1">→</span>
                        <span className="text-foreground">
                          {item.explanation}
                        </span>
                      </p>
                    </div>

                    {/* Reasoning Section */}
                    <div className="pt-4 border-t border-border/30 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Why this allocation?
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {item.reason}
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border/30">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Wagon/Platform
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {item.wagon_id} / {item.platform_id}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Crane Capacity
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {item.crane_capacity_tonnes} MT
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Utilization
                        </p>
                        <p className="text-sm font-semibold text-emerald-400">
                          {item.utilization_percent}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Est. Cost
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          ₹{(item.estimated_cost / 1000).toFixed(1)}k
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Premium CTA */}
          {plan.length > 0 && (
            <div className="card-glass p-12 space-y-6 border-primary/30 text-center animate-fade-in">
              <h2 className="text-3xl font-bold text-foreground">
                Ready to dispatch?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Review the allocation reasoning above and approve the rake
                formations. Use the Approve and Override buttons for each order.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-gradient h-12 px-8 text-base font-semibold">
                  Approve All & Dispatch
                </Button>
                <Button
                  onClick={handleAddToDatabase}
                  variant="outline"
                  className="h-12 px-8 border-primary/30 gap-2 hover:bg-primary/10"
                >
                  <Database className="w-4 h-4" />
                  Add Plan to Database
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {plan.length === 0 && (
            <div className="card-glass p-12 text-center space-y-4 border-border/30">
              <p className="text-muted-foreground">
                No rake plan available. Please upload data and run optimization
                first.
              </p>
              <Button
                className="btn-gradient"
                onClick={() => (window.location.href = "/upload")}
              >
                Go to Data Upload
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
