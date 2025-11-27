/**
 * Cliente HTTP para consumir as APIs do Balango
 * Todas as funções retornam dados ou lançam erros
 */

import { ServiceWithRelations, ServiceInsert, ServiceUpdate } from '@/lib/types/database'
import { Client, ClientInsert, ClientUpdate } from '@/lib/types/database'
import { Technician, TechnicianInsert, TechnicianUpdate } from '@/lib/types/database'
import { Organization, OrganizationInsert, OrganizationUpdate, OrganizationMember, OrganizationMemberInsert, OrganizationMemberUpdate } from '@/lib/types/database'

const API_BASE_URL = '/api'

// ============================================
// TIPOS DE RESPOSTA
// ============================================

interface ApiError {
  error: string
  details?: string
}

// ============================================
// FUNÇÃO BASE DE REQUISIÇÃO
// ============================================

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Inclui cookies para autenticação
  })

  const data = await response.json()

  if (!response.ok) {
    const error: ApiError = data
    throw new Error(error.error || error.details || 'Erro na requisição')
  }

  return data as T
}

// ============================================
// SERVICES API
// ============================================

export const servicesApi = {
  /**
   * Lista todos os serviços
   */
  async getAll(): Promise<ServiceWithRelations[]> {
    return request<ServiceWithRelations[]>('/services')
  },

  /**
   * Busca um serviço específico
   */
  async getById(id: string): Promise<ServiceWithRelations> {
    return request<ServiceWithRelations>(`/services/${id}`)
  },

  /**
   * Cria um novo serviço
   */
  async create(data: ServiceInsert): Promise<ServiceWithRelations> {
    return request<ServiceWithRelations>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Atualiza um serviço
   */
  async update(id: string, data: ServiceUpdate): Promise<ServiceWithRelations> {
    return request<ServiceWithRelations>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Deleta um serviço
   */
  async delete(id: string): Promise<void> {
    await request(`/services/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Lista clientes para dropdown
   */
  async getClients(): Promise<Array<{ id: string; name: string }>> {
    return request<Array<{ id: string; name: string }>>('/services/clients')
  },

  /**
   * Lista técnicos para dropdown
   */
  async getTechnicians(): Promise<
    Array<{ id: string; name: string; nickname: string | null }>
  > {
    return request<Array<{ id: string; name: string; nickname: string | null }>>(
      '/services/technicians'
    )
  },

  /**
   * Busca dados agregados para analytics
   */
  async getAnalytics(): Promise<{
    monthly: Array<{
      month: string
      receitaBruta: number
      receitaLiquida: number
      custos: number
      impostos: number
      quantidade: number
    }>
    byTechnician: Array<{
      name: string
      quantidade: number
      valorTotal: number
      valorMedio: number
    }>
    byClient: Array<{
      name: string
      quantidade: number
      valorTotal: number
    }>
    paymentStatus: {
      pendente: { quantidade: number; valor: number }
      pago: { quantidade: number; valor: number }
      atrasado: { quantidade: number; valor: number }
    }
    invoiceStatus: {
      comNF: { quantidade: number; valor: number }
      semNF: { quantidade: number; valor: number }
    }
  }> {
    return request('/services/analytics')
  },

  /**
   * Busca serviços agrupados por dia do mês
   */
  async getCalendar(year: number, month: number): Promise<
    Record<
      string,
      Array<{
        id: string
        date: string
        gross_value: number
        has_invoice: boolean
        client: { name: string } | null
        technician: { name: string } | null
      }>
    >
  > {
    return request(`/services/calendar/${year}/${month}`)
  },
}

// ============================================
// CLIENTS API
// ============================================

export const clientsApi = {
  /**
   * Lista todos os clientes
   */
  async getAll(includeInactive = false): Promise<Client[]> {
    const params = includeInactive ? '?includeInactive=true' : ''
    return request<Client[]>(`/clients${params}`)
  },

  /**
   * Busca um cliente específico
   */
  async getById(id: string): Promise<Client> {
    return request<Client>(`/clients/${id}`)
  },

  /**
   * Cria um novo cliente
   */
  async create(data: ClientInsert): Promise<Client> {
    return request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Atualiza um cliente
   */
  async update(id: string, data: ClientUpdate): Promise<Client> {
    return request<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Deleta um cliente
   */
  async delete(id: string): Promise<void> {
    await request(`/clients/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// TECHNICIANS API
// ============================================

export const techniciansApi = {
  /**
   * Lista todos os técnicos
   */
  async getAll(includeInactive = false): Promise<Technician[]> {
    const params = includeInactive ? '?includeInactive=true' : ''
    return request<Technician[]>(`/technicians${params}`)
  },

  /**
   * Busca um técnico específico
   */
  async getById(id: string): Promise<Technician> {
    return request<Technician>(`/technicians/${id}`)
  },

  /**
   * Cria um novo técnico
   */
  async create(data: TechnicianInsert): Promise<Technician> {
    return request<Technician>('/technicians', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Atualiza um técnico
   */
  async update(id: string, data: TechnicianUpdate): Promise<Technician> {
    return request<Technician>(`/technicians/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Deleta um técnico
   */
  async delete(id: string): Promise<void> {
    await request(`/technicians/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// SETTINGS API
// ============================================

export const settingsApi = {
  /**
   * Lista todas as configurações
   */
  async getAll(): Promise<Array<{ key: string; value: number; description?: string | null }>> {
    return request('/settings')
  },

  /**
   * Busca uma configuração específica
   */
  async getByKey(key: string): Promise<{ key: string; value: number; description?: string | null }> {
    return request(`/settings/${key}`)
  },

  /**
   * Cria ou atualiza uma configuração
   */
  async set(key: string, value: number, description?: string): Promise<{
    key: string
    value: number
    description?: string | null
  }> {
    return request('/settings', {
      method: 'POST',
      body: JSON.stringify({ key, value, description }),
    })
  },

  /**
   * Atualiza uma configuração específica
   */
  async update(key: string, value?: number, description?: string): Promise<{
    key: string
    value: number
    description?: string | null
  }> {
    return request(`/settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value, description }),
    })
  },
}

// ============================================
// ORGANIZATIONS API
// ============================================

export const organizationsApi = {
  /**
   * Lista organizações do usuário
   */
  async getAll(): Promise<Organization[]> {
    return request<Organization[]>('/organizations')
  },

  /**
   * Busca uma organização específica
   */
  async getById(id: string): Promise<Organization> {
    return request<Organization>(`/organizations/${id}`)
  },

  /**
   * Cria uma nova organização
   */
  async create(data: OrganizationInsert): Promise<Organization> {
    return request<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Atualiza uma organização
   */
  async update(id: string, data: OrganizationUpdate): Promise<Organization> {
    return request<Organization>(`/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Lista membros de uma organização
   */
  async getMembers(organizationId: string): Promise<Array<OrganizationMember & { user: any }>> {
    return request<Array<OrganizationMember & { user: any }>>(
      `/organizations/${organizationId}/members`
    )
  },

  /**
   * Adiciona um membro à organização
   */
  async addMember(
    organizationId: string,
    data: OrganizationMemberInsert
  ): Promise<OrganizationMember & { user: any }> {
    return request<OrganizationMember & { user: any }>(
      `/organizations/${organizationId}/members`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  },

  /**
   * Atualiza um membro
   */
  async updateMember(
    organizationId: string,
    memberId: string,
    data: OrganizationMemberUpdate
  ): Promise<OrganizationMember & { user: any }> {
    return request<OrganizationMember & { user: any }>(
      `/organizations/${organizationId}/members/${memberId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    )
  },

  /**
   * Remove um membro da organização
   */
  async removeMember(organizationId: string, memberId: string): Promise<void> {
    await request(`/organizations/${organizationId}/members/${memberId}`, {
      method: 'DELETE',
    })
  },
}

// ============================================
// EXPORT DEFAULT (tudo junto)
// ============================================

export default {
  services: servicesApi,
  clients: clientsApi,
  technicians: techniciansApi,
  settings: settingsApi,
  organizations: organizationsApi,
}

