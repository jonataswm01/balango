"use client"

import { ServiceWithRelations } from '@/lib/types/database'
import { ChartType } from '@/lib/utils/charts'
import { KPICard } from '@/components/shared/kpi-card'
import { BarChartComponent } from './bar-chart'
import { AreaChartComponent } from './area-chart'
import { RadialChartComponent } from './radial-chart'
import { ComposedChartComponent } from './composed-chart'
import { 
  prepareBarChartData, 
  prepareAreaChartData, 
  prepareRadialChartData, 
  prepareComposedChartData 
} from '@/lib/utils/charts'
import { calculateKPIs } from '@/lib/utils/services'
import { DollarSign, TrendingUp, Wrench, Receipt, Sparkles } from 'lucide-react'

interface ChartWrapperProps {
  chartType: ChartType
  services: ServiceWithRelations[]
  taxRate?: number
}

export function ChartWrapper({ chartType, services, taxRate = 0 }: ChartWrapperProps) {
  const kpis = calculateKPIs(services, taxRate)

  switch (chartType) {
    case 'kpi-lucro-liquido':
      return (
        <KPICard
          title="Lucro Líquido Total"
          value={kpis.lucroLiquido}
          icon={Sparkles}
          color="emerald"
          highlight={true}
          subtitle="Receita bruta menos custos e impostos"
          large={true}
        />
      )

    case 'kpi-receita-bruta':
      return (
        <KPICard
          title="Receita Bruta"
          value={kpis.receitaBruta}
          icon={DollarSign}
          color="blue"
        />
      )

    case 'kpi-sem-custos':
      return (
        <KPICard
          title="Sem Custos"
          value={kpis.receitaSemCustos}
          icon={TrendingUp}
          color="emerald"
        />
      )

    case 'kpi-custo-operacional':
      return (
        <KPICard
          title="Custo Operacional"
          value={kpis.totalCustos}
          icon={Wrench}
          color="amber"
        />
      )

    case 'kpi-impostos':
      return (
        <KPICard
          title="Impostos"
          value={kpis.impostos}
          icon={Receipt}
          color="red"
        />
      )

    case 'bar-chart':
      return (
        <BarChartComponent
          data={prepareBarChartData(services)}
          title="Receita por Dia"
          height={300}
        />
      )

    case 'area-chart':
      return (
        <AreaChartComponent
          data={prepareAreaChartData(services, taxRate)}
          title="Evolução de Lucro"
          height={300}
        />
      )

    case 'radial-chart':
      return (
        <RadialChartComponent
          data={prepareRadialChartData(services)}
          title="Distribuição por Técnico"
          height={300}
        />
      )

    case 'composed-chart':
      return (
        <ComposedChartComponent
          data={prepareComposedChartData(services, taxRate)}
          title="Receita vs Lucro"
          height={300}
        />
      )

    default:
      return null
  }
}

