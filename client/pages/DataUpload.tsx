import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, AlertCircle, Loader, FileText, Eye, X } from "lucide-react";
import { useState, useRef } from "react";
import { parseCSV, validateCSVData } from "@/lib/csv-parser";
import { useToast } from "@/components/ui/use-toast";

const REQUIRED_COLUMNS = [
  "order_id",
  "customer_name",
  "customer_location",
  "product_type",
  "material_grade",
  "quantity_tonnes",
  "destination",
];

interface FileUploadState {
  name: string;
  status: "validating" | "success" | "error";
  validRows: number;
  invalidRows: number;
  errors: string[];
  data?: Record<string, unknown>[];
}

interface PreviewState {
  currentPage: number;
  rowsPerPage: number;
}

export default function DataUpload() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileUploadState | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState>({ currentPage: 0, rowsPerPage: 10 });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
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
            ...validation.missingColumns.map((col) => `Missing required column: ${col}`),
            ...validation.errorRows.slice(0, 3).map((row) => `Row ${row.rowIndex}: ${row.errors.join(", ")}`),
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
          description: `${parsedData.rowCount} orders loaded`,
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

  const handleUseSampleDataset = async () => {
    setIsLoadingSample(true);
    try {
      const sampleOrders = generateSampleOrders();
      setUploadedFile({
        name: "sample_sail_dataset.csv",
        status: "success",
        validRows: sampleOrders.length,
        invalidRows: 0,
        errors: [],
        data: sampleOrders,
      });

      toast({
        title: "Sample Dataset Loaded",
        description: `${sampleOrders.length} sample orders loaded successfully`,
      });
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleProceed = () => {
    if (!uploadedFile?.data) return;
    sessionStorage.setItem("uploadedOrders", JSON.stringify(uploadedFile.data));
    window.location.href = "/optimize";
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Data Upload & Schema
            </h1>
            <p className="text-lg text-muted-foreground">
              Import your order data and validate against the required schema
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area - 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Drag-Drop Zone - Premium */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleFileSelect}
                className={`card-glass group p-16 text-center transition-all cursor-pointer border-2 border-dashed ${
                  isDragActive
                    ? "border-primary/80 bg-primary/10 scale-105"
                    : uploadedFile
                    ? "border-primary/40"
                    : "border-primary/20 hover:border-primary/40"
                }`}
              >
                <div className="space-y-6">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-lg transition-all ${
                      uploadedFile && uploadedFile.status === "success"
                        ? "bg-emerald-500/20"
                        : uploadedFile && uploadedFile.status === "error"
                        ? "bg-rose-500/20"
                        : "bg-primary/20 group-hover:scale-110 transition-transform"
                    }`}
                  >
                    {uploadedFile && uploadedFile.status === "success" ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    ) : uploadedFile && uploadedFile.status === "error" ? (
                      <AlertCircle className="w-8 h-8 text-rose-400" />
                    ) : (
                      <Upload className="w-8 h-8 text-primary" />
                    )}
                  </div>

                  {uploadedFile ? (
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {uploadedFile.status === "success"
                          ? `${uploadedFile.validRows} orders loaded`
                          : `${uploadedFile.validRows} valid • ${uploadedFile.invalidRows} invalid`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-foreground">Drop your CSV here</p>
                      <p className="text-sm text-muted-foreground">or click to select file</p>
                    </div>
                  )}
                </div>

                {uploadedFile && uploadedFile.status === "error" && (
                  <div className="mt-6 pt-6 border-t border-border/30 space-y-2 text-left">
                    {uploadedFile.errors.map((err, idx) => (
                      <p key={idx} className="text-xs text-rose-400">
                        • {err}
                      </p>
                    ))}
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

            {/* Validation Stats */}
            {uploadedFile && (
              <div className="grid grid-cols-3 gap-4 animate-fade-in">
                  <div className="card-glow p-6 space-y-2 border-emerald-500/20">
                    <p className="kpi-label">Valid Orders</p>
                    <p className="text-3xl font-bold text-emerald-400">{uploadedFile.validRows}</p>
                  </div>

                  <div
                    className={`card-glow p-6 space-y-2 ${
                      uploadedFile.invalidRows > 0
                        ? "border-amber-500/20"
                        : "border-emerald-500/20"
                    }`}
                  >
                    <p className="kpi-label">Invalid Orders</p>
                    <p
                      className={`text-3xl font-bold ${
                        uploadedFile.invalidRows > 0 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {uploadedFile.invalidRows}
                    </p>
                  </div>

                  <div className="card-glow p-6 space-y-2 border-primary/20">
                    <p className="kpi-label">Total Processed</p>
                    <p className="text-3xl font-bold text-primary">
                      {uploadedFile.validRows + uploadedFile.invalidRows}
                    </p>
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            {uploadedFile && uploadedFile.status === "success" && (
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                  <Button
                    onClick={handleProceed}
                    className="btn-gradient flex-1 h-12 text-base font-semibold"
                  >
                    <Loader className="w-4 h-4 mr-2" />
                    Proceed to Optimization
                  </Button>

                  <Button
                    onClick={() => setShowPreview(!showPreview)}
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
                    className="h-12 px-8 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              )}

              {/* Data Preview Modal */}
              {showPreview && uploadedFile?.data && (
                <div className="card-glow p-6 space-y-4 border-primary/20 max-h-full overflow-y-auto animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Data Preview</h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-1 hover:bg-muted/30 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30">
                          {REQUIRED_COLUMNS.map((col) => (
                            <th
                              key={col}
                              className="text-left p-2 font-semibold text-muted-foreground text-xs uppercase"
                            >
                              {col.replace(/_/g, " ")}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedFile.data
                          .slice(
                            previewState.currentPage * previewState.rowsPerPage,
                            (previewState.currentPage + 1) * previewState.rowsPerPage
                          )
                          .map((row, idx) => (
                            <tr
                              key={previewState.currentPage * previewState.rowsPerPage + idx}
                              className="border-b border-border/20 hover:bg-muted/10"
                            >
                              {REQUIRED_COLUMNS.map((col) => (
                                <td key={col} className="p-2 text-foreground/80 text-xs">
                                  {String(row[col] || "—")}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      Showing {previewState.currentPage * previewState.rowsPerPage + 1} to{" "}
                      {Math.min((previewState.currentPage + 1) * previewState.rowsPerPage, uploadedFile.data.length)} of{" "}
                      {uploadedFile.data.length} rows
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPreviewState((prev) => ({
                            ...prev,
                            currentPage: Math.max(0, prev.currentPage - 1),
                          }))
                        }
                        disabled={previewState.currentPage === 0}
                        className="border-primary/30 h-8"
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {previewState.currentPage + 1} of{" "}
                        {Math.ceil(uploadedFile.data.length / previewState.rowsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPreviewState((prev) => ({
                            ...prev,
                            currentPage: Math.min(
                              Math.ceil(uploadedFile.data!.length / prev.rowsPerPage) - 1,
                              prev.currentPage + 1
                            ),
                          }))
                        }
                        disabled={
                          (previewState.currentPage + 1) * previewState.rowsPerPage >=
                          uploadedFile.data.length
                        }
                        className="border-primary/30 h-8"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Schema & Sample */}
            <div className="space-y-6">
              {/* Sample Dataset Button */}
              <div className="card-glow p-8 space-y-4 border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5">
                <h3 className="text-lg font-semibold text-foreground">Quick Start</h3>
                <p className="text-sm text-muted-foreground">
                  Don't have data yet? Load our sample SAIL Bokaro dataset to explore the system.
                </p>
                <Button
                  onClick={handleUseSampleDataset}
                  disabled={isLoadingSample}
                  className="w-full h-11 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                >
                  {isLoadingSample && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Load Sample Dataset
                </Button>
              </div>

              {/* Required Schema */}
              <div className="card-glow p-8 space-y-4 border-primary/20">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Required Columns
                </h3>

                <div className="space-y-3">
                  {REQUIRED_COLUMNS.map((col, idx) => (
                    <div key={col} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono text-primary block mb-1">
                          {col}
                        </code>
                        <p className="text-xs text-muted-foreground">
                          {col === "order_id" && "Unique order identifier"}
                          {col === "customer_name" && "Customer organization name"}
                          {col === "customer_location" && "Customer city/location"}
                          {col === "product_type" && "Steel product type"}
                          {col === "material_grade" && "Material quality grade"}
                          {col === "quantity_tonnes" && "Order quantity in metric tonnes"}
                          {col === "destination" && "Delivery destination city"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground border-t border-border/30 pt-4">
                  Optional columns: priority, due_date, preferred_mode, distance_km, penalty_rate_per_day
                </p>
              </div>

              {/* Example Data */}
              <div className="card-glow p-6 space-y-3 border-primary/20">
                <p className="font-semibold text-foreground text-sm">Example Row</p>
                <div className="text-xs bg-muted/30 p-3 rounded font-mono text-foreground/70 overflow-x-auto whitespace-nowrap">
                  ORD-001,ABC Corp,Delhi,Coils,HG,45,Bokaro
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function generateSampleOrders() {
  const products = ["Coils", "Plates", "Sheets", "Bars"];
  const grades = ["High Grade", "Medium Grade", "Low Grade"];
  const destinations = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Kolkata", "Chennai", "Pune", "Ahmedabad"];
  const customers = ["ABC Corp", "XYZ Ltd", "Steel Solutions", "logistics Hub", "National Distributors", "Prime Steel", "Mega Traders"];

  const orders = [];
  for (let i = 1; i <= 19; i++) {
    orders.push({
      order_id: `ORD-${String(i).padStart(3, "0")}`,
      customer_name: customers[Math.floor(Math.random() * customers.length)],
      customer_location: destinations[Math.floor(Math.random() * destinations.length)],
      product_type: products[Math.floor(Math.random() * products.length)],
      material_grade: grades[Math.floor(Math.random() * grades.length)],
      quantity_tonnes: Math.round((40 + Math.random() * 60) * 10) / 10,
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      priority: i <= 5 ? 1 : i <= 12 ? 2 : 3,
      due_date: "2025-12-25",
      preferred_mode: Math.random() > 0.3 ? "rail" : "road",
      distance_km: Math.round(800 + Math.random() * 1200),
      penalty_rate_per_day: 500 + Math.random() * 500,
    });
  }
  return orders;
}
