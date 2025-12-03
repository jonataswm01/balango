"use client"

import { useRouter } from "next/navigation"
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
import { formatCurrency, formatDate, formatDateLong } from "@/lib/utils"
import {
  getStatusLabel,
  getStatusBadgeClasses,
  getPaymentStatusLabel,
  getPaymentStatusBadgeClasses,
} from "@/lib/utils/status"
import { Edit, Trash2, ExternalLink, MapPin, DollarSign } from "lucide-react"
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
  const router = useRouter()

  if (!service) return null

  const clientName = service.client?.name || "N/A"
  const technicianName =
    service.technician?.nickname || service.technician?.name || "N/A"

  const handleEdit = () => {
    onOpenChange(false)
    if (onEdit) {
      // Pequeno delay para garantir que o sheet feche antes de abrir o wizard
      setTimeout(() => {
        onEdit()
      }, 100)
    }
  }

  const handleViewDetails = () => {
    router.push(`/services/${service.id}`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-bold">
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

            {/* Descrição */}
            {service.description && (
              <div className="space-y-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Descrição
                </span>
                <p className="text-sm text-slate-900 dark:text-slate-100">
                  {service.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          {onEdit && (
            <Button onClick={handleEdit} className="flex-1 sm:flex-initial">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          <Button
            onClick={handleViewDetails}
            variant="outline"
            className="flex-1 sm:flex-initial"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Detalhes Completos
          </Button>
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

