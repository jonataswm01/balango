"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Edit, Trash2 } from "lucide-react"
import { formatDateLong, formatCurrency } from "@/lib/utils"
import { ServiceWithRelations } from "@/lib/types/database"
import { cn } from "@/lib/utils"

interface DayPopoverProps {
  date: Date
  services: ServiceWithRelations[]
  totalValue: number
  onAddService: (date: Date) => void
  onEditService?: (service: ServiceWithRelations) => void
  onDeleteService?: (service: ServiceWithRelations) => void
  children: React.ReactNode
}

// Cores pastéis para os cards
const cardColors = [
  "bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800",
  "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800",
  "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
  "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800",
  "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800",
]

export function DayPopover({
  date,
  services,
  totalValue,
  onAddService,
  onEditService,
  onDeleteService,
  children,
}: DayPopoverProps) {
  const technicianName = (service: ServiceWithRelations) =>
    service.technician?.nickname || service.technician?.name || "N/A"

  const clientName = (service: ServiceWithRelations) =>
    service.client?.name || "N/A"

  const [open, setOpen] = React.useState(false)

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(false) // Fechar popover
    onAddService(date)
  }

  const handleEditClick = (e: React.MouseEvent, service: ServiceWithRelations) => {
    e.stopPropagation()
    setOpen(false) // Fechar popover
    if (onEditService) {
      onEditService(service)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, service: ServiceWithRelations) => {
    e.stopPropagation()
    setOpen(false) // Fechar popover
    if (onDeleteService) {
      onDeleteService(service)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 md:w-[500px] p-0" 
        align="start"
        side="bottom"
        sideOffset={8}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatDateLong(date)}
              </h3>
              {services.length > 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {services.length} serviço{services.length !== 1 ? "s" : ""} • {formatCurrency(totalValue)}
                </p>
              )}
            </div>
            <Button
              onClick={handleAddClick}
              size="sm"
              className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-h-[400px] overflow-y-auto">
          {services.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Nenhum serviço neste dia
              </p>
              <Button
                onClick={handleAddClick}
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Adicionar Serviço
              </Button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {services.map((service, index) => {
                const colorClass = cardColors[index % cardColors.length]
                const technician = technicianName(service)
                const client = clientName(service)

                return (
                  <div
                    key={service.id}
                    className={cn(
                      "rounded-lg p-3 border",
                      colorClass
                    )}
                  >
                    <div className="space-y-1.5">
                      {/* Cliente */}
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">
                          Cliente
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {client}
                        </p>
                      </div>

                      {/* Técnico */}
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">
                          Técnico
                        </p>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {technician}
                        </p>
                      </div>

                      {/* Valor e Ações */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(service.gross_value)}
                          </span>
                          {service.has_invoice && (
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <FileText className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        
                        {/* Botões de ação */}
                        {(onEditService || onDeleteService) && (
                          <div className="flex items-center gap-1">
                            {onEditService && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => handleEditClick(e, service)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {onDeleteService && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={(e) => handleDeleteClick(e, service)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer com total (se houver serviços) */}
        {services.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Total:
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

