import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Lightbulb, HelpCircle } from "lucide-react";
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
      text: "Welcome! I'm OptiRake's AI Assistant. Ask me about rake formations, order allocations, cost savings, or SLA optimization.",
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
        "fixed right-0 top-0 bottom-0 bg-card border-l border-border transition-all duration-300 z-30 flex flex-col",
        isOpen ? "w-80" : "w-16"
      )}
    >
      {/* Header */}
      <div className="h-16 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border flex items-center justify-between px-4">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground text-sm">AI Assistant</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {isOpen ? (
            <ChevronRight className="w-4 h-4 text-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-foreground" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isOpen ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <Lightbulb className="w-8 h-8 text-secondary mx-auto opacity-60" />
                  <p className="text-sm text-muted-foreground">How can I help you today?</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg p-3 text-sm",
                      msg.role === "user"
                        ? "bg-primary/20 text-foreground ml-8"
                        : "bg-muted text-foreground/90 mr-2"
                    )}
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 py-3 space-y-2 border-t border-border">
                <p className="text-xs text-muted-foreground font-semibold">QUICK QUESTIONS</p>
                <button
                  onClick={() => handleQuickQuestion("Why is order ORD001 in Rake R1?")}
                  className="w-full text-left text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
                >
                  Why is order ORD001 in Rake R1?
                </button>
                <button
                  onClick={() => handleQuickQuestion("What's the total cost savings?")}
                  className="w-full text-left text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
                >
                  What's the total cost savings?
                </button>
                <button
                  onClick={() => handleQuickQuestion("Show SLA compliance summary")}
                  className="w-full text-left text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
                >
                  Show SLA compliance summary
                </button>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t border-border p-3 space-y-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full px-3 py-2 rounded bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="submit"
                size="sm"
                className="w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Send
              </Button>
            </form>
          </>
        ) : (
          /* Collapsed Icon */
          <div className="flex-1 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

function generateAssistantResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("why") && q.includes("order")) {
    return "High-priority Delhi orders are grouped into the same rake for consolidation. This keeps wagon utilization at 94%, avoids partial rakes, and saves ₹24,500 in demurrage.";
  } else if (q.includes("cost") || q.includes("savings")) {
    return "Total estimated cost savings: ₹487,250. This includes consolidated freight rates (₹45/tonne savings) and avoided demurrage penalties.";
  } else if (q.includes("sla") || q.includes("compliance")) {
    return "SLA Compliance: 19/20 orders on-time (95%). Only ORD-017 at risk due to crane congestion, but assigned additional priority slot.";
  } else if (q.includes("utilization")) {
    return "Average rake utilization: 87.3%. Range: 65% (Rake R5) to 98% (Rake R1). Platform limit: 45 wagons per rake.";
  } else if (q.includes("rail") || q.includes("road")) {
    return "Rail vs Road split: 18 orders by rail (1,245 MT), 2 orders by road (68 MT). Road chosen for urgent short-haul to Mumbai due to crane unavailability at Bokaro.";
  }

  return "I can help with rake formations, cost analysis, order allocations, SLA status, and optimization reasoning. What would you like to know?";
}
