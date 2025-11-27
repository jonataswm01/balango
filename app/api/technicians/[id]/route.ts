import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TechnicianUpdate } from '@/lib/types/database'

/**
 * GET /api/technicians/[id]
 * Busca um técnico específico
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

    const { data: technician, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar técnico:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar técnico', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(technician)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/technicians/[id]
 * Atualiza um técnico
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
    const body: TechnicianUpdate = await request.json()

    // Validar nome se foi alterado
    if (body.name !== undefined && body.name.trim() === '') {
      return NextResponse.json({ error: 'Nome não pode ser vazio' }, { status: 400 })
    }

    // Limpar campos undefined/null
    const updateData: TechnicianUpdate = {}
    Object.keys(body).forEach((key) => {
      const value = body[key as keyof TechnicianUpdate]
      if (value !== undefined && value !== null) {
        updateData[key as keyof TechnicianUpdate] = value
      }
    })

    // Atualizar técnico
    const { data: updatedTechnician, error: updateError } = await supabase
      .from('technicians')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })
      }
      console.error('Erro ao atualizar técnico:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar técnico', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedTechnician)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/technicians/[id]
 * Exclui um técnico
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

    // Verificar se técnico existe
    const { data: technician, error: fetchError } = await supabase
      .from('technicians')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !technician) {
      return NextResponse.json({ error: 'Técnico não encontrado' }, { status: 404 })
    }

    // Verificar se há serviços vinculados
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .eq('technician_id', id)
      .limit(1)

    if (servicesError) {
      console.error('Erro ao verificar serviços:', servicesError)
    } else if (services && services.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir técnico com serviços vinculados' },
        { status: 400 }
      )
    }

    // Deletar técnico
    const { error: deleteError } = await supabase
      .from('technicians')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao deletar técnico:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar técnico', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Técnico deletado com sucesso' })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

