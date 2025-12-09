import { Layout } from "@/components/Layout";
import { KPICard } from "@/components/Sparkline";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Truck,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample sparkline data (7-day trend)
const sparklineData = {
  utilization: [72, 74, 76, 79, 82, 85, 87],
  rakes: [1, 1, 2, 2, 3, 3, 3],
  cost: [8500, 8400, 8200, 8100, 8000, 7900, 7800],
  sla: [94, 94, 95, 95, 96, 97, 97],
};

export default function Dashboard() {
  const navigate = useNavigate();

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

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
                  <p className="text-sm font-semibold text-emerald-400">Operational</p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <p className="text-sm">{new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}</p>
            </div>
          </div>

          {/* KPI Cards Grid - Premium Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              label="Average Utilization"
              value="87.3"
              unit="%"
              trend={3.1}
              trendLabel="vs last week"
              data={sparklineData.utilization}
              color="teal"
              icon={<TrendingUp className="w-6 h-6" />}
              onClick={() => navigate("/reports")}
            />

            <KPICard
              label="Active Rakes"
              value="3"
              unit="today"
              trend={0}
              trendLabel="Loading in progress"
              data={sparklineData.rakes}
              color="blue"
              icon={<Truck className="w-6 h-6" />}
              onClick={() => navigate("/rake-plan")}
            />

            <KPICard
              label="Total Cost"
              value="₹7.8M"
              unit="estimated"
              trend={-8.2}
              trendLabel="vs baseline"
              data={sparklineData.cost}
              color="green"
              icon={<BarChart3 className="w-6 h-6" />}
              onClick={() => navigate("/reports")}
            />

            <KPICard
              label="SLA Compliance"
              value="97"
              unit="%"
              trend={3}
              trendLabel="on-time"
              data={sparklineData.sla}
              color="green"
              icon={<ArrowUpRight className="w-6 h-6" />}
              onClick={() => navigate("/reports")}
            />
          </div>

          {/* Quick Actions Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
              <p className="text-sm text-muted-foreground">
                Start a new optimization or review existing plans
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: "📤",
                  title: "Upload Data",
                  desc: "Import order CSV",
                  path: "/upload",
                  color: "from-primary/20 to-primary/10",
                },
                {
                  icon: "⚡",
                  title: "Run Optimization",
                  desc: "Generate rake plan",
                  path: "/optimize",
                  color: "from-secondary/20 to-secondary/10",
                },
                {
                  icon: "📊",
                  title: "View Results",
                  desc: "See rake allocations",
                  path: "/rake-plan",
                  color: "from-emerald-500/20 to-emerald-500/10",
                },
                {
                  icon: "📈",
                  title: "Analytics",
                  desc: "30-day reports",
                  path: "/reports",
                  color: "from-amber-500/20 to-amber-500/10",
                },
              ].map((action) => (
                <button
                  key={action.path}
                  onClick={() => handleQuickAction(action.path)}
                  className={`card-glass group p-6 space-y-4 text-left hover:scale-105 transition-transform`}
                >
                  <div className={`text-3xl group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Rakes Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Active Rakes (3)</h2>
              <p className="text-sm text-muted-foreground">
                Current rake formations and real-time status
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: "R1",
                  dest: "Delhi",
                  orders: 5,
                  util: 94,
                  status: "Loading",
                  statusColor: "amber",
                },
                {
                  id: "R2",
                  dest: "Mumbai",
                  orders: 4,
                  util: 87,
                  status: "Dispatched",
                  statusColor: "blue",
                },
                {
                  id: "R3",
                  dest: "Bangalore",
                  orders: 3,
                  util: 77,
                  status: "Transit",
                  statusColor: "emerald",
                },
              ].map((rake) => (
                <button
                  key={rake.id}
                  onClick={() => navigate("/rake-plan")}
                  className="card-glow group p-6 space-y-4 text-left hover:scale-105 transition-transform"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-primary">{rake.id}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{rake.dest}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        rake.statusColor === "amber"
                          ? "bg-amber-500/20 text-amber-400"
                          : rake.statusColor === "blue"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {rake.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{rake.orders} orders</span>
                      <span className="font-semibold text-foreground">{rake.util}% full</span>
                    </div>
                    <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${rake.util}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Premium CTA Section */}
          <div className="card-glass p-8 md:p-12 space-y-6 border-primary/30 relative overflow-hidden">
            {/* Gradient background effect */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(0, 252, 232, 0.1), transparent 80%)",
              }}
            />

            <div className="relative space-y-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ready to optimize today?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your orders and let our AI generate the most efficient rake formations with
                real-time explanations and cost savings analysis
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => handleQuickAction("/upload")}
                className="btn-gradient h-12 px-8 text-base font-semibold"
              >
                Start New Optimization
              </Button>
              <Button variant="outline" className="h-12 px-8 border-primary/30 text-primary hover:bg-primary/10">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
