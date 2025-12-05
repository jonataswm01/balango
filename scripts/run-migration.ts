#!/usr/bin/env tsx
/**
 * Script para executar migrations SQL no Supabase
 * 
 * Uso:
 *   npm run migrate:019
 *   ou
 *   npx tsx scripts/run-migration.ts supabase/migrations/019_update_services_status_logic.sql
 * 
 * Requer variáveis de ambiente no .env.local:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_DB_PASSWORD (senha do banco de dados PostgreSQL)
 * 
 * Para obter a senha do banco:
 *   1. Acesse: https://app.supabase.com
 *   2. Selecione seu projeto > Settings > Database
 *   3. Copie a senha do banco de dados (ou redefina se necessário)
 *   4. Adicione no .env.local como: SUPABASE_DB_PASSWORD=sua-senha
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD

async function runMigration(migrationFile: string) {
  console.log('🚀 Executando migração SQL no Supabase...\n')
  
  if (!SUPABASE_URL) {
    console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL não está configurado')
    console.error('   Configure no arquivo .env.local')
    process.exit(1)
  }

  if (!SUPABASE_DB_PASSWORD) {
    console.error('❌ Erro: SUPABASE_DB_PASSWORD não está configurado\n')
    console.error('📋 Como obter a senha do banco:')
    console.error('   1. Acesse: https://app.supabase.com')
    console.error('   2. Selecione seu projeto > Settings > Database')
    console.error('   3. Copie a senha do banco (ou redefina se necessário)')
    console.error('   4. Adicione no .env.local como:')
    console.error('      SUPABASE_DB_PASSWORD=sua-senha\n')
    process.exit(1)
  }

  // Extrair host do Supabase URL
  const urlMatch = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)
  if (!urlMatch) {
    console.error('❌ Erro: URL do Supabase inválida')
    console.error('   A URL deve estar no formato: https://seu-projeto.supabase.co')
    process.exit(1)
  }

  const dbHost = `${urlMatch[1]}.supabase.co`
  const dbUser = 'postgres'
  const dbName = 'postgres'
  const dbPort = 5432

  let sql: string
  try {
    const filePath = join(process.cwd(), migrationFile)
    sql = readFileSync(filePath, 'utf-8')
    console.log(`📄 Arquivo: ${migrationFile}`)
    console.log(`📏 Tamanho: ${sql.length} caracteres\n`)
  } catch (error: any) {
    console.error(`❌ Erro ao ler arquivo: ${error.message}`)
    process.exit(1)
  }

  try {
    // Importar cliente PostgreSQL
    const { Client } = await import('pg')

    console.log('🔌 Conectando ao banco de dados...')
    const client = new Client({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    })

    await client.connect()
    console.log('✅ Conectado ao banco de dados\n')

    console.log('⏳ Executando SQL...\n')

    // Executar SQL completo
    await client.query(sql)

    console.log('✅ Migração executada com sucesso!\n')

    await client.end()
    console.log('🎉 Concluído!')
    process.exit(0)

  } catch (error: any) {
    console.error('\n❌ Erro ao executar migração:', error.message)
    
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Dica: Verifique se a senha do banco está correta')
      console.error('   Você pode redefinir a senha em: Settings > Database > Reset Database Password')
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Dica: Verifique se o host do banco está correto')
      console.error('   Certifique-se de que o acesso ao banco está permitido do seu IP')
    }
    
    process.exit(1)
  }
}

const migrationFile = process.argv[2] || 'supabase/migrations/019_update_services_status_logic.sql'
runMigration(migrationFile)
