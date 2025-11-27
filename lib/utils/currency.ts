/**
 * Funções para formatação e manipulação de valores monetários
 */

/**
 * Formata um número para string de moeda brasileira
 */
export function formatCurrencyInput(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) || 0 : value
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)
}

/**
 * Converte string formatada de moeda para número
 */
export function parseCurrencyInput(value: string): number {
  // Remove tudo exceto números e vírgula/ponto
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".")
  const parsed = parseFloat(cleaned) || 0
  return Math.max(0, parsed) // Garante que não seja negativo
}

/**
 * Formata valor enquanto o usuário digita (máscara de moeda)
 */
export function formatCurrencyMask(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, "")
  
  if (!numbers) return ""

  // Converte para número e divide por 100 para ter centavos
  const amount = parseFloat(numbers) / 100

  // Formata como moeda brasileira
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Converte valor formatado de volta para número
 * Ex: "1.500,00" -> 1500
 * Ex: "15,00" -> 15
 */
export function parseCurrencyMask(value: string): number {
  if (!value) return 0
  
  // Remove tudo exceto números, vírgula e ponto
  let cleaned = value.replace(/[^\d,.]/g, "")
  
  if (!cleaned) return 0
  
  // Formato brasileiro: remove pontos (milhares) e substitui vírgula por ponto
  // Ex: "1.500,00" -> "1500,00" -> "1500.00" -> 1500
  cleaned = cleaned.replace(/\./g, "").replace(",", ".")
  
  return parseFloat(cleaned) || 0
}

