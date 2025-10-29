-- Permitir leitura pública apenas de convites ativos (útil para validação do token no fluxo público)
CREATE POLICY "Public read convites ativos" ON public.convite
FOR SELECT
USING (status = 'ativo');

-- Permitir que usuários autenticados marquem um convite como usado (após cadastro)
CREATE POLICY "Authenticated can mark convite as used" ON public.convite
FOR UPDATE
TO authenticated
USING (status = 'ativo') 
WITH CHECK (status = 'usado' AND usado_por = auth.uid());