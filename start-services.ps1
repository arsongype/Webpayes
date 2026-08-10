# Payment Online - Script de demarrage Windows PowerShell
# Lance tous les services du projet dans le bon ordre pour le developpement local.
#
# Usage:
#   .\start-services.ps1
#
# Services demarres:
#   - Backend Spring Boot        : http://localhost:8081
#   - Fraud Detection (Python)   : http://127.0.0.1:8001
#   - Risk Scoring (Python)      : http://127.0.0.1:8002
#   - KYC Verification (Python)  : http://127.0.0.1:8003
#   - Chatbot (Python)           : http://127.0.0.1:8004
#   - Recommendation (Python)    : http://127.0.0.1:8005
#   - Routing Engine (Python)    : http://127.0.0.1:8006
#   - Frontend Vite              : http://localhost:5173

param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
$frontendDir = Join-Path $repoRoot 'frontend'
$fraudDir = Join-Path $repoRoot 'ai-services\fraud-detection-service'
$riskDir = Join-Path $repoRoot 'ai-services\risk-scoring-service'
$kycDir = Join-Path $repoRoot 'ai-services\kyc-verification-service'
$chatbotDir = Join-Path $repoRoot 'ai-services\chatbot-service'
$recDir = Join-Path $repoRoot 'ai-services\recommendation-service'
$routingDir = Join-Path $repoRoot 'ai-services\routing-engine-service'
$logsDir = Join-Path $repoRoot 'logs'
$pidDir = Join-Path $repoRoot '.pids'

$pythonExe = Join-Path $repoRoot '.venv\Scripts\python.exe'
$mvnExe = 'mvn'
$npmExe = 'npm'

function Get-CommandOrDefault($cmd, $default) {
  if (Get-Command -Name $cmd -ErrorAction SilentlyContinue) {
    return $cmd
  }
  return $default
}

$mvnExe = Get-CommandOrDefault 'mvn' 'mvn'
$npmExe = Get-CommandOrDefault 'npm' 'npm'

New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
New-Item -ItemType Directory -Path $pidDir -Force | Out-Null

Write-Host "=== Verification des pre-requis ==="

if (-not (Test-Path $pythonExe)) {
  throw "Python du venv introuvable : $pythonExe"
}
Write-Host "Python venv : $pythonExe"

if (-not (Test-Path $backendDir)) {
  throw "Backend introuvable : $backendDir"
}

if (-not (Test-Path $frontendDir)) {
  throw "Frontend introuvable : $frontendDir"
}

