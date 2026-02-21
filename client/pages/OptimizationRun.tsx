import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VALIDATION_STEPS = [
  { id: 1, label: "Parse CSV Data", status: "pending" },
  { id: 2, label: "Validate Schema", status: "pending" },
  { id: 3, label: "Check Business Rules", status: "pending" },
  { id: 4, label: "Allocate Orders to Rakes", status: "pending" },
  { id: 5, label: "Optimize Wagon Utilization", status: "pending" },
  { id: 6, label: "Generate Explanations", status: "pending" },
];

export default function OptimizationRun() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(VALIDATION_STEPS);
  const [hasData, setHasData] = useState(false);

  // GATEKEEPER EFFECT: Check for data on mount
  useEffect(() => {
    const data = sessionStorage.getItem("uploadedOrders");
    if (!data) {
      // No data found? Redirect to upload page immediately
      navigate("/upload");
    } else {
      setHasData(true);
    }
  }, [navigate]);

  const handleRunOptimization = async () => {
    if (!hasData) return;

    setIsRunning(true);
    setSteps(VALIDATION_STEPS.map(s => ({ ...s, status: "pending" })));

    for (let i = 1; i <= VALIDATION_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 1000));
      setSteps(prev => prev.map(s => s.id === i ? { ...s, status: "complete" } : s));
    }

    setIsRunning(false);
    setTimeout(() => navigate("/rake-plan"), 800);
  };

  // Prevent UI flashing while redirecting
  if (!hasData) return null;

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          <div className="space-y-4 text-center sm:text-left">
            <h1 className="text-5xl font-bold tracking-tight">Run Optimization</h1>
            <p className="text-muted-foreground text-lg italic">
              Analyzing orders and calculating optimal rake formations...
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4">
              {steps.map((step) => (
                <div key={step.id} className={`card-glow p-6 border-2 transition-all duration-300 ${
                    step.status === "complete" ? "border-emerald-500/30 bg-emerald-500/5 opacity-80" : 
                    currentStep === step.id ? "border-primary/50 bg-primary/5 scale-[1.01] shadow-lg shadow-primary/5" : "border-border/20"
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {step.status === "complete" ? (
                        <div className="bg-emerald-500 rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                      ) : currentStep === step.id ? (
                        <Loader className="animate-spin text-primary w-6 h-6" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">{step.id}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className={`font-bold ${currentStep === step.id ? "text-primary" : "text-foreground"}`}>
                          {step.label}
                        </p>
                        {currentStep === step.id && <span className="text-[10px] uppercase font-black text-primary animate-pulse">Processing</span>}
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ease-in-out ${
                            step.status === "complete" ? "w-full bg-emerald-500" : currentStep === step.id ? "w-2/3 bg-primary" : "w-0"
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                onClick={handleRunOptimization} 
                disabled={isRunning} 
                className="btn-gradient flex-1 h-16 font-black text-xl tracking-widest"
              >
                {isRunning ? "Computing Optimal Scheduling..." : "Run AI Optimization"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/upload")} 
                disabled={isRunning}
                className="h-16 px-8 border-primary/20"
              >
                Reset & Re-upload
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}