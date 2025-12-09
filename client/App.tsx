import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DataUpload from "./pages/DataUpload";
import OptimizationRun from "./pages/OptimizationRun";
import RakePlanDispatch from "./pages/RakePlanDispatch";
import RailRoadSplit from "./pages/RailRoadSplit";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="/data-upload" element={<Navigate to="/upload" replace />} />
            <Route path="/optimize" element={<OptimizationRun />} />
            <Route path="/optimization-run" element={<Navigate to="/optimize" replace />} />
            <Route path="/rake-plan" element={<RakePlanDispatch />} />
            <Route path="/rake-plan-dispatch" element={<Navigate to="/rake-plan" replace />} />
            <Route path="/rail-road" element={<RailRoadSplit />} />
            <Route path="/rail-road-split" element={<Navigate to="/rail-road" replace />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/assistant" element={<Help />} />
            <Route path="/help" element={<Navigate to="/assistant" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
