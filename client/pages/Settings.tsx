import { Layout } from "@/components/Layout";
import { useState } from "react";

export default function Settings() {
  const [multiDestination, setMultiDestination] = useState(true);
  const [minUtilization, setMinUtilization] = useState(80);
  const [maxRakesPerDay, setMaxRakesPerDay] = useState(9);
  const [optimizationFocus, setOptimizationFocus] = useState("cost");

  return (
    <Layout>
      <div className="max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure business rules and optimization constraints
          </p>
        </div>

        {/* Optimization Focus */}
        <SettingSection
          title="Optimization Focus"
          description="Choose the primary objective for dispatch optimization"
        >
          <div className="space-y-4">
            {[
              {
                value: "cost",
                label: "Minimize Cost",
                description:
                  "Prioritize reducing freight and operational costs",
              },
              {
                value: "sla",
                label: "Maximize SLA Compliance",
                description: "Prioritize on-time delivery and customer satisfaction",
              },
              {
                value: "utilization",
                label: "Maximize Utilization",
                description: "Prioritize maximizing rake and wagon utilization",
              },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-start gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
              >
                <input
                  type="radio"
                  name="optimization"
                  value={option.value}
                  checked={optimizationFocus === option.value}
                  onChange={(e) => setOptimizationFocus(e.target.value)}
                  className="mt-1 w-4 h-4 accent-primary"
                />
                <div>
                  <p className="font-semibold text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </SettingSection>

        {/* Rake Configuration */}
        <SettingSection
          title="Rake Configuration"
          description="Define how rakes are formed and dispatched"
        >
          <div className="space-y-6">
            {/* Multi-Destination Toggle */}
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
              <div>
                <p className="font-semibold text-foreground">
                  Allow Multi-Destination Rakes
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow a single rake to serve multiple customer destinations
                </p>
              </div>
              <button
                onClick={() => setMultiDestination(!multiDestination)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  multiDestination
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    multiDestination ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Minimum Utilization Slider */}
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-foreground">
                  Minimum Rake Utilization
                </p>
                <span className="text-2xl font-bold text-primary">
                  {minUtilization}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Do not dispatch rakes below this utilization threshold
              </p>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={minUtilization}
                onChange={(e) => setMinUtilization(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>60%</span>
                <span>95%</span>
              </div>
            </div>

            {/* Max Rakes Per Day */}
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-foreground">
                  Max Rakes Dispatched Per Day
                </p>
                <span className="text-2xl font-bold text-primary">
                  {maxRakesPerDay}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Maximum number of rakes the plant can dispatch daily
              </p>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={maxRakesPerDay}
                onChange={(e) => setMaxRakesPerDay(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>3</span>
                <span>15</span>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Soft Constraints */}
        <SettingSection
          title="Soft Constraints"
          description="Configure optimization preferences and penalty weights"
        >
          <div className="space-y-4">
            {[
              {
                name: "Minimize Partial Loads",
                weight: 85,
                description:
                  "Penalize incomplete wagon utilization in rakes",
              },
              {
                name: "Reduce Demurrage Risk",
                weight: 92,
                description:
                  "Prioritize orders with higher demurrage penalty rates",
              },
              {
                name: "Prioritize High-Value Orders",
                weight: 78,
                description:
                  "Weight orders by revenue and customer importance",
              },
              {
                name: "Balance Stockyard Load",
                weight: 65,
                description:
                  "Distribute load evenly across all stockyards",
              },
            ].map((constraint) => (
              <div
                key={constraint.name}
                className="p-4 bg-background rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">
                    {constraint.name}
                  </p>
                  <span className="text-sm font-bold text-primary">
                    {constraint.weight}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {constraint.description}
                </p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  defaultValue={constraint.weight}
                  className="w-full accent-primary"
                />
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Material Compatibility */}
        <SettingSection
          title="Material Compatibility Rules"
          description="Define which materials can be mixed in the same rake"
        >
          <div className="p-4 bg-background rounded-lg border border-border space-y-3">
            {[
              { a: "HR Coils", b: "Slabs", compatible: true },
              { a: "Billets", b: "Iron Ore", compatible: false },
              { a: "HR Coils", b: "Billets", compatible: true },
              { a: "Iron Ore", b: "Slabs", compatible: false },
            ].map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {rule.a} + {rule.b}
                </span>
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    rule.compatible
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {rule.compatible ? "Compatible" : "Not Compatible"}
                </span>
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:opacity-90 font-bold transition-all">
            Save Settings
          </button>
          <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-background font-semibold transition-colors">
            Reset to Defaults
          </button>
        </div>
      </div>
    </Layout>
  );
}

interface SettingSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingSection({
  title,
  description,
  children,
}: SettingSectionProps) {
  return (
    <div className="border-b border-border pb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
