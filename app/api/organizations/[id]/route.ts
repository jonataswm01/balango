import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/organizations/[id]
 * Busca uma organização específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = params

    // Verificar se usuário pertence à organização
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, active')
      .eq('id', user.id)
      .single()

    if (!userData || userData.organization_id !== id || !userData.active) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Organização não encontrada' },
          { status: 404 }
        )
      }
      console.error('Erro ao buscar organização:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar organização', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(organization)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/organizations/[id]
 * Atualiza uma organização
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Verificar se usuário é admin
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role, active')
      .eq('id', user.id)
      .single()

    if (!userData || userData.organization_id !== id || userData.role !== 'admin' || !userData.active) {
      return NextResponse.json(
        { error: 'Apenas administradores podem atualizar organizações' },
        { status: 403 }
      )
    }

    const { data: updated, error } = await supabase
      .from('organizations')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar organização:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar organização', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

