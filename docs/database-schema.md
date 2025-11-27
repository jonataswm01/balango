# Schema do Banco de Dados - Balango v3

Este documento contém a estrutura completa das tabelas do banco de dados.

## Tabelas

### 1. `app_settings`
Configurações gerais da aplicação.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `key` | TEXT | Chave da configuração (PK) |
| `value` | NUMERIC | Valor numérico da configuração |
| `description` | TEXT | Descrição da configuração |

**Constraints:**
- PRIMARY KEY: `key`

---

### 2. `clients`
Cadastro de clientes.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único (PK, auto-gerado) |
| `created_at` | TIMESTAMP WITH TIME ZONE | Data de criação (default: now()) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Data de atualização (default: now()) |
| `name` | TEXT | Nome do cliente (NOT NULL) |
| `phone` | TEXT | Telefone do cliente |
| `email` | TEXT | Email do cliente |
| `document` | TEXT | Documento (CPF/CNPJ) |
| `address` | TEXT | Endereço |
| `active` | BOOLEAN | Status ativo/inativo (default: true) |

**Constraints:**
- PRIMARY KEY: `id`

---

### 3. `services`
Serviços prestados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único (PK, auto-gerado) |
| `created_at` | TIMESTAMP WITH TIME ZONE | Data de criação (default: now()) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Data de atualização (default: now()) |
| `description` | TEXT | Descrição do serviço |
| `date` | DATE | Data do serviço (NOT NULL) |
| `status` | TEXT | Status do serviço (default: 'pendente') |
| `priority` | TEXT | Prioridade (default: 'media') |
| `service_type` | TEXT | Tipo de serviço |
| `technician_id` | UUID | ID do técnico (FK -> technicians) |
| `client_id` | UUID | ID do cliente (FK -> clients) |
| `gross_value` | NUMERIC | Valor bruto (default: 0, NOT NULL) |
| `operational_cost` | NUMERIC | Custo operacional (default: 0, NOT NULL) |
| `tax_amount` | NUMERIC | Valor de impostos (default: 0, NOT NULL) |
| `has_invoice` | BOOLEAN | Possui nota fiscal (default: false) |
| `invoice_number` | TEXT | Número da nota fiscal |
| `payment_status` | TEXT | Status do pagamento (default: 'pendente') |
| `payment_method` | TEXT | Método de pagamento |
| `payment_date` | DATE | Data do pagamento |
| `location` | TEXT | Localização do serviço |
| `notes` | TEXT | Observações |
| `estimated_hours` | NUMERIC | Horas estimadas |
| `actual_hours` | NUMERIC | Horas reais |
| `start_date` | TIMESTAMP WITHOUT TIME ZONE | Data/hora de início |
| `completed_date` | TIMESTAMP WITHOUT TIME ZONE | Data/hora de conclusão |
| `contact_phone` | TEXT | Telefone de contato |
| `contact_email` | TEXT | Email de contato |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `technician_id` -> `technicians(id)`
- FOREIGN KEY: `client_id` -> `clients(id)`

---

### 4. `technicians`
Cadastro de técnicos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único (PK, auto-gerado) |
| `created_at` | TIMESTAMP WITH TIME ZONE | Data de criação (default: now()) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Data de atualização (default: now()) |
| `name` | TEXT | Nome do técnico (NOT NULL) |
| `nickname` | TEXT | Apelido |
| `active` | BOOLEAN | Status ativo/inativo (default: true) |
| `phone` | TEXT | Telefone |
| `email` | TEXT | Email |
| `document` | TEXT | Documento (CPF/CNPJ) |

**Constraints:**
- PRIMARY KEY: `id`

---

### 5. `users`
Perfis de usuários do sistema (autenticação via Supabase Auth).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único (PK, FK -> auth.users) |
| `email` | TEXT | Email do usuário (NOT NULL) |
| `nome` | TEXT | Nome completo (NOT NULL) |
| `telefone` | TEXT | Telefone (NOT NULL, UNIQUE) |
| `avatar_url` | TEXT | URL do avatar |
| `created_at` | TIMESTAMP WITH TIME ZONE | Data de criação (default: now()) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Data de atualização (default: now()) |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `id` -> `auth.users(id)`
- UNIQUE: `telefone`

---

## Relacionamentos

```
users (auth)
  └── users (public) - 1:1

clients
  └── services - 1:N

technicians
  └── services - 1:N
```

## Observações

- Todas as tabelas têm `created_at` e `updated_at` para auditoria
- A tabela `users` está vinculada ao sistema de autenticação do Supabase (`auth.users`)
- A tabela `services` é a central do sistema, relacionando clientes e técnicos
- Campos de status e prioridade usam valores textuais (podem ser enums no futuro)


