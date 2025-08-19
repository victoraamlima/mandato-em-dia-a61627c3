import { useState } from "react";
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

// Dados de exemplo
const tickets = [
  {
    id: "TK-2024-001",
    cidadao: {
      nome: "Maria Silva Santos",
      municipio: "São Paulo",
    },
    motivo: "Solicitação de documento",
    categoria: "Documentação",
    prioridade: "media" as const,
    status: "aberto" as const,
    atendente: "João Oliveira",
    colaborador: "Vereador José Santos",
    dataAbertura: "2024-01-15",
    prazoSla: "2024-01-18",
    origem: "gabinete",
  },
  {
    id: "TK-2024-002",
    cidadao: {
      nome: "José Carlos Lima",
      municipio: "Guarulhos",
    },
    motivo: "Denúncia de irregularidade",
    categoria: "Denúncia",
    prioridade: "alta" as const,
    status: "em-andamento" as const,
    atendente: "Ana Costa",
    colaborador: null,
    dataAbertura: "2024-01-14",
    prazoSla: "2024-01-16",
    origem: "campo",
  },
  {
    id: "TK-2024-003",
    cidadao: {
      nome: "Fernanda Rodrigues",
      municipio: "Osasco",
    },
    motivo: "Informação sobre benefício",
    categoria: "Informação",
    prioridade: "baixa" as const,
    status: "concluido" as const,
    atendente: "Pedro Santos",
    colaborador: null,
    dataAbertura: "2024-01-13",
    prazoSla: "2024-01-20",
    origem: "gabinete",
  },
];

export default function Tickets() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTickets = tickets.filter(ticket => 
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.cidadao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.cidadao.municipio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const estatisticas = {
    total: tickets.length,
    abertos: tickets.filter(t => t.status === "aberto").length,
    emAndamento: tickets.filter(t => t.status === "em-andamento").length,
    concluidos: tickets.filter(t => t.status === "concluido").length,
    atrasados: tickets.filter(t => new Date(t.prazoSla) < new Date() && t.status !== "concluido").length,
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
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Novo Ticket
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
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
                {filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <TableCell className="font-mono text-sm font-medium text-primary">
                      {ticket.id}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{ticket.cidadao.nome}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {ticket.cidadao.municipio}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{ticket.motivo}</p>
                        <p className="text-xs text-muted-foreground">{ticket.categoria}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={ticket.prioridade} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {ticket.atendente}
                    </TableCell>
                    <TableCell className="text-sm">
                      {ticket.colaborador || (
                        <span className="text-muted-foreground">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{ticket.prazoSla}</p>
                        {new Date(ticket.prazoSla) < new Date() && ticket.status !== "concluido" && (
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
                        {ticket.origem === "campo" ? "Campo" : "Gabinete"}
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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="w-4 h-4 mr-2" />
                            Atribuir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredTickets.length === 0 && searchTerm && (
        <Card className="card-institutional">
          <CardContent className="p-8 text-center">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum ticket encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Não encontramos resultados para "{searchTerm}"
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Limpar busca
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}