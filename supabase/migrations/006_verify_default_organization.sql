-- ============================================
-- VERIFICAR E CRIAR ORGANIZAÇÃO PADRÃO
-- Execute este script se a organização padrão não foi criada
-- ============================================

-- Verificar se organização padrão existe
DO $$
DECLARE
  default_org_id UUID;
  user_count INTEGER;
BEGIN
  -- Verificar se já existe
  SELECT id INTO default_org_id 
  FROM public.organizations 
  WHERE slug = 'default-organization' 
  LIMIT 1;
  
  -- Se não existe, criar
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug, active)
    VALUES ('Organização Padrão', 'default-organization', true)
    RETURNING id INTO default_org_id;
    
    RAISE NOTICE 'Organização padrão criada com ID: %', default_org_id;
  ELSE
    RAISE NOTICE 'Organização padrão já existe com ID: %', default_org_id;
  END IF;
  
  -- Contar usuários
  SELECT COUNT(*) INTO user_count FROM public.users;
  
  -- Adicionar todos os usuários existentes como admin da organização padrão
  IF user_count > 0 THEN
    INSERT INTO public.organization_members (organization_id, user_id, role, active)
    SELECT default_org_id, id, 'admin', true
    FROM public.users
    WHERE id NOT IN (
      SELECT user_id 
      FROM public.organization_members 
      WHERE organization_id = default_org_id
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE
    SET role = 'admin', active = true;
    
    RAISE NOTICE 'Usuários adicionados à organização padrão';
  END IF;
END $$;

