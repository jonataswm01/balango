"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Client } from "@/lib/types/database"
import { Edit, Trash2, UserX, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClientCardProps {
  client: Client
  onEdit?: () => void
  onDelete?: () => void
  onToggleActive?: () => void
}

export function ClientCard({
  client,
  onEdit,
  onDelete,
  onToggleActive,
}: ClientCardProps) {
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Header: Nome e Status */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {client.name}
              </h3>
              <Badge
                variant={client.active ? "default" : "secondary"}
                className={cn(
                  client.active
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                )}
              >
                {client.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-1">
              {client.email && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Email:
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {client.email}
                  </span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Telefone:
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {client.phone}
                  </span>
                </div>
              )}
              {client.document && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Documento:
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {client.document}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col gap-2">
            {onToggleActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleActive}
                className="gap-2"
              >
                {client.active ? (
                  <>
                    <UserX className="h-4 w-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Ativar
                  </>
                )}
              </Button>
            )}
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
