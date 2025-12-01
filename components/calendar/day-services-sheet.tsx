"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { X, FileText } from "lucide-react"
import { formatDateLong, formatCurrency } from "@/lib/utils"
import { ServiceWithRelations } from "@/lib/types/database"
import { cn } from "@/lib/utils"

interface DayServicesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  services: ServiceWithRelations[]
}

// Cores pastéis para os cards
const cardColors = [
  "bg-pink-100 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
  "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  "bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
]

export function DayServicesSheet({
  open,
  onOpenChange,
  date,
  services,
}: DayServicesSheetProps) {
  if (!date) return null

  const totalValue = services.reduce(
    (sum, service) => sum + Number(service.gross_value || 0),
    0
  )

  const technicianName = (service: ServiceWithRelations) =>
    service.technician?.nickname || service.technician?.name || "N/A"

  const clientName = (service: ServiceWithRelations) =>
    service.client?.name || "N/A"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col">
        {/* Header fixo */}
        <SheetHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatDateLong(date)}
              </SheetTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {services.length} serviço{services.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">
                Nenhum serviço neste dia
              </p>
            </div>
          ) : (
            services.map((service, index) => {
              const colorClass =
                cardColors[index % cardColors.length]
              const technician = technicianName(service)
              const client = clientName(service)

              return (
                <div
                  key={service.id}
                  className={cn(
                    "rounded-2xl p-4 border-2",
                    colorClass
                  )}
                >
                  <div className="space-y-2">
                    {/* Cliente */}
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Cliente
                      </p>
                      <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {client}
                      </p>
                    </div>

                    {/* Técnico */}
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Técnico
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {technician}
                      </p>
                    </div>

                    {/* Valor e NF */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(service.gross_value)}
                      </span>
                      {service.has_invoice && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs font-medium">NF</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer fixo com total */}
        {services.length > 0 && (
          <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total do dia:
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

