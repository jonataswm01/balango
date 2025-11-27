-- ============================================
-- TABELAS BASE - ESTRUTURA MÍNIMA
-- Base limpa para criar novos sistemas
-- ============================================

-- ============================================
-- 1. TABELA USERS (Perfil Básico do Usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_telefone ON public.users(telefone);

-- ============================================
-- 2. FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at na tabela users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. TRIGGER: Criar registro em users quando novo usuário se registra
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_nome TEXT;
  user_telefone TEXT;
  telefone_final TEXT;
BEGIN
  -- Obter nome e telefone dos metadados do usuário
  user_nome := COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário');
  user_telefone := NEW.raw_user_meta_data->>'telefone';
  
  -- Se não houver telefone, criar um temporário único
  IF user_telefone IS NULL OR user_telefone = '' THEN
    telefone_final := 'temp_' || SUBSTRING(NEW.id::TEXT, 1, 8);
  ELSE
    -- Remover formatação do telefone
    telefone_final := REGEXP_REPLACE(user_telefone, '[^0-9]', '', 'g');
  END IF;
  
  -- Inserir na tabela users
  INSERT INTO public.users (
    id,
    email,
    nome,
    telefone
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    user_nome,
    telefone_final
  )
  ON CONFLICT (id) DO NOTHING; -- Evitar erro se já existir
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger no auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) - Políticas de Segurança
-- ============================================

-- Habilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
CREATE POLICY "Users podem ver seu próprio perfil"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users podem atualizar seu próprio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Sistema pode inserir novos usuários"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. COMENTÁRIOS (Documentação)
-- ============================================
COMMENT ON TABLE public.users IS 'Tabela base de perfis de usuários';

