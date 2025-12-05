"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface RevenueData {
  name: string
  value: number
  isFirst?: boolean
  isLast?: boolean
  day?: number
}

interface RevenueChartProps {
  data: RevenueData[]
  startDate?: string
  endDate?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  data?: RevenueData[]
  startDate?: string
  endDate?: string
}

const CustomTooltip = ({ active, payload, data, startDate, endDate }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const payloadData = payload[0]?.payload
    const name = payloadData?.name || ''
    
    // Encontrar o índice do item atual
    const currentIndex = data?.findIndex(item => item.name === name) ?? -1
    const isFirst = currentIndex === 0
    const isLast = currentIndex === (data?.length ?? 0) - 1
    
    // Formatar o nome com dia se for primeiro ou último
    let displayName = name
    if (isFirst && startDate) {
      const date = new Date(startDate)
      const day = date.getDate()
      displayName = `${day} ${name}`
    } else if (isLast && endDate) {
      const date = new Date(endDate)
      const day = date.getDate()
      displayName = `${day} ${name}`
    }
    
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {displayName}
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {formatCurrency(payload[0]?.value || 0)}
        </p>
      </div>
    )
  }
  return null
}

export function RevenueChart({ data, startDate, endDate }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
        <p className="text-sm">Sem dados para exibir</p>
      </div>
    )
  }

  // Função para formatar o label do eixo X (adicionar dia no primeiro e último)
  const formatXAxisLabel = (tickItem: string, index: number) => {
    if (data.length === 0) return tickItem
    
    const isFirst = index === 0
    const isLast = index === data.length - 1
    
    if (isFirst && startDate) {
      const date = new Date(startDate)
      const day = date.getDate()
      return `${day} ${tickItem}`
    }
    
    if (isLast && endDate) {
      const date = new Date(endDate)
      const day = date.getDate()
      return `${day} ${tickItem}`
    }
    
    return tickItem
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXAxisLabel}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `R$ ${(value / 1000).toFixed(1)}k`
              }
              return `R$ ${value}`
            }}
          />
          <Tooltip 
            content={<CustomTooltip data={data} startDate={startDate} endDate={endDate} />} 
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

