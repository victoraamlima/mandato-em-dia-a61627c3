import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function Cohab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">COHAB</h1>
          <p className="text-muted-foreground">
            Gerencie informações e processos da COHAB.
          </p>
        </div>
      </div>

      <Card className="card-institutional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Módulo COHAB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <p>O módulo COHAB está em desenvolvimento.</p>
            <p>Em breve, você poderá gerenciar os processos relacionados aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}