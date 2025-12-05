import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganizationId } from '@/lib/api/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/services/clients
 * Lista todos os clientes (para dropdowns) - FILTRADO POR ORGANIZAÇÃO
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar organization_id do usuário
    const organizationId = await getUserOrganizationId(supabase)
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a uma organização' },
        { status: 403 }
      )
    }

    // Buscar apenas clientes ativos da organização do usuário
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name')
      .eq('organization_id', organizationId)
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar clientes:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar clientes', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(clients || [])
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

