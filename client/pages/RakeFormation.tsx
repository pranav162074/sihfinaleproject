import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RakeData {
  rakeId: string;
  destination: string;
  stockyard: string;
  wagons: number;
  quantity: number;
  loadingPoint: string;
  utilization: number;
  cost: number;
  status: "Planned" | "Approved" | "Loading" | "Departed";
}

interface RakeDetailsPanelProps {
  rake: RakeData | null;
  isOpen: boolean;
  onClose: () => void;
}

// Demo data
const DEMO_RAKES: RakeData[] = [
  {
    rakeId: "RK-0001",
    destination: "Bhilai",
    stockyard: "STOCKYARD_A",
    wagons: 2,
    quantity: 120,
    loadingPoint: "LP1",
    utilization: 92,
    cost: 9000,
    status: "Planned",
  },
  {
    rakeId: "RK-0002",
    destination: "Chennai",
    stockyard: "STOCKYARD_B",
    wagons: 3,
    quantity: 140,
    loadingPoint: "LP2",
    utilization: 80,
    cost: 20400,
    status: "Planned",
  },
  {
    rakeId: "RK-0003",
    destination: "Delhi",
    stockyard: "STOCKYARD_A",
    wagons: 5,
    quantity: 245,
    loadingPoint: "LP3",
    utilization: 74,
    cost: 44100,
    status: "Approved",
  },
];

