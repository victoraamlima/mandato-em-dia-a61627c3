import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, User, Clock, MessageSquare, Tag, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/components/auth/SessionContextProvider";
import { toast } from "@/hooks/use-toast";

const fetchTicket = async (id: string) => {
  const { data, error } = await supabase
    .from("ticket")
    .select(`
      *,
      pessoa:cidadao_id (*),
      cadastrado_por_usuario:usuario!ticket_cadastrado_por_fkey(usuario_id, nome),
      atendente:usuario!ticket_atendente_id_fkey(usuario_id, nome),
      colaborador:colaborador_id (*),
      comentarios:ticket_comentario (
        *,
        usuario:usuario_id (usuario_id, nome)
      )
    `)
    .eq("ticket_id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-foreground">{value || <span className="text-gray-400">Não informado</span>}</p>
  </div>
);

export default function TicketDetalhes() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id!),
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentText: string) => {
        if (!user || !id) throw new Error("Usuário ou Ticket não identificado.");
        const { error } = await supabase.from("ticket_comentario").insert({
            ticket_id: id,
            usuario_id: user.id,
            texto: commentText,
        });
        if (error) throw error;
    },
    onSuccess: () => {
        setNewComment("");
        queryClient.invalidateQueries({ queryKey: ["ticket", id] });
        toast({ title: "Comentário adicionado!" });
    },
    onError: (err: any) => {
        toast({ title: "Erro ao adicionar comentário", description: err.message, variant: "destructive" });
    }
  });

  if (isLoading) return <Skeleton className="h-screen w-full" />;
  if (isError || !ticket) return <div className="text-center text-destructive">Erro ao carregar ticket.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild><Link to="/tickets"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Link></Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{ticket.motivo_atendimento}</h1>
          <p className="text-muted-foreground">{ticket.descricao_curta}</p>
        </div>
        <Button asChild><Link to={`/tickets/${id}/editar`}><Edit className="w-4 h-4 mr-2" />Editar</Link></Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-institutional md:col-span-2">
          <CardHeader><CardTitle>Descrição do Atendimento</CardTitle></CardHeader>
          <CardContent>
            <InfoItem label="Descrição Completa" value={ticket.descricao} />
          </CardContent>
        </Card>

        <Card className="card-institutional row-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" />Cidadão</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Nome" value={<Link to={`/pessoas/${ticket.pessoa?.cidadao_id}`} className="font-bold hover:underline">{ticket.pessoa?.nome}</Link>} />
            <InfoItem label="CPF" value={ticket.pessoa?.cpf} />
            <InfoItem label="Telefone" value={ticket.pessoa?.tel1} />
          </CardContent>
        </Card>

        <Card className="card-institutional md:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="w-5 h-5 text-primary" />Status e Classificação</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoItem label="Status" value={<Badge className={ticket.status === 'Aberto' ? 'status-aberto' : ticket.status === 'Fechado' ? 'status-concluido' : 'status-em-andamento'}>{ticket.status}</Badge>} />
            <InfoItem label="Prioridade" value={<Badge variant={ticket.prioridade === 'Alta' ? 'destructive' : ticket.prioridade === 'Media' ? 'default' : 'secondary'}>{ticket.prioridade}</Badge>} />
            <InfoItem label="Categoria" value={ticket.categoria} />
            <InfoItem label="Subcategoria" value={ticket.subcategoria} />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-institutional md:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Responsáveis</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem label="Cadastrado por" value={ticket.cadastrado_por_usuario?.nome} />
            <InfoItem label="Atendente" value={ticket.atendente?.nome} />
            <InfoItem label="Colaborador Externo" value={ticket.colaborador?.nome} />
          </CardContent>
        </Card>

        <Card className="card-institutional">
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" />Datas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Data de Criação" value={new Date(ticket.created_at).toLocaleString('pt-BR')} />
            <InfoItem label="Prazo SLA" value={ticket.prazo_sla ? new Date(ticket.prazo_sla).toLocaleDateString('pt-BR') : null} />
            <InfoItem label="Data de Fechamento" value={ticket.data_fechamento ? new Date(ticket.data_fechamento).toLocaleString('pt-BR') : null} />
          </CardContent>
        </Card>
      </div>

      <Card className="card-institutional">
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />Comentários</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {ticket.comentarios.map((c: any) => (
                    <div key={c.comentario_id} className="flex gap-3">
                        <div className="font-semibold">{c.usuario.nome}</div>
                        <div className="flex-1 border-l-2 pl-3">
                            <p className="text-sm">{c.texto}</p>
                            <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pt-4 border-t">
                <Textarea placeholder="Adicionar um comentário..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                <Button className="mt-2" onClick={() => addCommentMutation.mutate(newComment)} disabled={!newComment.trim() || addCommentMutation.isPending}>
                    {addCommentMutation.isPending ? "Enviando..." : "Adicionar Comentário"}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}