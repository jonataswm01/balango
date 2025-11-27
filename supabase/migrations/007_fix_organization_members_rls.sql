-- ============================================
-- CORRIGIR RLS DE ORGANIZATION_MEMBERS
-- Permite que usuários vejam seus próprios registros de membro
-- ============================================

-- Remover política antiga
DROP POLICY IF EXISTS "Usuários podem ver membros de organizações que pertencem" ON public.organization_members;

-- Criar nova política que permite ver próprio registro
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

-- Política para INSERT (usuários podem se adicionar se forem admin)
CREATE POLICY "Admins podem adicionar membros"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
      AND om.active = true
    )
  );

