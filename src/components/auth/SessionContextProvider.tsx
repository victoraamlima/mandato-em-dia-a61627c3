import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

type SessionContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  isLoading: true,
});

export function SessionContextProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Quando o usuário se autentica, tentamos marcar um convite pendente (se houver)
      // O token é salvo em localStorage durante o fluxo de signup público
      if (_event === "SIGNED_IN" || _event === "INITIAL_SESSION") {
        try {
          const pendingToken = localStorage.getItem("convite_token");
          if (pendingToken && session?.user) {
            // Não bloqueante — apenas tentamos marcar o convite como usado
            (async () => {
              const { error } = await supabase
                .from("convite")
                .update({
                  status: "usado",
                  usado_em: new Date().toISOString(),
                  usado_por: session.user!.id,
                })
                .eq("token", pendingToken);

              if (error) {
                console.warn("Erro ao marcar convite como usado automaticamente:", error.message);
                toast({ title: "Aviso", description: "Não foi possível marcar o convite como usado automaticamente.", variant: "destructive" });
              } else {
                localStorage.removeItem("convite_token");
                toast({ title: "Convite marcado", description: "Seu convite foi registrado como usado." });
              }
            })();
          }
        } catch (e) {
          // ignore localStorage errors
        }
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}