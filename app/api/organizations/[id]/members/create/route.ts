import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * POST /api/organizations/[id]/members/create
 * Cria um novo usuário e envia link de primeiro acesso
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { nome, email, telefone, role = 'member' } = body

    if (!nome || !email || !telefone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se usuário é admin
    const { data: currentUser } = await supabase
      .from('users')
      .select('organization_id, role, active')
      .eq('id', user.id)
      .single()

    if (!currentUser || currentUser.organization_id !== id || currentUser.role !== 'admin' || !currentUser.active) {
      return NextResponse.json(
        { error: 'Apenas administradores podem adicionar membros' },
        { status: 403 }
      )
    }

    // Criar cliente admin para operações administrativas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta' },
        { status: 500 }
      )
    }

    const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verificar se email já existe
    const { data: existingAuthUser } = await adminClient.auth.admin.getUserByEmail(email)
    
    if (existingAuthUser?.user) {
      // Se usuário já existe, verificar se já pertence a outra organização
      const { data: existingUser } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', existingAuthUser.user.id)
        .single()

      if (existingUser?.organization_id && existingUser.organization_id !== id) {
        return NextResponse.json(
          { error: 'Este email já pertence a outra organização' },
          { status: 400 }
        )
      }

      // Se já pertence a esta organização, retornar erro
      if (existingUser?.organization_id === id) {
        return NextResponse.json(
          { error: 'Este usuário já é membro desta organização' },
          { status: 400 }
        )
      }
    }

    // Gerar senha temporária
    const tempPassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)
    
    // Criar usuário no Supabase Auth
    let newUserId: string
    
    if (existingAuthUser?.user) {
      // Usuário já existe, usar o ID existente
      newUserId = existingAuthUser.user.id
      
      // Atualizar senha para temporária (requer admin)
      const { error: updatePasswordError } = await adminClient.auth.admin.updateUserById(
        newUserId,
        { password: tempPassword }
      )

      if (updatePasswordError) {
        console.error('Erro ao atualizar senha:', updatePasswordError)
        return NextResponse.json(
          { error: 'Erro ao criar usuário', details: updatePasswordError.message },
          { status: 500 }
        )
      }
    } else {
      // Criar novo usuário
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          nome,
          telefone: telefone.replace(/\D/g, ''),
        },
      })

      if (createError || !newUser.user) {
        console.error('Erro ao criar usuário:', createError)
        return NextResponse.json(
          { error: 'Erro ao criar usuário', details: createError?.message },
          { status: 500 }
        )
      }

      newUserId = newUser.user.id
    }

    // Criar ou atualizar registro na tabela users
    const telefoneLimpo = telefone.replace(/\D/g, '')
    
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: newUserId,
        email,
        nome,
        telefone: telefoneLimpo,
        organization_id: id,
        role,
        active: true,
        onboarding_completo: false, // Precisa completar onboarding
      }, {
        onConflict: 'id',
      })

    if (userError) {
      console.error('Erro ao criar registro em users:', userError)
      // Tentar deletar usuário do auth se foi criado agora
      if (!existingAuthUser?.user) {
        await supabase.auth.admin.deleteUser(newUserId)
      }
      return NextResponse.json(
        { error: 'Erro ao criar usuário', details: userError.message },
        { status: 500 }
      )
    }

    // Gerar link de recuperação de senha (primeiro acesso)
    const { data: resetData, error: resetError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    })

    if (resetError) {
      console.error('Erro ao gerar link:', resetError)
      return NextResponse.json(
        { error: 'Erro ao gerar link de acesso', details: resetError.message },
        { status: 500 }
      )
    }

    // Construir URL de primeiro acesso
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const recoveryLink = resetData?.properties?.action_link || ''
    
    // Extrair o token do link de recuperação
    const tokenMatch = recoveryLink.match(/token=([^&]+)/)
    const token = tokenMatch ? tokenMatch[1] : ''
    
    const firstAccessUrl = recoveryLink || `${baseUrl}/auth/primeiro-acesso?token=${token}&type=recovery`

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        nome,
        email,
        telefone: telefoneLimpo,
        role,
      },
      firstAccessUrl,
      tempPassword, // Retornar senha temporária para o admin (em produção, enviar por email)
      message: 'Usuário criado com sucesso. Envie o link de primeiro acesso para o usuário.',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

