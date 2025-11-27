import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const testResults: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    success: true,
    summary: "",
  }

  // Teste 1: Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  testResults.tests.push({
    name: "Variáveis de Ambiente",
    passed: !!(supabaseUrl && supabaseAnonKey),
    details: {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseAnonKey?.length || 0,
      urlPreview: supabaseUrl
        ? `${supabaseUrl.substring(0, 20)}...`
        : "não configurado",
    },
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    testResults.success = false
    testResults.summary = "Variáveis de ambiente não configuradas"
    return NextResponse.json(testResults, { status: 500 })
  }

  // Teste 2: Criar cliente Supabase
  let supabase
  try {
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    testResults.tests.push({
      name: "Criação do Cliente Supabase",
      passed: true,
      details: "Cliente criado com sucesso",
    })
  } catch (error: any) {
    testResults.success = false
    testResults.tests.push({
      name: "Criação do Cliente Supabase",
      passed: false,
      error: error.message,
    })
    testResults.summary = "Erro ao criar cliente Supabase"
    return NextResponse.json(testResults, { status: 500 })
  }

  // Teste 3: Verificar conexão com o banco (query simples)
  try {
    const { data, error, status, statusText } = await supabase
      .from("users")
      .select("count")
      .limit(1)

    testResults.tests.push({
      name: "Query na Tabela 'users'",
      passed: !error,
      details: {
        status,
        statusText,
        hasData: !!data,
        error: error?.message || null,
        errorCode: error?.code || null,
        errorDetails: error?.details || null,
      },
    })

    if (error) {
      testResults.success = false
      testResults.summary = `Erro na query: ${error.message}`
    }
  } catch (error: any) {
    testResults.success = false
    testResults.tests.push({
      name: "Query na Tabela 'users'",
      passed: false,
      error: error.message,
    })
  }

  // Teste 4: Verificar autenticação (sem usuário logado é esperado)
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    testResults.tests.push({
      name: "Verificação de Autenticação",
      passed: true,
      details: {
        hasUser: !!user,
        userId: user?.id || null,
        authError: authError?.message || null,
        note: authError
          ? "Erro esperado se não houver usuário autenticado"
          : "Usuário autenticado encontrado",
      },
    })
  } catch (error: any) {
    testResults.tests.push({
      name: "Verificação de Autenticação",
      passed: false,
      error: error.message,
    })
  }

  // Teste 5: Verificar se consegue listar usuários (apenas estrutura)
  try {
    const { data, error, count } = await supabase
      .from("users")
      .select("id, nome, email, telefone, avatar_url, created_at, updated_at", { count: "exact" })
      .limit(5)

    testResults.tests.push({
      name: "Listagem de Usuários (estrutura)",
      passed: !error,
      details: {
        hasData: !!data,
        dataLength: data?.length || 0,
        totalCount: count || 0,
        error: error?.message || null,
        sampleData: data && data.length > 0 ? data[0] : null,
      },
    })

    if (error) {
      testResults.success = false
    }
  } catch (error: any) {
    testResults.success = false
    testResults.tests.push({
      name: "Listagem de Usuários (estrutura)",
      passed: false,
      error: error.message,
    })
  }

  // Teste 6: Verificar health do Supabase
  try {
    const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
      },
    })

    testResults.tests.push({
      name: "Health Check do Supabase",
      passed: healthCheck.ok,
      details: {
        status: healthCheck.status,
        statusText: healthCheck.statusText,
        ok: healthCheck.ok,
      },
    })

    if (!healthCheck.ok) {
      testResults.success = false
    }
  } catch (error: any) {
    testResults.success = false
    testResults.tests.push({
      name: "Health Check do Supabase",
      passed: false,
      error: error.message,
    })
  }

  // Resumo final
  const passedTests = testResults.tests.filter((t: any) => t.passed).length
  const totalTests = testResults.tests.length
  testResults.summary = `${passedTests}/${totalTests} testes passaram`

  return NextResponse.json(testResults, {
    status: testResults.success ? 200 : 500,
  })
}

