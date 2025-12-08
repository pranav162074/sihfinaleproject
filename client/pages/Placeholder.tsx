import { Layout } from "@/components/Layout";
import { ArrowRight } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Placeholder() {
  const location = useLocation();

  const pageInfo: Record<string, { title: string; description: string }> = {
    "/forecast": {
      title: "AI/ML Forecast Dashboard",
      description:
        "View demand predictions, loading delay forecasts, and order priority analytics powered by machine learning models trained on historical Bokaro → CMO data.",
    },
    "/analytics": {
      title: "Historical Analytics",
      description:
        "Analyze past rake formation plans, delays, manual overrides, and performance metrics. Learn from historical patterns to improve future optimizations.",
    },
    "/admin": {
      title: "Admin Override Console",
      description:
        "Review and apply manual overrides to rake formation plans. Log all changes for audit trails and retraining feedback loops.",
    },
  };

  const page = pageInfo[location.pathname] || {
    title: "Coming Soon",
    description: "This page is under construction.",
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-md text-center space-y-8">
          <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <ArrowRight className="w-10 h-10 text-primary/50" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {page.title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {page.description}
            </p>
          </div>

          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              This page is a placeholder ready for development. Continue
              prompting in the chat to have this page built out with full
              functionality.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted/50 font-semibold transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
