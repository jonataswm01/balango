-- ============================================
-- TABELA APP_SETTINGS
-- Configurações gerais da aplicação
-- ============================================

-- Criar tabela app_settings se não existir
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value NUMERIC NOT NULL,
  description TEXT
);

-- Habilitar RLS na tabela app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver (para evitar conflitos)
DROP POLICY IF EXISTS "Usuários autenticados podem ver configurações" ON public.app_settings;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir configurações" ON public.app_settings;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar configurações" ON public.app_settings;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar configurações" ON public.app_settings;

-- Política: Usuários autenticados podem ver todas as configurações
CREATE POLICY "Usuários autenticados podem ver configurações"
  ON public.app_settings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: Usuários autenticados podem inserir configurações
CREATE POLICY "Usuários autenticados podem inserir configurações"
  ON public.app_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Usuários autenticados podem atualizar configurações
CREATE POLICY "Usuários autenticados podem atualizar configurações"
  ON public.app_settings FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Usuários autenticados podem deletar configurações
CREATE POLICY "Usuários autenticados podem deletar configurações"
  ON public.app_settings FOR DELETE
  USING (auth.role() = 'authenticated');

