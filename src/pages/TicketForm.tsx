import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/integrations/supabase/types";
import { useSession } from "@/components/auth/SessionContextProvider";

const schema = z.object({
  motivo_atendimento: z.string().min(3, "Motivo obrigatório"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  prioridade: z.string().min(1, "Prioridade obrigatória"),
  descricao_curta: z.string().min(3, "Descrição curta obrigatória"),
  cidadao_id: z.string().min(1, "Cidadão obrigatório"),
});

type FormData = z.infer<typeof schema>;

export default function TicketForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const cidadao_id = searchParams.get("cidadao_id") || "";

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      motivo_atendimento: "",
      categoria: "",
      prioridade: "",
      descricao_curta: "",
      cidadao_id,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error("Usuário não autenticado.");

      const ticket: TablesInsert<"ticket"> = {
        motivo_atendimento: data.motivo_atendimento,
        categoria: data.categoria,
        prioridade: data.prioridade,
        descricao_curta: data.descricao_curta,
        cidadao_id: data.cidadao_id,
        cadastrado_por: user.id,
        origem: "gabinete",
      };
      const { error } = await supabase.from("ticket").insert([ticket]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Ticket cadastrado com sucesso!" });
      navigate("/tickets");
    },
    onError: (err: any) => {
      toast({ title: "Erro ao cadastrar ticket", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Cadastrar Novo Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          >
            <Input label="Motivo do Atendimento" {...form.register("motivo_atendimento")} error={form.formState.errors.motivo_atendimento?.message} />
            <Input label="Categoria" {...form.register("categoria")} error={form.formState.errors.categoria?.message} />
            <Input label="Prioridade" {...form.register("prioridade")} error={form.formState.errors.prioridade?.message} />
            <Input label="Descrição Curta" {...form.register("descricao_curta")} error={form.formState.errors.descricao_curta?.message} />
            <Input label="ID do Cidadão" {...form.register("cidadao_id")} error={form.formState.errors.cidadao_id?.message} />
            <Button type="submit" className="w-full" disabled={mutation.isPending || !user}>
              {mutation.isPending ? "Salvando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}