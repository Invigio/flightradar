# Szybki start - Backend

Write-Host "🚀 Uruchamianie backendu..." -ForegroundColor Cyan

# Sprawdź czy jest .env
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Brak pliku .env - kopiuję z .env.example" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Edytuj plik .env i ustaw DATABASE_URL!" -ForegroundColor Yellow
    notepad .env
    pause
}

# Jeśli istnieje venv, użyj go. W przeciwnym wypadku użyj systemowego Pythona
$venvPython = Join-Path $PSScriptRoot "venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    Write-Host "📦 Wykryto venv - instaluję pakiety w venv..." -ForegroundColor Cyan
    & $venvPython -m pip install -r requirements.txt
    $py = $venvPython
} else {
    Write-Host "⚠️  Brak venv - używam systemowego Pythona" -ForegroundColor Yellow
    Write-Host "📦 Instaluję pakiety do bieżącego środowiska..." -ForegroundColor Cyan
    python -m pip install -r requirements.txt
    $py = "python"
}

Write-Host "`n✅ Backend gotowy!" -ForegroundColor Green
Write-Host "🌐 Uruchamiam na http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 Dokumentacja: http://localhost:8000/docs`n" -ForegroundColor Cyan

& $py main.py
