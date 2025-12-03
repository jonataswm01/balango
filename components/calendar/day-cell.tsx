"use client"

import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { FileText } from "lucide-react"

interface DayCellProps {
  day: number | null // null para dias de outros meses
  isToday: boolean
  isSelected: boolean
  serviceCount: number
  totalValue: number
  hasInvoice: boolean
  isOtherMonth?: boolean
  hasPaid?: boolean
  hasPending?: boolean
  onClick?: () => void
  showPreview?: boolean // Controla se mostra preview (contador, valor, ícone) - padrão true
}

export function DayCell({
  day,
  isToday,
  isSelected,
  serviceCount,
  totalValue,
  hasInvoice,
  isOtherMonth = false,
  hasPaid = false,
  hasPending = false,
  onClick,
  showPreview = true, // Por padrão mostra preview
}: DayCellProps) {
  const hasServices = serviceCount > 0

  if (day === null) {
    return (
      <div className="min-h-[64px] p-2 rounded-lg" />
    )
  }

  return (
    <div
      className={cn(
        "relative min-h-[48px] md:min-h-[64px] p-1.5 md:p-2 transition-all duration-200 ease-in-out",
        "flex flex-col items-center justify-start w-full",
        "border-r border-b border-slate-200/30 dark:border-slate-700/30",
        "hover:scale-105 hover:shadow-md active:scale-95 cursor-pointer",
        isOtherMonth && "opacity-40",
        isSelected
          ? "bg-blue-500 dark:bg-blue-600 shadow-lg scale-105"
          : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800",
        isToday && !isSelected && "ring-2 ring-blue-500 dark:ring-blue-400"
      )}
    >
      {/* Status Dot (verde=pago, amarelo=pendente) - Prioridade: verde se tiver pago */}
      {hasServices && (hasPaid || hasPending) && (
        <div
          className={cn(
            "absolute top-1.5 right-1.5 w-2 h-2 rounded-full",
            isSelected
              ? (hasPaid ? "bg-green-700" : hasPending ? "bg-yellow-700" : "bg-white")
              : (hasPaid ? "bg-green-500" : hasPending ? "bg-yellow-500" : "bg-slate-400")
          )}
        />
      )}

      {/* Número do dia */}
      <div
        className={cn(
          "text-sm font-medium mt-2",
          isSelected
            ? "text-white dark:text-white" // Texto escuro quando selecionado (alto contraste)
            : isToday
            ? "text-blue-600 dark:text-blue-400 font-bold"
            : "text-slate-900 dark:text-slate-100",
          isOtherMonth && "text-slate-400 dark:text-slate-600"
        )}
      >
        {day}
      </div>

      {/* Informações adicionais (apenas no desktop, se houver serviços e não estiver selecionado) */}
      {hasServices && !isSelected && showPreview && (
        <div className="mt-1 space-y-0.5 w-full hidden md:block">
          {/* Contador */}
          <div className="text-[10px] text-slate-600 dark:text-slate-400 text-center font-medium">
            {serviceCount}
          </div>
          
          {/* Valor total (compacto) */}
          {totalValue > 0 && (
            <div className="text-[10px] font-semibold text-slate-900 dark:text-slate-100 text-center truncate">
              {formatCurrency(totalValue).length > 10
                ? formatCurrency(totalValue).slice(0, 8) + "..."
                : formatCurrency(totalValue)}
            </div>
          )}
          
          {/* Ícone NF */}
          {hasInvoice && (
            <div className="flex justify-center mt-0.5">
              <FileText className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

