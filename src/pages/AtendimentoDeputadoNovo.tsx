import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatISO } from "date-fns";

const schema = z.object({
  titulo: z.string().min(3, "Assunto obrigatório"),
  inicio: z.string().min(1, "Data/hora de início obrigatória"),
  fim: z.string().min(1, "Término obrigatório"),
  local: z.string().min(1, "Local obrigatório"),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AtendimentoDeputadoNovo() {
  const navigate = useNavigate();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: "",
      inicio: "",
      fim: "",
      local: "",
      descricao: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (new Date(data.fim) <= new Date(data.inicio)) {
        throw new Error("O término deve ser após o início.");
      }
      const { error, data: evento } = await supabase
        .from("evento")
        .insert([
          {
            titulo: data.titulo,
            inicio: formatISO(new Date(data.inicio)),
            fim: formatISO(new Date(data.fim)),
            local: data.local,
            descricao: data.descricao,
            is_atendimento_deputado: true,
            status: "Agendado",
          },
        ])
        .select("evento_id")
        .single();
      if (error) throw error;
      return evento;
    },
    onSuccess: (evento) => {
      toast({ title: "Atendimento criado com sucesso!" });
      navigate(`/atendimentos-deputado/${evento.evento_id}`);
    },
    onError: (err: any) => {
      toast({ title: "Erro ao criar atendimento", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Novo Atendimento do Deputado</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          >
            <Input label="Assunto" {...form.register("titulo")} error={form.formState.errors.titulo?.message} />
            <Input label="Data/hora de início" type="datetime-local" {...form.register("inicio")} error={form.formState.errors.inicio?.message} />
            <Input label="Término" type="datetime-local" {...form.register("fim")} error={form.formState.errors.fim?.message} />
            <Input label="Local" {...form.register("local")} error={form.formState.errors.local?.message} />
            <Input label="Resumo (opcional)" {...form.register("descricao")} error={form.formState.errors.descricao?.message} />
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Criar atendimento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}