/**
 * Tipos TypeScript baseados no schema do banco de dados
 * Gerado a partir do schema SQL do Supabase
 */

// ============================================
// APP_SETTINGS
// ============================================
export interface AppSetting {
  key: string
  value: number
  description?: string | null
}

// ============================================
// CLIENTS
// ============================================
export interface Client {
  id: string
  created_at: string
  updated_at: string
  name: string
  phone?: string | null
  email?: string | null
  document?: string | null
  address?: string | null
  active: boolean
}

export interface ClientInsert {
  name: string
  phone?: string | null
  email?: string | null
  document?: string | null
  address?: string | null
  active?: boolean
}

export interface ClientUpdate {
  name?: string
  phone?: string | null
  email?: string | null
  document?: string | null
  address?: string | null
  active?: boolean
}

// ============================================
// SERVICES
// ============================================
export type ServiceStatus = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
export type ServicePriority = 'baixa' | 'media' | 'alta' | 'urgente'
export type PaymentStatus = 'pendente' | 'pago' | 'parcial' | 'cancelado'

export interface Service {
  id: string
  created_at: string
  updated_at: string
  description?: string | null
  date: string // DATE format: YYYY-MM-DD
  status: ServiceStatus
  priority: ServicePriority
  service_type?: string | null
  technician_id?: string | null
  client_id?: string | null
  gross_value: number
  operational_cost: number
  tax_amount: number
  has_invoice: boolean
  invoice_number?: string | null
  payment_status: PaymentStatus
  payment_method?: string | null
  payment_date?: string | null // DATE format: YYYY-MM-DD
  location?: string | null
  notes?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  start_date?: string | null // TIMESTAMP format
  completed_date?: string | null // TIMESTAMP format
  contact_phone?: string | null
  contact_email?: string | null
}

export interface ServiceInsert {
  description?: string | null
  date: string
  status?: ServiceStatus
  priority?: ServicePriority
  service_type?: string | null
  technician_id?: string | null
  client_id?: string | null
  gross_value?: number
  operational_cost?: number
  tax_amount?: number
  has_invoice?: boolean
  invoice_number?: string | null
  payment_status?: PaymentStatus
  payment_method?: string | null
  payment_date?: string | null
  location?: string | null
  notes?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  start_date?: string | null
  completed_date?: string | null
  contact_phone?: string | null
  contact_email?: string | null
}

export interface ServiceUpdate {
  description?: string | null
  date?: string
  status?: ServiceStatus
  priority?: ServicePriority
  service_type?: string | null
  technician_id?: string | null
  client_id?: string | null
  gross_value?: number
  operational_cost?: number
  tax_amount?: number
  has_invoice?: boolean
  invoice_number?: string | null
  payment_status?: PaymentStatus
  payment_method?: string | null
  payment_date?: string | null
  location?: string | null
  notes?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  start_date?: string | null
  completed_date?: string | null
  contact_phone?: string | null
  contact_email?: string | null
}

// Service com relacionamentos (joins)
export interface ServiceWithRelations extends Service {
  technician?: Technician | null
  client?: Client | null
}

// ============================================
// TECHNICIANS
// ============================================
export interface Technician {
  id: string
  created_at: string
  updated_at: string
  name: string
  nickname?: string | null
  active: boolean
  phone?: string | null
  email?: string | null
  document?: string | null
}

export interface TechnicianInsert {
  name: string
  nickname?: string | null
  active?: boolean
  phone?: string | null
  email?: string | null
  document?: string | null
}

export interface TechnicianUpdate {
  name?: string
  nickname?: string | null
  active?: boolean
  phone?: string | null
  email?: string | null
  document?: string | null
}

// ============================================
// USERS
// ============================================
export interface User {
  id: string
  email: string
  nome: string
  telefone: string
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

export interface UserInsert {
  id: string
  email: string
  nome: string
  telefone: string
  avatar_url?: string | null
}

export interface UserUpdate {
  email?: string
  nome?: string
  telefone?: string
  avatar_url?: string | null
}

// ============================================
// HELPERS
// ============================================

/**
 * Calcula o lucro líquido de um serviço
 */
export function calculateServiceProfit(service: Service): number {
  return service.gross_value - service.operational_cost - service.tax_amount
}

/**
 * Calcula o valor líquido de um serviço (após impostos)
 */
export function calculateServiceNetValue(service: Service): number {
  return service.gross_value - service.tax_amount
}

/**
 * Verifica se um serviço está pago
 */
export function isServicePaid(service: Service): boolean {
  return service.payment_status === 'pago'
}

/**
 * Verifica se um serviço está concluído
 */
export function isServiceCompleted(service: Service): boolean {
  return service.status === 'concluido'
}


