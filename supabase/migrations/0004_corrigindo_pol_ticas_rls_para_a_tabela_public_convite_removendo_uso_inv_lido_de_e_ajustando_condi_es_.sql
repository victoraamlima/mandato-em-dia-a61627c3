-- Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Admins podem gerenciar convites" ON public.convite;
DROP POLICY IF EXISTS "Public read convites ativos" ON public.convite;
DROP POLICY IF EXISTS "Admins podem ver todos os convites" ON public.convite;
DROP POLICY IF EXISTS "Convite insert policy" ON public.convite;
DROP POLICY IF EXISTS "Authenticated can mark convite as used" ON public.convite;
DROP POLICY IF EXISTS "Admins can update convites" ON public.convite;
DROP POLICY IF EXISTS "Admins can delete convites" ON public.convite;

-- Permitir leitura pública apenas de convites ativos
CREATE POLICY "Public read convites ativos" ON public.convite
FOR SELECT
USING (status = 'ativo');

-- Permitir que administradores vejam todos os convites (SELECT)
CREATE POLICY "Admins podem ver todos os convites" ON public.convite
FOR SELECT
TO authenticated
USING (
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) = 'Admin'
);

-- Permitir INSERT se o usuário for Admin ou se criado_por for igual ao auth.uid()
CREATE POLICY "Convite insert policy" ON public.convite
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) = 'Admin'
  OR
  (criado_por = auth.uid())
);

-- Permitir UPDATE por Admins (qualquer atualização)
CREATE POLICY "Admins can update convites" ON public.convite
FOR UPDATE
TO authenticated
USING (
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) = 'Admin'
)
WITH CHECK (
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) = 'Admin'
);

-- Permitir que usuários autenticados marquem um convite ativo como usado (uso único)
CREATE POLICY "Authenticated can mark convite as used" ON public.convite
FOR UPDATE
TO authenticated
USING (status = 'ativo')
WITH CHECK (status = 'usado' AND usado_por = auth.uid());

-- Permitir DELETE somente para Admins
CREATE POLICY "Admins can delete convites" ON public.convite
FOR DELETE
TO authenticated
USING (
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) = 'Admin'
);