"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface RevenueData {
  name: string
  value: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {payload[0]?.payload?.name}
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {formatCurrency(payload[0]?.value || 0)}
        </p>
      </div>
    )
  }
  return null
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
        <p className="text-sm">Sem dados para exibir</p>
      </div>
    )
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
          <Tooltip content={<CustomTooltip />} />
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

