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
import { Lightbulb, Package, MapPin, Clock, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Order, OptimizeRakesResponse, RailVsRoadAssignment } from "@shared/api";

export default function OrdersNew() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<RailVsRoadAssignment | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const { data: sampleDataset } = useQuery({
    queryKey: ["sample-dataset"],
    queryFn: async () => {
      const res = await fetch("/api/sample-dataset");
      return res.json();
    },
  });

  const { data: optimizationResult } = useQuery({
    queryKey: ["optimization-for-orders"],
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

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400";
    if (priority === 2) return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400";
    if (priority <= 3) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400";
    return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400";
  };

  const getModeColor = (mode?: string) => {
    if (mode === "rail") return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400";
    if (mode === "road") return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400";
    return "bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-400";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 1) return "🚨 CRITICAL";
    if (priority === 2) return "🔴 HIGH";
    if (priority === 3) return "🟡 MEDIUM";
    if (priority === 4) return "🔵 LOW";
    return "⚪ MINIMAL";
  };

  const orders = sampleDataset?.orders || [];

  if (!sampleDataset || !optimizationResult) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading orders...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getAssignmentForOrder = (orderId: string) => {
    return optimizationResult.rail_vs_road_assignment.find(
      (a) => a.order_id === orderId
    );
  };

  const getRakeForOrder = (orderId: string) => {
    const assignment = getAssignmentForOrder(orderId);
    if (!assignment || !assignment.assigned_rake_id) return null;
    return optimizationResult.planned_rakes.find(
      (r) => r.planned_rake_id === assignment.assigned_rake_id
    );
  };

  const handleShowRecommendation = (order: Order) => {
    const assignment = getAssignmentForOrder(order.order_id);
    setSelectedOrder(order);
    setSelectedAssignment(assignment || null);
    setShowRecommendation(true);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                📦 Customer Orders
              </h1>
              <p className="text-muted-foreground">
                {orders.length} pending orders · Click any order to see the best way to ship it
              </p>
            </div>

            {/* Filter Summary */}
            <Card className="mb-6 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400">
                    All Orders
                  </Badge>
                  <Badge variant="outline">
                    Priority-1: {orders.filter((o) => o.priority === 1).length}
                  </Badge>
                  <Badge variant="outline">
                    Prefer Rail: {orders.filter((o) => o.preferred_mode === "rail").length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Orders Grid */}
            <div className="space-y-3 mb-8">
              {orders.map((order, idx) => {
                const assignment = getAssignmentForOrder(order.order_id);
                const rake = getRakeForOrder(order.order_id);
                const dueDate = new Date(order.due_date);
                const now = new Date();
                const hoursUntilDue = (dueDate.getTime() - now.getTime()) / 3600000;

                return (
                  <Card
                    key={order.order_id}
                    className="hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleShowRecommendation(order)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <Package className="w-5 h-5 text-primary flex-shrink-0" />
                            <h3 className="text-lg font-semibold">{order.order_id}</h3>
                            <Badge className={getPriorityColor(order.priority)}>
                              {getPriorityLabel(order.priority)}
                            </Badge>
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{order.customer_id}</span>
                              <span>•</span>
                              <span>{order.material_id}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span>{order.destination}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>
                                Due: {dueDate.toLocaleDateString()} at{" "}
                                {dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {hoursUntilDue < 72 && (
                                <Badge
                                  className={
                                    hoursUntilDue < 24
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {hoursUntilDue < 24 ? "🚨 URGENT" : "⚠️ SOON"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Quantity */}
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">
                            {order.quantity_tonnes}
                          </div>
                          <div className="text-xs text-muted-foreground">tonnes</div>
                        </div>

                        {/* Right: Mode & CTA */}
                        <div className="flex flex-col items-end gap-3">
                          <Badge className={getModeColor(order.preferred_mode)}>
                            {order.preferred_mode === "rail"
                              ? "🚂 Rail Preferred"
                              : order.preferred_mode === "road"
                                ? "🚚 Road Preferred"
                                : "↔️ Either Mode"}
                          </Badge>

                          {assignment && (
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                {assignment.assigned_mode === "rail" ? "🚂 Rail" : "🚚 Road"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {assignment.assigned_rake_id
                                  ? `${assignment.assigned_rake_id}`
                                  : "Multiple trucks"}
                              </div>
                            </div>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowRecommendation(order);
                            }}
                            className="gap-1"
                          >
                            <Lightbulb className="w-4 h-4" />
                            See Best Fit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Panel */}
      {selectedOrder && selectedAssignment && (
        <Sheet open={showRecommendation} onOpenChange={setShowRecommendation}>
          <SheetContent className="w-full max-w-2xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl">{selectedOrder.order_id}</SheetTitle>
              <SheetDescription className="text-base">
                {selectedOrder.customer_id} · {selectedOrder.quantity_tonnes} tonnes of{" "}
                {selectedOrder.material_id}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Recommendation Alert */}
              <Alert className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <Lightbulb className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-400">
                  <strong>Best Fit:</strong> This order will be shipped via{" "}
                  <strong>{selectedAssignment.assigned_mode === "rail" ? "RAIL" : "ROAD"}</strong>.
                </AlertDescription>
              </Alert>

              {/* Main Explanation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/30">
                <p className="text-base leading-relaxed">
                  {selectedAssignment.assigned_mode === "rail" ? (
                    <>
                      <strong>Your order will fit best in{" "}
                      {getRakeForOrder(selectedOrder.order_id)?.planned_rake_id}.</strong> This rake is
                      already heading to <strong>{getRakeForOrder(selectedOrder.order_id)?.primary_destination}</strong> and can
                      accommodate your {selectedOrder.quantity_tonnes} tonnes at{" "}
                      <strong>{getRakeForOrder(selectedOrder.order_id)?.utilization_percent.toFixed(0)}% utilization</strong>, which
                      is highly efficient. Your order will reach{" "}
                      <strong>{selectedOrder.destination}</strong> on{" "}
                      <strong>
                        {new Date(selectedAssignment.expected_arrival_date).toLocaleDateString()}
                      </strong>
                      , which is <strong>1.2 days before</strong> your due date. This saves you from
                      any late penalties.
                    </>
                  ) : (
                    <>
                      <strong>Road transport is the optimal choice</strong> for your order. We've
                      reserved <strong>{selectedAssignment.planned_truck_batches} truck batch(es)</strong> for
                      your {selectedOrder.quantity_tonnes} tonnes of {selectedOrder.material_id}. Your order
                      will be picked up and headed to <strong>{selectedOrder.destination}</strong>, arriving
                      on <strong>{new Date(selectedAssignment.expected_arrival_date).toLocaleDateString()}</strong>,
                      which is <strong>2+ days early</strong> of your deadline.
                    </>
                  )}
                </p>
              </div>

              {/* Why This Option */}
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Why This Option
                </h3>
                <ul className="space-y-2 text-sm">
                  {selectedAssignment.assigned_mode === "rail" ? (
                    <>
                      <li className="flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>Cost efficient:</strong> Rail is ₹30-50/tonne cheaper than road for
                          this distance
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>On-time guaranteed:</strong> Arrives before your SLA deadline with
                          safety buffer
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>Consolidated:</strong> Grouped with other orders to same destination,
                          maximizing efficiency
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>Environmentally better:</strong> Rail has lower carbon footprint per
                          tonne
                        </span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>Speed:</strong> Direct point-to-point, arrives in ~{Math.round(selectedAssignment.expected_arrival_date ? (new Date(selectedAssignment.expected_arrival_date).getTime() - new Date().getTime()) / 3600000 : 24)} hours
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>Flexibility:</strong> Can depart anytime, no rail schedule constraints
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>Your preference:</strong> Matches your preferred shipping mode
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 bg-secondary/30 rounded-lg p-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expected Arrival</p>
                  <p className="font-semibold text-sm">
                    {new Date(selectedAssignment.expected_arrival_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {Math.round((new Date(selectedOrder.due_date).getTime() - new Date(selectedAssignment.expected_arrival_date).getTime()) / (24 * 3600000))} days early
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                  <p className="font-semibold text-sm">
                    {selectedAssignment.confidence_percent}%
                  </p>
                  <p className="text-xs text-muted-foreground">Likelihood of success</p>
                </div>
              </div>

              {/* Approve CTA */}
              <Button size="lg" className="w-full h-12 text-base gap-2">
                <CheckCircle className="w-5 h-5" />
                Approve This Assignment
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </Layout>
  );
}
