import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function Configuracoes() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Ajuste as configurações gerais do sistema
          </p>
        </div>
      </div>

      <Card className="card-institutional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <p>A página de configurações está em desenvolvimento.</p>
            <p>Em breve, você poderá personalizar o sistema.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}