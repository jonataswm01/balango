-- ============================================
-- ADICIONAR CAMPO onboarding_completo NA TABELA USERS
-- ============================================

-- Adicionar coluna onboarding_completo
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS onboarding_completo BOOLEAN DEFAULT false;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completo 
  ON public.users(onboarding_completo);

-- Comentário
COMMENT ON COLUMN public.users.onboarding_completo IS 'Indica se o usuário completou o onboarding inicial';

