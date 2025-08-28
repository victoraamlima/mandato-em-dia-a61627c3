import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isValidCPF, normalizeCPF } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, MapPin, Search, Loader2 } from "lucide-react";
import InputMask from "react-input-mask";

type PessoaExistente = {
  cidadao_id: string;
  nome: string;
  municipio: string;
};

const checkCpfExists = async (cpf: string) => {
  const { data, error } = await supabase
    .from("pessoa")
    .select("cidadao_id, nome, municipio")
    .eq("cpf", cpf)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export default function CampoVerificaCPF() {
  const [cpf, setCpf] = useState("");
  const [pessoaExistente, setPessoaExistente] = useState<PessoaExistente | null>(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: checkCpfExists,
    onSuccess: (data) => {
      if (data) {
        setPessoaExistente(data);
      } else {
        navigate(`/campo/cadastro?cpf=${normalizeCPF(cpf)}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar o CPF. Tente novamente.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleContinue = () => {
    const normalized = normalizeCPF(cpf);
    if (!isValidCPF(normalized)) {
      toast({ title: "CPF inválido", description: "Por favor, insira um CPF válido.", variant: "destructive" });
      return;
    }
    setPessoaExistente(null);
    mutation.mutate(normalized);
  };

  const handleNewCPF = () => {
    setCpf("");
    setPessoaExistente(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Iniciar Novo Cadastro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!pessoaExistente ? (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Digite o CPF do cidadão para verificar se já existe um cadastro.
            </p>
            <div className="space-y-2">
              <label htmlFor="cpf" className="text-sm font-medium">CPF do Cidadão</label>
              <InputMask
                mask="999.999.999-99"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                disabled={mutation.isPending}
              >
                {(inputProps: any) => <Input {...inputProps} id="cpf" placeholder="000.000.000-00" className="h-12 text-lg text-center" />}
              </InputMask>
            </div>
            <Button onClick={handleContinue} className="w-full h-12 text-base" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Continuar
            </Button>
          </div>
        ) : (
          <Alert variant="default" className="border-primary">
            <User className="h-4 w-4 text-primary" />
            <AlertTitle>Pessoa já cadastrada!</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p className="font-semibold text-lg">{pessoaExistente.nome}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{pessoaExistente.municipio}</span>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleNewCPF} variant="outline" className="w-full">Novo CPF</Button>
                <Button asChild className="w-full">
                  <a href={`/pessoas/${pessoaExistente.cidadao_id}`} target="_blank" rel="noopener noreferrer">Ver no Gabinete</a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}