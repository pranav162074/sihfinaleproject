import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader,
  FileText,
  Eye,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { parseCSV, validateCSVData } from "@/lib/csv-parser";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
  data?: Record<string, any>[];
}

export default function DataUpload() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileUploadState | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // Load existing data if available
  useEffect(() => {
    const existing = sessionStorage.getItem("uploadedOrders");
    if (existing) {
      const data = JSON.parse(existing);
      setUploadedFile({
        name: "Restored Session Data",
        status: "success",
        validRows: data.length,
        invalidRows: 0,
        errors: [],
        data: data,
      });
    }
  }, []);

  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast({ title: "Invalid file type", variant: "destructive" });
      return;
    }

    setUploadedFile({ name: file.name, status: "validating", validRows: 0, invalidRows: 0, errors: [] });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const parsedData = parseCSV(csvContent);
        const validation = validateCSVData(parsedData, REQUIRED_COLUMNS);

        if (!validation.isValid) {
          setUploadedFile({
            name: file.name,
            status: "error",
            validRows: validation.validRows,
            invalidRows: validation.invalidRows,
            errors: validation.missingColumns.map(c => `Missing column: ${c}`),
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
      } catch (error) {
        setUploadedFile({ name: file.name, status: "error", validRows: 0, invalidRows: 0, errors: ["Failed to parse CSV"] });
      }
    };
    reader.readAsText(file);
  };

  const handleUseSampleDataset = () => {
    setIsLoadingSample(true);
    setTimeout(() => {
      const sampleOrders = generateSampleOrders();
      setUploadedFile({
        name: "sample_sail_dataset.csv",
        status: "success",
        validRows: sampleOrders.length,
        invalidRows: 0,
        errors: [],
        data: sampleOrders,
      });
      setIsLoadingSample(false);
    }, 800);
  };

  const handleProceed = () => {
    // STRICT CHECK: Only proceed if data exists and status is success
    if (uploadedFile?.status === "success" && uploadedFile.data) {
      sessionStorage.setItem("uploadedOrders", JSON.stringify(uploadedFile.data));
      navigate("/optimize");
    } else {
      toast({
        title: "No Data Detected",
        description: "Please upload a CSV or load the sample dataset before proceeding.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background to-background/50">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold">Data Upload & Schema</h1>
            <p className="text-muted-foreground text-lg">Import order data for AI Optimization</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragActive(false); processFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`card-glass p-16 text-center border-2 border-dashed transition-all cursor-pointer ${
                  isDragActive ? "border-primary bg-primary/5" : "border-primary/20"
                }`}
              >
                <Upload className="mx-auto w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold">{uploadedFile?.name || "Drop CSV here"}</h3>
                <p className="text-muted-foreground">Click or drag to upload</p>
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
              </div>

              {/* Action Area */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <Button 
                    onClick={handleProceed} 
                    // BUTTON IS DISABLED UNLESS DATA IS READY
                    disabled={uploadedFile?.status !== "success"} 
                    className={`btn-gradient flex-1 h-14 text-lg font-bold transition-all ${
                        uploadedFile?.status !== "success" ? "opacity-40 grayscale cursor-not-allowed" : "shadow-lg shadow-primary/20"
                    }`}
                  >
                    Proceed to Optimization
                  </Button>
                  
                  {uploadedFile?.status === "success" && (
                    <>
                      <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="h-14 px-6">
                        <Eye className="w-4 h-4 mr-2" /> Preview
                      </Button>
                      <Button variant="ghost" onClick={() => {
                        setUploadedFile(null);
                        sessionStorage.removeItem("uploadedOrders");
                      }} className="h-14 text-rose-400 hover:bg-rose-500/10">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {uploadedFile?.status !== "success" && (
                  <p className="text-center text-sm text-muted-foreground italic">
                    Please upload data or load sample to enable optimization.
                  </p>
                )}
              </div>

              {showPreview && uploadedFile?.data && (
                 <div className="card-glow p-4 border-primary/10 overflow-x-auto animate-in zoom-in-95 duration-200">
                    <table className="w-full text-xs text-left">
                        <thead>
                            <tr className="border-b border-border/50 uppercase text-muted-foreground">
                                {REQUIRED_COLUMNS.map(col => <th key={col} className="p-2">{col.replace(/_/g, ' ')}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {uploadedFile.data.slice(0, 10).map((row, i) => (
                                <tr key={i} className="border-b border-border/20">
                                    {REQUIRED_COLUMNS.map(col => <td key={col} className="p-2">{row[col]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="card-glow p-6 border-secondary/20 bg-secondary/5">
                <h3 className="font-bold mb-2">Quick Start</h3>
                <p className="text-sm text-muted-foreground mb-4">No data? Use our SAIL dataset.</p>
                <Button onClick={handleUseSampleDataset} disabled={isLoadingSample} className="w-full bg-secondary text-secondary-foreground font-bold h-11">
                    {isLoadingSample ? <Loader className="animate-spin" /> : "Load Sample Dataset"}
                </Button>
              </div>
              
              <div className="card-glow p-6 border-primary/20">
                <h3 className="font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4"/> Required Schema</h3>
                <div className="space-y-2">
                    {REQUIRED_COLUMNS.map(col => (
                        <div key={col} className="flex items-center gap-2 text-xs">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            <code className="text-primary font-mono">{col}</code>
                        </div>
                    ))}
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
  const destinations = ["Delhi", "Mumbai", "Bangalore"];
  return Array.from({ length: 20 }).map((_, i) => ({
    order_id: `ORD-${i + 1}`,
    customer_name: `Client ${i + 1}`,
    customer_location: destinations[i % 3],
    product_type: "Steel Coils",
    material_grade: "HG-200",
    quantity_tonnes: Math.floor(Math.random() * 50) + 20,
    destination: destinations[i % 3],
  }));
}