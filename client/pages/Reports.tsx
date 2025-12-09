import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, BarChart3, Calendar } from "lucide-react";

export default function Reports() {
  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-lg text-muted-foreground">Performance tracking and historical analysis</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-glow p-6 space-y-2 border-l-4 border-primary">
              <p className="text-sm text-muted-foreground font-medium">TOTAL RAKES (30D)</p>
              <p className="text-3xl font-bold text-primary">48</p>
              <p className="text-xs text-green-400">+12% vs last month</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-l-4 border-secondary">
              <p className="text-sm text-muted-foreground font-medium">AVG UTILIZATION</p>
              <p className="text-3xl font-bold text-secondary">86.2%</p>
              <p className="text-xs text-green-400">+3.1% improvement</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-l-4 border-accent">
              <p className="text-sm text-muted-foreground font-medium">SLA COMPLIANCE</p>
              <p className="text-3xl font-bold text-accent">97.5%</p>
              <p className="text-xs text-green-400">24 on-time deliveries</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-l-4 border-green-400">
              <p className="text-sm text-muted-foreground font-medium">COST SAVINGS</p>
              <p className="text-3xl font-bold text-green-400">₹2.4M</p>
              <p className="text-xs text-green-400">vs. baseline transport</p>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Performance */}
            <div className="card-glow p-8 space-y-6 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Daily Performance</h2>
                  <p className="text-sm text-muted-foreground">Last 30 days aggregate</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Avg Rakes/Day</span>
                    <span className="font-bold text-primary">1.6</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/60 w-4/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Median Orders/Rake</span>
                    <span className="font-bold text-secondary">4.2</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-secondary/60 w-3/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">On-Time Delivery</span>
                    <span className="font-bold text-accent">97.5%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-accent/60 w-11/12" />
                  </div>
                </div>
              </div>

              <Button className="w-full h-10 bg-primary/20 hover:bg-primary/30 text-primary gap-2">
                <Download className="w-4 h-4" />
                Export Full Report
              </Button>
            </div>

            {/* Cost Analysis */}
            <div className="card-glow p-8 space-y-6 border-green-400/20 bg-green-400/5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-foreground">Cost Analysis</h2>
                  <p className="text-sm text-muted-foreground">Transport cost breakdown</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Avg Cost/MT (Rail)</span>
                    <span className="font-bold text-green-400">₹350</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 w-3/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Avg Cost/MT (Road)</span>
                    <span className="font-bold text-orange-400">₹765</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 w-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Total Monthly Cost</span>
                    <span className="font-bold text-foreground">₹18.7M</span>
                  </div>
                </div>

                <p className="text-xs text-green-400 font-semibold pt-4">
                  🎯 Savings vs. baseline: ₹2.4M (12.7% reduction)
                </p>
              </div>

              <Button className="w-full h-10 bg-green-400/20 hover:bg-green-400/30 text-green-400 gap-2">
                <Download className="w-4 h-4" />
                Export Cost Analysis
              </Button>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="card-glow p-8 space-y-6 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground">30-Day Trend</h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Utilization Trend</span>
                  <span className="text-xs text-green-400 font-bold">↑ 3.1%</span>
                </div>
                <div className="h-32 bg-muted/30 rounded-lg flex items-end justify-around p-4 gap-1">
                  {[45, 52, 48, 61, 75, 82, 85, 84, 86, 87].map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t"
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Orders by Mode</span>
                  <span className="text-xs text-green-400 font-bold">94% Rail</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-primary rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground">
                    Rail: 565
                  </div>
                  <div className="flex-1 h-8 bg-secondary rounded-lg flex items-center justify-center text-xs font-bold text-secondary-foreground">
                    Road: 35
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card-glow p-8 space-y-4 border-accent/20 bg-accent/5">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Optimizations
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <p className="font-semibold text-foreground">Bulk order expected (250 MT)</p>
                  <p className="text-xs text-muted-foreground">Dec 28 - Consider adding 1 dedicated rake</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-secondary mt-2" />
                <div>
                  <p className="font-semibold text-foreground">Crane maintenance scheduled</p>
                  <p className="text-xs text-muted-foreground">Jan 2-5 - Road transport will be primary mode</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
