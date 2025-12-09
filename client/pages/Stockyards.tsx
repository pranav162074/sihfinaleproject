import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Warehouse,
  AlertTriangle,
  TrendingUp,
  Zap,
  Package,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Stockyard, LoadingPoint } from "@shared/api";

export default function Stockyards() {
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
    const usableCapacity = sy.available_tonnage - (sy.safety_stock || 0);
    const usage = ((sy.available_tonnage - usableCapacity) / sy.available_tonnage) * 100;
    const isCritical = usableCapacity < (sy.safety_stock || 50) * 2;

    return {
      usage: Math.max(0, usage),
      usableCapacity: Math.max(0, usableCapacity),
      isCritical,
      available: Math.max(0, usableCapacity),
    };
  };

  const getRiskStatus = (metrics: ReturnType<typeof getStockyardMetrics>) => {
    if (metrics.isCritical) {
      return {
        label: "🚨 CRITICAL",
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        emoji: "🚨",
        description: "Running low — needs urgent restocking",
      };
    }
    if (metrics.usableCapacity < 200) {
      return {
        label: "⚠️ URGENT",
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        emoji: "⚠️",
        description: "Getting tight — plan restocking soon",
      };
    }
    if (metrics.usage > 70) {
      return {
        label: "🟡 MODERATE",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        emoji: "🟡",
        description: "Normal levels — monitor capacity",
      };
    }
    return {
      label: "✅ HEALTHY",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      emoji: "✅",
      description: "Plenty of capacity available",
    };
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
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Page Header */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-title-lg flex items-center gap-2">
              <span className="text-2xl">🏭</span> Stockyard Inventory
            </h1>
            <p className="text-subtitle">
              {stockyards.length} stockyards · Monitor capacity and material availability
            </p>
          </div>

          {/* Efficiency CTA */}
          <div className="card-glow p-6 border-primary/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg">🎯 Smart Allocation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get AI suggestion for most efficient stockyard to ship from today
              </p>
            </div>
            <Button className="btn-gradient whitespace-nowrap">
              Suggest Best Stockyard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Stockyards by Material */}
          {Object.entries(groupedByMaterial).length === 0 ? (
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-6 text-center text-muted-foreground">
                Loading stockyard data...
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedByMaterial).map(([materialId, yards]) => (
              <div key={materialId} className="space-y-4">
                {/* Material Section Header */}
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">
                    📋 {materialId}
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    {yards.length} location{yards.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Stockyard Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-scale-in">
                  {yards.map((sy) => {
                    const metrics = getStockyardMetrics(sy);
                    const riskStatus = getRiskStatus(metrics);
                    const lp = loadingPoints.find(
                      (l) => l.loading_point_id === sy.loading_point_id
                    );

                    return (
                      <div
                        key={sy.stockyard_id}
                        className={`card-glow p-5 space-y-4 border-2 ${riskStatus.borderColor}`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-base">
                              📍 {sy.stockyard_name || "Stockyard"}
                            </h3>
                            {lp && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {lp.location_name}
                              </p>
                            )}
                          </div>
                          <div className={`text-sm font-semibold px-3 py-1 rounded-full ${riskStatus.bgColor} ${riskStatus.color}`}>
                            {riskStatus.emoji} {riskStatus.label}
                          </div>
                        </div>

                        {/* Capacity Display */}
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <p className="text-sm text-muted-foreground">Available Capacity</p>
                            <p className="text-lg font-bold text-primary">
                              {metrics.available.toFixed(0)}t
                            </p>
                          </div>
                          <Progress
                            value={Math.min(metrics.usage, 100)}
                            className="h-2 bg-muted"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{metrics.usage.toFixed(0)}% used</span>
                            <span className={metrics.available < 200 ? "text-orange-400" : "text-green-400"}>
                              {metrics.available < 200 ? "⚠️ Getting tight" : "✅ Good"}
                            </span>
                          </div>
                        </div>

                        {/* Capacity Breakdown */}
                        <div className="frosted-glass p-3 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Capacity:</span>
                            <span className="text-foreground font-medium">
                              {sy.available_tonnage}t
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Safety Stock:</span>
                            <span className="text-foreground font-medium">
                              {sy.safety_stock || 0}t
                            </span>
                          </div>
                        </div>

                        {/* Status Message */}
                        <Alert
                          className={`border-0 ${riskStatus.bgColor}`}
                        >
                          <AlertTriangle className={`h-4 w-4 ${riskStatus.color}`} />
                          <AlertDescription className={riskStatus.color}>
                            {riskStatus.description}
                          </AlertDescription>
                        </Alert>

                        {/* Action */}
                        {metrics.isCritical && (
                          <Button
                            variant="destructive"
                            className="w-full"
                            size="sm"
                          >
                            Order Restock Now
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Key Insights */}
          <div className="card-glow p-6 space-y-4 border-primary/30">
            <h3 className="font-bold text-lg">💡 Key Insights</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span className="text-foreground/80">
                  Most full: <strong>Bokara Yard-1</strong> (92% capacity)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">→</span>
                <span className="text-foreground/80">
                  Most available: <strong>Delhi Warehouse</strong> (850 tonnes ready to ship)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400">⚠️</span>
                <span className="text-foreground/80">
                  One location needs urgent restocking — plan delivery ASAP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
