# 📋 Análise de Funcionalidades Pendentes

**Análise completa do que precisa ser implementado e o que já está pronto**

---

## ✅ O Que Já Está Pronto (Backend)

### **1. Calendário** ✅
- ✅ **API Route:** `/api/services/calendar/[year]/[month]` - **IMPLEMENTADA**
- ✅ **Client API:** `servicesApi.getCalendar()` - **IMPLEMENTADA**
- ⚠️ **Frontend:** Página vazia - **PRECISA IMPLEMENTAR**

**O que a API retorna:**
```json
{
  "1": [
    {
      "id": "uuid",
      "date": "2025-11-01",
      "gross_value": 1000,
      "has_invoice": true,
      "client": { "name": "Cliente A" },
      "technician": { "name": "João" }
    }
  ],
  "15": [...]
}
```

**Tabelas necessárias:** ❌ **NENHUMA** - Usa tabela `services` existente

**Funções necessárias:** ❌ **NENHUMA** - Query simples com agrupamento

---

### **2. Lista de Serviços** ✅
- ✅ **API Route:** `/api/services` (GET) - **IMPLEMENTADA**
- ✅ **Client API:** `servicesApi.getAll()` - **IMPLEMENTADA**
- ⚠️ **Frontend:** Página vazia - **PRECISA IMPLEMENTAR**

**Tabelas necessárias:** ❌ **NENHUMA** - Usa tabela `services` existente

**Funções necessárias:** ❌ **NENHUMA** - Query simples

---

### **3. Detalhes do Serviço** ✅
- ✅ **API Route:** `/api/services/[id]` (GET, PATCH, DELETE) - **IMPLEMENTADA**
- ✅ **Client API:** `servicesApi.getById()`, `update()`, `delete()` - **IMPLEMENTADA**
- ⚠️ **Frontend:** Página vazia - **PRECISA IMPLEMENTAR**

**Tabelas necessárias:** ❌ **NENHUMA** - Usa tabela `services` existente

**Funções necessárias:** ❌ **NENHUMA** - Query simples

---

## 🔍 Análise Detalhada: Calendário

### **Lógica Atual da API**

A API `/api/services/calendar/[year]/[month]` já faz:

1. **Validação:**
   - Verifica autenticação
   - Valida ano e mês (1-12)

2. **Query no Banco:**
   ```sql
   SELECT 
     id, date, gross_value, has_invoice,
     clients:client_id (id, name),
     technicians:technician_id (id, name, nickname)
   FROM services
   WHERE date >= primeiro_dia_mes
     AND date <= ultimo_dia_mes
     AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
   ORDER BY date ASC
   ```

3. **Agrupamento:**
   - Agrupa serviços por dia do mês
   - Retorna objeto `{ "1": [...], "15": [...] }`

4. **RLS:** ✅ Já filtra automaticamente por organização

### **O Que Falta no Frontend**

1. **Componente CalendarGrid:**
   - Grid 7xN (dias da semana)
   - Navegação entre meses
   - Indicadores visuais por dia

2. **Componente DayCell:**
   - Exibe dia do mês
   - Ponto colorido (verde/amarelo/vermelho)
   - Contador de serviços
   - Valor total do dia
   - Ícone de NF (se houver)

3. **Modal DayServicesModal:**
   - Lista serviços do dia
   - Informações: cliente, técnico, valor, NF

4. **Lógica de Indicadores:**
   - Verde: 1-2 serviços
   - Amarelo: 3-5 serviços
   - Vermelho: 6+ serviços

### **Tabelas/Funções Necessárias:** ❌ **NENHUMA**

**Conclusão:** O calendário **NÃO precisa de tabelas ou funções novas**. Tudo já está pronto no backend, só falta implementar o frontend.

---

## 🎯 Sugestões de Funcionalidades Adicionais

### **Prioridade ALTA** 🔴

#### **1. Histórico de Alterações (Audit Log)**
**Por quê:** Rastreabilidade de mudanças em serviços, clientes, etc.

**Tabela necessária:**
```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL, -- 'services', 'clients', etc.
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Função necessária:**
```sql
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id, organization_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid(), OLD.organization_id);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id, organization_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid(), NEW.organization_id);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id, organization_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid(), NEW.organization_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**Triggers:**
```sql
CREATE TRIGGER audit_services AFTER INSERT OR UPDATE OR DELETE ON services
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();
```

**API Route:** `/api/services/[id]/history` - Retorna histórico de alterações

---

#### **2. Notificações**
**Por quê:** Alertar sobre serviços pendentes, pagamentos atrasados, etc.

**Tabela necessária:**
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  type TEXT NOT NULL, -- 'service_pending', 'payment_overdue', 'service_completed'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  related_id UUID, -- ID do serviço, cliente, etc.
  related_type TEXT, -- 'service', 'client', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Função necessária:**
