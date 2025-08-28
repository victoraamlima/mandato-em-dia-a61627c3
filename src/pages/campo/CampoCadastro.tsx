import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { isValidCPF, normalizeCPF } from "@/lib/utils";
import type { TablesInsert } from "@/integrations/supabase/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import InputMask from "react-input-mask";

const schema = z.object({
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  nome: z.string().min(3, "Nome completo é obrigatório"),
  dt_nasc: z.string().min(1, "Data de nascimento é obrigatória"),
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

export default function CampoCadastro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cpfParam = searchParams.get("cpf") || "";
  const { user: colaborador } = useUser();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cpf: cpfParam,
      nome: "",
      dt_nasc: "",
      sexo: "",
      tel1: "",
      tel2: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      municipio: "",
      uf: "",
      titulo_eleitor: "",
      zona: "",
      secao: "",
      municipio_titulo: "",
      uf_titulo: "",
      observacoes: "",
      consentimento_bool: false,
      finalidade: "Cadastro de apoiador",
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
        cpf: normalizedCpf,
        nome: data.nome,
        dt_nasc: data.dt_nasc,
        sexo: data.sexo,
        tel1: data.tel1,
        tel2: data.tel2 || null,
        email: data.email || null,
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento || null,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        titulo_eleitor: data.titulo_eleitor || null,
        zona: data.zona || null,
        secao: data.secao || null,
        municipio_titulo: data.municipio_titulo || null,
        uf_titulo: data.uf_titulo || null,
        observacoes: data.observacoes || null,
        consentimento_bool: data.consentimento_bool,
        finalidade: data.finalidade,
        origem: 'campo',
        criado_por: colaborador.usuario_id,
        data_consentimento: new Date().toISOString(),
      };

      const { data: novaPessoa, error } = await supabase
        .from("pessoa")
        .insert([payload])
        .select("cidadao_id")
        .single();
      
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Formulário de Cadastro</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
          {/* ... sections for form fields ... */}
          <Button type="submit" className="w-full h-12 text-base" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Cadastro
          </Button>
          <Button type="button" variant="outline" className="w-full h-12 text-base" onClick={() => navigate('/campo')}>
            Cancelar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}