import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, Loader, AlertCircle, Trash2, Eye, Download } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { parseCSV, validateCSVData, convertParsedDataToFormat } from "@/lib/csv-parser";
import { downloadCSVTemplate } from "@/lib/csv-templates";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OptimizeRakesResponse } from "@shared/api";

interface FileUploadState {
  name: string;
  type: string;
  status: "pending" | "uploading" | "success" | "error";
  rowCount: number;
  errors: string[];
  data?: Record<string, unknown>[];
}

interface PreviewData {
  fileType: string;
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export default function DataInput() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, FileUploadState>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizeRakesResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [dragOverFile, setDragOverFile] = useState<string | null>(null);

  const fileConfigs = [
    {
      id: "orders",
      name: "orders.csv",
      requiredColumns: ["order_id", "customer_id", "destination", "material_id", "quantity_tonnes", "priority", "due_date"],
      purpose: "Customer orders — what needs to be shipped where and when",
    },
    {
      id: "stockyards",
      name: "stockyards.csv",
      requiredColumns: ["stockyard_id", "location", "material_id", "available_tonnage", "loading_point_id"],
      purpose: "Inventory — what materials are available where",
    },
    {
      id: "rakes",
      name: "rakes.csv",
      requiredColumns: ["rake_id", "wagon_type", "num_wagons", "total_capacity_tonnes"],
      purpose: "Available rakes — train capacity and wagon count",
    },
    {
      id: "product_wagon_matrix",
      name: "product_wagon_matrix.csv",
      requiredColumns: ["material_id", "wagon_type", "max_load_per_wagon_tonnes", "allowed"],
      purpose: "Compatibility — which materials fit in which wagon types",
    },
    {
      id: "loading_points",
      name: "loading_points.csv",
      requiredColumns: ["loading_point_id", "stockyard_id", "max_rakes_per_day", "loading_rate_tonnes_per_hour"],
      purpose: "Loading facilities — max rakes per day, loading speed",
    },
    {
      id: "routes_costs",
      name: "routes_costs.csv",
      requiredColumns: ["origin", "destination", "mode", "distance_km", "transit_time_hours", "cost_per_tonne"],
      purpose: "Routes — distance, cost, and transit time",
    },
  ];

  const handleFileSelect = (fileType: string) => {
    const input = fileInputRefs.current[fileType];
    if (input) input.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, fileType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFile(fileType);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFile(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, fileType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFile(null);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    // Simulate file input change
    const input = fileInputRefs.current[fileType];
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  const handleFileChange = (fileType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [fileType]: {
        name: file.name,
        type: fileType,
        status: "uploading",
        rowCount: 0,
        errors: [],
      },
    }));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const config = fileConfigs.find(f => f.id === fileType)!;
        
        const parsedData = parseCSV(csvContent);
        const validation = validateCSVData(parsedData, config.requiredColumns);

        if (!validation.isValid) {
          const errorDetails: string[] = [];
          if (validation.missingColumns.length > 0) {
            errorDetails.push(`Missing columns: ${validation.missingColumns.join(', ')}`);
          }
          if (validation.errorRows.length > 0) {
            errorDetails.push(`${validation.errorRows.length} rows have missing data`);
          }

          setUploadedFiles(prev => ({
            ...prev,
            [fileType]: {
              name: file.name,
              type: fileType,
              status: "error",
              rowCount: parsedData.rowCount,
              errors: errorDetails,
            },
          }));

          toast({
            title: `${config.name} - Validation Error`,
            description: errorDetails.join('; '),
            variant: "destructive",
          });
          return;
        }

        const convertedData = convertParsedDataToFormat(parsedData, fileType);

        setUploadedFiles(prev => ({
          ...prev,
          [fileType]: {
            name: file.name,
            type: fileType,
            status: "success",
            rowCount: parsedData.rowCount,
            errors: [],
            data: convertedData as Record<string, unknown>[],
          },
        }));

        toast({
          title: `${config.name} - Success`,
          description: `Loaded ${parsedData.rowCount} rows successfully`,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to parse file";
        setUploadedFiles(prev => ({
          ...prev,
          [fileType]: {
            name: file.name,
            type: fileType,
            status: "error",
            rowCount: 0,
            errors: [errorMsg],
          },
        }));

        toast({
          title: "Parse Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: {
          name: file.name,
          type: fileType,
          status: "error",
          rowCount: 0,
          errors: ["Failed to read file"],
        },
      }));

