# Szybki start - Frontend

Write-Host "🚀 Uruchamianie frontendu..." -ForegroundColor Cyan

# Sprawdź czy są zainstalowane pakiety
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instaluję pakiety npm..." -ForegroundColor Cyan
    npm install
}

Write-Host "`n✅ Frontend gotowy!" -ForegroundColor Green
Write-Host "🌐 Uruchamiam na http://localhost:3000`n" -ForegroundColor Cyan

npm run dev
