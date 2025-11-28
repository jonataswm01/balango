"use client"

import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface RadialData {
  name: string
  value: number
  fill: string
}

interface RadialChartProps {
  data: RadialData[]
  title?: string
  height?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-900">{data.name}</p>
        <p className="text-sm text-slate-600">
          {formatCurrency(data.value)}
        </p>
      </div>
    )
  }
  return null
}

export function RadialChartComponent({ 
  data, 
  title = "Gráfico Radial", 
  height = 300
}: RadialChartProps) {
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
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="20%" 
              outerRadius="80%" 
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar 
                dataKey="value" 
                cornerRadius={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </RadialBar>
              <Legend 
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color, marginLeft: "8px" }}>
                    {value}
                  </span>
                )}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

