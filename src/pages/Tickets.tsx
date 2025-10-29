import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveTable, type Column } from "@/components/ui/responsive-table";

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

  const { data: categorias } = useQuery({
    queryKey: ["ticket-categorias"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ticket").select("categoria").order("categoria");
      if (error) throw error;
      return Array.from(new Set((data ?? []).map((t) => t.categoria)));
    },
  });

  const { data, isLoading, isError, refetch } = useQuery<TicketsQueryResult>({
    queryKey: ["tickets", searchTerm, categoriaFilter, statusFilter, page],
    queryFn: async () => {
      let query = supabase.from("ticket").select("*, pessoa:cidadao_id(nome)", { count: "exact" }).order("created_at", { ascending: false });
      if (searchTerm) query = query.or(`motivo_atendimento.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,descricao_curta.ilike.%${searchTerm}%`);
      if (categoriaFilter) query = query.eq("categoria", categoriaFilter);
      if (statusFilter) query = query.eq("status", statusFilter);
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

  const columns: Column<TicketListItem>[] = [
    { header: "Motivo", accessor: "motivo_atendimento", className: "font-medium" },
    { header: "Categoria", accessor: (item: TicketListItem) => <Badge variant="secondary" className="text-xs">{item.categoria}</Badge> },
    { header: "Prioridade", accessor: (item: TicketListItem) => <Badge className={item.prioridade === "Alta" ? "priority-alta" : item.prioridade === "Media" ? "priority-media" : "priority-baixa"}>{item.prioridade}</Badge> },
    { header: "Status", accessor: (item: TicketListItem) => <Badge className={item.status === "Aberto" ? "status-aberto" : item.status === "Fechado" ? "status-concluido" : "status-em-andamento"}>{item.status}</Badge> },
    { header: "Descrição", accessor: "descricao_curta" },
    { header: "Criado em", accessor: (item: TicketListItem) => new Date(item.created_at).toLocaleDateString("pt-BR"), className: "text-sm text-muted-foreground" },
    { header: "", className: "w-[50px]", accessor: (item: TicketListItem) => <ActionsDropdown item={item} /> },
  ];

  const ActionsDropdown = ({ item }: { item: TicketListItem }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild><a href={`/tickets/${item.ticket_id}`}><Eye className="w-4 h-4 mr-2" />Visualizar</a></DropdownMenuItem>
        <DropdownMenuItem asChild><a href={`/tickets/${item.ticket_id}/editar`}><Edit className="w-4 h-4 mr-2" />Editar</a></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderMobileCard = (item: TicketListItem) => (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <a href={`/tickets/${item.ticket_id}`} className="font-bold hover:underline">{item.motivo_atendimento}</a>
        <ActionsDropdown item={item} />
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <div>Categoria: <Badge variant="secondary" className="text-xs">{item.categoria}</Badge></div>
        <div>Status: <Badge className={item.status === "Aberto" ? "status-aberto" : "status-concluido"}>{item.status}</Badge></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Atendimentos"
        description="Gerencie tickets e solicitações dos cidadãos"
        action={{ label: "Novo Atendimento", href: "/tickets/novo" }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center"><TicketIcon className="w-5 h-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{total}</p><p className="text-sm text-muted-foreground">Total de Tickets</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-institutional">
        <CardHeader><CardTitle>Buscar e Filtrar</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Buscar por motivo, categoria ou descrição..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select className="border rounded px-2 py-1 text-sm h-10" value={categoriaFilter} onChange={(e) => { setCategoriaFilter(e.target.value); setPage(1); }}>
                <option value="">Categoria</option>
                {categorias?.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <select className="border rounded px-2 py-1 text-sm h-10" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">Status</option>
                <option value="Aberto">Aberto</option>
                <option value="Fechado">Fechado</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => refetch()}><Filter className="w-4 h-4 mr-2" />Filtros</Button>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResponsiveTable
        columns={columns}
        data={filteredTickets}
        rowKey="ticket_id"
        isLoading={isLoading}
        isError={isError}
        renderMobileCard={renderMobileCard}
        noResultsMessage="Nenhum ticket encontrado."
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</Button>
          <span className="px-2 py-1 text-sm">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Próxima</Button>
        </div>
      )}
    </div>
  );
}