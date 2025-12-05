/**
 * Funções utilitárias para serviços
 * Lógica de negócio centralizada
 */

import { Service, ServiceInsert, ServiceUpdate, ServiceStatus } from '@/lib/types/database'

/**
 * Busca a taxa de imposto atual do banco de dados
 */
export async function getTaxRate(supabase: any): Promise<number> {
  try {
    // Importar getUserOrganizationId dinamicamente para evitar dependência circular
    const { getUserOrganizationId } = await import('@/lib/api/auth')
    
    const organizationId = await getUserOrganizationId(supabase)
    if (!organizationId) {
      return 0
    }

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'tax_rate')
      .eq('organization_id', organizationId)
      .single()

    if (error || !data) {
      // Se não encontrar, retorna 0 (sem imposto)
      return 0
    }

    return Number(data.value) || 0
  } catch (error) {
    console.error('Erro ao buscar taxa de imposto:', error)
    return 0
  }
}

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
 * Atualiza o status do serviço automaticamente baseado em datas e pagamento
 */
export function updateServiceStatus(
  currentService: Service,
  updateData: ServiceUpdate
): ServiceStatus | undefined {
  // Se o status foi explicitamente alterado, não muda automaticamente
  if (updateData.status !== undefined) {
    return undefined
  }

  // Só reagir quando os campos realmente mudarem
  const startDateChanged =
    updateData.start_date !== undefined &&
    updateData.start_date !== currentService.start_date
  const completedDateChanged =
    updateData.completed_date !== undefined &&
    updateData.completed_date !== currentService.completed_date

  let newStatus: ServiceStatus | undefined = undefined

  // Prioridade 1: Se completed_date foi preenchido, status = concluido
  // Isso indica que o trabalho foi realmente finalizado
  if (completedDateChanged && updateData.completed_date !== null) {
    newStatus = 'concluido'
  }
  // Prioridade 2: Se completed_date foi removido e status atual é concluido, volta para em_andamento ou pendente
  else if (completedDateChanged && updateData.completed_date === null && currentService.status === 'concluido') {
    // Se tinha start_date, volta para em_andamento, senão volta para pendente
    newStatus = currentService.start_date ? 'em_andamento' : 'pendente'
  }
  // Prioridade 3: Se start_date foi preenchido e status atual é pendente, muda para em_andamento
  // Isso indica que o trabalho começou
  else if (
    startDateChanged &&
    updateData.start_date !== null &&
    currentService.status === 'pendente'
  ) {
    newStatus = 'em_andamento'
  }
  // Prioridade 4: Se start_date foi removido e status atual é em_andamento, volta para pendente
  else if (
    startDateChanged &&
    updateData.start_date === null &&
    currentService.status === 'em_andamento' &&
    !currentService.completed_date // Só volta para pendente se não tiver completed_date
  ) {
    newStatus = 'pendente'
  }

  return newStatus
}

/**
 * Limpa campos undefined/null/vazios do update (exceto campos de texto livre)
 */
export function cleanUpdateData(data: ServiceUpdate): ServiceUpdate {
  const cleaned: Partial<ServiceUpdate> = {}

  // Campos que podem ser strings vazias (texto livre)
  const textFields = ['description', 'notes', 'location', 'invoice_number']

  Object.keys(data).forEach((key) => {
    const value = data[key as keyof ServiceUpdate]

    // Se for campo de texto livre, mantém mesmo se vazio
    if (textFields.includes(key)) {
      if (value !== undefined) {
        cleaned[key as keyof ServiceUpdate] = value as any
      }
      return
    }

    // Para outros campos, remove undefined, null e strings vazias
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key as keyof ServiceUpdate] = value as any
    }
  })

  return cleaned as ServiceUpdate
}

/**
 * Valida dados de criação de serviço
 */
export function validateServiceInsert(data: ServiceInsert): { valid: boolean; error?: string } {
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

  return { valid: true }
}

/**
 * Prepara dados de inserção com valores padrão e cálculos
 */
export async function prepareServiceInsert(
  data: ServiceInsert,
  supabase: any
): Promise<ServiceInsert> {
  const prepared: ServiceInsert = { ...data }

  // Valores padrão
  prepared.status = prepared.status || 'pendente'
  prepared.priority = prepared.priority || 'media'
  prepared.gross_value = prepared.gross_value || 0
  prepared.operational_cost = prepared.operational_cost || 0
  prepared.has_invoice = prepared.has_invoice || false

  // Calcular imposto se necessário
  if (prepared.has_invoice && prepared.gross_value) {
    const taxRate = await getTaxRate(supabase)
    prepared.tax_amount = calculateTaxAmount(prepared.gross_value, true, taxRate)
  } else {
    prepared.tax_amount = 0
  }

  return prepared
}

/**
 * Prepara dados de atualização com recálculos necessários
 */
export async function prepareServiceUpdate(
  currentService: Service,
  data: ServiceUpdate,
  supabase: any
): Promise<ServiceUpdate> {
  const prepared: ServiceUpdate = cleanUpdateData(data)

  // Recalcular imposto se has_invoice ou gross_value mudaram
  const needsTaxRecalculation =
    (prepared.has_invoice !== undefined && prepared.has_invoice !== currentService.has_invoice) ||
    (prepared.gross_value !== undefined && prepared.gross_value !== currentService.gross_value)

  if (needsTaxRecalculation) {
    const grossValue = prepared.gross_value ?? currentService.gross_value
    const hasInvoice = prepared.has_invoice ?? currentService.has_invoice

    if (hasInvoice && grossValue) {
      const taxRate = await getTaxRate(supabase)
      prepared.tax_amount = calculateTaxAmount(grossValue, true, taxRate)
    } else {
      prepared.tax_amount = 0
    }
  }

  // Atualizar status automaticamente
  const autoStatus = updateServiceStatus(currentService, prepared)
  if (autoStatus) {
    prepared.status = autoStatus
  }

  return prepared
}

