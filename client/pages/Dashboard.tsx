import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Zap, Truck, Calendar } from "lucide-react";
import { useNavigate, useEffect, useState } from "react-router-dom";
import {
  optimizeRakeAllocation,
  calculateKPISummary,
} from "@/lib/rake-optimizer";

interface KPIData {
  utilization: number;
  rakes: number;
  cost: number;
  sla: number;
  orders: number;
  savings: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState<KPIData>({
    utilization: 87.3,
    rakes: 3,
    cost: 7800000,
    sla: 97,
    orders: 19,
    savings: 63,
  });

  useEffect(() => {
    // Load and calculate real KPIs from uploaded orders
    const uploadedOrdersStr = sessionStorage.getItem("uploadedOrders");
    if (uploadedOrdersStr) {
      try {
        const uploadedOrders = JSON.parse(uploadedOrdersStr);
        const optimizedPlan = optimizeRakeAllocation(uploadedOrders);
        const kpis = calculateKPISummary(optimizedPlan);

        setKpiData({
          utilization: kpis.avgUtilization,
          rakes: kpis.rakesFormed,
          cost: kpis.totalCost,
          sla: 97.5, // Calculate from plan if needed
          orders: kpis.totalOrders,
          savings: Math.round(parseFloat(kpis.costSavingsPercent)),
        });
      } catch (error) {
        console.error("Error loading KPIs:", error);
      }
    }
  }, []);

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Premium Header */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                  Dashboard
                </h1>
                <p className="text-lg text-muted-foreground">
                  Real-time optimization metrics and system status
                </p>
              </div>
              <div className="text-right space-y-1 hidden md:block">
                <p className="text-sm text-muted-foreground">System Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-sm font-semibold text-emerald-400">
                    Operational
                  </p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <p className="text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* KPI Cards Grid - Premium Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Average Utilization */}
            <div className="card-glow p-6 space-y-2 border-primary/30 stagger-item hover-lift">
              <p className="kpi-label">Average Utilization</p>
              <p className="kpi-value">{kpiData.utilization}%</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-emerald-400">vs last week</p>
              </div>
            </div>

            {/* Active Rakes */}
            <div className="card-glow p-6 space-y-2 border-secondary/30 stagger-item hover-lift">
              <p className="kpi-label">Active Rakes</p>
              <p className="kpi-value">{kpiData.rakes}</p>
              <p className="text-xs text-muted-foreground">
                Loading in progress
              </p>
            </div>

            {/* Total Orders */}
            <div className="card-glow p-6 space-y-2 border-primary/30 stagger-item hover-lift">
              <p className="kpi-label">Total Orders</p>
              <p className="kpi-value">{kpiData.orders}</p>
              <p className="text-xs text-muted-foreground">Processed</p>
            </div>

            {/* Total Cost */}
            <div className="card-glow p-6 space-y-2 border-emerald-500/30 stagger-item hover-lift">
              <p className="kpi-label">Est. Total Cost</p>
              <p className="kpi-value">
                ₹{(kpiData.cost / 1000000).toFixed(1)}M
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-emerald-400">optimized</p>
              </div>
            </div>

            {/* Cost Savings */}
            <div className="card-glow p-6 space-y-2 border-emerald-500/30 stagger-item hover-lift">
              <p className="kpi-label">Cost Savings</p>
              <p className="kpi-value">{kpiData.savings}%</p>
              <p className="text-xs text-emerald-400">vs baseline</p>
            </div>
          </div>

          {/* Key Metrics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Overview */}
            <div className="card-glow p-8 space-y-6 border-primary/20 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  Performance Overview
                </h2>
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Rake Utilization</span>
                    <span className="font-bold text-primary">
                      {kpiData.utilization}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${kpiData.utilization}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">SLA Compliance</span>
                    <span className="font-bold text-secondary">97.5%</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-primary w-11/12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">System Status</span>
                    <span className="font-bold text-emerald-400">Healthy</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 w-full" />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/reports")}
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary h-10 gap-2 transition-all duration-300"
              >
                <BarChart3 className="w-4 h-4" />
                View Detailed Reports
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="card-glow p-8 space-y-6 border-primary/20 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  Quick Actions
                </h2>
                <Zap className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/upload")}
                  className="w-full justify-start text-left h-auto py-4 px-4 bg-muted/20 hover:bg-muted/40 text-foreground transition-all duration-300"
                  variant="ghost"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        Upload New Data
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Import order CSV
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate("/optimize")}
                  className="w-full justify-start text-left h-auto py-4 px-4 bg-muted/20 hover:bg-muted/40 text-foreground transition-all duration-300"
                  variant="ghost"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        Run Optimization
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Calculate rake formations
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate("/rake-plan")}
                  className="w-full justify-start text-left h-auto py-4 px-4 bg-muted/20 hover:bg-muted/40 text-foreground transition-all duration-300"
                  variant="ghost"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        View Rake Plan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Review allocations
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => navigate("/reports")}
                  className="w-full justify-start text-left h-auto py-4 px-4 bg-muted/20 hover:bg-muted/40 text-foreground transition-all duration-300"
                  variant="ghost"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        Export Reports
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CSV, PDF formats
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="card-glass p-8 space-y-4 border-primary/20 text-sm">
            <h3 className="font-semibold text-foreground">
              System Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground">Optimization Engine</p>
                <p className="text-foreground font-medium mt-1">
                  AI-Powered Rake Allocation v2.1
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Optimization</p>
                <p className="text-foreground font-medium mt-1">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="text-foreground font-medium mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
