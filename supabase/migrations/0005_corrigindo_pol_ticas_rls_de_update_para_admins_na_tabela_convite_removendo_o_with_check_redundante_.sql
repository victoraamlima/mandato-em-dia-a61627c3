-- 1. Remover a política de UPDATE para Admins existente
DROP POLICY IF EXISTS "Admins can update convites" ON public.convite;

-- 2. Recriar a política de UPDATE para Admins, permitindo qualquer alteração (sem WITH CHECK)
CREATE POLICY "Admins can update convites" ON public.convite
FOR UPDATE
TO authenticated
USING (
  (SELECT perfil FROM public.usuario WHERE usuario_id = auth.uid()) = 'Admin'
);

-- 3. Manter a política de UPDATE para usuários normais (marcar como usado)
-- (Esta política já existe e não será alterada, apenas garantindo que ela não interfira no fluxo Admin)
DROP POLICY IF EXISTS "Authenticated can mark convite as used" ON public.convite;
CREATE POLICY "Authenticated can mark convite as used" ON public.convite
FOR UPDATE
TO authenticated
USING (status = 'ativo')
WITH CHECK (status = 'usado' AND usado_por = auth.uid());