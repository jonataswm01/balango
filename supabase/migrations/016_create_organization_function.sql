-- ============================================
-- CRIAR FUNÇÃO PARA CRIAR ORGANIZAÇÃO (BYPASS RLS)
-- Esta função permite criar organização mesmo com RLS ativo
-- ============================================

-- Função para criar organização (usa SECURITY DEFINER para bypass RLS)
CREATE OR REPLACE FUNCTION public.create_organization(
  p_name TEXT,
  p_slug TEXT,
  p_document TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_logo_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  document TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  active BOOLEAN,
  onboarding_completo BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- Permite bypass do RLS
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_organization_id UUID;
BEGIN
  -- Verificar se usuário está autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Validar campos obrigatórios
  IF p_name IS NULL OR p_name = '' THEN
    RAISE EXCEPTION 'Nome da organização é obrigatório';
  END IF;

  IF p_slug IS NULL OR p_slug = '' THEN
    RAISE EXCEPTION 'Slug da organização é obrigatório';
  END IF;

  -- Verificar se slug já existe
  IF EXISTS (SELECT 1 FROM public.organizations WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'Slug já existe: %', p_slug;
  END IF;

  -- Criar organização
  INSERT INTO public.organizations (
    name,
    slug,
    document,
    phone,
    email,
    address,
    logo_url,
    active,
    onboarding_completo
  ) VALUES (
    p_name,
    p_slug,
    p_document,
    p_phone,
    p_email,
    p_address,
    p_logo_url,
    true,
    false -- Onboarding será marcado como completo após finalizar
  )
  RETURNING organizations.id INTO v_organization_id;

  -- Retornar organização criada
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.slug,
    o.document,
    o.phone,
    o.email,
    o.address,
    o.logo_url,
    o.active,
    o.onboarding_completo,
    o.created_at,
    o.updated_at
  FROM public.organizations o
  WHERE o.id = v_organization_id;
END;
$$;

-- Dar permissão para usuários autenticados usarem a função
GRANT EXECUTE ON FUNCTION public.create_organization TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization TO anon;

-- Comentário
COMMENT ON FUNCTION public.create_organization IS 'Cria uma nova organização. Bypassa RLS usando SECURITY DEFINER.';

