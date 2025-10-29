import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function ConviteSignup() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Busca do convite público (só convites 'ativo' podem ser retornados por RLS)
  const { data: convite, isLoading, isError } = useQuery({
    queryKey: ["convite", token],
    queryFn: async () => {
      const { data, error } = await supabase.from("convite").select("*").eq("token", token).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", email: "", password: "" },
  });

  const signupMutation = useMutation({
    mutationFn: async (values: FormData) => {
      // Inclui o perfil do convite na metadata
      const options: any = {
        data: {
          full_name: values.nome,
          perfil: convite?.perfil ?? "Atendente",
        },
      };

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options,
      });

      if (error) throw error;
      return data;
    },
  });

  const markUsedMutation = useMutation({
    mutationFn: async (tokenToMark: string) => {
      const session = await supabase.auth.getSession();
      const userId = session.data?.session?.user?.id;
      if (!userId) {
        throw new Error("Usuário não autenticado para marcar convite como usado.");
      }
      const { error } = await supabase
        .from("convite")
        .update({
          status: "usado",
          usado_em: new Date().toISOString(),
          usado_por: userId,
        })
        .eq("token", tokenToMark);
      if (error) throw error;
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!convite) {
      toast({ title: "Convite inválido", description: "Este link não é válido ou já foi utilizado.", variant: "destructive" });
      return;
    }

    try {
      const res = await signupMutation.mutateAsync(values);

      // Se houver uma sessão ativa após o signUp, tentamos marcar o convite como usado
      const session = res.session ?? (await supabase.auth.getSession()).data.session;
      if (session && session.user) {
        try {
          await markUsedMutation.mutateAsync(token!);
        } catch (err: any) {
          // Se não conseguir marcar por RLS/perm, apenas avisamos — não bloqueamos o fluxo
          console.warn("Não foi possível marcar convite como usado automaticamente:", err?.message ?? err);
        }
      } else {
        // Se não houver sessão (fluxo com confirmação de e-mail), avisamos o usuário sobre o próximo passo
        toast({
          title: "Verifique seu e-mail",
          description: "Enviamos um e-mail de confirmação. Depois de confirmar, faça login para concluir o cadastro.",
        });
      }

      toast({ title: "Cadastro realizado", description: "Verifique seu e-mail (se necessário) e faça login." });
      queryClient.invalidateQueries({ queryKey: ["convite", token] });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Erro ao criar a conta", description: err?.message ?? String(err), variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><span className="text-muted-foreground">Carregando...</span></div>;
  }

  if (isError || !convite || convite.status !== "ativo") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Convite inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Este link de convite é inválido, expirou ou já foi utilizado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Cadastro por convite</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Você foi convidado para criar uma conta com o perfil <strong>{convite.perfil}</strong>.</p>

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" {...form.register("nome")} />
              {form.formState.errors.nome && <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? "Cadastrando..." : "Criar conta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}