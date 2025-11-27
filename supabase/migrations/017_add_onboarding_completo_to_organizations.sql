-- ============================================
-- ADICIONAR CAMPO onboarding_completo NA TABELA ORGANIZATIONS
-- O onboarding é por organização, não por usuário
-- ============================================

-- Adicionar coluna onboarding_completo na tabela organizations
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS onboarding_completo BOOLEAN DEFAULT false;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_completo 
  ON public.organizations(onboarding_completo);

-- Comentário
COMMENT ON COLUMN public.organizations.onboarding_completo IS 'Indica se o onboarding da organização foi completado';

-- Atualizar organizações existentes para true (assumindo que já foram configuradas)
-- Se quiser manter como false para forçar onboarding, comente a linha abaixo
-- UPDATE public.organizations SET onboarding_completo = true WHERE onboarding_completo = false;

