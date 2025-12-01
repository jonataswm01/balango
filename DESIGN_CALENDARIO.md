# 📅 Design do Calendário - Mobile First

**Proposta de design moderno e funcional para o calendário, otimizado para mobile**

---

## 🎨 Princípios de Design

### **1. Mobile-First**
- ✅ Touch-friendly (áreas de toque ≥ 44x44px)
- ✅ Navegação por swipe (opcional)
- ✅ Layout compacto mas legível
- ✅ Performance otimizada

### **2. Consistência Visual**
- ✅ Usar paleta de cores existente (azul, verde, amarelo, vermelho)
- ✅ Seguir padrões de cards e badges já estabelecidos
- ✅ Suporte a modo escuro
- ✅ Bordas arredondadas (`rounded-lg`)

### **3. Indicadores Visuais Claros**
- ✅ Cores intuitivas (verde = pouco, vermelho = muito)
- ✅ Ícones para NF (nota fiscal)
- ✅ Contadores visíveis
- ✅ Destaque para dia atual

---

## 📱 Layout Mobile (Principal)

### **Estrutura Geral**

```
┌─────────────────────────────────────┐
│  [←]  Novembro 2025  [→]          │  ← Header com navegação
├─────────────────────────────────────┤
│  Dom Seg Ter Qua Qui Sex Sáb       │  ← Cabeçalho dias da semana
├─────────────────────────────────────┤
│  [ ] [ ] [ ] [ ] [1] [2] [3]       │  ← Semana 1
│  [4] [5] [6] [7] [8] [9] [10]      │  ← Semana 2
│  [11] [12] [13] [14] [15] [16] [17]│  ← Semana 3
│  [18] [19] [20] [21] [22] [23] [24]│  ← Semana 4
│  [25] [26] [27] [28] [29] [30] [ ] │  ← Semana 5
└─────────────────────────────────────┘
```

### **Componente: Header de Navegação**

**Design:**
- **Altura:** 64px (mobile), 72px (desktop)
- **Background:** Branco (light) / slate-900 (dark)
- **Bordas:** Borda inferior sutil
- **Layout:** Flex horizontal centralizado

**Elementos:**
```
┌─────────────────────────────────────┐
│  [←]    Novembro 2025    [→]       │
│  [Hoje]                             │  ← Botão "Hoje" (opcional)
└─────────────────────────────────────┘
```

**Especificações:**
- **Botões de navegação:** 40x40px, ícones `ChevronLeft`/`ChevronRight`
- **Título:** Texto grande (text-xl), peso bold
- **Botão "Hoje":** Pequeno, abaixo do título (opcional)

**Código sugerido:**
```tsx
<div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
  <div className="flex items-center justify-between p-4">
    <Button variant="ghost" size="icon" onClick={previousMonth}>
      <ChevronLeft className="h-5 w-5" />
    </Button>
    <div className="text-center">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {formatMonthYear(currentDate)}
      </h2>
      <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
        Hoje
      </Button>
    </div>
    <Button variant="ghost" size="icon" onClick={nextMonth}>
      <ChevronRight className="h-5 w-5" />
    </Button>
  </div>
</div>
```

---

### **Componente: Grid de Calendário**

**Design:**
- **Grid:** 7 colunas (dias da semana)
- **Células:** Mínimo 48x48px (touch-friendly)
- **Espaçamento:** Gap de 2px entre células
- **Background:** Branco (light) / slate-900 (dark)

**Cabeçalho (Dias da Semana):**
```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Dom │ Seg │ Ter │ Qua │ Qui │ Sex │ Sáb │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

**Especificações:**
- **Altura:** 32px
- **Texto:** text-xs, peso medium, cor slate-600
- **Background:** slate-50 (light) / slate-800 (dark)

**Código sugerido:**
```tsx
<div className="grid grid-cols-7 gap-0.5 bg-slate-50 dark:bg-slate-800 p-2">
  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
    <div key={day} className="text-center text-xs font-medium text-slate-600 dark:text-slate-400 py-2">
      {day}
    </div>
  ))}
