param([string]$BaseUrl = "http://localhost:8081", [string]$AiUrl = "http://localhost:8001")

$ErrorActionPreference = "Continue"
$headers = @{ "Content-Type" = "application/json; charset=utf-8" }
$failCount = 0
$passCount = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers,
        [string]$Body,
        [int]$ExpectedStatus = 200,
        [string]$ExpectContains = $null
    )
    $script:total++
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $params = @{ Uri = $Url; Method = $Method; Headers = $Headers; UseBasicParsing = $true; TimeoutSec = 30 }
        if ($Body) {
            $params.Body = [System.Text.Encoding]::UTF8.GetBytes($Body)
        }
        $r = Invoke-WebRequest @params
        $sw.Stop()
        $ms = $sw.ElapsedMilliseconds
        $content = $r.Content
        $ok = ($r.StatusCode -eq $ExpectedStatus)
        if ($ok -and $ExpectContains) { $ok = $content -match $ExpectContains }
        if ($ok) {
            Write-Host "[OK]   $Name ($ms ms, $($r.StatusCode))" -ForegroundColor Green
            $script:passCount++
        } else {
            Write-Host "[FAIL] $Name (expected $ExpectedStatus, got $($r.StatusCode))" -ForegroundColor Red
            Write-Host "       $content" -ForegroundColor DarkGray
            $script:failCount++
        }
    } catch {
        $sw.Stop()
        $ms = $sw.ElapsedMilliseconds
        $code = "?"
        $body = ""
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
        }
        $ok = ($code -eq $ExpectedStatus)
        if ($ok -and $ExpectContains) { $ok = $body -match $ExpectContains }
        if ($ok) {
            Write-Host "[OK]   $Name ($ms ms, $code)" -ForegroundColor Green
            $script:passCount++
        } else {
            Write-Host "[FAIL] $Name (expected $ExpectedStatus, got $code)" -ForegroundColor Red
            if ($body) { Write-Host "       $body" -ForegroundColor DarkGray }
            $script:failCount++
        }
    }
}

$total = 0
Write-Host "`n=== Sprint 5 Integration Tests ===" -ForegroundColor Cyan

# Auth
$r = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes('{"email":"admin@localhost","password":"Admin123!"}'))
$token = $r.accessToken
$ah = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json; charset=utf-8" }

# ----- US04.1 Reconciliation -----
Write-Host "`n[US04.1] Reconciliation ISO 20022" -ForegroundColor Yellow

$camtXml = @'
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.02">
  <BkToCstmrStmt>
    <Stmt>
      <Id>STMT-2026-001</Id>
      <CreDtTm>2026-09-01T00:00:00Z</CreDtTm>
      <Acct>
        <Id>
          <IBAN>FR1420041010050500013M02606</IBAN>
        </Id>
      </Acct>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>OPBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="EUR">1000.00</Amt>
      </Bal>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>CLBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="EUR">1500.00</Amt>
      </Bal>
      <Ntry>
        <Amt Ccy="EUR">500.00</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <BookgDt>
          <Dt>2026-09-01</Dt>
        </BookgDt>
        <ValDt>
          <Dt>2026-09-01</Dt>
        </ValDt>
        <NtryRef>REF-001</NtryRef>
        <EndToEndId>E2E-001</EndToEndId>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>
'@

$importBody = @{ fileName = "test-camt.xml"; xmlContent = $camtXml } | ConvertTo-Json
Test-Endpoint "Reconciliation import" "POST" "$BaseUrl/api/reconciliation/import" $ah $importBody 201 "DISCREPANCY_DETECTED|PENDING|COMPLETED|PARTIAL"
Test-Endpoint "Reconciliation list" "GET" "$BaseUrl/api/reconciliation" $ah "" 200 "id"

# ----- US06.1 Payouts -----
Write-Host "`n[US06.1] Payouts Engine" -ForegroundColor Yellow

$accountResp = (Invoke-RestMethod -Uri "$BaseUrl/api/accounts" -Headers $ah -Method GET -UseBasicParsing)
$accountId = $accountResp[0].id

# Get an admin's account; for tests we just need a valid UUID
# Create a payout (will need balance)
$payoutBody = @{
    accountId = $accountId
    amount = 100.0
    destinationType = "MOBILE_MONEY"
    destinationReference = "+261340000000"
    destinationName = "Test Mobile Money"
    currency = "MGA"
} | ConvertTo-Json

Test-Endpoint "Payout create (mobile money)" "POST" "$BaseUrl/api/payouts" $ah $payoutBody 201 "PENDING|COMPLETED"
Test-Endpoint "Payout list" "GET" "$BaseUrl/api/payouts" $ah "" 200 "id"
Test-Endpoint "Payout summary" "GET" "$BaseUrl/api/payouts/summary" $ah "" 200 "total"

# Bank payout
$payoutBank = @{
    accountId = $accountId
    amount = 500.0
    destinationType = "BANK_ACCOUNT"
    destinationReference = "FR1420041010050500013M02606"
    destinationName = "John Doe"
    iban = "FR1420041010050500013M02606"
    bic = "BNPAFRPP"
    currency = "EUR"
} | ConvertTo-Json
Test-Endpoint "Payout create (SEPA bank)" "POST" "$BaseUrl/api/payouts" $ah $payoutBank 201 "PENDING|COMPLETED"

# ----- US07.1 Observability & Audit Trail -----
Write-Host "`n[US07.1] Observability + PCI Audit Trail" -ForegroundColor Yellow

Test-Endpoint "Audit list (admin)" "GET" "$BaseUrl/api/audit" $ah "" 200 "id"
Test-Endpoint "Audit list page 0" "GET" "$BaseUrl/api/audit?page=0&size=5" $ah "" 200 "id"
Test-Endpoint "Audit integrity check" "GET" "$BaseUrl/api/audit/integrity" $ah "" 200 "valid"
Test-Endpoint "Audit filter by KYC event" "GET" "$BaseUrl/api/audit/type/AUTH_LOGIN" $ah "" 200

# Prometheus
Test-Endpoint "Prometheus metrics" "GET" "$BaseUrl/actuator/prometheus" @{} "" 200 "jvm_memory_used_bytes"

# AI engine health
Test-Endpoint "AI engine health" "GET" "$AiUrl/health" @{} "" 200 "status"

# ----- Summary -----
Write-Host "`n=== Sprint 5 Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
exit $failCount
