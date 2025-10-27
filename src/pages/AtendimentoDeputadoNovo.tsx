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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  titulo: z.string().min(3, "Assunto é obrigatório"),
  inicio: z.string().min(1, "Data/hora de início é obrigatória"),
  fim: z.string().min(1, "Término é obrigatório"),
  local: z.string().min(1, "Local é obrigatório"),
  descricao: z.string().optional(),
}).refine(data => new Date(data.fim) > new Date(data.inicio), {
  message: "O término deve ser após o início.",
  path: ["fim"],
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
      const { error, data: evento } = await supabase
        .from("evento")
        .insert([
          {
            titulo: data.titulo,
            inicio: new Date(data.inicio).toISOString(),
            fim: new Date(data.fim).toISOString(),
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
    onSuccess: (data) => {
      toast({ title: "Atendimento criado com sucesso!" });
      navigate(`/atendimentos-deputado/${data.evento_id}`);
    },
    onError: (err: any) => {
      toast({ title: "Erro ao criar atendimento", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Novo Atendimento do Deputado</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data/hora de início</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Término</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="local"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumo (opcional)</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Criar atendimento"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}