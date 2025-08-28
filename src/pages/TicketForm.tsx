import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useSession } from "@/components/auth/SessionContextProvider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  motivo_atendimento: z.string().min(3, "Motivo obrigatório"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  subcategoria: z.string().optional().nullable(),
  prioridade: z.string().default("Media"),
  status: z.string().default("Aberto"),
  descricao_curta: z.string().min(3, "Descrição curta obrigatória"),
  descricao: z.string().optional().nullable(),
  cidadao_id: z.string().uuid("ID do cidadão inválido"),
  atendente_id: z.string().uuid().optional().nullable(),
  colaborador_id: z.string().uuid().optional().nullable(),
  prazo_sla: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

const fetchTicket = async (id: string): Promise<Tables<'ticket'>> => {
  const { data, error } = await supabase.from("ticket").select("*").eq("ticket_id", id).single();
  if (error) throw new Error(error.message);
  return data;
};

export default function TicketForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const cidadao_id_param = searchParams.get("cidadao_id");

  const { data: existingTicket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id!),
    enabled: isEditing,
  });

  const { data: usuarios } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("usuario").select("usuario_id, nome").order("nome");
      if (error) throw error;
      return data;
    }
  });

  const { data: colaboradores } = useQuery({
    queryKey: ["colaboradores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("colaborador").select("colaborador_id, nome").order("nome");
      if (error) throw error;
      return data;
    }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      motivo_atendimento: "", categoria: "", prioridade: "Media", status: "Aberto",
      descricao_curta: "", descricao: "", cidadao_id: cidadao_id_param || undefined,
      subcategoria: null, atendente_id: null, colaborador_id: null, prazo_sla: null,
    },
  });

  useEffect(() => {
    if (existingTicket) {
      form.reset({
        ...existingTicket,
        prazo_sla: existingTicket.prazo_sla ? existingTicket.prazo_sla.split('T')[0] : null,
      });
    }
  }, [existingTicket, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error("Usuário não autenticado.");

      if (isEditing) {
        const ticketUpdate: TablesUpdate<"ticket"> = {
          ...data,
          atendente_id: data.atendente_id || null,
          colaborador_id: data.colaborador_id || null,
          prazo_sla: data.prazo_sla || null,
        };
        const { error } = await supabase.from("ticket").update(ticketUpdate).eq("ticket_id", id);
        if (error) throw error;
      } else {
        const ticketInsert: TablesInsert<"ticket"> = {
          motivo_atendimento: data.motivo_atendimento,
          categoria: data.categoria,
          subcategoria: data.subcategoria,
          prioridade: data.prioridade,
          status: data.status,
          descricao_curta: data.descricao_curta,
          descricao: data.descricao,
          cidadao_id: data.cidadao_id,
          atendente_id: data.atendente_id || null,
          colaborador_id: data.colaborador_id || null,
          prazo_sla: data.prazo_sla || null,
          cadastrado_por: user.id,
        };
        const { error } = await supabase.from("ticket").insert([ticketInsert]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Atendimento ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!` });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      navigate(isEditing ? `/tickets/${id}` : "/tickets");
    },
    onError: (err: any) => {
      toast({ title: "Erro ao salvar atendimento", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading && isEditing) {
    return <div className="max-w-2xl mx-auto"><Skeleton className="h-96 w-full" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader><CardTitle>{isEditing ? "Editar Atendimento" : "Novo Atendimento"}</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
            <div className="space-y-2">
              <Label htmlFor="cidadao_id">Cidadão (ID)</Label>
              <Input id="cidadao_id" {...form.register("cidadao_id")} disabled />
              {form.formState.errors.cidadao_id && <p className="text-sm text-destructive">{form.formState.errors.cidadao_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo_atendimento">Motivo do Atendimento</Label>
              <Input id="motivo_atendimento" {...form.register("motivo_atendimento")} />
              {form.formState.errors.motivo_atendimento && <p className="text-sm text-destructive">{form.formState.errors.motivo_atendimento.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao_curta">Descrição Curta</Label>
              <Input id="descricao_curta" {...form.register("descricao_curta")} />
              {form.formState.errors.descricao_curta && <p className="text-sm text-destructive">{form.formState.errors.descricao_curta.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição Completa (Opcional)</Label>
              <Textarea id="descricao" {...form.register("descricao")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input id="categoria" {...form.register("categoria")} />
                {form.formState.errors.categoria && <p className="text-sm text-destructive">{form.formState.errors.categoria.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategoria">Subcategoria (Opcional)</Label>
                <Input id="subcategoria" {...form.register("subcategoria")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Controller
                  control={form.control}
                  name="prioridade"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                        <SelectItem value="Media">Média</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aberto">Aberto</SelectItem>
                        <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                        <SelectItem value="Fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Atendente Responsável (Opcional)</Label>
                <Controller
                  control={form.control}
                  name="atendente_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {usuarios?.map(u => <SelectItem key={u.usuario_id} value={u.usuario_id}>{u.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Colaborador Externo (Opcional)</Label>
                <Controller
                  control={form.control}
                  name="colaborador_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {colaboradores?.map(c => <SelectItem key={c.colaborador_id} value={c.colaborador_id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazo_sla">Prazo SLA (Opcional)</Label>
              <Input id="prazo_sla" type="date" {...form.register("prazo_sla")} />
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending || !user}>
              {mutation.isPending ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Atendimento")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}