-- ============================================
-- CORRIGIR FUNÇÃO is_organization_member
-- Atualiza para usar users.organization_id ao invés de organization_members
-- ============================================

-- Atualizar função para usar a nova estrutura (users.organization_id)
CREATE OR REPLACE FUNCTION public.is_organization_member(
  p_organization_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica se o usuário pertence à organização através de users.organization_id
  RETURN EXISTS (
    SELECT 1 
    FROM public.users
    WHERE id = p_user_id
    AND organization_id = p_organization_id
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário atualizado
COMMENT ON FUNCTION public.is_organization_member IS 'Verifica se um usuário pertence a uma organização. Usa users.organization_id ao invés de organization_members.';

