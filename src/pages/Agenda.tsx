import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

type Evento = {
  evento_id: string;
  titulo: string;
  inicio: string;
  fim: string;
  local: string;
  is_atendimento_deputado: boolean;
};

const fetchEventos = async () => {
  const { data, error } = await supabase
    .from("evento")
    .select("evento_id, titulo, inicio, fim, local, is_atendimento_deputado")
    .order("inicio", { ascending: true });
  if (error) throw error;
  return data;
};

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: eventos, isLoading, isError } = useQuery({
    queryKey: ["eventos"],
    queryFn: fetchEventos,
  });

  const eventosDoDia = eventos?.filter(evento => 
    date ? isSameDay(new Date(evento.inicio), date) : false
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
        <p className="text-muted-foreground">
          Visualize os eventos e atendimentos do gabinete.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-institutional md:col-span-1">
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              locale={ptBR}
            />
          </CardContent>
        </Card>

        <Card className="card-institutional md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Eventos para {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Nenhuma data selecionada"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando eventos...</p>
            ) : isError ? (
              <p className="text-destructive">Erro ao carregar eventos.</p>
            ) : eventosDoDia.length > 0 ? (
              <ul className="space-y-4">
                {eventosDoDia.map(evento => (
                  <li key={evento.evento_id} className="border-l-4 border-primary pl-4 py-2 bg-surface-hover rounded-r-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">{evento.titulo}</p>
                        <p className="text-sm text-muted-foreground">{evento.local}</p>
                      </div>
                      <Badge variant={evento.is_atendimento_deputado ? "default" : "secondary"}>
                        {evento.is_atendimento_deputado ? "Atendimento Dep." : "Evento"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(evento.inicio), "HH:mm")} - {format(new Date(evento.fim), "HH:mm")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum evento para esta data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}