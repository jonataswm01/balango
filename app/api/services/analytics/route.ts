import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserOrganizationId } from '@/lib/api/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/services/analytics
 * Retorna dados agregados para gráficos
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

    // Buscar todos os serviços com relacionamentos (FILTRADO POR ORGANIZAÇÃO)
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
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
      .order('date', { ascending: true })

    if (error) {
      console.error('Erro ao buscar serviços:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar serviços', details: error.message },
        { status: 500 }
      )
    }

    if (!services || services.length === 0) {
      return NextResponse.json({
        monthly: [],
        byTechnician: [],
        byClient: [],
        paymentStatus: {
          pendente: { quantidade: 0, valor: 0 },
          pago: { quantidade: 0, valor: 0 },
          atrasado: { quantidade: 0, valor: 0 },
        },
        invoiceStatus: {
          comNF: { quantidade: 0, valor: 0 },
          semNF: { quantidade: 0, valor: 0 },
        },
      })
    }

    // Agrupar por mês
    const monthlyMap = new Map<string, any>()
    services.forEach((service: any) => {
      const date = new Date(service.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthLabel,
          receitaBruta: 0,
          receitaLiquida: 0,
          custos: 0,
          impostos: 0,
          quantidade: 0,
        })
      }

      const monthData = monthlyMap.get(monthKey)!
      monthData.receitaBruta += Number(service.gross_value) || 0
      monthData.custos += Number(service.operational_cost) || 0
      monthData.impostos += Number(service.tax_amount) || 0
      monthData.quantidade += 1
      monthData.receitaLiquida = monthData.receitaBruta - monthData.custos - monthData.impostos
    })

    const monthly = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    )

    // Agrupar por técnico
    const technicianMap = new Map<string, any>()
    services.forEach((service: any) => {
      if (!service.technician_id || !service.technicians) return

      const techId = service.technician_id
      const techName = service.technicians.nickname || service.technicians.name

      if (!technicianMap.has(techId)) {
        technicianMap.set(techId, {
          id: techId,
          name: techName,
          quantidade: 0,
          valorTotal: 0,
        })
      }

      const techData = technicianMap.get(techId)!
      techData.quantidade += 1
      techData.valorTotal += Number(service.gross_value) || 0
    })

    const byTechnician = Array.from(technicianMap.values())
      .map((tech) => ({
        name: tech.name,
        quantidade: tech.quantidade,
        valorTotal: Number(tech.valorTotal.toFixed(2)),
        valorMedio: Number((tech.valorTotal / tech.quantidade).toFixed(2)),
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 10) // Top 10

    // Agrupar por cliente
    const clientMap = new Map<string, any>()
    services.forEach((service: any) => {
      if (!service.client_id || !service.clients) return

      const clientId = service.client_id
      const clientName = service.clients.name

      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          id: clientId,
          name: clientName,
          quantidade: 0,
          valorTotal: 0,
        })
      }

      const clientData = clientMap.get(clientId)!
      clientData.quantidade += 1
      clientData.valorTotal += Number(service.gross_value) || 0
    })

    const byClient = Array.from(clientMap.values())
      .map((client) => ({
        name: client.name,
        quantidade: client.quantidade,
        valorTotal: Number(client.valorTotal.toFixed(2)),
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 10) // Top 10

    // Agrupar por status de pagamento
    const paymentStatus = {
      pendente: { quantidade: 0, valor: 0 },
      pago: { quantidade: 0, valor: 0 },
      atrasado: { quantidade: 0, valor: 0 },
    }

    services.forEach((service: any) => {
      const status = service.payment_status || 'pendente'
      if (paymentStatus[status as keyof typeof paymentStatus]) {
        paymentStatus[status as keyof typeof paymentStatus].quantidade += 1
        paymentStatus[status as keyof typeof paymentStatus].valor +=
          Number(service.gross_value) || 0
      }
    })

    // Arredondar valores
    Object.keys(paymentStatus).forEach((key) => {
      const status = paymentStatus[key as keyof typeof paymentStatus]
      status.valor = Number(status.valor.toFixed(2))
    })

    // Agrupar por status de nota fiscal
    const invoiceStatus = {
      comNF: { quantidade: 0, valor: 0 },
      semNF: { quantidade: 0, valor: 0 },
    }

    services.forEach((service: any) => {
      if (service.has_invoice) {
        invoiceStatus.comNF.quantidade += 1
        invoiceStatus.comNF.valor += Number(service.gross_value) || 0
      } else {
        invoiceStatus.semNF.quantidade += 1
        invoiceStatus.semNF.valor += Number(service.gross_value) || 0
      }
    })

    // Arredondar valores
    invoiceStatus.comNF.valor = Number(invoiceStatus.comNF.valor.toFixed(2))
    invoiceStatus.semNF.valor = Number(invoiceStatus.semNF.valor.toFixed(2))

    return NextResponse.json({
      monthly,
      byTechnician,
      byClient,
      paymentStatus,
      invoiceStatus,
    })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

