import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
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