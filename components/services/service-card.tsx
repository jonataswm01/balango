"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ServiceWithRelations } from "@/lib/types/database"
import {
  getStatusLabel,
  getPaymentStatusLabel,
  getStatusBadgeClasses,
  getPaymentStatusBadgeClasses,
} from "@/lib/utils/status"
import { formatCurrency, formatDate } from "@/lib/utils"
import { FileText, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  service: ServiceWithRelations
  onEdit?: () => void
  onDelete?: () => void
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const technicianName =
    service.technician?.nickname || service.technician?.name || "N/A"
  const clientName = service.client?.name || "N/A"

  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Header: Data e Badges */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {formatDate(service.date)}
              </span>
              <div className="flex items-center gap-2">
                {service.has_invoice && (
                  <Badge
                    variant="outline"
                    className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                  >
                    <FileText className="h-3 w-3" />
                    NF
                  </Badge>
                )}
                <Badge className={getStatusBadgeClasses(service.status)}>
                  {getStatusLabel(service.status)}
                </Badge>
                <Badge
                  className={getPaymentStatusBadgeClasses(service.payment_status)}
                >
                  {getPaymentStatusLabel(service.payment_status)}
                </Badge>
              </div>
            </div>

            {/* Cliente e Técnico */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Cliente:
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {clientName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Técnico:
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {technicianName}
                </span>
              </div>
            </div>

            {/* Descrição */}
            {service.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {service.description}
              </p>
            )}

            {/* Valor */}
            <div className="pt-2">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(service.gross_value)}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
