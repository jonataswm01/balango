import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  ServiceInsert,
  ServiceUpdate,
  ServiceWithRelations,
} from '@/lib/types/database'
import {
  validateServiceInsert,
  prepareServiceInsert,
  prepareServiceUpdate,
} from '@/lib/api/services'
import { getUserOrganizationId } from '@/lib/api/auth'

/**
 * GET /api/services
 * Lista todos os serviços com relacionamentos
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

    // Buscar serviços com relacionamentos
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        clients:client_id (
          id,
          name,
          email,
          phone
        ),
        technicians:technician_id (
          id,
          name,
          nickname,
          email,
          phone
        )
      `)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar serviços:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar serviços', details: error.message },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedServices: ServiceWithRelations[] = (services || []).map((service: any) => ({
      ...service,
      client: service.clients ? service.clients : null,
      technician: service.technicians ? service.technicians : null,
    }))

    return NextResponse.json(formattedServices)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/services
 * Cria um novo serviço
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

    // Ler body
    const body: ServiceInsert = await request.json()

    // Validar dados
    const validation = validateServiceInsert(body)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Verificar se cliente existe
    if (body.client_id) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', body.client_id)
        .single()

      if (clientError || !client) {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
      }
    }

    // Verificar se técnico existe
    if (body.technician_id) {
      const { data: technician, error: technicianError } = await supabase
        .from('technicians')
        .select('id')
        .eq('id', body.technician_id)
        .single()

      if (technicianError || !technician) {
        return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })
      }
    }

    // Buscar organization_id do usuário
    const organizationId = await getUserOrganizationId(supabase)
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a uma organização' },
        { status: 403 }
      )
    }

    // Preparar dados (valores padrão e cálculos)
    const preparedData = await prepareServiceInsert(body, supabase)
    preparedData.organization_id = organizationId

    // Inserir serviço
    const { data: service, error: insertError } = await supabase
      .from('services')
      .insert(preparedData)
      .select(`
        *,
        clients:client_id (
          id,
          name,
          email,
          phone
        ),
        technicians:technician_id (
          id,
          name,
          nickname,
          email,
          phone
        )
      `)
      .single()

    if (insertError) {
      console.error('Erro ao criar serviço:', insertError)
      return NextResponse.json(
        { error: 'Erro ao criar serviço', details: insertError.message },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedService: ServiceWithRelations = {
      ...service,
      client: service.clients ? service.clients : null,
      technician: service.technicians ? service.technicians : null,
    }

    return NextResponse.json(formattedService, { status: 201 })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

