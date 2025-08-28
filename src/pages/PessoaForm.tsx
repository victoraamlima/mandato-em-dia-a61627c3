import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { TablesInsert } from "@/integrations/supabase/types";
import { useSession } from "@/components/auth/SessionContextProvider";

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

export default function PessoaForm() {
  const navigate = useNavigate();
  const { user } = useSession();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      cpf: "",
      dt_nasc: "",
      sexo: "",
      tel1: "",
      email: "",
      logradouro: "",
      numero: "",
      bairro: "",
      municipio: "",
      uf: "",
      cep: "",
      consentimento_bool: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error("Usuário não autenticado.");

      const pessoa: TablesInsert<"pessoa"> = {
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
        consentimento_bool: !!data.consentimento_bool,
        data_consentimento: data.consentimento_bool ? new Date().toISOString().slice(0, 10) : undefined,
        origem: "gabinete",
        criado_por: user.id,
      };
      const { error } = await supabase.from("pessoa").insert([pessoa]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Pessoa cadastrada com sucesso!" });
      navigate("/pessoas");
    },
    onError: (err: any) => {
      toast({ title: "Erro ao cadastrar pessoa", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Cadastrar Nova Pessoa</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          >
            <Input label="Nome" {...form.register("nome")} error={form.formState.errors.nome?.message} />
            <Input label="CPF" {...form.register("cpf")} error={form.formState.errors.cpf?.message} />
            <Input label="Data de Nascimento" type="date" {...form.register("dt_nasc")} error={form.formState.errors.dt_nasc?.message} />
            <Input label="Sexo" {...form.register("sexo")} error={form.formState.errors.sexo?.message} />
            <Input label="Telefone" {...form.register("tel1")} error={form.formState.errors.tel1?.message} />
            <Input label="E-mail" {...form.register("email")} error={form.formState.errors.email?.message} />
            <Input label="Logradouro" {...form.register("logradouro")} error={form.formState.errors.logradouro?.message} />
            <Input label="Número" {...form.register("numero")} error={form.formState.errors.numero?.message} />
            <Input label="Bairro" {...form.register("bairro")} error={form.formState.errors.bairro?.message} />
            <Input label="Município" {...form.register("municipio")} error={form.formState.errors.municipio?.message} />
            <Input label="UF" {...form.register("uf")} error={form.formState.errors.uf?.message} />
            <Input label="CEP" {...form.register("cep")} error={form.formState.errors.cep?.message} />
            <div className="flex items-center gap-2">
              <input type="checkbox" {...form.register("consentimento_bool")} id="consentimento" />
              <label htmlFor="consentimento" className="text-sm">Consentimento LGPD</label>
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending || !user}>
              {mutation.isPending ? "Salvando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}