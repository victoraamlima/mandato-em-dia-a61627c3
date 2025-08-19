import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pessoas from "./pages/Pessoas";
import Tickets from "./pages/Tickets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/pessoas" element={<AppLayout><Pessoas /></AppLayout>} />
          <Route path="/tickets" element={<AppLayout><Tickets /></AppLayout>} />
          <Route path="/agenda" element={<AppLayout><div className="p-8 text-center"><h1 className="text-2xl font-bold">Agenda</h1><p className="text-muted-foreground">Em desenvolvimento</p></div></AppLayout>} />
          <Route path="/relatorios" element={<AppLayout><div className="p-8 text-center"><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground">Em desenvolvimento</p></div></AppLayout>} />
          <Route path="/usuarios" element={<AppLayout><div className="p-8 text-center"><h1 className="text-2xl font-bold">Usuários</h1><p className="text-muted-foreground">Em desenvolvimento</p></div></AppLayout>} />
          <Route path="/configuracoes" element={<AppLayout><div className="p-8 text-center"><h1 className="text-2xl font-bold">Configurações</h1><p className="text-muted-foreground">Em desenvolvimento</p></div></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
