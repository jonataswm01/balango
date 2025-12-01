"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Edit, Trash2, X } from "lucide-react"
import { formatDateLong, formatCurrency } from "@/lib/utils"
import { ServiceWithRelations } from "@/lib/types/database"
import { cn } from "@/lib/utils"

interface DayModalProps {
  date: Date
  services: ServiceWithRelations[]
  totalValue: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddService: (date: Date) => void
  onEditService?: (service: ServiceWithRelations) => void
  onDeleteService?: (service: ServiceWithRelations) => void
}

// Cores pastéis para os cards
const cardColors = [
  "bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800",
  "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800",
  "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
  "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800",
  "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800",
]

export function DayModal({
  date,
  services,
  totalValue,
  open,
  onOpenChange,
  onAddService,
  onEditService,
  onDeleteService,
}: DayModalProps) {
  const technicianName = (service: ServiceWithRelations) =>
    service.technician?.nickname || service.technician?.name || "N/A"

  const clientName = (service: ServiceWithRelations) =>
    service.client?.name || "N/A"

  const handleAddClick = () => {
    onOpenChange(false)
    onAddService(date)
  }

  const handleEditClick = (service: ServiceWithRelations) => {
    onOpenChange(false)
    if (onEditService) {
      onEditService(service)
    }
  }

  const handleDeleteClick = (service: ServiceWithRelations) => {
    onOpenChange(false)
    if (onDeleteService) {
      onDeleteService(service)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100%-2rem)] md:w-[90%] md:max-w-3xl p-0 max-h-[85vh] flex flex-col rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Header - Clean e minimalista */}
        <DialogHeader className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formatDateLong(date)}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {services.length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {services.length} serviço{services.length !== 1 ? "s" : ""} • {formatCurrency(totalValue)}
            </p>
          )}
        </DialogHeader>

        {/* Conteúdo - Scrollável */}
        <div className="flex-1 overflow-y-auto">
          {services.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Nenhum serviço neste dia
              </p>
              <Button
                onClick={handleAddClick}
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus className="h-4 w-4" />
                Adicionar Serviço
              </Button>
            </div>
          ) : (
            <div className="p-5 space-y-3">
              {services.map((service, index) => {
                const colorClass = cardColors[index % cardColors.length]
                const technician = technicianName(service)
                const client = clientName(service)

                return (
                  <div
                    key={service.id}
                    className={cn(
                      "rounded-xl p-4 border transition-colors",
                      colorClass
                    )}
                  >
                    <div className="space-y-2">
                      {/* Cliente */}
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Cliente
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {client}
                        </p>
                      </div>

                      {/* Técnico */}
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          Técnico
                        </p>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {technician}
                        </p>
                      </div>

                      {/* Valor e Ações */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(service.gross_value)}
                          </span>
                          {service.has_invoice && (
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <FileText className="h-3.5 w-3.5" />
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
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditClick(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {onDeleteService && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => handleDeleteClick(service)}
                              >
                                <Trash2 className="h-4 w-4" />
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

        {/* Footer com total e botão adicionar (se houver serviços) */}
        {services.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total:
              </span>
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalValue)}
              </span>
            </div>
            <Button
              onClick={handleAddClick}
              size="sm"
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus className="h-4 w-4" />
              Adicionar Serviço
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

