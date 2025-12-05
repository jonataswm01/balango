/**
 * Funções para filtros e busca
 */

import { ServiceWithRelations } from '@/lib/types/database'
import { parseDateOnlyToLocal } from '@/lib/utils/dates'

export interface ServiceFilters {
  month?: string // YYYY-MM
  technician_id?: string
  client_id?: string
  has_invoice?: boolean | null // null = todos
  search?: string // busca por texto
}

/**
 * Aplica filtros a uma lista de serviços
 */
export function filterServices(
  services: ServiceWithRelations[],
  filters: ServiceFilters
): ServiceWithRelations[] {
  let filtered = [...services]

  // Filtro por mês
  if (filters.month) {
    filtered = filtered.filter((service) => {
      const serviceDate = parseDateOnlyToLocal(service.date)
      const filterDate = parseDateOnlyToLocal(filters.month + '-01')
      return (
        serviceDate.getMonth() === filterDate.getMonth() &&
        serviceDate.getFullYear() === filterDate.getFullYear()
      )
    })
  }

  // Filtro por técnico
  if (filters.technician_id) {
    filtered = filtered.filter(
      (service) => service.technician_id === filters.technician_id
    )
  }

  // Filtro por cliente
  if (filters.client_id) {
    filtered = filtered.filter(
      (service) => service.client_id === filters.client_id
    )
  }

  // Filtro por nota fiscal
  if (filters.has_invoice !== undefined && filters.has_invoice !== null) {
    filtered = filtered.filter(
      (service) => service.has_invoice === filters.has_invoice
    )
  }

  // Busca por texto
  if (filters.search && filters.search.trim() !== '') {
    const searchLower = filters.search.toLowerCase().trim()
    filtered = searchInServices(filtered, searchLower)
  }

  return filtered
}

/**
 * Busca serviços por texto (descrição, cliente, técnico)
 */
export function searchInServices(
  services: ServiceWithRelations[],
  query: string
): ServiceWithRelations[] {
  if (!query || query.trim() === '') {
    return services
  }

  const searchLower = query.toLowerCase().trim()

  return services.filter((service) => {
    // Buscar na descrição
    if (
      service.description &&
      service.description.toLowerCase().includes(searchLower)
    ) {
      return true
    }

    // Buscar no nome do cliente
    if (
      service.client?.name &&
      service.client.name.toLowerCase().includes(searchLower)
    ) {
      return true
    }

    // Buscar no nome do técnico
    const technicianName =
      service.technician?.nickname || service.technician?.name
    if (technicianName && technicianName.toLowerCase().includes(searchLower)) {
      return true
    }

    // Buscar no número da NF
    if (
      service.invoice_number &&
      service.invoice_number.toLowerCase().includes(searchLower)
    ) {
      return true
    }

    return false
  })
}

/**
 * Conta quantos filtros estão ativos
 */
export function countActiveFilters(filters: ServiceFilters): number {
  let count = 0

  if (filters.month) count++
  if (filters.technician_id) count++
  if (filters.client_id) count++
  if (filters.has_invoice !== undefined && filters.has_invoice !== null)
    count++
  if (filters.search && filters.search.trim() !== '') count++

  return count
}

/**
 * Limpa todos os filtros
 */
export function clearFilters(): ServiceFilters {
  return {}
}

