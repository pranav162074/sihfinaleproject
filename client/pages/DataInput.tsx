import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Upload, Loader, AlertCircle, CheckCircle, Download, Eye, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { parseCSV, validateCSVData } from "@/lib/csv-parser";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RakePlanOutput } from "@shared/api";

interface FileUploadState {
  name: string;
  status: "pending" | "uploading" | "validating" | "success" | "error";
  validRows: number;
  invalidRows: number;
  errors: string[];
  data?: Record<string, unknown>[];
}

interface PreviewData {
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

const REQUIRED_COLUMNS = [
  "order_id",
  "customer_name",
  "customer_location",
  "product_type",
  "material_grade",
  "quantity_tonnes",
  "destination",
];

const REASONING_STEPS = [
  "Validating and normalizing input orders",
  "Extracting unique customers and materials",
  "Mapping products to compatible wagon types",
  "Assigning orders to available rakes by destination",
  "Calculating utilization and cost metrics",
  "Finalizing daily rake plan with SLA compliance",
  "Generating natural language explanations",
];

export default function DataInput() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadedFile, setUploadedFile] = useState<FileUploadState | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<RakePlanOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const handleFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile({
      name: file.name,
      status: "validating",
      validRows: 0,
      invalidRows: 0,
      errors: [],
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const parsedData = parseCSV(csvContent);
        const validation = validateCSVData(parsedData, REQUIRED_COLUMNS);

        if (!validation.isValid) {
          const errorDetails = [
            ...validation.missingColumns.map(col => `Missing required column: ${col}`),
            ...validation.errorRows.slice(0, 5).map(row => `Row ${row.rowIndex}: ${row.errors.join(", ")}`),
          ];

          setUploadedFile({
            name: file.name,
            status: "error",
            validRows: validation.validRows,
            invalidRows: validation.invalidRows,
            errors: errorDetails,
          });

          toast({
            title: "Validation Error",
            description: `${validation.validRows} valid, ${validation.invalidRows} invalid rows`,
            variant: "destructive",
          });
          return;
        }

        setUploadedFile({
          name: file.name,
          status: "success",
          validRows: parsedData.rowCount,
          invalidRows: 0,
          errors: [],
          data: parsedData.rows,
        });

        toast({
          title: "File Uploaded Successfully",
          description: `${parsedData.rowCount} orders ready for optimization`,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to parse file";
        setUploadedFile({
          name: file.name,
          status: "error",
          validRows: 0,
          invalidRows: 0,
          errors: [errorMsg],
        });

        toast({
          title: "Parse Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      setUploadedFile({
        name: file.name,
        status: "error",
        validRows: 0,
        invalidRows: 0,
        errors: ["Failed to read file"],
      });

      toast({
        title: "Read Error",
        description: "Failed to read the file",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  };

  const handlePreviewFile = () => {
    if (!uploadedFile?.data) return;
    const csvContent = parseCSV(
      REQUIRED_COLUMNS.join(",") +
        "\n" +
        uploadedFile.data
          .map((row) =>
            REQUIRED_COLUMNS.map((col) => {
              const val = row[col];
              if (typeof val === "string" && val.includes(",")) {
                return `"${val}"`;
              }
              return val;
            }).join(",")
          )
          .join("\n")
    );

    setPreviewData({
      headers: csvContent.headers,
      rows: csvContent.rows,
      rowCount: uploadedFile.validRows,
    });
    setShowPreviewDialog(true);
  };

  const handleRunOptimization = async () => {
    if (!uploadedFile?.data) return;

    setIsOptimizing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/plan-rakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: uploadedFile.data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Optimization failed");
      }

      const result = (await response.json()) as RakePlanOutput;
      setOptimizationResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to run optimization");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Helper: Parse CSV for preview
  function parseCSV(csvContent: string) {
    const lines = csvContent.split("\n").filter(line => line.trim());
    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = lines[0].split(",").map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      const row: Record<string, unknown> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || "";
      });
      return row;
    });

    return { headers, rows };
  }

  // Show results if optimization is complete
  if (optimizationResult) {
    return (
      <Layout>
        <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Results Header */}
            <div className="space-y-2 animate-fade-in">
              <h1 className="text-4xl font-bold text-foreground">Optimization Complete</h1>
              <p className="text-lg text-muted-foreground">Your rake plan is ready for review</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-glow p-6 space-y-2">
                <p className="text-sm text-muted-foreground font-medium">RAKES FORMED</p>
                <p className="text-3xl font-bold text-primary">{optimizationResult.kpi_summary.rakes_used}</p>
                <p className="text-xs text-green-400">Ready to load</p>
              </div>

              <div className="card-glow p-6 space-y-2">
                <p className="text-sm text-muted-foreground font-medium">TOTAL QUANTITY</p>
                <p className="text-3xl font-bold text-primary">
                  {Math.round(optimizationResult.kpi_summary.total_orders * 35)} MT
                </p>
                <p className="text-xs text-muted-foreground">Orders processed</p>
              </div>

              <div className="card-glow p-6 space-y-2">
                <p className="text-sm text-muted-foreground font-medium">AVG UTILIZATION</p>
                <p className="text-3xl font-bold text-green-400">
                  {Math.round(optimizationResult.kpi_summary.average_rake_utilization_percent)}%
                </p>
                <p className="text-xs text-muted-foreground">Wagon fill rate</p>
              </div>

              <div className="card-glow p-6 space-y-2">
                <p className="text-sm text-muted-foreground font-medium">TOTAL COST</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{Math.round(optimizationResult.kpi_summary.total_estimated_cost / 1000)}k
                </p>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </div>
            </div>

            {/* Formed Rakes Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Formed Rakes ({optimizationResult.kpi_summary.rakes_used})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(new Set(optimizationResult.rake_plan.map(a => a.rake_id))).map(rakeId => {
                  const rakeAllocations = optimizationResult.rake_plan.filter(a => a.rake_id === rakeId);
                  const totalQty = rakeAllocations.reduce((sum, a) => sum + a.allocated_quantity_tonnes, 0);
                  const avgUtil = rakeAllocations.length > 0
                    ? Math.round(rakeAllocations.reduce((sum, a) => sum + a.utilization_percent_for_rake, 0) / rakeAllocations.length)
                    : 0;
                  const destination = rakeAllocations[0]?.destination || "Mixed";
                  const lp = rakeAllocations[0]?.platform_id || "LP1";

                  return (
                    <div key={rakeId} className="card-glow p-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold text-primary">{rakeId}</h3>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Planned</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Destination</span><span className="font-medium">{destination}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Loading Point</span><span className="font-medium">{lp}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Wagons</span><span className="font-medium">45</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{totalQty.toFixed(1)} MT</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Utilization</span><span className="font-medium text-green-400">{avgUtil}%</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optimized Orders Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Optimized Orders ({optimizationResult.rake_plan.length})</h2>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>

              <div className="card-glow overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold text-foreground">Order ID</th>
                      <th className="text-left p-4 font-semibold text-foreground">Customer</th>
                      <th className="text-left p-4 font-semibold text-foreground">Material</th>
                      <th className="text-right p-4 font-semibold text-foreground">Quantity</th>
                      <th className="text-left p-4 font-semibold text-foreground">Rake</th>
                      <th className="text-left p-4 font-semibold text-foreground">Wagon</th>
                      <th className="text-right p-4 font-semibold text-foreground">Wagons</th>
                      <th className="text-left p-4 font-semibold text-foreground">LP</th>
                      <th className="text-right p-4 font-semibold text-foreground">Util %</th>
                      <th className="text-right p-4 font-semibold text-foreground">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimizationResult.rake_plan.map((item, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition">
                        <td className="p-4 text-foreground font-medium">{item.order_id}</td>
                        <td className="p-4 text-foreground/80">{item.customer_name}</td>
                        <td className="p-4 text-foreground/80">{item.product_type}</td>
                        <td className="p-4 text-right text-foreground font-medium">{item.allocated_quantity_tonnes.toFixed(1)} MT</td>
                        <td className="p-4 text-primary font-medium">{item.rake_id}</td>
                        <td className="p-4 text-foreground/80">{item.wagon_id}</td>
                        <td className="p-4 text-right text-foreground">{item.wagon_index || 1}</td>
                        <td className="p-4 text-foreground/80">{item.platform_id}</td>
                        <td className="p-4 text-right"><span className="text-green-400 font-medium">{Math.round(item.utilization_percent_for_wagon)}%</span></td>
                        <td className="p-4 text-right text-foreground font-medium">₹{Math.round(item.total_estimated_cost / 1000)}k</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Natural Language Explanations */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">AI Explanations</h2>
              <div className="card-glow p-6 space-y-6">
                {optimizationResult.natural_language_plan.map((item, idx) => (
                  <div key={idx} className="space-y-2 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                    <p className="text-sm text-foreground/90">{item.sentence}</p>
                    <p className="text-xs text-muted-foreground italic">Reason: {item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 justify-center">
              <Button className="btn-gradient h-12 px-8">Save to Database</Button>
              <Button variant="outline" className="h-12 px-8">Download Plan</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground">Import Data</h1>
            <p className="text-lg text-muted-foreground">Upload CSV orders for AI-powered optimization</p>
          </div>

          {/* Upload Zone */}
          <div
            className={`card-glow border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
              uploadedFile ? "border-primary/30 bg-primary/5" : "border-primary/20 hover:border-primary/40"
            }`}
            onClick={handleFileSelect}
          >
            {uploadedFile ? (
              <div className="space-y-4">
                <div className="inline-block p-3 rounded-lg bg-primary/10">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadedFile.validRows} valid orders loaded
                  </p>
                </div>
                {uploadedFile.status === "error" && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    {uploadedFile.errors.map((err, idx) => (
                      <p key={idx} className="text-xs text-red-300">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="inline-block p-3 rounded-lg bg-primary/10">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">or click to select</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Validation Summary */}
          {uploadedFile && (
            <div className="grid grid-cols-3 gap-4 animate-scale-in">
              <div className="card-glow p-6 space-y-2 border-l-4 border-green-400">
                <p className="text-sm text-muted-foreground font-medium">Valid Orders</p>
                <p className="text-3xl font-bold text-green-400">{uploadedFile.validRows}</p>
              </div>

              <div className={`card-glow p-6 space-y-2 border-l-4 ${uploadedFile.invalidRows > 0 ? "border-yellow-500" : "border-green-400"}`}>
                <p className="text-sm text-muted-foreground font-medium">Invalid Orders</p>
                <p className={`text-3xl font-bold ${uploadedFile.invalidRows > 0 ? "text-yellow-500" : "text-green-400"}`}>
                  {uploadedFile.invalidRows}
                </p>
              </div>

              <div className="card-glow p-6 space-y-2 border-l-4 border-blue-400">
                <p className="text-sm text-muted-foreground font-medium">Total Processed</p>
                <p className="text-3xl font-bold text-blue-400">{uploadedFile.validRows + uploadedFile.invalidRows}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          {/* AI Reasoning Steps */}
          {uploadedFile && uploadedFile.status === "success" && (
            <div className="card-glow p-8 space-y-6 animate-scale-in">
              <div>
                <p className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20">⚙️</span>
                  AI Reasoning Steps
                </p>
              </div>

              <div className="space-y-3">
                {REASONING_STEPS.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-foreground">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {uploadedFile && uploadedFile.status === "success" && (
            <div className="card-glow p-8 space-y-4 border-primary/40 animate-scale-in">
              <p className="text-center text-foreground">Ready to proceed?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleRunOptimization}
                  className="btn-gradient h-12 px-8 flex items-center gap-2"
                  disabled={isOptimizing}
                >
                  {isOptimizing && <Loader className="w-4 h-4 animate-spin" />}
                  {isOptimizing ? "Optimizing..." : "Run AI Optimization"}
                </Button>

                <Button
                  onClick={handlePreviewFile}
                  variant="outline"
                  className="h-12 px-8 border-primary/30"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Data
                </Button>

                <Button
                  onClick={() => {
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  variant="outline"
                  className="h-12 px-8 border-red-500/30 text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear File
                </Button>
              </div>
              <div className="text-center text-green-400 text-sm font-semibold">
                All validations passed! Click "Run AI Optimization" to proceed.
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="card-glow p-6 border-primary/20">
            <p className="text-sm text-foreground/80">
              <strong>Format:</strong> Your CSV must include: order_id, customer_name, customer_location, product_type, material_grade, quantity_tonnes, destination. Optional: priority, due_date, preferred_mode, distance_km, penalty_rate_per_day.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Preview</DialogTitle>
            <DialogDescription>
              {previewData?.rowCount || 0} rows loaded
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {previewData.headers.map((header, idx) => (
                      <th
                        key={idx}
                        className="text-left p-2 bg-muted/50 font-semibold text-foreground"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.slice(0, 10).map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-border/50">
                      {previewData.headers.map((header, colIdx) => (
                        <td key={colIdx} className="p-2 text-foreground/80">
                          {String(row[header] || "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
