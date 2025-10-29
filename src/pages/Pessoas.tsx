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
  Users,
  MapPin,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { maskPhone, normalizeCPF } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResponsiveTable, type Column } from "@/components/ui/responsive-table";

const PAGE_SIZE = 10;

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

      if (searchTerm) {
        const normalized = normalizeCPF(searchTerm);
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
      if (municipioFilter) query = query.eq("municipio", municipioFilter);
      if (ufFilter) query = query.eq("uf", ufFilter);

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

  const columns: Column<PessoaListItem>[] = [
    { header: "Nome", accessor: "nome", className: "font-medium" },
    { header: "CPF", accessor: "cpf", className: "font-mono text-sm" },
    {
      header: "Contato",
      accessor: (item: PessoaListItem) => (
        <div className="space-y-1">
          <p className="text-sm">{maskPhone(item.tel1)}</p>
          {item.email && <p className="text-xs text-muted-foreground">{item.email}</p>}
        </div>
      ),
    },
    {
      header: "Localização",
      accessor: (item: PessoaListItem) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{item.municipio}/{item.uf}</span>
        </div>
      ),
    },
    {
      header: "Título Eleitor",
      accessor: (item: PessoaListItem) =>
        item.titulo_eleitor ? (
          <Badge variant="secondary" className="text-xs">Possui</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">Não informado</Badge>
        ),
    },
    {
      header: "Criado em",
      accessor: (item: PessoaListItem) => new Date(item.created_at).toLocaleDateString("pt-BR"),
      className: "text-sm text-muted-foreground",
    },
    {
      header: "",
      className: "w-[50px]",
      accessor: (item: PessoaListItem) => <ActionsDropdown item={item} />,
    },
  ];

  const ActionsDropdown = ({ item }: { item: PessoaListItem }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild><a href={`/pessoas/${item.cidadao_id}`}><Eye className="w-4 h-4 mr-2" />Visualizar</a></DropdownMenuItem>
        <DropdownMenuItem asChild><a href={`/pessoas/${item.cidadao_id}/editar`}><Edit className="w-4 h-4 mr-2" />Editar</a></DropdownMenuItem>
        <DropdownMenuItem asChild><a href={`/tickets/novo?cidadao_id=${item.cidadao_id}`}><Plus className="w-4 h-4 mr-2" />Novo Ticket</a></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderMobileCard = (item: PessoaListItem) => (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <a href={`/pessoas/${item.cidadao_id}`} className="font-bold hover:underline">{item.nome}</a>
        <ActionsDropdown item={item} />
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>CPF: {item.cpf}</p>
        <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.municipio}/{item.uf}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pessoas"
        description="Gerencie o cadastro de cidadãos atendidos"
        action={{ label: "Nova Pessoa", href: "/pessoas/nova" }}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{total}</p><p className="text-sm text-muted-foreground">Total de Pessoas</p></div>
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
              <Input placeholder="Buscar por nome, CPF ou município..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select className="border rounded px-2 py-1 text-sm h-10" value={municipioFilter} onChange={(e) => { setMunicipioFilter(e.target.value); setPage(1); }}>
                <option value="">Município</option>
                {municipios?.map((m) => (<option key={m.municipio} value={m.municipio}>{m.municipio}</option>))}
              </select>
              <select className="border rounded px-2 py-1 text-sm h-10" value={ufFilter} onChange={(e) => { setUfFilter(e.target.value); setPage(1); }}>
                <option value="">UF</option>
                {Array.from(new Set(municipios?.map((m) => m.uf))).map((uf) => (<option key={uf} value={uf}>{uf}</option>))}
              </select>
              <Button variant="outline" size="sm" onClick={() => refetch()}><Filter className="w-4 h-4 mr-2" />Filtros</Button>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResponsiveTable
        columns={columns}
        data={filteredPessoas}
        isLoading={isLoading}
        isError={isError}
        renderMobileCard={renderMobileCard}
        noResultsMessage="Nenhuma pessoa encontrada."
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