-- Gabinete Digital - Database Schema

-- Drop existing objects to ensure a clean slate
DROP TABLE IF EXISTS public.evento_participante CASCADE;
DROP TABLE IF EXISTS public.ticket_comentario CASCADE;
DROP TABLE IF EXISTS public.ticket CASCADE;
DROP TABLE IF EXISTS public.pessoa CASCADE;
DROP TABLE IF EXISTS public.evento CASCADE;
DROP TABLE IF EXISTS public.colaborador CASCADE;
DROP TABLE IF EXISTS public.usuario CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Tables Definition

CREATE TABLE public.usuario (
  usuario_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('Admin', 'Gestor', 'Atendente', 'Campo', 'Analista')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.colaborador (
  colaborador_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pessoa (
  cidadao_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  dt_nasc DATE NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('Masculino', 'Feminino', 'Outro', 'Prefiro_nao_informar')),
  tel1 TEXT NOT NULL,
  tel2 TEXT,
  email TEXT,
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  municipio TEXT NOT NULL,
  uf TEXT NOT NULL,
  cep TEXT NOT NULL,
  ibge TEXT,
  titulo_eleitor TEXT,
  zona TEXT,
  secao TEXT,
  municipio_titulo TEXT,
  uf_titulo TEXT,
  observacoes TEXT,
  consentimento_bool BOOLEAN NOT NULL,
  data_consentimento DATE NOT NULL DEFAULT current_date,
  finalidade TEXT,
  origem TEXT NOT NULL DEFAULT 'gabinete' CHECK (origem IN ('gabinete', 'campo', 'importacao')),
  criado_por UUID REFERENCES public.usuario(usuario_id) ON DELETE SET NULL,
  atualizado_por UUID REFERENCES public.usuario(usuario_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket (
  ticket_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cidadao_id UUID NOT NULL REFERENCES public.pessoa(cidadao_id) ON DELETE CASCADE,
  cadastrado_por UUID NOT NULL REFERENCES public.usuario(usuario_id),
  atendente_id UUID REFERENCES public.usuario(usuario_id),
  motivo_atendimento TEXT NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  prioridade TEXT NOT NULL DEFAULT 'Media' CHECK (prioridade IN ('Baixa', 'Media', 'Alta', 'Urgente')),
  descricao_curta TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Em_analise', 'Em_andamento', 'Concluido', 'Arquivado')),
  prazo_sla TIMESTAMPTZ,
  data_fechamento TIMESTAMPTZ,
  origem TEXT NOT NULL DEFAULT 'gabinete' CHECK (origem IN ('gabinete', 'campo', 'importacao')),
  colaborador_id UUID REFERENCES public.colaborador(colaborador_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_comentario (
  comentario_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.ticket(ticket_id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuario(usuario_id),
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.evento (
  evento_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  inicio TIMESTAMPTZ NOT NULL,
  fim TIMESTAMPTZ NOT NULL,
  local TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  tipo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.evento_participante (
  evento_id UUID REFERENCES public.evento(evento_id) ON DELETE CASCADE,
  cidadao_id UUID REFERENCES public.pessoa(cidadao_id),
  externo_nome TEXT,
  externo_contato TEXT
);

-- Triggers for 'updated_at'
CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON public.usuario FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_colaborador_updated_at BEFORE UPDATE ON public.colaborador FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_pessoa_updated_at BEFORE UPDATE ON public.pessoa FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_ticket_updated_at BEFORE UPDATE ON public.ticket FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_evento_updated_at BEFORE UPDATE ON public.evento FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Essential Indexes
CREATE INDEX IF NOT EXISTS idx_pessoa_cpf ON public.pessoa(cpf);
CREATE INDEX IF NOT EXISTS idx_pessoa_nome_municipio ON public.pessoa(municipio, nome);
CREATE INDEX IF NOT EXISTS idx_ticket_status_prioridade ON public.ticket(status, prioridade, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_atendente ON public.ticket(atendente_id, status);
CREATE INDEX IF NOT EXISTS idx_ticket_motivo ON public.ticket(motivo_atendimento);
CREATE INDEX IF NOT EXISTS idx_ticket_colaborador ON public.ticket(colaborador_id);

-- Row Level Security (RLS) Policies - Development Only
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for development" ON public.usuario FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.colaborador ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for development" ON public.colaborador FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.pessoa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for development" ON public.pessoa FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.ticket ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for development" ON public.ticket FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.ticket_comentario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for development" ON public.ticket_comentario FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.evento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for development" ON public.evento FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.evento_participante ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for development" ON public.evento_participante FOR ALL USING (true) WITH CHECK (true);