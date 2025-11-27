#!/usr/bin/env tsx
/**
 * Script para testar a conexão do Supabase
 * 
 * Uso:
 *   npm run test:supabase
 *   ou
 *   npx tsx scripts/test-supabase.ts
 */

const SUPABASE_TEST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000'

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão do Supabase...\n')
  console.log(`📍 URL do teste: ${SUPABASE_TEST_URL}/api/test/supabase\n`)

  try {
    const response = await fetch(`${SUPABASE_TEST_URL}/api/test/supabase`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    console.log('📊 Resultados dos Testes:\n')
    console.log('═'.repeat(60))
    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log(`Timestamp: ${data.timestamp}`)
    console.log(`Resumo: ${data.summary}`)
    console.log(`Sucesso Geral: ${data.success ? '✅' : '❌'}\n`)

    console.log('Testes Individuais:')
    console.log('─'.repeat(60))

    data.tests.forEach((test: any, index: number) => {
      const status = test.passed ? '✅' : '❌'
      console.log(`\n${index + 1}. ${status} ${test.name}`)
      
      if (test.error) {
        console.log(`   ❌ Erro: ${test.error}`)
      }
      
      if (test.details) {
        if (typeof test.details === 'object') {
          Object.entries(test.details).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              console.log(`   • ${key}: ${JSON.stringify(value)}`)
            }
          })
        } else {
          console.log(`   • ${test.details}`)
        }
      }
    })

    console.log('\n' + '═'.repeat(60))
    
    if (data.success) {
      console.log('\n✅ Todos os testes passaram! A conexão está funcionando.')
      process.exit(0)
    } else {
      console.log('\n❌ Alguns testes falharam. Verifique os detalhes acima.')
      process.exit(1)
    }
  } catch (error: any) {
    console.error('\n❌ Erro ao executar teste:', error.message)
    console.error('\n💡 Dica: Certifique-se de que o servidor está rodando (npm run dev)')
    process.exit(1)
  }
}

testSupabaseConnection()