</div>
```

---

### **Componente: DayCell (Célula do Dia)**

**Estados Visuais:**

#### **1. Dia Vazio (sem serviços)**
- Background: Branco (light) / slate-800 (dark)
- Texto: Número do dia em slate-600
- Borda: 1px slate-200 (light) / slate-700 (dark)
- Hover: Background slate-50 (light) / slate-750 (dark)

#### **2. Dia com Serviços**
- Background: Branco (light) / slate-800 (dark)
- **Indicador:** Ponto colorido no topo
- **Contador:** Badge pequeno com número
- **Valor:** Texto pequeno formatado (R$ X)
- **Ícone NF:** Se houver NF, ícone de documento

#### **3. Dia Atual (Hoje)**
- **Borda:** 2px azul (blue-500)
- **Background:** Azul claro (blue-50) / azul escuro (blue-900/20)
- **Texto:** Negrito

#### **4. Dia de Outro Mês**
- **Opacidade:** 40%
- **Background:** Cinza claro (slate-100) / slate-900
- **Texto:** Cinza (slate-400)

**Layout da Célula:**
```
┌─────────────────┐
│  ● (indicador)  │  ← Ponto colorido (topo)
│                 │
│      15         │  ← Número do dia (centro)
│                 │
│   R$ 1.200      │  ← Valor total (baixo)
│   📄            │  ← Ícone NF (se houver)
└─────────────────┘
```

**Código sugerido:**
```tsx
<div
  className={cn(
    "relative min-h-[64px] p-2 rounded-lg border cursor-pointer transition-all",
    "hover:bg-slate-50 dark:hover:bg-slate-800",
    isToday && "border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 font-bold",
    isOtherMonth && "opacity-40 bg-slate-100 dark:bg-slate-900",
    hasServices && "bg-white dark:bg-slate-800"
  )}
  onClick={() => hasServices && onDayClick(day)}
>
  {/* Indicador de quantidade (ponto colorido) */}
  {hasServices && (
    <div className={cn(
      "absolute top-1 right-1 w-2 h-2 rounded-full",
      getIndicatorColor(serviceCount)
    )} />
  )}
  
  {/* Número do dia */}
  <div className={cn(
    "text-center text-sm font-medium",
    isToday && "text-blue-600 dark:text-blue-400"
  )}>
    {dayNumber}
  </div>
  
  {/* Informações do dia */}
  {hasServices && (
    <div className="mt-1 space-y-0.5">
      {/* Contador */}
      <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
        {serviceCount} serviço{serviceCount > 1 ? 's' : ''}
      </div>
      
      {/* Valor total */}
      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 text-center">
        {formatCurrency(totalValue)}
      </div>
      
      {/* Ícone NF */}
      {hasInvoice && (
        <div className="flex justify-center">
          <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        </div>
      )}
    </div>
  )}
