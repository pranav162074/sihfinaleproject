import { Layout } from "@/components/Layout";
import { Zap } from "lucide-react";

interface Stockyard {
  id: string;
  name: string;
  location: string;
  loadingCapacity: string;
  pendingRakes: number;
  inventory: Array<{
    material: string;
    qty: number;
    unit: string;
  }>;
}

const mockStockyards: Stockyard[] = [
  {
    id: "YD-001",
    name: "Bokaro Yard 1",
    location: "Bokaro Steel Plant",
    loadingCapacity: "3 rakes/day",
    pendingRakes: 2,
    inventory: [
      { material: "HR Coils", qty: 450, unit: "T" },
      { material: "Slabs", qty: 680, unit: "T" },
      { material: "Billets", qty: 320, unit: "T" },
    ],
  },
  {
    id: "YD-002",
    name: "Bokaro Yard 2",
    location: "Bokaro Steel Plant",
    loadingCapacity: "2 rakes/day",
    pendingRakes: 1,
    inventory: [
      { material: "Billets", qty: 280, unit: "T" },
      { material: "Iron Ore", qty: 520, unit: "T" },
      { material: "HR Coils", qty: 195, unit: "T" },
    ],
  },
  {
    id: "YD-003",
    name: "CMO Delhi",
    location: "Delhi",
    loadingCapacity: "2 rakes/day",
    pendingRakes: 0,
    inventory: [
      { material: "Iron Ore", qty: 340, unit: "T" },
      { material: "Slabs", qty: 210, unit: "T" },
    ],
  },
  {
    id: "YD-004",
    name: "CMO Mumbai",
    location: "Mumbai",
    loadingCapacity: "2 rakes/day",
    pendingRakes: 1,
    inventory: [
      { material: "HR Coils", qty: 480, unit: "T" },
      { material: "Billets", qty: 360, unit: "T" },
      { material: "Slabs", qty: 270, unit: "T" },
    ],
  },
];

export default function Stockyards() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Stockyards</h1>
            <p className="text-muted-foreground mt-2">
              Monitor inventory across all SAIL locations and identify best sources
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:opacity-90 font-semibold transition-all flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Suggest Best Source
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Inventory"
            value="4,885T"
            subtext="Across 4 yards"
          />
          <SummaryCard
            title="Max Daily Capacity"
            value="9 rakes"
            subtext="Combined all yards"
          />
          <SummaryCard
            title="Material Types"
            value="4"
            subtext="HR Coils, Slabs, Billets, Iron Ore"
          />
          <SummaryCard
            title="Pending Rakes"
            value="4"
            subtext="Loading or optimizing"
          />
        </div>

        {/* Stockyard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockStockyards.map((yard) => (
            <StockyardCard key={yard.id} yard={yard} />
          ))}
        </div>

        {/* Inventory Heatmap */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Inventory Heatmap by Material
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Material Type
                  </th>
                  {mockStockyards.map((yard) => (
                    <th
                      key={yard.id}
                      className="px-6 py-4 text-center text-sm font-semibold text-foreground"
                    >
                      {yard.name}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {["HR Coils", "Slabs", "Billets", "Iron Ore"].map((material) => {
                  const totals = mockStockyards.map(
                    (yard) =>
                      yard.inventory.find((inv) => inv.material === material)
                        ?.qty || 0
                  );
                  const total = totals.reduce((sum, val) => sum + val, 0);

                  return (
                    <tr key={material} className="border-b border-border">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {material}
                      </td>
                      {totals.map((qty, idx) => (
                        <td key={idx} className="px-6 py-4 text-center">
                          <div
                            className={`inline-block px-3 py-2 rounded font-semibold text-sm ${
                              qty > 400
                                ? "bg-green-500/20 text-green-400"
                                : qty > 200
                                  ? "bg-blue-500/20 text-blue-400"
                                  : qty > 0
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {qty}T
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right font-bold text-foreground">
                        {total}T
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface StockyardCardProps {
  yard: Stockyard;
}

function StockyardCard({ yard }: StockyardCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{yard.name}</h3>
          <p className="text-sm text-muted-foreground">{yard.location}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          yard.pendingRakes > 0
            ? "bg-yellow-500/20 text-yellow-400"
            : "bg-green-500/20 text-green-400"
        }`}>
          {yard.pendingRakes} pending rake(s)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Loading Capacity</p>
          <p className="font-bold text-foreground">{yard.loadingCapacity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Inventory</p>
          <p className="font-bold text-primary">
            {yard.inventory.reduce((sum, inv) => sum + inv.qty, 0)}T
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Available Materials
        </h4>
        <div className="space-y-3">
          {yard.inventory.map((item) => (
            <div key={item.material} className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground font-medium">
                  {item.material}
                </span>
                <span className="text-sm font-bold text-primary">
                  {item.qty}{item.unit}
                </span>
              </div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${Math.min((item.qty / 500) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full mt-6 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-background font-semibold transition-colors">
        View Details
      </button>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  subtext: string;
}

function SummaryCard({ title, value, subtext }: SummaryCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}
