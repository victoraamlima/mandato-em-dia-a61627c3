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
import AtendimentosDeputado from "./pages/AtendimentosDeputado";
import AtendimentoDeputadoNovo from "./pages/AtendimentoDeputadoNovo";
import { SessionContextProvider, useSession } from "@/components/auth/SessionContextProvider";
import PessoaDetalhes from "./pages/PessoaDetalhes";
import TicketDetalhes from "./pages/TicketDetalhes";
import Usuarios from "./pages/Usuarios";
import UsuarioForm from "./pages/UsuarioForm";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Agenda from "./pages/Agenda";

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
            {/* Rotas de Pessoas */}
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
              path="/pessoas/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PessoaDetalhes />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pessoas/:id/editar"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PessoaForm />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* Rotas de Tickets */}
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
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TicketDetalhes />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id/editar"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TicketForm />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* Outras Rotas */}
            <Route
              path="/atendimentos-deputado"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AtendimentosDeputado />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/atendimentos-deputado/novo"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AtendimentoDeputadoNovo />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Agenda />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            {/* Rotas de Gestão */}
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Relatorios />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Usuarios />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/novo"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UsuarioForm />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios/:id/editar"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <UsuarioForm />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Configuracoes />
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