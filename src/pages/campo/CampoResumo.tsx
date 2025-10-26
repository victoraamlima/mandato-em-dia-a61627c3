import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { maskCpf, maskPhone } from "@/lib/utils"; // Importar maskPhone
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, User, MapPin, Phone, FileText, Calendar, UserCheck } from "lucide-react";

const fetchPessoa = async (id: string) => {
  const { data, error } = await supabase
    .from("pessoa")
    .select(`
      nome, cpf, municipio, uf, tel1, titulo_eleitor, zona, secao, created_at,
      colaborador:usuario!pessoa_criado_por_fkey(nome)
    `)
    .eq("cidadao_id", id)
    .single();
  if (error) throw error;
  return data;
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 text-primary mt-1" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Não informado"}</p>
    </div>
  </div>
);

export default function CampoResumo() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pessoa-resumo", id],
    queryFn: () => fetchPessoa(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-80 w-full" /></CardContent></Card>;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader><CardTitle>Erro</CardTitle></CardHeader>
        <CardContent><p>Não foi possível carregar o resumo do cadastro.</p></CardContent>
        <CardFooter>
          <Button asChild className="w-full"><Link to="/campo">Novo Cadastro</Link></Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CheckCircle className="h-12 w-12 text-success mb-2" />
        <CardTitle className="text-2xl">Cadastro Concluído!</CardTitle>
        <CardDescription>{data.nome}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoItem icon={User} label="CPF" value={maskCpf(data.cpf)} />
        <InfoItem icon={MapPin} label="Localização" value={`${data.municipio}/${data.uf}`} />
        <InfoItem icon={Phone} label="Telefone" value={maskPhone(data.tel1)} />
        <InfoItem icon={FileText} label="Título Eleitoral" value={data.titulo_eleitor ? `Zona: ${data.zona} / Seção: ${data.secao}` : "Não informado"} />
        <InfoItem icon={UserCheck} label="Cadastrado por" value={data.colaborador?.nome} />
        <InfoItem icon={Calendar} label="Data do Cadastro" value={new Date(data.created_at).toLocaleString('pt-BR')} />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button asChild className="w-full h-12 text-base"><Link to="/campo">Novo Cadastro</Link></Button>
        <Button asChild variant="outline" className="w-full h-12 text-base">
          <a href={`/pessoas/${id}`} target="_blank" rel="noopener noreferrer">Ver no Gabinete</a>
        </Button>
      </CardFooter>
    </Card>
  );
}