import { Layout } from "@/components/Layout";
import { useState } from "react";
import { ChevronDown, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Rake {
  id: string;
  loadingPoint: string;
  destinations: string[];
  orders: number;
  totalQty: number;
  wagonType: string;
  utilization: number;
  cost: number;
  slaStatus: "on-time" | "at-risk" | "delayed";
  items: Array<{
    material: string;
    qty: number;
    source: string;
    customer?: string;
  }>;
}

const mockRakes: Rake[] = [
  {
    id: "RAKE-001",
    loadingPoint: "Bokaro Yard 1",
    destinations: ["Delhi"],
    orders: 4,
    totalQty: 240,
    wagonType: "BOXN",
    utilization: 92,
    cost: 124000,
    slaStatus: "on-time",
    items: [
      { material: "HR Coils", qty: 80, source: "Bokaro Yard 1", customer: "Delhi Steel Mills" },
      { material: "Slabs", qty: 160, source: "Bokaro Yard 1", customer: "Delhi Plates Ltd" },
    ],
  },
  {
    id: "RAKE-002",
    loadingPoint: "Bokaro Yard 2",
    destinations: ["Mumbai", "Ahmedabad"],
    orders: 3,
    totalQty: 198,
    wagonType: "BOXN",
    utilization: 88,
    cost: 102000,
    slaStatus: "on-time",
    items: [
      { material: "Billets", qty: 100, source: "Bokaro Yard 2", customer: "Mumbai Steel" },
      { material: "HR Coils", qty: 98, source: "CMO Delhi", customer: "Ahmedabad Mills" },
    ],
  },
  {
    id: "RAKE-003",
    loadingPoint: "CMO Delhi",
    destinations: ["Ahmedabad"],
    orders: 2,
    totalQty: 156,
    wagonType: "BOXN",
    utilization: 78,
    cost: 81000,
    slaStatus: "at-risk",
    items: [
      { material: "Iron Ore", qty: 156, source: "CMO Delhi", customer: "Ahmedabad Steel" },
    ],
  },
  {
    id: "RAKE-004",
    loadingPoint: "Bokaro Yard 1",
    destinations: ["Chennai"],
    orders: 5,
    totalQty: 184,
    wagonType: "BOXN",
    utilization: 85,
    cost: 98000,
    slaStatus: "on-time",
    items: [
      { material: "Slabs", qty: 184, source: "Bokaro Yard 1", customer: "Chennai Steel Works" },
    ],
  },
];

export default function RakePlanner() {
  const [selectedRake, setSelectedRake] = useState<Rake | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Rake Planner</h1>
            <p className="text-muted-foreground mt-2">
              Daily dispatch optimization and manual rake configuration
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:opacity-90 font-semibold transition-all">
            Optimize Dispatch Plan
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <select className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>All Rakes</option>
            <option>Ready for Dispatch</option>
            <option>Loading</option>
            <option>Queued</option>
          </select>
          <select className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <option>All Destinations</option>
            <option>Delhi</option>
            <option>Mumbai</option>
            <option>Ahmedabad</option>
            <option>Chennai</option>
          </select>
        </div>

        {/* Main Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Rake ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Loading Point
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Destination(s)
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Total Qty (T)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Wagon Type
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Utilization
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Cost
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    SLA
                  </th>
                  <th className="px-6 py-4 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {mockRakes.map((rake) => (
                  <tr
                    key={rake.id}
                    className="border-b border-border hover:bg-background/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedRake(rake)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">{rake.id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {rake.loadingPoint}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {rake.destinations.join(", ")}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-foreground">
                      {rake.orders}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-foreground font-medium">
                      {rake.totalQty}T
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                        {rake.wagonType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${rake.utilization}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground min-w-[40px]">
                          {rake.utilization}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                      ₹{(rake.cost / 100000).toFixed(1)}L
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          rake.slaStatus === "on-time"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {rake.slaStatus === "on-time" ? "On-Time" : "At Risk"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:opacity-90 font-bold transition-all text-lg">
          Approve & Dispatch All Rakes
        </button>
      </div>

      {/* Right Drawer */}
      {selectedRake && (
        <RakeDetailDrawer rake={selectedRake} onClose={() => setSelectedRake(null)} />
      )}
    </Layout>
  );
}

interface RakeDetailDrawerProps {
  rake: Rake;
  onClose: () => void;
}

function RakeDetailDrawer({ rake, onClose }: RakeDetailDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">{rake.id}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Loading Point</span>
              <span className="font-semibold text-foreground">
                {rake.loadingPoint}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Destination(s)</span>
              <span className="font-semibold text-foreground">
                {rake.destinations.join(", ")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Wagon Type</span>
              <span className="font-semibold text-foreground">
                {rake.wagonType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Quantity</span>
              <span className="font-semibold text-foreground">
                {rake.totalQty}T
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Utilization</span>
              <span className="font-semibold text-primary">
                {rake.utilization}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cost</span>
              <span className="font-semibold text-foreground">
                ₹{(rake.cost / 100000).toFixed(1)}L
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-bold text-foreground mb-4">
              Items in This Rake
            </h3>
            <div className="space-y-3">
              {rake.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-foreground">
                      {item.material}
                    </span>
                    <span className="font-bold text-primary">{item.qty}T</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Source: {item.source}</p>
                    {item.customer && <p>Customer: {item.customer}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border p-6 space-y-3">
          <button className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:opacity-90 font-bold transition-all flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Approve & Dispatch
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border border-border text-foreground rounded-lg hover:bg-background font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
