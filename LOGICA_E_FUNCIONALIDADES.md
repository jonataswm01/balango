# 📋 Balango - Documentação Completa de Lógica e Funcionalidades

## 🎯 Visão Geral do Sistema

**Balango** é um sistema completo de gestão de serviços técnicos, desenvolvido para gerenciar serviços prestados, controlar receitas, custos, impostos e fornecer análises detalhadas do negócio.

### Arquitetura
- **Backend**: NestJS (TypeScript) - API REST
- **Frontend**: Next.js 14+ (React) - Interface moderna e responsiva
- **Banco de Dados**: Supabase (PostgreSQL)
- **Portas**: Backend (3000), Frontend (3001)

---

## 🗄️ Estrutura de Dados

### Tabelas Principais

#### 1. **services** (Serviços)
Tabela central do sistema que armazena todos os serviços prestados.

**Campos Essenciais:**
- `id` (UUID) - Identificador único
- `date` (Date) - Data do serviço
- `technician_id` (UUID) - FK para técnico responsável
- `client_id` (UUID) - FK para cliente
- `description` (String) - Descrição do serviço
- `gross_value` (Decimal) - Valor bruto do serviço
- `operational_cost` (Decimal) - Custo operacional
- `has_invoice` (Boolean) - Se possui nota fiscal
- `invoice_number` (String) - Número da nota fiscal
- `tax_amount` (Decimal) - Valor do imposto (calculado automaticamente)

**Campos Extras (Detalhes):**
- `status` (String) - Status do serviço: `pendente`, `em_andamento`, `concluido`, `cancelado`
- `payment_status` (String) - Status do pagamento: `pendente`, `pago`, `atrasado`
- `payment_method` (String) - Método: `pix`, `boleto`, `cartao`, `dinheiro`, `transferencia`
- `payment_date` (Date) - Data de pagamento
- `location` (Text) - Localização/endereço do serviço
- `notes` (Text) - Observações adicionais
- `estimated_hours` (Decimal) - Horas estimadas
- `actual_hours` (Decimal) - Horas reais trabalhadas
- `start_date` (Timestamp) - Data/hora de início
- `completed_date` (Timestamp) - Data/hora de conclusão
- `service_type` (String) - Tipo/categoria do serviço
- `priority` (String) - Prioridade: `baixa`, `media`, `alta`
- `contact_phone` (String) - Telefone de contato
- `contact_email` (String) - Email de contato

**Relacionamentos:**
- `technician_id` → `technicians.id`
- `client_id` → `clients.id`

#### 2. **clients** (Clientes)
Armazena informações dos clientes.

**Campos:**
- `id` (UUID) - Identificador único
- `name` (String) - Nome do cliente
- `email` (String) - Email
- `phone` (String) - Telefone
- `document` (String) - CPF/CNPJ
- `address` (Text) - Endereço completo
- `active` (Boolean) - Se está ativo (default: true)
- `created_at`, `updated_at` (Timestamp)

#### 3. **technicians** (Técnicos)
Armazena informações dos técnicos.

**Campos:**
- `id` (UUID) - Identificador único
- `name` (String) - Nome completo
- `nickname` (String) - Apelido/nome curto
- `email` (String) - Email
- `phone` (String) - Telefone
- `document` (String) - CPF
- `active` (Boolean) - Se está ativo (default: true)
- `created_at`, `updated_at` (Timestamp)

#### 4. **app_settings** (Configurações)
Armazena configurações globais da aplicação.

**Campos:**
- `id` (UUID) - Identificador único
- `key` (String) - Chave da configuração (unique)
- `value` (String) - Valor da configuração
- `created_at`, `updated_at` (Timestamp)

**Configurações Conhecidas:**
- `tax_rate` - Taxa de imposto (ex: "0.15" para 15%)

---

## 🔧 Lógica de Negócio

### 1. **Cálculo Automático de Impostos**

**Regra:**
- Quando um serviço é criado ou atualizado com `has_invoice = true`, o sistema calcula automaticamente o `tax_amount`
- Fórmula: `tax_amount = gross_value × tax_rate`
- A `tax_rate` é obtida da tabela `app_settings` onde `key = 'tax_rate'`
- Se não houver configuração, assume `tax_rate = 0`
- Se `has_invoice = false`, `tax_amount = 0`

