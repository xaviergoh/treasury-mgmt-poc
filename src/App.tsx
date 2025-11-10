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
import CurrencyOverview from "./pages/CurrencyOverview";
import DirectTradingConfig from "./pages/DirectTradingConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/positions/:currency" element={<CurrencyOverview />} />
            <Route path="/mtm" element={<MTMValuation />} />
            <Route path="/hedge" element={<ManualHedgeEntry />} />
            <Route path="/reset" element={<PositionReset />} />
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/admin/direct-trading" element={<DirectTradingConfig />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