      toast({
        title: "Read Error",
        description: "Failed to read the file",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  };

  const handlePreviewFile = (fileType: string) => {
    const fileState = uploadedFiles[fileType];
    if (!fileState?.data) return;

    const config = fileConfigs.find(f => f.id === fileType)!;
    const parsedData = parseCSV(
      Object.keys(fileState.data[0] || {}).join(',') + '\n' +
      fileState.data.map(row => 
        Object.values(row).map(v => 
          typeof v === 'string' && v.includes(',') ? `"${v}"` : v
        ).join(',')
      ).join('\n')
    );

    setPreviewData({
      fileType: config.name,
      headers: parsedData.headers,
      rows: parsedData.rows,
      rowCount: fileState.rowCount,
    });
    setShowPreviewDialog(true);
  };

  const handleRemoveFile = (fileType: string) => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[fileType];
      return updated;
    });
  };

  const handleUseSampleData = async () => {
    setIsOptimizing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/sample-dataset");
      if (!response.ok) throw new Error("Failed to load sample data");
      const sampleDataset = await response.json();

      const optimResponse = await fetch("/api/optimize-rakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sampleDataset,
          config: {
            cost_vs_sla_weight: 0.6,
            allow_multi_destination_rakes: true,
            min_utilization_percent: 70,
          },
        }),
      });

      if (!optimResponse.ok) {
        throw new Error("Optimization failed");
      }

      const result = (await optimResponse.json()) as OptimizeRakesResponse;
      setOptimizationResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to run optimization");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    setErrorMessage(null);

    try {
      const uploadPayload: Record<string, unknown> = {};
      
      for (const [fileType, fileState] of Object.entries(uploadedFiles)) {
        if (fileState.status === "success" && fileState.data) {
          uploadPayload[fileType] = fileState.data;
        }
      }

      const uploadResponse = await fetch("/api/upload-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadPayload),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload data");
      }

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.ready_to_optimize) {
        const errors = Object.entries(uploadResult.validation_results)
          .flatMap(([file, result]: [string, any]) => 
            result.errors.length > 0 
              ? [`${file}: ${result.errors.join(', ')}`]
              : []
          );
        throw new Error(errors.join('; '));
      }

      // Build optimization request
      const optimPayload: any = {
        config: {
          cost_vs_sla_weight: 0.6,
          allow_multi_destination_rakes: true,
          min_utilization_percent: 70,
        },
      };

      for (const [fileType, fileState] of Object.entries(uploadedFiles)) {
        if (fileState.status === "success" && fileState.data) {
          if (fileType === "stockyards") optimPayload.stockyards = fileState.data;
          else if (fileType === "orders") optimPayload.orders = fileState.data;
          else if (fileType === "rakes") optimPayload.rakes = fileState.data;
          else if (fileType === "product_wagon_matrix") optimPayload.product_wagon_matrix = fileState.data;
          else if (fileType === "loading_points") optimPayload.loading_points = fileState.data;
          else if (fileType === "routes_costs") optimPayload.routes_costs = fileState.data;
        }
      }

      const optimResponse = await fetch("/api/optimize-rakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(optimPayload),
      });

      if (!optimResponse.ok) {
        throw new Error("Optimization failed");
      }

      const result = (await optimResponse.json()) as OptimizeRakesResponse;
      setOptimizationResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to run optimization");
    } finally {
      setIsOptimizing(false);
    }
  };

  const allFilesUploaded = Object.values(uploadedFiles).every(f => f.status === "success");

  // Show results if optimization is complete
  if (optimizationResult) {
    return (
      <Layout>
        <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="space-y-2 animate-fade-in">
              <h1 className="text-4xl font-bold text-foreground">Optimization Complete</h1>
              <p className="text-lg text-muted-foreground">Review your results below</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
              <div className="card-glow p-6 space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Rakes Formed</p>
                <p className="text-3xl font-bold text-primary">{optimizationResult.kpi_summary.number_of_rakes_planned}</p>
                <p className="text-xs text-green-400">Ready for dispatch</p>
              </div>

              <div className="card-glow p-6 space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Total Quantity</p>
                <p className="text-3xl font-bold text-primary">
                  {Math.round(optimizationResult.planned_rakes.reduce((sum, r) => sum + r.total_tonnage_assigned, 0))} MT
                </p>
                <p className="text-xs text-muted-foreground">Processed</p>
              </div>

              <div className="card-glow p-6 space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Avg Utilization</p>
                <p className="text-3xl font-bold text-green-400">
                  {Math.round(optimizationResult.kpi_summary.average_rake_utilization_percent)}%
                </p>
                <p className="text-xs text-muted-foreground">Wagon fill rate</p>
              </div>

              <div className="card-glow p-6 space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Total Cost</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{(optimizationResult.kpi_summary.total_cost_optimized / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/rake-planner")}
                className="btn-gradient h-12 px-8"
              >
                Review Rake Plan
              </Button>
              <Button
                onClick={() => navigate("/orders")}
                variant="outline"
                className="h-12 px-8 border-primary/30 hover:border-primary/60"
              >
                View Order Allocations
              </Button>
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
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground">Data Input</h1>
            <p className="text-lg text-muted-foreground">
              Upload 6 essential CSV files or use sample data to run optimization.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>Upload Status:</strong> {Object.values(uploadedFiles).filter(f => f.status === "success").length} of 6 files loaded
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(Object.values(uploadedFiles).filter(f => f.status === "success").length / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
            {fileConfigs.map((config) => {
              const fileState = uploadedFiles[config.id];
              const isUploaded = fileState?.status === "success";
              const hasError = fileState?.status === "error";

              return (
                <div
                  key={config.id}
                  className={`card-glow p-6 space-y-4 transition-all ${
                    hasError ? "border-red-500/30 bg-red-500/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{config.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{config.purpose}</p>
                    </div>
                    {isUploaded && (
                      <div className="w-5 h-5 text-green-400 flex-shrink-0">✓</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Required Columns:</p>
                    <div className="space-y-1">
                      {config.requiredColumns.map((col, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-primary text-xs font-bold mt-0.5">•</span>
                          <code className="text-xs text-foreground/80 bg-muted/20 px-2 py-1 rounded">
                            {col}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {fileState && (
                    <div className={`p-3 rounded-lg ${
                      isUploaded
                        ? "bg-green-500/10 border border-green-500/20"
                        : hasError
                        ? "bg-red-500/10 border border-red-500/20"
                        : "bg-muted/20"
                    }`}>
                      <div className="text-xs font-medium text-foreground">
                        {fileState.name}
                        {fileState.rowCount > 0 && (
                          <span className="text-muted-foreground ml-2">
                            ({fileState.rowCount} rows)
                          </span>
                        )}
                      </div>
                      {hasError && fileState.errors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {fileState.errors.map((error, idx) => (
                            <p key={idx} className="text-xs text-red-300">
                              • {error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleFileSelect(config.id)}
                        variant={isUploaded ? "outline" : "default"}
                        className={isUploaded ? "flex-1 opacity-50" : "btn-gradient flex-1"}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploaded ? "Uploaded" : "Upload CSV"}
                      </Button>

                      <Button
                        onClick={() => downloadCSVTemplate(config.id, config.name)}
                        variant="outline"
                        size="icon"
                        className="border-primary/30"
                        title="Download template"
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      {isUploaded && (
                        <>
                          <Button
                            onClick={() => handlePreviewFile(config.id)}
                            variant="outline"
                            size="icon"
                            className="border-primary/30"
                            title="Preview data"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleRemoveFile(config.id)}
                            variant="outline"
                            size="icon"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current[config.id] = el;
                    }}
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileChange(config.id, e)}
                    className="hidden"
                  />
                </div>
              );
            })}
          </div>

          <div className="card-glow p-8 space-y-4 border-primary/40">
            <p className="text-center text-foreground">
              Ready to proceed? Choose one of these options:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleRunOptimization}
                className="btn-gradient h-12 px-8 flex items-center gap-2"
                disabled={!allFilesUploaded || isOptimizing}
              >
                {isOptimizing && <Loader className="w-4 h-4 animate-spin" />}
                {isOptimizing ? "Optimizing..." : "Run Optimization"}
              </Button>
              <Button
                onClick={handleUseSampleData}
                disabled={isOptimizing}
                variant="outline"
                className="h-12 px-8 border-primary/30 hover:border-primary/60"
              >
                {isOptimizing && <Loader className="w-4 h-4 animate-spin" />}
                {isOptimizing ? "Optimizing..." : "Use Sample Data"}
              </Button>
            </div>
            {allFilesUploaded && (
              <div className="text-center text-green-400 text-sm font-semibold">
                All files loaded successfully! Click "Run Optimization" to proceed.
              </div>
            )}
          </div>

          <div className="card-glow p-6 border-primary/20">
            <p className="text-sm text-foreground/80">
              <strong>Tip:</strong> Click "Use Sample Data" to see OptiRake DSS in action with example SAIL Bokaro data. Or upload your own CSV files to optimize your actual orders.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Preview: {previewData?.fileType}</DialogTitle>
            <DialogDescription>
              {previewData?.rowCount} rows loaded
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-4">
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
                          <td
                            key={colIdx}
                            className="p-2 text-foreground/80"
                          >
                            {String(row[header] || "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {previewData.rowCount > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing first 10 of {previewData.rowCount} rows
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
