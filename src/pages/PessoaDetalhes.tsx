import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Mail, Phone, MapPin, Edit, ArrowLeft, Ticket as TicketIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="grid md:grid-cols-2 gap-6">
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
        <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">{pessoa.nome}</h1>
            <Badge variant="secondary">{pessoa.cpf}</Badge>
        </div>
        <Button asChild>
          <Link to={`/pessoas/${id}/editar`}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-institutional">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Dados Pessoais</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Data de Nasc.:</strong> {new Date(pessoa.dt_nasc).toLocaleDateString('pt-BR')}</p>
            <p><strong>Sexo:</strong> {pessoa.sexo}</p>
            <p><strong>Título de Eleitor:</strong> {pessoa.titulo_eleitor || "Não informado"}</p>
          </CardContent>
        </Card>
        <Card className="card-institutional">
          <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5 text-primary" /> Contato e Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Telefone:</strong> {pessoa.tel1}</p>
            <p><strong>Email:</strong> {pessoa.email || "Não informado"}</p>
            <p><strong>Endereço:</strong> {`${pessoa.logradouro}, ${pessoa.numero} - ${pessoa.bairro}, ${pessoa.municipio}/${pessoa.uf}`}</p>
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