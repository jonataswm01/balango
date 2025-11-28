"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface AreaData {
  name: string
  value: number
  [key: string]: any
}

interface AreaChartProps {
  data: AreaData[]
  title?: string
  height?: number
  dataKey?: string
  color?: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900 mb-2">{payload[0]?.payload?.name}</p>
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

export function AreaChartComponent({ 
  data, 
  title = "Gráfico de Área", 
  height = 300,
  dataKey = "value",
  color = "#10b981"
}: AreaChartProps) {
  if (data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div style={{ height: `${height}px` }} className="flex items-center justify-center text-muted-foreground border-2 border-dashed border-slate-200 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Sem dados</p>
              <p className="text-sm">Não há dados para exibir</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: "12px" }}
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
                dataKey={dataKey} 
                stroke={color} 
                fill={`url(#color${dataKey})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

