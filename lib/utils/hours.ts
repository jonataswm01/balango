/**
 * Funções para formatação de horas
 */

/**
 * Formata horas para exibição (ex: 2 -> "2:00 Horas")
 */
export function formatHours(value: number | string | null | undefined): string {
  if (!value && value !== 0) return ""
  
  const numValue = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(numValue) || numValue < 0) return ""

  const hours = Math.floor(numValue)
  const minutes = Math.round((numValue - hours) * 60)

  if (minutes === 0) {
    return `${hours}:00 Horas`
  } else {
    return `${hours}:${minutes.toString().padStart(2, "0")} Horas`
  }
}

/**
 * Converte string formatada de horas para número
 * Aceita formatos: "2", "2:00", "2:30", "2.5", etc.
 */
export function parseHours(value: string): number | null {
  if (!value || value.trim() === "") return null

  // Remove "Horas" se presente
  const cleaned = value.replace(/horas?/gi, "").trim()

  // Verifica se tem formato "H:MM" ou "H:MM:SS"
  if (cleaned.includes(":")) {
    const parts = cleaned.split(":")
    const hours = parseFloat(parts[0]) || 0
    const minutes = parseFloat(parts[1]) || 0
    return hours + minutes / 60
  }

  // Caso contrário, trata como número decimal
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : Math.max(0, parsed)
}

/**
 * Formata horas enquanto o usuário digita
 * Aceita: números, "H:MM", "H.MM"
 * Retorna formato: "H:MM Horas"
 */
export function formatHoursInput(value: string): string {
  if (!value) return ""

  // Remove "Horas" se presente para processar
  let cleaned = value.replace(/horas?/gi, "").trim()

  // Remove tudo exceto números, dois pontos e ponto
  cleaned = cleaned.replace(/[^\d:.]/g, "")

  // Se tem dois pontos, mantém formato H:MM
  if (cleaned.includes(":")) {
    const parts = cleaned.split(":")
    const hours = parts[0] || "0"
    const minutes = parts[1]?.substring(0, 2) || "00"
    return `${hours}:${minutes} Horas`
  }

  // Se tem ponto decimal, trata como decimal
  if (cleaned.includes(".")) {
    const parsed = parseFloat(cleaned)
    if (isNaN(parsed)) return ""
    const hours = Math.floor(parsed)
    const minutes = Math.round((parsed - hours) * 60)
    return `${hours}:${minutes.toString().padStart(2, "0")} Horas`
  }

  // Apenas números - formata como H:00 Horas
  const num = parseFloat(cleaned)
  if (isNaN(num)) return ""
  if (num === 0) return ""
  return `${Math.floor(num)}:00 Horas`
}

