import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, BarChart3, FileText, Printer } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ReportData {
  totalRakes: number;
  avgUtilization: number;
  slaCompliance: number;
  costSavings: number;
  railCostPerMT: number;
  roadCostPerMT: number;
  totalQuantity: number;
  baselineCost: number;
  optimizedCost: number;
}

export default function Reports() {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<ReportData>({
    totalRakes: 48,
    avgUtilization: 86.2,
    slaCompliance: 97.5,
    costSavings: 2400000,
    railCostPerMT: 350,
    roadCostPerMT: 765,
    totalQuantity: 1313,
    baselineCost: 1005000,
    optimizedCost: 650000,
  });

  useEffect(() => {
    // Load plan data from sessionStorage if available
    const uploadedOrdersStr = sessionStorage.getItem("uploadedOrders");
    if (uploadedOrdersStr) {
      try {
        const orders = JSON.parse(uploadedOrdersStr);
        if (orders.length > 0) {
          const totalQty = orders.reduce((sum: number, o: any) => sum + (o.quantity_tonnes || 0), 0);
          const baselineCost = totalQty * reportData.roadCostPerMT;
          const railQty = Math.round(totalQty * 0.85);
          const roadQty = totalQty - railQty;
          const optimizedCost = railQty * reportData.railCostPerMT + roadQty * reportData.roadCostPerMT;
          
          setReportData({
            ...reportData,
            totalQuantity: Math.round(totalQty),
            baselineCost: Math.round(baselineCost),
            optimizedCost: Math.round(optimizedCost),
            costSavings: Math.round(baselineCost - optimizedCost),
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
  }, []);

  const handleExportCSV = () => {
    const headers = [
      "Metric",
      "Value",
      "Unit",
    ];

    const rows = [
      ["Total Rakes (30D)", reportData.totalRakes.toString(), "rakes"],
      ["Average Utilization", reportData.avgUtilization.toString(), "%"],
      ["SLA Compliance", reportData.slaCompliance.toString(), "%"],
      ["Total Quantity Processed", reportData.totalQuantity.toString(), "MT"],
      ["Baseline Cost (100% Road)", (reportData.baselineCost / 1000).toString(), "₹k"],
      ["Optimized Cost", (reportData.optimizedCost / 1000).toString(), "₹k"],
      ["Total Cost Savings", (reportData.costSavings / 1000).toString(), "₹k"],
      ["Rail Cost per MT", reportData.railCostPerMT.toString(), "₹"],
      ["Road Cost per MT", reportData.roadCostPerMT.toString(), "₹"],
    ];

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `optirake-report-${new Date().toISOString().split("T")[0]}.csv`);
    link.click();

    toast({
      title: "Downloaded",
      description: "Report exported to CSV successfully",
    });
  };

  const handleExportPDF = () => {
    // Create a temporary print window
    const printWindow = window.open("", "", "width=900,height=1200");
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please check popup settings.",
        variant: "destructive",
      });
      return;
    }

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OptiRake DSS Report</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background: #000;
              color: #f5f5f5;
              padding: 40px;
              max-width: 900px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #00ffe0;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              color: #00ffe0;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #999;
            }
            .metrics {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 40px;
            }
            .metric-card {
              background: #0c0c0c;
              border: 1px solid #00ffe0;
              border-radius: 8px;
              padding: 20px;
            }
            .metric-label {
              font-size: 12px;
              color: #999;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .metric-value {
              font-size: 28px;
              font-weight: bold;
              color: #00ffe0;
              margin-bottom: 5px;
            }
            .metric-subtext {
              font-size: 12px;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              font-size: 18px;
              color: #00ffe0;
              margin: 0 0 15px 0;
              border-bottom: 1px solid #333;
              padding-bottom: 10px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #222;
              font-size: 14px;
            }
            .detail-row span:first-child {
              color: #999;
            }
            .detail-row span:last-child {
              color: #f5f5f5;
              font-weight: 600;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #333;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OptiRake DSS Report</h1>
            <p>Optimization Analysis & Performance Metrics</p>
            <p>${new Date().toLocaleDateString()}</p>
          </div>

          <div class="metrics">
            <div class="metric-card">
              <div class="metric-label">Total Rakes (30D)</div>
              <div class="metric-value">${reportData.totalRakes}</div>
              <div class="metric-subtext">Ready for dispatch</div>
            </div>

            <div class="metric-card">
              <div class="metric-label">Avg Utilization</div>
              <div class="metric-value">${reportData.avgUtilization}%</div>
              <div class="metric-subtext">Wagon fill rate</div>
            </div>

            <div class="metric-card">
              <div class="metric-label">SLA Compliance</div>
              <div class="metric-value">${reportData.slaCompliance}%</div>
              <div class="metric-subtext">On-time delivery</div>
            </div>

            <div class="metric-card">
              <div class="metric-label">Cost Savings</div>
              <div class="metric-value">₹${(reportData.costSavings / 1000000).toFixed(2)}M</div>
              <div class="metric-subtext">vs baseline</div>
            </div>
          </div>

          <div class="section">
            <h2>Cost Analysis</h2>
            <div class="detail-row">
              <span>Baseline Cost (100% Road)</span>
              <span>₹${(reportData.baselineCost / 1000).toFixed(0)}k</span>
            </div>
            <div class="detail-row">
              <span>Optimized Cost (85% Rail)</span>
              <span>₹${(reportData.optimizedCost / 1000).toFixed(0)}k</span>
            </div>
            <div class="detail-row" style="font-weight: bold; color: #4ade80;">
              <span>Total Savings</span>
              <span>₹${(reportData.costSavings / 1000).toFixed(0)}k (${Math.round(((reportData.baselineCost - reportData.optimizedCost) / reportData.baselineCost) * 100)}%)</span>
            </div>
          </div>

          <div class="section">
            <h2>Transport Mode Split</h2>
            <div class="detail-row">
              <span>Rail Cost per MT</span>
              <span>₹${reportData.railCostPerMT}</span>
            </div>
            <div class="detail-row">
              <span>Road Cost per MT</span>
              <span>₹${reportData.roadCostPerMT}</span>
            </div>
            <div class="detail-row">
              <span>Total Quantity Processed</span>
              <span>${reportData.totalQuantity} MT</span>
            </div>
          </div>

          <div class="section">
            <h2>Key Insights</h2>
            <div class="detail-row">
              <span>Optimal Rail Percentage</span>
              <span>85%</span>
            </div>
            <div class="detail-row">
              <span>Optimal Road Percentage</span>
              <span>15%</span>
            </div>
            <div class="detail-row">
              <span>Average Rake Utilization</span>
              <span>${reportData.avgUtilization}%</span>
            </div>
            <div class="detail-row">
              <span>On-Time Delivery Rate</span>
              <span>${reportData.slaCompliance}%</span>
            </div>
          </div>

          <div class="footer">
            <p>Generated by OptiRake DSS - AI-Powered Logistics Optimization</p>
            <p>© 2025 SAIL / Ministry of Steel</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);

    toast({
      title: "Success",
      description: "Print dialog opened. Choose 'Save as PDF' to export.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Reports & Analytics
            </h1>
            <p className="text-lg text-muted-foreground">
              30-day performance metrics and export options
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportCSV}
              className="btn-gradient gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="gap-2 border-primary/30"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="gap-2 border-primary/30"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-glow p-6 space-y-2 border-primary/30">
              <p className="kpi-label">Total Rakes (30D)</p>
              <p className="kpi-value">{reportData.totalRakes}</p>
              <p className="text-xs text-emerald-400">Ready to dispatch</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-secondary/30">
              <p className="kpi-label">Avg Utilization</p>
              <p className="kpi-value">{reportData.avgUtilization}%</p>
              <p className="text-xs text-emerald-400">+3.1% improvement</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-primary/30">
              <p className="kpi-label">SLA Compliance</p>
              <p className="kpi-value">{reportData.slaCompliance}%</p>
              <p className="text-xs text-emerald-400">On-time delivery</p>
            </div>

            <div className="card-glow p-6 space-y-2 border-emerald-500/30">
              <p className="kpi-label">Cost Savings</p>
              <p className="kpi-value">₹{(reportData.costSavings / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-emerald-400">vs baseline</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Performance */}
            <div className="card-glow p-8 space-y-6 border-primary/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Performance Metrics</h2>
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Average Utilization</span>
                    <span className="font-bold text-primary">{reportData.avgUtilization}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary w-4/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">SLA Compliance Rate</span>
                    <span className="font-bold text-secondary">{reportData.slaCompliance}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-primary w-11/12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Quantity Processed</span>
                    <span className="font-bold text-emerald-400">{reportData.totalQuantity} MT</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="card-glow p-8 space-y-6 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Cost Analysis</h2>
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Rail Cost/MT</span>
                    <span className="font-bold text-emerald-400">₹{reportData.railCostPerMT}</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-3/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Road Cost/MT</span>
                    <span className="font-bold text-amber-400">₹{reportData.roadCostPerMT}</span>
                  </div>
                  <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-full" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">Baseline Cost</span>
                      <span>₹{(reportData.baselineCost / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">Optimized Cost</span>
                      <span>₹{(reportData.optimizedCost / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-emerald-400 pt-2 border-t border-border/30">
                      <span>Total Savings</span>
                      <span>₹{(reportData.costSavings / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card-glass p-8 space-y-4 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground">Summary</h2>
            <p className="text-muted-foreground">
              The OptiRake DSS has successfully optimized logistics operations by consolidating orders into {reportData.totalRakes} rakes with an average utilization of {reportData.avgUtilization}%. The mixed rail-road transport strategy achieves ₹{(reportData.costSavings / 1000000).toFixed(1)}M in cost savings ({Math.round(((reportData.baselineCost - reportData.optimizedCost) / reportData.baselineCost) * 100)}% reduction) while maintaining {reportData.slaCompliance}% SLA compliance. This demonstrates significant operational efficiency and customer satisfaction improvements.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
