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
import { Badge } from "@/components/ui/badge";
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
  Ticket as TicketIcon,
  User,
  MapPin,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 10;

type TicketListItem = {
  ticket_id: string;
  motivo_atendimento: string;
  categoria: string;
  prioridade: string;
  descricao_curta: string;
  status: string;
  cidadao_id: string;
  created_at: string;
};

type TicketsQueryResult = {
  tickets: TicketListItem[];
  total: number;
};

export default function Tickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Busca de categorias distintas para filtro
  const { data: categorias } = useQuery({
    queryKey: ["ticket-categorias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket")
        .select("categoria", { count: "exact", head: false })
        .order("categoria", { ascending: true });
      if (error) throw error;
      const unique = Array.from(new Set((data ?? []).map((t) => t.categoria)));
      return unique;
    },
  });

  // Busca paginada de tickets
  const { data, isLoading, isError, refetch } = useQuery<TicketsQueryResult>({
    queryKey: ["tickets", searchTerm, categoriaFilter, statusFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("ticket")
        .select(
          "ticket_id, motivo_atendimento, categoria, prioridade, descricao_curta, status, cidadao_id, created_at",
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      // Filtros
      if (searchTerm) {
        query = query.or(
          [
            `motivo_atendimento.ilike.%${searchTerm}%`,
            `categoria.ilike.%${searchTerm}%`,
            `descricao_curta.ilike.%${searchTerm}%`,
          ].join(",")
        );
      }
      if (categoriaFilter) {
        query = query.eq("categoria", categoriaFilter);
      }
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      // Paginação
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return { tickets: data ?? [], total: count ?? 0 };
    },
  });

  const filteredTickets = data?.tickets ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

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
            Novo Atendimento
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                <TicketIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total de Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Outros cards podem ser implementados se necessário */}
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
                placeholder="Buscar por motivo, categoria ou descrição..."
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
                value={categoriaFilter}
                onChange={(e) => {
                  setCategoriaFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Categoria</option>
                {categorias?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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
                <option value="Fechado">Fechado</option>
                {/* Adicione outros status conforme necessário */}
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
                  <TableHead className="font-semibold">Motivo</TableHead>
                  <TableHead className="font-semibold">Categoria</TableHead>
                  <TableHead className="font-semibold">Prioridade</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Descrição</TableHead>
                  <TableHead className="font-semibold">Criado em</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <span className="animate-pulse text-muted-foreground">Carregando...</span>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-destructive">
                      Erro ao carregar dados.
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum ticket encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.ticket_id}
                      className="hover:bg-surface-hover transition-colors"
                    >
                      <TableCell className="font-medium">
                        {ticket.motivo_atendimento}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {ticket.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ticket.prioridade === "Alta"
                              ? "priority-alta"
                              : ticket.prioridade === "Media"
                              ? "priority-media"
                              : "priority-baixa"
                          }
                        >
                          {ticket.prioridade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ticket.status === "Aberto"
                              ? "status-aberto"
                              : ticket.status === "Fechado"
                              ? "status-concluido"
                              : "status-em-andamento"
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.descricao_curta}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
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