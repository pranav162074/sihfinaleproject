import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
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
  // 1. Start everything as 'pending' and currentStep at 0
  const navigate = useNavigate(); 
  
  // 2. STATE
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); 
  const [steps, setSteps] = useState(VALIDATION_STEPS);

  // 3. THE FUNCTION
  const handleRunOptimization = async () => {
    setIsRunning(true);
    setSteps(VALIDATION_STEPS);

    for (let i = 1; i <= VALIDATION_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSteps((prev) =>
        prev.map((step) =>
          step.id === i ? { ...step, status: "complete" } : step
        )
      );
    }

    setIsRunning(false);

    // This will now work because navigate is in the top-level scope
    setTimeout(() => {
      navigate("/rake-plan");
    }, 1000);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Optimization Run
            </h1>
            <p className="text-lg text-muted-foreground">
              Configure parameters and execute the AI rake formation algorithm
            </p>
          </div>

          {/* Validation Pipeline */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Optimization Pipeline
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRunning
                  ? `Running: Step ${currentStep} of ${steps.length}`
                  : "Review the validation steps"}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`card-glow p-6 transition-all ${
                    step.status === "complete"
                      ? "border-emerald-500/30"
                      : "border-border/30"
                  } ${currentStep === step.id ? "scale-105 border-primary/50" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {step.status === "complete" ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : currentStep === step.id ? (
                        <Loader className="w-6 h-6 text-primary animate-spin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-border/30 flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {step.id}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {step.label}
                      </p>
                      <div className="mt-2 h-1 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            step.status === "complete"
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-500 w-full"
                              : currentStep === step.id
                                ? "bg-gradient-to-r from-primary to-secondary w-3/4"
                                : "w-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Section */}
          {!isRunning && (
            <div className="card-glow p-8 space-y-6 border-primary/20">
              <h2 className="text-2xl font-bold text-foreground">
                Optimization Parameters
              </h2>

              <div className="space-y-6">
                {/* Cost vs SLA Slider */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Cost vs SLA Priority (50/50 default)
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Balance between minimizing costs and meeting delivery
                      deadlines
                    </p>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full"
                  />
                </div>

                {/* Min Utilization */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-2">
                      Minimum Rake Utilization: 75%
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Minimum wagon fill percentage (65-95%)
                    </p>
                  </div>
                  <input
                    type="range"
                    min="65"
                    max="95"
                    defaultValue="75"
                    className="w-full"
                  />
                </div>

                {/* Multi-destination Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/30">
                  <div>
                    <p className="font-semibold text-foreground">
                      Allow Multi-Destination Rakes
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mix orders from different destinations in single rake
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-primary/30 rounded-full flex items-center justify-end pr-1">
                    <div className="w-5 h-5 bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary - Shown after optimization */}
          {!isRunning && currentStep === 6 && (
            <div className="card-glass p-8 space-y-6 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 animate-fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    Optimization Complete!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your rake formations have been optimized. Review the
                    allocation plan to see AI-generated explanations for each
                    order.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!isRunning && currentStep < 4 && (
              <Button
                onClick={handleRunOptimization}
                className="btn-gradient flex-1 h-12 text-base font-semibold"
              >
                <Loader className="w-4 h-4 mr-2" />
                Run Optimization
              </Button>
            )}

            {isRunning && (
              <Button
                disabled
                className="btn-gradient flex-1 h-12 text-base font-semibold"
              >
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Running Optimization...
              </Button>
            )}

            {!isRunning && currentStep === 6 && (
              <>
                <Button
                  onClick={() => navigate("/rake-plan")}
                  className="btn-gradient flex-1 h-12 text-base font-semibold"
                >
                  View Results
                </Button>
              </>
            )}

            <Button
              variant="outline"
              className="h-12 px-8 border-primary/30"
              onClick={() => navigate("/upload")}
            >
              Upload Different Data
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
