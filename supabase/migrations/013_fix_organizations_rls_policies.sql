-- ============================================
-- CORRIGIR POLÍTICAS RLS DA TABELA ORGANIZATIONS
-- Permitir criação de organizações durante onboarding
-- ============================================

-- Remover TODAS as políticas antigas que podem estar causando problemas
DROP POLICY IF EXISTS "Usuários podem ver sua organização" ON public.organizations;
DROP POLICY IF EXISTS "Usuários podem ver organizações que são membros" ON public.organizations;
DROP POLICY IF EXISTS "Usuários podem criar organizações" ON public.organizations;
DROP POLICY IF EXISTS "Usuários autenticados podem criar organizações" ON public.organizations;
DROP POLICY IF EXISTS "Admins podem atualizar organizações" ON public.organizations;

-- Política de SELECT: Usuários podem ver sua organização
-- Durante onboarding, permitir ver organizações recém-criadas
CREATE POLICY "Usuários podem ver sua organização"
  ON public.organizations FOR SELECT
  USING (
    -- Ver organização do usuário (se já tiver organization_id)
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    -- OU se o usuário não tem organization_id ainda (durante onboarding)
    -- Permitir ver organizações criadas recentemente (últimas 10 minutos)
    -- Isso permite que o usuário veja a organização logo após criar
    OR (
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND organization_id IS NULL
      )
      AND created_at > NOW() - INTERVAL '10 minutes'
    )
  );

-- Política de INSERT: Qualquer usuário autenticado pode criar organização
-- Isso é necessário para o onboarding
-- Verificar explicitamente se o usuário está autenticado
CREATE POLICY "Usuários autenticados podem criar organizações"
  ON public.organizations FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() IS NOT NULL
  );

-- Política de UPDATE: Apenas admins podem atualizar
CREATE POLICY "Admins podem atualizar organizações"
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

