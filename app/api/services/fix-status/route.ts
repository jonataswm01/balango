import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganizationId } from '@/lib/api/auth'

/**
 * POST /api/services/fix-status
 * Atualiza serviços antigos para aplicar a nova lógica de status
 * 
 * Atualiza serviços que:
 * - payment_status = 'pago'
 * - date < hoje
 * - status IN ('pendente', 'em_andamento')
 * - completed_date IS NULL
 * 
 * Para:
 * - status = 'concluido'
 * - completed_date = payment_date OU date do serviço
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

    // Buscar organization_id do usuário
    const organizationId = await getUserOrganizationId(supabase)
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a uma organização' },
        { status: 403 }
      )
    }

    // Buscar serviços que precisam ser atualizados
    const { data: servicesToUpdate, error: fetchError } = await supabase
      .from('services')
      .select('id, date, payment_date')
      .eq('organization_id', organizationId)
      .eq('payment_status', 'pago')
      .lt('date', new Date().toISOString().split('T')[0])
      .in('status', ['pendente', 'em_andamento'])
      .is('completed_date', null)

    if (fetchError) {
      console.error('Erro ao buscar serviços:', fetchError)
      return NextResponse.json(
        { error: 'Erro ao buscar serviços', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!servicesToUpdate || servicesToUpdate.length === 0) {
      return NextResponse.json({
        message: 'Nenhum serviço precisa ser atualizado',
        updated: 0,
      })
    }

    // Atualizar cada serviço
    let updatedCount = 0
    const errors: string[] = []

    for (const service of servicesToUpdate) {
      // Usar payment_date se existir, senão usar date do serviço
      const completedDate = service.payment_date 
        ? new Date(service.payment_date).toISOString()
        : new Date(service.date + 'T23:59:59').toISOString()

      const { error: updateError } = await supabase
        .from('services')
        .update({
          status: 'concluido',
          completed_date: completedDate,
        })
        .eq('id', service.id)

      if (updateError) {
        console.error(`Erro ao atualizar serviço ${service.id}:`, updateError)
        errors.push(`Serviço ${service.id}: ${updateError.message}`)
      } else {
        updatedCount++
      }
    }

    return NextResponse.json({
      message: `Atualização concluída`,
      updated: updatedCount,
      total: servicesToUpdate.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

