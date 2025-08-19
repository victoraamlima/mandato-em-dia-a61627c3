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

// FIX: Implement the hook to return the expected stats
function useDashboardStats() {
  // Tickets abertos
  const ticketsAbertos = useQuery({
    queryKey: ["dashboard", "ticketsAbertos"],
    queryFn: async () => {
      const { count } = await supabase
        .from("ticket")
        .select("*", { count: "exact", head: true })
        .eq("status", "Aberto");
      return count ?? 0;
    },
    initialData: 0,
  });

  // Pessoas cadastradas
  const pessoasCount = useQuery({
    queryKey: ["dashboard", "pessoasCount"],
    queryFn: async () => {
      const { count } = await supabase
        .from("pessoa")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    initialData: 0,
  });

  // Tempo médio (dummy, implement as needed)
  const tempoMedio = useQuery({
    queryKey: ["dashboard", "tempoMedio"],
    queryFn: async () => 0,
    initialData: 0,
  });

  // Taxa de resolução (dummy, implement as needed)
  const taxaResolucao = useQuery({
    queryKey: ["dashboard", "taxaResolucao"],
    queryFn: async () => 0,
    initialData: 0,
  });

  // Tickets recentes (dummy, implement as needed)
  const ticketsRecentes = useQuery({
    queryKey: ["dashboard", "ticketsRecentes"],
    queryFn: async () => [],
    initialData: [],
  });

  // Próximos eventos (dummy, implement as needed)
  const proximosEventos = useQuery({
    queryKey: ["dashboard", "proximosEventos"],
    queryFn: async () => [],
    initialData: [],
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
        <Button className="bg-primary hover:bg-primary-hover" asChild>
          <a href="/tickets/novo">
            <Plus className="w-4 h-4 mr-2" />
            Novo Atendimento
          </a>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Tickets Recentes (placeholder) */}
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Tickets Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-8">
            Em breve: listagem dos tickets mais recentes.
          </div>
        </CardContent>
      </Card>

      {/* Próximos Eventos (placeholder) */}
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-8">
            Em breve: próximos eventos do gabinete.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}