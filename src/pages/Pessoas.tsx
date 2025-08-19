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
  Users,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// Dados de exemplo
const pessoas = [
  {
    id: "1",
    nome: "Maria Silva Santos",
    cpf: "123.456.789-00",
    telefone: "(11) 99999-****",
    email: "maria.silva@email.com",
    municipio: "São Paulo",
    uf: "SP",
    tituloEleitor: "1234567890123",
    dataUltimoAtendimento: "2024-01-15",
    totalTickets: 3,
    ticketsAbertos: 1,
  },
  {
    id: "2", 
    nome: "José Carlos Lima",
    cpf: "987.654.321-00",
    telefone: "(11) 88888-****",
    email: null,
    municipio: "Guarulhos",
    uf: "SP",
    tituloEleitor: null,
    dataUltimoAtendimento: "2024-01-14",
    totalTickets: 1,
    ticketsAbertos: 1,
  },
  {
    id: "3",
    nome: "Fernanda Rodrigues",
    cpf: "456.789.123-00", 
    telefone: "(11) 77777-****",
    email: "fernanda.r@email.com",
    municipio: "Osasco",
    uf: "SP",
    tituloEleitor: "9876543210987",
    dataUltimoAtendimento: "2024-01-13",
    totalTickets: 2,
    ticketsAbertos: 0,
  },
];

export default function Pessoas() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPessoas = pessoas.filter(pessoa => 
    pessoa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pessoa.cpf.includes(searchTerm) ||
    pessoa.municipio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pessoas</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro de cidadãos atendidos
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Nova Pessoa
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pessoas.length}</p>
                <p className="text-sm text-muted-foreground">Total de Pessoas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Municípios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Com Telefone</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">67%</p>
                <p className="text-sm text-muted-foreground">Com Email</p>
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
                placeholder="Buscar por nome, CPF ou município..."
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
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">CPF</TableHead>
                  <TableHead className="font-semibold">Contato</TableHead>
                  <TableHead className="font-semibold">Localização</TableHead>
                  <TableHead className="font-semibold">Título Eleitor</TableHead>
                  <TableHead className="font-semibold">Tickets</TableHead>
                  <TableHead className="font-semibold">Último Atendimento</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPessoas.map((pessoa) => (
                  <TableRow
                    key={pessoa.id}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <TableCell className="font-medium">
                      {pessoa.nome}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {pessoa.cpf}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{pessoa.telefone}</p>
                        {pessoa.email && (
                          <p className="text-xs text-muted-foreground">
                            {pessoa.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{pessoa.municipio}/{pessoa.uf}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {pessoa.tituloEleitor ? (
                        <Badge variant="secondary" className="text-xs">
                          Possui
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Não informado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{pessoa.totalTickets}</span>
                          <span className="text-xs text-muted-foreground">total</span>
                        </div>
                        {pessoa.ticketsAbertos > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {pessoa.ticketsAbertos} aberto{pessoa.ticketsAbertos > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {pessoa.dataUltimoAtendimento}
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
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Ticket
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

      {filteredPessoas.length === 0 && searchTerm && (
        <Card className="card-institutional">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma pessoa encontrada</h3>
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