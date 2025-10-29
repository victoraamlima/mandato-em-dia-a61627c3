export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      colaborador: {
        Row: {
          ativo: boolean
          colaborador_id: string
          created_at: string
          email: string | null
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          colaborador_id?: string
          created_at?: string
          email?: string | null
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          colaborador_id?: string
          created_at?: string
          email?: string | null
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      convite: {
        Row: {
          convite_id: string
          created_at: string | null
          criado_por: string | null
          perfil: string
          status: string
          token: string
          uso_unico: boolean
          usado_em: string | null
          usado_por: string | null
        }
        Insert: {
          convite_id?: string
          created_at?: string | null
          criado_por?: string | null
          perfil: string
          status?: string
          token: string
          uso_unico?: boolean
          usado_em?: string | null
          usado_por?: string | null
        }
        Update: {
          convite_id?: string
          created_at?: string | null
          criado_por?: string | null
          perfil?: string
          status?: string
          token?: string
          uso_unico?: boolean
          usado_em?: string | null
          usado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convite_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "convite_usado_por_fkey"
            columns: ["usado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evento: {
        Row: {
          created_at: string
          descricao: string | null
          evento_id: string
          fim: string
          inicio: string
          is_atendimento_deputado: boolean
          lat: number | null
          lng: number | null
          local: string | null
          status: string | null
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          evento_id?: string
          fim: string
          inicio: string
          is_atendimento_deputado?: boolean
          lat?: number | null
          lng?: number | null
          local?: string | null
          status?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          evento_id?: string
          fim?: string
          inicio?: string
          is_atendimento_deputado?: boolean
          lat?: number | null
          lng?: number | null
          local?: string | null
          status?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      evento_participante: {
        Row: {
          cidadao_id: string
          evento_id: string
          externo_contato: string | null
          externo_nome: string | null
        }
        Insert: {
          cidadao_id: string
          evento_id: string
          externo_contato?: string | null
          externo_nome?: string | null
        }
        Update: {
          cidadao_id?: string
          evento_id?: string
          externo_contato?: string | null
          externo_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_participante_cidadao_id_fkey"
            columns: ["cidadao_id"]
            isOneToOne: false
            referencedRelation: "pessoa"
            referencedColumns: ["cidadao_id"]
          },
          {
            foreignKeyName: "evento_participante_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "evento"
            referencedColumns: ["evento_id"]
          },
        ]
      }
      pessoa: {
        Row: {
          atualizado_por: string | null
          bairro: string
          cep: string
          cidadao_id: string
          complemento: string | null
          consentimento_bool: boolean
          cpf: string
          created_at: string
          criado_por: string | null
          data_consentimento: string
          dt_nasc: string
          email: string | null
          finalidade: string | null
          ibge: string | null
          logradouro: string
          municipio: string
          municipio_titulo: string | null
          nome: string
          numero: string
          observacoes: string | null
          origem: string
          secao: string | null
          sexo: string
          tel1: string
          tel2: string | null
          titulo_eleitor: string | null
          uf: string
          uf_titulo: string | null
          updated_at: string
          zona: string | null
        }
        Insert: {
          atualizado_por?: string | null
          bairro: string
          cep: string
          cidadao_id?: string
          complemento?: string | null
          consentimento_bool: boolean
          cpf: string
          created_at?: string
          criado_por?: string | null
          data_consentimento?: string
          dt_nasc: string
          email?: string | null
          finalidade?: string | null
          ibge?: string | null
          logradouro: string
          municipio: string
          municipio_titulo?: string | null
          nome: string
          numero: string
          observacoes?: string | null
          origem?: string
          secao?: string | null
          sexo: string
          tel1: string
          tel2?: string | null
          titulo_eleitor?: string | null
          uf: string
          uf_titulo?: string | null
          updated_at?: string
          zona?: string | null
        }
        Update: {
          atualizado_por?: string | null
          bairro?: string
          cep?: string
          cidadao_id?: string
          complemento?: string | null
          consentimento_bool?: boolean
          cpf?: string
          created_at?: string
          criado_por?: string | null
          data_consentimento?: string
          dt_nasc?: string
          email?: string | null
          finalidade?: string | null
          ibge?: string | null
          logradouro?: string
          municipio?: string
          municipio_titulo?: string | null
          nome?: string
          numero?: string
          observacoes?: string | null
          origem?: string
          secao?: string | null
          sexo?: string
          tel1?: string
          tel2?: string | null
          titulo_eleitor?: string | null
          uf?: string
          uf_titulo?: string | null
          updated_at?: string
          zona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoa_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "pessoa_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      ticket: {
        Row: {
          atendente_id: string | null
          cadastrado_por: string
          categoria: string
          cidadao_id: string
          colaborador_id: string | null
          created_at: string
          data_fechamento: string | null
          descricao: string | null
          descricao_curta: string
          motivo_atendimento: string
          origem: string
          prazo_sla: string | null
          prioridade: string
          status: string
          subcategoria: string | null
          ticket_id: string
          updated_at: string
        }
        Insert: {
          atendente_id?: string | null
          cadastrado_por: string
          categoria: string
          cidadao_id: string
          colaborador_id?: string | null
          created_at?: string
          data_fechamento?: string | null
          descricao?: string | null
          descricao_curta: string
          motivo_atendimento: string
          origem?: string
          prazo_sla?: string | null
          prioridade?: string
          status?: string
          subcategoria?: string | null
          ticket_id?: string
          updated_at?: string
        }
        Update: {
          atendente_id?: string | null
          cadastrado_por?: string
          categoria?: string
          cidadao_id?: string
          colaborador_id?: string | null
          created_at?: string
          data_fechamento?: string | null
          descricao?: string | null
          descricao_curta?: string
          motivo_atendimento?: string
          origem?: string
          prazo_sla?: string | null
          prioridade?: string
          status?: string
          subcategoria?: string | null
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_atendente_id_fkey"
            columns: ["atendente_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "ticket_cadastrado_por_fkey"
            columns: ["cadastrado_por"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "ticket_cidadao_id_fkey"
            columns: ["cidadao_id"]
            isOneToOne: false
            referencedRelation: "pessoa"
            referencedColumns: ["cidadao_id"]
          },
          {
            foreignKeyName: "ticket_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaborador"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      ticket_comentario: {
        Row: {
          comentario_id: string
          created_at: string
          texto: string
          ticket_id: string
          usuario_id: string
        }
        Insert: {
          comentario_id?: string
          created_at?: string
          texto: string
          ticket_id: string
          usuario_id: string
        }
        Update: {
          comentario_id?: string
          created_at?: string
          texto?: string
          ticket_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comentario_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["ticket_id"]
          },
          {
            foreignKeyName: "ticket_comentario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      usuario: {
        Row: {
          app_scopes: string[]
          ativo: boolean
          created_at: string
          email: string
          nome: string
          perfil: string
          ultimo_login: string | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          app_scopes?: string[]
          ativo?: boolean
          created_at?: string
          email: string
          nome: string
          perfil: string
          ultimo_login?: string | null
          updated_at?: string
          usuario_id?: string
        }
        Update: {
          app_scopes?: string[]
          ativo?: boolean
          created_at?: string
          email?: string
          nome?: string
          perfil?: string
          ultimo_login?: string | null
          updated_at?: string
          usuario_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_taxa_resolucao: {
        Args: {}
        Returns: number
      }
      calcular_tempo_medio_resolucao: {
        Args: {}
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const