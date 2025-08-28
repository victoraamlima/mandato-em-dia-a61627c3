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
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  perfil: z.string().min(1, "Perfil obrigatório"),
  ativo: z.boolean().default(true),
  password: z.string().optional(),
}).refine(data => {
    if (data.password && data.password.length < 6) {
        return false;
    }
    return true;
}, {
    message: "A senha deve ter pelo menos 6 caracteres",
    path: ["password"],
});

type FormData = z.infer<typeof schema>;

const fetchUsuario = async (id: string): Promise<Tables<'usuario'>> => {
  const { data, error } = await supabase.from("usuario").select("*").eq("usuario_id", id).single();
  if (error) throw new Error(error.message);
  return data;
};

export default function UsuarioForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingUsuario, isLoading } = useQuery({
    queryKey: ["usuario", id],
    queryFn: () => fetchUsuario(id!),
    enabled: isEditing,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      email: "",
      perfil: "Atendente",
      ativo: true,
    },
  });

  useEffect(() => {
    if (existingUsuario) {
      form.reset(existingUsuario);
    }
  }, [existingUsuario, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) {
        const usuarioUpdate: TablesUpdate<"usuario"> = {
          nome: data.nome,
          perfil: data.perfil,
          ativo: data.ativo,
        };
        const { error } = await supabase.from("usuario").update(usuarioUpdate).eq("usuario_id", id);
        if (error) throw error;
      } else {
        if (!data.password) throw new Error("Senha é obrigatória para novos usuários.");
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.nome,
              perfil: data.perfil,
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Não foi possível criar o usuário.");
      }
    },
    onSuccess: () => {
      toast({ title: `Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso!` });
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      navigate("/usuarios");
    },
    onError: (err: any) => {
      toast({ title: "Erro ao salvar usuário", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading && isEditing) {
    return <div className="max-w-2xl mx-auto"><Skeleton className="h-96 w-full" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader><CardTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" {...form.register("nome")} />
              {form.formState.errors.nome && <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...form.register("email")} disabled={isEditing} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>Perfil</Label>
              <Controller
                control={form.control}
                name="perfil"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Atendente">Atendente</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                control={form.control}
                name="ativo"
                render={({ field }) => (
                    <Switch
                        id="ativo"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
              />
              <Label htmlFor="ativo">Usuário Ativo</Label>
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : (isEditing ? "Salvar Alterações" : "Criar Usuário")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}