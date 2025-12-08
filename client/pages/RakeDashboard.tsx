import { Layout } from "@/components/Layout";
import {
  BarChart3,
  TrendingDown,
  Truck,
  Clock,
  AlertCircle,
  Download,
  RefreshCw,
} from "lucide-react";

export default function RakeDashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Rake Formation Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Optimize wagon allocation and routes from Bokaro to CMO stockyards
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 border border-border rounded-lg hover:bg-muted/50 font-medium text-foreground transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Plan
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Active Rakes"
            value="12"
            change="+3 from yesterday"
            icon={Truck}
          />
          <MetricCard
            title="Forecast Accuracy"
            value="94.2%"
            change="+2.1% this week"
            icon={BarChart3}
          />
          <MetricCard
            title="Cost Saved"
            value="₹2.4M"
            change="+18% vs baseline"
            icon={TrendingDown}
          />
          <MetricCard
            title="Avg Delivery SLA"
            value="2.1d"
            change="-0.3d improvement"
            icon={Clock}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bokaro → CMO Routes */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Active Routes (Bokaro → CMO → Customer)
              </h2>
              <button className="text-primary hover:underline text-sm font-medium">
                View All
              </button>
            </div>

            <div className="space-y-4">
              <RouteCard
                from="Bokaro Steel Plant"
                to="CMO Stockyard"
                status="In Transit"
                rakes={4}
                capacity="92%"
                eta="6h 32m"
              />
              <RouteCard
                from="CMO Stockyard"
                to="Customer Loc A"
                status="Loading"
                rakes={3}
                capacity="78%"
                eta="2h 15m"
              />
              <RouteCard
                from="CMO Stockyard"
                to="Customer Loc B"
                status="Dispatch Ready"
                rakes={2}
                capacity="85%"
                eta="Pending"
              />
              <RouteCard
                from="Bokaro Steel Plant"
                to="CMO Stockyard"
                status="Formation Queue"
                rakes={3}
                capacity="0%"
                eta="12h"
              />
            </div>
          </div>

          {/* Optimization Status */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Last Optimization
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Runtime</span>
                  <span className="text-sm font-medium text-foreground">
                    2m 34s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Algorithm
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    ILP + Heuristic
                  </span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <button className="w-full py-2 text-primary hover:bg-primary/10 rounded font-medium text-sm transition-colors">
                    View Results
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">
                    Manual Override
                  </h4>
                  <p className="text-sm text-yellow-800">
                    2 pending overrides from CMO dispatch team. Review before
                    next run.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders vs Stock vs Wagon Availability */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Orders vs Stock vs Wagon Availability
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Product Grade
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">
                    Orders (T)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">
                    Stock (T)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">
                    Availability
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">
                    Wagons Free
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">
                    Match %
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    grade: "TMT 500B",
                    orders: 1200,
                    stock: 980,
                    availability: "82%",
                    wagons: 24,
                    match: "82%",
                  },
                  {
                    grade: "Structural Steel",
                    orders: 850,
                    stock: 920,
                    availability: "108%",
                    wagons: 18,
                    match: "100%",
                  },
                  {
                    grade: "Wire Rod",
                    orders: 650,
                    stock: 420,
                    availability: "65%",
                    wagons: 12,
                    match: "65%",
                  },
                  {
                    grade: "Plates",
                    orders: 450,
                    stock: 520,
                    availability: "115%",
                    wagons: 14,
                    match: "100%",
                  },
                ].map((row) => (
                  <tr key={row.grade} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">
                      {row.grade}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {row.orders.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {row.stock.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          parseInt(row.availability) > 100
                            ? "bg-green-100 text-green-700"
                            : parseInt(row.availability) > 80
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.availability}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {row.wagons}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: row.match }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historical Analytics Placeholder */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Performance Trends
          </h2>
          <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-center">
              Chart visualization would appear here
              <br />
              (Cost savings, SLA improvement, utilization rates)
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ title, value, change, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <p className="text-xs text-muted-foreground">{change}</p>
    </div>
  );
}

interface RouteCardProps {
  from: string;
  to: string;
  status: string;
  rakes: number;
  capacity: string;
  eta: string;
}

function RouteCard({
  from,
  to,
  status,
  rakes,
  capacity,
  eta,
}: RouteCardProps) {
  const statusColor =
    status === "In Transit"
      ? "bg-blue-100 text-blue-700"
      : status === "Loading"
        ? "bg-orange-100 text-orange-700"
        : status === "Dispatch Ready"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700";

  return (
    <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{from}</p>
          <p className="text-xs text-muted-foreground">→ {to}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <p className="text-muted-foreground">Rakes</p>
          <p className="font-semibold text-foreground">{rakes}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Capacity</p>
          <p className="font-semibold text-foreground">{capacity}</p>
        </div>
        <div>
          <p className="text-muted-foreground">ETA</p>
          <p className="font-semibold text-foreground">{eta}</p>
        </div>
      </div>
    </div>
  );
}
