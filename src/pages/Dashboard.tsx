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
import { differenceInDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Hook para buscar estatísticas do dashboard
function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      // Executa todas as consultas em paralelo
      const [
        openTicketsRes,
        peopleCountRes,
        closedTicketsRes,
        totalTicketsRes,
        closedTicketsForAvgTimeRes,
      ] = await Promise.all([
        supabase.from("ticket").select("ticket_id", { count: "exact", head: true }).eq("status", "Aberto"),
        supabase.from("pessoa").select("cidadao_id", { count: "exact", head: true }),
        supabase.from("ticket").select("ticket_id", { count: "exact", head: true }).eq("status", "Fechado"),
        supabase.from("ticket").select("ticket_id", { count: "exact", head: true }),
        supabase.from("ticket").select("created_at, data_fechamento").eq("status", "Fechado").not("data_fechamento", "is", null).limit(1000),
      ]);

      // Tratamento de erros
      if (openTicketsRes.error) throw openTicketsRes.error;
      if (peopleCountRes.error) throw peopleCountRes.error;
      if (closedTicketsRes.error) throw closedTicketsRes.error;
      if (totalTicketsRes.error) throw totalTicketsRes.error;
      if (closedTicketsForAvgTimeRes.error) throw closedTicketsForAvgTimeRes.error;

      // Cálculo da Taxa de Resolução
      const closedCount = closedTicketsRes.count ?? 0;
      const totalCount = totalTicketsRes.count ?? 0;
      const resolutionRate = totalCount > 0 ? (closedCount / totalCount) * 100 : 0;

      // Cálculo do Tempo Médio de Resolução
      const ticketsForAvg = closedTicketsForAvgTimeRes.data ?? [];
      let avgResolutionTime = 0;
      if (ticketsForAvg.length > 0) {
        const totalDays = ticketsForAvg.reduce((acc, ticket) => {
          const created = new Date(ticket.created_at);
          const closed = new Date(ticket.data_fechamento!);
          return acc + differenceInDays(closed, created);
        }, 0);
        avgResolutionTime = totalDays / ticketsForAvg.length;
      }

      return {
        openTickets: openTicketsRes.count ?? 0,
        peopleCount: peopleCountRes.count ?? 0,
        resolutionRate: Math.round(resolutionRate),
        avgResolutionTime: Math.round(avgResolutionTime),
      };
    },
  });
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
                .select("evento_id, titulo, inicio, local")
                .gte("inicio", new Date().toISOString())
                .order("inicio", { ascending: true })
                .limit(3);
            if (error) throw error;
            return data ?? [];
        }
    });
}

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: recentTickets, isLoading: loadingRecent, isError: errorRecent } = useRecentTickets();
  const { data: upcomingEvents, isLoading: loadingEvents } = useUpcomingEvents();

  const statCards = [
    {
      title: "Tickets Abertos",
      value: stats?.openTickets ?? 0,
      description: "Aguardando atendimento",
      icon: Ticket,
      loading: loadingStats,
    },
    {
      title: "Pessoas Cadastradas",
      value: stats?.peopleCount ?? 0,
      description: "Total no sistema",
      icon: Users,
      loading: loadingStats,
    },
    {
      title: "Tempo Médio",
      value: `${stats?.avgResolutionTime ?? 0} dias`,
      description: "Para conclusão",
      icon: Clock,
      loading: loadingStats,
    },
    {
      title: "Taxa de Resolução",
      value: `${stats?.resolutionRate ?? 0}%`,
      description: "Tickets concluídos",
      icon: TrendingUp,
      loading: loadingStats,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.loading ? "-" : stat.value}
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
              <div className="text-destructive text-center py-8">Erro ao carregar tickets recentes.</div>
            ) : recentTickets.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">Nenhum ticket recente encontrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTickets.map((ticket: any) => (
                      <TableRow key={ticket.ticket_id}>
                        <TableCell className="font-medium">{ticket.motivo_atendimento}</TableCell>
                        <TableCell>
                          <Badge className={ticket.prioridade === "Alta" ? "priority-alta" : ticket.prioridade === "Media" ? "priority-media" : "priority-baixa"}>
                            {ticket.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={ticket.status === "Aberto" ? "status-aberto" : ticket.status === "Fechado" ? "status-concluido" : "status-em-andamento"}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
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
            ) : !upcomingEvents || upcomingEvents.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">Nenhum evento futuro.</div>
            ) : (
                <ul className="space-y-4">
                    {upcomingEvents.map(evento => (
                        <li key={evento.evento_id} className="flex items-start gap-4">
                            <div className="flex flex-col items-center justify-center bg-primary-light text-primary font-bold rounded-md p-2 w-16 h-16">
                                <span className="text-xs uppercase">{format(new Date(evento.inicio), 'MMM', { locale: ptBR })}</span>
                                <span className="text-2xl">{format(new Date(evento.inicio), 'd')}</span>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{evento.titulo}</p>
                                <p className="text-sm text-muted-foreground">{evento.local}</p>
                                <p className="text-sm text-muted-foreground">{format(new Date(evento.inicio), 'HH:mm')}</p>
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