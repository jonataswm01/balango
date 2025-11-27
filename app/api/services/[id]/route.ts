import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ServiceUpdate, ServiceWithRelations } from '@/lib/types/database'
import { prepareServiceUpdate } from '@/lib/api/services'

/**
 * GET /api/services/[id]
 * Busca um serviço específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params

    // Buscar serviço com relacionamentos
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        clients:client_id (
          id,
          name,
          email,
          phone,
          document,
          address
        ),
        technicians:technician_id (
          id,
          name,
          nickname,
          email,
          phone,
          document
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar serviço:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar serviço', details: error.message },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedService: ServiceWithRelations = {
      ...service,
      client: service.clients ? service.clients : null,
      technician: service.technicians ? service.technicians : null,
    }

    return NextResponse.json(formattedService)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/services/[id]
 * Atualiza um serviço
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params
    const body: ServiceUpdate = await request.json()

    // Buscar serviço atual
    const { data: currentService, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentService) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    // Verificar se cliente existe (se foi alterado)
    if (body.client_id && body.client_id !== currentService.client_id) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', body.client_id)
        .single()

      if (clientError || !client) {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
      }
    }

    // Verificar se técnico existe (se foi alterado)
    if (body.technician_id && body.technician_id !== currentService.technician_id) {
      const { data: technician, error: technicianError } = await supabase
        .from('technicians')
        .select('id')
        .eq('id', body.technician_id)
        .single()

      if (technicianError || !technician) {
        return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })
      }
    }

    // Preparar dados (recalcular impostos, atualizar status, etc.)
    const preparedData = await prepareServiceUpdate(currentService, body, supabase)

    // Atualizar serviço
    const { data: updatedService, error: updateError } = await supabase
      .from('services')
      .update(preparedData)
      .eq('id', id)
      .select(`
        *,
        clients:client_id (
          id,
          name,
          email,
          phone,
          document,
          address
        ),
        technicians:technician_id (
          id,
          name,
          nickname,
          email,
          phone,
          document
        )
      `)
      .single()

    if (updateError) {
      console.error('Erro ao atualizar serviço:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar serviço', details: updateError.message },
        { status: 500 }
      )
    }

    // Formatar resposta
    const formattedService: ServiceWithRelations = {
      ...updatedService,
      client: updatedService.clients ? updatedService.clients : null,
      technician: updatedService.technicians ? updatedService.technicians : null,
    }

    return NextResponse.json(formattedService)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/services/[id]
 * Exclui um serviço
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params

    // Verificar se serviço existe
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    // Deletar serviço
    const { error: deleteError } = await supabase.from('services').delete().eq('id', id)

    if (deleteError) {
      console.error('Erro ao deletar serviço:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar serviço', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Serviço deletado com sucesso' })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

