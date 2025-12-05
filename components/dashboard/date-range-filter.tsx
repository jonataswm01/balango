"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateRange {
  startDate: string
  endDate: string
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void
  defaultStartDate?: string
  defaultEndDate?: string
}

const STORAGE_KEY = "dashboard_date_range"

// Função para obter data padrão (30 dias atrás até hoje)
function getDefaultDateRange(): DateRange {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  }
}

// Função para carregar do localStorage
function loadDateRangeFromStorage(): DateRange | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validar se as datas são válidas
      if (parsed.startDate && parsed.endDate) {
        return parsed
      }
    }
  } catch (error) {
    console.error('Erro ao carregar período do localStorage:', error)
  }
  
  return null
}

// Função para salvar no localStorage
function saveDateRangeToStorage(range: DateRange) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(range))
  } catch (error) {
    console.error('Erro ao salvar período no localStorage:', error)
  }
}

// Função para formatar data para exibição
function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function DateRangeFilter({
  onDateRangeChange,
  defaultStartDate,
  defaultEndDate,
}: DateRangeFilterProps) {
  // Carregar do localStorage ou usar padrão
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const stored = loadDateRangeFromStorage()
    if (stored) return stored
    
    return {
      startDate: defaultStartDate || getDefaultDateRange().startDate,
      endDate: defaultEndDate || getDefaultDateRange().endDate,
    }
  })
  
  const [isOpen, setIsOpen] = useState(false)

  // Notificar mudanças quando o componente montar (apenas uma vez)
  useEffect(() => {
    // Apenas notificar no mount inicial com o valor carregado
    onDateRangeChange(dateRange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Apenas no mount

  const handleStartDateChange = (value: string) => {
    const newRange = { ...dateRange, startDate: value }
    setDateRange(newRange)
    saveDateRangeToStorage(newRange)
    onDateRangeChange(newRange)
  }

  const handleEndDateChange = (value: string) => {
    const newRange = { ...dateRange, endDate: value }
    setDateRange(newRange)
    saveDateRangeToStorage(newRange)
    onDateRangeChange(newRange)
  }

  // Validar se startDate não é maior que endDate
  const isValidRange = dateRange.startDate <= dateRange.endDate

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            "border-slate-200 dark:border-slate-700",
            "bg-white dark:bg-slate-800",
            "hover:bg-slate-50 dark:hover:bg-slate-700",
            !isValidRange && "border-red-300 dark:border-red-700"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {isValidRange ? (
              <>
                {formatDateForDisplay(dateRange.startDate)} - {formatDateForDisplay(dateRange.endDate)}
              </>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                Período inválido
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-4" 
        align="start"
        sideOffset={8}
      >
        <div className="space-y-4 w-full">
          <div className="space-y-2 w-full">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Data Inicial
            </label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className={cn(
                "w-full",
                !isValidRange && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>
          <div className="space-y-2 w-full">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Data Final
            </label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className={cn(
                "w-full",
                !isValidRange && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>
          {!isValidRange && (
            <p className="text-xs text-red-600 dark:text-red-400">
              A data inicial deve ser anterior à data final
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

