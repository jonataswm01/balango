import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Atualiza um membro (role ou active)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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

    const { id, memberId } = params
    const body = await request.json()

    // Verificar se usuário é admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('organization_id, role, active')
      .eq('id', user.id)
      .single()

    if (!currentUser || currentUser.organization_id !== id || currentUser.role !== 'admin' || !currentUser.active) {
      return NextResponse.json(
        { error: 'Apenas administradores podem atualizar membros' },
        { status: 403 }
      )
    }

    // Atualizar usuário (membro)
    const { data: updated, error } = await supabase
      .from('users')
      .update(body)
      .eq('id', memberId)
      .eq('organization_id', id)
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

    if (error) {
      console.error('Erro ao atualizar membro:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar membro', details: error.message },
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

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove um membro da organização
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
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

    const { id, memberId } = params

    // Verificar se usuário é admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('organization_id, role, active')
      .eq('id', user.id)
      .single()

    if (!currentUser || currentUser.organization_id !== id || currentUser.role !== 'admin' || !currentUser.active) {
      return NextResponse.json(
        { error: 'Apenas administradores podem remover membros' },
        { status: 403 }
      )
    }

    // Não permitir remover a si mesmo
    if (memberId === user.id) {
      return NextResponse.json(
        { error: 'Você não pode remover a si mesmo' },
        { status: 400 }
      )
    }

    // Desativar usuário (membro)
    const { error } = await supabase
      .from('users')
      .update({ active: false })
      .eq('id', memberId)
      .eq('organization_id', id)

    if (error) {
      console.error('Erro ao remover membro:', error)
      return NextResponse.json(
        { error: 'Erro ao remover membro', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

