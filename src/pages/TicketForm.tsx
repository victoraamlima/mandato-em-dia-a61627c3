import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
          motivo_atendimento: data.motivo_atendimento,
          categoria: data.categoria,
          prioridade: data.prioridade,
          status: data.status,
          descricao_curta: data.descricao_curta,
          descricao: data.descricao,
          cidadao_id: data.cidadao_id,
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

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader><CardTitle>{isEditing ? "Editar Atendimento" : "Novo Atendimento"}</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
            {/* Campos do formulário */}
            <Button type="submit" className="w-full" disabled={mutation.isPending || !user}>
              {mutation.isPending ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Atendimento")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}