**Implementação:**
```typescript
// No ServicesService.create() e update()
if (has_invoice) {
  const taxRate = await getCurrentTaxRate();
  taxAmount = gross_value * taxRate;
} else {
  taxAmount = 0;
}
```

### 2. **Status Automático de Serviços**

**Fluxo de Status:**
- **Criação**: Status padrão é `pendente` (se não informado)
- **Início do Trabalho**: Quando `start_date` é preenchido e status atual é `pendente` → muda para `em_andamento`
- **Conclusão**: Quando `completed_date` é preenchido → muda para `concluido`
- **Cancelamento**: Pode ser alterado manualmente para `cancelado`

**Lógica Imersiva:**
- O sistema detecta automaticamente mudanças baseadas em campos de data
- Se `start_date` for removido (null/vazio) e status for `em_andamento` → volta para `pendente`
- Status só muda automaticamente se não for explicitamente alterado no update

**Implementação:**
```typescript
// No ServicesService.update()
if (!updateDto.status) {
  if (updateDto.start_date && current.status === 'pendente') {
    updateData.status = 'em_andamento';
  }
  if (updateDto.completed_date) {
    updateData.status = 'concluido';
  }
  if (updateDto.start_date === null && current.status === 'em_andamento') {
    updateData.status = 'pendente';
  }
}
```

### 3. **Status de Pagamento**

**Valores Padrão:**
- Ao criar serviço: `payment_status = 'pendente'` (se não informado)
- Pode ser alterado manualmente para: `pago`, `atrasado`

**Campos Relacionados:**
- `payment_method` - Método de pagamento utilizado
- `payment_date` - Data em que o pagamento foi realizado

### 4. **Prioridade**

**Valor Padrão:**
- Ao criar serviço: `priority = 'media'` (se não informado)
- Valores possíveis: `baixa`, `media`, `alta`

### 5. **Cálculo de KPIs (Key Performance Indicators)**

**Métricas Calculadas:**

1. **Receita Bruta Total**
   - Soma de todos os `gross_value` dos serviços filtrados

2. **Receita Sem Custos**
   - `Receita Bruta - Custos Operacionais`

3. **Base de Nota Fiscal**
   - Soma de `gross_value` apenas dos serviços com `has_invoice = true`

4. **Impostos Totais**
   - Soma de todos os `tax_amount`

5. **Lucro Líquido Total**
   - `Receita Bruta - Custos Operacionais - Impostos`
   - Fórmula: `totalGeral = totalBruto - totalCustos - imposto`

**Implementação:**
```typescript
// No Dashboard (frontend)
data.forEach(item => {
  totalBruto += parseFloat(item.gross_value);
  totalCustos += parseFloat(item.operational_cost);
  imposto += parseFloat(item.tax_amount);
  if (item.has_invoice) {
    totalComNF += parseFloat(item.gross_value);
  }
});
const totalSemCustos = totalBruto - totalCustos;
const totalGeral = totalSemCustos - imposto;
```

---

## 🎨 Funcionalidades do Frontend

### 1. **Dashboard Principal** (`/`)

**Componentes:**

#### **Header**
- Título "Dashboard"
- Botão de alternar modo escuro/claro
- Botão de filtros (com contador de filtros ativos)
- Botão "Novo Serviço"

#### **Painel de Filtros** (Colapsável)
Filtros disponíveis:
- **Mês**: Filtro por mês/ano (input type="month")
- **Técnico**: Dropdown com todos os técnicos ativos
- **Cliente**: Dropdown com todos os clientes
- **Nota Fiscal**: Dropdown (Todos / Com NF / Sem NF)

**Comportamento:**
- Filtros são aplicados em tempo real
- Contador mostra quantos filtros estão ativos
- Botão "Limpar" remove todos os filtros
- Filtros persistem enquanto o painel está aberto

#### **Cards de KPI**
4 cards principais:
1. **Receita Bruta** (azul) - Soma de todos os valores brutos
2. **Sem Custos** (verde) - Receita bruta menos custos
3. **Base NF** (âmbar) - Soma dos valores com nota fiscal
4. **Impostos** (vermelho) - Soma de todos os impostos

**Card Destaque:**
- **Lucro Líquido Total** (gradiente verde) - Valor final após todos os descontos

