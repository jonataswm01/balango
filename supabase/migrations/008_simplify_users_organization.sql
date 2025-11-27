-- ============================================
-- SIMPLIFICAR: Adicionar organization_id e role na tabela users
-- Remove a necessidade da tabela organization_members
-- ============================================

-- 1. Adicionar colunas organization_id, role e active na tabela users
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 2. Migrar dados de organization_members para users
-- Pegar a primeira organização de cada usuário (se houver múltiplas, pega a primeira)
UPDATE public.users u
SET 
  organization_id = (
    SELECT organization_id 
    FROM public.organization_members om
    WHERE om.user_id = u.id
    AND om.active = true
    ORDER BY om.created_at ASC
    LIMIT 1
  ),
  role = (
    SELECT role 
    FROM public.organization_members om
    WHERE om.user_id = u.id
    AND om.active = true
    ORDER BY om.created_at ASC
    LIMIT 1
  ),
  active = COALESCE((
    SELECT active 
    FROM public.organization_members om
    WHERE om.user_id = u.id
    AND om.active = true
    ORDER BY om.created_at ASC
    LIMIT 1
  ), true)
WHERE EXISTS (
  SELECT 1 
  FROM public.organization_members om
  WHERE om.user_id = u.id
  AND om.active = true
);

-- 3. Se algum usuário não tem organização, atribuir à organização padrão
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Buscar organização padrão
  SELECT id INTO default_org_id 
  FROM public.organizations 
  WHERE slug = 'default-organization' 
  LIMIT 1;
  
  -- Se não existe, criar
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug, active)
    VALUES ('Organização Padrão', 'default-organization', true)
    RETURNING id INTO default_org_id;
  END IF;
  
  -- Atribuir usuários sem organização à organização padrão como admin e ativo
  UPDATE public.users
  SET organization_id = default_org_id, role = 'admin', active = true
  WHERE organization_id IS NULL;
END $$;

-- 4. Tornar organization_id NOT NULL
ALTER TABLE public.users 
  ALTER COLUMN organization_id SET NOT NULL;

-- 5. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_organization ON public.users(organization_id);

-- 6. Remover políticas RLS antigas de organization_members
DROP POLICY IF EXISTS "Usuários podem ver seus próprios membros" ON public.organization_members;
DROP POLICY IF EXISTS "Usuários podem ver membros de organizações que pertencem" ON public.organization_members;
DROP POLICY IF EXISTS "Admins podem gerenciar membros" ON public.organization_members;
DROP POLICY IF EXISTS "Admins podem adicionar membros" ON public.organization_members;

-- 7. Atualizar políticas RLS das outras tabelas para usar users.organization_id
-- ORGANIZATIONS
DROP POLICY IF EXISTS "Usuários podem ver organizações que são membros" ON public.organizations;
CREATE POLICY "Usuários podem ver sua organização"
  ON public.organizations FOR SELECT
  USING (
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- APP_SETTINGS
DROP POLICY IF EXISTS "Usuários podem ver configurações da organização" ON public.app_settings;
DROP POLICY IF EXISTS "Usuários podem inserir configurações da organização" ON public.app_settings;
DROP POLICY IF EXISTS "Admins podem atualizar configurações" ON public.app_settings;

CREATE POLICY "Usuários podem ver configurações da organização"
  ON public.app_settings FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Usuários podem inserir configurações da organização"
  ON public.app_settings FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins podem atualizar configurações"
  ON public.app_settings FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- CLIENTS
DROP POLICY IF EXISTS "Usuários podem ver clientes da organização" ON public.clients;
DROP POLICY IF EXISTS "Usuários podem criar clientes na organização" ON public.clients;
DROP POLICY IF EXISTS "Usuários podem atualizar clientes da organização" ON public.clients;

CREATE POLICY "Usuários podem ver clientes da organização"
  ON public.clients FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Usuários podem criar clientes na organização"
  ON public.clients FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Usuários podem atualizar clientes da organização"
  ON public.clients FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- SERVICES
DROP POLICY IF EXISTS "Usuários podem ver serviços da organização" ON public.services;
DROP POLICY IF EXISTS "Usuários podem criar serviços na organização" ON public.services;
DROP POLICY IF EXISTS "Usuários podem atualizar serviços da organização" ON public.services;

CREATE POLICY "Usuários podem ver serviços da organização"
  ON public.services FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Usuários podem criar serviços na organização"
  ON public.services FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Usuários podem atualizar serviços da organização"
  ON public.services FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- TECHNICIANS
DROP POLICY IF EXISTS "Usuários podem ver técnicos da organização" ON public.technicians;
DROP POLICY IF EXISTS "Usuários podem criar técnicos na organização" ON public.technicians;
DROP POLICY IF EXISTS "Usuários podem atualizar técnicos da organização" ON public.technicians;

CREATE POLICY "Usuários podem ver técnicos da organização"
  ON public.technicians FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Usuários podem criar técnicos na organização"
  ON public.technicians FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Usuários podem atualizar técnicos da organização"
  ON public.technicians FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  );

-- 8. Adicionar política RLS na tabela users para permitir ver usuários da mesma organização
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Users podem atualizar seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Sistema pode inserir novos usuários" ON public.users;

CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem ver membros ativos da mesma organização"
  ON public.users FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND active = true
  );

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins podem atualizar roles de membros"
  ON public.users FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Sistema pode inserir novos usuários"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 9. Criar índice para active
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(active);

-- 10. Comentários
COMMENT ON COLUMN public.users.organization_id IS 'Organização à qual o usuário pertence';
COMMENT ON COLUMN public.users.role IS 'Papel do usuário na organização: admin ou member';
COMMENT ON COLUMN public.users.active IS 'Se o usuário está ativo na organização';

-- NOTA: A tabela organization_members pode ser removida depois de verificar que tudo está funcionando
-- DROP TABLE IF EXISTS public.organization_members;

