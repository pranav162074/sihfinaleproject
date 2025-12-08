import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  Send,
  X,
  Loader,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExplainPlanResponse } from "@shared/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  optimizationId?: string;
  context?: {
    selectedOrderId?: string;
    selectedRakeId?: string;
    explanation?: ExplainPlanResponse;
  };
  onClose?: () => void;
}

export function AIAssistant({ optimizationId, context, onClose }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // For now, generate contextual responses based on the user's question
      const assistantResponse = await generateAssistantResponse(
        input,
        context,
        optimizationId
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting assistant response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-8 right-8 rounded-full shadow-lg h-14 w-14 z-40"
        variant="default"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-8 right-8 w-96 h-[600px] flex flex-col shadow-lg z-40 bg-card border border-border">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-t-lg flex items-center justify-between text-card-foreground">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          <span className="font-semibold">RakeOpt Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">
              Ask me about your optimization
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              I can explain decisions, costs, and recommendations
            </p>

            {/* Quick Questions */}
            <div className="space-y-2 w-full">
              <button
                onClick={() => handleQuickQuestion("Why was this order allocated to this rake?")}
                className="text-xs text-left bg-secondary/50 hover:bg-secondary p-2 rounded transition-colors"
              >
                💡 Why was this order allocated to this rake?
              </button>
              <button
                onClick={() => handleQuickQuestion("What's the cost breakdown for this plan?")}
                className="text-xs text-left bg-secondary/50 hover:bg-secondary p-2 rounded transition-colors"
              >
                💰 What's the cost breakdown?
              </button>
              <button
                onClick={() => handleQuickQuestion("Are there any risks with this allocation?")}
                className="text-xs text-left bg-secondary/50 hover:bg-secondary p-2 rounded transition-colors"
              >
                ⚠️ Are there any risks?
              </button>
              <button
                onClick={() => handleQuickQuestion("How can I improve utilization?")}
                className="text-xs text-left bg-secondary/50 hover:bg-secondary p-2 rounded transition-colors"
              >
                📈 How to improve utilization?
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-2",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-3 py-2 max-w-[80%] text-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="bg-secondary text-foreground rounded-lg px-3 py-2 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask a question..."
            className="text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Generate contextual assistant response
 */
async function generateAssistantResponse(
  userQuestion: string,
  context: AIAssistantProps["context"],
  optimizationId?: string
): Promise<string> {
  const question = userQuestion.toLowerCase();

  // If we have an explanation context, use that
  if (context?.explanation) {
    const exp = context.explanation;

    if (
      question.includes("why") ||
      question.includes("reason") ||
      question.includes("allocated")
    ) {
      return exp.explanation;
    }

    if (question.includes("cost") || question.includes("price")) {
      const { cost_per_tonne, allocated_quantity, demurrage_saved_inr } = exp.quantitative_breakdown;
      return `This order's cost breakdown:
        
• Allocated Quantity: ${allocated_quantity} tonnes
• Cost per Tonne: ₹${cost_per_tonne}
• Total Cost: ₹${cost_per_tonne * allocated_quantity}
• Demurrage Saved: ₹${demurrage_saved_inr}

The allocation optimizes for both cost efficiency and SLA compliance.`;
    }

    if (
      question.includes("risk") ||
      question.includes("delay") ||
      question.includes("problem")
    ) {
      const { risk_tag, delay_probability } = exp.quantitative_breakdown;
      return `Risk Assessment: ${risk_tag}
        
• Delay Probability: ${(delay_probability * 100).toFixed(1)}%
• Expected Arrival: ${new Date(exp.quantitative_breakdown.arrival_prediction).toLocaleDateString()}

${risk_tag === "LOW" ? "✅ This is a low-risk allocation with high confidence." : risk_tag === "MEDIUM" ? "⚠️ Monitor this allocation for potential delays." : "🚨 This allocation has elevated risk. Consider alternatives."}`;
    }

    if (question.includes("alternative") || question.includes("other")) {
      if (exp.alternatives_considered.length > 0) {
        const alts = exp.alternatives_considered
          .map((alt) => `• ${alt.alternative_rake_id}: +₹${alt.additional_cost} (${alt.reason_not_chosen})`)
          .join("\n");
        return `Other options considered:\n\n${alts}\n\nThe current allocation was chosen as the optimal solution.`;
      }
    }
  }

  // Generic responses for common questions
  if (question.includes("utilization") || question.includes("efficiency")) {
    return `To improve utilization:
      
1. **Consolidate orders**: Group orders heading to the same destination
2. **Optimize staging**: Use multi-destination rakes when possible
3. **Adjust thresholds**: Consider lowering minimum utilization targets
4. **Balance priorities**: Align high-priority orders with optimal rake matches
5. **Monitor delays**: Reduce penalties by better SLA alignment

Current system achieves 82-85% average utilization. Would you like recommendations for specific orders?`;
  }

  if (question.includes("cost") || question.includes("saving")) {
    return `Cost Optimization Highlights:

💰 **Current Period**:
- Total Optimized Cost: ₹1,25,000
- Baseline Cost (all road): ₹1,43,500
- Savings: ₹18,500 (12.9%)

🚀 **Optimization Strategies**:
1. Rail consolidation where possible
2. Matching order sizes to rake capacity
3. Multi-destination rake planning
4. Reduced demurrage through early planning

Ask about specific orders for detailed cost breakdowns.`;
  }

  if (question.includes("sla") || question.includes("deadline")) {
    return `SLA Performance Overview:

✅ **On-Time**: 94.5% of orders
⚠️ **At-Risk**: 4.2% (monitoring)
❌ **Late**: 1.3%

**Recommendations**:
- Monitor at-risk orders closely
- Consider expedited loading for critical orders
- Adjust departure times for tight deadlines
- Use road transport as backup for urgent shipments

Which order would you like to review?`;
  }

  // Default response
  return `I'm your RakeOpt Assistant! I can help you understand:

• 📊 **Optimization decisions** - Why specific orders went to specific rakes
• 💰 **Cost analysis** - Detailed breakdown of transport, loading, and penalty costs
• ⚠️ **Risk assessment** - Delay probabilities and mitigation strategies
• 📈 **Efficiency metrics** - Utilization rates and improvement opportunities
• 📋 **SLA compliance** - On-time delivery status and recommendations

Ask me anything about your current optimization plan, or share an order ID to get specific insights!`;
}
