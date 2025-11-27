# Correção de Erros do Onboarding

## Problemas Identificados

1. **Recursão infinita na política RLS da tabela users**
2. **Bucket de storage "avatars" não encontrado**

## Soluções

### 1. Executar Migrations

Execute as seguintes migrations na ordem:

```bash
# No Supabase Dashboard > SQL Editor, execute:

1. supabase/migrations/011_fix_users_rls_recursion.sql
2. supabase/migrations/012_allow_null_organization_during_onboarding.sql
```

Ou execute diretamente no SQL Editor do Supabase:

#### Migration 011 - Corrigir Recursão RLS

```sql
-- Remover política que causa recursão infinita
DROP POLICY IF EXISTS "Usuários podem ver membros ativos da mesma organização" ON public.users;

DROP POLICY IF EXISTS "Sistema pode inserir novos usuários" ON public.users;

CREATE POLICY "Sistema pode inserir novos usuários"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### Migration 012 - Permitir organization_id NULL

```sql
-- Tornar organization_id nullable para permitir onboarding
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'organization_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.users 
      ALTER COLUMN organization_id DROP NOT NULL;
  END IF;
END $$;

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 2. Criar Bucket de Storage

Siga as instruções em `docs/STORAGE_SETUP.md` para criar o bucket `avatars` no Supabase Storage.

**Resumo rápido:**
1. Acesse Supabase Dashboard > Storage
2. Clique em "New bucket"
3. Nome: `avatars`
4. Marque como **público**
5. Crie o bucket

### 3. Configurar Políticas RLS do Storage (Opcional)

Se quiser restringir uploads, execute no SQL Editor:

```sql
-- Permitir leitura pública
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);
```

## Após Executar

1. ✅ Recursão infinita será resolvida
2. ✅ Upload de imagens funcionará
3. ✅ Onboarding poderá ser completado

## Nota

O sistema continuará funcionando mesmo se o bucket não existir, mas as imagens não serão salvas. O onboarding será completado normalmente, apenas sem as imagens.

