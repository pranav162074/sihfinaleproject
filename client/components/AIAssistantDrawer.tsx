import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  planData?: any;
}

const SAMPLE_QUESTIONS = [
  "How many rakes were formed?",
  "What's the total cost savings?",
  "Which orders are high priority?",
  "What's the rail vs road split?",
  "How can I override an allocation?",
];

const generateAssistantResponse = (
  question: string,
  planData?: any,
): string => {
  const lowerQ = question.toLowerCase();

  // Extract data from planData if available
  let rakeCount = 0;
  let totalOrders = 0;
  let totalQuantity = 0;
  let totalCost = 0;
  let railOrders = 0;
  let roadOrders = 0;
  let costSavings = 0;
  let costSavingsPercent = "0";
  let avgUtilization = 0;

  if (planData && Array.isArray(planData)) {
    totalOrders = planData.length;
    const uniqueRakes = new Set(planData.map((item: any) => item.rake_id));
    rakeCount = uniqueRakes.size;
    totalQuantity = Math.round(
      planData.reduce(
        (sum: number, item: any) => sum + item.quantity_tonnes,
        0,
      ),
    );
    totalCost = Math.round(
      planData.reduce((sum: number, item: any) => sum + item.estimated_cost, 0),
    );
    railOrders = planData.filter(
      (item: any) => item.transport_mode === "rail",
    ).length;
    roadOrders = planData.filter(
      (item: any) => item.transport_mode === "road",
    ).length;
    avgUtilization = Math.round(
      planData.reduce(
        (sum: number, item: any) => sum + item.utilization_percent,
        0,
      ) / planData.length,
    );
    const baselineCost = totalQuantity * 765;
    costSavings = Math.round(baselineCost - totalCost);
    costSavingsPercent = ((costSavings / baselineCost) * 100).toFixed(1);
  }

  // Answer specific questions about the plan
  if (lowerQ.includes("order") && lowerQ.includes("why")) {
    const orderMatch = question.match(/ORD-\d+|order\s+(\w+)/i);
    if (orderMatch && planData && Array.isArray(planData)) {
      const orderId = orderMatch[0];
      const orderItem = planData.find((item: any) => item.order_id === orderId);
      if (orderItem) {
        return `${orderItem.explanation} ${orderItem.reason}`;
      }
    }
    return "Orders are assigned to rakes based on destination consolidation, wagon capacity constraints, SLA deadlines, and transport mode optimization. Each allocation maximizes utilization while respecting safety and scheduling constraints.";
  }

  if (lowerQ.includes("how many rakes") || lowerQ.includes("rakes formed")) {
    return `${rakeCount} rakes have been formed to consolidate all ${totalOrders} orders efficiently. Each rake is assigned to handle specific destinations and maintain optimal utilization rates averaging ${avgUtilization}%.`;
  }

  if (lowerQ.includes("cost saving") || lowerQ.includes("savings")) {
    return `The optimization is projected to achieve ${costSavingsPercent}% cost savings (₹${(costSavings / 1000).toFixed(1)}k saved) compared to the baseline all-road transport scenario. The mixed rail-road approach leverages bulk discounts while maintaining SLA compliance.`;
  }

  if (lowerQ.includes("total cost")) {
    return `The estimated total cost for this plan is ₹${(totalCost / 1000).toFixed(1)}k for ${totalQuantity} MT across ${rakeCount} rakes. This achieves ${costSavingsPercent}% savings versus baseline all-road transport at ₹${((totalQuantity * 765) / 1000).toFixed(1)}k.`;
  }

  if (lowerQ.includes("utilization")) {
    return `Average wagon utilization across all rakes is ${avgUtilization}%. This indicates efficient packing of orders while respecting crane and platform capacity constraints (30 MT per crane, 45 wagons per rake max).`;
  }

  if (lowerQ.includes("rail vs road") || lowerQ.includes("transport mode")) {
    const railQuantity = totalQuantity * (railOrders / totalOrders);
    const roadQuantity = totalQuantity - railQuantity;
    return `${railOrders} orders (${Math.round(railQuantity)} MT) allocated to rail for cost efficiency, while ${roadOrders} orders (${Math.round(roadQuantity)} MT) use road for urgent or final-mile deliveries. This split achieves optimal balance between cost and service level.`;
  }

  if (lowerQ.includes("sla") || lowerQ.includes("compliance")) {
    return "All orders are scheduled within their SLA deadlines. The system respects due dates and priority levels to minimize demurrage penalties and ensure on-time delivery. High-priority orders receive preferential loading slots.";
  }

  if (lowerQ.includes("override")) {
    return "To override an allocation, click the 'Override' button next to any order in the Rake Plan table. This marks the order for manual review and allows you to apply custom logic. You can also use the 'Approve' button to lock in an allocation.";
  }

  if (lowerQ.includes("best fit") || lowerQ.includes("allocation")) {
    return "The 'Find Best Fit' algorithm works by: (1) Grouping orders by destination for consolidation, (2) Checking wagon and crane capacity constraints, (3) Optimizing transport mode selection (rail vs road), (4) Prioritizing based on SLA deadlines. Each order gets a detailed explanation of why it was assigned to its specific rake and wagon.";
  }

  if (lowerQ.includes("explain") && lowerQ.includes("decision")) {
    return `I can explain any allocation decision. The system uses intelligent consolidation logic to maximize utilization while respecting all constraints. For each order, you'll find: (1) Why it was assigned to that specific rake, (2) How it supports the overall optimization, (3) Cost impact analysis, (4) SLA compliance verification. Ask about a specific order to learn more.`;
  }

  return `The OptiRake DSS optimized your ${totalOrders} orders into ${rakeCount} rakes with ${costSavingsPercent}% cost savings and ${avgUtilization}% average utilization. I can answer questions about specific orders, rake formations, costs, SLA compliance, or transport mode selection. What would you like to know?`;
};

export function AIAssistantDrawer({
  isOpen,
  onClose,
  planData,
}: AIAssistantDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi! I'm your OptiRake AI Assistant. I can answer questions about your rake formation plan, cost analysis, and optimization decisions. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateAssistantResponse(inputValue, planData);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full md:w-96 bg-background border-l border-border/30 shadow-2xl flex flex-col transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30 bg-card/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">OptiRake Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Plan & optimization Q&A
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                message.type === "user" ? "justify-end" : "justify-start",
              )}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-xs px-4 py-3 rounded-lg",
                  message.type === "user"
                    ? "bg-primary/20 text-foreground rounded-br-none"
                    : "bg-muted/30 text-foreground/90 rounded-bl-none border border-border/20",
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="bg-muted/30 px-4 py-3 rounded-lg border border-border/20 rounded-bl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="px-6 py-4 border-t border-border/30 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Quick Questions
            </p>
            <div className="space-y-2">
              {SAMPLE_QUESTIONS.slice(0, 3).map((question) => (
                <button
                  key={question}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/20 hover:bg-muted/40 text-foreground/80 hover:text-foreground transition-colors border border-border/20"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border/30 bg-card/40 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about your plan..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-lg bg-muted/30 border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm disabled:opacity-50"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              className="h-10 w-10 p-0 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ask me anything about rake formations, costs, SLA compliance, or
            optimization decisions.
          </p>
        </div>
      </div>
    </>
  );
}