</div>
```

---

### **Lógica de Cores dos Indicadores**

**Sistema de Cores:**
- **Verde (emerald-500):** 1-2 serviços (pouco movimento)
- **Amarelo (amber-500):** 3-5 serviços (movimento médio)
- **Vermelho (red-500):** 6+ serviços (muito movimento)

**Função:**
```tsx
function getIndicatorColor(count: number): string {
  if (count <= 2) return "bg-emerald-500"
  if (count <= 5) return "bg-amber-500"
  return "bg-red-500"
}
```

---

### **Componente: Modal de Serviços do Dia**

**Design:**
- **Tipo:** Sheet (slide up do bottom no mobile)
- **Altura:** 70% da tela (mobile), 80% (desktop)
- **Background:** Branco (light) / slate-900 (dark)
- **Header:** Fixo no topo com data e botão fechar
- **Conteúdo:** Lista scrollável de serviços

**Layout:**
```
┌─────────────────────────────────────┐
│  15 de Novembro de 2025        [X] │  ← Header fixo
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Cliente: João Silva          │   │  ← Card de serviço
│  │ Técnico: Maria               │   │
│  │ Valor: R$ 1.200              │   │
│  │ 📄 NF: 123456                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Cliente: Pedro Santos        │   │
│  │ Técnico: Carlos              │   │
│  │ Valor: R$ 800                │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Total: R$ 2.000]                 │  ← Footer fixo
└─────────────────────────────────────┘
```

**Especificações:**
- **Header:** Altura 56px, background slate-50, borda inferior
- **Cards:** Reutilizar `ServiceCard` ou criar versão compacta
- **Footer:** Total do dia, altura 64px, background slate-50
- **Scroll:** Apenas no conteúdo (não no header/footer)

**Código sugerido:**
```tsx
<Sheet open={isOpen} onOpenChange={onClose}>
  <SheetContent side="bottom" className="h-[70vh] p-0">
    {/* Header */}
    <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatDate(selectedDate)}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {services.length} serviço{services.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
    
    {/* Conteúdo scrollável */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
    
    {/* Footer com total */}
    <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Total do dia:
        </span>
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(totalValue)}
        </span>
      </div>
    </div>
  </SheetContent>
</Sheet>
```

---

## 🖥️ Layout Desktop (Opcional - Melhorias)

### **Diferenças do Mobile:**
- **Células maiores:** 80x80px (mais espaço para informações)
- **Hover states:** Mais visíveis
- **Modal:** Dialog ao invés de Sheet (centro da tela)
- **Sidebar:** Filtros laterais (opcional)

---

## 🎯 Funcionalidades Interativas

### **1. Navegação entre Meses**
- **Botões:** ← e → no header
- **Swipe:** (Opcional) Swipe left/right para mudar mês
- **Botão "Hoje":** Volta para mês atual

### **2. Seleção de Dia**
- **Click/Tap:** Abre modal com serviços do dia
- **Visual feedback:** Animação suave ao clicar
- **Desabilitado:** Dias sem serviços não são clicáveis

### **3. Indicadores Visuais**
- **Ponto colorido:** Topo direito da célula
- **Contador:** Badge com número de serviços
- **Valor:** Formatação de moeda (R$ X)
- **Ícone NF:** FileText se houver nota fiscal

### **4. Performance**
- **Lazy loading:** Carregar apenas mês atual
- **Cache:** Manter dados do mês anterior em memória
- **Loading state:** Skeleton enquanto carrega

---

## 🎨 Paleta de Cores Específica

### **Cores do Calendário:**
- **Background geral:** `bg-white dark:bg-slate-900`
- **Cabeçalho:** `bg-slate-50 dark:bg-slate-800`
- **Bordas:** `border-slate-200 dark:border-slate-700`
- **Dia atual:** `border-blue-500 bg-blue-50 dark:bg-blue-900/20`
- **Texto principal:** `text-slate-900 dark:text-slate-100`
- **Texto secundário:** `text-slate-600 dark:text-slate-400`

### **Indicadores:**
- **Verde (1-2):** `bg-emerald-500`
- **Amarelo (3-5):** `bg-amber-500`
- **Vermelho (6+):** `bg-red-500`

---

## 📐 Especificações Técnicas

### **Breakpoints:**
- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md)
- **Desktop:** > 1024px (lg)

### **Tamanhos:**
- **Célula mobile:** Mínimo 48x48px (touch-friendly)
- **Célula desktop:** 80x80px
- **Gap entre células:** 2px (mobile), 4px (desktop)
- **Padding geral:** 16px (mobile), 24px (desktop)

### **Animações:**
- **Transição de mês:** Fade in/out (300ms)
- **Click em célula:** Scale (0.95 → 1.0, 150ms)
- **Modal:** Slide up (300ms)

---

## ✅ Checklist de Implementação

### **Componentes Necessários:**
- [ ] `CalendarHeader` - Header com navegação
- [ ] `CalendarGrid` - Grid principal
- [ ] `DayCell` - Célula individual do dia
- [ ] `DayServicesModal` - Modal com serviços do dia
- [ ] `CalendarPage` - Página principal

### **Funcionalidades:**
- [ ] Navegação entre meses
- [ ] Cálculo de indicadores (cores)
- [ ] Formatação de valores
- [ ] Detecção de dia atual
- [ ] Loading states
- [ ] Error handling
- [ ] Suporte a modo escuro

### **Otimizações:**
- [ ] Lazy loading de dados
- [ ] Cache de meses anteriores
- [ ] Debounce em navegação rápida
- [ ] Skeleton loading

---

## 🚀 Próximos Passos

1. **Aprovar design** ✅
2. **Criar componentes base** (CalendarHeader, DayCell)
3. **Implementar lógica de calendário** (cálculo de dias, semanas)
4. **Integrar com API** (getCalendar)
5. **Adicionar interatividade** (clicks, modais)
6. **Testar em mobile** (responsividade)
7. **Ajustes finais** (animações, polimento)

---

**Última atualização:** Dezembro 2024

