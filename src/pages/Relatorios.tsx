import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function Relatorios() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize dados e métricas do sistema
          </p>
        </div>
      </div>

      <Card className="card-institutional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Visão Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <p>A funcionalidade de relatórios está em desenvolvimento.</p>
            <p>Em breve, você poderá gerar gráficos e exportar dados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}