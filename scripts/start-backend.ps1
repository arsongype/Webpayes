#!/usr/bin/env pwsh
$port = 8083
$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "Killing existing process on port $port : $($proc.ProcessName) (PID $($proc.Id))"
        Stop-Process -Id $proc.Id -Force
        Start-Sleep 2
    }
}
Set-Location "D:\M2 STAGE\payment-online\backend"
mvn spring-boot:run -DskipTests
