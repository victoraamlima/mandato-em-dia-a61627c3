import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Edit, User, Clock, MapPin, Info, UserPlus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CidadaoSearchInput } from "@/components/forms/CidadaoSearchInput";

const fetchEvento = async (id: string) => {
  const { data, error } = await supabase.from("evento").select("*").eq("evento_id", id).single();
  if (error) throw new Error(error.message);
  return data;
};

const fetchParticipantes = async (id: string) => {
  const { data, error } = await supabase
    .from("evento_participante")
    .select("pessoa:cidadao_id(cidadao_id, nome, municipio, uf)")
    .eq("evento_id", id);
  if (error) throw error;
  return data;
};

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-foreground">{value || <span className="text-gray-400">Não informado</span>}</p>
  </div>
);

export default function AtendimentoDeputadoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedCidadao, setSelectedCidadao] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: evento, isLoading, isError } = useQuery({
    queryKey: ["evento", id],
    queryFn: () => fetchEvento(id!),
    enabled: !!id,
  });

  const { data: participantes, isLoading: isLoadingParticipantes } = useQuery({
    queryKey: ["evento-participantes", id],
    queryFn: () => fetchParticipantes(id!),
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: async (cidadaoId: string) => {
      const { error } = await supabase.from("evento_participante").insert({ evento_id: id!, cidadao_id: cidadaoId });
      if (error) {
        if (error.code === '23505') throw new Error("Esta pessoa já está na lista de participantes.");
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "Participante adicionado!" });
      queryClient.invalidateQueries({ queryKey: ["evento-participantes", id] });
      setSelectedCidadao(null);
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const removeMutation = useMutation({
    mutationFn: async (cidadaoId: string) => {
      const { error } = await supabase.from("evento_participante").delete().match({ evento_id: id!, cidadao_id: cidadaoId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Participante removido." });
      queryClient.invalidateQueries({ queryKey: ["evento-participantes", id] });
    },
    onError: (err: any) => toast({ title: "Erro ao remover", description: err.message, variant: "destructive" }),
  });

  if (isLoading) return <Skeleton className="h-screen w-full" />;
  if (isError || !evento) return <div className="text-center text-destructive">Erro ao carregar atendimento.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild><Link to="/atendimentos-deputado"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Link></Button>
        <h1 className="text-3xl font-bold text-foreground">{evento.titulo}</h1>
        <Button asChild><Link to={`/atendimentos-deputado/${id}/editar`}><Edit className="w-4 h-4 mr-2" />Editar</Link></Button>
      </div>

      <Card className="card-institutional">
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-primary" />Detalhes do Atendimento</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoItem label="Status" value={<Badge className={evento.status === 'Agendado' ? 'status-aberto' : 'status-concluido'}>{evento.status}</Badge>} />
          <InfoItem label="Início" value={format(new Date(evento.inicio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} />
          <InfoItem label="Término" value={format(new Date(evento.fim), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} />
          <InfoItem label="Local" value={evento.local} />
          <div className="md:col-span-3">
            <InfoItem label="Descrição" value={evento.descricao} />
          </div>
        </CardContent>
      </Card>

      <Card className="card-institutional">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" />Participantes</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><UserPlus className="w-4 h-4 mr-2" />Adicionar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Participante</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <CidadaoSearchInput value={selectedCidadao} onChange={setSelectedCidadao} />
                <Button onClick={() => selectedCidadao && addMutation.mutate(selectedCidadao)} disabled={!selectedCidadao || addMutation.isPending} className="w-full">
                  {addMutation.isPending ? "Adicionando..." : "Confirmar Adição"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoadingParticipantes ? <p>Carregando...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Localidade</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantes?.map(p => (
                  <TableRow key={p.pessoa.cidadao_id}>
                    <TableCell className="font-medium">{p.pessoa.nome}</TableCell>
                    <TableCell>{p.pessoa.municipio}/{p.pessoa.uf}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeMutation.mutate(p.pessoa.cidadao_id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}