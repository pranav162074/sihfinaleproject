import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Settings() {
  const [minUtilization, setMinUtilization] = useState(86);
  const [maxRakesPerDay, setMaxRakesPerDay] = useState(3);
  const [costWeight, setCostWeight] = useState(0.6);
  const [slaWeight, setSlaWeight] = useState(0.4);

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Settings</h1>
            <p className="text-lg text-muted-foreground">Configure optimization constraints</p>
          </div>

          <div className="card-glow p-8 space-y-6">
            {/* Min Rake Utilization */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Minimum Rake Utilization (%)
              </label>
              <input
                type="number"
                value={minUtilization}
                onChange={(e) => setMinUtilization(Number(e.target.value))}
                min="60"
                max="95"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">Rakes must reach this utilization threshold</p>
            </div>

            {/* Max Rakes Per Day */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Max Rakes Per Day
              </label>
              <input
                type="number"
                value={maxRakesPerDay}
                onChange={(e) => setMaxRakesPerDay(Number(e.target.value))}
                min="1"
                max="10"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">Maximum number of rakes to form daily</p>
            </div>

            {/* Cost Weight */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Cost Optimization Weight ({costWeight.toFixed(1)})
              </label>
              <input
                type="range"
                value={costWeight}
                onChange={(e) => setCostWeight(Number(e.target.value))}
                min="0"
                max="1"
                step="0.1"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Higher = prioritize cost savings</p>
            </div>

            {/* SLA Weight */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                SLA Compliance Weight ({slaWeight.toFixed(1)})
              </label>
              <input
                type="range"
                value={slaWeight}
                onChange={(e) => setSlaWeight(Number(e.target.value))}
                min="0"
                max="1"
                step="0.1"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Higher = prioritize meeting deadlines</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="btn-gradient">Save Changes</Button>
              <Button variant="outline">Reset to Default</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
