-- ============================================
-- REMOVER TABELA organization_members
-- Remove todas as dependências primeiro e atualiza políticas RLS
-- ============================================

-- 1. Remover e recriar políticas RLS que dependem de organization_members

-- ORGANIZATIONS
DROP POLICY IF EXISTS "Admins podem atualizar organizações" ON public.organizations;

CREATE POLICY "Admins podem atualizar organizações"
  ON public.organizations FOR UPDATE
  USING (
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

-- APP_SETTINGS
DROP POLICY IF EXISTS "Usuários podem ver configurações da organização" ON public.app_settings;
DROP POLICY IF EXISTS "Usuários podem inserir configurações da organização" ON public.app_settings;
DROP POLICY IF EXISTS "Admins podem atualizar configurações" ON public.app_settings;

CREATE POLICY "Usuários podem ver configurações da organização"
  ON public.app_settings FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Usuários podem inserir configurações da organização"
  ON public.app_settings FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Admins podem atualizar configurações"
  ON public.app_settings FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

-- CLIENTS
DROP POLICY IF EXISTS "Usuários podem ver clientes da organização" ON public.clients;
DROP POLICY IF EXISTS "Usuários podem criar clientes na organização" ON public.clients;
DROP POLICY IF EXISTS "Usuários podem atualizar clientes da organização" ON public.clients;

CREATE POLICY "Usuários podem ver clientes da organização"
  ON public.clients FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Usuários podem criar clientes na organização"
  ON public.clients FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Usuários podem atualizar clientes da organização"
  ON public.clients FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

-- SERVICES
DROP POLICY IF EXISTS "Usuários podem ver serviços da organização" ON public.services;
DROP POLICY IF EXISTS "Usuários podem criar serviços na organização" ON public.services;
DROP POLICY IF EXISTS "Usuários podem atualizar serviços da organização" ON public.services;

CREATE POLICY "Usuários podem ver serviços da organização"
  ON public.services FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Usuários podem criar serviços na organização"
  ON public.services FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Usuários podem atualizar serviços da organização"
  ON public.services FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

-- TECHNICIANS
DROP POLICY IF EXISTS "Usuários podem ver técnicos da organização" ON public.technicians;
DROP POLICY IF EXISTS "Usuários podem criar técnicos na organização" ON public.technicians;
DROP POLICY IF EXISTS "Usuários podem atualizar técnicos da organização" ON public.technicians;

CREATE POLICY "Usuários podem ver técnicos da organização"
  ON public.technicians FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Usuários podem criar técnicos na organização"
  ON public.technicians FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

CREATE POLICY "Usuários podem atualizar técnicos da organização"
  ON public.technicians FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );

-- ORGANIZATION_MEMBERS (remover todas as políticas)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios membros" ON public.organization_members;
DROP POLICY IF EXISTS "Usuários podem ver membros de organizações que pertencem" ON public.organization_members;
DROP POLICY IF EXISTS "Admins podem gerenciar membros" ON public.organization_members;
DROP POLICY IF EXISTS "Admins podem adicionar membros" ON public.organization_members;

-- 2. Desabilitar RLS na tabela organization_members (se ainda estiver habilitado)
ALTER TABLE public.organization_members DISABLE ROW LEVEL SECURITY;

-- 3. Remover constraint unique se existir
ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_unique;

-- 4. Remover foreign keys
ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_organization_id_fkey;
ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey;

-- 5. Remover índices
DROP INDEX IF EXISTS idx_organization_members_org;
DROP INDEX IF EXISTS idx_organization_members_user;
DROP INDEX IF EXISTS idx_organization_members_active;

-- 6. Remover trigger se existir
DROP TRIGGER IF EXISTS update_organization_members_updated_at ON public.organization_members;

-- 7. Agora pode deletar a tabela
DROP TABLE IF EXISTS public.organization_members CASCADE;