#### **Lista de Serviços**
- Lista todos os serviços (filtrados)
- Mostra contador: `(X de Y)` quando há filtros ativos
- Cada serviço é exibido em um `ServiceCard`
- Ordenação: Mais recentes primeiro (por data)

**Estados:**
- **Loading**: Spinner de carregamento
- **Vazio**: Mensagem "Nenhum serviço encontrado" + botão para criar
- **Com dados**: Lista de cards

#### **FAB (Floating Action Button)**
- Botão flutuante no mobile (canto inferior direito)
- Aparece apenas em telas pequenas (`lg:hidden`)
- Abre modal de criação de serviço

### 2. **Modal de Criar/Editar Serviço**

**Campos do Formulário:**
1. **Data** (obrigatório) - Input type="date"
2. **Cliente** (obrigatório) - Dropdown com busca
3. **Técnico** (obrigatório) - Dropdown com busca
4. **Descrição** (opcional) - Input de texto
5. **Valor Bruto** (obrigatório) - Input numérico (decimal)
6. **Custo Operacional** (opcional) - Input numérico (decimal)
7. **Emitir Nota Fiscal?** (checkbox)
   - Se marcado, mostra campo:
   - **Número da NF** (opcional) - Input de texto

**Comportamento:**
- Carrega clientes e técnicos ao abrir o modal
- Validação: Cliente, Técnico, Data e Valor Bruto são obrigatórios
- Ao salvar:
  - Se edição: PATCH `/services/:id`
  - Se criação: POST `/services`
- Fecha modal e recarrega lista após sucesso
- Mostra mensagem de erro em caso de falha

**Campos Extras:**
- Campos extras (location, notes, payment_method, etc.) não aparecem no formulário de criação
- Devem ser editados na página de detalhes do serviço (futuro)

### 3. **Card de Serviço** (`ServiceCard`)

**Informações Exibidas:**
- Data do serviço (formatada)
- Nome do cliente
- Nome do técnico (nickname ou name)
- Descrição (se houver)
- Valor bruto (formatado como moeda)
- Indicador de nota fiscal (se `has_invoice = true`)
- Status do serviço (badge colorido)
- Status de pagamento (badge colorido)

**Ações:**
- Botão "Editar" - Abre modal de edição
- Botão "Excluir" - Confirma e deleta serviço

**Cores dos Badges:**
- Status:
  - `pendente` - Amarelo
  - `em_andamento` - Azul
  - `concluido` - Verde
  - `cancelado` - Vermelho
- Pagamento:
  - `pendente` - Amarelo
  - `pago` - Verde
  - `atrasado` - Vermelho

### 4. **Página de Calendário** (`/calendar`)

**Funcionalidades:**

#### **Navegação de Mês**
- Botões anterior/próximo
- Exibe mês e ano atual (ex: "novembro 2025")
- Ao mudar mês, recarrega dados da API

#### **Grid de Calendário**
- Grid 7xN (7 colunas = dias da semana)
- Cabeçalho: Dom, Seg, Ter, Qua, Qui, Sex, Sáb
- Cada célula representa um dia

**Indicadores Visuais:**
- **Dia atual**: Borda azul e fundo azul claro
- **Dias de outros meses**: Opacidade reduzida, fundo cinza claro
- **Dias com serviços**: 
  - Ponto colorido (verde: 1-2 serviços, amarelo: 3-5, vermelho: 6+)
  - Contador de serviços
  - Valor total do dia (formatado)
  - Ícone de documento se algum serviço tem NF

**Interatividade:**
- Click em dia com serviços → Abre modal com lista de serviços daquele dia
- Modal mostra:
  - Data formatada
  - Lista de serviços com:
    - Nome do cliente
    - Nome do técnico
    - Valor bruto
    - Indicador de NF

**API:**
- Endpoint: `GET /services/calendar/:year/:month`
- Retorna serviços agrupados por dia do mês

### 5. **Página de Analytics** (`/analytics`)

**Gráficos Implementados:**

#### **1. Receita ao Longo do Tempo**
- Tipo: Line Chart (Recharts)
- Eixo X: Meses (formatados em português)
- Eixo Y: Valores em R$ (formato: R$ Xk)
- Linhas:
  - Receita Bruta (azul)
  - Receita Líquida (verde)
  - Custos (vermelho)

