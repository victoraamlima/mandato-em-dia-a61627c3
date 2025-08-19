import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  Ticket,
  Clock,
  User,
  MapPin,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 10;

function maskCpf(cpf: string) {
  if (!cpf) return "";
  return cpf.replace(/^(\d{3})\d{6}(\d{2})$/, "$1.***.***-$2");
}

function maskPhone(phone: string) {
  if (!phone) return "";
  return phone.replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, function (_, ddd, prefix, suffix) {
    if (!suffix) return `(${ddd}) ${prefix}`;
    return `(${ddd}) *****-${suffix}`;
  });
}

type TicketListItem = {
  ticket_id: string;
  cidadao: {
    cidadao_id: string;
    nome: string;
    municipio: string;
    cpf: string;
  } | null;
  motivo_atendimento: string;
  categoria: string;
  prioridade: string;
  status: string;
  atendente: {
    nome: string;
  } | null;
  colaborador: {
    nome: string;
  } | null;
  dataAbertura: string;
  prazoSla: string | null;
  origem: string;
};

type TicketsQueryResult = {
  tickets: TicketListItem[];
  total: number;
};

export default function Tickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [prioridadeFilter, setPrioridadeFilter] = useState("");
  const [municipioFilter, setMunicipioFilter] = useState("");
  const [page, setPage] = useState(1);

  // Busca de municípios distintos para filtro
  const { data: municipios } = useQuery({
    queryKey: ["municipios-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoa")
        .select("municipio", { head: false });
      if (error) throw error;
      return Array.from(new Set((data ?? []).map((p) => p.municipio)));
    },
  });

  // Busca paginada de tickets
  const { data, isLoading, isError, refetch } = useQuery<TicketsQueryResult, Error>({
    queryKey: [
      "tickets",
      searchTerm,
      statusFilter,
      prioridadeFilter,
      municipioFilter,
      page,
    ],
    queryFn: async () => {
      let query = supabase
        .from("ticket")
        .select(
          `
            ticket_id,
            motivo_atendimento,
            categoria,
            prioridade,
            status,
            prazo_sla,
            origem,
            created_at,
            pessoa:cidadao_id (
              cidadao_id,
              nome,
              municipio,
              cpf
            ),
            atendente:atendente_id (
              nome
            ),
            colaborador:colaborador_id (
              nome
            )
          `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      // Filtros
      if (searchTerm) {
        query = query.or(
          [
            `motivo_atendimento.ilike.%${searchTerm}%`,
            `pessoa.nome.ilike.%${searchTerm}%`,
            `pessoa.cpf.eq.${searchTerm.replace(/\D/g, "")}`,
            `pessoa.municipio.ilike.%${searchTerm}%`,
            `ticket_id.ilike.%${searchTerm}%`,
          ].join(",")
        );
      }
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      if (prioridadeFilter) {
        query = query.eq("prioridade", prioridadeFilter);
      }
      if (municipioFilter) {
        query = query.eq("pessoa.municipio", municipioFilter);
      }

      // Paginação
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      // Map para o formato esperado, garantindo shape correto
      const tickets: TicketListItem[] = (data ?? []).map((t: any) => ({
        ticket_id: t.ticket_id,
        motivo_atendimento: t.motivo_atendimento,
        categoria: t.categoria,
        prioridade: t.prioridade,
        status: t.status,
        prazoSla: t.prazo_sla,
        origem: t.origem,
        dataAbertura: t.created_at,
        cidadao:
          t.pessoa && typeof t.pessoa === "object" && !("error" in t.pessoa)
            ? {
                cidadao_id: t.pessoa.cidadao_id,
                nome: t.pessoa.nome,
                municipio: t.pessoa.municipio,
                cpf: t.pessoa.cpf,
              }
            : null,
        atendente:
          t.atendente && typeof t.atendente === "object" && !("error" in t.atendente)
            ? { nome: t.atendente.nome }
            : null,
        colaborador:
          t.colaborador && typeof t.colaborador === "object" && !("error" in t.colaborador)
            ? { nome: t.colaborador.nome }
            : null,
      }));

      return { tickets, total: count ?? 0 };
    },
  });

  const filteredTickets = data?.tickets ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Estatísticas rápidas
  const estatisticas = {
    total,
    abertos: filteredTickets.filter(t => t.status === "Aberto").length,
    emAndamento: filteredTickets.filter(t => t.status === "Em_andamento" || t.status === "Em_analise").length,
    concluidos: filteredTickets.filter(t => t.status === "Concluido").length,
    atrasados: filteredTickets.filter(t => t.prazoSla && new Date(t.prazoSla) < new Date() && t.status !== "Concluido").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Atendimentos</h1>
          <p className="text-muted-foreground">
            Gerencie tickets e solicitações dos cidadãos
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover" asChild>
          <a href="/tickets/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Ticket
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estatisticas.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estatisticas.abertos}</p>
                <p className="text-sm text-muted-foreground">Abertos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estatisticas.emAndamento}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estatisticas.concluidos}</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive-light rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{estatisticas.atrasados}</p>
                <p className="text-sm text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Buscar e Filtrar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por ID, cidadão, motivo ou município..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Status</option>
                <option value="Aberto">Aberto</option>
                <option value="Em_analise">Em análise</option>
                <option value="Em_andamento">Em andamento</option>
                <option value="Concluido">Concluído</option>
                <option value="Arquivado">Arquivado</option>
              </select>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={prioridadeFilter}
                onChange={(e) => {
                  setPrioridadeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Prioridade</option>
                <option value="Baixa">Baixa</option>
                <option value="Media">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={municipioFilter}
                onChange={(e) => {
                  setMunicipioFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Município</option>
                {municipios?.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="card-institutional">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-hover border-border">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Cidadão</TableHead>
                  <TableHead className="font-semibold">Motivo</TableHead>
                  <TableHead className="font-semibold">Prioridade</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Atendente</TableHead>
                  <TableHead className="font-semibold">Colaborador</TableHead>
                  <TableHead className="font-semibold">Prazo SLA</TableHead>
                  <TableHead className="font-semibold">Origem</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <span className="animate-pulse text-muted-foreground">Carregando...</span>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-destructive">
                      Erro ao carregar dados.
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Nenhum ticket encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.ticket_id}
                      className="hover:bg-surface-hover transition-colors"
                    >
                      <TableCell className="font-mono text-sm font-medium text-primary">
                        {ticket.ticket_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{ticket.cidadao?.nome ?? "-"}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {ticket.cidadao?.municipio ?? "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{ticket.motivo_atendimento}</p>
                          <p className="text-xs text-muted-foreground">{ticket.categoria}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.prioridade?.toLowerCase() as any} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status?.toLowerCase() as any} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {ticket.atendente?.nome ?? <span className="text-muted-foreground">Nenhum</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {ticket.colaborador?.nome ?? <span className="text-muted-foreground">Nenhum</span>}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{ticket.prazoSla ? new Date(ticket.prazoSla).toLocaleDateString("pt-BR") : "-"}</p>
                          {ticket.prazoSla && new Date(ticket.prazoSla) < new Date() && ticket.status !== "Concluido" && (
                            <p className="text-xs text-destructive font-medium">Atrasado</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.origem === "campo" 
                            ? "bg-warning-light text-warning" 
                            : "bg-primary-light text-primary"
                        }`}>
                          {ticket.origem === "campo" ? "Campo" : ticket.origem === "importacao" ? "Importação" : "Gabinete"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={`/tickets/${ticket.ticket_id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/tickets/${ticket.ticket_id}/editar`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/tickets/novo?cidadao_id=${ticket.cidadao?.cidadao_id ?? ""}`}>
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Ticket
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="px-2 py-1 text-sm">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}