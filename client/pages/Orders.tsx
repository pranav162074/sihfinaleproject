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
  Package,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Order, OptimizeRakesResponse } from "@shared/api";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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
    if (priority === 1) return "badge-priority-high";
    if (priority === 2) return "badge-priority-medium";
    return "badge-priority-time-critical";
  };

  const getPriorityEmoji = (priority: number) => {
    if (priority === 1) return "🔥";
    if (priority === 2) return "⭐";
    return "🕒";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 1) return "High Priority";
    if (priority === 2) return "Medium Priority";
    return "Time-Critical";
  };

  const orders: Order[] = sampleDataset?.orders || [];

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Page Header */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-title-lg flex items-center gap-2">
              <span className="text-2xl">📦</span> Customer Orders
            </h1>
            <p className="text-subtitle">
              {orders.length} orders to fulfill · AI recommends the best rake for each
            </p>
          </div>

          {/* Orders List */}
          <div className="space-y-3 animate-scale-in">
            {orders.length === 0 ? (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Loading orders...
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => {
                const slaDeadline = new Date(order.sla_deadline);
                const daysUntilDeadline = Math.ceil(
                  (slaDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const isAtRisk = daysUntilDeadline <= 2;

                return (
                  <div
                    key={order.order_id}
                    className="card-glow p-4 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left Section - Order Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📍</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg">{order.order_id}</h3>
                              <div className={getPriorityColor(order.priority)}>
                                {getPriorityEmoji(order.priority)} {getPriorityLabel(order.priority)}
                              </div>
                              {isAtRisk && (
                                <div className="badge-sla-risk">⏰ Urgent</div>
                              )}
                            </div>

                            {/* Order Details */}
                            <div className="space-y-2 mt-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium text-foreground">{order.destination}</span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Package className="w-4 h-4" />
                                <span>{order.quantity_tonnes}t of {order.material_id}</span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>
                                  Due: {new Date(order.sla_deadline).toLocaleDateString()}
                                  {daysUntilDeadline >= 0 && (
                                    <span className={daysUntilDeadline <= 2 ? "text-red-400 font-semibold ml-2" : "text-green-400 ml-2"}>
                                      ({daysUntilDeadline} days)
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Action */}
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowExplanation(true);
                          }}
                          className="btn-gradient whitespace-nowrap"
                        >
                          Best Fit <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          See AI recommendation
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Best Fit Explanation Drawer */}
      <Sheet open={showExplanation} onOpenChange={setShowExplanation}>
        <SheetContent className="w-full sm:w-[500px] bg-card border-l border-primary/20">
          <SheetHeader>
            <SheetTitle className="text-xl">
              {selectedOrder && `Best Fit for ${selectedOrder.order_id}`}
            </SheetTitle>
            <SheetDescription>
              AI-recommended rake assignment
            </SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="explanation-panel">
              <div className="space-y-6 mt-6">
                {/* AI Recommendation */}
                <div className="frosted-glass p-4 border-l-2 border-primary space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <p className="font-semibold text-foreground">AI Recommendation</p>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    <strong>Rake #001</strong> from <strong>Bokara Yard-2</strong> at <strong>92% utilization</strong> — arrives{" "}
                    <strong>20 hours before</strong> your SLA deadline.
                  </p>
                </div>

                {/* Why This is Best */}
                <div className="space-y-3">
                  <p className="font-semibold text-foreground">Why This Works:</p>

                  <div className="explanation-item">
                    <span className="explanation-item icon">✅</span>
                    <div className="explanation-item text">
                      Same destination as existing orders in Rake #001
                    </div>
                  </div>

                  <div className="explanation-item">
                    <span className="explanation-item icon">💰</span>
                    <div className="explanation-item text">
                      Saves ₹15,200 by grouping with other orders (no separate rake)
                    </div>
                  </div>

                  <div className="explanation-item">
                    <span className="explanation-item icon">📊</span>
                    <div className="explanation-item text">
                      Utilization reaches 92% — less empty wagon space wasted
                    </div>
                  </div>

                  <div className="explanation-item">
                    <span className="explanation-item icon">⏱️</span>
                    <div className="explanation-item text">
                      Arrives 20 hours before deadline — no late penalties
                    </div>
                  </div>

                  <div className="explanation-item">
                    <span className="explanation-item icon">🚆</span>
                    <div className="explanation-item text">
                      100% rail transport — reliable & faster than road
                    </div>
                  </div>
                </div>

                {/* Alternative Options */}
                <div className="space-y-3 pt-4 border-t border-primary/20">
                  <p className="font-semibold text-foreground text-sm">Other Options</p>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded">
                      • <strong>Rake #002:</strong> 78% utilization, arrives 8 hours before deadline (+₹8,500 cost)
                    </div>
                    <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded">
                      • <strong>Road Transport:</strong> Next day delivery (+₹22,000 cost, lower reliability)
                    </div>
                  </div>
                </div>

                {/* Approval Button */}
                <Button
                  className="btn-gradient w-full h-10 mt-6"
                  onClick={() => setShowExplanation(false)}
                >
                  👍 Approve This Assignment
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
