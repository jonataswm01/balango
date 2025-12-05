/**
 * Converte uma string de data (YYYY-MM-DD) para Date no timezone local,
 * evitando o deslocamento de dia causado pelo parse ISO (UTC) padrão.
 */
export function parseDateOnlyToLocal(dateString: string | null | undefined): Date {
  if (!dateString) return new Date(NaN)
  const [yearStr, monthStr, dayStr] = dateString.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (!year || !month || !day) return new Date(NaN)

  // Usa o construtor local (ano, mês-1, dia) para manter o dia correto
  return new Date(year, month - 1, day)
}

