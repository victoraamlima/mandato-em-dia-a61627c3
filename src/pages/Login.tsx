import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Login() {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Se a sessão já existir (usuário logado), redireciona para o dashboard
    if (!isLoading && session) {
      navigate("/");
    }
  }, [session, isLoading, navigate]);

  // Mostra uma mensagem de carregamento enquanto a sessão é verificada
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  // Se não houver sessão, mostra o formulário de login
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-surface border border-border">
        <h1 className="text-2xl font-bold mb-6 text-center">Entrar no Sistema</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#1e40af",
                  brandAccent: "#1e3a8a",
                },
              },
            },
          }}
          theme="light"
        />
      </div>
    </div>
  );
}