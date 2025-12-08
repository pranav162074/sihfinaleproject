import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, CheckCircle, AlertCircle, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { OptimizeRakesResponse } from "@shared/api";

type OptimizationStatus = "idle" | "running" | "success" | "error";

export default function Optimization() {
  const [costFocus, setCostFocus] = useState(0.6); // 0 = pure SLA, 1 = pure cost
  const [allowMultiDest, setAllowMultiDest] = useState(true);
  const [minUtilization, setMinUtilization] = useState(75);
  const [status, setStatus] = useState<OptimizationStatus>("idle");
  const [result, setResult] = useState<OptimizeRakesResponse | null>(null);
  const [error, setError] = useState<string>("");

  const { data: sampleDataset } = useQuery({
    queryKey: ["sample-dataset"],
    queryFn: async () => {
      const res = await fetch("/api/sample-dataset");
      return res.json();
    },
  });

  const statusMessages = [
    "Checking inventory availability…",
    "Analyzing orders & priorities…",
    "Assigning rakes optimally…",
    "Avoiding delays & penalties…",
    "Maximizing utilization…",
    "Finalizing rake plan…",
  ];

  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  const handleRunOptimization = async () => {
    if (!sampleDataset) {
      setError("Sample data not loaded yet");
      return;
    }

    setStatus("running");
    setError("");
    setResult(null);
    setCurrentStatusIndex(0);

    // Simulate progress through steps
    const progressInterval = setInterval(() => {
      setCurrentStatusIndex((prev) => {
        if (prev >= statusMessages.length - 1) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    try {
      const response = await fetch("/api/optimize-rakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sampleDataset,
          config: {
            cost_vs_sla_weight: costFocus,
            allow_multi_destination_rakes: allowMultiDest,
            min_utilization_percent: minUtilization,
            rail_bias_factor: 1.1,
            optimize_timeout_seconds: 60,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Optimization failed");
      }

      const data = (await response.json()) as OptimizeRakesResponse;
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    } finally {
      clearInterval(progressInterval);
    }
  };

  const slaFocus = 1 - costFocus;

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left: Configuration */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 text-foreground">
                    Optimization Config
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Adjust priorities to find the best plan
                  </p>
                </div>

                {/* Cost vs SLA Focus */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Focus Priority</CardTitle>
                    <CardDescription>Balance cost savings vs on-time delivery</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          💰 Cost ({(costFocus * 100).toFixed(0)}%)
                        </span>
                        <span className="text-sm font-medium">
                          📅 SLA ({(slaFocus * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <Slider
                        value={[costFocus]}
                        onValueChange={([val]) => setCostFocus(val)}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="bg-secondary/50 rounded p-3 text-xs text-muted-foreground">
                      {costFocus > 0.7
                        ? "🎯 Prioritizing cost savings. More rakes may depart with lower utilization if costs are lower."
                        : slaFocus > 0.7
                          ? "🎯 Prioritizing on-time delivery. System will consolidate orders even if costs increase slightly."
                          : "🎯 Balanced approach. Cost and SLA weighted equally."}
                    </div>
                  </CardContent>
                </Card>

                {/* Minimum Utilization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Min. Rake Utilization</CardTitle>
                    <CardDescription>
                      Rakes with lower utilization will not be approved
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{minUtilization}%</span>
                        <span className="text-xs text-muted-foreground">
                          {minUtilization >= 80
                            ? "Very strict"
                            : minUtilization >= 60
                              ? "Standard"
                              : "Flexible"}
                        </span>
                      </div>
                      <Slider
                        value={[minUtilization]}
                        onValueChange={([val]) => setMinUtilization(val)}
                        min={40}
                        max={95}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div className="bg-secondary/50 rounded p-3 text-xs text-muted-foreground">
                      {minUtilization >= 85
                        ? "Very high threshold — fewer rakes approved, higher consolidation"
                        : minUtilization >= 75
                          ? "Standard threshold — good balance between efficiency and flexibility"
                          : "Low threshold — more rakes approved, faster dispatch"}
                    </div>
                  </CardContent>
                </Card>

                {/* Multi-Destination */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Multi-Destination Rakes</CardTitle>
                    <CardDescription>
                      Allow one rake to serve multiple destinations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <span className="text-sm">
                      {allowMultiDest ? "✅ Enabled" : "❌ Disabled"}
                    </span>
                    <Switch checked={allowMultiDest} onCheckedChange={setAllowMultiDest} />
                  </CardContent>
                </Card>

                {/* Run Button */}
                <Button
                  onClick={handleRunOptimization}
                  disabled={status === "running" || !sampleDataset}
                  size="lg"
                  className="w-full h-12 text-base"
                  variant={status === "success" ? "default" : "default"}
                >
                  {status === "running" ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : status === "success" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Re-run Optimization
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Optimization
                    </>
                  )}
                </Button>
              </div>

              {/* Right: Status & Results */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Box */}
                {status !== "idle" && (
                  <Card
                    className={`${
                      status === "success"
                        ? "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20"
                        : status === "error"
                          ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
                          : "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20"
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {status === "success" ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Optimization Complete ✅
                          </>
                        ) : status === "error" ? (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            Optimization Failed ❌
                          </>
                        ) : (
                          <>
                            <Loader className="w-5 h-5 animate-spin text-blue-600" />
                            Running Optimization...
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {status === "running" && (
                        <div className="space-y-2">
                          {statusMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`text-sm flex items-center gap-2 transition-opacity ${
                                idx <= currentStatusIndex
                                  ? "opacity-100 text-foreground"
                                  : "opacity-40 text-muted-foreground"
                              }`}
                            >
                              {idx < currentStatusIndex ? (
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : idx === currentStatusIndex ? (
                                <Loader className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                              ) : (
                                <div className="w-4 h-4 border border-border rounded-full flex-shrink-0" />
                              )}
                              {msg}
                            </div>
                          ))}
                        </div>
                      )}

                      {status === "success" && result && (
                        <div className="space-y-3">
                          <Alert className="bg-green-100/50 border-green-300 dark:bg-green-950/30 dark:border-green-800">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <AlertDescription className="text-green-800 dark:text-green-400">
                              Plan ready for dispatch. Review and approve rakes in the Rake Planner tab.
                            </AlertDescription>
                          </Alert>

                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-green-200 dark:border-green-800">
                            <div>
                              <p className="text-xs text-muted-foreground">Rakes Planned</p>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                {result.planned_rakes.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total Cost</p>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                ₹{(result.kpi_summary.total_cost_optimized / 1000).toFixed(0)}k
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Savings</p>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                ₹{(result.kpi_summary.cost_savings_vs_baseline / 1000).toFixed(0)}k
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">On-Time %</p>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                {result.kpi_summary.on_time_delivery_percent.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {status === "error" && (
                        <Alert className="bg-red-100/50 border-red-300 dark:bg-red-950/30 dark:border-red-800">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <AlertDescription className="text-red-800 dark:text-red-400">
                            {error || "An error occurred during optimization"}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Info Box */}
                {status === "idle" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">How It Works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        🔍 <strong>Analyze:</strong> System scans all pending orders and available rakes
                      </p>
                      <p>
                        🧠 <strong>Optimize:</strong> AI finds the best grouping to minimize cost and maximize on-time delivery
                      </p>
                      <p>
                        ✨ <strong>Explain:</strong> Every decision is explained in plain language
                      </p>
                      <p>
                        ✅ <strong>Approve:</strong> Review and dispatch from the Rake Planner
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Optimization;