#### **2. Distribuição por Técnico**
- Tipo: Bar Chart (horizontal)
- Eixo X: Nome do técnico (nickname ou name)
- Eixo Y: Valor total em R$
- Mostra top 10 técnicos
- Cor: Roxo

#### **3. Status de Pagamento**
- Tipo: Pie Chart
- Fatias:
  - Pendente (amarelo)
  - Pago (verde)
  - Atrasado (vermelho)
- Mostra percentual e valor

#### **4. Serviços com/sem NF**
- Tipo: Pie Chart
- Fatias:
  - Com NF (verde)
  - Sem NF (vermelho)
- Mostra percentual e valor

#### **5. Top Clientes**
- Tipo: Bar Chart (horizontal)
- Eixo X: Nome do cliente
- Eixo Y: Valor total em R$
- Mostra top 10 clientes
- Cor: Rosa

#### **Cards de Resumo:**
- Total de Serviços
- Receita Total
- Pagamentos Pendentes
- Quantidade com Nota Fiscal

**API:**
- Endpoint: `GET /services/analytics`
- Retorna dados agregados:
  - `monthly`: Dados mensais
  - `byTechnician`: Agrupado por técnico
  - `byClient`: Agrupado por cliente
  - `paymentStatus`: Status de pagamento
  - `invoiceStatus`: Com/sem NF

### 6. **Páginas de Gestão**

#### **Clientes** (`/clients`)
- Lista todos os clientes
- CRUD completo (criar, editar, excluir)
- Modal para criar/editar

#### **Técnicos** (`/technicians`)
- Lista todos os técnicos
- CRUD completo (criar, editar, excluir)
- Filtro para incluir inativos
- Modal para criar/editar

#### **Serviços** (`/services`)
- Lista todos os serviços
- Similar ao dashboard, mas focado apenas em serviços

#### **Configurações** (`/settings`)
- Página de configurações gerais
- Gerenciar taxa de imposto
- Outras configurações futuras

### 7. **Modo Escuro/Claro**

**Funcionalidade:**
- Toggle no header do dashboard
- Estado salvo no `localStorage`
- Aplica classe `dark` no `document.documentElement`
- Todos os componentes suportam modo escuro via Tailwind `dark:` classes

**Persistência:**
- Salva preferência: `localStorage.setItem('darkMode', darkMode.toString())`
- Carrega ao iniciar: `localStorage.getItem('darkMode')`

---

## 🔌 API Endpoints

### **Serviços** (`/services`)

#### `POST /services`
Cria um novo serviço.

**Body:**
```json
{
  "date": "2025-11-15",
  "technician_id": "uuid",
  "client_id": "uuid",
  "description": "Descrição opcional",
  "gross_value": 1000.00,
  "operational_cost": 200.00,
  "has_invoice": true,
  "invoice_number": "123456"
}
```

**Resposta:** Serviço criado com `tax_amount` calculado automaticamente.

#### `GET /services`
Lista todos os serviços com relacionamentos (cliente e técnico).

**Resposta:**
```json
[
  {
    "id": "uuid",
    "date": "2025-11-15",
    "gross_value": 1000.00,
    "operational_cost": 200.00,
    "tax_amount": 150.00,
    "has_invoice": true,
    "clients": { "name": "Cliente A" },
    "technicians": { "name": "João", "nickname": "João" }
  }
]
```

#### `GET /services/:id`
Busca um serviço específico.

#### `PATCH /services/:id`
Atualiza um serviço.

**Body:** Campos parciais (apenas os que deseja atualizar).

**Comportamento:**
- Recalcula `tax_amount` se `has_invoice` ou `gross_value` mudarem
- Atualiza status automaticamente baseado em `start_date` e `completed_date`
- Remove campos `undefined`, `null` ou strings vazias (exceto campos de texto livre)

#### `DELETE /services/:id`
Exclui um serviço.

#### `GET /services/clients`
Lista todos os clientes (para dropdowns).

**Resposta:**
```json
[
  { "id": "uuid", "name": "Cliente A" }
]
```

#### `GET /services/technicians`
Lista todos os técnicos ativos (para dropdowns).

