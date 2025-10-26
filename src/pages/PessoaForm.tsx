import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useSession } from "@/components/auth/SessionContextProvider";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea"; // Importação adicionada
import { isValidCPF, normalizeCPF } from "@/lib/utils"; // Importar utilitários de CPF

const schema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().refine(val => normalizeCPF(val).length === 11 && isValidCPF(normalizeCPF(val)), "CPF inválido (11 dígitos)"), // Validação de CPF sem máscara
  dt_nasc: z.string().min(8, "Data de nascimento obrigatória"),
  sexo: z.string().min(1, "Sexo obrigatório"),
  tel1: z.string().min(8, "Telefone obrigatório"),
  tel2: z.string().optional(), // Adicionado tel2 ao schema
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  logradouro: z.string().min(1, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional(), // Adicionado complemento ao schema
  bairro: z.string().min(1, "Bairro obrigatório"),
  municipio: z.string().min(1, "Município obrigatório"),
  uf: z.string().min(2, "UF obrigatório"),
  cep: z.string().min(8, "CEP obrigatório"),
  consentimento_bool: z.boolean().default(false),
  titulo_eleitor: z.string().optional(),
  zona: z.string().optional(),
  secao: z.string().optional(),
  municipio_titulo: z.string().optional(),
  uf_titulo: z.string().optional(),
  observacoes: z.string().optional(), // Adicionado observacoes ao schema
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
      nome: "", cpf: "", dt_nasc: "", sexo: "", tel1: "", tel2: "", email: "",
      logradouro: "", numero: "", complemento: "", bairro: "", municipio: "", uf: "", cep: "",
      consentimento_bool: false,
      titulo_eleitor: "", zona: "", secao: "", municipio_titulo: "", uf_titulo: "", observacoes: "",
    },
  });

  useEffect(() => {
    if (existingPessoa) {
      form.reset({
        ...existingPessoa,
        email: existingPessoa.email || "",
        tel2: existingPessoa.tel2 || "",
        complemento: existingPessoa.complemento || "",
        observacoes: existingPessoa.observacoes || "",
        dt_nasc: existingPessoa.dt_nasc ? existingPessoa.dt_nasc.split('T')[0] : "",
        titulo_eleitor: existingPessoa.titulo_eleitor || "",
        zona: existingPessoa.zona || "",
        secao: existingPessoa.secao || "",
        municipio_titulo: existingPessoa.municipio_titulo || "",
        uf_titulo: existingPessoa.uf_titulo || "",
      });
    }
  }, [existingPessoa, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error("Usuário não autenticado.");

      const payload = {
        nome: data.nome,
        cpf: normalizeCPF(data.cpf), // Normaliza o CPF antes de salvar
        dt_nasc: data.dt_nasc,
        sexo: data.sexo,
        tel1: normalizeCPF(data.tel1), // Normaliza o telefone
        tel2: data.tel2 ? normalizeCPF(data.tel2) : null, // Normaliza o telefone
        email: data.email || null,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento || null,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        cep: data.cep,
        consentimento_bool: data.consentimento_bool,
        titulo_eleitor: data.titulo_eleitor || null,
        zona: data.zona || null,
        secao: data.secao || null,
        municipio_titulo: data.municipio_titulo || null,
        uf_titulo: data.uf_titulo || null,
        observacoes: data.observacoes || null,
      };

      if (isEditing) {
        const pessoaUpdate: TablesUpdate<"pessoa"> = { ...payload, atualizado_por: user.id };
        const { error } = await supabase.from("pessoa").update(pessoaUpdate).eq("cidadao_id", id);
        if (error) throw error;
      } else {
        const pessoaInsert: TablesInsert<"pessoa"> = {
            ...payload,
            data_consentimento: new Date().toISOString().slice(0, 10),
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
      return <div className="max-w-2xl mx-auto"><Skeleton className="h-96 w-full" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Pessoa" : "Cadastrar Nova Pessoa"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          >
            <fieldset className="space-y-4">
              <legend className="text-lg font-medium text-foreground mb-2 border-b pb-2">Dados Pessoais</legend>
              <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" {...form.register("nome")} />
                  {form.formState.errors.nome && <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="cpf">CPF (apenas números)</Label>
                      <Input id="cpf" {...form.register("cpf")} type="tel" maxLength={11} />
                      {form.formState.errors.cpf && <p className="text-sm text-destructive">{form.formState.errors.cpf.message}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="dt_nasc">Data de Nascimento</Label>
                      <Input id="dt_nasc" type="date" {...form.register("dt_nasc")} />
                      {form.formState.errors.dt_nasc && <p className="text-sm text-destructive">{form.formState.errors.dt_nasc.message}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="sexo">Sexo</Label>
                      <Input id="sexo" {...form.register("sexo")} />
                      {form.formState.errors.sexo && <p className="text-sm text-destructive">{form.formState.errors.sexo.message}</p>}
                  </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-medium text-foreground mb-2 border-b pb-2">Contato</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tel1">Telefone Principal (apenas números)</Label>
                    <Input id="tel1" {...form.register("tel1")} type="tel" />
                    {form.formState.errors.tel1 && <p className="text-sm text-destructive">{form.formState.errors.tel1.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tel2">Telefone Secundário (Opcional, apenas números)</Label>
                    <Input id="tel2" {...form.register("tel2")} type="tel" />
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input id="email" type="email" {...form.register("email")} />
                  {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-medium text-foreground mb-2 border-b pb-2">Endereço</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input id="logradouro" {...form.register("logradouro")} />
                    {form.formState.errors.logradouro && <p className="text-sm text-destructive">{form.formState.errors.logradouro.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input id="numero" {...form.register("numero")} />
                    {form.formState.errors.numero && <p className="text-sm text-destructive">{form.formState.errors.numero.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento (Opcional)</Label>
                  <Input id="complemento" {...form.register("complemento")} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" {...form.register("bairro")} />
                    {form.formState.errors.bairro && <p className="text-sm text-destructive">{form.formState.errors.bairro.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" {...form.register("cep")} />
                    {form.formState.errors.cep && <p className="text-sm text-destructive">{form.formState.errors.cep.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="municipio">Município</Label>
                    <Input id="municipio" {...form.register("municipio")} />
                    {form.formState.errors.municipio && <p className="text-sm text-destructive">{form.formState.errors.municipio.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input id="uf" {...form.register("uf")} />
                    {form.formState.errors.uf && <p className="text-sm text-destructive">{form.formState.errors.uf.message}</p>}
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-medium text-foreground mb-2 border-b pb-2">Dados Eleitorais (Opcional)</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="titulo_eleitor">Título de Eleitor</Label>
                    <Input id="titulo_eleitor" {...form.register("titulo_eleitor")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zona">Zona</Label>
                    <Input id="zona" {...form.register("zona")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="secao">Seção</Label>
                    <Input id="secao" {...form.register("secao")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="municipio_titulo">Município do Título</Label>
                    <Input id="municipio_titulo" {...form.register("municipio_titulo")} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="uf_titulo">UF do Título</Label>
                    <Input id="uf_titulo" {...form.register("uf_titulo")} />
                </div>
              </div>
            </fieldset>
            
            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (Opcional)</Label>
                <Textarea id="observacoes" {...form.register("observacoes")} />
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Checkbox id="consentimento_bool" onCheckedChange={(checked) => form.setValue('consentimento_bool', !!checked)} checked={form.watch('consentimento_bool')} />
              <Label htmlFor="consentimento_bool" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                A pessoa deu consentimento para o uso de seus dados (LGPD).
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending || !user}>
              {mutation.isPending ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Cadastrar Pessoa")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}