import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Convite = {
  convite_id: string;
  token: string;
  perfil: string;
  uso_unico: boolean;
  status: string;
  criado_por: string | null;
  created_at: string | null;
  usado_em: string | null;
  usado_por: string | null;
};

export default function ConvitesList() {
  const queryClient = useQueryClient();

  const { data: convites, isLoading, isError } = useQuery({
    queryKey: ["convites"],
    queryFn: async (): Promise<Convite[]> => {
      const { data, error } = await supabase.from("convite").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (conviteId: string) => {
      const { error } = await supabase.from("convite").update({ status: "desativado" }).eq("convite_id", conviteId);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast({ title: "Convite desativado" });
      queryClient.invalidateQueries({ queryKey: ["convites"] });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao desativar convite", description: err.message, variant: "destructive" });
    }
  });

  const handleCopy = async (token: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    await navigator.clipboard.writeText(link);
    toast({ title: "Link copiado para a área de transferência" });
  };

  if (isLoading) return <div>Carregando convites...</div>;
  if (isError) return <div className="text-destructive">Erro ao carregar convites.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Convites</h1>
        <p className="text-muted-foreground">Gerencie links de convite gerados</p>
      </div>

      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Links Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          {convites.length === 0 ? (
            <div className="text-muted-foreground">Nenhum convite gerado ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Uso único</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {convites.map((c) => (
                    <TableRow key={c.convite_id}>
                      <TableCell>{c.perfil}</TableCell>
                      <TableCell className="font-mono text-sm truncate max-w-sm">{c.token}</TableCell>
                      <TableCell>{c.uso_unico ? "Sim" : "Não"}</TableCell>
                      <TableCell>{c.status}</TableCell>
                      <TableCell>{c.created_at ? new Date(c.created_at).toLocaleString("pt-BR") : "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleCopy(c.token)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          {c.status === "ativo" && (
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deactivateMutation.mutate(c.convite_id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}