# 📐 Estrutura de Páginas e Funções - Balango v3

## 🎯 Visão Geral

Este documento define todas as páginas, componentes e funções que o sistema terá, **ANTES** de implementar qualquer integração com Supabase.

---

## 📄 Páginas Principais

### 1. **Dashboard** (`/dashboard` ou `/`)
**Objetivo:** Visão geral do negócio com KPIs e lista de serviços

**Componentes:**
- Header com título, toggle modo escuro, botão de filtros, botão "Novo Serviço"
- Painel de Filtros (colapsável)
- Cards de KPI (4 cards principais + 1 destaque)
- Lista de Serviços (ServiceCard)
- FAB (Floating Action Button) para mobile

**Funções:**
- `loadServices()` - Carrega lista de serviços
- `applyFilters()` - Aplica filtros aos serviços
- `calculateKPIs()` - Calcula métricas (receita bruta, sem custos, base NF, impostos, lucro líquido)
- `toggleDarkMode()` - Alterna modo escuro/claro
- `openServiceModal()` - Abre modal de criar/editar serviço
- `deleteService()` - Deleta serviço com confirmação

**Filtros:**
- Mês/Ano (input type="month")
- Técnico (dropdown)
- Cliente (dropdown)
- Nota Fiscal (Todos / Com NF / Sem NF)

---

### 2. **Calendário** (`/calendar`)
**Objetivo:** Visualização mensal de serviços com indicadores visuais

**Componentes:**
- Header com navegação (mês anterior/próximo) e título do mês
- Grid de calendário (7 colunas = dias da semana)
- Modal de serviços do dia (ao clicar em um dia)

**Funções:**
- `loadMonthServices(year, month)` - Carrega serviços do mês
- `navigateMonth(direction)` - Navega entre meses
- `getDayServices(day)` - Retorna serviços de um dia específico
- `getDayIndicator(day)` - Calcula indicador visual (cor do ponto)
- `openDayModal(day)` - Abre modal com serviços do dia

**Indicadores Visuais:**
- Ponto verde: 1-2 serviços
- Ponto amarelo: 3-5 serviços
- Ponto vermelho: 6+ serviços
- Ícone de documento: se algum serviço tem NF
- Valor total do dia formatado

---

### 3. **Gestão de Cadastros** (`/cadastros`)
**Objetivo:** Gerenciar clientes e técnicos em uma única página

**Componentes:**
- Tabs ou seções para alternar entre "Clientes" e "Técnicos"
- Lista de clientes (ClientCard)
- Lista de técnicos (TechnicianCard)
- Modal de criar/editar cliente
- Modal de criar/editar técnico
- Botão "Novo Cliente" e "Novo Técnico"

**Funções:**
- `loadClients()` - Carrega lista de clientes
- `loadTechnicians()` - Carrega lista de técnicos
- `createClient(data)` - Cria novo cliente
- `updateClient(id, data)` - Atualiza cliente
- `deleteClient(id)` - Deleta cliente
- `createTechnician(data)` - Cria novo técnico
- `updateTechnician(id, data)` - Atualiza técnico
- `deleteTechnician(id)` - Deleta técnico
- `toggleClientActive(id)` - Ativa/desativa cliente
- `toggleTechnicianActive(id)` - Ativa/desativa técnico

**Campos Cliente:**
- Nome (obrigatório)
- Email
- Telefone
- Documento (CPF/CNPJ)
- Endereço
- Status (ativo/inativo)

**Campos Técnico:**
- Nome (obrigatório)
- Apelido/Nickname
- Email
- Telefone
- Documento (CPF)
- Status (ativo/inativo)

---

### 4. **Lista de Serviços** (`/services`)
**Objetivo:** Página dedicada apenas à listagem e gestão de serviços

**Componentes:**
- Header com título, filtros e botão "Novo Serviço"
- Painel de Filtros (mesmo do dashboard)
- Lista de Serviços (ServiceCard)
- Busca por texto (opcional)

