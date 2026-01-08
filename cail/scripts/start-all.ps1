# Script para iniciar todos los microservicios en paralelo
# Ejecutar desde la raíz del proyecto: .\scripts\start-all.ps1

Write-Host "🚀 Iniciando microservicios CAIL..." -ForegroundColor Cyan

# Verificar que las carpetas existan
$functions = @("usuarios", "ofertas", "matching")
$ports = @(8080, 8083, 8084)

foreach ($i in 0..2) {
    $func = $functions[$i]
    $port = $ports[$i]
    $path = "functions\$func"
    
    if (Test-Path $path) {
        Write-Host "📦 Iniciando $func en puerto $port..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\$path'; `$env:PORT='$port'; npm run dev" -WindowStyle Normal
        Start-Sleep -Seconds 2
    } else {
        Write-Host "❌ No se encontró: $path" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Microservicios iniciados:" -ForegroundColor Green
Write-Host "   - Usuarios:  http://localhost:8080" -ForegroundColor White
Write-Host "   - Ofertas:   http://localhost:8083" -ForegroundColor White
Write-Host "   - Matching:  http://localhost:8084" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para detener, cierra las ventanas de terminal abiertas." -ForegroundColor Gray
