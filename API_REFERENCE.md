# 🔌 API Reference - Balango v3

Documentação completa de todas as rotas da API.

---

## 🔐 Autenticação

Todas as rotas requerem autenticação via Supabase Auth. O token deve ser enviado nos cookies da requisição.

**Erro de autenticação:**
```json
{
  "error": "Não autenticado"
}
```
Status: `401`

---

## 📋 Serviços

### `GET /api/services`
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
    "status": "pendente",
    "payment_status": "pendente",
    "client": {
      "id": "uuid",
      "name": "Cliente A",
      "email": "cliente@email.com",
      "phone": "11999999999"
    },
    "technician": {
      "id": "uuid",
      "name": "João Silva",
      "nickname": "João",
      "email": "joao@email.com",
      "phone": "11988888888"
    }
  }
]
```

---

### `POST /api/services`
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

**Campos obrigatórios:**
- `date` (string) - Data do serviço (YYYY-MM-DD)
- `client_id` (string) - ID do cliente
- `technician_id` (string) - ID do técnico
- `gross_value` (number) - Valor bruto

**Valores padrão aplicados:**
- `status`: "pendente"
- `payment_status`: "pendente"
- `priority`: "media"
- `operational_cost`: 0
- `tax_amount`: Calculado automaticamente se `has_invoice = true`

**Resposta:** Serviço criado (mesmo formato do GET)

Status: `201`

---

### `GET /api/services/[id]`
Busca um serviço específico.

**Resposta:** Mesmo formato do GET /api/services (array com 1 item)

Status: `404` se não encontrado

---

### `PATCH /api/services/[id]`
Atualiza um serviço.

**Body:** Campos parciais (apenas os que deseja atualizar)
```json
{
  "gross_value": 1200.00,
  "has_invoice": true
}
```

**Comportamento automático:**
- Recalcula `tax_amount` se `has_invoice` ou `gross_value` mudarem
- Atualiza `status` automaticamente baseado em `start_date` e `completed_date`
- Remove campos `undefined`, `null` ou strings vazias (exceto campos de texto livre)

**Resposta:** Serviço atualizado

---

### `DELETE /api/services/[id]`
Exclui um serviço.

**Resposta:**
```json
{
  "message": "Serviço deletado com sucesso"
}
```

---

### `GET /api/services/clients`
Lista todos os clientes ativos (para dropdowns).

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "Cliente A"
  }
]
```

---

### `GET /api/services/technicians`
Lista todos os técnicos ativos (para dropdowns).

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "João Silva",
    "nickname": "João"
  }
]
```

---

### `GET /api/services/analytics`
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
  "byClient": [
    {
      "name": "Cliente A",
      "quantidade": 3,
      "valorTotal": 3000
    }
  ],
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

---

### `GET /api/services/calendar/[year]/[month]`
Retorna serviços agrupados por dia do mês.

**Parâmetros:**
- `year` (string) - Ano (ex: "2025")
- `month` (string) - Mês (ex: "11")

**Resposta:**
```json
{
  "1": [
    {
      "id": "uuid",
      "date": "2025-11-01",
      "gross_value": 1000,
      "has_invoice": true,
      "client": {
        "name": "Cliente A"
      },
      "technician": {
        "name": "João"
      }
    }
  ],
  "15": [...]
}
```

---

## 👥 Clientes

### `GET /api/clients`
Lista todos os clientes.

**Query params:**
- `includeInactive` (boolean) - Incluir clientes inativos (default: false)

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "Cliente A",
    "email": "cliente@email.com",
    "phone": "11999999999",
    "document": "12345678900",
    "address": "Rua Exemplo, 123",
    "active": true,
    "created_at": "2025-11-01T00:00:00Z",
    "updated_at": "2025-11-01T00:00:00Z"
  }
]
```

---

### `POST /api/clients`
Cria um novo cliente.

**Body:**
```json
{
  "name": "Cliente A",
  "email": "cliente@email.com",
  "phone": "11999999999",
  "document": "12345678900",
  "address": "Rua Exemplo, 123",
  "active": true
}
```

**Campos obrigatórios:**
- `name` (string)

**Valores padrão:**
- `active`: true

**Resposta:** Cliente criado

Status: `201`

---

### `GET /api/clients/[id]`
Busca um cliente específico.

**Resposta:** Cliente (mesmo formato do GET)

Status: `404` se não encontrado

---

### `PATCH /api/clients/[id]`
Atualiza um cliente.

**Body:** Campos parciais
```json
{
  "name": "Cliente B",
  "active": false
}
```

**Resposta:** Cliente atualizado

