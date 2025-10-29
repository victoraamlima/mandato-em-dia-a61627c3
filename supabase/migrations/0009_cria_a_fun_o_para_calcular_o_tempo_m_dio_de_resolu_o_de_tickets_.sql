CREATE OR REPLACE FUNCTION public.calcular_tempo_medio_resolucao()
RETURNS double precision
LANGUAGE sql
AS $$
  SELECT
    COALESCE(
      AVG(
        EXTRACT(EPOCH FROM (data_fechamento - created_at)) / 86400.0
      ), 0.0
    )
  FROM public.ticket
  WHERE status = 'Fechado' AND data_fechamento IS NOT NULL;
$$;