function RakeDetailsPanel({ rake, isOpen, onClose }: RakeDetailsPanelProps) {
  if (!rake) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Rake Details - {rake.rakeId}</DialogTitle>
          <DialogDescription>View and manage rake allocation</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rake Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="text-sm font-semibold text-foreground">
                {rake.destination}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stockyard</p>
              <p className="text-sm font-semibold text-foreground">
                {rake.stockyard}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wagons</p>
              <p className="text-sm font-semibold text-foreground">
                {rake.wagons}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="text-sm font-semibold text-foreground">
                {rake.quantity} MT
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Loading Point</p>
              <p className="text-sm font-semibold text-foreground">
                {rake.loadingPoint}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Utilization</p>
              <p className="text-sm font-semibold text-green-400">
                {rake.utilization}%
              </p>
            </div>
          </div>

          {/* Natural Language Explanation */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              AI Explanation
            </p>
            <p className="text-sm text-foreground/80">
              RAKE {rake.rakeId} to {rake.destination} is formed using{" "}
              {rake.wagons} wagons from {rake.stockyard}. It carries orders with
              a total of {rake.quantity} MT, giving {rake.utilization}%
              utilization. This rake was chosen because it groups orders to the
              same destination, fits within loading capacity at{" "}
              {rake.loadingPoint}, and avoids creating extra rakes while meeting
              all due dates.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline">Edit</Button>
            <Button className="btn-gradient">Approve</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function RakeFormation() {
  const [rakes] = useState<RakeData[]>(DEMO_RAKES);
  const [selectedRake, setSelectedRake] = useState<RakeData | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  const totalRakes = rakes.length;
  const totalWagons = rakes.reduce((sum, r) => sum + r.wagons, 0);
  const totalQuantity = rakes.reduce((sum, r) => sum + r.quantity, 0);
  const avgUtilization = Math.round(
    rakes.reduce((sum, r) => sum + r.utilization, 0) / rakes.length,
  );
  const totalCost = rakes.reduce((sum, r) => sum + r.cost, 0);
  const optimizationScore = Math.round(avgUtilization * 0.6 + 50 * 0.4);

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-foreground">
                Rake Formation Planner
              </h1>
              <Button className="gap-2" variant="outline">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
            <p className="text-lg text-muted-foreground">
              Manage and optimize your daily rake plan
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card-glow p-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                TOTAL RAKES
              </p>
              <p className="text-3xl font-bold text-primary">{totalRakes}</p>
              <p className="text-xs text-muted-foreground">In queue</p>
            </div>

            <div className="card-glow p-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                TOTAL WAGONS
              </p>
              <p className="text-3xl font-bold text-primary">{totalWagons}</p>
              <p className="text-xs text-muted-foreground">Allocated</p>
            </div>

            <div className="card-glow p-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                TOTAL QUANTITY
              </p>
              <p className="text-3xl font-bold text-primary">
                {totalQuantity.toLocaleString()} MT
              </p>
              <p className="text-xs text-muted-foreground">To transport</p>
            </div>

            <div className="card-glow p-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                AVG UTILIZATION
              </p>
              <p className="text-3xl font-bold text-green-400">
                {avgUtilization}%
              </p>
              <p className="text-xs text-muted-foreground">Wagon fill</p>
            </div>

            <div className="card-glow p-6 space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                TOTAL COST
              </p>
              <p className="text-3xl font-bold text-primary">
                ₹{(totalCost / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </div>
          </div>

          {/* Rake Formation Queue Table */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Rake Formation Queue ({totalRakes})
            </h2>

            <div className="card-glow overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">
                      Rake ID
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground">
                      Destination
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground">
                      Stockyard
                    </th>
                    <th className="text-right p-4 font-semibold text-foreground">
                      Wagons
                    </th>
                    <th className="text-right p-4 font-semibold text-foreground">
                      Quantity
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground">
                      Loading Point
                    </th>
                    <th className="text-right p-4 font-semibold text-foreground">
                      Util %
                    </th>
                    <th className="text-right p-4 font-semibold text-foreground">
                      Cost
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-center p-4 font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rakes.map((rake) => (
                    <tr
                      key={rake.rakeId}
                      className="border-b border-border/50 hover:bg-muted/30 transition"
                    >
                      <td className="p-4 text-primary font-bold">
                        {rake.rakeId}
                      </td>
                      <td className="p-4 text-foreground">
                        {rake.destination}
                      </td>
                      <td className="p-4 text-foreground/80">
                        {rake.stockyard}
                      </td>
                      <td className="p-4 text-right text-foreground">
                        {rake.wagons}
                      </td>
                      <td className="p-4 text-right text-foreground font-medium">
                        {rake.quantity} MT
                      </td>
                      <td className="p-4 text-foreground/80">
                        {rake.loadingPoint}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-semibold ${rake.utilization >= 85 ? "text-green-400" : "text-yellow-500"}`}
                        >
                          {rake.utilization}%
                        </span>
                      </td>
                      <td className="p-4 text-right text-foreground font-medium">
                        ₹{(rake.cost / 1000).toFixed(0)}k
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rake.status === "Approved"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {rake.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRake(rake);
                              setShowDetailsPanel(true);
                            }}
                            className="p-1.5 hover:bg-muted rounded transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-muted rounded transition"
                            title="Edit rake"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-red-500/10 rounded transition"
                            title="Delete rake"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optimization Score Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 card-glow p-8 space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                Plan Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-foreground/80">Wagon Utilization</p>
                  <p className="text-lg font-semibold text-green-400">
                    {avgUtilization}%
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full"
                    style={{ width: `${avgUtilization}%` }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-foreground/80">Cost Optimization</p>
                  <p className="text-lg font-semibold text-blue-400">8.5%</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-foreground/80">Constraint Compliance</p>
                  <p className="text-lg font-semibold text-primary">100%</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            <div className="card-glow p-8 flex flex-col items-center justify-center space-y-4">
              <p className="text-sm text-muted-foreground font-medium">
                Optimization Score
              </p>
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray={`${(optimizationScore / 100) * 440} 440`}
                    className="transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-4xl font-bold text-primary">
                    {optimizationScore}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Needs improvement: Increase utilization above 90% for better
                score
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button className="btn-gradient h-12 px-8">
              Auto-Generate Plan
            </Button>
            <Button variant="outline" className="h-12 px-8">
              Save & Finalize
            </Button>
          </div>
        </div>
      </div>

      {/* Details Panel Dialog */}
      <RakeDetailsPanel
        rake={selectedRake}
        isOpen={showDetailsPanel}
        onClose={() => setShowDetailsPanel(false)}
      />
    </Layout>
  );
}
