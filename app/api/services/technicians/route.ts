import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/services/technicians
 * Lista todos os técnicos ativos (para dropdowns)
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

    // Buscar apenas técnicos ativos
    const { data: technicians, error } = await supabase
      .from('technicians')
      .select('id, name, nickname')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar técnicos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar técnicos', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(technicians || [])
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

