import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ClientUpdate } from '@/lib/types/database'

/**
 * GET /api/clients/[id]
 * Busca um cliente específico
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

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar cliente:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar cliente', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(client)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/clients/[id]
 * Atualiza um cliente
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
    const body: ClientUpdate = await request.json()

    // Validar nome se foi alterado
    if (body.name !== undefined && body.name.trim() === '') {
      return NextResponse.json({ error: 'Nome não pode ser vazio' }, { status: 400 })
    }

    // Limpar campos undefined/null e construir objeto de atualização
    const updateData: Partial<ClientUpdate> = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.email !== undefined) updateData.email = body.email
    if (body.document !== undefined) updateData.document = body.document
    if (body.address !== undefined) updateData.address = body.address
    if (body.active !== undefined) updateData.active = body.active

    // Atualizar cliente
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
      }
      console.error('Erro ao atualizar cliente:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar cliente', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedClient)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/clients/[id]
 * Exclui um cliente
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

    // Verificar se cliente existe
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Verificar se há serviços vinculados
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .eq('client_id', id)
      .limit(1)

    if (servicesError) {
      console.error('Erro ao verificar serviços:', servicesError)
    } else if (services && services.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir cliente com serviços vinculados' },
        { status: 400 }
      )
    }

    // Deletar cliente
    const { error: deleteError } = await supabase.from('clients').delete().eq('id', id)

    if (deleteError) {
      console.error('Erro ao deletar cliente:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar cliente', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Cliente deletado com sucesso' })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

