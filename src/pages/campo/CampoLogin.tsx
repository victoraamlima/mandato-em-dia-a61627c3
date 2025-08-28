import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CampoLayout } from "@/components/layout/CampoLayout";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pt } from "@/lib/supabase-pt";

export default function CampoLogin() {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const error = location.state?.error;
    if (error) {
      toast({ title: "Acesso Negado", description: error, variant: "destructive" });
    }
  }, [location.state]);

  useEffect(() => {
    if (!isLoading && session) {
      const checkScope = async () => {
        const { data: profile } = await supabase
          .from("usuario")
          .select("app_scopes")
          .eq("usuario_id", session.user.id)
          .single();

        if (profile?.app_scopes?.includes("campo")) {
          navigate("/campo", { replace: true });
        } else {
          await supabase.auth.signOut();
          toast({
            title: "Acesso Negado",
            description: "Sua conta não tem acesso ao módulo de Campo. Solicite habilitação.",
            variant: "destructive",
          });
        }
      };
      checkScope();
    }
  }, [session, isLoading, navigate]);

  if (isLoading || session) {
    return (
      <div className="theme-campo min-h-screen flex items-center justify-center bg-background">
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
    <CampoLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Acesso ao Módulo de Campo</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            localization={{
              variables: pt,
            }}
            theme="dark"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#2DD4BF",
                    brandAccent: "#29BCAB",
                    defaultButtonBackgroundHover: "#29BCAB",
                    inputText: "#E6EAF2",
                    inputBackground: "#232733",
                    inputBorder: "#232733",
                    inputBorderHover: "#2DD4BF",
                    inputBorderFocus: "#2DD4BF",
                  },
                  radii: {
                    inputBorderRadius: "0.5rem",
                    buttonBorderRadius: "0.5rem",
                  }
                },
              },
              className: {
                button: "bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base",
                input: "h-12",
                label: "text-muted-foreground",
                anchor: "text-primary hover:text-primary/90",
                message: "text-destructive text-sm",
              }
            }}
          />
        </CardContent>
      </Card>
    </CampoLayout>
  );
}