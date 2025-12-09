import { Navigation } from "./Navigation";
import { AIAssistant } from "./AIAssistant";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  showAIAssistant?: boolean;
}

export function Layout({ children, showAIAssistant = true }: LayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navigation />

      {/* Main Content + AI Assistant */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div
            className={`${
              isMobile ? "px-4 py-4 pb-20" : "px-8 py-8"
            }`}
          >
            {children}
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        {!isMobile && showAIAssistant && <AIAssistant />}
      </div>
    </div>
  );
}
