/**
 * Funções de validação para formulários
 */

import {
  ServiceInsert,
  ClientInsert,
  TechnicianInsert,
} from '@/lib/types/database'

/**
 * Valida dados de criação de serviço
 */
export function validateService(
  data: ServiceInsert
): { valid: boolean; error?: string } {
  if (!data.date) {
    return { valid: false, error: 'Data do serviço é obrigatória' }
  }

  if (!data.client_id) {
    return { valid: false, error: 'Cliente é obrigatório' }
  }

  if (!data.technician_id) {
    return { valid: false, error: 'Técnico é obrigatório' }
  }

  if (data.gross_value === undefined || data.gross_value === null) {
    return { valid: false, error: 'Valor bruto é obrigatório' }
  }

  if (data.gross_value < 0) {
    return { valid: false, error: 'Valor bruto não pode ser negativo' }
  }

  if (data.operational_cost !== undefined && data.operational_cost < 0) {
    return { valid: false, error: 'Custo operacional não pode ser negativo' }
  }

  // Validar formato de data
  try {
    new Date(data.date)
  } catch {
    return { valid: false, error: 'Data inválida' }
  }

  return { valid: true }
}

/**
 * Valida dados de criação de cliente
 */
export function validateClient(
  data: ClientInsert
): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim() === '') {
    return { valid: false, error: 'Nome é obrigatório' }
  }

  if (data.name.trim().length < 2) {
    return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' }
  }

  // Validar email se fornecido
  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return { valid: false, error: 'Email inválido' }
    }
  }

  return { valid: true }
}

/**
 * Valida dados de criação de técnico
 */
export function validateTechnician(
  data: TechnicianInsert
): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim() === '') {
    return { valid: false, error: 'Nome é obrigatório' }
  }

  if (data.name.trim().length < 2) {
    return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' }
  }

  // Validar email se fornecido
  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return { valid: false, error: 'Email inválido' }
    }
  }

  return { valid: true }
}

