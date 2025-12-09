import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function Settings() {
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

  const getRiskLabel = (value: number) => {
    if (value < 30) return "Conservative";
    if (value < 70) return "Moderate";
    return "Aggressive";
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Page Header */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-title-lg flex items-center gap-2">
              <span className="text-2xl">⚙️</span> Business Settings
            </h1>
            <p className="text-subtitle">
              Customize how OptiRake plans rakes for your operations
            </p>
          </div>

          {/* Save Notification */}
          {saved && (
            <Alert className="border-green-500/30 bg-green-500/10 animate-scale-in">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                ✅ Settings saved successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Settings Panels */}
          <div className="space-y-4 animate-slide-in-right">
            {/* Utilization Settings */}
            <div className="card-glow p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Minimum Rake Utilization</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    How full should rakes be before approval?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{minUtilization}%</span>
                  <span className="text-xs text-muted-foreground">
                    {minUtilization < 60 ? "Lenient" : minUtilization < 80 ? "Standard" : "Strict"}
                  </span>
                </div>
                <Slider
                  value={[minUtilization]}
                  onValueChange={(v) => setMinUtilization(v[0])}
                  min={40}
                  max={95}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="frosted-glass p-4 space-y-2 text-sm">
                <p className="text-foreground/90">
                  {minUtilization < 60
                    ? "🚀 Lenient: Dispatch faster with partially loaded rakes. Good for high-frequency orders."
                    : minUtilization < 80
                      ? "⚖️ Standard: Balanced—good consolidation without long wait times."
                      : "🎯 Strict: Maximize efficiency but orders may wait longer for full rakes."}
                </p>
                <div className="text-xs text-muted-foreground space-y-1 mt-2 pt-2 border-t border-primary/20">
                  <p>
                    • <strong>40%:</strong> Dispatch almost immediately (more rakes, faster delivery)
                  </p>
                  <p>
                    • <strong>75%:</strong> Recommended default (good balance)
                  </p>
                  <p>
                    • <strong>95%:</strong> Wait for full rakes (fewer rakes, maximum efficiency)
                  </p>
                </div>
              </div>
            </div>

            {/* Rail Preference */}
            <div className="card-glow p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚆</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Prefer Rail Transport</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    System will favor rail when costs are comparable
                  </p>
                </div>
                <Switch checked={enableRailBias} onCheckedChange={setEnableRailBias} size="lg" />
              </div>

              {enableRailBias && (
                <div className="frosted-glass p-4 border-l-2 border-primary space-y-2 text-sm">
                  <p className="text-foreground/90">
                    ✅ <strong>Enabled:</strong> Rail is more reliable, cheaper at scale, and eco-friendly. OptiRake will choose rail whenever the cost difference is &lt; 15%.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Typical savings: 20–30% vs all-road shipping
                  </p>
                </div>
              )}

              {!enableRailBias && (
                <div className="frosted-glass p-4 border-l-2 border-amber-500 space-y-2 text-sm">
                  <p className="text-foreground/90">
                    ⚠️ <strong>Disabled:</strong> OptiRake will use road transport more freely. Good for urgent orders but typically 30–40% more expensive.
                  </p>
                </div>
              )}
            </div>

            {/* Multi-Destination Rakes */}
            <div className="card-glow p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚚</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Allow Multi-Destination Rakes</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    One rake can serve multiple cities in sequence
                  </p>
                </div>
                <Switch checked={allowMultiDest} onCheckedChange={setAllowMultiDest} size="lg" />
              </div>

              {allowMultiDest && (
                <div className="frosted-glass p-4 border-l-2 border-primary space-y-2 text-sm">
                  <p className="text-foreground/90">
                    ✅ <strong>Enabled:</strong> One rake stops at multiple cities. Improves consolidation but adds routing complexity and may slightly increase delivery time.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best for regional clusters with similar delivery windows
                  </p>
                </div>
              )}

              {!allowMultiDest && (
                <div className="frosted-glass p-4 border-l-2 border-amber-500 space-y-2 text-sm">
                  <p className="text-foreground/90">
                    🎯 <strong>Disabled:</strong> Each rake serves one destination only. Simpler routing but may require more rakes.
                  </p>
                </div>
              )}
            </div>

            {/* Risk Tolerance */}
            <div className="card-glow p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Risk Tolerance</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    How aggressively should OptiRake optimize for cost?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{getRiskLabel(riskTolerance)}</span>
                  <span className="text-xs text-muted-foreground">{riskTolerance}%</span>
                </div>
                <Slider
                  value={[riskTolerance]}
                  onValueChange={(v) => setRiskTolerance(v[0])}
                  min={0}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
              </div>

              <div className="frosted-glass p-4 space-y-2 text-sm">
                <p className="text-foreground/90">
                  {riskTolerance < 30
                    ? "🛡️ Conservative: Prioritize meeting SLA deadlines. Rarely accepts risky plans."
                    : riskTolerance < 70
                      ? "⚖️ Moderate: Mix cost savings with deadline reliability."
                      : "💰 Aggressive: Maximize cost savings even if it means tighter schedules."}
                </p>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-primary/20">
                  Higher tolerance means accepting plans with slightly higher delay probability if they save significant cost.
                </p>
              </div>
            </div>

            {/* Auto-Dispatch */}
            <div className="card-glow p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Auto-Dispatch Approved Rakes</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically dispatch without manual confirmation
                  </p>
                </div>
                <Switch checked={autoDispatch} onCheckedChange={setAutoDispatch} size="lg" />
              </div>

              {autoDispatch && (
                <Alert className="border-amber-500/30 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <AlertDescription className="text-amber-300">
                    ⚠️ <strong>Enabled:</strong> Approved rakes will dispatch immediately. Disable if you need manual review before dispatch.
                  </AlertDescription>
                </Alert>
              )}

              {!autoDispatch && (
                <div className="frosted-glass p-4 border-l-2 border-primary space-y-2 text-sm">
                  <p className="text-foreground/90">
                    👤 <strong>Manual Review Required:</strong> You must review and approve each rake before dispatch.
                  </p>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="card-glow p-6 border-primary/30 space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-bold">Quick Tips</h3>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    <li>• <strong>First time?</strong> Use defaults and monitor for 1 week</li>
                    <li>• <strong>High cost pressure?</strong> Increase utilization % and risk tolerance</li>
                    <li>• <strong>SLA-critical orders?</strong> Lower risk tolerance and utilization %</li>
                    <li>• <strong>Regional hubs?</strong> Enable multi-destination rakes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-gradient-to-t from-background to-transparent pt-4 pb-4">
            <Button
              onClick={handleSave}
              className="btn-gradient flex-1 h-12"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 border-primary/30 hover:border-primary/60 hover:bg-primary/10"
              onClick={() => {
                setMinUtilization(75);
                setEnableRailBias(true);
                setAllowMultiDest(true);
                setRiskTolerance(50);
                setAutoDispatch(false);
                handleSave();
              }}
            >
              Reset Defaults
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
