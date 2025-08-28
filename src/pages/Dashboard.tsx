import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Ticket,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  MoreHorizontal,
  Edit,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Hook para buscar estatísticas do dashboard
function useDashboardStats() {
  const ticketsAbertos = useQuery({
    queryKey: ["dashboard", "ticketsAbertos"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("ticket")
        .select("ticket_id", { count: "exact", head: true })
        .eq("status", "Aberto");
      if (error) throw error;
      return count ?? 0;
    },
  });

  const pessoasCount = useQuery({
    queryKey: ["dashboard", "pessoasCount"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("pessoa")
        .select("cidadao_id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const tempoMedio = useQuery({
    queryKey: ["dashboard", "tempoMedio"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('calcular_tempo_medio_resolucao');
      if (error) throw error;
      return data;
    },
  });

  const taxaResolucao = useQuery({
    queryKey: ["dashboard", "taxaResolucao"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('calcular_taxa_resolucao');
      if (error) throw error;
      return data;
    },
  });

  return {
    ticketsAbertos,
    pessoasCount,
    tempoMedio,
    taxaResolucao,
  };
}

// Hook para buscar os tickets mais recentes
function useRecentTickets() {
  return useQuery({
    queryKey: ["dashboard", "recentTickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket")
        .select(
          "ticket_id, motivo_atendimento, categoria, prioridade, status, descricao_curta, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Hook para buscar os próximos eventos
function useUpcomingEvents() {
    return useQuery({
      queryKey: ["dashboard", "upcomingEvents"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("evento")
          .select("evento_id, titulo, local, inicio")
          .gt("inicio", new Date().toISOString())
          .order("inicio", { ascending: true })
          .limit(5);
        if (error) throw error;
        return data ?? [];
      },
    });
  }

export default function Dashboard() {
  const {
    ticketsAbertos,
    pessoasCount,
    tempoMedio,
    taxaResolucao,
  } = useDashboardStats();

  const {
    data: recentTickets,
    isLoading: loadingRecent,
    isError: errorRecent,
  } = useRecentTickets();

  const {
    data: upcomingEvents,
    isLoading: loadingEvents,
    isError: errorEvents,
  } = useUpcomingEvents();

  const stats = [
    {
      title: "Tickets Abertos",
      value: ticketsAbertos.isLoading ? "-" : ticketsAbertos.data,
      description: "Aguardando atendimento",
      icon: Ticket,
    },
    {
      title: "Pessoas Cadastradas",
      value: pessoasCount.isLoading ? "-" : pessoasCount.data,
      description: "Total no sistema",
      icon: Users,
    },
    {
      title: "Tempo Médio",
      value: tempoMedio.isLoading ? "-" : `${(tempoMedio.data || 0).toFixed(1)} dias`,
      description: "Para conclusão de tickets",
      icon: Clock,
    },
    {
      title: "Taxa de Resolução",
      value: taxaResolucao.isLoading ? "-" : `${(taxaResolucao.data || 0).toFixed(1)}%`,
      description: "Tickets concluídos",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das atividades do gabinete
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover" asChild>
          <a href="/tickets/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Atendimento
          </a>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value?.toString() || "-"}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Recentes */}
        <Card className="card-institutional lg:col-span-2">
          <CardHeader>
            <CardTitle>Tickets Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRecent ? (
              <div className="text-muted-foreground text-center py-8">Carregando...</div>
            ) : errorRecent ? (
              <div className="text-destructive text-center py-8">Erro ao carregar tickets.</div>
            ) : recentTickets.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">Nenhum ticket recente.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTickets.map((ticket: any) => (
                      <TableRow key={ticket.ticket_id}>
                        <TableCell className="font-medium">{ticket.motivo_atendimento}</TableCell>
                        <TableCell>
                          <Badge className={ticket.status === "Aberto" ? "status-aberto" : ticket.status === "Fechado" ? "status-concluido" : "status-em-andamento"}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={ticket.prioridade === "Alta" ? "priority-alta" : ticket.prioridade === "Media" ? "priority-media" : "priority-baixa"}>
                            {ticket.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><a href={`/tickets/${ticket.ticket_id}`}><Eye className="w-4 h-4 mr-2" />Visualizar</a></DropdownMenuItem>
                              <DropdownMenuItem asChild><a href={`/tickets/${ticket.ticket_id}/editar`}><Edit className="w-4 h-4 mr-2" />Editar</a></DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card className="card-institutional">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <div className="text-muted-foreground text-center py-8">Carregando...</div>
            ) : errorEvents ? (
              <div className="text-destructive text-center py-8">Erro ao carregar eventos.</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">Nenhum evento futuro.</div>
            ) : (
              <ul className="space-y-4">
                {upcomingEvents.map((event) => (
                  <li key={event.evento_id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary-light text-primary rounded-md p-2 font-bold">
                      <span className="text-xs uppercase">{format(new Date(event.inicio), 'MMM', { locale: ptBR })}</span>
                      <span className="text-lg">{format(new Date(event.inicio), 'd')}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{event.titulo}</p>
                      <p className="text-sm text-muted-foreground">{event.local}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(event.inicio), 'HH:mm')}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}