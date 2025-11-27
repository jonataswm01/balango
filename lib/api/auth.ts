/**
 * Funções utilitárias para autenticação e organização
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Busca o organization_id do usuário autenticado
 */
export async function getUserOrganizationId(supabase: any): Promise<string | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, active')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.active) {
      return null
    }

    return userData.organization_id
  } catch (error) {
    console.error('Erro ao buscar organization_id:', error)
    return null
  }
}

