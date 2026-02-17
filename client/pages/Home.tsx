import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Zap,
  BarChart3,
  TrendingUp,
  Truck,
  Clock,
  DollarSign,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Hero Section */}
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold text-foreground leading-tight">
                Steel Logistics
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {" "}
                  Optimized
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                OptiRake DSS uses advanced AI algorithms to optimize rake
                formations and transport allocation for SAIL steel distribution,
                cutting costs by up to 63% while maintaining SLA compliance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate("/upload")}
                className="btn-gradient h-12 px-8 text-base font-semibold"
              >
                Start Optimization <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/about")}
                className="h-12 px-8 border-primary/30"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Problem Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-bold text-foreground">
                Manual rake formation leads to inefficiency
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Problem Card 1 */}
              <div className="card-glass p-8 space-y-4 border border-rose-500/30 group hover:border-rose-500/60 transition-all stagger-item">
                <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <h4 className="text-lg font-bold text-foreground">
                  Suboptimal Consolidation
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Orders are allocated manually without considering optimal rake
                  formations, resulting in incomplete rakes and wasted
                  transportation capacity.
                </p>
              </div>

              {/* Problem Card 2 */}
              <div className="card-glass p-8 space-y-4 border border-rose-500/30 group hover:border-rose-500/60 transition-all stagger-item">
                <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-rose-400" />
                </div>
                <h4 className="text-lg font-bold text-foreground">
                  High Operational Costs
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Suboptimal transport mode decisions (rail vs road) and poor
                  rake utilization inflate logistics costs significantly.
                </p>
              </div>

              {/* Problem Card 3 */}
              <div className="card-glass p-8 space-y-4 border border-rose-500/30 group hover:border-rose-500/60 transition-all stagger-item">
                <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-rose-400" />
                </div>
                <h4 className="text-lg font-bold text-foreground">
                  SLA & Demurrage Risks
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Manual processes cause delays, missed SLAs, and unexpected
                  demurrage penalties that erode profitability.
                </p>
              </div>
            </div>
          </div>

          {/* Solution Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-bold text-foreground">
                AI-powered optimization for every order
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Solution Card 1 */}
              <div className="card-glass p-8 space-y-4 border border-primary/30 group hover:border-primary/60 transition-all stagger-item">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-foreground">
                  Smart Consolidation
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  AI algorithms analyze all orders and destinations to form
                  optimal rakes that maximize utilization while meeting delivery
                  windows.
                </p>
              </div>

              {/* Solution Card 2 */}
              <div className="card-glass p-8 space-y-4 border border-primary/30 group hover:border-primary/60 transition-all stagger-item">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-foreground">
                  Cost Optimization
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Automated mode selection between rail and road based on
                  distance, volume, and time constraints minimizes per-unit
                  transport costs.
                </p>
              </div>

              {/* Solution Card 3 */}
              <div className="card-glass p-8 space-y-4 border border-primary/30 group hover:border-primary/60 transition-all stagger-item">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-foreground">
                  SLA Compliance
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  All allocations respect delivery deadlines and minimize
                  demurrage risk through predictive planning and constraint
                  satisfaction.
                </p>
              </div>
            </div>
          </div>

          {/* What OptiRake Offers Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-bold text-foreground">
                What OptiRake DSS delivers
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="card-glow p-8 space-y-4 border border-primary/20 stagger-item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-lg font-bold text-foreground">
                      Rake Formation Planning
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Automatically groups orders into optimal rake
                      configurations with detailed allocation reasoning. Each
                      order gets a dedicated wagon assignment with crane
                      capacity verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="card-glow p-8 space-y-4 border border-primary/20 stagger-item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-lg font-bold text-foreground">
                      Transport Mode Optimization
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Intelligently splits orders between rail and road based on
                      cost, distance, and urgency. Typical savings: 60-70% vs
                      baseline all-road transport.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="card-glow p-8 space-y-4 border border-primary/20 stagger-item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-lg font-bold text-foreground">
                      Real-time Analytics
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Dashboard displays KPIs including rake utilization rates,
                      cost savings, SLA compliance percentage, and order
                      processing metrics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="card-glow p-8 space-y-4 border border-primary/20 stagger-item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="text-lg font-bold text-foreground">
                      Export & Dispatch
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Generate detailed reports in CSV and PDF formats ready for
                      operations teams, with override capabilities for human
                      judgment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="card-gradient p-12 space-y-6 rounded-2xl border border-primary/30 text-center">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">
                Ready to optimize?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your order data and watch OptiRake DSS compute optimal
                rake formations in real-time
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/upload")}
                className="btn-gradient h-12 px-8 text-base font-semibold"
              >
                Upload Data <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/about")}
                className="h-12 px-8 border-primary/30"
              >
                About This Project
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8">
            <div className="space-y-2 text-center">
              <p className="text-4xl font-bold text-primary">63%</p>
              <p className="text-muted-foreground">Cost Savings</p>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-4xl font-bold text-primary">95%+</p>
              <p className="text-muted-foreground">SLA Compliance</p>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-4xl font-bold text-primary">87%+</p>
              <p className="text-muted-foreground">Rake Utilization</p>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-4xl font-bold text-primary">2 min</p>
              <p className="text-muted-foreground">Optimization Time</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
