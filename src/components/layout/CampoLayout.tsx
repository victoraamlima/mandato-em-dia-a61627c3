import React from "react";
import { Building2 } from "lucide-react";

export function CampoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-campo bg-background text-foreground min-h-screen font-inter antialiased">
      <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-xl text-foreground">Gabinete Digital</h1>
            <p className="text-sm text-muted-foreground">Módulo de Coleta em Campo</p>
          </div>
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}