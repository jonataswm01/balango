"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { formatMonthYear } from "@/lib/utils/services"
import { cn } from "@/lib/utils"

interface CalendarHeaderProps {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  view?: "month" | "week" | "day"
  onViewChange?: (view: "month" | "week" | "day") => void
}

export function CalendarHeader({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  view = "month",
  onViewChange,
}: CalendarHeaderProps) {
  const isToday = 
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear()

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="p-4 space-y-3">
        {/* Navegação de Mês */}
        <div className="flex items-center justify-between">
          {/* Lado Esquerdo - Seta Anterior */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousMonth}
            className="h-10 w-10 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-5 w-5 transition-transform duration-200 hover:-translate-x-1" />
          </Button>
          
          {/* Centro - Mês/Ano */}
          <div className="text-center flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-colors duration-200">
              {formatMonthYear(currentDate)}
            </h2>
          </div>
          
          {/* Lado Direito - Seta Próximo */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="h-10 w-10 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-5 w-5 transition-transform duration-200 hover:translate-x-1" />
          </Button>
        </div>

        {/* Segmented Control (Month/Week/Day) */}
        {onViewChange && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
                  view === v
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                {v === "month" ? "Mês" : v === "week" ? "Semana" : "Dia"}
              </button>
            ))}
          </div>
        )}

        {/* Botão Hoje (se não estiver no mês atual) */}
        {!isToday && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              className="text-xs"
            >
              Hoje
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

