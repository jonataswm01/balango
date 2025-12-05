-- ============================================
-- Migração 019: Atualizar Status de Serviços Antigos
-- ============================================
-- 
-- Esta migração atualiza serviços que foram criados antes da nova lógica de status
-- e que já foram pagos e já passaram da data, mas ainda estão com status pendente/em_andamento
--
-- Regra aplicada:
-- - Serviços com payment_status = 'pago'
-- - E data do serviço < hoje
-- - E status IN ('pendente', 'em_andamento')
-- - E completed_date IS NULL
-- 
-- Serão atualizados para:
-- - status = 'concluido'
-- - completed_date = payment_date (se existir) OU date do serviço

-- Atualizar serviços pagos e com data passada para status concluido
UPDATE public.services
SET 
  status = 'concluido',
  completed_date = COALESCE(
    payment_date::timestamp without time zone,
    date::timestamp without time zone
  ),
  updated_at = now()
WHERE 
  payment_status = 'pago'
  AND date < CURRENT_DATE
  AND status IN ('pendente', 'em_andamento')
  AND completed_date IS NULL;

-- Log da quantidade de serviços atualizados
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Serviços atualizados: %', updated_count;
END $$;

