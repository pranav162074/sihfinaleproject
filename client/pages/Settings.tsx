import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, AlertCircle, CheckCircle, Lock } from "lucide-react";

export default function SettingsNew() {
  const [minUtilization, setMinUtilization] = useState(75);
  const [enableRailBias, setEnableRailBias] = useState(true);
  const [allowMultiDest, setAllowMultiDest] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="min-h-full bg-gradient-to-b from-background to-secondary/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Settings className="w-8 h-8 text-primary" />
                Optimization Settings
              </h1>
              <p className="text-muted-foreground">
                Customize OptiRake behavior to match your business needs
              </p>
            </div>

            {/* Save Alert */}
            {saved && (
              <Alert className="mb-6 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-400">
                  Settings saved successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Settings Sections */}
            <div className="space-y-6 mb-8">
              {/* Utilization Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎯 Rake Utilization Rules</CardTitle>
                  <CardDescription>
                    Control how full rakes need to be before approval
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Minimum Utilization %</label>
                      <Badge variant="outline">{minUtilization}%</Badge>
                    </div>

                    <Slider
                      value={[minUtilization]}
                      onValueChange={([val]) => setMinUtilization(val)}
                      min={40}
                      max={95}
                      step={5}
                      className="w-full"
                    />

                    <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/30">
                      <p className="text-sm text-muted-foreground">
                        <strong>What it does:</strong> Higher values mean rakes must be fuller before
                        approval. This reduces the number of rakes but may delay dispatch.
                      </p>
                      <div className="mt-2 space-y-1 text-xs">
                        <p>
                          • <strong>40%:</strong> Very flexible—approves partially loaded rakes quickly
                        </p>
                        <p>
                          • <strong>75%:</strong> Standard—good balance between speed and efficiency
                        </p>
                        <p>
                          • <strong>95%:</strong> Strict—maximizes efficiency but takes longer
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Mode Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🚂 Rail vs Road Preferences</CardTitle>
                  <CardDescription>
                    Guide the system toward your preferred shipping modes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Prefer Rail Transport</p>
                      <p className="text-xs text-muted-foreground">
                        System will favor rail when costs are comparable
                      </p>
                    </div>
                    <Switch checked={enableRailBias} onCheckedChange={setEnableRailBias} />
                  </div>

                  {enableRailBias && (
                    <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200/50 dark:border-green-800/30 text-sm text-muted-foreground">
                      ✅ Rail preference enabled. This reduces carbon footprint and is often cheaper at
                      scale.
                    </div>
                  )}

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Allow Multi-Destination Rakes</p>
                      <p className="text-xs text-muted-foreground">
                        One rake can serve multiple cities in sequence
                      </p>
                    </div>
                    <Switch checked={allowMultiDest} onCheckedChange={setAllowMultiDest} />
                  </div>

                  {allowMultiDest && (
                    <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200/50 dark:border-green-800/30 text-sm text-muted-foreground">
                      ✅ Multi-destination enabled. Improves consolidation but may add routing complexity.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Risk Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚡ Risk Tolerance</CardTitle>
                  <CardDescription>
                    How aggressively should OptiRake push for cost savings?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Risk Tolerance</label>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            riskTolerance < 30
                              ? "bg-green-100 text-green-800"
                              : riskTolerance < 70
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {riskTolerance < 30
                            ? "Conservative"
                            : riskTolerance < 70
                              ? "Moderate"
                              : "Aggressive"}
                        </Badge>
                      </div>
                    </div>

                    <Slider
                      value={[riskTolerance]}
                      onValueChange={([val]) => setRiskTolerance(val)}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                    />

                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="text-center">
                        <p className="font-semibold">Conservative</p>
                        <p>Minimize delays</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Moderate</p>
                        <p>Balanced</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Aggressive</p>
                        <p>Maximize savings</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/30">
                    <p className="text-sm text-muted-foreground">
                      <strong>What it means:</strong> Higher risk tolerance allows OptiRake to accept
                      orders with slightly higher delay probability if they significantly reduce cost. Lower
                      tolerance prioritizes SLA compliance.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Advanced Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔧 Advanced Options</CardTitle>
                  <CardDescription>
                    For experienced users only
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Auto-Dispatch Approved Rakes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Automatically dispatch rakes without manual confirmation
                      </p>
                    </div>
                    <Switch checked={autoDispatch} onCheckedChange={setAutoDispatch} />
                  </div>

                  {autoDispatch && (
                    <Alert className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <AlertDescription className="text-orange-800 dark:text-orange-400">
                        ⚠️ Auto-dispatch is enabled. Rakes will be dispatched immediately after
                        optimization. Disable if you need manual approval.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Info Box */}
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Start with the default settings (75% utilization, rail preference,
                    conservative risk). Monitor results for a week, then adjust based on your KPIs.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button size="lg" onClick={handleSave} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                Reset to Defaults
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
