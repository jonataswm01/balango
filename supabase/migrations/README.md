# Migrations do Supabase

Este diretório contém as migrations SQL para criar a estrutura base mínima do sistema.

## Estrutura das Tabelas

### 1. `users`
Tabela base de perfis de usuários com apenas os dados essenciais:
- **id**: UUID (referência ao auth.users)
- **email**: Email do usuário
- **nome**: Nome completo
- **telefone**: Telefone único
- **avatar_url**: URL da foto de perfil (opcional)
- **created_at**: Data de criação
- **updated_at**: Data de última atualização

Esta é uma estrutura mínima e limpa, sem vínculos com sistemas antigos, pronta para você criar novas funcionalidades conforme necessário.

## Como Aplicar as Migrations

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo do arquivo `001_base_tables.sql`
5. Clique em **Run** para executar

### Opção 2: Via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
# Aplicar migrations
supabase db push

# Ou aplicar um arquivo específico
supabase db execute -f supabase/migrations/001_base_tables.sql
```

### Opção 3: Via psql (PostgreSQL direto)

```bash
psql -h [seu-host] -U postgres -d postgres -f supabase/migrations/001_base_tables.sql
```

## Funcionalidades Incluídas

### Triggers Automáticos

1. **handle_new_user()**: Cria automaticamente um registro na tabela `users` quando um novo usuário se registra no Supabase Auth
2. **update_updated_at_column()**: Atualiza automaticamente o campo `updated_at` na tabela users

### Segurança (RLS)

A tabela `users` tem Row Level Security (RLS) habilitado, garantindo que:
- Usuários só podem ver/editar seus próprios dados
- Políticas de segurança aplicadas automaticamente

## Verificação

Após aplicar a migration, verifique se a tabela foi criada:

```sql
-- Verificar tabela
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verificar funções
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'update_updated_at_column');
```

## Notas Importantes

- O trigger `handle_new_user` cria automaticamente o registro na tabela `users` quando um novo usuário se registra
- Se o telefone não for fornecido no cadastro, será criado um telefone temporário único
- A tabela tem timestamps `created_at` e `updated_at` automáticos
- Esta é uma estrutura base limpa, sem vínculos com sistemas antigos
- Você pode adicionar novas tabelas e funcionalidades conforme necessário para seus novos projetos

