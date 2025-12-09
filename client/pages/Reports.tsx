import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-lg text-muted-foreground">
              30-day performance metrics and historical trends
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-glow p-6 space-y-2 border-primary/30">
              <p className="kpi-label">Total Rakes (30D)</p>
              <p className="kpi-value">48</p>
              <p className="text-xs text-emerald-400">+12% vs last month</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-secondary/30">
              <p className="kpi-label">Avg Utilization</p>
              <p className="kpi-value">86.2%</p>
              <p className="text-xs text-emerald-400">+3.1% improvement</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-primary/30">
              <p className="kpi-label">SLA Compliance</p>
              <p className="kpi-value">97.5%</p>
              <p className="text-xs text-emerald-400">24 on-time</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-emerald-500/30">
              <p className="kpi-label">Cost Savings</p>
              <p className="kpi-value">₹2.4M</p>
              <p className="text-xs text-emerald-400">vs baseline</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Performance */}
            <div className="card-glow p-8 space-y-6 border-primary/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Daily Performance</h2>
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Avg Rakes/Day</span>
                    <span className="font-bold text-primary">1.6</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary w-4/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Orders/Rake</span>
                    <span className="font-bold text-secondary">4.2</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-primary w-3/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">On-Time %</span>
                    <span className="font-bold text-emerald-400">97.5%</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 w-11/12" />
                  </div>
                </div>
              </div>

              <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary h-10 gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>

            {/* Cost Analysis */}
            <div className="card-glow p-8 space-y-6 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Cost Analysis</h2>
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Avg Rail Cost/MT</span>
                    <span className="font-bold text-emerald-400">₹350</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-3/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Avg Road Cost/MT</span>
                    <span className="font-bold text-amber-400">₹765</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-full" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <p className="text-sm text-emerald-400 font-semibold">
                    🎯 Savings: ₹2.4M (12.7% vs baseline)
                  </p>
                </div>
              </div>

              <Button className="w-full bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-400 h-10 gap-2">
                <Download className="w-4 h-4" />
                Export Analysis
              </Button>
            </div>
          </div>

          {/* Upcoming Insights */}
          <div className="card-glass p-8 space-y-4 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground">Upcoming Optimizations</h2>

            <div className="space-y-3">
              {[
                { title: "Bulk order incoming (250 MT)", desc: "Dec 28 - Plan extra rake capacity" },
                { title: "Crane maintenance scheduled", desc: "Jan 2-5 - Road transport will be primary" },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-4 bg-muted/20 rounded-lg border border-border/30">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
