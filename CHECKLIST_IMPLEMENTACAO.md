# ✅ Checklist de Implementação - Frontend Balango v3

## 📋 Ordem de Implementação

### **✅ Estrutura Base (CONCLUÍDO)**
- [x] Criar 4 novas páginas (calendar, cadastros, services, services/[id])
- [x] Atualizar Sidebar com novas rotas
- [x] Criar estrutura de pastas para componentes
- [x] Criar cliente HTTP para APIs (`lib/api/client.ts`)

### **Fase 1: Funções Utilitárias** 🔧
- [ ] Criar `lib/utils/services.ts` - Funções de formatação e cálculos
- [ ] Criar `lib/utils/validations.ts` - Funções de validação
- [ ] Criar `lib/utils/status.ts` - Funções de status e badges
- [ ] Criar `lib/utils/filters.ts` - Funções de filtros
- [ ] Criar `lib/api/client.ts` - Cliente HTTP para consumir APIs

### **Fase 2: Componentes Base** 🧩
- [ ] ServiceCard - Card de serviço
- [ ] ClientCard - Card de cliente
- [ ] TechnicianCard - Card de técnico
- [ ] KPICard - Card de KPI
- [ ] FiltersPanel - Painel de filtros
- [ ] LoadingSpinner - Spinner de carregamento
- [ ] EmptyState - Estado vazio (sem dados)
- [ ] ConfirmDialog - Dialog de confirmação

### **Fase 3: Modais** 📝
- [ ] ServiceModal - Modal criar/editar serviço
- [ ] ClientModal - Modal criar/editar cliente
- [ ] TechnicianModal - Modal criar/editar técnico

### **Fase 4: Dashboard** 📊
- [ ] Página `/dashboard` ou `/`
- [ ] Header com toggle modo escuro e filtros
- [ ] Cards de KPI (4 principais + 1 destaque)
- [ ] Lista de serviços com ServiceCard
- [ ] FAB para mobile
- [ ] Integração com API

### **Fase 5: Cadastros** 👥
- [ ] Página `/cadastros`
- [ ] Tabs para alternar Clientes/Técnicos
- [ ] Lista de clientes com ClientCard
- [ ] Lista de técnicos com TechnicianCard
- [ ] Integração com API

### **Fase 6: Calendário** 📅
- [ ] Página `/calendar`
- [ ] Navegação entre meses
- [ ] Grid de calendário
- [ ] Indicadores visuais por dia
- [ ] Modal de serviços do dia
- [ ] Integração com API

### **Fase 7: Lista de Serviços** 📋
- [ ] Página `/services`
- [ ] Header com filtros e busca
- [ ] Lista de serviços
- [ ] Integração com API

### **Fase 8: Detalhes do Serviço** 🔍
- [ ] Página `/services/[id]`
- [ ] Visualização completa
- [ ] Modo edição
- [ ] Cards organizados
- [ ] Integração com API

### **Fase 9: Configurações** ⚙️
- [ ] Página `/settings`
- [ ] Card de taxa de imposto
- [ ] Formulário de edição
- [ ] Integração com API

---

## 📝 Notas

- ✅ = Concluído
- ⏳ = Em progresso
- ⬜ = Pendente

**Última atualização:** Novembro 2025

