import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function About() {
  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-secondary/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Header */}
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground">About OptiRake DSS</h1>
            <p className="text-lg text-muted-foreground">Understanding the system in simple terms</p>
          </div>

          {/* What is it */}
          <div className="card-glow p-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">What is OptiRake DSS?</h2>
            <p className="text-lg text-foreground/90 leading-relaxed">
              OptiRake DSS (Decision Support System) is an AI-powered tool that helps logistics planners at steel plants 
              organize customer orders into efficient train rakes. Instead of manually deciding which orders fit where, 
              the system does this automatically by considering:
            </p>
            <div className="frosted-glass p-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">1.</span>
                <p className="text-foreground/90"><strong>Inventory:</strong> What material is available at each stockyard</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">2.</span>
                <p className="text-foreground/90"><strong>Customer demands:</strong> When orders must be delivered</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">3.</span>
                <p className="text-foreground/90"><strong>Train capacity:</strong> How many wagons fit what materials</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">4.</span>
                <p className="text-foreground/90"><strong>Cost factors:</strong> Transport, loading, and late-delivery penalties</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-bold">5.</span>
                <p className="text-foreground/90"><strong>Route options:</strong> Rail vs road, different paths, timings</p>
              </div>
            </div>
          </div>

          {/* Who is it for */}
          <div className="card-glow p-8 space-y-4 border-primary/40">
            <h2 className="text-2xl font-bold text-foreground">Who is it for?</h2>
            <p className="text-lg text-foreground/90 leading-relaxed">
              OptiRake DSS is built for <strong>logistics planners</strong> at steel plants who need to:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="frosted-glass p-4 space-y-2">
                <p className="font-semibold text-foreground">Daily Planning</p>
                <p className="text-sm text-foreground/80">Decide which orders go into which trains each day</p>
              </div>
              <div className="frosted-glass p-4 space-y-2">
                <p className="font-semibold text-foreground">Quick Decisions</p>
                <p className="text-sm text-foreground/80">Get recommendations in seconds, not hours</p>
              </div>
              <div className="frosted-glass p-4 space-y-2">
                <p className="font-semibold text-foreground">Clear Reasons</p>
                <p className="text-sm text-foreground/80">Understand why each decision was made</p>
              </div>
              <div className="frosted-glass p-4 space-y-2">
                <p className="font-semibold text-foreground">Better Results</p>
                <p className="text-sm text-foreground/80">Achieve cost savings and on-time delivery</p>
              </div>
            </div>
          </div>

          {/* Where is it used */}
          <div className="card-glow p-8 space-y-4 border-green-500/20">
            <h2 className="text-2xl font-bold text-foreground">Where is it used?</h2>
            <p className="text-lg text-foreground/90 leading-relaxed">
              OptiRake DSS is deployed at <strong>SAIL Bokaro Steel Plant</strong> in Jharkhand, India.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="frosted-glass p-4 border-l-2 border-primary space-y-2">
                <p className="font-semibold text-primary">Source</p>
                <p className="text-sm text-foreground/80">Bokaro Steel Plant (HSM & CMO units)</p>
              </div>
              <div className="frosted-glass p-4 border-l-2 border-primary space-y-2">
                <p className="font-semibold text-primary">Routing</p>
                <p className="text-sm text-foreground/80">Rail & road to customers across India</p>
              </div>
              <div className="frosted-glass p-4 border-l-2 border-primary space-y-2">
                <p className="font-semibold text-primary">Users</p>
                <p className="text-sm text-foreground/80">Logistics team at Bokaro plant CMO</p>
              </div>
            </div>
          </div>

          {/* Why does it matter */}
          <div className="card-glow p-8 space-y-4 border-amber-500/20">
            <h2 className="text-2xl font-bold text-foreground">Why does it matter?</h2>
            <div className="space-y-4">
              <div className="frosted-glass p-4 space-y-2">
                <p className="font-semibold text-foreground">Cost Savings</p>
                <p className="text-sm text-foreground/80">
                  By grouping orders smartly into rakes, the system reduces transport costs by 15–25% 
                  and eliminates demurrage (late delivery penalties).
                </p>
              </div>

              <div className="frosted-glass p-4 space-y-2">
                <p className="font-semibold text-foreground">High Utilization</p>
                <p className="text-sm text-foreground/80">
                  Wagons are loaded to 90%+ capacity instead of 60–70%, meaning fewer trains needed 
                  and better return on investment.
                </p>
              </div>

              <div className="frosted-glass p-4 space-y-2">
                <p className="font-semibold text-foreground">On-Time Delivery</p>
                <p className="text-sm text-foreground/80">
                  The system ensures all customer deadlines are met. No more late shipments, 
                  no penalties, and happy customers.
                </p>
              </div>

              <div className="frosted-glass p-4 space-y-2">
                <p className="font-semibold text-foreground">Speed & Simplicity</p>
                <p className="text-sm text-foreground/80">
                  Instead of hours of manual work, logistics planners get the optimal plan in seconds, 
                  with full explanations.
                </p>
              </div>

              <div className="frosted-glass p-4 space-y-2">
                <p className="font-semibold text-foreground">Competitive Advantage</p>
                <p className="text-sm text-foreground/80">
                  Better service, lower costs, and faster execution give SAIL an edge in the competitive 
                  steel market.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom summary */}
          <div className="text-center space-y-4 pb-8">
            <p className="text-foreground/80 max-w-2xl mx-auto">
              OptiRake DSS makes a complex logistics problem simple. It's not just software—it's a smart assistant
              that helps planners make better, faster decisions every day.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
