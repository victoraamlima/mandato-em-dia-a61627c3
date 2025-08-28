import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useSession } from "@/components/auth/SessionContextProvider";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().min(11, "CPF obrigatório"),
  dt_nasc: z.string().min(8, "Data de nascimento obrigatória"),
  sexo: z.string().min(1, "Sexo obrigatório"),
  tel1: z.string().min(8, "Telefone obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  logradouro: z.string().min(1, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  bairro: z.string().min(1, "Bairro obrigatório"),
  municipio: z.string().min(1, "Município obrigatório"),
  uf: z.string().min(2, "UF obrigatório"),
  cep: z.string().min(8, "CEP obrigatório"),
  consentimento_bool: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

const fetchPessoa = async (id: string): Promise<Tables<'pessoa'>> => {
  const { data, error } = await supabase
    .from("pessoa")
    .select("*")
    .eq("cidadao_id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export default function PessoaForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: existingPessoa, isLoading } = useQuery({
    queryKey: ["pessoa", id],
    queryFn: () => fetchPessoa(id!),
    enabled: isEditing,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "", cpf: "", dt_nasc: "", sexo: "", tel1: "", email: "",
      logradouro: "", numero: "", bairro: "", municipio: "", uf: "", cep: "",
      consentimento_bool: false,
    },
  });

  useEffect(() => {
    if (existingPessoa) {
      form.reset({
        ...existingPessoa,
        email: existingPessoa.email || "",
        dt_nasc: existingPessoa.dt_nasc ? existingPessoa.dt_nasc.split('T')[0] : "",
      });
    }
  }, [existingPessoa, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error("Usuário não autenticado.");

      if (isEditing) {
        const pessoaUpdate: TablesUpdate<"pessoa"> = { ...data, atualizado_por: user.id };
        const { error } = await supabase.from("pessoa").update(pessoaUpdate).eq("cidadao_id", id);
        if (error) throw error;
      } else {
        const pessoaInsert: TablesInsert<"pessoa"> = {
            nome: data.nome,
            cpf: data.cpf,
            dt_nasc: data.dt_nasc,
            sexo: data.sexo,
            tel1: data.tel1,
            email: data.email || null,
            logradouro: data.logradouro,
            numero: data.numero,
            bairro: data.bairro,
            municipio: data.municipio,
            uf: data.uf,
            cep: data.cep,
            consentimento_bool: data.consentimento_bool,
            data_consentimento: data.consentimento_bool ? new Date().toISOString().slice(0, 10) : undefined,
            origem: "gabinete",
            criado_por: user.id,
        };
        const { error } = await supabase.from("pessoa").insert([pessoaInsert]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Pessoa ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso!` });
      queryClient.invalidateQueries({ queryKey: ["pessoas"] });
      queryClient.invalidateQueries({ queryKey: ["pessoa", id] });
      navigate(isEditing ? `/pessoas/${id}` : "/pessoas");
    },
    onError: (err: any) => {
      toast({ title: "Erro ao salvar dados", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading && isEditing) {
      return <div className="max-w-xl mx-auto"><Skeleton className="h-96 w-full" /></div>
  }

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Pessoa" : "Cadastrar Nova Pessoa"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          >
            <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" {...form.register("nome")} />
                {form.formState.errors.nome && <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" {...form.register("cpf")} />
                    {form.formState.errors.cpf && <p className="text-sm text-destructive">{form.formState.errors.cpf.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dt_nasc">Data de Nascimento</Label>
                    <Input id="dt_nasc" type="date" {...form.register("dt_nasc")} />
                    {form.formState.errors.dt_nasc && <p className="text-sm text-destructive">{form.formState.errors.dt_nasc.message}</p>}
                </div>
            </div>
            {/* Adicione os outros campos seguindo o mesmo padrão */}
            <Button type="submit" className="w-full" disabled={mutation.isPending || !user}>
              {mutation.isPending ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}