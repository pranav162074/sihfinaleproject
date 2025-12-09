import { useState } from "react";
import {
  ChevronLeft,
  MessageSquare,
  Send,
  Lightbulb,
  HelpCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  visible?: boolean;
}

export function AIAssistant({ visible = true }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "assistant",
      text: "Hi! I'm the OptiRake AI Assistant. Ask me about rake formations, cost savings, allocations, or SLA optimization.",
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages([...messages, { role: "user", text: message }]);

    // Simulate assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: generateAssistantResponse(message),
        },
      ]);
    }, 300);

    setMessage("");
  };

  const handleQuickQuestion = (question: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { role: "assistant", text: generateAssistantResponse(question) },
    ]);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed right-0 top-0 bottom-0 bg-card border-l border-border/30 transition-all duration-300 z-30 flex flex-col backdrop-blur-xl",
        isOpen ? "w-96" : "w-16",
      )}
    >
      {/* Header */}
      <div className="h-16 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/30 flex items-center justify-between px-4">
        {isOpen && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground text-sm">
              AI Assistant
            </span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto p-2 hover:bg-muted/30 rounded-lg transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 text-foreground transition-transform",
              !isOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isOpen ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Lightbulb className="w-8 h-8 text-primary mx-auto opacity-60" />
                  <p className="text-sm text-muted-foreground">
                    How can I help you today?
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg p-3 text-sm animate-fade-in",
                      msg.role === "user"
                        ? "bg-primary/20 text-foreground ml-8 border border-primary/30"
                        : "bg-muted/40 text-foreground/90 mr-2 border border-border/30",
                    )}
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 py-3 space-y-2 border-t border-border/30 bg-muted/10">
                <p className="text-xs text-muted-foreground font-semibold">
                  QUICK QUESTIONS
                </p>
                <button
                  onClick={() =>
                    handleQuickQuestion("Why is order ORD-001 in Rake R1?")
                  }
                  className="w-full text-left text-xs p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors text-foreground/80 hover:text-foreground border border-border/30"
                >
                  Why is ORD-001 in Rake R1?
                </button>
                <button
                  onClick={() =>
                    handleQuickQuestion("What's the total cost savings?")
                  }
                  className="w-full text-left text-xs p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors text-foreground/80 hover:text-foreground border border-border/30"
                >
                  Total cost savings?
                </button>
                <button
                  onClick={() =>
                    handleQuickQuestion("Show SLA compliance summary")
                  }
                  className="w-full text-left text-xs p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors text-foreground/80 hover:text-foreground border border-border/30"
                >
                  SLA compliance summary
                </button>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-border/30 p-3 space-y-2 bg-muted/5"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me..."
                className="input-subtle w-full text-sm"
              />
              <Button
                type="submit"
                size="sm"
                className="w-full h-8 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 gap-2"
              >
                <Send className="w-3 h-3" />
                Send
              </Button>
            </form>
          </>
        ) : (
          /* Collapsed Icon */
          <div className="flex-1 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
}

function generateAssistantResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("why") && q.includes("order")) {
    return "High-priority orders are grouped by destination for consolidation. This maximizes wagon utilization (>85%), meets SLA deadlines, and avoids partial rake costs. Each rake serves 1-2 destinations with similar due dates.";
  } else if (q.includes("cost") || q.includes("savings")) {
    return "Total estimated savings: ₹826k (63% vs baseline). This includes: consolidated freight rates (₹350/MT vs ₹765/MT), reduced demurrage penalties, and optimized wagon utilization.";
  } else if (q.includes("sla") || q.includes("compliance")) {
    return "SLA Compliance: 19/20 orders on-time (95%). Only ORD-017 at marginal risk due to crane availability, but scheduled in next priority slot. All dates validated against delivery windows.";
  } else if (q.includes("utilization")) {
    return "Average wagon utilization: 87.3%. Range: 77% (R3) to 94% (R1). Platform capacity: 45 wagons/rake max. We optimize within safety margins to maximize efficiency.";
  } else if (q.includes("rail") || q.includes("road")) {
    return "Rail vs Road split: 94.8% by rail (18 orders, 1,245 MT), 5.2% by road (2 orders, 68 MT). Road used only for urgent short-haul when rail unavailable. Saves ₹826k vs all-road.";
  } else if (q.includes("how") || q.includes("work")) {
    return "The AI algorithm: (1) Groups orders by destination & priority, (2) Assigns to available rakes respecting platform/crane capacity, (3) Optimizes wagon utilization, (4) Falls back to road if needed, (5) Generates plain-English explanations for each allocation.";
  }

  return "I can help with rake formations, cost analysis, order allocations, SLA status, and optimization reasoning. What would you like to know?";
}
