import { useEffect, useState } from "react";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { isValidCPF, normalizeCPF } from "@/lib/utils";
import type { TablesInsert } from "@/integrations/supabase/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import InputMask from "react-input-mask";
import { Progress } from "@/components/ui/progress";

const schema = z.object({
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  nome: z.string().min(3, "Nome completo é obrigatório"),
  dt_nasc: z.string().min(10, "Data de nascimento é obrigatória"),
  sexo: z.string().min(1, "Sexo é obrigatório"),
  tel1: z.string().min(10, "Telefone principal é obrigatório"),
  tel2: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cep: z.string().min(8, "CEP é obrigatório"),
  logradouro: z.string().min(3, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(3, "Bairro é obrigatório"),
  municipio: z.string().min(3, "Município é obrigatório"),
  uf: z.string().length(2, "UF deve ter 2 letras"),
  titulo_eleitor: z.string().optional(),
  zona: z.string().optional(),
  secao: z.string().optional(),
  municipio_titulo: z.string().optional(),
  uf_titulo: z.string().optional(),
  observacoes: z.string().optional(),
  consentimento_bool: z.boolean().refine(val => val === true, { message: "O consentimento é obrigatório" }),
  finalidade: z.string().min(3, "A finalidade é obrigatória"),
});

type FormData = z.infer<typeof schema>;
type StepProps = { form: UseFormReturn<FormData> };

const TOTAL_STEPS = 5;

const Step1 = ({ form }: StepProps) => (
  <fieldset className="space-y-4">
    <legend className="text-lg font-medium text-foreground mb-2">Dados Pessoais</legend>
    <div className="space-y-2">
      <Label htmlFor="cpf">CPF</Label>
      <Input id="cpf" {...form.register("cpf")} disabled />
      {form.formState.errors.cpf && <p className="text-sm text-destructive">{form.formState.errors.cpf.message}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="nome">Nome Completo</Label>
      <Input id="nome" {...form.register("nome")} />
      {form.formState.errors.nome && <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="dt_nasc">Data de Nascimento</Label>
        <Controller
          name="dt_nasc"
          control={form.control}
          render={({ field }) => (
            <InputMask mask="99/99/9999" value={field.value} onChange={field.onChange}>
              {(inputProps: any) => <Input {...inputProps} id="dt_nasc" placeholder="DD/MM/AAAA" />}
            </InputMask>
          )}
        />
        {form.formState.errors.dt_nasc && <p className="text-sm text-destructive">{form.formState.errors.dt_nasc.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sexo">Sexo</Label>
        <Input id="sexo" {...form.register("sexo")} />
        {form.formState.errors.sexo && <p className="text-sm text-destructive">{form.formState.errors.sexo.message}</p>}
      </div>
    </div>
  </fieldset>
);

const Step2 = ({ form }: StepProps) => (
  <fieldset className="space-y-4">
    <legend className="text-lg font-medium text-foreground mb-2">Contato</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="tel1">Telefone Principal</Label>
        <Controller
          name="tel1"
          control={form.control}
          render={({ field }) => (
            <InputMask mask="(99) 99999-9999" value={field.value} onChange={field.onChange}>
              {(inputProps: any) => <Input {...inputProps} id="tel1" placeholder="(99) 99999-9999" />}
            </InputMask>
          )}
        />
        {form.formState.errors.tel1 && <p className="text-sm text-destructive">{form.formState.errors.tel1.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="tel2">Telefone Secundário (Opcional)</Label>
        <Controller
          name="tel2"
          control={form.control}
          render={({ field }) => (
            <InputMask mask="(99) 99999-9999" value={field.value || ''} onChange={field.onChange}>
              {(inputProps: any) => <Input {...inputProps} id="tel2" placeholder="(99) 99999-9999" />}
            </InputMask>
          )}
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">E-mail (Opcional)</Label>
      <Input id="email" type="email" {...form.register("email")} />
      {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
    </div>
  </fieldset>
);

const Step3 = ({ form }: StepProps) => (
  <fieldset className="space-y-4">
    <legend className="text-lg font-medium text-foreground mb-2">Endereço</legend>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="cep">CEP</Label>
        <Controller
          name="cep"
          control={form.control}
          render={({ field }) => (
            <InputMask mask="99999-999" value={field.value} onChange={field.onChange}>
              {(inputProps: any) => <Input {...inputProps} id="cep" placeholder="00000-000" />}
            </InputMask>
          )}
        />
        {form.formState.errors.cep && <p className="text-sm text-destructive">{form.formState.errors.cep.message}</p>}
      </div>
    </div>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="bairro">Bairro</Label>
        <Input id="bairro" {...form.register("bairro")} />
        {form.formState.errors.bairro && <p className="text-sm text-destructive">{form.formState.errors.bairro.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="municipio">Município</Label>
        <Input id="municipio" {...form.register("municipio")} />
        {form.formState.errors.municipio && <p className="text-sm text-destructive">{form.formState.errors.municipio.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="uf">UF</Label>
        <Input id="uf" {...form.register("uf")} maxLength={2} />
        {form.formState.errors.uf && <p className="text-sm text-destructive">{form.formState.errors.uf.message}</p>}
      </div>
    </div>
  </fieldset>
);

const Step4 = ({ form }: StepProps) => (
  <fieldset className="space-y-4">
    <legend className="text-lg font-medium text-foreground mb-2">Dados Eleitorais (Opcional)</legend>
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
        <Input id="uf_titulo" {...form.register("uf_titulo")} maxLength={2} />
      </div>
    </div>
  </fieldset>
);

const Step5 = ({ form }: StepProps) => (
  <fieldset className="space-y-4">
    <legend className="text-lg font-medium text-foreground mb-2">Finalização</legend>
    <div className="space-y-2">
      <Label htmlFor="observacoes">Observações (Opcional)</Label>
      <Input id="observacoes" {...form.register("observacoes")} />
    </div>
    <div className="space-y-2">
      <Label htmlFor="finalidade">Finalidade do Cadastro</Label>
      <Input id="finalidade" {...form.register("finalidade")} />
      {form.formState.errors.finalidade && <p className="text-sm text-destructive">{form.formState.errors.finalidade.message}</p>}
    </div>
    <div className="flex items-start space-x-2 pt-4">
      <Controller
        name="consentimento_bool"
        control={form.control}
        render={({ field }) => (
          <Checkbox
            id="consentimento_bool"
            checked={field.value}
            onCheckedChange={field.onChange}
            className="mt-1"
          />
        )}
      />
      <Label htmlFor="consentimento_bool" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        A pessoa deu consentimento para o uso de seus dados (LGPD).
      </Label>
    </div>
    {form.formState.errors.consentimento_bool && <p className="text-sm text-destructive">{form.formState.errors.consentimento_bool.message}</p>}
  </fieldset>
);

export default function CampoCadastro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cpfParam = searchParams.get("cpf") || "";
  const { user: colaborador } = useUser();
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      cpf: cpfParam,
      nome: "", dt_nasc: "", sexo: "", tel1: "", tel2: "", email: "",
      cep: "", logradouro: "", numero: "", complemento: "", bairro: "", municipio: "", uf: "",
      titulo_eleitor: "", zona: "", secao: "", municipio_titulo: "", uf_titulo: "",
      observacoes: "", consentimento_bool: false, finalidade: "Cadastro de apoiador",
    },
  });

  useEffect(() => {
    if (!cpfParam) {
      toast({ title: "CPF não fornecido", description: "Volte e verifique o CPF primeiro.", variant: "destructive" });
      navigate("/campo");
    }
  }, [cpfParam, navigate]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!colaborador) throw new Error("Colaborador não identificado.");
      const normalizedCpf = normalizeCPF(data.cpf);
      const { data: existing } = await supabase.from("pessoa").select("cidadao_id").eq("cpf", normalizedCpf).single();
      if (existing) throw new Error("Este CPF já foi cadastrado.");

      const payload: TablesInsert<'pessoa'> = {
        cpf: normalizedCpf, nome: data.nome, dt_nasc: data.dt_nasc, sexo: data.sexo,
        tel1: data.tel1, tel2: data.tel2 || null, email: data.email || null,
        cep: data.cep, logradouro: data.logradouro, numero: data.numero,
        complemento: data.complemento || null, bairro: data.bairro, municipio: data.municipio, uf: data.uf,
        titulo_eleitor: data.titulo_eleitor || null, zona: data.zona || null, secao: data.secao || null,
        municipio_titulo: data.municipio_titulo || null, uf_titulo: data.uf_titulo || null,
        observacoes: data.observacoes || null, consentimento_bool: data.consentimento_bool,
        finalidade: data.finalidade, origem: 'campo', criado_por: colaborador.usuario_id,
        data_consentimento: new Date().toISOString(),
      };

      const { data: novaPessoa, error } = await supabase.from("pessoa").insert([payload]).select("cidadao_id").single();
      if (error) throw error;
      return novaPessoa;
    },
    onSuccess: (data) => {
      toast({ title: "Cadastro realizado com sucesso!" });
      navigate(`/campo/resumo?id=${data.cidadao_id}`);
    },
    onError: (error: any) => {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = ["nome", "dt_nasc", "sexo"];
    if (step === 2) fieldsToValidate = ["tel1", "email"];
    if (step === 3) fieldsToValidate = ["cep", "logradouro", "numero", "bairro", "municipio", "uf"];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
    } else {
      toast({ title: "Campos inválidos", description: "Por favor, corrija os campos destacados.", variant: "destructive" });
    }
  };

  const handlePrevStep = () => setStep(prev => prev - 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Formulário de Cadastro</CardTitle>
        <CardDescription className="text-center">Etapa {step} de {TOTAL_STEPS}</CardDescription>
        <Progress value={(step / TOTAL_STEPS) * 100} className="mt-2" />
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
          {step === 1 && <Step1 form={form} />}
          {step === 2 && <Step2 form={form} />}
          {step === 3 && <Step3 form={form} />}
          {step === 4 && <Step4 form={form} />}
          {step === 5 && <Step5 form={form} />}

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <Button type="button" variant="outline" className="w-full h-12 text-base" onClick={handlePrevStep}>
                Voltar
              </Button>
            )}
            {step < TOTAL_STEPS && (
              <Button type="button" className="w-full h-12 text-base" onClick={handleNextStep}>
                Avançar
              </Button>
            )}
            {step === TOTAL_STEPS && (
              <Button type="submit" className="w-full h-12 text-base" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Cadastro
              </Button>
            )}
          </div>
          <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={() => navigate('/campo')}>
            Cancelar e Voltar ao Início
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}