---

### `DELETE /api/clients/[id]`
Exclui um cliente.

**Validação:** Não permite excluir se houver serviços vinculados.

**Resposta:**
```json
{
  "message": "Cliente deletado com sucesso"
}
```

Status: `400` se houver serviços vinculados

---

## 🔧 Técnicos

### `GET /api/technicians`
Lista todos os técnicos.

**Query params:**
- `includeInactive` (boolean) - Incluir técnicos inativos (default: false)

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "João Silva",
    "nickname": "João",
    "email": "joao@email.com",
    "phone": "11988888888",
    "document": "12345678900",
    "active": true,
    "created_at": "2025-11-01T00:00:00Z",
    "updated_at": "2025-11-01T00:00:00Z"
  }
]
```

---

### `POST /api/technicians`
Cria um novo técnico.

**Body:**
```json
{
  "name": "João Silva",
  "nickname": "João",
  "email": "joao@email.com",
  "phone": "11988888888",
  "document": "12345678900",
  "active": true
}
```

**Campos obrigatórios:**
- `name` (string)

**Valores padrão:**
- `active`: true

**Resposta:** Técnico criado

Status: `201`

---

### `GET /api/technicians/[id]`
Busca um técnico específico.

**Resposta:** Técnico (mesmo formato do GET)

Status: `404` se não encontrado

---

### `PATCH /api/technicians/[id]`
Atualiza um técnico.

**Body:** Campos parciais
```json
{
  "nickname": "Joãozinho",
  "active": false
}
```

**Resposta:** Técnico atualizado

---

### `DELETE /api/technicians/[id]`
Exclui um técnico.

**Validação:** Não permite excluir se houver serviços vinculados.

**Resposta:**
```json
{
  "message": "Técnico deletado com sucesso"
}
```

Status: `400` se houver serviços vinculados

---

## ⚙️ Configurações

### `GET /api/settings`
Lista todas as configurações.

**Resposta:**
```json
[
  {
    "key": "tax_rate",
    "value": 0.15,
    "description": "Taxa de imposto (15%)"
  }
]
```

---

### `POST /api/settings`
Cria ou atualiza uma configuração.

**Body:**
```json
{
  "key": "tax_rate",
  "value": 0.15,
  "description": "Taxa de imposto (15%)"
}
```

**Campos obrigatórios:**
- `key` (string)
- `value` (number)

**Comportamento:** Se a configuração já existe, atualiza. Se não existe, cria.

**Resposta:** Configuração criada/atualizada

Status: `201` se criado, `200` se atualizado

---

### `GET /api/settings/[key]`
Busca uma configuração específica.

**Resposta:**
```json
{
  "key": "tax_rate",
  "value": 0.15,
  "description": "Taxa de imposto (15%)"
}
```

Status: `404` se não encontrado

---

### `PATCH /api/settings/[key]`
Atualiza uma configuração específica.

**Body:**
```json
{
  "value": 0.18,
  "description": "Taxa de imposto atualizada (18%)"
}
```

**Resposta:** Configuração atualizada

Status: `404` se não encontrado

---

## ❌ Códigos de Erro

### `400 Bad Request`
- Dados inválidos
- Validação falhou
- Tentativa de excluir registro com relacionamentos

### `401 Unauthorized`
- Não autenticado
- Token inválido ou expirado

### `404 Not Found`
- Recurso não encontrado
- ID inválido

### `500 Internal Server Error`
- Erro no servidor
- Erro no banco de dados

---

## 📝 Notas Importantes

1. **Cálculo de Impostos:**
   - Calculado automaticamente quando `has_invoice = true`
   - Usa a taxa de `app_settings` onde `key = 'tax_rate'`
   - Se não houver configuração, assume `tax_rate = 0`

2. **Status Automático:**
   - `pendente` → `em_andamento` quando `start_date` é preenchido
   - `em_andamento` → `concluido` quando `completed_date` é preenchido
   - `em_andamento` → `pendente` quando `start_date` é removido

3. **Validações:**
   - Cliente e técnico devem existir antes de criar serviço
   - Não é possível excluir cliente/técnico com serviços vinculados
   - Valores numéricos não podem ser negativos

4. **Formato de Datas:**
   - `date`: YYYY-MM-DD (ex: "2025-11-15")
   - `start_date` / `completed_date`: ISO 8601 timestamp

5. **Relacionamentos:**
   - Serviços sempre retornam com `client` e `technician` (pode ser null)
   - Campos de relacionamento são formatados para facilitar uso no frontend

---

**Última atualização:** Novembro 2025

