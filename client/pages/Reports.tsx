import { Layout } from "@/components/Layout";
import { Download, BarChart3, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function Reports() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-2">
              Analytics, performance metrics, and historical optimization data
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:opacity-90 font-semibold transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <select className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Month</option>
            <option>Custom Range</option>
          </select>
          <select className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>All Yards</option>
            <option>Bokaro Yard 1</option>
            <option>Bokaro Yard 2</option>
            <option>CMO Delhi</option>
            <option>CMO Mumbai</option>
          </select>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportCard
            title="Cost Analysis"
            description="Freight costs, demurrage savings, and cost optimization trends"
            icon={BarChart3}
            status="ready"
          />
          <ReportCard
            title="SLA Performance"
            description="On-time delivery rates, missed deadlines, and delay analysis"
            icon={Calendar}
            status="ready"
          />
          <ReportCard
            title="Utilization Metrics"
            description="Rake utilization, wagon efficiency, and capacity planning"
            icon={BarChart3}
            status="coming-soon"
          />
          <ReportCard
            title="Forecast Accuracy"
            description="AI model performance, demand prediction accuracy, and improvements"
            icon={BarChart3}
            status="coming-soon"
          />
        </div>

        {/* Analytics Summary */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            This Week's Summary
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnalyticCard
              label="Total Dispatches"
              value="28"
              change="+4 vs last week"
            />
            <AnalyticCard
              label="Avg Utilization"
              value="89.3%"
              change="+2.1% improvement"
            />
            <AnalyticCard
              label="Cost Savings"
              value="₹8.2M"
              change="+12% vs baseline"
            />
            <AnalyticCard
              label="SLA Compliance"
              value="96.4%"
              change="+1.3% this week"
            />
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder
            title="Cost Trends"
            description="Daily optimization cost savings over time"
          />
          <ChartPlaceholder
            title="SLA vs Actual"
            description="On-time delivery rates across destinations"
          />
          <ChartPlaceholder
            title="Utilization Distribution"
            description="Rake utilization frequency histogram"
          />
          <ChartPlaceholder
            title="Destination Load"
            description="Material volume by destination city"
          />
        </div>
      </div>
    </Layout>
  );
}

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "ready" | "coming-soon";
}

function ReportCard({
  title,
  description,
  icon: Icon,
  status,
}: ReportCardProps) {
  return (
    <div
      className={`p-6 rounded-lg border transition-all ${
        status === "ready"
          ? "bg-card border-border hover:border-primary/50 cursor-pointer"
          : "bg-card border-border/50 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-8 h-8 text-primary" />
        {status === "coming-soon" && (
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <button
        disabled={status === "coming-soon"}
        className={`text-sm font-semibold transition-colors ${
          status === "ready"
            ? "text-primary hover:underline"
            : "text-muted-foreground"
        }`}
      >
        {status === "ready" ? "View Report →" : "Not Available Yet"}
      </button>
    </div>
  );
}

interface AnalyticCardProps {
  label: string;
  value: string;
  change: string;
}

function AnalyticCard({ label, value, change }: AnalyticCardProps) {
  return (
    <div className="p-4 bg-background rounded-lg border border-border">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-xs text-primary font-medium">{change}</p>
    </div>
  );
}

interface ChartPlaceholderProps {
  title: string;
  description: string;
}

function ChartPlaceholder({ title, description }: ChartPlaceholderProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-8">{description}</p>
      <div className="h-48 bg-background rounded-lg border border-dashed border-border flex items-center justify-center">
        <p className="text-muted-foreground text-sm text-center">
          Chart visualization
          <br />
          will appear here
        </p>
      </div>
    </div>
  );
}