**Funções:**
- `loadServices()` - Carrega lista de serviços
- `applyFilters()` - Aplica filtros
- `searchServices(query)` - Busca por texto
- `sortServices(field, direction)` - Ordena serviços
- `openServiceModal(serviceId?)` - Abre modal de criar/editar
- `deleteService(id)` - Deleta serviço

---

### 5. **Detalhes do Serviço** (`/services/[id]`)
**Objetivo:** Visualização completa e edição de um serviço específico

**Componentes:**
- Header com título e botões de ação
- Card de informações principais
- Card de informações financeiras
- Card de informações de pagamento
- Card de informações adicionais
- Formulário de edição (modo edição)
- Histórico de alterações (futuro)

**Funções:**
- `loadService(id)` - Carrega dados do serviço
- `updateService(id, data)` - Atualiza serviço
- `deleteService(id)` - Deleta serviço
- `toggleEditMode()` - Alterna modo visualização/edição
- `calculateTax()` - Recalcula imposto (se necessário)

**Campos Editáveis:**
- Todos os campos do serviço
- Campos extras: location, notes, payment_method, etc.

---

### 6. **Configurações** (`/settings`)
**Objetivo:** Gerenciar configurações globais do sistema

**Componentes:**
- Card de Taxa de Imposto
- Outros cards de configurações (futuro)
- Formulário de edição

**Funções:**
- `loadSettings()` - Carrega configurações
- `updateTaxRate(value)` - Atualiza taxa de imposto
- `saveSettings(data)` - Salva configurações

**Configurações:**
- Taxa de Imposto (ex: 0.15 para 15%)
- Outras configurações futuras

---

## 🧩 Componentes Reutilizáveis

### **ServiceCard**
**Props:**
- `service` - Objeto do serviço
- `onEdit` - Callback ao clicar em editar
- `onDelete` - Callback ao clicar em deletar

**Exibe:**
- Data formatada
- Nome do cliente
- Nome do técnico (nickname ou name)
- Descrição (se houver)
- Valor bruto formatado
- Badge de nota fiscal (se tiver)
- Badge de status (pendente/em_andamento/concluido/cancelado)
- Badge de pagamento (pendente/pago/atrasado)
- Botões de ação (Editar, Excluir)

---

### **ClientCard**
**Props:**
- `client` - Objeto do cliente
- `onEdit` - Callback
- `onDelete` - Callback
- `onToggleActive` - Callback

**Exibe:**
- Nome
- Email e telefone
- Documento
- Badge de status (ativo/inativo)
- Botões de ação

---

### **TechnicianCard**
**Props:**
- `technician` - Objeto do técnico
- `onEdit` - Callback
- `onDelete` - Callback
- `onToggleActive` - Callback

**Exibe:**
- Nome completo
- Apelido (se houver)
- Email e telefone
- Badge de status (ativo/inativo)
- Botões de ação

---

### **ServiceModal** (Criar/Editar)
**Props:**
- `open` - Boolean
- `serviceId?` - ID do serviço (se edição)
- `onClose` - Callback ao fechar
- `onSuccess` - Callback ao salvar com sucesso

**Campos:**
- Data (obrigatório)
- Cliente (obrigatório, dropdown com busca)
- Técnico (obrigatório, dropdown com busca)
- Descrição (opcional)
- Valor Bruto (obrigatório, numérico)
- Custo Operacional (opcional, numérico)
- Checkbox "Emitir Nota Fiscal"
- Número da NF (opcional, aparece se checkbox marcado)

**Funções:**
- `loadClients()` - Carrega clientes para dropdown
- `loadTechnicians()` - Carrega técnicos para dropdown
- `validateForm()` - Valida campos obrigatórios
- `saveService()` - Salva serviço (cria ou atualiza)
- `calculateTax()` - Calcula imposto automaticamente

---

