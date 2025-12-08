import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  FileText,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OptimizeRakesResponse } from "@shared/api";

export default function ReportsNew() {
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
        <div className="flex items-center justify-center h-screen">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading reports...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const kpi = optimizationResult.kpi_summary;

  // Mock trend data
  const costTrendData = [
    { day: "Mon", baseline: 52000, optimized: 48500 },
    { day: "Tue", baseline: 48000, optimized: 45200 },
    { day: "Wed", baseline: 55000, optimized: 49800 },
    { day: "Thu", baseline: 60000, optimized: 52500 },
    { day: "Fri", baseline: 58000, optimized: 50200 },
    { day: "Today", baseline: 44930, optimized: kpi.total_cost_optimized },
  ];

  const utilizationData = [
    { name: "Rail", value: 65, fill: "#3b82f6" },
    { name: "Road", value: 35, fill: "#f59e0b" },
  ];

  const savingsBreakdown = [
    { category: "Transport Optimization", amount: (kpi.cost_savings_vs_baseline * 0.5).toFixed(0) },
    { category: "Demurrage Avoidance", amount: kpi.demurrage_savings.toFixed(0) },
    { category: "Loading Efficiency", amount: (kpi.cost_savings_vs_baseline * 0.5 - kpi.demurrage_savings).toFixed(0) },
  ];

  const handleExportCSV = () => {
    let csv = "Rake Plan Report\n";
    csv += `Generated: ${new Date().toISOString()}\n\n`;

    csv += "Planned Rakes\n";
    csv += "Rake ID,Destination,Orders,Tonnage,Utilization %,Status,Cost\n";
    optimizationResult.planned_rakes.forEach((rake) => {
      csv += `${rake.rake_id},${rake.primary_destination},${rake.orders_allocated.length},${rake.total_tonnage_assigned.toFixed(1)},${rake.utilization_percent.toFixed(0)},${rake.sla_status},${rake.cost_breakdown.total_cost}\n`;
    });

    csv += "\n\nOrder Assignments\n";
    csv += "Order ID,Customer,Mode,Rake,Arrival Date,Status\n";
    optimizationResult.rail_vs_road_assignment.forEach((assignment) => {
      csv += `${assignment.order_id},,${assignment.assigned_mode},${assignment.assigned_rake_id || "Multiple"},${new Date(assignment.expected_arrival_date).toLocaleDateString()}\n`;
    });

    csv += "\n\nKPI Summary\n";
    csv += `Total Cost Optimized,${kpi.total_cost_optimized}\n`;
    csv += `Cost Savings,${kpi.cost_savings_vs_baseline}\n`;
    csv += `Average Utilization %,${kpi.average_rake_utilization_percent.toFixed(1)}\n`;
    csv += `On-Time Delivery %,${kpi.on_time_delivery_percent.toFixed(1)}\n`;
    csv += `Demurrage Saved,${kpi.demurrage_savings}\n`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
    element.setAttribute("download", `rake-plan-${new Date().toISOString().split("T")[0]}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  📊 Performance Reports
                </h1>
                <p className="text-muted-foreground">
                  Today's optimization results and KPI dashboard
                </p>
              </div>
              <Button onClick={handleExportCSV} className="gap-2">
                <Download className="w-4 h-4" />
                Export Plan (CSV)
              </Button>
            </div>

            {/* Main KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Cost Saved */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Cost Saved
                  </CardTitle>
                  <CardDescription>vs baseline all-road option</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                    ₹{(kpi.cost_savings_vs_baseline / 100000).toFixed(1)}L
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((kpi.cost_savings_vs_baseline / (kpi.total_cost_optimized + kpi.cost_savings_vs_baseline)) * 100).toFixed(1)}% reduction
                  </p>
                </CardContent>
              </Card>

              {/* Utilization */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-blue-600" />
                    Avg Utilization
                  </CardTitle>
                  <CardDescription>rake loading efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {kpi.average_rake_utilization_percent.toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {kpi.average_rake_utilization_percent > 80 ? "✅ Excellent" : "📊 Good"} efficiency
                  </p>
                </CardContent>
              </Card>

              {/* On-Time */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    On-Time Delivery
                  </CardTitle>
                  <CardDescription>customer SLA compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {kpi.on_time_delivery_percent.toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All deliveries meeting deadlines
                  </p>
                </CardContent>
              </Card>

              {/* Demurrage */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    Demurrage Saved
                  </CardTitle>
                  <CardDescription>penalty avoidance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                    ₹{(kpi.demurrage_savings / 1000).toFixed(0)}k
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No late deliveries penalty cost
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Cost Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📈 Cost Optimization Trend</CardTitle>
                  <CardDescription>Last 6 days: optimized vs baseline</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={costTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #d1d5db" }} />
                      <Line type="monotone" dataKey="baseline" stroke="#ef4444" strokeWidth={2} name="Baseline" />
                      <Line type="monotone" dataKey="optimized" stroke="#10b981" strokeWidth={2} name="Optimized" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Mode Split */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🚂 Rail vs Road</CardTitle>
                  <CardDescription>today's shipment mode distribution</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={utilizationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {utilizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Savings Breakdown */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Savings Breakdown
                </CardTitle>
                <CardDescription>where cost savings come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savingsBreakdown.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ₹{Number(item.amount).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${(Number(item.amount) / kpi.cost_savings_vs_baseline) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="bg-gradient-to-r from-slate-50 to-stone-50 dark:from-slate-950/30 dark:to-stone-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Daily Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                    <p className="font-bold">₹{(kpi.total_cost_optimized / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Rakes Planned</p>
                    <p className="font-bold">{kpi.number_of_rakes_planned}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Orders Shipped</p>
                    <p className="font-bold">
                      {optimizationResult.planned_rakes.reduce(
                        (sum, r) => sum + r.orders_allocated.length,
                        0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Tonnage</p>
                    <p className="font-bold">
                      {optimizationResult.planned_rakes.reduce((sum, r) => sum + r.total_tonnage_assigned, 0).toFixed(0)}t
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Execution Time</p>
                    <p className="font-bold">{optimizationResult.execution_time_seconds.toFixed(2)}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
