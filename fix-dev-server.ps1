# Script para corrigir problemas com o servidor de desenvolvimento do Next.js

Write-Host "Limpando cache do Next.js..." -ForegroundColor Yellow

# Parar processos Node.js na porta 3000
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    Write-Host "Parando processos na porta 3000..." -ForegroundColor Yellow
    $processes | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

# Remover diretórios de cache
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "Removido diretório .next" -ForegroundColor Green
}

if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "Removido cache do node_modules" -ForegroundColor Green
}

Write-Host "`nCache limpo! Agora execute: npm run dev" -ForegroundColor Green
Write-Host "Aguarde o servidor compilar completamente antes de acessar a aplicação." -ForegroundColor Cyan

