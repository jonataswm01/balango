/**
 * Funções utilitárias para preparar dados de gráficos
 */

import { ServiceWithRelations } from '@/lib/types/database'
import { calculateKPIs } from './services'

export type ChartType = 
  | 'kpi-lucro-liquido' // FIXO - sempre visível
  | 'kpi-receita-bruta'
  | 'kpi-sem-custos'
  | 'kpi-custo-operacional'
  | 'kpi-impostos'
  | 'bar-chart'
  | 'area-chart'
  | 'radial-chart'
  | 'composed-chart'

// Gráfico fixo que não pode ser removido
export const FIXED_CHART: ChartType = 'kpi-lucro-liquido'

// Gráficos que são por tempo (ocupam 2 colunas)
export const TIME_BASED_CHARTS: ChartType[] = [
  'bar-chart',
  'area-chart',
  'composed-chart'
]

/**
 * Verifica se um gráfico é baseado em tempo
 */
export function isTimeBasedChart(chartType: ChartType): boolean {
  return TIME_BASED_CHARTS.includes(chartType)
}

/**
 * Gera array de datas dos últimos N dias (incluindo hoje)
 */
function generateLastNDays(n: number): Date[] {
  const dates: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date)
  }
  
  return dates
}

/**
 * Formata data para DD/MM
 */
