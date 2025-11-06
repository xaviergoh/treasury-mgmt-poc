import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Index from "./pages/Index";
import MTMValuation from "./pages/MTMValuation";
import ManualHedgeEntry from "./pages/ManualHedgeEntry";
import PositionReset from "./pages/PositionReset";
import AuditTrail from "./pages/AuditTrail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mtm" element={<MTMValuation />} />
            <Route path="/hedge" element={<ManualHedgeEntry />} />
            <Route path="/reset" element={<PositionReset />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
