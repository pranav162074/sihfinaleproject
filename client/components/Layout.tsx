import { Link } from "react-router-dom";
import { Menu, BarChart3, Upload, History, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-sidebar-foreground text-sm">
                RAIL DSS
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        <nav className="mt-6 space-y-2 px-2">
          <NavLink
            to="/"
            icon={BarChart3}
            label="Dashboard"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/rake-dashboard"
            icon={BarChart3}
            label="Rake Formation"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/forecast"
            icon={BarChart3}
            label="Forecasts"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/import"
            icon={Upload}
            label="Data Import"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/analytics"
            icon={History}
            label="Analytics"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/admin"
            icon={Settings}
            label="Admin"
            sidebarOpen={sidebarOpen}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-border bg-card flex items-center px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">
            Rail Optimization DSS
          </h1>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sidebarOpen: boolean;
}

function NavLink({ to, icon: Icon, label, sidebarOpen }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}
