"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Filter } from "lucide-react"
import { ServiceFilters, countActiveFilters } from "@/lib/utils/filters"
import { cn } from "@/lib/utils"

interface FiltersPanelProps {
  filters: ServiceFilters
  onFiltersChange: (filters: ServiceFilters) => void
  onClear: () => void
  clients?: Array<{ id: string; name: string }>
  technicians?: Array<{ id: string; name: string; nickname: string | null }>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FiltersPanel({
  filters,
  onFiltersChange,
  onClear,
  clients = [],
  technicians = [],
  open: controlledOpen,
  onOpenChange,
}: FiltersPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const activeFiltersCount = countActiveFilters(filters)

  const handleFilterChange = (key: keyof ServiceFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" || value === null ? undefined : value,
    })
  }

  const handleClear = () => {
    onClear()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Botão de Filtros */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        Filtros
        {activeFiltersCount > 0 && (
          <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Painel de Filtros */}
      {isOpen && (
        <Card className="absolute right-0 top-full z-50 mt-2 w-80 shadow-lg border-slate-200 dark:border-slate-800 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Filtros
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Filtro de Mês */}
            <div className="space-y-2">
              <Label htmlFor="filter-month" className="text-slate-700 dark:text-slate-300">
                Mês/Ano
              </Label>
              <Input
                id="filter-month"
                type="month"
                value={filters.month || ""}
                onChange={(e) => handleFilterChange("month", e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Filtro de Técnico */}
            <div className="space-y-2">
              <Label htmlFor="filter-technician" className="text-slate-700 dark:text-slate-300">
                Técnico
              </Label>
              <Select
                value={filters.technician_id || ""}
                onValueChange={(value) =>
                  handleFilterChange("technician_id", value)
                }
              >
                <SelectTrigger id="filter-technician" className="mt-1">
                  <SelectValue placeholder="Todos os técnicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os técnicos</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.nickname || tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Cliente */}
            <div className="space-y-2">
              <Label htmlFor="filter-client" className="text-slate-700 dark:text-slate-300">
                Cliente
              </Label>
              <Select
                value={filters.client_id || ""}
                onValueChange={(value) =>
                  handleFilterChange("client_id", value)
                }
              >
                <SelectTrigger id="filter-client" className="mt-1">
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os clientes</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Nota Fiscal */}
            <div className="space-y-2">
              <Label htmlFor="filter-invoice" className="text-slate-700 dark:text-slate-300">
                Nota Fiscal
              </Label>
              <Select
                value={
                  filters.has_invoice === undefined
                    ? "all"
                    : filters.has_invoice
                    ? "true"
                    : "false"
                }
                onValueChange={(value) => {
                  if (value === "all") {
                    handleFilterChange("has_invoice", undefined)
                  } else {
                    handleFilterChange("has_invoice", value === "true")
                  }
                }}
              >
                <SelectTrigger id="filter-invoice" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Com NF</SelectItem>
                  <SelectItem value="false">Sem NF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
                disabled={activeFiltersCount === 0}
              >
                Limpar
              </Button>
              <Button
                variant="default"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
