import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, Package, Lightbulb, CheckCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/api";

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { data: sampleDataset } = useQuery({
    queryKey: ["sample-dataset"],
    queryFn: async () => {
      const res = await fetch("/api/sample-dataset");
      return res.json();
    },
  });

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return "badge-priority-high";
    if (priority === 2) return "badge-priority-medium";
    return "badge-priority-time-critical";
  };

  const getPriorityLabel = (priority: number) => {
    if (priority === 1) return "High";
    if (priority === 2) return "Medium";
    return "Low";
  };

  const orders: Order[] = sampleDataset?.orders || [];

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground">Customer Orders</h1>
            <p className="text-lg text-muted-foreground">
              {orders.length} pending orders waiting for the best rake assignment
            </p>
          </div>

          {/* Orders Table */}
          <div className="card-glow overflow-hidden animate-scale-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-primary/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Destination
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Material
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Qty (tonnes)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No orders loaded. Go to Data Input to upload order data.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const dueDate = new Date(order.due_date);
                      const daysUntil = Math.ceil(
                        (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <tr key={order.order_id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-foreground">{order.order_id}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="text-foreground">{order.destination}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-foreground text-sm">{order.material_id}</td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-foreground">{order.quantity_tonnes}t</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={getPriorityColor(order.priority)}>
                              {getPriorityLabel(order.priority)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-foreground font-medium">
                                {dueDate.toLocaleDateString()}
                              </p>
                              <p
                                className={`text-xs mt-0.5 ${
                                  daysUntil <= 2 ? "text-red-400" : "text-green-400"
                                }`}
                              >
                                {daysUntil > 0 ? `${daysUntil} days` : "Overdue"}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowExplanation(true);
                              }}
                              className="btn-gradient text-xs h-8 gap-1"
                            >
                              Best Fit <ArrowRight className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          {orders.length > 0 && (
            <div className="card-glow p-6 border-primary/30 space-y-3">
              <p className="text-sm text-foreground/80">
                <strong>How it works:</strong> Click "Best Fit" for any order to see which rake it should go into 
                and why. The system recommends the best assignment based on cost, delivery time, and wagon availability.
              </p>
            </div>
          )}
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
              AI-recommended rake assignment with reasoning
            </SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-6">
              {/* Order Summary */}
              <div className="frosted-glass p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Order Details</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-medium text-foreground">{selectedOrder.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium text-foreground">{selectedOrder.customer_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Material:</span>
                    <span className="font-medium text-foreground">{selectedOrder.material_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium text-foreground">{selectedOrder.quantity_tonnes}t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination:</span>
                    <span className="font-medium text-foreground">{selectedOrder.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedOrder.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="border-l-2 border-primary pl-4 py-2 space-y-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Allocation Details</p>
                    <p className="text-sm text-foreground/80 mt-2">
                      This order will be assigned to an optimal rake based on destination, material compatibility, priority, and delivery timelines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Why This Works */}
              <div className="space-y-3">
                <p className="font-semibold text-foreground text-sm">Why This Allocation</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80">
                      <strong>Destination Matching:</strong> Grouped with other {selectedOrder.destination}-bound orders
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80">
                      <strong>Material Compatibility:</strong> {selectedOrder.material_id} fits in assigned wagon type
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80">
                      <strong>Priority Handling:</strong> {selectedOrder.priority === 1 ? "High-priority order planned first" : "Scheduled efficiently with other orders"}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80">
                      <strong>SLA Compliance:</strong> Scheduled to arrive before your due date
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300 text-sm">
                  This assignment will be included in your final Rake Plan. Approve it in the Rake Planner tab.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
