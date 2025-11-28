import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganizationId } from '@/lib/api/auth'

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

    // Buscar organization_id do usuário
    const organizationId = await getUserOrganizationId(supabase)
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a uma organização' },
        { status: 403 }
      )
    }

    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('organization_id', organizationId)
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
      console.error('Erro de autenticação:', authError)
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, description } = body

    console.log('Dados recebidos:', { key, value, description })

    if (!key) {
      return NextResponse.json({ error: 'Chave é obrigatória' }, { status: 400 })
    }

    if (value === undefined || value === null) {
      return NextResponse.json({ error: 'Valor é obrigatório' }, { status: 400 })
    }

    // Validar que value é um número
    const numericValue = Number(value)
    if (isNaN(numericValue)) {
      return NextResponse.json({ error: 'Valor deve ser um número' }, { status: 400 })
    }

    // Buscar organization_id do usuário
    const organizationId = await getUserOrganizationId(supabase)
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a uma organização' },
        { status: 403 }
      )
    }

    // Verificar se configuração já existe
    const { data: existing, error: checkError } = await supabase
      .from('app_settings')
      .select('key')
      .eq('key', key)
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar configuração:', checkError)
      return NextResponse.json(
        { error: 'Erro ao verificar configuração', details: checkError.message },
        { status: 500 }
      )
    }

    if (existing) {
      // Atualizar
      const { data: updated, error: updateError } = await supabase
        .from('app_settings')
        .update({
          value: numericValue,
          description: description || null,
        })
        .eq('key', key)
        .eq('organization_id', organizationId)
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
          value: numericValue,
          description: description || null,
          organization_id: organizationId,
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

