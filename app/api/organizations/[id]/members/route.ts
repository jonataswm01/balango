import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/organizations/[id]/members
 * Lista membros de uma organização
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

    // Buscar todos os usuários da organização
    const { data: members, error } = await supabase
      .from('users')
      .select(`
        id,
        nome,
        email,
        avatar_url,
        role,
        active,
        created_at,
        updated_at
      `)
      .eq('organization_id', id)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar membros:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar membros', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(members || [])
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations/[id]/members
 * Adiciona um membro à organização
 */
export async function POST(
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
    const { user_id, role = 'member' } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se usuário é admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('organization_id, role, active')
      .eq('id', user.id)
      .single()

    if (!currentUser || currentUser.organization_id !== id || currentUser.role !== 'admin' || !currentUser.active) {
      return NextResponse.json(
        { error: 'Apenas administradores podem adicionar membros' },
        { status: 403 }
      )
    }

    // Verificar se usuário já pertence a outra organização
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, organization_id')
      .eq('id', user_id)
      .single()

    if (existingUser && existingUser.organization_id && existingUser.organization_id !== id) {
      return NextResponse.json(
        { error: 'Usuário já pertence a outra organização' },
        { status: 400 }
      )
    }

    // Atualizar ou criar membro (atualizar usuário para esta organização)
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        organization_id: id,
        role,
        active: true,
      })
      .eq('id', user_id)
      .select(`
        id,
        nome,
        email,
        avatar_url,
        role,
        active,
        created_at,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('Erro ao atualizar membro:', updateError)
      return NextResponse.json(
        { error: 'Erro ao adicionar membro', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updated, { status: 201 })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

