$ErrorActionPreference = 'SilentlyContinue'

$repoRoot = 'D:\M2 STAGE\payment-online'
$venvPython = Join-Path $repoRoot '.venv\Scripts\python.exe'

Write-Host '=== Payment Online - Demarrage des services ===' -ForegroundColor Cyan
Write-Host ''

# 1. AI Engine (FastAPI, port 8001)
Write-Host '[1/3] Demarrage AI Engine (port 8001)...'
Start-Process -FilePath $venvPython `
    -ArgumentList '-m','uvicorn','main:app','--host','0.0.0.0','--port','8001' `
    -WorkingDirectory (Join-Path $repoRoot 'ai-engine') `
    -WindowStyle Hidden
Start-Sleep -Seconds 5

# 2. Backend Spring Boot (port 8081)
Write-Host '[2/3] Demarrage Backend Spring Boot (port 8081)...'
Start-Process -FilePath 'cmd.exe' `
    -ArgumentList '/c','mvn spring-boot:run' `
    -WorkingDirectory (Join-Path $repoRoot 'backend') `
    -WindowStyle Hidden
Start-Sleep -Seconds 30

# 3. Frontend Vite (port 5173)
Write-Host '[3/3] Demarrage Frontend Vite (port 5173)...'
Start-Process -FilePath 'cmd.exe' `
    -ArgumentList '/c','npm','run','dev' `
    -WorkingDirectory (Join-Path $repoRoot 'frontend') `
    -WindowStyle Hidden
Start-Sleep -Seconds 5

# Health checks
Write-Host ''
Write-Host '=== Verification ===' -ForegroundColor Cyan
$services = @(
    @{ Name = 'AI Engine'; Url = 'http://127.0.0.1:8001/health' },
    @{ Name = 'Backend';   Url = 'http://localhost:8081/actuator/health' }
)
foreach ($s in $services) {
    try {
        $r = Invoke-WebRequest -Uri $s.Url -UseBasicParsing -TimeoutSec 5
        Write-Host "$($s.Name) : $($r.StatusCode) OK" -ForegroundColor Green
    } catch {
        Write-Host "$($s.Name) : pas de reponse" -ForegroundColor Red
    }
}
Write-Host ''
Write-Host 'Frontend : http://localhost:5173' -ForegroundColor Green
Write-Host 'API      : http://localhost:8081' -ForegroundColor Green
Write-Host 'AI       : http://localhost:8001' -ForegroundColor Green
