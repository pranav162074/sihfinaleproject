import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Settings() {
  const [minUtilization, setMinUtilization] = useState(75);
  const [maxRakesPerDay, setMaxRakesPerDay] = useState(5);

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Settings
            </h1>
            <p className="text-lg text-muted-foreground">
              Configure optimization constraints and system preferences
            </p>
          </div>

          {/* Optimization Settings */}
          <div className="card-glow p-8 space-y-8 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground">
              Optimization Constraints
            </h2>

            {/* Min Utilization */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Minimum Rake Utilization: {minUtilization}%
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Rakes must reach this utilization threshold before forming
                </p>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={minUtilization}
                onChange={(e) => setMinUtilization(Number(e.target.value))}
                className="w-full h-2 bg-muted/30 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>60%</span>
                <span>95%</span>
              </div>
            </div>

            {/* Max Rakes */}
            <div className="space-y-4 pt-6 border-t border-border/30">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Max Rakes Per Day: {maxRakesPerDay}
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Maximum number of rakes to form in a single day
                </p>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={maxRakesPerDay}
                onChange={(e) => setMaxRakesPerDay(Number(e.target.value))}
                className="w-full h-2 bg-muted/30 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            {/* Multi-destination Toggle */}
            <div className="pt-6 border-t border-border/30 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Allow Multi-Destination Rakes
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mix orders from different destinations in single rake
                </p>
              </div>
              <div className="w-12 h-6 bg-primary/30 rounded-full flex items-center justify-end pr-1 cursor-pointer hover:bg-primary/40 transition-colors">
                <div className="w-5 h-5 bg-primary rounded-full transition-transform" />
              </div>
            </div>

            <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary h-11 font-semibold mt-6">
              Save Settings
            </Button>
          </div>

          {/* Region & Units */}
          <div className="card-glow p-8 space-y-6 border-secondary/20">
            <h2 className="text-2xl font-bold text-foreground">
              Region & Units
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Operating Region
                </label>
                <select className="input-subtle w-full">
                  <option>India - SAIL Bokaro</option>
                  <option>India - Other regions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Weight Unit
                </label>
                <div className="flex gap-4">
                  {["Metric Tonnes", "Short Tons"].map((unit) => (
                    <label
                      key={unit}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="weight"
                        defaultChecked={unit === "Metric Tonnes"}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground">{unit}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Currency
                </label>
                <select className="input-subtle w-full">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                </select>
              </div>
            </div>

            <Button className="w-full bg-secondary/20 hover:bg-secondary/30 text-secondary h-11 font-semibold">
              Save Preferences
            </Button>
          </div>

          {/* Advanced Options */}
          <div className="card-glass p-8 space-y-6 border-amber-500/20">
            <h2 className="text-2xl font-bold text-foreground">
              Advanced Options
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-foreground">
                  Enable real-time notifications
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm text-foreground">
                  Send optimization reports via email
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-foreground">
                  Enable dark mode (default: on)
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
