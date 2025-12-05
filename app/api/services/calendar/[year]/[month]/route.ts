import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganizationId } from '@/lib/api/auth'
import { parseDateOnlyToLocal } from '@/lib/utils/dates'

/**
 * GET /api/services/calendar/[year]/[month]
 * Retorna serviços agrupados por dia do mês
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { year: string; month: string } }
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

    // Buscar organization_id do usuário
    const organizationId = await getUserOrganizationId(supabase)
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Usuário não está associado a uma organização' },
        { status: 403 }
      )
    }

    const year = parseInt(params.year)
    const month = parseInt(params.month)

    // Validar parâmetros
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Ano ou mês inválido' },
        { status: 400 }
      )
    }

    // Calcular primeiro e último dia do mês
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)

    // Buscar serviços do mês (FILTRADO POR ORGANIZAÇÃO)
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        id,
        date,
        gross_value,
        has_invoice,
        clients:client_id (
          id,
          name
        ),
        technicians:technician_id (
          id,
          name,
          nickname
        )
      `)
      .eq('organization_id', organizationId)
      .gte('date', firstDay.toISOString().split('T')[0])
      .lte('date', lastDay.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) {
      console.error('Erro ao buscar serviços:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar serviços', details: error.message },
        { status: 500 }
      )
    }

    // Agrupar por dia
    const servicesByDay: Record<string, any[]> = {}

    services?.forEach((service: any) => {
      const date = parseDateOnlyToLocal(service.date)
      const day = date.getDate().toString()

      if (!servicesByDay[day]) {
        servicesByDay[day] = []
      }

      servicesByDay[day].push({
        id: service.id,
        date: service.date,
        gross_value: Number(service.gross_value) || 0,
        has_invoice: service.has_invoice || false,
        client: service.clients ? { name: service.clients.name } : null,
        technician: service.technicians
          ? {
              name: service.technicians.nickname || service.technicians.name,
            }
          : null,
      })
    })

    return NextResponse.json(servicesByDay)
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

