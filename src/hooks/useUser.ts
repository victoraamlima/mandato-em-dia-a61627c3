import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/components/auth/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type UserProfile = Tables<"usuario">;

export function useUser() {
  const { user, isLoading: isSessionLoading } = useSession();
  const userId = user?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("usuario")
        .select("*")
        .eq("usuario_id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        throw error;
      }
      return data;
    },
    enabled: !isSessionLoading && !!userId, // Só executa a query se a sessão estiver carregada e houver um userId
  });

  return {
    user: data,
    isLoading: isSessionLoading || isLoading,
    isError,
  };
}