-- ============================================
-- CORREÇÃO FINAL: POLÍTICAS RLS ORGANIZATIONS
-- Remove todas as políticas e recria de forma simples
-- ============================================

-- 1. Garantir que RLS está habilitado
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes (para evitar conflitos)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.organizations', r.policyname);
    END LOOP;
END $$;

-- 3. Criar política de SELECT: Ver própria organização ou durante onboarding
CREATE POLICY "users_select_own_organization"
  ON public.organizations FOR SELECT
  USING (
    -- Ver organização do usuário
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    -- OU durante onboarding (usuário sem organization_id pode ver organizações recentes)
    OR (
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND organization_id IS NULL
      )
      AND created_at > NOW() - INTERVAL '15 minutes'
    )
  );

-- 4. Criar política de INSERT: Qualquer usuário autenticado pode criar
-- Esta é a política mais importante para o onboarding funcionar
CREATE POLICY "authenticated_users_insert_organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 5. Criar política de UPDATE: Apenas admins da organização
CREATE POLICY "admins_update_organizations"
  ON public.organizations FOR UPDATE
  USING (
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

-- 6. Verificar se as políticas foram criadas
DO $$
BEGIN
    RAISE NOTICE 'Políticas criadas para tabela organizations';
    RAISE NOTICE 'SELECT: users_select_own_organization';
    RAISE NOTICE 'INSERT: authenticated_users_insert_organizations';
    RAISE NOTICE 'UPDATE: admins_update_organizations';
END $$;

