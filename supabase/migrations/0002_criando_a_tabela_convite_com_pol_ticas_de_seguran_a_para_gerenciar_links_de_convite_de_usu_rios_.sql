-- Criar a tabela para armazenar os convites
CREATE TABLE public.convite (
  convite_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  perfil TEXT NOT NULL,
  uso_unico BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'usado', 'desativado')),
  criado_por UUID REFERENCES public.usuario(usuario_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  usado_em TIMESTAMPTZ,
  usado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Habilitar a segurança em nível de linha (RLS)
ALTER TABLE public.convite ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para garantir que apenas Admins possam gerenciar convites
CREATE POLICY "Admins podem gerenciar convites"
ON public.convite
FOR ALL
TO authenticated
USING (
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) = 'Admin'
)
WITH CHECK (
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) = 'Admin'
);