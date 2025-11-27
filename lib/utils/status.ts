/**
 * Funções para gerenciar status e badges
 */

import {
  ServiceStatus,
  PaymentStatus,
  ServicePriority,
} from '@/lib/types/database'

/**
 * Retorna a cor do badge de status do serviço
 */
export function getStatusColor(status: ServiceStatus): string {
  const colors: Record<ServiceStatus, string> = {
    pendente: 'yellow',
    em_andamento: 'blue',
    concluido: 'green',
    cancelado: 'red',
  }

  return colors[status] || 'gray'
}

/**
 * Retorna a cor do badge de status de pagamento
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    pendente: 'yellow',
    pago: 'green',
    parcial: 'blue',
    cancelado: 'red',
  }

  return colors[status] || 'gray'
}

/**
 * Retorna a cor do badge de prioridade
 */
export function getPriorityColor(priority: ServicePriority): string {
  const colors: Record<ServicePriority, string> = {
    baixa: 'gray',
    media: 'blue',
    alta: 'orange',
    urgente: 'red',
  }

  return colors[priority] || 'gray'
}

/**
 * Retorna o label em português do status do serviço
 */
export function getStatusLabel(status: ServiceStatus): string {
  const labels: Record<ServiceStatus, string> = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  }

  return labels[status] || status
}

/**
 * Retorna o label em português do status de pagamento
 */
export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pendente: 'Pendente',
    pago: 'Pago',
    parcial: 'Parcial',
    cancelado: 'Cancelado',
  }

  return labels[status] || status
}

/**
 * Retorna o label em português da prioridade
 */
export function getPriorityLabel(priority: ServicePriority): string {
  const labels: Record<ServicePriority, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  }

  return labels[priority] || priority
}

/**
 * Retorna classes Tailwind para badge de status
 */
export function getStatusBadgeClasses(status: ServiceStatus): string {
  const classes: Record<ServiceStatus, string> = {
    pendente:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    em_andamento:
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    concluido:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return classes[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Retorna classes Tailwind para badge de status de pagamento
 */
export function getPaymentStatusBadgeClasses(status: PaymentStatus): string {
  const classes: Record<PaymentStatus, string> = {
    pendente:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    pago: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    parcial:
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return classes[status] || 'bg-gray-100 text-gray-800'
}

