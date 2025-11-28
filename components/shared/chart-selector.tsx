"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Check, X } from "lucide-react"
import { ChartType, AVAILABLE_CHARTS, FIXED_CHART } from "@/lib/utils/charts"
import { cn } from "@/lib/utils"
import { 
  DollarSign, 
  TrendingUp, 
  Wrench, 
  Receipt, 
  PieChart, 
  LineChart,
  Sparkles
} from "lucide-react"

interface ChartSelectorProps {
  selectedCharts: ChartType[]
  onChartsChange: (charts: ChartType[]) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const iconMap: { [key: string]: any } = {
  DollarSign,
  TrendingUp,
  Wrench,
  Receipt,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles,
}

export function ChartSelector({
  selectedCharts,
  onChartsChange,
  open: controlledOpen,
  onOpenChange,
}: ChartSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const toggleChart = (chartId: ChartType) => {
    // Não permitir desmarcar o gráfico fixo
    if (chartId === FIXED_CHART) {
      return
    }

    if (selectedCharts.includes(chartId)) {
      // Remover gráfico
      onChartsChange(selectedCharts.filter((id) => id !== chartId))
    } else {
      // Adicionar gráfico (máximo 4, excluindo o fixo)
      const selectableCharts = selectedCharts.filter((id) => id !== FIXED_CHART)
      if (selectableCharts.length < 4) {
        onChartsChange([...selectedCharts, chartId])
      }
    }
  }

  const isSelected = (chartId: ChartType) => selectedCharts.includes(chartId)
  // Contar apenas gráficos selecionáveis (excluindo o fixo)
  const selectableCharts = selectedCharts.filter((id) => id !== FIXED_CHART)
  const canSelect = selectableCharts.length < 4

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <BarChart3 className="h-4 w-4" />
        Gráficos
        {selectableCharts.length > 0 && (
          <Badge className="ml-1 bg-blue-600 text-white">
            {selectableCharts.length}/4
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Selecionar Gráficos
            </DialogTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Selecione até 4 gráficos para exibir no dashboard (o Lucro Líquido é fixo). 
              {selectableCharts.length > 0 && (
                <span className="ml-1 font-medium text-blue-600">
                  {selectableCharts.length} de 4 selecionados
                </span>
              )}
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {AVAILABLE_CHARTS.map((chart) => {
              const Icon = iconMap[chart.icon] || BarChart3
              const isFixed = chart.id === FIXED_CHART
              const selected = isSelected(chart.id)
              const disabled = !selected && !canSelect && !isFixed

              return (
                <Card
                  key={chart.id}
                  className={cn(
                    "transition-all",
                    isFixed 
                      ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                      : "cursor-pointer hover:shadow-md",
                    !isFixed && selected && "ring-2 ring-blue-600 border-blue-600",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !disabled && !isFixed && toggleChart(chart.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            selected
                              ? "bg-blue-100 dark:bg-blue-900/20"
                              : "bg-slate-100 dark:bg-slate-800"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              selected
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-600 dark:text-slate-400"
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                              {chart.title}
                            </h3>
                            {isFixed && (
                              <Badge className="text-xs bg-emerald-600 text-white">
                                Fixo
                              </Badge>
                            )}
                            {chart.category === "kpi" && !isFixed && (
                              <Badge variant="outline" className="text-xs">
                                KPI
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {chart.description}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4">
                        {isFixed ? (
                          <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        ) : selected ? (
                          <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {!canSelect && selectableCharts.length >= 4 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Você já selecionou 4 gráficos. Desmarque um para selecionar outro.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Fechar
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Aplicar ({selectableCharts.length + 1} gráficos)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

