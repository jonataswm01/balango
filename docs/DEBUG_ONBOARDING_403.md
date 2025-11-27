# Debug: Erro 403 ao Criar Organização

## Possíveis Causas

1. **Usuário não está autenticado**
2. **Políticas RLS ainda bloqueando**
3. **Função RPC não foi criada**

## Passos de Debug

### 1. Verificar se usuário está autenticado

No console do navegador, execute:

```javascript
// Verificar sessão
const { data: { session } } = await supabase.auth.getSession()
console.log('Sessão:', session)

// Verificar usuário
const { data: { user } } = await supabase.auth.getUser()
console.log('Usuário:', user)
```

Se `session` ou `user` for `null`, o problema é autenticação.

### 2. Verificar políticas RLS existentes

No Supabase SQL Editor, execute:

```sql
-- Ver todas as políticas da tabela organizations
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'organizations';
```

### 3. Testar criação direta

No Supabase SQL Editor (como usuário autenticado), execute:

```sql
-- Verificar seu user_id
SELECT auth.uid() as current_user_id;

-- Tentar criar organização (substitua os valores)
INSERT INTO public.organizations (name, slug, active)
VALUES ('Teste', 'teste-' || gen_random_uuid()::text, true)
RETURNING *;
```

Se der erro, o problema é RLS.

### 4. Verificar se função RPC existe

```sql
-- Verificar se função existe
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'create_organization';
```

### 5. Testar função RPC

```sql
-- Testar função
SELECT * FROM public.create_organization(
  'Teste Org',
  'teste-org-' || gen_random_uuid()::text,
  NULL, NULL, NULL, NULL, NULL
);
```

## Soluções

### Solução 1: Executar Migration 016 (Recomendado)

Execute `016_create_organization_function.sql` que cria uma função que bypassa RLS.

### Solução 2: Desabilitar RLS temporariamente (Apenas para teste)

```sql
-- ⚠️ ATENÇÃO: Isso remove segurança! Use apenas para debug
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
```

**NÃO deixe isso em produção!**

### Solução 3: Verificar autenticação no código

Adicione logs no código do onboarding:

```typescript
// Antes de criar organização
const { data: { user }, error: authError } = await supabase.auth.getUser()
console.log('User antes de criar org:', user)
console.log('Auth error:', authError)

if (!user) {
  console.error('Usuário não autenticado!')
  return
}
```

## Checklist

- [ ] Usuário está autenticado?
- [ ] Migration 016 foi executada?
- [ ] Função `create_organization` existe?
- [ ] Políticas RLS estão corretas?
- [ ] Testou criação direta no SQL Editor?

