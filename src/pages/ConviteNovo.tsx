import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

const schema = z.object({
  perfil: z.string().min(1, "Perfil é obrigatório"),
  uso_unico: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function ConviteNovo() {
  const { user } = useUser();
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      perfil: "Atendente",
      uso_unico: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error("Usuário não autenticado.");
      
      const token = crypto.randomUUID();
      const { error } = await supabase.from("convite").insert({
        token,
        perfil: data.perfil,
        uso_unico: data.uso_unico,
        criado_por: user.usuario_id,
      });

      if (error) throw error;
      return `${window.location.origin}/convite/${token}`;
    },
    onSuccess: (link) => {
      setGeneratedLink(link);
      toast({ title: "Link de convite gerado com sucesso!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao gerar link", description: err.message, variant: "destructive" });
    },
  });

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Gerar Link de Convite</CardTitle>
          <CardDescription>Crie um link para que novos usuários possam se cadastrar no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedLink ? (
            <form className="space-y-6" onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
              <div className="space-y-2">
                <Label>Perfil do Novo Usuário</Label>
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
                  name="uso_unico"
                  render={({ field }) => (
                      <Switch
                          id="uso_unico"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                      />
                  )}
                />
                <Label htmlFor="uso_unico">Link de uso único</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Se ativado, o link expirará após o primeiro uso.
              </p>

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Gerando..." : "Gerar Link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Label>Link Gerado</Label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={generatedLink}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button onClick={() => setGeneratedLink(null)} variant="outline" className="w-full">
                Gerar Novo Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}