```sql
-- Criar notificação quando serviço fica pendente há muito tempo
CREATE OR REPLACE FUNCTION check_overdue_services()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, organization_id, type, title, message, related_id, related_type)
  SELECT 
    u.id,
    s.organization_id,
    'service_pending',
    'Serviço pendente há mais de 7 dias',
    'O serviço do cliente ' || c.name || ' está pendente há mais de 7 dias',
    s.id,
    'service'
  FROM services s
  JOIN users u ON u.organization_id = s.organization_id
  JOIN clients c ON c.id = s.client_id
  WHERE s.status = 'pendente'
    AND s.date < NOW() - INTERVAL '7 days'
    AND u.active = true;
END;
$$ LANGUAGE plpgsql;
```

**API Routes:**
- `GET /api/notifications` - Lista notificações do usuário
- `PATCH /api/notifications/[id]/read` - Marca como lida
- `DELETE /api/notifications/[id]` - Remove notificação

---

#### **3. Relatórios e Exportação**
**Por quê:** Exportar dados para Excel/PDF, gerar relatórios mensais

**Tabelas necessárias:** ❌ **NENHUMA** - Usa dados existentes

**Funções necessárias:**
```sql
-- Função para gerar relatório mensal
CREATE OR REPLACE FUNCTION generate_monthly_report(
  p_year INTEGER,
  p_month INTEGER,
  p_organization_id UUID
)
RETURNS TABLE (
  total_services INTEGER,
  total_revenue NUMERIC,
  total_costs NUMERIC,
  total_taxes NUMERIC,
  net_profit NUMERIC,
  by_technician JSONB,
  by_client JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_services,
    SUM(gross_value) as total_revenue,
    SUM(operational_cost) as total_costs,
    SUM(tax_amount) as total_taxes,
    SUM(gross_value - operational_cost - tax_amount) as net_profit,
    -- Agregações por técnico e cliente (JSONB)
    (SELECT jsonb_agg(...) FROM ...) as by_technician,
    (SELECT jsonb_agg(...) FROM ...) as by_client
  FROM services
  WHERE organization_id = p_organization_id
    AND EXTRACT(YEAR FROM date) = p_year
    AND EXTRACT(MONTH FROM date) = p_month;
END;
$$ LANGUAGE plpgsql;
```

**API Routes:**
- `GET /api/reports/monthly?year=2025&month=11` - Relatório mensal
- `GET /api/reports/export?format=excel&year=2025&month=11` - Exportar Excel
- `GET /api/reports/export?format=pdf&year=2025&month=11` - Exportar PDF

---

### **Prioridade MÉDIA** 🟡

#### **4. Comentários em Serviços**
**Por quê:** Permitir comunicação sobre serviços

**Tabela necessária:**
```sql
CREATE TABLE public.service_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tabelas necessárias:** ✅ **1 nova tabela**

**API Routes:**
- `GET /api/services/[id]/comments` - Lista comentários
- `POST /api/services/[id]/comments` - Cria comentário
- `PATCH /api/services/[id]/comments/[commentId]` - Atualiza comentário
- `DELETE /api/services/[id]/comments/[commentId]` - Remove comentário

---

#### **5. Anexos/Documentos**
**Por quê:** Anexar fotos, documentos, notas fiscais aos serviços

**Tabela necessária:**
```sql
CREATE TABLE public.service_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- URL do Supabase Storage
  file_type TEXT, -- 'image', 'pdf', 'document'
  file_size INTEGER, -- em bytes
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Storage necessário:**
- Bucket no Supabase Storage: `service-attachments`
- Políticas de acesso por organização

**Tabelas necessárias:** ✅ **1 nova tabela + Storage**

**API Routes:**
- `POST /api/services/[id]/attachments` - Upload de arquivo
- `GET /api/services/[id]/attachments` - Lista anexos
- `DELETE /api/services/[id]/attachments/[attachmentId]` - Remove anexo

---

#### **6. Lembretes e Tarefas**
**Por quê:** Criar lembretes para serviços futuros

**Tabela necessária:**
```sql
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  service_id UUID REFERENCES services(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tabelas necessárias:** ✅ **1 nova tabela**

**API Routes:**
- `GET /api/reminders` - Lista lembretes
- `POST /api/reminders` - Cria lembrete
- `PATCH /api/reminders/[id]` - Atualiza lembrete
- `DELETE /api/reminders/[id]` - Remove lembrete

---

### **Prioridade BAIXA** 🟢

#### **7. Categorias de Serviços**
**Por quê:** Organizar serviços por categoria

**Tabela necessária:**
```sql
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Cor para UI
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Alteração necessária:**
- Adicionar `category_id` na tabela `services`

