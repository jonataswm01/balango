# Correção de RLS para Tabela Organizations

## Problema

Erro ao criar organização: `new row violates row-level security policy for table "organizations"`

## Causa

As políticas RLS da tabela `organizations` não permitem que usuários sem `organization_id` (durante onboarding) criem ou vejam organizações.

## Solução

Execute a migration `013_fix_organizations_rls_policies.sql` no Supabase SQL Editor.

### Migration Completa

```sql
-- ============================================
-- CORRIGIR POLÍTICAS RLS DA TABELA ORGANIZATIONS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver sua organização" ON public.organizations;
DROP POLICY IF EXISTS "Usuários podem criar organizações" ON public.organizations;
DROP POLICY IF EXISTS "Admins podem atualizar organizações" ON public.organizations;

-- Política de SELECT: Permite ver organização própria ou recém-criada (durante onboarding)
CREATE POLICY "Usuários podem ver sua organização"
  ON public.organizations FOR SELECT
  USING (
    -- Ver organização do usuário (se já tiver organization_id)
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    -- OU se o usuário não tem organization_id ainda (durante onboarding)
    -- Permitir ver organizações criadas recentemente (últimas 10 minutos)
    OR (
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND (organization_id IS NULL OR onboarding_completo = false)
      )
      AND created_at > NOW() - INTERVAL '10 minutes'
    )
  );

-- Política de INSERT: Qualquer usuário autenticado pode criar
CREATE POLICY "Usuários autenticados podem criar organizações"
  ON public.organizations FOR INSERT
  WITH CHECK (true);

-- Política de UPDATE: Apenas admins podem atualizar
CREATE POLICY "Admins podem atualizar organizações"
  ON public.organizations FOR UPDATE
  USING (
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
  );
```

## Após Executar

1. ✅ Usuários poderão criar organizações durante onboarding
2. ✅ Usuários poderão ver organizações recém-criadas
3. ✅ Onboarding funcionará corretamente

## Nota

A política de SELECT permite ver organizações criadas nos últimos 10 minutos para usuários em onboarding. Após completar o onboarding, o usuário só verá sua própria organização através do `organization_id`.

