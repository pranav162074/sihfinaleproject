import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  TrendingUp,
  Clock,
  DollarSign,
  Package,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OptimizeRakesResponse } from "@shared/api";

export default function Reports() {
  const { data: sampleDataset } = useQuery({
    queryKey: ["sample-dataset"],
    queryFn: async () => {
      const res = await fetch("/api/sample-dataset");
      return res.json();
    },
  });

  const { data: optimizationResult } = useQuery({
    queryKey: ["optimization-for-reports"],
    enabled: !!sampleDataset,
    queryFn: async () => {
      if (!sampleDataset) return null;
      const res = await fetch("/api/optimize-rakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sampleDataset,
          config: {
            cost_vs_sla_weight: 0.6,
            allow_multi_destination_rakes: true,
            min_utilization_percent: 75,
          },
        }),
      });
      return (await res.json()) as OptimizeRakesResponse;
    },
  });

  if (!optimizationResult) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const summary = optimizationResult.summary;

  // Mock trend data for visualization
  const costTrendData = [
    { day: "Mon", baseline: 52000, optimized: 48500 },
    { day: "Tue", baseline: 48000, optimized: 45200 },
    { day: "Wed", baseline: 55000, optimized: 49800 },
    { day: "Thu", baseline: 60000, optimized: 52500 },
    { day: "Fri", baseline: 58000, optimized: 50200 },
    { day: "Today", baseline: 44930, optimized: summary.total_cost },
  ];

  const utilizationTrendData = [
    { day: "Mon", utilization: 65 },
    { day: "Tue", utilization: 68 },
    { day: "Wed", utilization: 72 },
    { day: "Thu", utilization: 70 },
    { day: "Fri", utilization: 75 },
    { day: "Today", utilization: summary.avg_utilization },
  ];

  const handleExportCSV = () => {
    let csv = "Rake Plan Report\n";
    csv += `Generated: ${new Date().toISOString()}\n\n`;
    csv += "Summary\n";
    csv += `Total Cost,${summary.total_cost}\n`;
    csv += `Average Utilization %,${summary.avg_utilization.toFixed(1)}\n`;
    csv += `On-Time Delivery %,${summary.on_time_percent.toFixed(1)}\n`;
    csv += `Demurrage Saved,${summary.demurrage_avoided}\n`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
    element.setAttribute("download", `rake-plan-report-${new Date().toISOString().split("T")[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-title-lg flex items-center gap-2">
                <span className="text-2xl">📊</span> Performance Reports
              </h1>
              <p className="text-subtitle">
                Today's optimization results and key metrics
              </p>
            </div>
            <Button
              onClick={handleExportCSV}
              className="btn-gradient whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-2" />
              Export (CSV)
            </Button>
          </div>

          {/* Main KPI Cards - Prominent Glow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
            {/* Cost Saved */}
            <div className="kpi-card group border-primary/40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">💰 Total Cost</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{(summary.total_cost / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-green-400 mt-2">✨ Optimized for efficiency</p>
                </div>
              </div>
            </div>

            {/* Utilization */}
            <div className="kpi-card group border-primary/40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">🚆 Avg Utilization</p>
                  <p className="text-3xl font-bold text-primary">
                    {Math.round(summary.avg_utilization)}%
                  </p>
                  <p className="text-xs text-green-400 mt-2">Good wagon efficiency</p>
                </div>
              </div>
            </div>

            {/* On-Time */}
            <div className="kpi-card group border-primary/40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">⏱️ On-Time Delivery</p>
                  <p className="text-3xl font-bold text-green-400">
                    {Math.round(summary.on_time_percent)}%
                  </p>
                  <p className="text-xs text-green-400 mt-2">All deadlines met</p>
                </div>
              </div>
            </div>

            {/* Demurrage Avoided */}
            <div className="kpi-card group border-primary/40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">🚨 Demurrage Avoided</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{(summary.demurrage_avoided / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-green-400 mt-2">No late penalties</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in-right">
            {/* Cost Trend Chart */}
            <div className="card-glow p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg">📈 Cost Optimization Trend</h3>
                <p className="text-sm text-muted-foreground">Last 6 days: optimized vs baseline</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 16% 18%)" />
                  <XAxis dataKey="day" stroke="hsl(210 9% 61%)" style={{ fontSize: "12px" }} />
                  <YAxis stroke="hsl(210 9% 61%)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(217 20% 10%)",
                      border: "1px solid hsl(217 16% 22%)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(210 17% 98%)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Baseline"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="optimized"
                    stroke="hsl(175 100% 42%)"
                    strokeWidth={2}
                    name="Optimized"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Utilization Trend Chart */}
            <div className="card-glow p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg">📊 Utilization Trend</h3>
                <p className="text-sm text-muted-foreground">Wagon capacity usage over time</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={utilizationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 16% 18%)" />
                  <XAxis dataKey="day" stroke="hsl(210 9% 61%)" style={{ fontSize: "12px" }} />
                  <YAxis stroke="hsl(210 9% 61%)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(217 20% 10%)",
                      border: "1px solid hsl(217 16% 22%)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(210 17% 98%)" }}
                  />
                  <Bar dataKey="utilization" fill="hsl(175 100% 42%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Insights */}
          <div className="card-glow p-6 space-y-4 border-primary/30">
            <h3 className="font-bold text-lg">💡 Key Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="frosted-glass p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <p className="font-semibold">Cost Efficiency</p>
                </div>
                <p className="text-sm text-foreground/80">
                  Today's optimization saves approximately ₹{(summary.demurrage_avoided / 1000).toFixed(1)}k by consolidating orders and reducing demurrage penalties.
                </p>
              </div>

              <div className="frosted-glass p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <p className="font-semibold">Wagon Utilization</p>
                </div>
                <p className="text-sm text-foreground/80">
                  {summary.avg_utilization >= 80
                    ? "Excellent wagon usage—minimal empty capacity."
                    : summary.avg_utilization >= 70
                      ? "Good utilization—room for slight improvement."
                      : "Moderate usage—consider consolidation strategies."}
                </p>
              </div>

              <div className="frosted-glass p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <p className="font-semibold">On-Time Performance</p>
                </div>
                <p className="text-sm text-foreground/80">
                  {summary.on_time_percent === 100
                    ? "All deliveries meet SLA deadlines—perfect compliance."
                    : "Most deliveries on time with minimal delays."}
                </p>
              </div>

              <div className="frosted-glass p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="font-semibold">Penalty Avoidance</p>
                </div>
                <p className="text-sm text-foreground/80">
                  Smart scheduling avoids late-delivery demurrage charges. This is a key cost driver in rail logistics.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="card-glow p-6 space-y-4">
            <h3 className="font-bold text-lg">📋 Daily Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="frosted-glass p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Total Rakes</p>
                <p className="text-2xl font-bold text-primary">
                  {optimizationResult.planned_rakes.length}
                </p>
              </div>
              <div className="frosted-glass p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Orders Shipped</p>
                <p className="text-2xl font-bold text-primary">
                  {optimizationResult.planned_rakes.reduce(
                    (sum, r) => sum + (r.orders_count || 0),
                    0
                  )}
                </p>
              </div>
              <div className="frosted-glass p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">Total Tonnage</p>
                <p className="text-2xl font-bold text-primary">
                  {optimizationResult.planned_rakes.reduce((sum, r) => sum + r.total_tonnage, 0).toFixed(0)}t
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
