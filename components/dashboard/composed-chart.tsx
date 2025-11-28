"use client"

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface ComposedData {
  name: string
  receita: number
  lucro: number
  [key: string]: any
}

interface ComposedChartProps {
  data: ComposedData[]
  title?: string
  height?: number
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

export function ComposedChartComponent({ 
  data, 
  title = "Gráfico Composto", 
  height = 300
}: ComposedChartProps) {
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
            <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <Legend />
              <Bar dataKey="receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

