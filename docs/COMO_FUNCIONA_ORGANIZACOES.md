# Como Funciona o Sistema de Organizações

## 🔐 Isolamento de Dados

### 1. **Row Level Security (RLS)**
As políticas RLS no banco de dados garantem que:
- Você só vê dados das organizações que é membro
- Você só pode criar/editar dados da organização atual
- O banco filtra automaticamente por `organization_id`

### 2. **Fluxo de Dados**

```
Frontend (React)
  ↓
useOrganization() → currentOrganization.id
  ↓
API Route → Recebe organization_id
  ↓
Supabase Query → Filtra por organization_id
  ↓
RLS Policy → Valida se usuário é membro
  ↓
Retorna apenas dados da organização
```

### 3. **Exemplo Prático**

**Cenário:** Você é membro da "Organização Padrão"

1. **Ao listar serviços:**
   - Frontend envia `organization_id` da organização atual
   - API filtra: `WHERE organization_id = 'xxx'`
   - RLS valida: você é membro? ✅
   - Retorna apenas serviços dessa organização

2. **Ao criar um serviço:**
   - Frontend envia dados + `organization_id`
   - API salva com `organization_id`
   - RLS valida: você é membro? ✅
   - Serviço criado na organização correta

3. **Ao mudar de organização:**
   - Você seleciona outra organização no header
   - `currentOrganization` muda no contexto
   - Todas as queries passam a usar o novo `organization_id`
   - Você vê apenas dados da nova organização

## 📋 Regras de Permissão

### **Admin:**
- ✅ Ver todos os dados da organização
- ✅ Criar/editar/deletar serviços, clientes, técnicos
- ✅ Gerenciar configurações (taxa de imposto)
- ✅ Gerenciar membros (adicionar, remover, alterar roles)

### **Member:**
- ✅ Ver todos os dados da organização
- ✅ Criar/editar serviços, clientes, técnicos
- ❌ Gerenciar configurações
- ❌ Gerenciar membros

## 🔄 Como os Dados São Salvos

1. **Frontend:**
   ```typescript
   const { currentOrganization } = useOrganization()
   // currentOrganization.id → "uuid-da-organizacao"
   ```

2. **API:**
   ```typescript
   // Ao criar serviço
   await supabase.from('services').insert({
     ...dados,
     organization_id: currentOrganization.id
   })
   ```

3. **Banco:**
   - Registro salvo com `organization_id`
   - RLS garante que só membros vejam

## ⚠️ Importante

- **Cada organização tem seus próprios dados isolados**
- **Você pode ser membro de múltiplas organizações**
- **Ao mudar de organização, você vê apenas dados dela**
- **RLS no banco é a camada final de segurança**

