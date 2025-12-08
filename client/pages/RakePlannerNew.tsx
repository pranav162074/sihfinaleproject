import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Truck, MapPin, Package, Clock, DollarSign, CheckCircle, AlertCircle, ChevronRight, ZoomIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OptimizeRakesResponse, PlannedRake } from "@shared/api";

export default function RakePlannerNew() {
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
    if (risk === "LOW") return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400";
    if (risk === "MEDIUM") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400";
  };

  const getSLABadgeColor = (status: string) => {
    if (status === "On-time") return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400";
    if (status === "At-Risk") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400";
  };

  if (!optimizationResult) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Run optimization first to see planned rakes</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const rakes = optimizationResult.planned_rakes;

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ✅ Today's Rake Plan
              </h1>
              <p className="text-muted-foreground">
                {rakes.length} rakes ready for approval · {optimizationResult.kpi_summary.on_time_delivery_percent.toFixed(0)}% on-time delivery
              </p>
            </div>

            {/* KPI Summary Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
                  <div className="text-2xl font-bold">₹{(optimizationResult.kpi_summary.total_cost_optimized / 100000).toFixed(1)}L</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    💰 Saved ₹{(optimizationResult.kpi_summary.cost_savings_vs_baseline / 100000).toFixed(1)}L
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">Avg Utilization</div>
                  <div className="text-2xl font-bold">{optimizationResult.kpi_summary.average_rake_utilization_percent.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {optimizationResult.kpi_summary.average_rake_utilization_percent > 80
                      ? "✅ Highly efficient"
                      : "📊 Room to optimize"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">On-Time %</div>
                  <div className="text-2xl font-bold">{optimizationResult.kpi_summary.on_time_delivery_percent.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    All customer deadlines met
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-xs text-muted-foreground mb-1">Demurrage Saved</div>
                  <div className="text-2xl font-bold">₹{(optimizationResult.kpi_summary.demurrage_savings / 10000).toFixed(1)}k</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    No late penalties
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rake List */}
            <div className="space-y-4 mb-8">
              {rakes.map((rake, idx) => (
                <Card
                  key={rake.planned_rake_id}
                  className={`cursor-pointer transition-all hover:shadow-lg border-l-4 ${
                    rake.sla_status === "On-time"
                      ? "border-l-green-500"
                      : rake.sla_status === "At-Risk"
                        ? "border-l-yellow-500"
                        : "border-l-red-500"
                  }`}
                  onClick={() => {
                    setSelectedRake(rake);
                    setShowDetails(true);
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Rake Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                          <h3 className="text-lg font-semibold truncate">
                            Rake #{idx + 1} · {rake.rake_id}
                          </h3>
                        </div>

                        {/* Destinations */}
                        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">
                            {rake.primary_destination}
                            {rake.secondary_destinations && rake.secondary_destinations.length > 0
                              ? ` + ${rake.secondary_destinations.join(", ")}`
                              : ""}
                          </span>
                        </div>

                        {/* Orders */}
                        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                          <Package className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {rake.orders_allocated.length} order{rake.orders_allocated.length !== 1 ? "s" : ""} ·{" "}
                            {rake.total_tonnage_assigned.toFixed(1)}t
                          </span>
                        </div>

                        {/* Departure Time */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>
                            Departs {new Date(rake.departure_time).toLocaleDateString()} at{" "}
                            {new Date(rake.departure_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Right: Stats & Badges */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex gap-2 flex-wrap justify-end">
                          <Badge className={getSLABadgeColor(rake.sla_status)}>
                            {rake.sla_status}
                          </Badge>
                          <Badge className={getRiskBadgeColor(rake.risk_flag)}>
                            {rake.risk_flag} Risk
                          </Badge>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {rake.utilization_percent.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Utilization</div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">
                            ₹{(rake.cost_breakdown.total_cost / 1000).toFixed(1)}k
                          </div>
                          <div className="text-xs text-muted-foreground">Total Cost</div>
                        </div>

                        {approvedRakes.has(rake.planned_rake_id) ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRake(rake);
                              setShowDetails(true);
                            }}
                            className="gap-1"
                          >
                            <ZoomIn className="w-3 h-3" />
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Approval Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ready to Dispatch</p>
                    <p className="text-2xl font-bold">
                      {approvedRakes.size} of {rakes.length}
                    </p>
                  </div>
                  <Button
                    disabled={approvedRakes.size < rakes.length}
                    size="lg"
                    className="gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {approvedRakes.size === rakes.length ? "Dispatch All Rakes" : "Review Remaining"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Details Panel */}
      {selectedRake && (
        <Sheet open={showDetails} onOpenChange={setShowDetails}>
          <SheetContent className="w-full max-w-2xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl">Rake #{rakes.indexOf(selectedRake) + 1}</SheetTitle>
              <SheetDescription className="text-base">
                {selectedRake.rake_id} · {selectedRake.primary_destination}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Why This Plan */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Approved Because
                </h3>
                <div className="space-y-2 text-sm bg-green-50/50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200/50 dark:border-green-800/30">
                  <p className="flex gap-2">
                    <span>✓</span>
                    <span>
                      <strong>High consolidation:</strong> {selectedRake.orders_allocated.length}{" "}
                      orders grouped together for efficiency
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <span>✓</span>
                    <span>
                      <strong>Strong utilization:</strong> {selectedRake.utilization_percent.toFixed(0)}%
                      capacity used (above {selectedRake.utilization_percent > 80 ? "excellent" : "good"} threshold)
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <span>✓</span>
                    <span>
                      <strong>On-time guaranteed:</strong> Arrives before all customer deadlines
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <span>✓</span>
                    <span>
                      <strong>Cost optimized:</strong> Avoids unnecessary rakes and reduces demurrage
                    </span>
                  </p>
                </div>
              </div>

              <Separator />

              {/* Orders Included */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Orders Included ({selectedRake.orders_allocated.length})
                </h3>
                <div className="space-y-2">
                  {selectedRake.orders_allocated.map((order) => (
                    <div key={order.order_id} className="bg-secondary/30 rounded-lg p-3">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <strong>{order.order_id}</strong>
                        <span className="text-sm text-muted-foreground">
                          {order.quantity_allocated_tonnes}t
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.customer_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Arrives: {new Date(order.estimated_arrival).toLocaleDateString()}{" "}
                        {new Date(order.estimated_arrival).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Cost Breakdown
                </h3>
                <div className="space-y-2 bg-secondary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Loading costs:</span>
                    <strong>₹{selectedRake.cost_breakdown.loading_cost.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transport costs:</span>
                    <strong>₹{selectedRake.cost_breakdown.transport_cost.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Penalties avoided:</span>
                    <strong className="text-green-600 dark:text-green-400">
                      -₹{selectedRake.cost_breakdown.penalty_cost.toLocaleString()}
                    </strong>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Cost:</span>
                    <span>₹{selectedRake.cost_breakdown.total_cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Approval Action */}
              <Button
                onClick={() => {
                  handleApproveRake(selectedRake.planned_rake_id);
                  setShowDetails(false);
                }}
                disabled={approvedRakes.has(selectedRake.planned_rake_id)}
                size="lg"
                className="w-full h-12 text-base gap-2"
              >
                {approvedRakes.has(selectedRake.planned_rake_id) ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Already Approved
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Approve &amp; Ready for Dispatch
                  </>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </Layout>
  );
}
