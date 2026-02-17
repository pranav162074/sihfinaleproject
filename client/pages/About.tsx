import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Code2,
  Target,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              About OptiRake DSS
            </h1>
            <p className="text-lg text-muted-foreground">
              An AI-powered Decision Support System for SAIL rake formation
              optimization
            </p>
          </div>

          {/* Problem Statement */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Problem & Objectives
              </h2>
            </div>

            <div className="card-glass p-8 space-y-6 border border-primary/20">
              <div className="space-y-2">
                <p className="text-lg text-foreground leading-relaxed">
                  SAIL (Steel Authority of India Limited) processes thousands of
                  orders daily for steel distribution across India. The current
                  manual rake formation and transport allocation process is
                  inefficient, leading to high operational costs, underutilized
                  transportation capacity, and frequent SLA violations.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/30">
                <h3 className="font-semibold text-foreground">Context</h3>
                <p className="text-foreground/80 leading-relaxed">
                  SAIL operates multiple integrated steel plants including
                  Bokaro, Durgapur, and Rourkela. Each plant receives orders
                  from customers across India. Currently, logistics operations
                  rely on manual decision-making for rake formations and
                  transport mode selection. This approach results in:
                </p>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Incomplete rake formations with poor wagon utilization
                      (often 40-60%)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Suboptimal transport mode selection, with 100% reliance on
                      road transport for flexibility
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Missed SLA deadlines leading to demurrage penalties and
                      customer dissatisfaction
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Lack of real-time visibility into optimization decisions
                      and cost impacts
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/30">
                <h3 className="font-semibold text-foreground">Objective</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Develop an intelligent Decision Support System that uses
                  machine learning algorithms to:
                </p>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>
                      Automatically form optimal rake configurations by
                      consolidating orders to common destinations
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>
                      Intelligently allocate transport modes (rail vs road) to
                      minimize costs while meeting SLAs
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>
                      Provide transparent, explainable reasoning for every
                      decision in natural language
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>
                      Enable human override and approval workflows for
                      high-stakes decisions
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/30">
                <h3 className="font-semibold text-foreground">Problem Scope</h3>
                <p className="text-foreground/80 leading-relaxed">
                  This system focuses on the tactical optimization layer for
                  SAIL's outbound logistics:
                </p>
                <ul className="space-y-2 text-foreground/80">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-0.5">—</span>
                    <span>
                      Input: Order manifest with quantity, destination,
                      deadline, customer priority, and material type
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-0.5">—</span>
                    <span>
                      Processing: Constraint satisfaction, cost minimization,
                      SLA compliance verification
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-0.5">—</span>
                    <span>
                      Output: Rake formation plan with wagon assignments,
                      transport mode allocation, cost breakdown, and
                      explanations
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/30">
                <h3 className="font-semibold text-foreground">
                  Key Decisions to Optimize
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-primary">
                      Rake Formation
                    </p>
                    <p className="text-sm text-foreground/70 mt-2">
                      Which orders to consolidate into each rake based on
                      destination proximity and delivery windows
                    </p>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-primary">
                      Wagon Assignment
                    </p>
                    <p className="text-sm text-foreground/70 mt-2">
                      Allocation of orders to specific wagons with capacity and
                      crane verification
                    </p>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-primary">
                      Transport Mode
                    </p>
                    <p className="text-sm text-foreground/70 mt-2">
                      Selection of rail (bulk, cost-effective) vs road
                      (flexible, premium) for each rake
                    </p>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-primary">
                      Loading Priority
                    </p>
                    <p className="text-sm text-foreground/70 mt-2">
                      Sequence of orders for loading based on deadlines and
                      customer priority
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organization & Team */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Organization & Team
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organization */}
              <div className="card-glow p-8 space-y-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Building2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-foreground">
                      Ministry of Steel
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      SAIL (Steel Authority of India Limited)
                    </p>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      India's largest integrated steel producer with major
                      plants across the country
                    </p>
                  </div>
                </div>
              </div>

              {/* Hackathon */}
              <div className="card-glow p-8 space-y-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-foreground">
                      Smart India Hackathon 2025
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Team OG1
                    </p>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      Developing AI solutions for India's critical
                      rake planning challenges
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Member */}
            <div className="card-glass p-8 space-y-6 border border-primary/20">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">
                  Team Details
                </h3>
              </div>

              <div className="space-y-4 border-t border-border/30 pt-6">
                <div className="space-y-1">
                  <p className="text-sm text-primary font-medium">
                    Lead Developers
                  </p>
                  <p className="font-semibold text-foreground">
                    Sai Charan Devisetty
                  </p>
                  <p className="font-semibold text-foreground">
                    Sai Pranav Reddy
                  </p>
                  <p className="font-semibold text-foreground">
                    Purna Chandra
                  </p>
                  <p className="font-semibold text-foreground">
                    Pavani Keerthi
                  </p>
                  <p className="font-semibold text-foreground">
                    Manohar
                  </p>
                  <p className="font-semibold text-foreground">
                    Bonda Rohit
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Educational Institution
                  </p>
                  <p className="text-sm text-foreground">
                    Gayatri Vidya Parishad College of Engineering
                  </p>
                </div>

                <div className="pt-4 border-t border-border/30 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Link to source code and project repository
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 gap-2"
                      onClick={() =>
                        window.open("https://github.com/heyyyysaiiii-commits/sihfinaleproject", "_blank")
                      }
                    >
                      <Code2 className="w-4 h-4" />
                      GitHub
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Technology Stack
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frontend */}
              <div className="card-glow p-8 space-y-4 border border-primary/20">
                <h3 className="font-semibold text-foreground">Frontend</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    React 18 with TypeScript for type-safe UI
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    TailwindCSS 3 for responsive design
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Framer Motion for smooth animations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    React Router 6 for SPA routing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Lucide React icons and Radix UI components
                  </li>
                </ul>
              </div>

              {/* Backend */}
              <div className="card-glow p-8 space-y-4 border border-primary/20">
                <h3 className="font-semibold text-foreground">Backend</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Express.js for REST API
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    TypeScript for type safety
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Zod for schema validation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    CSV parsing for order data ingestion
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Node.js runtime and Vite bundler
                  </li>
                </ul>
              </div>

              {/* Algorithms */}
              <div className="card-glow p-8 space-y-4 border border-primary/20">
                <h3 className="font-semibold text-foreground">Optimization</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Greedy consolidation for rake formation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Cost minimization heuristics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Constraint satisfaction for SLA compliance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Transport mode selection logic
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Natural language explanation generation
                  </li>
                </ul>
              </div>

              {/* DevOps */}
              <div className="card-glow p-8 space-y-4 border border-primary/20">
                <h3 className="font-semibold text-foreground">Deployment</h3>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Vite for fast development and production builds
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Netlify Functions for serverless backend
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Hot module reload for rapid iteration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    PNPM for dependency management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">→</span>
                    Vitest for unit and integration testing
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Vision & Impact
              </h2>
            </div>

            <div className="card-gradient p-12 space-y-6 rounded-2xl border border-primary/30">
              <p className="text-lg text-foreground leading-relaxed">
                OptiRake DSS represents a significant step forward in applying
                AI to SAIL's logistics operations. By automating and optimizing
                rake formations and transport allocation, the system can:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Reduce Operational Costs
                    </p>
                    <p className="text-sm text-foreground/80 mt-1">
                      Achieve 60-70% savings through optimal consolidation and
                      mode selection, directly improving the bottom line
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Improve Customer Satisfaction
                    </p>
                    <p className="text-sm text-foreground/80 mt-1">
                      Achieve 95%+ SLA compliance and eliminate demurrage
                      penalties through predictive planning
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Enhance Operational Visibility
                    </p>
                    <p className="text-sm text-foreground/80 mt-1">
                      Provide real-time insights into rake formations, transport
                      allocation, and cost impacts with explainable AI
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Enable Scalability
                    </p>
                    <p className="text-sm text-foreground/80 mt-1">
                      Process thousands of orders in minutes, supporting growth
                      without proportional increase in logistics staff
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">
                      Support Decision Making
                    </p>
                    <p className="text-sm text-foreground/80 mt-1">
                      Provide transparent, explainable recommendations that
                      logistics managers can understand and override when needed
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-foreground/80 italic">
                This project demonstrates how AI can address real operational
                challenges in India's steel industry and serves as a blueprint
                for similar optimization systems in logistics, manufacturing,
                and supply chain management across SAIL and beyond.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-8">
            <Button
              onClick={() => navigate("/")}
              className="btn-gradient h-12 px-8"
            >
              Back to Home
            </Button>
          </div>

          {/* Credit Footer */}
          <div className="pt-12 border-t border-border/20 mt-16">
            <div className="text-center space-y-3">
              <p className="text-xs text-muted-foreground font-medium tracking-wide">
                BUILT FOR SMART INDIA HACKATHON 2025
              </p>
              <p className="text-xs text-primary/80 font-semibold">
                BY TEAM OG1 – GAYATRI VIDYA PARISHAD COLLEGE OF ENGINEERING (A)
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
