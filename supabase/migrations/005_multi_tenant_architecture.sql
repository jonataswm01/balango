-- ============================================
-- ARQUITETURA MULTI-TENANT - BALANGO v3
-- Sistema de Organizações/Empresas
-- ============================================

-- ============================================
-- 1. TABELA ORGANIZATIONS (Empresas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- Identificador único amigável (ex: "empresa-jaime")
  document TEXT, -- CNPJ
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON public.organizations(active);

-- ============================================
-- 2. TABELA ORGANIZATION_MEMBERS (Membros)
-- ============================================
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT organization_members_unique UNIQUE (organization_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_organization_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_active ON public.organization_members(active);

-- ============================================
-- 3. ADICIONAR organization_id NAS TABELAS EXISTENTES
-- ============================================

-- APP_SETTINGS
-- Primeiro, adicionar coluna como nullable
ALTER TABLE public.app_settings 
  ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Criar uma organização padrão para dados existentes (se houver)
-- Nota: Isso cria uma organização "Default" para migrar dados existentes
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Verificar se já existe uma organização padrão
  SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'default-organization' LIMIT 1;
  
  -- Se não existe, criar
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug, active)
    VALUES ('Organização Padrão', 'default-organization', true)
    RETURNING id INTO default_org_id;
  END IF;
  
  -- Atualizar todos os registros existentes com NULL para usar a organização padrão
  UPDATE public.app_settings 
  SET organization_id = default_org_id 
  WHERE organization_id IS NULL;
END $$;

-- Agora tornar a coluna NOT NULL e adicionar foreign key
ALTER TABLE public.app_settings 
  ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.app_settings 
  ADD CONSTRAINT app_settings_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Remover constraint de PK antiga e criar nova com organization_id
ALTER TABLE public.app_settings 
  DROP CONSTRAINT IF EXISTS app_settings_pkey;

ALTER TABLE public.app_settings 
  ADD CONSTRAINT app_settings_pkey PRIMARY KEY (key, organization_id);

CREATE INDEX IF NOT EXISTS idx_app_settings_org ON public.app_settings(organization_id);

-- CLIENTS
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Atualizar registros existentes
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'default-organization' LIMIT 1;
  IF default_org_id IS NOT NULL THEN
    UPDATE public.clients SET organization_id = default_org_id WHERE organization_id IS NULL;
  END IF;
END $$;

ALTER TABLE public.clients 
  ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.clients 
  ADD CONSTRAINT clients_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_clients_org ON public.clients(organization_id);

-- SERVICES
ALTER TABLE public.services 
  ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Atualizar registros existentes
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'default-organization' LIMIT 1;
  IF default_org_id IS NOT NULL THEN
    UPDATE public.services SET organization_id = default_org_id WHERE organization_id IS NULL;
  END IF;
END $$;

ALTER TABLE public.services 
  ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.services 
  ADD CONSTRAINT services_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_services_org ON public.services(organization_id);

-- TECHNICIANS
ALTER TABLE public.technicians 
  ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Atualizar registros existentes
DO $$
DECLARE
  default_org_id UUID;
BEGIN
  SELECT id INTO default_org_id FROM public.organizations WHERE slug = 'default-organization' LIMIT 1;
  IF default_org_id IS NOT NULL THEN
    UPDATE public.technicians SET organization_id = default_org_id WHERE organization_id IS NULL;
  END IF;
END $$;

ALTER TABLE public.technicians 
  ALTER COLUMN organization_id SET NOT NULL;

ALTER TABLE public.technicians 
  ADD CONSTRAINT technicians_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_technicians_org ON public.technicians(organization_id);

-- ============================================
-- 4. TRIGGERS PARA updated_at
-- ============================================

-- Trigger para organizations
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para organization_members
CREATE TRIGGER update_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- ORGANIZATIONS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver organizações que são membros"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

CREATE POLICY "Usuários podem criar organizações"
  ON public.organizations FOR INSERT
  WITH CHECK (true); -- Qualquer usuário autenticado pode criar

CREATE POLICY "Admins podem atualizar organizações"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role = 'admin'
      AND organization_members.active = true
    )
  );

-- ORGANIZATION_MEMBERS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios membros"
  ON public.organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.active = true
    )
  );

CREATE POLICY "Admins podem gerenciar membros"
  ON public.organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
      AND om.active = true
    )
  );

-- APP_SETTINGS
DROP POLICY IF EXISTS "Usuários autenticados podem ver configurações" ON public.app_settings;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir configurações" ON public.app_settings;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar configurações" ON public.app_settings;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar configurações" ON public.app_settings;

CREATE POLICY "Usuários podem ver configurações da organização"
  ON public.app_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = app_settings.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

CREATE POLICY "Usuários podem inserir configurações da organização"
  ON public.app_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = app_settings.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

CREATE POLICY "Admins podem atualizar configurações"
  ON public.app_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = app_settings.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role = 'admin'
      AND organization_members.active = true
    )
  );

-- CLIENTS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver clientes da organização"
  ON public.clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = clients.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

CREATE POLICY "Usuários podem criar clientes na organização"
  ON public.clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = clients.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

CREATE POLICY "Usuários podem atualizar clientes da organização"
  ON public.clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = clients.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

-- SERVICES
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver serviços da organização"
  ON public.services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = services.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

CREATE POLICY "Usuários podem criar serviços na organização"
  ON public.services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = services.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

CREATE POLICY "Usuários podem atualizar serviços da organização"
  ON public.services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = services.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

-- TECHNICIANS
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver técnicos da organização"
  ON public.technicians FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = technicians.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

CREATE POLICY "Usuários podem criar técnicos na organização"
  ON public.technicians FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = technicians.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

CREATE POLICY "Usuários podem atualizar técnicos da organização"
  ON public.technicians FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = technicians.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.active = true
    )
  );

-- ============================================
-- 6. FUNÇÃO AUXILIAR: Verificar se usuário é membro
-- ============================================
CREATE OR REPLACE FUNCTION public.is_organization_member(
  p_organization_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_organization_id
    AND user_id = p_user_id
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. COMENTÁRIOS (Documentação)
-- ============================================
COMMENT ON TABLE public.organizations IS 'Tabela de empresas/organizações';
COMMENT ON TABLE public.organization_members IS 'Relacionamento entre usuários e organizações com roles';
COMMENT ON COLUMN public.organization_members.role IS 'Papel do usuário: admin, member';

