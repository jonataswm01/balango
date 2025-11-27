# Arquitetura Multi-Tenant - Balango v3

## 🎯 Objetivo

Permitir que múltiplas empresas/organizações usem o sistema de forma isolada, onde cada organização tem seus próprios dados (clientes, serviços, técnicos, configurações).

## 📊 Estrutura Proposta

### 1. **Tabela `organizations`** (Empresas)
Armazena informações das empresas/organizações.

**Campos:**
- `id` (UUID) - Identificador único
- `name` (TEXT) - Nome da empresa
- `slug` (TEXT) - Identificador único amigável (ex: "empresa-jaime")
- `document` (TEXT) - CNPJ
- `phone` (TEXT) - Telefone
- `email` (TEXT) - Email
- `address` (TEXT) - Endereço
- `logo_url` (TEXT) - URL do logo
- `active` (BOOLEAN) - Se está ativa
- `created_at`, `updated_at` (TIMESTAMP)

### 2. **Tabela `organization_members`** (Membros da Empresa)
Relaciona usuários com organizações e define permissões.

**Campos:**
- `id` (UUID) - Identificador único
- `organization_id` (UUID) - FK -> organizations
- `user_id` (UUID) - FK -> users
- `role` (TEXT) - Papel: 'owner', 'admin', 'member'
- `active` (BOOLEAN) - Se está ativo
- `created_at`, `updated_at` (TIMESTAMP)

**Roles:**
- `owner`: Dono da empresa (pode tudo)
- `admin`: Administrador (pode gerenciar membros e configurações)
- `member`: Membro (pode criar/editar serviços, clientes, técnicos)

### 3. **Modificações nas Tabelas Existentes**

Todas as tabelas de dados precisam ter `organization_id`:

- ✅ `app_settings` - Adicionar `organization_id`
- ✅ `clients` - Adicionar `organization_id`
- ✅ `services` - Adicionar `organization_id`
- ✅ `technicians` - Adicionar `organization_id`

## 🔐 Segurança (RLS)

Todas as políticas RLS devem filtrar por `organization_id`, garantindo que:
- Usuários só vejam dados da organização que pertencem
- Usuários só possam criar/editar dados da organização que pertencem

## 📋 Fluxo de Uso

1. **Criação de Organização:**
   - Usuário cria uma organização
   - Usuário automaticamente vira `owner` da organização

2. **Convite de Membros:**
   - Owner/Admin convida outros usuários
   - Usuário aceita convite e vira membro

3. **Seleção de Organização:**
   - Usuário pode pertencer a múltiplas organizações
   - Usuário seleciona qual organização está usando no momento
   - Todos os dados criados são associados à organização selecionada

## 🎨 Interface

- **Seletor de Organização** no header/sidebar
- **Página de Gerenciamento de Organizações** (criar, editar, convidar membros)
- **Página de Membros** (listar, editar roles, remover)

## ✅ Vantagens

1. **Isolamento Total**: Cada empresa vê apenas seus dados
2. **Multi-Usuário**: Vários usuários podem trabalhar na mesma empresa
3. **Escalável**: Fácil adicionar novas empresas
4. **Seguro**: RLS garante isolamento no banco de dados
5. **Flexível**: Usuário pode pertencer a múltiplas empresas

