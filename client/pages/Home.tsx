import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Lightbulb, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Hero Section */}
          <div className="space-y-4 animate-fade-in text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              OptiRake DSS
            </h1>
            <p className="text-xl text-foreground/90 max-w-3xl mx-auto leading-relaxed">
              Reduces logistics cost and delays by automatically deciding how customer orders should be assigned to rakes (trainloads) in the most efficient way.
            </p>
          </div>

          {/* Three Main Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
            {/* Problem Section */}
            <div className="card-glow p-8 space-y-4 border-red-500/20">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">Current Problem</h2>
                </div>
              </div>

              <div className="frosted-glass p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Manual Planning</p>
                    <p className="text-sm text-foreground/80">Planners decide which orders fit in which rakes by hand</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Delays & Penalties</p>
                    <p className="text-sm text-foreground/80">Orders miss deadlines → demurrage costs pile up</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Low Utilization</p>
                    <p className="text-sm text-foreground/80">Wagons not fully loaded → wasted capacity & cost</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution Section */}
            <div className="card-glow p-8 space-y-4 border-primary/40">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">What OptiRake DSS Does</h2>
                </div>
              </div>

              <div className="frosted-glass p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Smart Assignment</p>
                    <p className="text-sm text-foreground/80">AI decides which orders go into which rake</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Stockyard Selection</p>
                    <p className="text-sm text-foreground/80">Picks the best inventory location for each order</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Optimal Routing</p>
                    <p className="text-sm text-foreground/80">Chooses rail vs road based on cost, speed, and availability</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Clear Explanations</p>
                    <p className="text-sm text-foreground/80">Shows WHY each decision was made in plain English</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Outcome Section */}
            <div className="card-glow p-8 space-y-4 border-green-500/20">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">What You Get</h2>
                </div>
              </div>

              <div className="frosted-glass p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Daily Rake Plan</p>
                    <p className="text-sm text-foreground/80">Exactly which orders fit in each rake</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Cost Savings</p>
                    <p className="text-sm text-foreground/80">Lower freight + zero demurrage penalties</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">High Utilization</p>
                    <p className="text-sm text-foreground/80">Wagons fully loaded, less wasted space</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">SLA Assurance</p>
                    <p className="text-sm text-foreground/80">All deadlines met, zero delays</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="card-glow p-8 space-y-4 text-center border-primary/40">
            <p className="text-lg font-semibold text-foreground">
              Upload real SAIL data → Click Optimize → Get the best transportation plan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/data-input">
                <Button className="btn-gradient gap-2 h-12">
                  Upload Data <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  className="border-primary/30 hover:border-primary/60 h-12 gap-2"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
