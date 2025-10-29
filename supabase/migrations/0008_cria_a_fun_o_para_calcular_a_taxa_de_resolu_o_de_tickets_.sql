CREATE OR REPLACE FUNCTION public.calcular_taxa_resolucao()
RETURNS double precision
LANGUAGE sql
AS $$
  SELECT
    CASE
      WHEN COUNT(*) = 0 THEN 0.0
      ELSE (COUNT(*) FILTER (WHERE status = 'Fechado')) * 100.0 / COUNT(*)
    END
  FROM public.ticket;
$$;