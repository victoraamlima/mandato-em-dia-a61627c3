import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import {
  Users,
  Ticket,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  Plus,
  Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

function useDashboardStats() {
  // Tickets abertos
  const ticketsAbertos = useQuery({
    queryKey: ["dashboard-tickets-abertos"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("ticket")
        .select("ticket_id", { count: "exact", head: true })
        .in("status", ["Aberto", "Em_analise", "Em_andamento"]);
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Pessoas cadastradas
  const pessoasCount = useQuery({
    queryKey: ["dashboard-pessoas-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("pessoa")
        .select("cidadao_id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Tempo médio de resolução (em dias)
  const tempoMedio = useQuery({
    queryKey: ["dashboard-tempo-medio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket")
        .select("created_at, data_fechamento")
        .eq("status", "Concluido");
      if (error) throw error;
      const tickets = data ?? [];
      if (tickets.length === 0) return 0;
      const totalDias = tickets.reduce((acc, t) => {
        if (t.data_fechamento && t.created_at) {
          const diff =
            (new Date(t.data_fechamento).getTime() -
              new Date(t.created_at).getTime()) /
            (1000 * 60 * 60 * 24);
          return acc + diff;
        }
        return acc;
      }, 0);
      return (totalDias / tickets.length).toFixed(1);
    },
  });

  // Taxa de resolução
  const taxaResolucao = useQuery({
    queryKey: ["dashboard-taxa-resolucao"],
    queryFn: async () => {
      const { count: total, error: err1 } = await supabase
        .from("ticket")
        .select("ticket_id", { count: "exact", head: true });
      if (err1) throw err1;
      const { count: concluidos, error: err2 } = await supabase
        .from("ticket")
        .select("ticket_id", { count: "exact", head: true })
        .eq("status", "Concluido");
      if (err2) throw err2;
      if (!total || total === 0) return "0%";
      return `${Math.round(((concluidos ?? 0) / total) * 100)}%`;
    },
  });

  // Tickets recentes (últimos 5)
  const ticketsRecentes = useQuery({
    queryKey: ["dashboard-tickets-recentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket")
        .select(
          `
            ticket_id,
            motivo_atendimento,
            prioridade,
            status,
            created_at,
            pessoa:cidadao_id (
              nome,
              municipio
            ),
            atendente:atendente_id (
              nome
            )
          `
        )
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Próximos eventos (7 dias)
  const proximosEventos = useQuery({
    queryKey: ["dashboard-proximos-eventos"],
    queryFn: async () => {
      const now = new Date();
      const in7 = new Date();
      in7.setDate(now.getDate() + 7);
      const { data, error } = await supabase
        .from("evento")
        .select("*")
        .gte("inicio", now.toISOString())
        .lte("inicio", in7.toISOString())
        .order("inicio", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return {
    ticketsAbertos,
    pessoasCount,
    tempoMedio,
    taxaResolucao,
    ticketsRecentes,
    proximosEventos,
  };
}

export default function Dashboard() {
  const {
    ticketsAbertos,
    pessoasCount,
    tempoMedio,
    taxaResolucao,
    ticketsRecentes,
    proximosEventos,
  } = useDashboardStats();

  const stats = [
    {
      title: "Tickets Abertos",
      value: ticketsAbertos.data ?? "-",
      description: "Aguardando atendimento",
      icon: Ticket,
      trend: { value: 0, isPositive: true },
      loading: ticketsAbertos.isLoading,
    },
    {
      title: "Pessoas Cadastradas",
      value: pessoasCount.data ?? "-",
      description: "Total no sistema",
      icon: Users,
      trend: { value: 0, isPositive: true },
      loading: pessoasCount.isLoading,
    },
    {
      title: "Tempo Médio",
      value:
        tempoMedio.isLoading
          ? "-"
          : tempoMedio.data === 0
          ? "0"
          : `${tempoMedio.data} dias`,
      description: "Para conclusão",
      icon: Clock,
      trend: { value: 0, isPositive: true },
      loading: tempoMedio.isLoading,
    },
    {
      title: "Taxa de Resolução",
      value: taxaResolucao.data ?? "-",
      description: "Tickets concluídos",
      icon: TrendingUp,
      trend: { value: 0, isPositive: true },
      loading: taxaResolucao.isLoading,
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
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Novo Atendimento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Recentes */}
        <div className="lg:col-span-2">
          <Card className="card-institutional">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                Tickets Recentes
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href="/tickets">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Todos
                </a>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketsRecentes.isLoading ? (
                <div className="text-center text-muted-foreground py-8">Carregando...</div>
              ) : ticketsRecentes.data?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Nenhum ticket recente.</div>
              ) : (
                ticketsRecentes.data.map((ticket: any) => (
                  <div
                    key={ticket.ticket_id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm text-primary">
                          {ticket.ticket_id.slice(0, 8)}
                        </span>
                        <StatusBadge status={ticket.status?.toLowerCase() as any} />
                        <PriorityBadge priority={ticket.prioridade?.toLowerCase() as any} />
                      </div>
                      <h4 className="font-medium text-foreground">
                        {ticket.pessoa?.nome ?? "-"}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ticket.pessoa?.municipio ?? "-"}
                        </span>
                        <span>{ticket.motivo_atendimento}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Atendente: {ticket.atendente?.nome ?? "-"} •{" "}
                        {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Próximos Eventos */}
        <div>
          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {proximosEventos.isLoading ? (
                <div className="text-center text-muted-foreground py-8">Carregando...</div>
              ) : proximosEventos.data?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Nenhum evento nos próximos 7 dias.</div>
              ) : (
                proximosEventos.data.map((event: any) => (
                  <div
                    key={event.evento_id}
                    className="p-3 border border-border rounded-lg space-y-2"
                  >
                    <h4 className="font-medium text-sm text-foreground">
                      {event.titulo}
                    </h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.inicio).toLocaleDateString("pt-BR")} às {new Date(event.inicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.local}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" size="sm" asChild>
                <a href="/agenda">Ver Agenda Completa</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}