**Resposta:**
```json
[
  { "id": "uuid", "name": "João Silva", "nickname": "João" }
]
```

#### `GET /services/analytics`
Retorna dados agregados para gráficos.

**Resposta:**
```json
{
  "monthly": [
    {
      "month": "novembro de 2025",
      "receitaBruta": 10000,
      "receitaLiquida": 8000,
      "custos": 2000,
      "impostos": 1500,
      "quantidade": 10
    }
  ],
  "byTechnician": [
    {
      "name": "João",
      "quantidade": 5,
      "valorTotal": 5000,
      "valorMedio": 1000
    }
  ],
  "byClient": [...],
  "paymentStatus": {
    "pendente": { "quantidade": 5, "valor": 5000 },
    "pago": { "quantidade": 3, "valor": 3000 },
    "atrasado": { "quantidade": 2, "valor": 2000 }
  },
  "invoiceStatus": {
    "comNF": { "quantidade": 6, "valor": 6000 },
    "semNF": { "quantidade": 4, "valor": 4000 }
  }
}
```

#### `GET /services/calendar/:year/:month`
Retorna serviços agrupados por dia do mês.

**Resposta:**
```json
{
  "1": [
    {
      "id": "uuid",
      "date": "2025-11-01",
      "gross_value": 1000,
      "has_invoice": true,
      "clients": { "name": "Cliente A" },
      "technicians": { "name": "João", "nickname": "João" }
    }
  ],
  "15": [...]
}
```

### **Clientes** (`/clients`)

#### `POST /clients`
Cria um novo cliente.

#### `GET /clients`
Lista todos os clientes.

#### `GET /clients/:id`
Busca um cliente específico.

#### `PATCH /clients/:id`
Atualiza um cliente.

#### `DELETE /clients/:id`
Exclui um cliente.

### **Técnicos** (`/technicians`)

#### `POST /technicians`
Cria um novo técnico.

#### `GET /technicians?includeInactive=true`
Lista todos os técnicos (opcionalmente inclui inativos).

#### `GET /technicians/:id`
Busca um técnico específico.

#### `PATCH /technicians/:id`
Atualiza um técnico.

#### `DELETE /technicians/:id`
Exclui um técnico.

---

## 🎯 Fluxos de Uso

### **Fluxo 1: Criar um Novo Serviço**

1. Usuário clica em "Novo Serviço" no dashboard
2. Modal abre e carrega lista de clientes e técnicos
3. Usuário preenche:
   - Data do serviço
   - Seleciona cliente
   - Seleciona técnico
   - (Opcional) Descrição
   - Valor bruto
   - (Opcional) Custo operacional
   - (Opcional) Marca "Emitir Nota Fiscal" e preenche número
4. Ao salvar:
   - Sistema calcula `tax_amount` se `has_invoice = true`
   - Define `status = 'pendente'` (padrão)
   - Define `payment_status = 'pendente'` (padrão)
   - Define `priority = 'media'` (padrão)
   - Cria serviço no banco
5. Modal fecha e lista recarrega
6. Novo serviço aparece na lista

### **Fluxo 2: Acompanhar Status do Serviço**

1. Serviço criado com `status = 'pendente'`
2. Quando técnico inicia trabalho:
   - Usuário edita serviço e preenche `start_date`
   - Sistema detecta e muda `status = 'em_andamento'` automaticamente
3. Quando serviço é concluído:
   - Usuário preenche `completed_date`
   - Sistema muda `status = 'concluido'` automaticamente

### **Fluxo 3: Registrar Pagamento**

1. Usuário edita serviço
2. Altera `payment_status = 'pago'`
3. (Opcional) Preenche `payment_method` (ex: "pix")
4. (Opcional) Preenche `payment_date`
5. Salva alterações
6. Card do serviço atualiza badge de pagamento

### **Fluxo 4: Visualizar Analytics**

1. Usuário navega para `/analytics`
2. Sistema carrega dados agregados da API
3. Gráficos são renderizados:
   - Receita ao longo do tempo (linha)
   - Distribuição por técnico (barras)
   - Status de pagamento (pizza)
   - Serviços com/sem NF (pizza)
   - Top clientes (barras)
4. Cards de resumo mostram totais

### **Fluxo 5: Usar Calendário**

