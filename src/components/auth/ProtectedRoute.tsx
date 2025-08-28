import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { useSession } from "./SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

type ProtectedRouteProps = {
  children: React.ReactNode;
  scope: "backoffice" | "campo";
};

export function ProtectedRoute({ children, scope }: ProtectedRouteProps) {
  const { session, isLoading: isSessionLoading } = useSession();
  const { user: profile, isLoading: isProfileLoading, isError } = useUser();
  const location = useLocation();

  const isLoading = isSessionLoading || (session && isProfileLoading);

  useEffect(() => {
    if (!isLoading && session && (isError || !profile?.app_scopes?.includes(scope))) {
      const message = scope === 'campo' 
        ? "Sua conta não tem acesso ao módulo de Campo. Solicite habilitação." 
        : "Sua conta não tem acesso ao backoffice.";
      
      toast({
        title: "Acesso Negado",
        description: message,
        variant: "destructive",
      });
      supabase.auth.signOut();
    }
  }, [isLoading, session, profile, isError, scope]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  const loginPath = scope === "campo" ? "/campo/login" : "/login";

  if (!session || isError || !profile?.app_scopes?.includes(scope)) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}