function formatDateToDDMM(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${day}/${month}`
}

export interface ChartConfig {
  id: ChartType
  title: string
  description: string
  icon: string
  category: 'kpi' | 'chart'
}

export const AVAILABLE_CHARTS: ChartConfig[] = [
  {
    id: 'kpi-lucro-liquido',
    title: 'Lucro Líquido Total',
    description: 'Receita bruta menos custos e impostos (Fixo)',
    icon: 'Sparkles',
    category: 'kpi'
  },
  {
    id: 'kpi-receita-bruta',
    title: 'Receita Bruta',
    description: 'Total de receita bruta',
    icon: 'DollarSign',
    category: 'kpi'
  },
  {
    id: 'kpi-sem-custos',
    title: 'Sem Custos',
    description: 'Receita sem custos operacionais',
    icon: 'TrendingUp',
    category: 'kpi'
  },
  {
    id: 'kpi-custo-operacional',
    title: 'Custo Operacional',
    description: 'Total de custos operacionais',
    icon: 'Wrench',
    category: 'kpi'
  },
  {
    id: 'kpi-impostos',
    title: 'Impostos',
    description: 'Total de impostos',
    icon: 'Receipt',
    category: 'kpi'
  },
  {
    id: 'bar-chart',
    title: 'Receita por Dia',
    description: 'Gráfico de barras mostrando receita diária (últimos 7 dias)',
    icon: 'BarChart3',
    category: 'chart'
  },
  {
    id: 'area-chart',
    title: 'Evolução de Lucro',
    description: 'Gráfico de área mostrando evolução do lucro (últimos 7 dias)',
    icon: 'TrendingUp',
    category: 'chart'
  },
  {
    id: 'radial-chart',
    title: 'Distribuição por Categoria',
    description: 'Gráfico radial de distribuição',
    icon: 'PieChart',
    category: 'chart'
  },
  {
    id: 'composed-chart',
    title: 'Receita vs Lucro',
    description: 'Gráfico composto comparando receita e lucro (últimos 7 dias)',
    icon: 'LineChart',
    category: 'chart'
  }
]

/**
 * Prepara dados para gráfico de barras (receita por dia - últimos 7 dias)
 */
export function prepareBarChartData(services: ServiceWithRelations[]) {
  const dailyData: { [key: string]: number } = {}
  
  // Encontrar a data mais antiga
  let oldestDate: Date | null = null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  services.forEach((service) => {
    const serviceDate = new Date(service.date)
    serviceDate.setHours(0, 0, 0, 0)
    
    if (!oldestDate || serviceDate < oldestDate) {
      oldestDate = serviceDate
    }
    
    const dateKey = formatDateToDDMM(serviceDate)
    dailyData[dateKey] = (dailyData[dateKey] || 0) + Number(service.gross_value || 0)
  })
  
  // Se não há serviços, mostrar apenas hoje
  if (!oldestDate) {
    return [{
      name: formatDateToDDMM(today),
      value: 0
    }]
  }
  
  // Calcular quantos dias desde o mais antigo até hoje
  // Após a verificação acima, oldestDate não é null
  const daysDiff = Math.floor((today.getTime() - (oldestDate as Date).getTime()) / (1000 * 60 * 60 * 24))
  
  // Se a diferença é maior que 7 dias, mostrar últimos 7 dias
  // Caso contrário, mostrar desde o mais antigo até hoje
  const daysToShow = daysDiff >= 7 ? 7 : daysDiff + 1
  
  const dates = generateLastNDays(daysToShow)
  
  return dates.map((date) => {
    const dateKey = formatDateToDDMM(date)
    return {
      name: dateKey,
      value: dailyData[dateKey] || 0
    }
  })
}

/**
 * Prepara dados para gráfico de área (evolução de lucro por dia - últimos 7 dias)
 */
export function prepareAreaChartData(services: ServiceWithRelations[], taxRate: number = 0) {
  const dailyData: { [key: string]: { receita: number; custos: number; impostos: number } } = {}
  
  // Encontrar a data mais antiga
  let oldestDate: Date | null = null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  services.forEach((service) => {
    const serviceDate = new Date(service.date)
    serviceDate.setHours(0, 0, 0, 0)
    
    if (!oldestDate || serviceDate < oldestDate) {
      oldestDate = serviceDate
    }
    
    const dateKey = formatDateToDDMM(serviceDate)
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { receita: 0, custos: 0, impostos: 0 }
    }
    
    const receita = Number(service.gross_value || 0)
    const custos = Number(service.operational_cost || 0)
    const impostos = taxRate > 0 && service.has_invoice
      ? receita * taxRate
      : Number(service.tax_amount || 0)
    
    dailyData[dateKey].receita += receita
    dailyData[dateKey].custos += custos
    dailyData[dateKey].impostos += impostos
  })
  
  // Se não há serviços, mostrar apenas hoje
  if (!oldestDate) {
    return [{
      name: formatDateToDDMM(today),
      value: 0
    }]
  }
  
  // Calcular quantos dias desde o mais antigo até hoje
  // Após a verificação acima, oldestDate não é null
  const daysDiff = Math.floor((today.getTime() - (oldestDate as Date).getTime()) / (1000 * 60 * 60 * 24))
  
  // Se a diferença é maior que 7 dias, mostrar últimos 7 dias
  // Caso contrário, mostrar desde o mais antigo até hoje
  const daysToShow = daysDiff >= 7 ? 7 : daysDiff + 1
  
  const dates = generateLastNDays(daysToShow)
  
  return dates.map((date) => {
    const dateKey = formatDateToDDMM(date)
    const data = dailyData[dateKey] || { receita: 0, custos: 0, impostos: 0 }
    return {
      name: dateKey,
      value: data.receita - data.custos - data.impostos
    }
  })
}

/**
 * Prepara dados para gráfico radial (distribuição por técnico)
 */
export function prepareRadialChartData(services: ServiceWithRelations[]) {
  const technicianData: { [key: string]: number } = {}
  
  services.forEach((service) => {
    const techName = service.technician?.nickname || service.technician?.name || 'Sem técnico'
    technicianData[techName] = (technicianData[techName] || 0) + Number(service.gross_value || 0)
  })

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
  
  return Object.entries(technicianData)
    .map(([name, value], index) => ({
      name,
      value,
      fill: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6) // Limitar a 6 itens
}

/**
 * Prepara dados para gráfico composto (receita vs lucro por dia - últimos 7 dias)
 */
export function prepareComposedChartData(services: ServiceWithRelations[], taxRate: number = 0) {
  const dailyData: { [key: string]: { receita: number; custos: number; impostos: number } } = {}
  
  // Encontrar a data mais antiga
  let oldestDate: Date | null = null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  services.forEach((service) => {
    const serviceDate = new Date(service.date)
    serviceDate.setHours(0, 0, 0, 0)
    
    if (!oldestDate || serviceDate < oldestDate) {
      oldestDate = serviceDate
    }
    
    const dateKey = formatDateToDDMM(serviceDate)
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { receita: 0, custos: 0, impostos: 0 }
    }
    
    const receita = Number(service.gross_value || 0)
    const custos = Number(service.operational_cost || 0)
    const impostos = taxRate > 0 && service.has_invoice
      ? receita * taxRate
      : Number(service.tax_amount || 0)
    
    dailyData[dateKey].receita += receita
    dailyData[dateKey].custos += custos
    dailyData[dateKey].impostos += impostos
  })
  
  // Se não há serviços, mostrar apenas hoje
  if (!oldestDate) {
    return [{
      name: formatDateToDDMM(today),
      receita: 0,
      lucro: 0
    }]
  }
  
  // Calcular quantos dias desde o mais antigo até hoje
  // Após a verificação acima, oldestDate não é null
  const daysDiff = Math.floor((today.getTime() - (oldestDate as Date).getTime()) / (1000 * 60 * 60 * 24))
  
  // Se a diferença é maior que 7 dias, mostrar últimos 7 dias
  // Caso contrário, mostrar desde o mais antigo até hoje
  const daysToShow = daysDiff >= 7 ? 7 : daysDiff + 1
  
  const dates = generateLastNDays(daysToShow)
  
  return dates.map((date) => {
    const dateKey = formatDateToDDMM(date)
    const data = dailyData[dateKey] || { receita: 0, custos: 0, impostos: 0 }
    return {
      name: dateKey,
      receita: data.receita,
      lucro: data.receita - data.custos - data.impostos
    }
  })
}

