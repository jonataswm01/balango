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
import { Client } from "@/lib/types/database"
import { Edit, Trash2, UserX, UserCheck, MoreVertical } from "lucide-react"
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
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Grupo de Informações */}
          <div className="flex-1 space-y-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {client.name}
            </h3>
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
            {/* Email e Documento - apenas desktop */}
            {client.email && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Email:
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {client.email}
                </span>
              </div>
            )}
            {client.document && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Documento:
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {client.document}
                </span>
              </div>
            )}
          </div>

          {/* Status e Ações - Layout diferente para mobile e desktop */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Badge de Status */}
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

            {/* Botões de Ação - Desktop */}
            <div className="hidden lg:flex flex-col gap-2">
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

            {/* Menu Hamburger - Mobile/Tablet */}
            <div className="lg:hidden flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-full w-10 p-0 flex items-center justify-center">
                    <MoreVertical className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onToggleActive && (
                    <DropdownMenuItem onClick={onToggleActive}>
                      {client.active ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Ativar
                        </>
                      )}
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
