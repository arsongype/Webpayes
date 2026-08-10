# Payment Online - Script d'arrêt Windows PowerShell
# Arrête tous les services lancés par start-services.ps1

param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$pidDir = Join-Path $repoRoot '.pids'

if (-not (Test-Path $pidDir)) {
  Write-Host "Aucun fichier PID trouvé dans $pidDir. Les services ne sont probablement pas démarrés par le script."
  exit 0
}

$serviceFiles = Get-ChildItem -Path $pidDir -Filter "*.pid" -ErrorAction SilentlyContinue

if (-not $serviceFiles) {
  Write-Host "Aucun service en cours d'execution."
  exit 0
}

foreach ($file in $serviceFiles) {
  $name = $file.BaseName
  $pid = Get-Content -LiteralPath $file.FullName -ErrorAction SilentlyContinue

  if ($pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)) {
    Write-Host "Arret de $name (PID $pid)..."
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
  } else {
    Write-Host "$name n'est pas en cours d'execution."
  }
}

Remove-Item -LiteralPath $pidDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Tous les services ont ete arretes et les fichiers PID nettoyes."
