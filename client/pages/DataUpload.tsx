import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useState, useRef } from "react";
import { parseCSV, validateCSVData } from "@/lib/csv-parser";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadState {
  name: string;
  status: "pending" | "uploading" | "validating" | "success" | "error";
  validRows: number;
  invalidRows: number;
  errors: string[];
  data?: Record<string, unknown>[];
}

const REQUIRED_COLUMNS = [
  "order_id",
  "customer_name",
  "customer_location",
  "product_type",
  "material_grade",
  "quantity_tonnes",
  "destination",
  "priority",
  "due_date",
  "preferred_mode",
  "distance_km",
  "penalty_rate_per_day",
];

export default function DataUpload() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileUploadState | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const handleFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
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

  const handleUseSampleDataset = async () => {
    setIsLoadingSample(true);
    try {
      const response = await fetch("/api/plan-rakes/demo");
      if (!response.ok) throw new Error("Failed to load sample dataset");
      
      const data = await response.json();
      
      // Create a mock file state with sample data
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sample dataset",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleProceedToOptimization = () => {
    if (!uploadedFile?.data) return;
    window.location.href = `/optimization-run`;
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground">Data Upload</h1>
            <p className="text-lg text-muted-foreground">Import order data for AI-powered rake optimization</p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Upload Area */}
            <div className="lg:col-span-2">
              {/* Upload Zone */}
              <div
                className={`card-glow border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                  uploadedFile ? "border-primary/30 bg-primary/5" : "border-primary/20 hover:border-primary/40"
                }`}
                onClick={handleFileSelect}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className={`inline-block p-3 rounded-lg ${
                      uploadedFile.status === "success" ? "bg-primary/10" : "bg-red-500/10"
                    }`}>
                      {uploadedFile.status === "success" ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {uploadedFile.validRows} valid orders loaded
                      </p>
                    </div>
                    {uploadedFile.status === "error" && (
                      <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-left">
                        {uploadedFile.errors.slice(0, 3).map((err, idx) => (
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
                <div className="grid grid-cols-3 gap-4 mt-8 animate-scale-in">
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

              {/* Action Buttons */}
              {uploadedFile && uploadedFile.status === "success" && (
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleProceedToOptimization}
                    className="btn-gradient h-12 px-8 flex items-center gap-2"
                  >
                    Proceed to Optimization
                  </Button>

                  <Button
                    onClick={handleClearFile}
                    variant="outline"
                    className="h-12 px-8 border-red-500/30 text-red-400"
                  >
                    Clear & Upload Another
                  </Button>
                </div>
              )}
            </div>

            {/* Right Panel: Schema + Sample Dataset */}
            <div className="space-y-6">
              {/* Sample Dataset Card */}
              <div className="card-glow p-6 space-y-4 border-primary/20">
                <h3 className="font-bold text-foreground text-lg">Quick Start</h3>
                <p className="text-sm text-muted-foreground">
                  Don't have data ready? Load our sample SAIL Bokaro dataset.
                </p>
                <Button
                  onClick={handleUseSampleDataset}
                  disabled={isLoadingSample}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-10"
                >
                  {isLoadingSample && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Use Sample SAIL Dataset
                </Button>
              </div>

              {/* Required Schema */}
              <div className="card-glow p-6 space-y-4 border-primary/20">
                <h3 className="font-bold text-foreground text-lg">Required Columns</h3>
                <div className="space-y-2">
                  {REQUIRED_COLUMNS.map((col) => (
                    <div key={col} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono text-foreground/80">
                        {col}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example Data */}
              <div className="card-glow p-6 space-y-3 border-primary/20">
                <h3 className="font-bold text-foreground text-sm">Example Row</h3>
                <div className="text-xs bg-muted/30 p-3 rounded font-mono text-foreground/70 overflow-x-auto">
                  <p>ORD-001,ABC Corp,Delhi,Hot Rolled Coils,High Grade,45,Bokaro,1,2025-12-25,Rail,1200,500</p>
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
  const products = ["Hot Rolled Coils", "Cold Rolled Sheets", "Galvanized Steel", "Stainless Steel"];
  const grades = ["High Grade", "Medium Grade", "Low Grade"];
  const destinations = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Kolkata", "Chennai"];
  const locations = ["Bokaro", "Jamshedpur", "Rourkela", "Durgapur"];

  const orders = [];
  for (let i = 1; i <= 20; i++) {
    const priority = i <= 5 ? 1 : i <= 12 ? 2 : 3;
    orders.push({
      order_id: `ORD-${String(i).padStart(3, "0")}`,
      customer_name: `Customer ${String(Math.floor((i - 1) / 3) + 1).padStart(2, "0")}`,
      customer_location: destinations[Math.floor(Math.random() * destinations.length)],
      product_type: products[Math.floor(Math.random() * products.length)],
      material_grade: grades[Math.floor(Math.random() * grades.length)],
      quantity_tonnes: 40 + Math.random() * 60,
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      priority,
      due_date: "2025-12-25",
      preferred_mode: priority === 1 ? "Rail" : Math.random() > 0.3 ? "Rail" : "Road",
      distance_km: 800 + Math.random() * 1200,
      penalty_rate_per_day: 500 + Math.random() * 500,
    });
  }
  return orders;
}