### **ClientModal** (Criar/Editar)
**Props:**
- `open` - Boolean
- `clientId?` - ID do cliente (se edição)
- `onClose` - Callback
- `onSuccess` - Callback

**Campos:**
- Nome (obrigatório)
- Email
- Telefone
- Documento
- Endereço
- Status (ativo/inativo)

---

### **TechnicianModal** (Criar/Editar)
**Props:**
- `open` - Boolean
- `technicianId?` - ID do técnico (se edição)
- `onClose` - Callback
- `onSuccess` - Callback

**Campos:**
- Nome (obrigatório)
- Apelido/Nickname
- Email
- Telefone
- Documento (CPF)
- Status (ativo/inativo)

---

### **FiltersPanel**
**Props:**
- `filters` - Objeto com filtros ativos
- `onFiltersChange` - Callback ao mudar filtros
- `onClear` - Callback ao limpar filtros

**Filtros:**
- Mês/Ano
- Técnico
- Cliente
- Nota Fiscal

**Funções:**
- `countActiveFilters()` - Conta filtros ativos
- `clearAllFilters()` - Limpa todos os filtros

---

### **KPICard**
**Props:**
- `title` - Título do card
- `value` - Valor numérico
- `icon` - Ícone (React component)
- `color` - Cor do card (emerald, blue, amber, red, purple)
- `subtitle?` - Texto secundário
- `highlight?` - Se é card destaque (gradiente)

---

## 🔧 Funções Utilitárias

### **Cálculos Financeiros**
- `calculateTaxAmount(grossValue, taxRate, hasInvoice)` - Calcula imposto
- `calculateNetRevenue(grossValue, operationalCost)` - Receita sem custos
- `calculateNetProfit(grossValue, operationalCost, taxAmount)` - Lucro líquido
- `formatCurrency(value)` - Formata como moeda (R$)

### **Formatação**
- `formatDate(date)` - Formata data (DD/MM/YYYY)
- `formatDateTime(datetime)` - Formata data/hora
- `formatMonthYear(date)` - Formata mês/ano (novembro 2025)

### **Validação**
- `validateService(data)` - Valida dados de serviço
- `validateClient(data)` - Valida dados de cliente
- `validateTechnician(data)` - Valida dados de técnico

### **Status e Badges**
- `getStatusColor(status)` - Retorna cor do badge de status
- `getPaymentStatusColor(status)` - Retorna cor do badge de pagamento
- `getStatusLabel(status)` - Retorna label do status

### **Filtros**
- `filterServices(services, filters)` - Aplica filtros aos serviços
- `searchInServices(services, query)` - Busca por texto

### **Agregações**
- `aggregateByMonth(services)` - Agrupa serviços por mês
- `aggregateByTechnician(services)` - Agrupa por técnico
- `aggregateByClient(services)` - Agrupa por cliente
- `aggregateByPaymentStatus(services)` - Agrupa por status de pagamento
- `aggregateByInvoiceStatus(services)` - Agrupa por com/sem NF

---

## 🎨 Componentes de UI Base

### **Já Existentes (reutilizar):**
- `Card`, `CardHeader`, `CardContent`, `CardTitle`
- `Button`
- `Input`
- `Label`
- `Select`
- `Dialog` (Modal)
- `Badge`
- `Toast` / `Toaster`
- `Calendar`
- `Popover`
- `DropdownMenu`
- `Avatar`

### **Criar se necessário:**
- `Tabs` - Para alternar entre Clientes/Técnicos
- `SearchInput` - Input com ícone de busca
- `LoadingSpinner` - Spinner de carregamento
- `EmptyState` - Estado vazio (sem dados)
- `ConfirmDialog` - Dialog de confirmação

---

## 📊 Estrutura de Dados (Tipos)

