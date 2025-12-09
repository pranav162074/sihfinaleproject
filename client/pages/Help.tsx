import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

const FAQs = [
  {
    question: "How do I upload order data?",
    answer:
      'Go to the "Data Upload" page, drag & drop your CSV file or click to select. The system validates your data and shows a preview before optimization.',
  },
  {
    question: "What format should my CSV be?",
    answer:
      "CSV with headers in the first row. Required columns: order_id, customer_name, customer_location, product_type, material_grade, quantity_tonnes, destination.",
  },
  {
    question: "How does the AI optimizer work?",
    answer:
      "Our algorithm groups orders by destination and priority, assigns them to available rakes respecting platform/wagon constraints, and optimizes wagon utilization.",
  },
  {
    question: "What's the cost savings?",
    answer:
      "Rail consolidation saves 12-18% vs baseline. Exact savings depend on order mix, destinations, and current rail capacity.",
  },
  {
    question: "Can I change optimization parameters?",
    answer:
      "Yes! On the Optimization Run page, adjust cost vs SLA priority, minimum utilization %, and multi-destination rake settings.",
  },
];

export default function Help() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gradient-to-b from-background via-background to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Help & Support
            </h1>
            <p className="text-lg text-muted-foreground">
              Get answers to common questions about OptiRake DSS
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                emoji: "📚",
                title: "Getting Started",
                desc: "Learn the basics",
              },
              { emoji: "📤", title: "Data Upload", desc: "Format & schema" },
              { emoji: "⚡", title: "Optimization", desc: "How it works" },
              { emoji: "📊", title: "Results", desc: "Understanding output" },
            ].map((item, idx) => (
              <button
                key={idx}
                className="card-glass p-6 space-y-3 hover:scale-105 transition-transform border border-border/30 hover:border-primary/50"
              >
                <div className="text-3xl">{item.emoji}</div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-primary" />
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-muted-foreground">
                Find answers to common questions about the system
              </p>
            </div>

            <div className="space-y-2">
              {FAQs.map((faq, idx) => (
                <div
                  key={idx}
                  className="card-glow border border-border/30 rounded-lg overflow-hidden transition-all"
                >
                  <button
                    onClick={() =>
                      setExpandedIdx(expandedIdx === idx ? null : idx)
                    }
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors text-left"
                  >
                    <span className="font-semibold text-foreground">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        expandedIdx === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedIdx === idx && (
                    <div className="px-6 pb-4 pt-0 border-t border-border/30 bg-muted/5">
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Feature */}
          <div className="card-glow p-8 space-y-6 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  AI Assistant
                </h2>
                <p className="text-sm text-muted-foreground">
                  Available on all pages for instant help
                </p>
              </div>
            </div>

            <p className="text-foreground/90">
              Our AI Assistant is available 24/7 in the collapsible right
              sidebar on every page. Ask questions like:
            </p>

            <ul className="space-y-2 text-sm text-foreground/80">
              <li>✓ "Why is order ORD-1234 in Rake R7?"</li>
              <li>✓ "What's the total cost savings?"</li>
              <li>✓ "Show SLA compliance summary"</li>
              <li>✓ "How does the optimization algorithm work?"</li>
            </ul>

            <p className="text-xs text-muted-foreground pt-4 border-t border-border/30">
              The assistant provides context-aware responses based on your
              current optimization and data.
            </p>
          </div>

          {/* Contact Support */}
          <div className="card-glass p-8 space-y-6 border-secondary/20">
            <h2 className="text-2xl font-bold text-foreground">
              Need More Help?
            </h2>

            <p className="text-foreground/90">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p>📧 Email: support@optirake.com</p>
              <p>💬 Chat: Available 9 AM - 6 PM IST, Mon-Fri</p>
              <p>📞 Phone: +91-XXXXXXXXXX</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-secondary/20 hover:bg-secondary/30 text-secondary h-11 px-8">
                Contact Support
              </Button>
              <Button variant="outline" className="h-11 px-8 border-primary/30">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
