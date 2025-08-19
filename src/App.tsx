import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pessoas from "./pages/Pessoas";
import Tickets from "./pages/Tickets";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import PessoaForm from "./pages/PessoaForm";
import TicketForm from "./pages/TicketForm";
import { SessionContextProvider, useSession } from "@/components/auth/SessionContextProvider";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pessoas"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Pessoas />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pessoas/nova"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PessoaForm />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Tickets />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/novo"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TicketForm />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Agenda</h1>
                      <p className="text-muted-foreground">Em desenvolvimento</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Relatórios</h1>
                      <p className="text-muted-foreground">Em desenvolvimento</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Usuários</h1>
                      <p className="text-muted-foreground">Em desenvolvimento</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Configurações</h1>
                      <p className="text-muted-foreground">Em desenvolvimento</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;