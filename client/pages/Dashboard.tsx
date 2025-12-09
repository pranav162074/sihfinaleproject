import { Layout } from "@/components/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-lg text-muted-foreground">Overview of your rake optimization system</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-glow p-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Active Rakes</p>
              <p className="text-3xl font-bold text-primary">3</p>
            </div>

            <div className="card-glow p-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Pending Orders</p>
              <p className="text-3xl font-bold text-primary">12</p>
            </div>

            <div className="card-glow p-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Avg Utilization</p>
              <p className="text-3xl font-bold text-green-400">84%</p>
            </div>

            <div className="card-glow p-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Cost Saved</p>
              <p className="text-3xl font-bold text-primary">₹45k</p>
            </div>
          </div>

          <div className="card-glow p-8 space-y-4">
            <p className="text-lg font-bold text-foreground">Quick Actions</p>
            <p className="text-sm text-muted-foreground">Dashboard features coming soon. Navigate to Import Data to start optimization.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
