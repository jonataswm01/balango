"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface BarData {
  name: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarData[]
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

export function BarChartComponent({ 
  data, 
  title = "Gráfico de Barras", 
  height = 300,
  dataKey = "value",
  color = "#3b82f6"
}: BarChartProps) {
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
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

