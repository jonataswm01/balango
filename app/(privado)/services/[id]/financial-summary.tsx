"use client"

import { ServiceWithRelations } from "@/lib/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { DollarSign } from "lucide-react"

interface FinancialSummaryProps {
  service: ServiceWithRelations
}

export function FinancialSummary({ service }: FinancialSummaryProps) {
  const grossValue = Number(service.gross_value) || 0
  const operationalCost = Number(service.operational_cost) || 0
  const taxAmount = Number(service.tax_amount) || 0
  const netProfit = grossValue - operationalCost - taxAmount

  // Dados para o gráfico
  const chartData = [
    {
      name: "Receita",
      value: grossValue,
      color: "#3b82f6", // blue
    },
    {
      name: "Custos",
      value: operationalCost,
      color: "#ef4444", // red
    },
    {
      name: "Lucro",
      value: netProfit,
      color: "#10b981", // green
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-slate-800 p-3 border border-slate-700 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-sm text-slate-300">
            {formatCurrency(data.value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-slate-900 border-slate-800 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#94a3b8" }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#94a3b8" }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `R$ ${(value / 1000).toFixed(1)}k`
                  }
                  return `R$ ${value}`
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Big Numbers */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Receita Bruta</p>
            <p className="text-xl font-bold text-blue-400">
              {formatCurrency(grossValue)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Custos</p>
            <p className="text-xl font-bold text-red-400">
              {formatCurrency(operationalCost)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Lucro Líquido</p>
            <p
              className={cn(
                "text-xl font-bold",
                netProfit >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {formatCurrency(netProfit)}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {taxAmount > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Impostos</span>
              <span className="text-sm font-medium text-slate-300">
                {formatCurrency(taxAmount)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

