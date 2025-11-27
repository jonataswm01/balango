/**
 * Funções utilitárias para serviços
 * Formatação e cálculos financeiros
 */

import { Service } from '@/lib/types/database'

/**
 * Calcula o valor do imposto baseado na taxa e valor bruto
 */
export function calculateTaxAmount(
  grossValue: number,
  hasInvoice: boolean,
  taxRate: number
): number {
  if (!hasInvoice || !grossValue || grossValue <= 0) {
    return 0
  }

  return Number((grossValue * taxRate).toFixed(2))
}

/**
 * Calcula a receita sem custos operacionais
 */
export function calculateNetRevenue(
  grossValue: number,
  operationalCost: number
): number {
  return Number((grossValue - (operationalCost || 0)).toFixed(2))
}

/**
 * Calcula o lucro líquido (receita bruta - custos - impostos)
 */
export function calculateNetProfit(
  grossValue: number,
  operationalCost: number,
  taxAmount: number
): number {
  return Number(
    (grossValue - (operationalCost || 0) - (taxAmount || 0)).toFixed(2)
  )
}

/**
 * Formata data/hora (timestamp) para exibição
 */
export function formatDateTime(datetime: string | null | undefined): string {
  if (!datetime) return ''

  try {
    const date = new Date(datetime)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return ''
  }
}

/**
 * Formata mês/ano para exibição (ex: "novembro de 2025")
 */
export function formatMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Calcula KPIs de uma lista de serviços
 */
export function calculateKPIs(services: Service[]) {
  let receitaBruta = 0
  let totalCustos = 0
  let totalImpostos = 0
  let baseNF = 0

  services.forEach((service) => {
    receitaBruta += Number(service.gross_value) || 0
    totalCustos += Number(service.operational_cost) || 0
    totalImpostos += Number(service.tax_amount) || 0

    if (service.has_invoice) {
      baseNF += Number(service.gross_value) || 0
    }
  })

  const receitaSemCustos = receitaBruta - totalCustos
  const lucroLiquido = receitaSemCustos - totalImpostos

  return {
    receitaBruta: Number(receitaBruta.toFixed(2)),
    receitaSemCustos: Number(receitaSemCustos.toFixed(2)),
    baseNF: Number(baseNF.toFixed(2)),
    impostos: Number(totalImpostos.toFixed(2)),
    lucroLiquido: Number(lucroLiquido.toFixed(2)),
  }
}

