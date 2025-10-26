import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Mail, Phone, MapPin, Edit, ArrowLeft, Ticket as TicketIcon, FileText, CheckSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { maskCpf, maskPhone } from "@/lib/utils"; // Importar maskCpf e maskPhone

const fetchPessoa = async (id: string) => {
  const { data, error } = await supabase
    .from("pessoa")
    .select("*")
    .eq("cidadao_id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const fetchTickets = async (cidadaoId: string) => {
    const { data, error } = await supabase
        .from("ticket")
        .select("ticket_id, motivo_atendimento, status, prioridade, created_at")
        .eq("cidadao_id", cidadaoId)
        .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
}

const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-foreground">{value || <span className="text-gray-400">Não informado</span>}</p>
  </div>
);

export default function PessoaDetalhes() {
  const { id } = useParams<{ id: string }>();

  const { data: pessoa, isLoading: isLoadingPessoa, isError: isErrorPessoa } = useQuery({
    queryKey: ["pessoa", id],
    queryFn: () => fetchPessoa(id!),
    enabled: !!id,
  });

  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ["tickets-pessoa", id],
    queryFn: () => fetchTickets(id!),
    enabled: !!id,
  });

  if (isLoadingPessoa) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isErrorPessoa || !pessoa) {
    return <div className="text-center text-destructive">Erro ao carregar dados da pessoa.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/pessoas">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground">{pessoa.nome}</h1>
        <Button asChild>
          <Link to={`/pessoas/${id}/editar`}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-institutional">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Dados Pessoais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="CPF" value={maskCpf(pessoa.cpf)} />
            <InfoItem label="Data de Nascimento" value={new Date(pessoa.dt_nasc).toLocaleDateString('pt-BR')} />
            <InfoItem label="Sexo" value={pessoa.sexo} />
          </CardContent>
        </Card>
        <Card className="card-institutional">
          <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5 text-primary" /> Contato</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Telefone Principal" value={maskPhone(pessoa.tel1)} />
            <InfoItem label="Telefone Secundário" value={pessoa.tel2 ? maskPhone(pessoa.tel2) : null} />
            <InfoItem label="Email" value={pessoa.email} />
          </CardContent>
        </Card>
        <Card className="card-institutional">
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Logradouro" value={`${pessoa.logradouro}, ${pessoa.numero} ${pessoa.complemento || ''}`} />
            <InfoItem label="Bairro" value={pessoa.bairro} />
            <InfoItem label="Município/UF" value={`${pessoa.municipio}/${pessoa.uf}`} />
            <InfoItem label="CEP" value={pessoa.cep} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-institutional">
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Dados Eleitorais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Título de Eleitor" value={pessoa.titulo_eleitor} />
            <InfoItem label="Zona" value={pessoa.zona} />
            <InfoItem label="Seção" value={pessoa.secao} />
            <InfoItem label="Município/UF do Título" value={pessoa.municipio_titulo && pessoa.uf_titulo ? `${pessoa.municipio_titulo}/${pessoa.uf_titulo}` : null} />
          </CardContent>
        </Card>
        <Card className="card-institutional">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-primary" /> Outras Informações</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Observações" value={pessoa.observacoes} />
            <InfoItem label="Consentimento LGPD" value={pessoa.consentimento_bool ? `Sim, em ${new Date(pessoa.data_consentimento).toLocaleDateString('pt-BR')}` : 'Não'} />
            <InfoItem label="Data de Cadastro" value={new Date(pessoa.created_at).toLocaleString('pt-BR')} />
          </CardContent>
        </Card>
      </div>

      <Card className="card-institutional">
        <CardHeader><CardTitle className="flex items-center gap-2"><TicketIcon className="w-5 h-5 text-primary" /> Histórico de Atendimentos</CardTitle></CardHeader>
        <CardContent>
            {isLoadingTickets ? <p>Carregando atendimentos...</p> : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets?.map(ticket => (
                            <TableRow key={ticket.ticket_id}>
                                <TableCell>{ticket.motivo_atendimento}</TableCell>
                                <TableCell><Badge variant={ticket.prioridade === 'Alta' ? 'destructive' : 'secondary'}>{ticket.prioridade}</Badge></TableCell>
                                <TableCell><Badge>{ticket.status}</Badge></TableCell>
                                <TableCell>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link to={`/tickets/${ticket.ticket_id}`}>Ver</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}