### **Service**
```typescript
{
  id: string
  date: string
  technician_id: string
  client_id: string
  description?: string
  gross_value: number
  operational_cost: number
  tax_amount: number
  has_invoice: boolean
  invoice_number?: string
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
  payment_status: 'pendente' | 'pago' | 'atrasado'
  payment_method?: string
  payment_date?: string
  location?: string
  notes?: string
  estimated_hours?: number
  actual_hours?: number
  start_date?: string
  completed_date?: string
  service_type?: string
  priority: 'baixa' | 'media' | 'alta'
  contact_phone?: string
  contact_email?: string
  // Relacionamentos
  technician?: Technician
  client?: Client
}
```

### **Client**
```typescript
{
  id: string
  name: string
  email?: string
  phone?: string
  document?: string
  address?: string
  active: boolean
  created_at: string
  updated_at: string
}
```

### **Technician**
```typescript
{
  id: string
  name: string
  nickname?: string
  email?: string
  phone?: string
  document?: string
  active: boolean
  created_at: string
  updated_at: string
}
```

### **Filters**
```typescript
{
  month?: string // YYYY-MM
  technician_id?: string
  client_id?: string
  has_invoice?: boolean | null // null = todos
  search?: string // busca por texto
}
```

### **KPIs**
```typescript
{
  receitaBruta: number
  receitaSemCustos: number
  baseNF: number
  impostos: number
  lucroLiquido: number
}
```

---

## 🔄 Fluxos Principais

### **Fluxo 1: Criar Serviço**
1. Usuário clica "Novo Serviço"
2. Modal abre → carrega clientes e técnicos
3. Usuário preenche formulário
4. Ao salvar:
   - Valida campos obrigatórios
   - Calcula `tax_amount` se `has_invoice = true`
   - Define valores padrão (status, payment_status, priority)
   - Salva serviço
5. Modal fecha → lista recarrega

### **Fluxo 2: Editar Serviço**
1. Usuário clica "Editar" no ServiceCard
2. Modal abre com dados preenchidos
3. Usuário altera campos
4. Ao salvar:
   - Recalcula `tax_amount` se necessário
   - Atualiza status automaticamente (se start_date/completed_date mudaram)
   - Salva alterações
5. Modal fecha → lista recarrega

### **Fluxo 3: Filtrar Serviços**
1. Usuário abre painel de filtros
2. Seleciona filtros
3. Lista atualiza em tempo real
4. KPIs recalculam com base nos filtros
5. Contador mostra filtros ativos

### **Fluxo 4: Visualizar Calendário**
1. Usuário navega para `/calendar`
2. Sistema carrega serviços do mês atual
3. Calendário renderiza com indicadores
4. Usuário clica em dia com serviços
5. Modal abre mostrando serviços daquele dia

### **Fluxo 5: Gerenciar Cadastros**
1. Usuário navega para `/cadastros`
2. Seleciona aba "Clientes" ou "Técnicos"
3. Vê lista de cadastros
4. Pode criar, editar, excluir ou ativar/desativar
5. Mudanças refletem imediatamente

---

## ✅ Checklist de Implementação

### **Fase 1: Estrutura Base**
- [ ] Criar todas as páginas (vazias, apenas estrutura)
- [ ] Criar todos os componentes (vazios, apenas props)
- [ ] Definir tipos TypeScript
- [ ] Criar funções utilitárias (sem Supabase ainda)

### **Fase 2: Componentes UI**
- [ ] ServiceCard
- [ ] ClientCard
- [ ] TechnicianCard
- [ ] ServiceModal
- [ ] ClientModal
- [ ] TechnicianModal
- [ ] FiltersPanel
- [ ] KPICard

### **Fase 3: Páginas**
- [ ] Dashboard
- [ ] Calendário
- [ ] Cadastros (Clientes + Técnicos)
- [ ] Lista de Serviços
- [ ] Detalhes do Serviço
- [ ] Configurações

### **Fase 4: Integração Supabase**
- [ ] API Routes
- [ ] Conectar funções ao Supabase
- [ ] Testes de integração

---

**Última atualização:** Novembro 2025

