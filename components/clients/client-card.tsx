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
import { Edit, Trash2, UserX, UserCheck, MoreVertical, Phone, Mail, FileText } from "lucide-react"
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
    <Card className="h-full border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col rounded-xl">
      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Header com nome e menu */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {client.name}
            </h3>
          </div>
          
          {/* Menu de ações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <MoreVertical className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onToggleActive && (
                <DropdownMenuItem onClick={onToggleActive} className="cursor-pointer">
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
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Informações do cliente */}
        <div className="flex-1 space-y-2.5">
          {client.phone && (
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {client.phone}
              </span>
            </div>
          )}
          
          {client.email && (
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {client.email}
              </span>
            </div>
          )}
          
          {client.document && (
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {client.document}
              </span>
            </div>
          )}
        </div>

        {/* Badge de Status no footer */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Badge
            variant={client.active ? "default" : "secondary"}
            className={cn(
              "text-xs font-medium",
              client.active
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            {client.active ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