1. Usuário navega para `/calendar`
2. Sistema carrega serviços do mês atual
3. Calendário exibe:
   - Dias com serviços marcados com pontos coloridos
   - Valor total por dia
   - Indicador de NF
4. Usuário clica em um dia com serviços
5. Modal abre mostrando lista de serviços daquele dia
6. Usuário pode ver detalhes de cada serviço

### **Fluxo 6: Filtrar Serviços**

1. Usuário clica em "Filtros" no dashboard
2. Painel de filtros abre
3. Usuário seleciona:
   - Mês específico
   - Técnico específico
   - Cliente específico
   - Com/sem NF
4. Lista atualiza em tempo real
5. KPIs recalculam com base nos filtros
6. Contador mostra quantos filtros estão ativos
7. Usuário pode limpar filtros ou fechar painel

---

## 🔐 Segurança e Validações

### **Validações no Backend**

1. **Criação de Serviço:**
   - `date` é obrigatório
   - `technician_id` deve existir em `technicians`
   - `client_id` deve existir em `clients`
   - `gross_value` deve ser número positivo
   - `operational_cost` deve ser número (pode ser 0)

2. **Atualização de Serviço:**
   - Campos `undefined` são ignorados
   - Strings vazias são ignoradas (exceto campos de texto livre)
   - Recalcula impostos se necessário

3. **Exclusão:**
   - Confirmação no frontend antes de deletar
   - Deleta permanentemente (sem soft delete por enquanto)

### **Validações no Frontend**

1. **Formulário de Serviço:**
   - Campos obrigatórios marcados com `required`
   - Valores numéricos validados
   - Mensagens de erro exibidas via `alert`

2. **Filtros:**
   - Valores vazios são tratados como "todos"
   - Filtros são aplicados apenas quando têm valor

---

## 📊 Cálculos e Métricas

### **Cálculo de Lucro Líquido**

```
Lucro Líquido = Receita Bruta - Custos Operacionais - Impostos
```

**Exemplo:**
- Receita Bruta: R$ 1.000,00
- Custos: R$ 200,00
- Impostos (15%): R$ 150,00
- **Lucro Líquido: R$ 650,00**

### **Cálculo de Impostos**

```
Imposto = Valor Bruto × Taxa de Imposto
```

**Condição:** Apenas se `has_invoice = true`

**Exemplo:**
- Valor Bruto: R$ 1.000,00
- Taxa: 15% (0.15)
- **Imposto: R$ 150,00**

### **Agregações para Analytics**

1. **Por Mês:**
   - Agrupa serviços por mês/ano
   - Soma receitas, custos, impostos
   - Conta quantidade de serviços

2. **Por Técnico:**
   - Agrupa por `technician_id`
   - Soma valores totais
   - Calcula média por serviço
   - Conta quantidade

3. **Por Cliente:**
   - Agrupa por `client_id`
   - Soma valores totais
   - Conta quantidade

4. **Status de Pagamento:**
   - Agrupa por `payment_status`
   - Soma valores e conta quantidade

5. **Nota Fiscal:**
   - Agrupa por `has_invoice`
   - Soma valores e conta quantidade

---

## 🎨 Design e UX

### **Paleta de Cores**

- **Primária**: Verde esmeralda (`emerald-600`)
- **Secundária**: Azul (`blue-600`)
- **Sucesso**: Verde (`green-600`)
- **Aviso**: Amarelo (`yellow-600`)
- **Erro**: Vermelho (`red-600`)
- **Info**: Azul (`blue-600`)

### **Componentes Visuais**

- **Cards**: Bordas arredondadas (`rounded-2xl`), sombras sutis
- **Botões**: Bordas arredondadas, estados de hover
- **Inputs**: Bordas arredondadas, focus ring
- **Modais**: Backdrop blur, sombra grande
- **Badges**: Cores por status, arredondados

### **Responsividade**

- **Mobile-first**: Design pensado primeiro para mobile
- **Breakpoints**: `sm:`, `md:`, `lg:`
- **FAB**: Botão flutuante apenas no mobile
- **Grid**: Adapta número de colunas por tamanho de tela

### **Modo Escuro**

- Suportado em todos os componentes
- Cores adaptadas para contraste adequado
- Persistência no `localStorage`

---

## 🚀 Funcionalidades Futuras (Planejadas)

