import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Warehouse, AlertTriangle, TrendingUp, Zap, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Stockyard, LoadingPoint } from "@shared/api";

export default function StockyardsNew() {
  const { data: sampleDataset } = useQuery({
    queryKey: ["sample-dataset"],
    queryFn: async () => {
      const res = await fetch("/api/sample-dataset");
      return res.json();
    },
  });

  const stockyards: Stockyard[] = sampleDataset?.stockyards || [];
  const loadingPoints: LoadingPoint[] = sampleDataset?.loading_points || [];

  // Calculate usage metrics
  const getStockyardMetrics = (sy: Stockyard) => {
    const lp = loadingPoints.find((l) => l.loading_point_id === sy.loading_point_id);
    const usage = ((sy.available_tonnage - (sy.safety_stock || 0)) / sy.available_tonnage) * 100;
    const isCritical = sy.available_tonnage < (sy.safety_stock || 50) * 2;

    return {
      usage,
      isCritical,
      loadingPoint: lp,
      usableCapacity: sy.available_tonnage - (sy.safety_stock || 0),
    };
  };

  const getRiskLevel = (usage: number, isCritical: boolean) => {
    if (isCritical) return { label: "🚨 CRITICAL", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20" };
    if (usage > 80) return { label: "⚠️ HIGH", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20" };
    if (usage > 60) return { label: "🟡 MODERATE", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/20" };
    return { label: "✅ GOOD", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20" };
  };

  const groupedByMaterial = stockyards.reduce(
    (acc, sy) => {
      if (!acc[sy.material_id]) acc[sy.material_id] = [];
      acc[sy.material_id].push(sy);
      return acc;
    },
    {} as Record<string, Stockyard[]>
  );

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                🏭 Stockyards & Inventory
              </h1>
              <p className="text-muted-foreground">
                Real-time inventory levels and loading capacity across all locations
              </p>
            </div>

            {/* System Health */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Inventory</p>
                    <p className="text-2xl font-bold">
                      {stockyards.reduce((sum, sy) => sum + sy.available_tonnage, 0).toFixed(0)}t
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Usable Stock</p>
                    <p className="text-2xl font-bold">
                      {stockyards
                        .reduce((sum, sy) => sum + Math.max(0, sy.available_tonnage - (sy.safety_stock || 0)), 0)
                        .toFixed(0)}
                      t
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Loading Points</p>
                    <p className="text-2xl font-bold">{loadingPoints.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Materials</p>
                    <p className="text-2xl font-bold">{Object.keys(groupedByMaterial).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottleneck Warnings */}
            {stockyards.some((sy) => getStockyardMetrics(sy).isCritical) && (
              <Alert className="mb-6 bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-400">
                  <strong>⚠️ Bottlenecks Detected:</strong>{" "}
                  {stockyards.filter((sy) => getStockyardMetrics(sy).isCritical).map((sy) => sy.stockyard_id).join(", ")}{" "}
                  are approaching safety stock limits. Consider expediting production or rerouting orders.
                </AlertDescription>
              </Alert>
            )}

            {/* Material Sections */}
            <div className="space-y-8">
              {Object.entries(groupedByMaterial).map(([material, yards]) => (
                <div key={material}>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">{material}</h2>
                    <Badge variant="outline">
                      {yards.reduce((sum, sy) => sum + sy.available_tonnage, 0).toFixed(0)}t total
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {yards.map((sy) => {
                      const metrics = getStockyardMetrics(sy);
                      const risk = getRiskLevel(metrics.usage, metrics.isCritical);

                      return (
                        <Card
                          key={sy.stockyard_id}
                          className={`border-l-4 ${
                            metrics.isCritical
                              ? "border-l-red-500"
                              : metrics.usage > 80
                                ? "border-l-orange-500"
                                : "border-l-green-500"
                          }`}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <CardTitle className="text-lg">{sy.stockyard_id}</CardTitle>
                                <CardDescription>{sy.location}</CardDescription>
                              </div>
                              <Badge className={risk.bg}>{risk.label}</Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Inventory */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Available Stock</span>
                                <span className="font-bold text-primary">
                                  {sy.available_tonnage.toFixed(1)}t
                                </span>
                              </div>
                              <Progress value={Math.min(100, metrics.usage)} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                Safety stock: {sy.safety_stock || 0}t
                              </p>
                            </div>

                            {/* Loading Capacity */}
                            {metrics.loadingPoint && (
                              <div className="bg-secondary/30 rounded-lg p-3">
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-primary" />
                                  Loading Capacity
                                </p>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <p>
                                    <strong>Rate:</strong> {metrics.loadingPoint.loading_rate_tonnes_per_hour}t/hour
                                  </p>
                                  <p>
                                    <strong>Rakes/day:</strong> {metrics.loadingPoint.max_rakes_per_day} max
                                  </p>
                                  <p>
                                    <strong>Hours:</strong> {metrics.loadingPoint.operating_hours_start}:00 —{" "}
                                    {metrics.loadingPoint.operating_hours_end}:00
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Status */}
                            <div className="border-t border-border pt-3">
                              {metrics.isCritical ? (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                  🚨 <strong>Critical:</strong> Approaching safety stock. Need immediate replenishment.
                                </p>
                              ) : metrics.usage > 80 ? (
                                <p className="text-sm text-orange-600 dark:text-orange-400">
                                  ⚠️ <strong>High usage:</strong> Monitor closely. May need additional inventory soon.
                                </p>
                              ) : (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  ✅ <strong>Healthy:</strong> Good inventory level. Ready to ship.
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Efficiency Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <span className="text-green-600 font-bold">→</span>
                  <p className="text-sm">
                    <strong>Bokaro Yard 2 (CRC)</strong> has lowest usage. Prioritize CRC orders from this location to
                    balance inventory.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-600 font-bold">→</span>
                  <p className="text-sm">
                    <strong>Durgapur Yard</strong> has good capacity. Consider routing Kanpur orders from this point to
                    save 400 km of rail distance.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-600 font-bold">→</span>
                  <p className="text-sm">
                    <strong>Loading Point Capacity:</strong> Bokaro LP has highest throughput (120t/hr). Use for urgent orders.
                  </p>
                </div>

                <Button className="w-full mt-4 gap-2" variant="default">
                  <Warehouse className="w-4 h-4" />
                  Apply Efficiency Optimizations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
