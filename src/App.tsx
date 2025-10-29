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
import Login from "./pages/Login";
import PessoaForm from "./pages/PessoaForm";
import TicketForm from "./pages/TicketForm";
import AtendimentosDeputado from "./pages/AtendimentosDeputado";
import AtendimentoDeputadoNovo from "./pages/AtendimentoDeputadoNovo";
import AtendimentoDeputadoDetalhes from "./pages/AtendimentoDeputadoDetalhes";
import { SessionContextProvider } from "@/components/auth/SessionContextProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PessoaDetalhes from "./pages/PessoaDetalhes";
import TicketDetalhes from "./pages/TicketDetalhes";
import Usuarios from "./pages/Usuarios";
import UsuarioForm from "./pages/UsuarioForm";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import Cohab from "./pages/Cohab";
import ConviteNovo from "./pages/ConviteNovo"; // Importação da nova página

// Rotas do Módulo de Campo
import CampoLogin from "./pages/campo/CampoLogin";
import CampoVerificaCPF from "./pages/campo/CampoVerificaCPF";
import CampoCadastro from "./pages/campo/CampoCadastro";
import CampoResumo from "./pages/campo/CampoResumo";
import { CampoLayout } from "./components/layout/CampoLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionContextProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/campo/login" element={<CampoLogin />} />

            {/* Rotas do Módulo de Campo */}
            <Route
              path="/campo"
              element={
                <ProtectedRoute scope="campo">
                  <CampoLayout><CampoVerificaCPF /></CampoLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/campo/cadastro"
              element={
                <ProtectedRoute scope="campo">
                  <CampoLayout><CampoCadastro /></CampoLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/campo/resumo"
              element={
                <ProtectedRoute scope="campo">
                  <CampoLayout><CampoResumo /></CampoLayout>
                </ProtectedRoute>
              }
            />

            {/* Rotas do Backoffice */}
            <Route
              path="/"
              element={
                <ProtectedRoute scope="backoffice">
                  <AppLayout><Dashboard /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/pessoas" element={<ProtectedRoute scope="backoffice"><AppLayout><Pessoas /></AppLayout></ProtectedRoute>} />
            <Route path="/pessoas/nova" element={<ProtectedRoute scope="backoffice"><AppLayout><PessoaForm /></AppLayout></ProtectedRoute>} />
            <Route path="/pessoas/:id" element={<ProtectedRoute scope="backoffice"><AppLayout><PessoaDetalhes /></AppLayout></ProtectedRoute>} />
            <Route path="/pessoas/:id/editar" element={<ProtectedRoute scope="backoffice"><AppLayout><PessoaForm /></AppLayout></ProtectedRoute>} />
            
            <Route path="/tickets" element={<ProtectedRoute scope="backoffice"><AppLayout><Tickets /></AppLayout></ProtectedRoute>} />
            <Route path="/tickets/novo" element={<ProtectedRoute scope="backoffice"><AppLayout><TicketForm /></AppLayout></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute scope="backoffice"><AppLayout><TicketDetalhes /></AppLayout></ProtectedRoute>} />
            <Route path="/tickets/:id/editar" element={<ProtectedRoute scope="backoffice"><AppLayout><TicketForm /></AppLayout></ProtectedRoute>} />

            <Route path="/atendimentos-deputado" element={<ProtectedRoute scope="backoffice"><AppLayout><AtendimentosDeputado /></AppLayout></ProtectedRoute>} />
            <Route path="/atendimentos-deputado/novo" element={<ProtectedRoute scope="backoffice"><AppLayout><AtendimentoDeputadoNovo /></AppLayout></ProtectedRoute>} />
            <Route path="/atendimentos-deputado/:id" element={<ProtectedRoute scope="backoffice"><AppLayout><AtendimentoDeputadoDetalhes /></AppLayout></ProtectedRoute>} />
            
            <Route path="/agenda" element={<ProtectedRoute scope="backoffice"><AppLayout><Agenda /></AppLayout></ProtectedRoute>} />
            <Route path="/cohab" element={<ProtectedRoute scope="backoffice"><AppLayout><Cohab /></AppLayout></ProtectedRoute>} />

            <Route path="/relatorios" element={<ProtectedRoute scope="backoffice"><AppLayout><Relatorios /></AppLayout></ProtectedRoute>} />
            <Route path="/financeiro" element={<ProtectedRoute scope="backoffice"><AppLayout><Financeiro /></AppLayout></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute scope="backoffice"><AppLayout><Usuarios /></AppLayout></ProtectedRoute>} />
            <Route path="/usuarios/novo" element={<ProtectedRoute scope="backoffice"><AppLayout><UsuarioForm /></AppLayout></ProtectedRoute>} />
            <Route path="/usuarios/:id/editar" element={<ProtectedRoute scope="backoffice"><AppLayout><UsuarioForm /></AppLayout></ProtectedRoute>} />
            <Route path="/usuarios/convites/novo" element={<ProtectedRoute scope="backoffice"><AppLayout><ConviteNovo /></AppLayout></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute scope="backoffice"><AppLayout><Configuracoes /></AppLayout></ProtectedRoute>} />

            {/* Rota de fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;