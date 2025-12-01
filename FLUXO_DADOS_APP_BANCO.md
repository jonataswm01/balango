# 🔄 Fluxo Completo de Dados: App → Banco de Dados

**Documentação completa da lógica entre o frontend e o banco de dados PostgreSQL (Supabase)**

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral)
2. [Tabelas do Banco de Dados](#tabelas)
3. [Funções do Banco de Dados](#funções)
4. [Triggers e Automações](#triggers)
5. [Políticas RLS (Row Level Security)](#rls)
6. [Fluxos Detalhados por Operação](#fluxos)
7. [Diagrama de Fluxo](#diagrama)

---

## 🏗️ Visão Geral da Arquitetura {#visão-geral}

### **Arquitetura Multi-Tenant**

O sistema utiliza uma arquitetura **multi-tenant** onde:
- Cada **organização** é isolada
- Todos os dados (clientes, técnicos, serviços) pertencem a uma organização
- Usuários pertencem a uma organização através do campo `organization_id` na tabela `users`
- **RLS (Row Level Security)** garante que usuários só vejam dados da sua organização

### **Fluxo Geral**

```
Frontend (React/Next.js)
    ↓
API Route (Next.js Server)
    ↓
Supabase Client (Autenticação + Query)
    ↓
PostgreSQL (com RLS)
    ↓
Tabela de Dados
```

---

## 📊 Tabelas do Banco de Dados {#tabelas}

### **1. `auth.users` (Supabase Auth)**
Tabela gerenciada pelo Supabase Auth. Contém:
- `id` (UUID) - ID único do usuário
- `email` - Email do usuário
- `raw_user_meta_data` - Metadados (nome, telefone, etc.)

### **2. `public.users`**
Perfil estendido do usuário.

**Campos principais:**
- `id` (UUID) - Referência a `auth.users(id)`
- `email` (TEXT) - Email
- `nome` (TEXT) - Nome completo
- `telefone` (TEXT) - Telefone único
- `avatar_url` (TEXT) - URL do avatar
- `organization_id` (UUID) - **Organização do usuário**
- `role` (TEXT) - 'admin' ou 'member'
- `active` (BOOLEAN) - Se o usuário está ativo
- `created_at`, `updated_at` - Timestamps

**Relacionamentos:**
- `id` → `auth.users(id)` (FK)
- `organization_id` → `organizations(id)` (FK)

### **3. `public.organizations`**
Organizações/empresas do sistema.

**Campos principais:**
- `id` (UUID) - ID único
- `name` (TEXT) - Nome da organização
- `slug` (TEXT) - Slug único (URL-friendly)
- `document` (TEXT) - CNPJ/CPF
- `phone`, `email`, `address` - Contatos
- `logo_url` (TEXT) - URL do logo
- `active` (BOOLEAN) - Se está ativa
- `onboarding_completo` (BOOLEAN) - Se completou onboarding
- `created_at`, `updated_at` - Timestamps

### **4. `public.clients`**
Clientes da organização.

**Campos principais:**
- `id` (UUID) - ID único
- `name` (TEXT) - Nome do cliente
- `phone`, `email`, `document`, `address` - Dados de contato
- `active` (BOOLEAN) - Se está ativo
- `organization_id` (UUID) - **Organização dona do cliente**
- `created_at`, `updated_at` - Timestamps

**Relacionamentos:**
- `organization_id` → `organizations(id)` (FK)

### **5. `public.technicians`**
Técnicos da organização.

**Campos principais:**
- `id` (UUID) - ID único
- `name` (TEXT) - Nome completo
- `nickname` (TEXT) - Apelido
- `phone`, `email`, `document` - Dados de contato
- `active` (BOOLEAN) - Se está ativo
- `organization_id` (UUID) - **Organização dona do técnico**
- `created_at`, `updated_at` - Timestamps

**Relacionamentos:**
- `organization_id` → `organizations(id)` (FK)

### **6. `public.services`**
Serviços prestados.

**Campos principais:**
- `id` (UUID) - ID único
- `date` (DATE) - Data do serviço
- `description` (TEXT) - Descrição
- `status` (TEXT) - 'pendente', 'em_andamento', 'concluido', 'cancelado'
- `priority` (TEXT) - 'baixa', 'media', 'alta'
- `technician_id` (UUID) - **Técnico responsável**
- `client_id` (UUID) - **Cliente**
- `gross_value` (NUMERIC) - Valor bruto
- `operational_cost` (NUMERIC) - Custo operacional
- `tax_amount` (NUMERIC) - Valor do imposto
- `has_invoice` (BOOLEAN) - Se tem nota fiscal
- `invoice_number` (TEXT) - Número da NF
- `payment_status` (TEXT) - 'pendente', 'pago', 'atrasado'
- `payment_method`, `payment_date` - Dados de pagamento
- `location`, `notes` - Informações adicionais
- `estimated_hours`, `actual_hours` - Horas estimadas/reais
- `start_date`, `completed_date` - Datas de início/término
- `contact_phone`, `contact_email` - Contatos
- `organization_id` (UUID) - **Organização dona do serviço**
- `created_at`, `updated_at` - Timestamps

**Relacionamentos:**
- `technician_id` → `technicians(id)` (FK)
- `client_id` → `clients(id)` (FK)
- `organization_id` → `organizations(id)` (FK)

### **7. `public.app_settings`**
Configurações da organização.

**Campos principais:**
- `key` (TEXT) - Chave da configuração (ex: 'tax_rate')
- `value` (NUMERIC) - Valor da configuração
- `description` (TEXT) - Descrição
- `organization_id` (UUID) - **Organização**
- **Primary Key:** `(key, organization_id)` - Chave composta

**Relacionamentos:**
- `organization_id` → `organizations(id)` (FK)

---

## 🔧 Funções do Banco de Dados {#funções}

### **1. `create_organization()`**
**Tipo:** `SECURITY DEFINER` (bypass RLS)

**Parâmetros:**
- `p_name` (TEXT) - Nome da organização
- `p_slug` (TEXT) - Slug único
- `p_document` (TEXT, opcional) - CNPJ/CPF
- `p_phone`, `p_email`, `p_address`, `p_logo_url` (opcionais)

**Retorno:** Tabela com dados da organização criada

**O que faz:**
1. Verifica se usuário está autenticado (`auth.uid()`)
2. Valida campos obrigatórios (nome, slug)
3. Verifica se slug já existe
4. Cria organização com `active=true` e `onboarding_completo=false`
5. Retorna dados da organização criada

**Uso:** Chamada via `supabase.rpc('create_organization', {...})` no onboarding

---

### **2. `handle_new_user()`**
**Tipo:** `TRIGGER FUNCTION` (executada automaticamente)

**Parâmetros:** Nenhum (usa `NEW` do trigger)

**Retorno:** `TRIGGER`

**O que faz:**
1. Executada **automaticamente** quando um novo usuário se registra em `auth.users`
2. Extrai `name` e `telefone` de `raw_user_meta_data`
3. Se não houver telefone, cria um temporário único
4. Insere registro na tabela `public.users` com:
   - `id` = ID do usuário do auth
   - `email` = Email do auth
   - `nome` = Do metadados ou 'Usuário'
   - `telefone` = Do metadados ou temporário
5. Usa `ON CONFLICT DO NOTHING` para evitar erros

**Trigger:** `on_auth_user_created` em `auth.users` (AFTER INSERT)

---

### **3. `is_organization_member()`**
**Tipo:** `SECURITY DEFINER`

**Parâmetros:**
- `p_organization_id` (UUID) - ID da organização
- `p_user_id` (UUID, opcional) - ID do usuário (padrão: `auth.uid()`)

**Retorno:** `BOOLEAN`

**O que faz:**
1. Verifica se usuário pertence à organização
2. Consulta tabela `users` verificando `users.organization_id`
3. Retorna `true` se usuário é membro ativo (`active = true`)

**Nota:** Atualizada na migração 018 para usar `users.organization_id` ao invés da tabela removida `organization_members`.

---

### **4. `update_updated_at_column()`**
**Tipo:** `TRIGGER FUNCTION`

**Parâmetros:** Nenhum (usa `NEW` do trigger)

**Retorno:** `TRIGGER`

**O que faz:**
1. Atualiza automaticamente o campo `updated_at` para `NOW()`
2. Executada antes de UPDATE em várias tabelas

**Triggers:**
- `update_users_updated_at` em `users`
- `update_clients_updated_at` em `clients`
- `update_technicians_updated_at` em `technicians`
- `update_services_updated_at` em `services`
- `update_organizations_updated_at` em `organizations`

---

## ⚡ Triggers e Automações {#triggers}

### **1. Trigger: `on_auth_user_created`**
**Tabela:** `auth.users`  
**Evento:** `AFTER INSERT`  
**Função:** `handle_new_user()`

**Fluxo:**
```
Usuário se registra no Supabase Auth
    ↓
Trigger dispara automaticamente
    ↓
handle_new_user() executa
    ↓
Cria registro em public.users
```

### **2. Triggers: `update_*_updated_at`**
**Tabelas:** `users`, `clients`, `technicians`, `services`, `organizations`  
**Evento:** `BEFORE UPDATE`  
**Função:** `update_updated_at_column()`

**Fluxo:**
```
UPDATE em qualquer tabela
    ↓
Trigger dispara antes do UPDATE
    ↓
update_updated_at_column() executa
    ↓
NEW.updated_at = NOW()
    ↓
UPDATE prossegue com updated_at atualizado
```

---

## 🔒 Políticas RLS (Row Level Security) {#rls}

### **Princípio Geral**
Todas as tabelas têm RLS habilitado. As políticas garantem que:
- Usuários só vejam dados da **sua organização**
- Usuários só possam **criar/editar** dados da sua organização
- Apenas **admins** podem fazer certas operações

### **Políticas por Tabela**

#### **`users`**
- **SELECT:** Usuário pode ver seu próprio perfil
- **UPDATE:** Usuário pode atualizar seu próprio perfil
- **INSERT:** Sistema pode inserir (via trigger)

#### **`organizations`**
- **SELECT:** Usuários podem ver organizações que pertencem
- **UPDATE:** Apenas admins da organização podem atualizar
- **INSERT:** Via função `create_organization()` (bypass RLS)

#### **`clients`**
- **SELECT:** Usuários podem ver clientes da organização
- **INSERT:** Usuários podem criar clientes na organização
- **UPDATE:** Usuários podem atualizar clientes da organização

#### **`technicians`**
- **SELECT:** Usuários podem ver técnicos da organização
- **INSERT:** Usuários podem criar técnicos na organização
- **UPDATE:** Usuários podem atualizar técnicos da organização

#### **`services`**
- **SELECT:** Usuários podem ver serviços da organização
- **INSERT:** Usuários podem criar serviços na organização
- **UPDATE:** Usuários podem atualizar serviços da organização

#### **`app_settings`**
- **SELECT:** Usuários podem ver configurações da organização
- **INSERT:** Usuários podem inserir configurações da organização
- **UPDATE:** Apenas admins podem atualizar configurações

**Padrão das Políticas:**
```sql
USING (
  organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
  AND (SELECT active FROM public.users WHERE id = auth.uid()) = true
)
```

---

## 🔄 Fluxos Detalhados por Operação {#fluxos}

### **1. Criar Novo Usuário (Cadastro)**

#### **Frontend → API**
```
app/(auth)/cadastro/page.tsx
    ↓
supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name, telefone }
  }
})
```

#### **Supabase Auth**
```
auth.users (INSERT)
    ↓
Trigger: on_auth_user_created
    ↓
handle_new_user() executa
    ↓
public.users (INSERT)
```

#### **Dados Criados:**
- **`auth.users`:** ID, email, senha (hash), metadados
- **`public.users`:** ID, email, nome, telefone, `organization_id=NULL` (inicialmente)

#### **Código Relevante:**
```typescript
// app/(auth)/cadastro/page.tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
    data: {
      name: name,
      telefone: telefone.replace(/\D/g, ""),
    },
  },
})
```

---

### **2. Criar Organização (Onboarding)**

#### **Frontend → API**
```
app/(privado)/onboarding/page.tsx
    ↓
supabase.rpc('create_organization', {
  p_name, p_slug, p_document, ...
})
```

#### **Banco de Dados**
```
create_organization() executa (SECURITY DEFINER)
    ↓
Validações (nome, slug único)
    ↓
organizations (INSERT)
    ↓
Retorna organização criada
```

#### **Atualização do Usuário**
```
organizations criada
    ↓
users.organization_id = organization.id
    ↓
users.role = 'admin' (primeiro usuário)
```

#### **Dados Criados:**
- **`organizations`:** ID, name, slug, document, etc., `onboarding_completo=false`
- **`users`:** `organization_id` atualizado, `role='admin'`

#### **Código Relevante:**
```typescript
// app/(privado)/onboarding/page.tsx
const { data: rpcData, error: rpcError } = await supabase.rpc('create_organization', {
  p_name: nomeOrganizacao.trim(),
  p_slug: slugOrganizacao.trim(),
  p_document: cnpj.trim() || null,
  // ...
})

// Depois atualiza o usuário
await supabase
  .from('users')
  .update({ organization_id: organization.id, role: 'admin' })
  .eq('id', user.id)
```

---

### **3. Criar Novo Serviço**

#### **Frontend → API Route**
```
components/services/service-modal.tsx
    ↓
handleSubmit()
    ↓
servicesApi.create(formData)
    ↓
lib/api/client.ts → request('/services', { method: 'POST' })
    ↓
app/api/services/route.ts → POST()
```

#### **API Route → Validação**
```
app/api/services/route.ts
    ↓
1. Verifica autenticação (supabase.auth.getUser())
    ↓
2. Valida dados (validateServiceInsert())
    ↓
3. Verifica se cliente existe
    ↓
4. Verifica se técnico existe
    ↓
5. Busca organization_id do usuário (getUserOrganizationId())
```

#### **Preparação dos Dados**
```
lib/api/services.ts → prepareServiceInsert()
    ↓
1. Aplica valores padrão:
   - status = 'pendente'
   - priority = 'media'
   - operational_cost = 0
    ↓
2. Calcula tax_amount:
   - Busca tax_rate em app_settings
   - Se has_invoice = true: tax_amount = gross_value * tax_rate
   - Se não: tax_amount = 0
    ↓
3. Adiciona organization_id
```

#### **Inserção no Banco**
```
supabase.from('services').insert(preparedData)
    ↓
RLS verifica: organization_id do serviço = organization_id do usuário
    ↓
services (INSERT)
    ↓
Trigger: update_services_updated_at (BEFORE UPDATE não dispara em INSERT)
    ↓
Retorna serviço criado com relacionamentos (client, technician)
```

#### **Dados Criados:**
- **`services`:** Todos os campos do serviço, incluindo:
  - `organization_id` (da organização do usuário)
  - `tax_amount` (calculado automaticamente)
  - `status = 'pendente'`
  - `payment_status = 'pendente'`

#### **Código Relevante:**
```typescript
// app/api/services/route.ts
const body: ServiceInsert = await request.json()
const validation = validateServiceInsert(body)
const organizationId = await getUserOrganizationId(supabase)
const preparedData = await prepareServiceInsert(body, supabase)
preparedData.organization_id = organizationId

const { data: service, error } = await supabase
  .from('services')
  .insert(preparedData)
  .select(`
    *,
    clients:client_id (id, name, email, phone),
    technicians:technician_id (id, name, nickname, email, phone)
  `)
  .single()
```

---

### **4. Criar Novo Cliente**

#### **Frontend → API Route**
```
components/clients/client-modal.tsx
    ↓
clientsApi.create(formData)
    ↓
app/api/clients/route.ts → POST()
```

#### **API Route → Validação**
```
app/api/clients/route.ts
    ↓
1. Verifica autenticação
    ↓
2. Valida nome (obrigatório)
    ↓
3. Busca organization_id do usuário
```

#### **Inserção no Banco**
```
clientData = {
  ...body,
  active: true (padrão),
  organization_id: organizationId
}
    ↓
supabase.from('clients').insert(clientData)
    ↓
RLS verifica: organization_id do cliente = organization_id do usuário
    ↓
clients (INSERT)
    ↓
Retorna cliente criado
```

#### **Dados Criados:**
- **`clients`:** name, phone, email, document, address, `active=true`, `organization_id`

#### **Código Relevante:**
```typescript
// app/api/clients/route.ts
const organizationId = await getUserOrganizationId(supabase)
const clientData: ClientInsert = {
  ...body,
  active: body.active !== undefined ? body.active : true,
  organization_id: organizationId,
}

const { data: client, error } = await supabase
  .from('clients')
  .insert(clientData)
  .select()
  .single()
```

---

### **5. Criar Novo Técnico**

**Fluxo idêntico ao de Cliente**, mas na tabela `technicians`.

#### **Dados Criados:**
- **`technicians`:** name, nickname, phone, email, document, `active=true`, `organization_id`

---

### **6. Atualizar Serviço**

#### **Frontend → API Route**
```
components/services/service-modal.tsx
    ↓
servicesApi.update(service.id, updateData)
    ↓
app/api/services/[id]/route.ts → PATCH()
```

#### **Preparação dos Dados**
```
lib/api/services.ts → prepareServiceUpdate()
    ↓
1. Limpa campos undefined/null (cleanUpdateData())
    ↓
2. Recalcula tax_amount se necessário:
   - Se has_invoice ou gross_value mudaram
   - Busca tax_rate
   - Calcula novo tax_amount
    ↓
3. Atualiza status automaticamente:
   - Se completed_date preenchido → status = 'concluido'
   - Se start_date preenchido e status = 'pendente' → status = 'em_andamento'
```

#### **Atualização no Banco**
```
supabase.from('services').update(preparedData).eq('id', id)
    ↓
RLS verifica: organization_id do serviço = organization_id do usuário
    ↓
Trigger: update_services_updated_at (BEFORE UPDATE)
    ↓
services (UPDATE)
    ↓
Retorna serviço atualizado
```

#### **Código Relevante:**
```typescript
// app/api/services/[id]/route.ts
const currentService = await getServiceById(id, supabase)
const preparedData = await prepareServiceUpdate(currentService, body, supabase)

const { data: service, error } = await supabase
  .from('services')
  .update(preparedData)
  .eq('id', id)
  .select(/* relacionamentos */)
  .single()
```

---

### **7. Buscar Serviços (Listagem)**

#### **Frontend → API Route**
```
app/(privado)/dashboard/page.tsx
    ↓
servicesApi.getAll()
    ↓
app/api/services/route.ts → GET()
```

#### **Query no Banco**
```
supabase.from('services')
  .select(`
    *,
    clients:client_id (id, name, email, phone),
    technicians:technician_id (id, name, nickname, email, phone)
  `)
  .order('date', { ascending: false })
    ↓
RLS filtra automaticamente:
  - organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  - Usuário deve estar active = true
    ↓
Retorna apenas serviços da organização do usuário
```

#### **Formatação da Resposta**
```
services.map(service => ({
  ...service,
  client: service.clients || null,
  technician: service.technicians || null
}))
```

---

### **8. Buscar Taxa de Imposto**

#### **Frontend → API Route**
```
app/(privado)/dashboard/page.tsx
    ↓
settingsApi.getByKeySafe('tax_rate')
    ↓
app/api/settings/[key]/route.ts → GET()
```

#### **Query no Banco**
```
lib/api/services.ts → getTaxRate()
    ↓
1. Busca organization_id do usuário
    ↓
2. Query em app_settings:
   supabase.from('app_settings')
     .select('value')
     .eq('key', 'tax_rate')
     .eq('organization_id', organizationId)
     .single()
    ↓
3. Retorna Number(value) ou 0 se não encontrar
```

#### **Uso:**
A taxa é usada para calcular `tax_amount` ao criar/atualizar serviços.

---

## 📊 Diagrama de Fluxo {#diagrama}

### **Fluxo Completo: Criar Serviço**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FRONTEND: ServiceModal                                   │
│    - Usuário preenche formulário                            │
│    - Clica em "Salvar"                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CLIENT API: lib/api/client.ts                           │
│    servicesApi.create(formData)                            │
│    → POST /api/services                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API ROUTE: app/api/services/route.ts                    │
│    POST()                                                    │
│    ├─ Verifica autenticação                                 │
│    ├─ Valida dados (validateServiceInsert)                 │
│    ├─ Verifica se cliente existe                           │
│    ├─ Verifica se técnico existe                            │
│    └─ Busca organization_id (getUserOrganizationId)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. PREPARAÇÃO: lib/api/services.ts                         │
│    prepareServiceInsert()                                   │
│    ├─ Aplica valores padrão                                 │
│    ├─ Busca tax_rate (getTaxRate)                          │
│    ├─ Calcula tax_amount                                    │
│    └─ Adiciona organization_id                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. BANCO DE DADOS: Supabase                                 │
│    supabase.from('services').insert(preparedData)           │
│    ├─ RLS verifica: organization_id match                   │
│    ├─ INSERT em services                                    │
│    └─ SELECT com relacionamentos (client, technician)      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. RESPOSTA: ServiceWithRelations                          │
│    {                                                         │
│      id, date, gross_value, tax_amount, ...                 │
│      client: { id, name, email, phone },                   │
│      technician: { id, name, nickname, ... }                │
│    }                                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. FRONTEND: Atualiza UI                                    │
│    - Toast de sucesso                                        │
│    - Fecha modal                                             │
│    - Recarrega lista de serviços                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Funções Auxiliares Importantes

### **`getUserOrganizationId(supabase)`**
**Localização:** `lib/api/auth.ts`

**O que faz:**
1. Busca usuário autenticado (`supabase.auth.getUser()`)
2. Consulta `users` para obter `organization_id`
3. Verifica se usuário está `active = true`
4. Retorna `organization_id` ou `null`

**Uso:** Usado em **todas** as rotas de API para garantir que dados sejam criados na organização correta.

---

### **`prepareServiceInsert(data, supabase)`**
**Localização:** `lib/api/services.ts`

**O que faz:**
1. Aplica valores padrão (status, priority, etc.)
2. Busca `tax_rate` de `app_settings`
3. Calcula `tax_amount` se `has_invoice = true`
4. Retorna dados preparados

---

### **`prepareServiceUpdate(currentService, data, supabase)`**
**Localização:** `lib/api/services.ts`

**O que faz:**
1. Limpa campos undefined/null
2. Recalcula `tax_amount` se necessário
3. Atualiza `status` automaticamente baseado em datas
4. Retorna dados preparados

---

## ⚠️ Pontos Importantes

### **1. Multi-Tenancy**
- **SEMPRE** adicione `organization_id` ao criar dados
- Use `getUserOrganizationId()` para obter a organização do usuário
- RLS garante isolamento, mas é importante adicionar `organization_id` explicitamente

### **2. Cálculo de Imposto**
- `tax_amount` é calculado **automaticamente** no backend
- Taxa vem de `app_settings` onde `key = 'tax_rate'`
- Só calcula se `has_invoice = true`

### **3. Valores Padrão**
- `status = 'pendente'` (novos serviços)
- `payment_status = 'pendente'`
- `priority = 'media'`
- `operational_cost = 0`
- `active = true` (clientes/técnicos)

### **4. Triggers Automáticos**
- `handle_new_user()` cria `users` automaticamente
- `update_updated_at_column()` atualiza timestamps automaticamente

### **5. RLS (Row Level Security)**
- Todas as queries são **automaticamente filtradas** por organização
- Usuários **nunca** veem dados de outras organizações
- Políticas verificam `organization_id` e `active = true`

---

## 📝 Resumo das Tabelas e Operações

| Tabela | CREATE | READ | UPDATE | DELETE | RLS |
|--------|--------|------|--------|--------|-----|
| `users` | Trigger | Próprio perfil | Próprio perfil | ❌ | ✅ |
| `organizations` | RPC Function | Própria org | Admin apenas | ❌ | ✅ |
| `clients` | API Route | Própria org | Própria org | ❌ | ✅ |
| `technicians` | API Route | Própria org | Própria org | ❌ | ✅ |
| `services` | API Route | Própria org | Própria org | ❌ | ✅ |
| `app_settings` | API Route | Própria org | Admin apenas | ❌ | ✅ |

---

**Última atualização:** Dezembro 2024  
**Versão do documento:** 1.0

