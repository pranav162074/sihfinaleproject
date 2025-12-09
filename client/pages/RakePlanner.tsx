import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  MapPin,
  Package,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OptimizeRakesResponse, PlannedRake } from "@shared/api";

export default function RakePlanner() {
  const [selectedRake, setSelectedRake] = useState<PlannedRake | null>(null);
  const [approvedRakes, setApprovedRakes] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const { data: optimizationResult } = useQuery({
    queryKey: ["latest-optimization"],
    queryFn: async () => {
      const res = await fetch("/api/sample-dataset");
      const dataset = await res.json();
      const optRes = await fetch("/api/optimize-rakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dataset,
          config: {
            cost_vs_sla_weight: 0.6,
            allow_multi_destination_rakes: true,
            min_utilization_percent: 75,
          },
        }),
      });
      return (await optRes.json()) as OptimizeRakesResponse;
    },
  });

  const handleApproveRake = (rakeId: string) => {
    setApprovedRakes((prev) => new Set(prev).add(rakeId));
  };

  const getRiskBadgeColor = (risk: string) => {
    if (risk === "LOW") return "badge-priority-medium";
    if (risk === "MEDIUM") return "badge-priority-high";
    return "badge-sla-risk";
  };

  const getRiskIcon = (risk: string) => {
    if (risk === "LOW") return "✅";
    if (risk === "MEDIUM") return "⚠️";
    return "🚨";
  };

  const getRailModeIcon = (rail_percent?: number) => {
    if (!rail_percent) return "🚆";
    if (rail_percent === 100) return "🚆";
    if (rail_percent > 0) return "🚚";
    return "🚚";
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 85) return "text-green-400";
    if (utilization >= 70) return "text-amber-400";
    return "text-red-400";
  };

  const rakes = optimizationResult?.planned_rakes || [];
  const summary = optimizationResult?.summary || {
    total_cost: 0,
    avg_utilization: 0,
    on_time_percent: 0,
    demurrage_avoided: 0,
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Page Header */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-title-lg flex items-center gap-2">
              <span className="text-2xl">✅</span> Today's Rake Plan
            </h1>
            <p className="text-subtitle">
              {rakes.length} rakes ready · {Math.round(summary.on_time_percent)}% on-time delivery
            </p>
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
            {/* Total Cost */}
            <div className="kpi-card group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">💰 Total Cost</p>
                  <p className="text-2xl font-bold text-primary">₹{(summary.total_cost / 1000).toFixed(1)}k</p>
                </div>
                <DollarSign className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-green-400 mt-2">✨ Optimized for cost</p>
            </div>

            {/* Avg Utilization */}
            <div className="kpi-card group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">📊 Avg Utilization</p>
                  <p className={`text-2xl font-bold ${getUtilizationColor(summary.avg_utilization)}`}>
                    {Math.round(summary.avg_utilization)}%
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Room to improve</p>
            </div>

            {/* On-Time % */}
            <div className="kpi-card group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">⏱️ On-Time %</p>
                  <p className="text-2xl font-bold text-green-400">{Math.round(summary.on_time_percent)}%</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400/50 group-hover:text-green-400 transition-colors" />
              </div>
              <p className="text-xs text-green-400 mt-2">All deadlines met</p>
            </div>

            {/* Demurrage Avoided */}
            <div className="kpi-card group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">🚨 Demurrage Avoided</p>
                  <p className="text-2xl font-bold text-primary">₹{(summary.demurrage_avoided / 1000).toFixed(1)}k</p>
                </div>
                <Zap className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-primary mt-2">Late penalties avoided</p>
            </div>
          </div>

          {/* Rakes List */}
          <div className="space-y-4 animate-slide-in-right">
            {rakes.length === 0 ? (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No rakes planned. Run optimization first.
                </CardContent>
              </Card>
            ) : (
              rakes.map((rake) => {
                const isApproved = approvedRakes.has(rake.rake_id);
                const utilization = rake.utilization_percent || 0;

                return (
                  <div
                    key={rake.planned_rake_id || rake.rake_id}
                    className="card-glow p-4 sm:p-6 cursor-pointer hover:scale-105 transition-all"
                    onClick={() => {
                      setSelectedRake(rake);
                      setShowDetails(true);
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left Section - Rake Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-2xl">🚆</span>
                          <div>
                            <h3 className="font-bold text-lg">
                              Rake #{rake.rake_id.split("_")[1]} · {rake.rake_id}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4" />
                              {rake.primary_destination || "Multiple destinations"}
                            </div>
                          </div>
                        </div>

                        {/* Orders & Tonnage */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-primary" />
                            <span className="text-foreground font-medium">{rake.orders_allocated.length} orders</span>
                            <span className="text-muted-foreground">· {rake.total_tonnage_assigned.toFixed(0)}t</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-foreground font-medium">Departs</span>
                            <span className="text-muted-foreground">{new Date(rake.departure_time).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2">
                          <div className="badge-rail-only">🚆 Rail</div>

                          {rake.sla_status === "At-Risk" && (
                            <div className="badge-sla-risk">🔴 At Risk</div>
                          )}

                          {utilization < 70 && (
                            <div className="badge-low-util">🟡 Low Utilization</div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Metrics & Action */}
                      <div className="flex flex-col sm:items-end gap-4">
                        {/* Utilization & Cost */}
                        <div className="text-right">
                          <p className={`text-3xl font-bold ${getUtilizationColor(utilization)}`}>
                            {utilization.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Utilization</p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">₹{(rake.cost_breakdown.total_cost / 1000).toFixed(1)}k</p>
                          <p className="text-xs text-muted-foreground">Total Cost</p>
                        </div>

                        {/* Action Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRake(rake);
                            setShowDetails(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-primary/30 hover:border-primary/60 hover:bg-primary/10"
                        >
                          Details <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>

                    {/* Approval Status */}
                    {isApproved && (
                      <div className="mt-4 pt-4 border-t border-primary/20">
                        <div className="inline-flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          Approved & ready to dispatch
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Ready to Dispatch Section */}
          {rakes.length > 0 && (
            <div className="card-glow p-6 space-y-4 border-primary/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    🚀 Ready to Dispatch
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {approvedRakes.size} of {rakes.length} rakes approved
                  </p>
                </div>
              </div>

              {approvedRakes.size > 0 && (
                <Alert className="border-green-500/30 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    All selected rakes are ready. Click below to finalize dispatch.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="btn-gradient w-full h-12 text-lg"
                disabled={approvedRakes.size === 0}
              >
                Approve & Dispatch {approvedRakes.size > 0 && `(${approvedRakes.size})`}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Details Drawer */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent className="w-full sm:w-[500px] bg-card border-l border-primary/20">
          <SheetHeader>
            <SheetTitle className="text-xl">
              {selectedRake && `Rake #${selectedRake.rake_id.split("_")[1]} Details`}
            </SheetTitle>
            <SheetDescription>
              Why this rake was chosen and what it achieves
            </SheetDescription>
          </SheetHeader>

          {selectedRake && (
            <div className="explanation-panel">
              <div className="space-y-4 mt-6">
                {/* Summary Card */}
                <div className="frosted-glass p-4 space-y-2">
                  <p className="font-semibold text-foreground">In Plain English</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    This rake serves {selectedRake.primary_destination || "multiple destinations"} and is{" "}
                    {selectedRake.utilization_percent.toFixed(0)}% full. It leaves before the customer deadline, avoiding
                    late-delivery penalties.
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="space-y-3">
                  <p className="font-semibold text-foreground">Why This Works:</p>

                  <div className="explanation-item">
                    <span className="explanation-item icon">💰</span>
                    <div className="explanation-item text">
                      Saves ₹{(selectedRake.cost_breakdown.total_cost / 1000).toFixed(1)}k compared to separate shipments
                    </div>
                  </div>

                  <div className="explanation-item">
                    <span className="explanation-item icon">📊</span>
                    <div className="explanation-item text">
                      {selectedRake.utilization_percent.toFixed(0)}% full — combines multiple orders efficiently
                    </div>
                  </div>

                  <div className="explanation-item">
                    <span className="explanation-item icon">⏱️</span>
                    <div className="explanation-item text">
                      Arrives before all customer deadlines — no late penalties
                    </div>
                  </div>

                  {selectedRake.sla_status === "At-Risk" && (
                    <div className="explanation-item">
                      <span className="explanation-item icon">🚨</span>
                      <div className="explanation-item text">
                        At-risk delivery — consider alternative rakes if SLA compliance is critical
                      </div>
                    </div>
                  )}
                </div>

                {/* Orders in This Rake */}
                {selectedRake.orders_allocated && selectedRake.orders_allocated.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-primary/20">
                    <p className="font-semibold text-foreground">Orders Included:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRake.orders_allocated.length} orders grouped together (see Orders tab for details)
                    </p>
                  </div>
                )}

                {/* Approval Button */}
                <Button
                  className="btn-gradient w-full h-10 mt-6"
                  onClick={() => {
                    if (selectedRake) {
                      handleApproveRake(selectedRake.planned_rake_id || selectedRake.rake_id);
                    }
                  }}
                  disabled={approvedRakes.has(selectedRake?.planned_rake_id || selectedRake?.rake_id || "")}
                >
                  {approvedRakes.has(selectedRake?.planned_rake_id || selectedRake?.rake_id || "")
                    ? "✅ Already Approved"
                    : "👍 Approve This Rake"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
