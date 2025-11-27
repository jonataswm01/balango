-- ============================================
-- CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS DA TABELA USERS
-- ============================================

-- Remover política que causa recursão infinita
DROP POLICY IF EXISTS "Usuários podem ver membros ativos da mesma organização" ON public.users;

-- A política "Usuários podem ver seu próprio perfil" já permite que o usuário veja seu próprio registro
-- Não precisamos de uma política separada que cause recursão

-- Se precisar ver membros da organização, fazer via API com verificação de organização
-- ou criar uma view/função que não cause recursão

-- Garantir que a política de INSERT permite criar usuário sem organization_id inicialmente
-- (durante onboarding, o organization_id será NULL temporariamente)
DROP POLICY IF EXISTS "Sistema pode inserir novos usuários" ON public.users;

CREATE POLICY "Sistema pode inserir novos usuários"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Permitir UPDATE mesmo quando organization_id é NULL (durante onboarding)
-- A política de UPDATE já permite que o usuário atualize seu próprio perfil
-- Mas precisamos garantir que pode atualizar mesmo sem organization_id

-- A política existente "Usuários podem atualizar seu próprio perfil" já cobre isso
-- pois usa apenas auth.uid() = id, sem verificar organization_id

