"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface TrendData {
  data: string
  receitas: number
  despesas: number
}

interface LineChartProps {
  data: TrendData[]
  title?: string
  height?: number
}

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 mb-2">{payload[0]?.payload?.data}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span>{" "}
            {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function TrendLineChart({ data, title = "Lorem", height = 300 }: LineChartProps) {
  // Se não houver dados, mostrar estado vazio
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-slate-200 rounded-lg">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Lorem ipsum dolor</p>
          <p className="text-sm">Lorem ipsum dolor sit amet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="data" 
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => {
              // Formatar data para DD/MM
              const date = new Date(value)
              return `${date.getDate()}/${date.getMonth() + 1}`
            }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => {
              // Formatar valores para R$ Xk
              if (value >= 1000) {
                return `R$ ${(value / 1000).toFixed(1)}k`
              }
              return `R$ ${value}`
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => {
              if (value === "receitas") return "Lorem"
              if (value === "despesas") return "Ipsum"
              return value
            }}
          />
          <Line
            type="monotone"
            dataKey="receitas"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
            name="Receitas"
          />
          <Line
            type="monotone"
            dataKey="despesas"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: "#f97316", r: 4 }}
            activeDot={{ r: 6 }}
            name="Despesas"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

