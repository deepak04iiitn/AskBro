# AskBro backend launcher
# Run from the backend/ folder: .\start.ps1

$root = $PSScriptRoot

function Log-Step($msg)  { Write-Host "" ; Write-Host "  >> $msg" -ForegroundColor Cyan }
function Log-Ok($msg)    { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Log-Warn($msg)  { Write-Host "  [!!] $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "  AskBro - Backend Start" -ForegroundColor White
Write-Host ""

# --- 1. MongoDB ----------------------------------------------------------
Log-Step "Checking MongoDB..."

$mongoSvc = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($null -ne $mongoSvc) {
    if ($mongoSvc.Status -ne "Running") {
        Write-Host "  Starting MongoDB service..." -ForegroundColor DarkGray
        Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    $mongoSvc.Refresh()
    if ($mongoSvc.Status -eq "Running") {
        Log-Ok "MongoDB running (Windows service)"
    } else {
        Log-Warn "MongoDB service failed to start. Check your MongoDB installation."
    }
} else {
    Log-Warn "MongoDB Windows service not found."
    Write-Host "  Assuming you are using MongoDB Atlas -- skipping local start." -ForegroundColor DarkGray
}

# --- 2. Qdrant (optional local binary) ----------------------------------
Log-Step "Checking Qdrant..."

$qdrantAlive = $false
try {
    Invoke-RestMethod "http://localhost:6333/healthz" -TimeoutSec 2 -ErrorAction Stop | Out-Null
    $qdrantAlive = $true
    Log-Ok "Qdrant already running on http://localhost:6333"
} catch {
    $qdrantExe = Join-Path $root "qdrant.exe"
    if (Test-Path $qdrantExe) {
        Write-Host "  Starting local qdrant.exe..." -ForegroundColor DarkGray
        Start-Process -FilePath $qdrantExe -WorkingDirectory $root -WindowStyle Minimized
        Start-Sleep -Seconds 3
        Log-Ok "Qdrant started (minimised window)"
        $qdrantAlive = $true
    } else {
        Log-Warn "Qdrant not running and qdrant.exe not found in backend/."
        Write-Host "  Assuming you are using Qdrant Cloud -- skipping local start." -ForegroundColor DarkGray
    }
}

# --- 3. Check .env exists ------------------------------------------------
Log-Step "Checking .env..."

$envFile = Join-Path $root ".env"
if (-not (Test-Path $envFile)) {
    Log-Warn ".env not found! Copying .env.example..."
    Copy-Item (Join-Path $root ".env.example") $envFile
    Write-Host ""
    Write-Host "  ACTION REQUIRED:" -ForegroundColor Red
    Write-Host "  Open backend\.env and fill in:" -ForegroundColor Red
    Write-Host "    MONGODB_URI, QDRANT_URL, LLM_API_KEY, SECRET_KEY" -ForegroundColor Red
    Write-Host "  Then re-run this script." -ForegroundColor Red
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}
Log-Ok ".env found"

# --- 4. Celery worker (new window) ---------------------------------------
Log-Step "Starting Celery worker in a new window..."

$celeryCmd = "cd '$root'; `$host.UI.RawUI.WindowTitle = 'AskBro Celery Worker'; Write-Host '  Celery Worker (solo pool - Windows)' -ForegroundColor Cyan; Write-Host ''; uv run python -m celery -A celery_app worker --loglevel=info -Q ingestion,cleanup --pool=solo"

Start-Process powershell -ArgumentList "-NoExit", "-Command", $celeryCmd
Start-Sleep -Seconds 1
Log-Ok "Celery worker window opened"

# --- 5. Qdrant payload indexes (idempotent) ------------------------------
Log-Step "Ensuring Qdrant payload indexes..."

$indexScript = @"
import asyncio
from config.qdrant import ensure_payload_indexes
asyncio.run(ensure_payload_indexes())
print('  Indexes OK')
"@

$indexResult = $indexScript | uv run python - 2>&1
Write-Host "  $indexResult" -ForegroundColor DarkGray
Log-Ok "Qdrant indexes verified"

# --- 6. FastAPI ----------------------------------------------------------
Log-Step "Starting FastAPI..."
Write-Host ""
Write-Host "  Swagger UI : http://localhost:8000/docs" -ForegroundColor DarkGray
Write-Host "  Health     : http://localhost:8000/health" -ForegroundColor DarkGray
Write-Host "  Ready      : http://localhost:8000/ready" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

$host.UI.RawUI.WindowTitle = "AskBro FastAPI"

uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload --reload-dir . --reload-exclude ".venv" --reload-exclude "__pycache__"
