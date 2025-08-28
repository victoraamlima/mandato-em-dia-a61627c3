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
  Users,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 10;

function maskCpf(cpf: string) {
  if (!cpf) return "";
  // Exibe apenas os 3 primeiros e 2 últimos dígitos
  return cpf.replace(/^(\d{3})\d{6}(\d{2})$/, "$1.***.***-$2");
}

function maskPhone(phone: string) {
  if (!phone) return "";
  // Exibe apenas os 4 últimos dígitos
  return phone.replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, function (_, ddd, prefix, suffix) {
    if (!suffix) return `(${ddd}) ${prefix}`;
    return `(${ddd}) *****-${suffix}`;
  });
}

type PessoaListItem = {
  cidadao_id: string;
  nome: string;
  cpf: string;
  tel1: string;
  email: string | null;
  municipio: string;
  uf: string;
  titulo_eleitor: string | null;
  created_at: string;
};

type PessoasQueryResult = {
  pessoas: PessoaListItem[];
  total: number;
};

export default function Pessoas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [municipioFilter, setMunicipioFilter] = useState("");
  const [ufFilter, setUfFilter] = useState("");
  const [page, setPage] = useState(1);

  // Busca de municípios e UFs distintos para filtros
  const { data: municipios } = useQuery({
    queryKey: ["municipios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoa")
        .select("municipio, uf", { count: "exact", head: false })
        .order("municipio", { ascending: true });
      if (error) throw error;
      const unique = Array.from(
        new Set((data ?? []).map((p) => `${p.municipio}|${p.uf}`))
      ).map((str) => {
        const [municipio, uf] = str.split("|");
        return { municipio, uf };
      });
      return unique;
    },
  });

  // Busca paginada de pessoas
  const { data, isLoading, isError, refetch } = useQuery<PessoasQueryResult>({
    queryKey: ["pessoas", searchTerm, municipioFilter, ufFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("pessoa")
        .select(
          "cidadao_id, nome, cpf, tel1, email, municipio, uf, titulo_eleitor, created_at",
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      // Filtros
      if (searchTerm) {
        const normalized = searchTerm.replace(/\D/g, "");
        query = query.or(
          [
            `nome.ilike.%${searchTerm}%`,
            normalized.length === 11 ? `cpf.eq.${normalized}` : "",
            `municipio.ilike.%${searchTerm}%`,
          ]
            .filter(Boolean)
            .join(",")
        );
      }
      if (municipioFilter) {
        query = query.eq("municipio", municipioFilter);
      }
      if (ufFilter) {
        query = query.eq("uf", ufFilter);
      }

      // Paginação
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return { pessoas: data ?? [], total: count ?? 0 };
    },
  });

  const filteredPessoas = data?.pessoas ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

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
        <Button className="bg-primary hover:bg-primary-hover" asChild>
          <a href="/pessoas/nova">
            <Plus className="w-4 h-4 mr-2" />
            Nova Pessoa
          </a>
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
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total de Pessoas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Os outros cards podem ser implementados com queries extras se necessário */}
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
                value={municipioFilter}
                onChange={(e) => {
                  setMunicipioFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Município</option>
                {municipios?.map((m) => (
                  <option key={m.municipio} value={m.municipio}>
                    {m.municipio}
                  </option>
                ))}
              </select>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={ufFilter}
                onChange={(e) => {
                  setUfFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">UF</option>
                {Array.from(new Set(municipios?.map((m) => m.uf))).map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
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
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">CPF</TableHead>
                  <TableHead className="font-semibold">Contato</TableHead>
                  <TableHead className="font-semibold">Localização</TableHead>
                  <TableHead className="font-semibold">Título Eleitor</TableHead>
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
                ) : filteredPessoas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhuma pessoa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPessoas.map((pessoa) => (
                    <TableRow
                      key={pessoa.cidadao_id}
                      className="hover:bg-surface-hover transition-colors"
                    >
                      <TableCell className="font-medium">
                        {pessoa.nome}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {maskCpf(pessoa.cpf)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{maskPhone(pessoa.tel1)}</p>
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
                        {pessoa.titulo_eleitor ? (
                          <Badge variant="secondary" className="text-xs">
                            Possui
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Não informado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(pessoa.created_at).toLocaleDateString("pt-BR")}
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
                              <a href={`/pessoas/${pessoa.cidadao_id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/pessoas/${pessoa.cidadao_id}/editar`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/tickets/novo?cidadao_id=${pessoa.cidadao_id}`}>
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