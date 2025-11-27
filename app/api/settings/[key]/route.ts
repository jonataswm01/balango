import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/settings/[key]
 * Busca uma configuração específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
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

    const { key } = params

    const { data: setting, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 })
      }
      console.error('Erro ao buscar configuração:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar configuração', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(setting)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/settings/[key]
 * Atualiza uma configuração específica
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
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

    const { key } = params
    const body = await request.json()
    const { value, description } = body

    if (value === undefined && description === undefined) {
      return NextResponse.json(
        { error: 'Pelo menos um campo (value ou description) deve ser fornecido' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (value !== undefined) {
      updateData.value = Number(value)
    }
    if (description !== undefined) {
      updateData.description = description
    }

    const { data: updated, error: updateError } = await supabase
      .from('app_settings')
      .update(updateData)
      .eq('key', key)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 })
      }
      console.error('Erro ao atualizar configuração:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar configuração', details: updateError.message },
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