Write-Host "=== Lancement du backend Spring Boot ==="
$backendLog = Join-Path $logsDir 'backend.log'
$backendPidFile = Join-Path $pidDir 'backend.pid'
Start-Process -FilePath $mvnExe -ArgumentList 'spring-boot:run' -WorkingDirectory $backendDir -NoNewWindow -RedirectStandardOutput $backendLog -RedirectStandardError $backendLog
$backendPid = (Get-NetTCPConnection -LocalPort 8081 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($backendPid) { Set-Content -LiteralPath $backendPidFile -Value $backendPid }

Write-Host "=== Lancement des services IA Python ==="

$fraudLog = Join-Path $logsDir 'fraud.log'
$fraudPidFile = Join-Path $pidDir 'fraud.pid'
Start-Process -FilePath $pythonExe -ArgumentList '-m','uvicorn','app.main:app','--reload','--port','8001' -WorkingDirectory $fraudDir -NoNewWindow -RedirectStandardOutput $fraudLog -RedirectStandardError $fraudLog
$fraudPid = (Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($fraudPid) { Set-Content -LiteralPath $fraudPidFile -Value $fraudPid }

$riskLog = Join-Path $logsDir 'risk.log'
$riskPidFile = Join-Path $pidDir 'risk.pid'
Start-Process -FilePath $pythonExe -ArgumentList '-m','uvicorn','app.main:app','--reload','--port','8002' -WorkingDirectory $riskDir -NoNewWindow -RedirectStandardOutput $riskLog -RedirectStandardError $riskLog
$riskPid = (Get-NetTCPConnection -LocalPort 8002 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($riskPid) { Set-Content -LiteralPath $riskPidFile -Value $riskPid }

$kycLog = Join-Path $logsDir 'kyc.log'
$kycPidFile = Join-Path $pidDir 'kyc.pid'
Start-Process -FilePath $pythonExe -ArgumentList '-m','uvicorn','app.main:app','--reload','--port','8003' -WorkingDirectory $kycDir -NoNewWindow -RedirectStandardOutput $kycLog -RedirectStandardError $kycLog
$kycPid = (Get-NetTCPConnection -LocalPort 8003 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($kycPid) { Set-Content -LiteralPath $kycPidFile -Value $kycPid }

$chatbotLog = Join-Path $logsDir 'chatbot.log'
$chatbotPidFile = Join-Path $pidDir 'chatbot.pid'
Start-Process -FilePath $pythonExe -ArgumentList '-m','uvicorn','app.main:app','--reload','--port','8004' -WorkingDirectory $chatbotDir -NoNewWindow -RedirectStandardOutput $chatbotLog -RedirectStandardError $chatbotLog
$chatbotPid = (Get-NetTCPConnection -LocalPort 8004 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($chatbotPid) { Set-Content -LiteralPath $chatbotPidFile -Value $chatbotPid }

$recLog = Join-Path $logsDir 'recommendation.log'
$recPidFile = Join-Path $pidDir 'recommendation.pid'
Start-Process -FilePath $pythonExe -ArgumentList '-m','uvicorn','app.main:app','--reload','--port','8005' -WorkingDirectory $recDir -NoNewWindow -RedirectStandardOutput $recLog -RedirectStandardError $recLog
$recPid = (Get-NetTCPConnection -LocalPort 8005 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($recPid) { Set-Content -LiteralPath $recPidFile -Value $recPid }

$routingLog = Join-Path $logsDir 'routing.log'
$routingPidFile = Join-Path $pidDir 'routing.pid'
Start-Process -FilePath $pythonExe -ArgumentList '-m','uvicorn','app.main:app','--reload','--port','8006' -WorkingDirectory $routingDir -NoNewWindow -RedirectStandardOutput $routingLog -RedirectStandardError $routingLog
$routingPid = (Get-NetTCPConnection -LocalPort 8006 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($routingPid) { Set-Content -LiteralPath $routingPidFile -Value $routingPid }

Write-Host "=== Lancement du frontend Vite ==="
$frontendLog = Join-Path $logsDir 'frontend.log'
$frontendPidFile = Join-Path $pidDir 'frontend.pid'
Push-Location -LiteralPath $frontendDir
Start-Process -FilePath $npmExe -ArgumentList 'run','dev' -NoNewWindow -RedirectStandardOutput $frontendLog -RedirectStandardError $frontendLog
Pop-Location
$frontendPid = (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($frontendPid) { Set-Content -LiteralPath $frontendPidFile -Value $frontendPid }

Write-Host ""
Write-Host "=== Etat des services ==="
Write-Host "Backend  : http://localhost:8081  (pid file: $backendPidFile)"
Write-Host "Fraud    : http://127.0.0.1:8001 (pid file: $fraudPidFile)"
Write-Host "Risk     : http://127.0.0.1:8002 (pid file: $riskPidFile)"
Write-Host "KYC      : http://127.0.0.1:8003 (pid file: $kycPidFile)"
Write-Host "Chatbot  : http://127.0.0.1:8004 (pid file: $chatbotPidFile)"
Write-Host "Recommend: http://127.0.0.1:8005 (pid file: $recPidFile)"
Write-Host "Routing  : http://127.0.0.1:8006 (pid file: $routingPidFile)"
Write-Host "Frontend : http://localhost:5173 (pid file: $frontendPidFile)"

Write-Host ""
Write-Host "Appuyez sur Ctrl+C pourarreter tous les services et nettoyer les fichiers PID."

try {
  while ($true) {
    Start-Sleep -Seconds 2
  }
} finally {
  Write-Host "Nettoyage des services..."
  if (Test-Path $pidDir) {
    Get-ChildItem -LiteralPath $pidDir -Filter "*.pid" | ForEach-Object {
      $pid = Get-Content -LiteralPath $_.FullName -ErrorAction SilentlyContinue
      if ($pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
      }
    }
    Remove-Item -LiteralPath $pidDir -Recurse -Force -ErrorAction SilentlyContinue
  }
  Write-Host "Tous les services ont ete arretes."
}
