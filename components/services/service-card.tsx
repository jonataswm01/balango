"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ServiceWithRelations } from "@/lib/types/database"
import { formatCurrency, formatDate } from "@/lib/utils"
import { FileText, Edit, Trash2, DollarSign, CreditCard, MoreVertical } from "lucide-react"
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
        <div className="flex items-stretch gap-4">
          {/* Menu de 3 Pontinhos - Lado Esquerdo */}
          <div className="flex items-center flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 p-0 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <MoreVertical className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Linha Vertical Divider */}
          <div className="w-[1px] bg-slate-300 dark:bg-slate-600 flex-shrink-0" />

          {/* Conteúdo do Card */}
          <div className="flex-1 space-y-2 min-w-0">
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
                {service.payment_method && (
                  <Badge
                    variant="outline"
                    className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                  >
                    <CreditCard className="h-3 w-3" />
                    {service.payment_method}
                  </Badge>
                )}
              </div>
            </div>

            {/* Valor - Abaixo dos Badges */}
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(service.gross_value)}
              </span>
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
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                {service.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
