import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Dados de exemplo - substituir por dados reais da API
const stats = [
  {
    title: "Tickets Abertos",
    value: 247,
    description: "Aguardando atendimento",
    icon: Ticket,
    trend: { value: 12, isPositive: true },
  },
  {
    title: "Pessoas Cadastradas",
    value: "1.234",
    description: "Total no sistema",
    icon: Users,
    trend: { value: 8, isPositive: true },
  },
  {
    title: "Tempo Médio",
    value: "2.5 dias",
    description: "Para conclusão",
    icon: Clock,
    trend: { value: 15, isPositive: false },
  },
  {
    title: "Taxa de Resolução",
    value: "94%",
    description: "Tickets concluídos",
    icon: TrendingUp,
    trend: { value: 3, isPositive: true },
  },
];

const recentTickets = [
  {
    id: "TK-2024-001",
    cidadao: "Maria Silva Santos",
    municipio: "São Paulo",
    motivo: "Solicitação de documento",
    prioridade: "media" as const,
    status: "aberto" as const,
    dataAbertura: "2024-01-15",
    atendente: "João Oliveira",
  },
  {
    id: "TK-2024-002", 
    cidadao: "José Carlos Lima",
    municipio: "Guarulhos",
    motivo: "Denúncia de irregularidade",
    prioridade: "alta" as const,
    status: "em-andamento" as const,
    dataAbertura: "2024-01-14",
    atendente: "Ana Costa",
  },
  {
    id: "TK-2024-003",
    cidadao: "Fernanda Rodrigues",
    municipio: "Osasco", 
    motivo: "Informação sobre benefício",
    prioridade: "baixa" as const,
    status: "concluido" as const,
    dataAbertura: "2024-01-13",
    atendente: "Pedro Santos",
  },
];

const upcomingEvents = [
  {
    title: "Audiência Pública - Saúde",
    date: "2024-01-20",
    time: "14:00",
    location: "Auditório Central",
  },
  {
    title: "Visita - Centro de Reabilitação",
    date: "2024-01-22",
    time: "09:30",
    location: "AACD Osasco",
  },
  {
    title: "Reunião - Secretaria de Obras",
    date: "2024-01-25",
    time: "10:00",
    location: "Prefeitura de São Paulo",
  },
];

export default function Dashboard() {
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
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm text-primary">
                        {ticket.id}
                      </span>
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.prioridade} />
                    </div>
                    <h4 className="font-medium text-foreground">
                      {ticket.cidadao}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ticket.municipio}
                      </span>
                      <span>{ticket.motivo}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Atendente: {ticket.atendente} • {ticket.dataAbertura}
                    </p>
                  </div>
                </div>
              ))}
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
              {upcomingEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-3 border border-border rounded-lg space-y-2"
                >
                  <h4 className="font-medium text-sm text-foreground">
                    {event.title}
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {event.date} às {event.time}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm">
                Ver Agenda Completa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}