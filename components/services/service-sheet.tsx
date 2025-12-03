"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ServiceWithRelations } from "@/lib/types/database"
import { formatCurrency, formatDateLong, formatDate } from "@/lib/utils"
import {
  getStatusLabel,
  getStatusBadgeClasses,
  getPaymentStatusLabel,
  getPaymentStatusBadgeClasses,
} from "@/lib/utils/status"
import { Edit, Trash2, MapPin, DollarSign, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ServiceWithRelations | null
  onEdit?: () => void
  onDelete?: () => void
}

export function ServiceSheet({
  open,
  onOpenChange,
  service,
  onEdit,
  onDelete,
}: ServiceSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Reset expanded state when sheet closes
  useEffect(() => {
    if (!open) {
      setIsExpanded(false)
    }
  }, [open])

  if (!service) return null

  const clientName = service.client?.name || "N/A"
  const technicianName =
    service.technician?.nickname || service.technician?.name || "N/A"
  const hasLocation = !!service.location
  
  const grossValue = Number(service.gross_value) || 0
  const operationalCost = Number(service.operational_cost) || 0
  const taxAmount = Number(service.tax_amount) || 0
  const netProfit = grossValue - operationalCost - taxAmount
  const hasCosts = operationalCost > 0

  const handleEdit = () => {
    onOpenChange(false)
    if (onEdit) {
      // Pequeno delay para garantir que o sheet feche antes de abrir o wizard
      setTimeout(() => {
        onEdit()
      }, 100)
    }
  }

  const handleOpenMaps = () => {
    if (!service.location) return
    
    const encodedLocation = encodeURIComponent(service.location)
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
      "_blank"
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950"
      >
        <SheetHeader className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatDateLong(service.date)}
            </SheetTitle>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {clientName}
            </p>
          </div>
        </SheetHeader>

        {/* Body: Summary Grid */}
        <div className="py-6 space-y-6">
          {/* Value, Status, Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Valor */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <DollarSign className="h-4 w-4" />
                <span>Valor</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(service.gross_value)}
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Status
              </div>
              <Badge
                className={cn(
                  "text-sm font-medium",
                  getStatusBadgeClasses(service.status)
                )}
              >
                {getStatusLabel(service.status)}
              </Badge>
            </div>

            {/* Localização */}
            {service.location && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="h-4 w-4" />
                  <span>Local</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                  {service.location}
                </p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {/* Técnico */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Técnico
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {technicianName}
              </span>
            </div>

            {/* Status de Pagamento */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Pagamento
              </span>
              <Badge
                className={cn(
                  "text-sm font-medium",
                  getPaymentStatusBadgeClasses(service.payment_status)
                )}
              >
                {getPaymentStatusLabel(service.payment_status)}
              </Badge>
            </div>

          </div>

          {/* Toggle Button - Ficha do Evento */}
          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "w-full sm:w-auto",
                "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
                "transition-colors"
              )}
            >
              <span>{isExpanded ? "Ocultar Ficha" : "Ver Ficha do Evento"}</span>
              <ChevronDown
                className={cn(
                  "ml-2 h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Ficha do Evento - Expanded Content */}
          {isExpanded && (
            <div
              className={cn(
                "bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mt-2",
                "animate-in fade-in slide-in-from-top-2 duration-300",
                "space-y-4"
              )}
            >
              {/* A. Descrição */}
              {service.description && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sobre o serviço
                  </span>
                  <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                    {service.description}
                  </p>
                </div>
              )}

              {/* B. Raio-X Financeiro */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Raio-X Financeiro
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Receita:
                    </span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(grossValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      (-) Custos:
                    </span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(operationalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      (=) Líquido:
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* C. Metadata */}
              {service.created_at && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Criado em: {formatDate(service.created_at)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <SheetFooter className="flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          {onEdit && (
            <Button onClick={handleEdit} className="flex-1 sm:flex-initial">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          {hasLocation && (
            <Button
              onClick={handleOpenMaps}
              variant="outline"
              className={cn(
                "flex-1 sm:flex-initial",
                "border-slate-300 dark:border-slate-700",
                "hover:bg-blue-50 dark:hover:bg-blue-950/20",
                "hover:border-blue-300 dark:hover:border-blue-700",
                "transition-colors"
              )}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Abrir no Maps
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              variant="destructive"
              className="flex-1 sm:flex-initial"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

