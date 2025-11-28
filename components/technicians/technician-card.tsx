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
import { Technician } from "@/lib/types/database"
import { Edit, Trash2, UserX, UserCheck, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface TechnicianCardProps {
  technician: Technician
  onEdit?: () => void
  onDelete?: () => void
  onToggleActive?: () => void
}

export function TechnicianCard({
  technician,
  onEdit,
  onDelete,
  onToggleActive,
}: TechnicianCardProps) {
  return (
    <Card className="border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Grupo de Informações */}
          <div className="flex-1 space-y-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {technician.name}
            </h3>
            {technician.nickname && (
              <p className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">
                {technician.nickname}
              </p>
            )}
            {technician.phone && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Telefone:
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {technician.phone}
                </span>
              </div>
            )}
            {/* Email e Documento - apenas desktop */}
            {technician.email && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Email:
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {technician.email}
                </span>
              </div>
            )}
            {technician.document && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  CPF:
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {technician.document}
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center">
            <Badge
              variant={technician.active ? "default" : "secondary"}
              className={cn(
                technician.active
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {technician.active ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          {/* Botões de Ação - Desktop */}
          <div className="hidden lg:flex flex-col gap-2">
            {onToggleActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleActive}
                className="gap-2"
              >
                {technician.active ? (
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex items-center justify-center">
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
                    {technician.active ? (
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
      </CardContent>
    </Card>
  )
}
