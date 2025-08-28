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
  prioridade: z.string().default("Media"),
  status: z.string().default("Aberto"),
  descricao_curta: z.string().min(3, "Descrição curta obrigatória"),
  descricao: z.string().optional(),
  cidadao_id: z.string().uuid("ID do cidadão inválido"),
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

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      motivo_atendimento: "", categoria: "", prioridade: "Media", status: "Aberto",
      descricao_curta: "", descricao: "", cidadao_id: cidadao_id_param || undefined,
    },
  });

  useEffect(() => {
    if (existingTicket) form.reset(existingTicket);
  }, [existingTicket, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error("Usuário não autenticado.");
      if (isEditing) {
        const ticketUpdate: TablesUpdate<"ticket"> = data;
        const { error } = await supabase.from("ticket").update(ticketUpdate).eq("ticket_id", id);
        if (error) throw error;
      } else {
        const ticketInsert: TablesInsert<"ticket"> = { 
          ...data, 
          cadastrado_por: user.id 
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
              {form.formState.errors.descricao && <p className="text-sm text-destructive">{form.formState.errors.descricao.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input id="categoria" {...form.register("categoria")} />
                {form.formState.errors.categoria && <p className="text-sm text-destructive">{form.formState.errors.categoria.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Controller
                  control={form.control}
                  name="prioridade"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
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

            <Button type="submit" className="w-full" disabled={mutation.isPending || !user}>
              {mutation.isPending ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Atendimento")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}