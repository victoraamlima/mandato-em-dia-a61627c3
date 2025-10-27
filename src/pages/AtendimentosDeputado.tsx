import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Atendimento = Tables<"evento">;

function useAtendimentosDeputado({ tab, search, statusFilter }: { tab: string; search: string; statusFilter: string }) {
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

  return useQuery({
    queryKey: ["atendimentos-deputado", tab, search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("evento")
        .select("*")
        .eq("is_atendimento_deputado", true)
        .order("inicio", { ascending: tab !== "realizados" });

      // Filtros por aba
      if (tab === "hoje") {
        query = query.gte("inicio", todayStart).lte("inicio", todayEnd);
      } else if (tab === "semana") {
        query = query.gte("inicio", weekStart).lte("inicio", weekEnd);
      } else if (tab === "proximos") {
        query = query.eq("status", "Agendado").gt("inicio", todayEnd);
      } else if (tab === "realizados") {
        query = query.eq("status", "Realizado").lt("inicio", todayStart);
      }

      // Filtro de status
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      // Busca textual
      if (search) {
        query = query.or(`titulo.ilike.%${search}%,descricao.ilike.%${search}%,local.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Atendimento[];
    },
  });
}

function AtendimentoCard({ atendimento, onDetalhes }: { atendimento: Atendimento; onDetalhes: () => void }) {
  return (
    <Card className="mb-3 card-institutional hover-lift">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {format(new Date(atendimento.inicio), "HH:mm")}–{format(new Date(atendimento.fim), "HH:mm")}
          </span>
          <Badge
            className={
              atendimento.status === "Agendado"
                ? "status-aberto"
                : atendimento.status === "Realizado"
                ? "status-concluido"
                : "status-em-andamento"
            }
          >
            {atendimento.status}
          </Badge>
        </div>
        <div>
          <div className="font-bold text-lg">{atendimento.titulo}</div>
          <div className="text-sm text-muted-foreground">{atendimento.local}</div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={onDetalhes}>
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AtendimentosDeputado() {
  const [tab, setTab] = useState("hoje");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError } = useAtendimentosDeputado({ tab, search, statusFilter });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Atendimentos do Deputado</h1>
          <p className="text-muted-foreground">Agenda dedicada aos atendimentos do deputado</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover" onClick={() => navigate("/atendimentos-deputado/novo")}>
          <Plus className="w-4 h-4 mr-2" />
          Novo atendimento
        </Button>
      </div>

      {/* Busca e filtros */}
      <Card className="card-institutional">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por assunto, resumo ou local..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                className="border rounded px-2 py-1 text-sm h-10"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="Agendado">Agendado</option>
                <option value="Realizado">Realizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="semana">Semana</TabsTrigger>
          <TabsTrigger value="proximos">Próximos</TabsTrigger>
          <TabsTrigger value="realizados">Realizados</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Carregando...</div>
          ) : isError ? (
            <div className="text-center text-destructive py-8">Erro ao carregar atendimentos.</div>
          ) : !data || data.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Nenhum atendimento encontrado.</div>
          ) : (
            <div>
              {data.map(atendimento => (
                <AtendimentoCard
                  key={atendimento.evento_id}
                  atendimento={atendimento}
                  onDetalhes={() => navigate(`/atendimentos-deputado/${atendimento.evento_id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}