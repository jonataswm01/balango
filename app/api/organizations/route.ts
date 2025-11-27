import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/organizations
 * Lista organizações do usuário autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar organização do usuário diretamente da tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, role, active')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Erro ao buscar usuário:', userError)
      return NextResponse.json(
        { error: 'Erro ao buscar organizações', details: userError.message },
        { status: 500 }
      )
    }

    if (!userData || !userData.organization_id || !userData.active) {
      return NextResponse.json([])
    }

    // Buscar organização (RLS vai filtrar automaticamente)
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', userData.organization_id)
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar organizações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar organizações', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(organizations || [])
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations
 * Cria uma nova organização
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, document, phone, email, address, logo_url } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se slug já existe
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Slug já existe. Escolha outro.' },
        { status: 400 }
      )
    }

    // Criar organização
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        document: document || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        logo_url: logo_url || null,
        active: true,
      })
      .select()
      .single()

    if (orgError) {
      console.error('Erro ao criar organização:', orgError)
      return NextResponse.json(
        { error: 'Erro ao criar organização', details: orgError.message },
        { status: 500 }
      )
    }

    // Atualizar usuário para ser admin da nova organização
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        organization_id: organization.id,
        role: 'admin',
        active: true,
      })
      .eq('id', user.id)

    if (userUpdateError) {
      console.error('Erro ao atualizar usuário:', userUpdateError)
      // Rollback: deletar organização criada
      await supabase.from('organizations').delete().eq('id', organization.id)
      return NextResponse.json(
        { error: 'Erro ao criar organização', details: userUpdateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(organization, { status: 201 })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

