-- ============================================
-- PERMITIR organization_id NULL TEMPORARIAMENTE DURANTE ONBOARDING
-- ============================================

-- Verificar se organization_id é NOT NULL antes de tentar alterar
-- Se for NOT NULL, tornar nullable para permitir onboarding
DO $$
BEGIN
  -- Verificar se a coluna é NOT NULL
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'organization_id' 
    AND is_nullable = 'NO'
  ) THEN
    -- Tornar nullable
    ALTER TABLE public.users 
      ALTER COLUMN organization_id DROP NOT NULL;
  END IF;
END $$;

-- Adicionar constraint para garantir que após onboarding, organization_id seja preenchido
-- Mas não forçar NOT NULL para permitir criação durante onboarding

-- Atualizar políticas RLS para lidar com organization_id NULL
-- A política de SELECT já funciona porque verifica auth.uid() = id primeiro

-- Política para UPDATE que permite atualizar mesmo com organization_id NULL
-- (durante onboarding)
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Após onboarding completo, podemos adicionar uma constraint ou trigger
-- para garantir que organization_id não seja NULL para usuários ativos
-- Mas isso pode ser feito depois, quando necessário

