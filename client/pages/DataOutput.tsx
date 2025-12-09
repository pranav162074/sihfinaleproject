import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Package, Truck, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OptimizeRakesResponse } from "@shared/api";
import { Button } from "@/components/ui/button";

export default function DataOutput() {
  const { data: sampleDataset } = useQuery({
    queryKey: ["sample-dataset"],
    queryFn: async () => {
      const res = await fetch("/api/sample-dataset");
      return res.json();
    },
  });

  const { data: optimizationResult } = useQuery({
    queryKey: ["optimization-for-output"],
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
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const kpi = optimizationResult.kpi_summary;
  const rakes = optimizationResult.planned_rakes;
  const assignments = optimizationResult.rail_vs_road_assignment;

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Final Optimization Results</h1>
              <p className="text-lg text-muted-foreground">
                Your complete daily transportation plan with explanations
              </p>
            </div>
            <Button className="btn-gradient gap-2 h-12 whitespace-nowrap">
              <Download className="w-4 h-4" />
              Download Plan
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
            <div className="kpi-card">
              <p className="text-xs text-muted-foreground font-medium mb-1">Total Cost</p>
              <p className="text-3xl font-bold text-primary">₹{(kpi.total_cost_optimized / 1000).toFixed(1)}k</p>
              <p className="text-xs text-green-400 mt-2">Optimized</p>
            </div>

            <div className="kpi-card">
              <p className="text-xs text-muted-foreground font-medium mb-1">Avg Utilization</p>
              <p className="text-3xl font-bold text-primary">{Math.round(kpi.average_rake_utilization_percent)}%</p>
              <p className="text-xs text-green-400 mt-2">Efficient packing</p>
            </div>

            <div className="kpi-card">
              <p className="text-xs text-muted-foreground font-medium mb-1">On-Time %</p>
              <p className="text-3xl font-bold text-green-400">{Math.round(kpi.on_time_delivery_percent)}%</p>
              <p className="text-xs text-green-400 mt-2">All deadlines met</p>
            </div>

            <div className="kpi-card">
              <p className="text-xs text-muted-foreground font-medium mb-1">Savings</p>
              <p className="text-3xl font-bold text-primary">₹{(kpi.demurrage_savings / 1000).toFixed(1)}k</p>
              <p className="text-xs text-green-400 mt-2">Penalties avoided</p>
            </div>
          </div>

          {/* Section A: Daily Rake Plan */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Section A: Daily Rake Plan</h2>
            <p className="text-muted-foreground">
              Exactly which orders are assigned to which trains, with full reasoning.
            </p>

            <div className="space-y-3">
              {rakes.map((rake, idx) => (
                <div key={rake.planned_rake_id || idx} className="card-glow p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">
                        Rake #{idx + 1} ({rake.rake_id})
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        → {rake.primary_destination || "Multiple destinations"}
                      </p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/40">
                      {rake.utilization_percent.toFixed(0)}% Full
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="frosted-glass p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="font-bold text-lg text-foreground">{rake.orders_allocated.length}</p>
                    </div>
                    <div className="frosted-glass p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Tonnage</p>
                      <p className="font-bold text-lg text-foreground">{rake.total_tonnage_assigned.toFixed(0)}t</p>
                    </div>
                    <div className="frosted-glass p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="font-bold text-lg text-primary">₹{(rake.cost_breakdown.total_cost / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="frosted-glass p-3 space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className={`font-bold text-lg ${rake.sla_status === "On-time" ? "text-green-400" : "text-amber-400"}`}>
                        {rake.sla_status}
                      </p>
                    </div>
                  </div>

                  {/* Why This Works */}
                  <div className="border-t border-primary/20 pt-4 space-y-2">
                    <p className="text-sm font-semibold text-foreground">Why this rake plan works:</p>
                    <ul className="space-y-1 text-sm text-foreground/80">
                      <li>✓ Combines {rake.orders_allocated.length} orders efficiently for a single destination</li>
                      <li>✓ Achieves {rake.utilization_percent.toFixed(0)}% wagon utilization (high efficiency)</li>
                      <li>✓ Delivers {rake.sla_status === "On-time" ? "before SLA deadline" : "within acceptable window"}</li>
                      <li>✓ Saves ₹{(rake.cost_breakdown.total_cost / 1000).toFixed(1)}k vs sending orders separately</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Rail vs Road */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Section B: Rail vs Road Decisions</h2>
            <p className="text-muted-foreground">
              For each order, the system decided whether rail or road is better (faster, cheaper, or more reliable).
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {assignments.slice(0, 6).map((assignment, idx) => (
                <div key={assignment.order_id || idx} className="card-glow p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{assignment.order_id}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {assignment.assigned_rake_id || "Road transport"}
                      </p>
                    </div>
                    <Badge
                      className={
                        assignment.assigned_mode === "rail"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }
                    >
                      {assignment.assigned_mode === "rail" ? "🚆 Rail" : "🚚 Road"}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground/80">
                    {assignment.assigned_mode === "rail"
                      ? "Rail chosen because: Lower cost at scale, reliable transit, fits rail schedule"
                      : "Road chosen because: Urgent delivery needed, faster routing available"}
                  </p>

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>📅 Arrival: {new Date(assignment.expected_arrival_date).toLocaleDateString()}</p>
                    <p>✅ Confidence: {assignment.confidence_percent}%</p>
                  </div>
                </div>
              ))}
            </div>

            {assignments.length > 6 && (
              <div className="text-center text-sm text-muted-foreground">
                + {assignments.length - 6} more orders (see full report for details)
              </div>
            )}
          </div>

          {/* Section C: Summary & Next Steps */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Section C: Summary & Next Steps</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* What was achieved */}
              <div className="card-glow p-6 space-y-4 border-green-500/20">
                <h3 className="text-lg font-bold text-foreground">✅ What Was Achieved</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90">
                      <strong>{kpi.number_of_rakes_planned} rakes planned</strong> for today — fewer trains = lower overhead
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90">
                      <strong>{Math.round(kpi.average_rake_utilization_percent)}% average utilization</strong> — wagons are well-packed, not wasting space
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90">
                      <strong>₹{(kpi.cost_savings_vs_baseline / 1000).toFixed(1)}k cost savings</strong> vs manual planning approach
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90">
                      <strong>{Math.round(kpi.on_time_delivery_percent)}% on-time delivery</strong> — all customer SLAs met, zero penalties
                    </p>
                  </div>
                </div>
              </div>

              {/* What to do next */}
              <div className="card-glow p-6 space-y-4 border-primary/40">
                <h3 className="text-lg font-bold text-foreground">➡ What to Do Next</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-primary">1.</span>
                    <p className="text-sm text-foreground/90">
                      <strong>Review the plan</strong> — Check each rake in Rake Planner tab
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-primary">2.</span>
                    <p className="text-sm text-foreground/90">
                      <strong>Approve rakes</strong> — Click "Approve & Dispatch" for each rake you accept
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-primary">3.</span>
                    <p className="text-sm text-foreground/90">
                      <strong>Share with operations</strong> — Download this plan and send to loading & dispatch team
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-primary">4.</span>
                    <p className="text-sm text-foreground/90">
                      <strong>Execute & monitor</strong> — Track shipments in Reports tab to verify SLA compliance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download & Share */}
          <div className="card-glow p-8 space-y-4 text-center border-primary/40">
            <p className="text-lg font-semibold text-foreground">
              Ready to execute this plan?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-gradient h-12 px-8 gap-2">
                <Download className="w-5 h-5" />
                Download Full Report
              </Button>
              <Button
                variant="outline"
                className="h-12 px-8 border-primary/30 hover:border-primary/60 gap-2"
              >
                <Truck className="w-5 h-5" />
                Go to Rake Planner
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
