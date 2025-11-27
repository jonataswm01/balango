import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/settings
 * Lista todas as configurações
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

    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('Erro ao buscar configurações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar configurações', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(settings || [])
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/settings
 * Cria ou atualiza uma configuração
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

    const body = await request.json()
    const { key, value, description } = body

    if (!key) {
      return NextResponse.json({ error: 'Chave é obrigatória' }, { status: 400 })
    }

    if (value === undefined || value === null) {
      return NextResponse.json({ error: 'Valor é obrigatório' }, { status: 400 })
    }

    // Verificar se configuração já existe
    const { data: existing } = await supabase
      .from('app_settings')
      .select('key')
      .eq('key', key)
      .single()

    if (existing) {
      // Atualizar
      const { data: updated, error: updateError } = await supabase
        .from('app_settings')
        .update({
          value: Number(value),
          description: description || null,
        })
        .eq('key', key)
        .select()
        .single()

      if (updateError) {
        console.error('Erro ao atualizar configuração:', updateError)
        return NextResponse.json(
          { error: 'Erro ao atualizar configuração', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json(updated)
    } else {
      // Criar
      const { data: created, error: createError } = await supabase
        .from('app_settings')
        .insert({
          key,
          value: Number(value),
          description: description || null,
        })
        .select()
        .single()

      if (createError) {
        console.error('Erro ao criar configuração:', createError)
        return NextResponse.json(
          { error: 'Erro ao criar configuração', details: createError.message },
          { status: 500 }
        )
      }

      return NextResponse.json(created, { status: 201 })
    }
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

