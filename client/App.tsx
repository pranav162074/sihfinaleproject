import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import DataUpload from "./pages/DataUpload";
import OptimizationRun from "./pages/OptimizationRun";
import RakePlanDispatch from "./pages/RakePlanDispatch";
import RailRoadSplit from "./pages/RailRoadSplit";
import Reports from "./pages/Reports";
import About from "./pages/About";
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
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="/optimize" element={<OptimizationRun />} />
            <Route path="/rake-plan" element={<RakePlanDispatch />} />
            <Route path="/rail-road" element={<RailRoadSplit />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
