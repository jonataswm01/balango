import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TechnicianInsert, TechnicianUpdate } from '@/lib/types/database'
import { getUserOrganizationId } from '@/lib/api/auth'

/**
 * GET /api/technicians
 * Lista todos os técnicos
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

    // Buscar parâmetro para incluir inativos
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = supabase
      .from('technicians')
      .select('*')
      .order('name', { ascending: true })

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data: technicians, error } = await query

    if (error) {
      console.error('Erro ao buscar técnicos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar técnicos', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(technicians || [])
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/technicians
 * Cria um novo técnico
 */
export async function POST(request: NextRequest) {
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

    const body: TechnicianInsert = await request.json()

    // Validar dados
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Buscar organization_id do usuário
    const organizationId = await getUserOrganizationId(supabase)
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a uma organização' },
        { status: 403 }
      )
    }

    // Valores padrão
    const technicianData: TechnicianInsert = {
      ...body,
      active: body.active !== undefined ? body.active : true,
      organization_id: organizationId,
    }

    // Inserir técnico
    const { data: technician, error: insertError } = await supabase
      .from('technicians')
      .insert(technicianData)
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar técnico:', insertError)
      return NextResponse.json(
        { error: 'Erro ao criar técnico', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(technician, { status: 201 })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