**Tabelas necessárias:** ✅ **1 nova tabela + alteração em services**

---

#### **8. Tags/Labels**
**Por quê:** Marcar serviços com tags para filtros

**Tabela necessária:**
```sql
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.service_tags (
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, tag_id)
);
```

**Tabelas necessárias:** ✅ **2 novas tabelas**

---

#### **9. Integração com Email**
**Por quê:** Enviar emails para clientes, notificações

**Tabelas necessárias:** ❌ **NENHUMA** - Usa serviço externo (Resend, SendGrid)

**Função necessária:**
- Integração com API de email (Resend, SendGrid, etc.)
- Templates de email

**API Routes:**
- `POST /api/services/[id]/send-email` - Envia email ao cliente
- `POST /api/notifications/send-email` - Envia notificação por email

---

#### **10. Dashboard Personalizado**
**Por quê:** Permitir usuários escolherem quais gráficos ver

**Tabela necessária:**
```sql
CREATE TABLE public.user_dashboard_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  selected_charts JSONB, -- Array de IDs de gráficos
  layout JSONB, -- Layout personalizado
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tabelas necessárias:** ✅ **1 nova tabela**

---

## 📊 Resumo: Tabelas e Funções Necessárias

### **Para Funcionalidades Pendentes (Calendário, Lista, Detalhes)**
- **Tabelas:** ❌ **0** - Tudo usa tabelas existentes
- **Funções:** ❌ **0** - Queries simples

### **Para Funcionalidades Adicionais Sugeridas**

| Funcionalidade | Tabelas Novas | Funções Novas | Storage |
|---------------|---------------|---------------|---------|
| Histórico (Audit Log) | 1 | 1 trigger function | ❌ |
| Notificações | 1 | 1 função | ❌ |
| Relatórios/Exportação | 0 | 1 função | ❌ |
| Comentários | 1 | 0 | ❌ |
| Anexos | 1 | 0 | ✅ Supabase Storage |
| Lembretes | 1 | 0 | ❌ |
| Categorias | 1 | 0 | ❌ |
| Tags | 2 | 0 | ❌ |
| Email | 0 | Integração externa | ❌ |
| Dashboard Personalizado | 1 | 0 | ❌ |

**Total:** 9 tabelas novas + 2 funções + 1 integração externa

---

## 🎯 Recomendações de Implementação

### **Fase 1: Funcionalidades Pendentes (SEM tabelas novas)**
1. ✅ **Calendário** - Apenas frontend
2. ✅ **Lista de Serviços** - Apenas frontend
3. ✅ **Detalhes do Serviço** - Apenas frontend

**Tempo estimado:** 12-16 horas  
**Tabelas necessárias:** 0  
**Funções necessárias:** 0

---

### **Fase 2: Funcionalidades Essenciais**
1. ✅ **Histórico de Alterações** - 1 tabela + 1 função
2. ✅ **Notificações** - 1 tabela + 1 função
3. ✅ **Relatórios** - 1 função (sem tabelas)

**Tempo estimado:** 20-25 horas  
**Tabelas necessárias:** 2  
**Funções necessárias:** 3

---

### **Fase 3: Funcionalidades de Produtividade**
1. ✅ **Comentários** - 1 tabela
2. ✅ **Anexos** - 1 tabela + Storage
3. ✅ **Lembretes** - 1 tabela

**Tempo estimado:** 15-20 horas  
**Tabelas necessárias:** 3  
**Storage:** 1 bucket

---

### **Fase 4: Funcionalidades Avançadas**
1. ✅ **Categorias** - 1 tabela + alteração em services
2. ✅ **Tags** - 2 tabelas
3. ✅ **Dashboard Personalizado** - 1 tabela
4. ✅ **Integração Email** - Integração externa

**Tempo estimado:** 20-30 horas  
**Tabelas necessárias:** 4  
**Integrações:** 1

---

## ✅ Conclusão

### **Para Implementar Calendário, Lista e Detalhes:**
- ❌ **NÃO precisa de tabelas novas**
- ❌ **NÃO precisa de funções novas**
- ✅ **Só precisa implementar o frontend**

### **Para Funcionalidades Adicionais:**
- ✅ **9 tabelas novas** (se implementar todas)
- ✅ **2 funções novas** (audit log + notificações)
- ✅ **1 integração externa** (email)

### **Recomendação:**
1. **Primeiro:** Implementar funcionalidades pendentes (calendário, lista, detalhes) - **SEM tabelas novas**
2. **Depois:** Adicionar funcionalidades essenciais (histórico, notificações) - **COM tabelas novas**
3. **Por último:** Funcionalidades avançadas (anexos, categorias, etc.)

---

**Última atualização:** Dezembro 2024

