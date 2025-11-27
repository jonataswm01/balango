-- ============================================
-- GARANTIR QUE POLÍTICA DE INSERT FUNCIONA
-- Verificar e recriar se necessário
-- ============================================

-- Verificar se RLS está habilitado
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas de INSERT existentes
DROP POLICY IF EXISTS "Usuários podem criar organizações" ON public.organizations;
DROP POLICY IF EXISTS "Usuários autenticados podem criar organizações" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

-- Criar política de INSERT mais permissiva possível
-- Esta política permite que QUALQUER usuário autenticado crie uma organização
-- Usar TO authenticated garante que apenas usuários autenticados podem usar
CREATE POLICY "Allow authenticated users to create organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

