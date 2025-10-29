-- 1. Remover as políticas de UPDATE existentes
DROP POLICY IF EXISTS "Admins can update convites" ON public.convite;
DROP POLICY IF EXISTS "Authenticated can mark convite as used" ON public.convite;

-- 2. Política de UPDATE para Admins (Permite qualquer UPDATE para Admins)
CREATE POLICY "Admins can update convites" ON public.convite
FOR UPDATE
TO authenticated
USING (
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) = 'Admin'
);
-- Nota: Sem WITH CHECK, pois Admins podem mudar o status para qualquer valor ('desativado', 'usado', 'ativo').

-- 3. Política de UPDATE para Usuários Normais (Permite apenas marcar como 'usado')
CREATE POLICY "Authenticated can mark convite as used" ON public.convite
FOR UPDATE
TO authenticated
USING (
  status = 'ativo'
  AND
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) != 'Admin' -- Exclui Admins
)
WITH CHECK (
  status = 'usado' AND usado_por = auth.uid()
);
-- Nota: O USING garante que esta política só se aplica a não-admins. O WITH CHECK garante que a única mudança que eles podem fazer é marcar como 'usado'.