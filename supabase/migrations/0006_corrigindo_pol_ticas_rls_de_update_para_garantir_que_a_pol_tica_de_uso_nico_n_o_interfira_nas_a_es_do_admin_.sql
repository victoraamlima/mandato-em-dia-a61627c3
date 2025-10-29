-- 1. Remover a política de uso único existente
DROP POLICY IF EXISTS "Authenticated can mark convite as used" ON public.convite;

-- 2. Recriar a política de uso único, excluindo explicitamente administradores no USING
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

-- 3. Manter a política de Admin (que já permite qualquer UPDATE)
-- DROP POLICY IF EXISTS "Admins can update convites" ON public.convite; -- Não precisa dropar, já foi corrigida na etapa anterior
-- CREATE POLICY "Admins can update convites" ON public.convite ... (mantida)