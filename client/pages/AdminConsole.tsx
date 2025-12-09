import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function AdminConsole() {
  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Admin Console
            </h1>
            <p className="text-lg text-muted-foreground">
              System administration and monitoring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-glow p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground">
                System Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">API Status</p>
                  <span className="text-sm font-medium text-green-400">
                    Healthy
                  </span>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Database</p>
                  <span className="text-sm font-medium text-green-400">
                    Connected
                  </span>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <span className="text-sm font-medium text-foreground">
                    99.9%
                  </span>
                </div>
              </div>
            </div>

            <div className="card-glow p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground">
                Usage Statistics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Optimizations Today
                  </p>
                  <span className="text-sm font-medium text-foreground">
                    15
                  </span>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total Orders Processed
                  </p>
                  <span className="text-sm font-medium text-foreground">
                    1,234
                  </span>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Avg Response Time
                  </p>
                  <span className="text-sm font-medium text-foreground">
                    245ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-glow p-8 space-y-6">
            <h3 className="text-xl font-bold text-foreground">Admin Actions</h3>
            <div className="space-y-4">
              <Button
                className="w-full btn-gradient justify-start"
                variant="outline"
              >
                Clear Cache
              </Button>
              <Button
                className="w-full btn-gradient justify-start"
                variant="outline"
              >
                Export Logs
              </Button>
              <Button
                className="w-full btn-gradient justify-start"
                variant="outline"
              >
                Reset System
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
