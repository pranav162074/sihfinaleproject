import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  Zap,
  Truck,
  TrendingUp,
  FileText,
  HelpCircle,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/upload", label: "Data Upload", icon: Upload },
    { path: "/optimize", label: "Run Optimization", icon: Zap },
    { path: "/rake-plan", label: "Rake Planning", icon: Truck },
    { path: "/rail-road", label: "Rail vs Road", icon: TrendingUp },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/about", label: "About", icon: HelpCircle },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Bar - Premium Glass */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-card/50 backdrop-blur-xl border-b border-border/30 flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">
              OptiRake DSS
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-muted/30 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-background/95 backdrop-blur-lg z-30">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive(item.path)
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                      : "text-foreground hover:bg-muted/30",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Mobile Bottom Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-card/50 backdrop-blur-xl border-t border-border/30 flex items-center justify-around z-40">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-16 transition-all",
                  isActive(item.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-0.5 font-medium">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <nav className="h-16 bg-card/30 backdrop-blur-xl border-b border-border/30 flex items-center px-6 sticky top-0 z-40">
      <div className="flex items-center justify-between w-full gap-8">
        {/* Logo - Premium Branding */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center shadow-lg"
            style={{
              boxShadow: "0 0 12px rgba(0, 252, 232, 0.3)",
            }}
          >
            <BarChart3 className="w-5 h-5 text-primary-foreground font-bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-sm">OptiRake</span>
            <span className="text-xs text-muted-foreground">SAIL DSS</span>
          </div>
        </Link>

        {/* Desktop Nav Items - Centered with Even Spacing */}
        <div className="flex items-center justify-center gap-0.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium whitespace-nowrap",
                  active
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