### **Alta Prioridade**

1. **Página de Detalhes do Serviço**
   - Visualização completa de todos os campos
   - Edição de campos extras (location, notes, etc.)
   - Histórico de alterações

2. **Gestão de Configurações**
   - Interface para alterar taxa de imposto
   - Outras configurações globais

3. **Busca Avançada**
   - Busca por texto (descrição, cliente, etc.)
   - Filtros combinados
   - Ordenação customizada

### **Média Prioridade**

4. **Exportação de Dados**
   - Exportar serviços para CSV/Excel
   - Relatórios em PDF

5. **Notificações**
   - Alertas de pagamentos pendentes
   - Lembretes de serviços

6. **Dashboard Personalizado**
   - Widgets configuráveis
   - Gráficos customizados

### **Baixa Prioridade**

7. **Autenticação de Usuários**
   - Login/logout
   - Perfis de usuário
   - Permissões

8. **Integrações**
   - Integração com sistemas de pagamento
   - Integração com emissão de NF-e

9. **App Mobile**
   - Versão nativa para iOS/Android

---

## 📝 Notas Técnicas

### **Tecnologias Utilizadas**

- **Backend:**
  - NestJS (framework Node.js)
  - TypeScript
  - Supabase Client (PostgreSQL)

- **Frontend:**
  - Next.js 14+ (App Router)
  - React 18+
  - TypeScript
  - Tailwind CSS
  - Recharts (gráficos)
  - React Hook Form
  - Lucide React (ícones)
  - date-fns (manipulação de datas)

### **Estrutura de Pastas**

```
backend/
  src/
    services/        # Módulo de serviços
    clients/         # Módulo de clientes
    technicians/     # Módulo de técnicos
    supabase/        # Serviço Supabase
    main.ts          # Entry point

frontend/
  app/               # Páginas (App Router)
  components/        # Componentes React
  lib/               # Utilitários (api.ts)
```

### **Convenções de Código**

- **Naming**: camelCase para variáveis, PascalCase para componentes
- **Formatação**: Prettier (implícito)
- **Tipos**: TypeScript estrito
- **API**: RESTful, JSON responses

---

## 🔄 Fluxo de Dados

### **Criação de Serviço**

```
Frontend (Form) 
  → API POST /services 
  → ServicesService.create() 
  → Calcula tax_amount 
  → Supabase.insert() 
  → Retorna serviço criado 
  → Frontend recarrega lista
```

### **Cálculo de KPIs**

```
Frontend (Dashboard) 
  → API GET /services 
  → Recebe lista de serviços 
  → Aplica filtros (client-side) 
  → Calcula KPIs (client-side) 
  → Renderiza cards
```

### **Analytics**

```
Frontend (Analytics Page) 
  → API GET /services/analytics 
  → ServicesService.getAnalytics() 
  → Busca todos os serviços 
  → Agrupa e calcula (server-side) 
  → Retorna dados agregados 
  → Frontend renderiza gráficos
```

---

## ✅ Checklist de Funcionalidades

### **Implementado**

- ✅ CRUD completo de serviços
- ✅ CRUD completo de clientes
- ✅ CRUD completo de técnicos
- ✅ Cálculo automático de impostos
- ✅ Status automático de serviços
- ✅ Dashboard com KPIs
- ✅ Filtros de serviços
- ✅ Calendário de serviços
- ✅ Página de analytics com gráficos
- ✅ Modo escuro/claro
- ✅ Responsividade mobile
- ✅ Validações de formulário

### **Pendente**

- ⏳ Página de detalhes do serviço
- ⏳ Edição de campos extras
- ⏳ Gestão de configurações (UI)
- ⏳ Busca por texto
- ⏳ Exportação de dados
- ⏳ Autenticação
- ⏳ Notificações

---

## 📚 Glossário

- **KPI**: Key Performance Indicator (Indicador-chave de desempenho)
- **NF**: Nota Fiscal
- **FAB**: Floating Action Button (Botão de ação flutuante)
- **CRUD**: Create, Read, Update, Delete
- **UUID**: Universally Unique Identifier
- **FK**: Foreign Key (Chave estrangeira)
- **API**: Application Programming Interface
- **REST**: Representational State Transfer

---

**Última atualização:** Novembro 2025

