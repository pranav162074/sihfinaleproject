import { Navigation } from "./Navigation";
import { AIAssistantDrawer } from "./AIAssistantDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  showAIAssistant?: boolean;
  planData?: any;
}

export function Layout({ children, showAIAssistant = true }: LayoutProps) {
  const isMobile = useIsMobile();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div
          className={`${
            isMobile ? "px-4 py-4 pb-20" : "px-8 py-8"
          }`}
        >
          {children}
        </div>
      </div>

      {/* Premium Footer Watermark */}
      <div className="fixed bottom-0 right-0 pointer-events-none">
        <div className="px-6 py-3 text-right space-y-1">
          <p className="text-xs text-primary/60 font-medium tracking-widest">
            SMART INDIA HACKATHON 2025
          </p>
          <p className="text-[0.65rem] text-primary/50 font-light tracking-wide">
            Team OG1 • GVPCE(A)
          </p>
        </div>
      </div>

      {/* AI Assistant Drawer */}
      {showAIAssistant && <AIAssistantDrawer isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} planData={planData} />}

      {/* Floating AI Assistant Button */}
      {showAIAssistant && !isAssistantOpen && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center z-40 animate-fade-in"
          title="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </button>
      )}
    </div>
  );
}
