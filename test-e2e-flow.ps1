# E2E Test: Full Payment Platform Flow
# Tests: Registration -> Account Creation -> Deposit -> Transfer -> Balance Verification

$baseUrl = "http://localhost:8081/api"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$user1Email = "test_user_$timestamp@example.com"
$user2Email = "test_user2_$timestamp@example.com"
$password = "TestPassword123!"

Write-Host "=== Payment Platform E2E Test ===" -ForegroundColor Cyan
Write-Host "Starting comprehensive flow test..." -ForegroundColor Green
Write-Host ""

# Step 1: Register User 1
Write-Host "[1/8] Registering User 1..." -ForegroundColor Yellow
$registerBody = @{
    email = $user1Email
    password = $password
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    $user1Id = $registerResponse.userId
    $user1Token = $registerResponse.accessToken
    Write-Host "✓ User 1 registered: $user1Email (ID: $user1Id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Registration failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Register User 2
Write-Host "[2/8] Registering User 2..." -ForegroundColor Yellow
$registerBody2 = @{
    email = $user2Email
    password = $password
    firstName = "Test2"
    lastName = "User2"
} | ConvertTo-Json

try {
    $registerResponse2 = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody2 -ContentType "application/json"
    $user2Id = $registerResponse2.userId
    $user2Token = $registerResponse2.accessToken
    Write-Host "✓ User 2 registered: $user2Email (ID: $user2Id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Registration failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Get User 1 Account
Write-Host "[3/8] Retrieving User 1 account (auto-created at registration)..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $user1Token" }
try {
    $accounts1 = Invoke-RestMethod -Uri "$baseUrl/accounts" -Method Get -Headers $headers
    $user1AccountId = $accounts1[0].id
    $user1AccountNumber = $accounts1[0].accountNumber
    Write-Host "✓ User 1 account: ID=$user1AccountId, Number=$user1AccountNumber, Balance=$($accounts1[0].balance)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get accounts: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Get User 2 Account
Write-Host "[4/8] Retrieving User 2 account..." -ForegroundColor Yellow
$headers2 = @{ Authorization = "Bearer $user2Token" }
try {
    $accounts2 = Invoke-RestMethod -Uri "$baseUrl/accounts" -Method Get -Headers $headers2
    $user2AccountId = $accounts2[0].id
    $user2AccountNumber = $accounts2[0].accountNumber
    Write-Host "✓ User 2 account: ID=$user2AccountId, Number=$user2AccountNumber, Balance=$($accounts2[0].balance)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get accounts: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Deposit to User 1 Account
Write-Host "[5/8] Depositing 1000 to User 1 account..." -ForegroundColor Yellow
$depositBody = @{
    accountId = $user1AccountId
    amount = 1000
    description = "Initial deposit"
} | ConvertTo-Json

try {
    $depositResponse = Invoke-RestMethod -Uri "$baseUrl/wallet/deposit" -Method Post -Headers $headers -Body $depositBody -ContentType "application/json"
    Write-Host "✓ Deposited: Amount=$($depositResponse.amount), New Balance=$($depositResponse.newBalance)" -ForegroundColor Green
    $user1BalanceAfterDeposit = $depositResponse.newBalance
} catch {
    Write-Host "✗ Deposit failed: $_" -ForegroundColor Red
    exit 1
}

# Step 6: Transfer from User 1 to User 2
Write-Host "[6/8] Transferring 500 from User 1 to User 2..." -ForegroundColor Yellow
$transferBody = @{
    senderAccountId = $user1AccountId
    receiverAccountId = $user2AccountId
    amount = 500
    description = "Test transfer"
} | ConvertTo-Json

try {
    $transferResponse = Invoke-RestMethod -Uri "$baseUrl/transactions/transfer" -Method Post -Headers $headers -Body $transferBody -ContentType "application/json"
    Write-Host "✓ Transfer completed: ID=$($transferResponse.id), Status=$($transferResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Transfer failed: $_" -ForegroundColor Red
    exit 1
}

# Step 7: Verify User 1 Balance (should be 500)
Write-Host "[7/8] Verifying User 1 balance after transfer..." -ForegroundColor Yellow
try {
    $balance1 = Invoke-RestMethod -Uri "$baseUrl/wallet/balance?accountId=$user1AccountId" -Method Get -Headers $headers
    Write-Host "✓ User 1 balance: $($balance1.balance)" -ForegroundColor Green
    if ($balance1.balance -eq 500) {
        Write-Host "✓ Balance is correct (1000 - 500 = 500)" -ForegroundColor Green
    } else {
        Write-Host "✗ Balance mismatch: expected 500, got $($balance1.balance)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Failed to get balance: $_" -ForegroundColor Red
    exit 1
}

# Step 8: Verify User 2 Balance (should be 500)
Write-Host "[8/8] Verifying User 2 balance after transfer..." -ForegroundColor Yellow
try {
    $balance2 = Invoke-RestMethod -Uri "$baseUrl/wallet/balance?accountId=$user2AccountId" -Method Get -Headers $headers2
    Write-Host "✓ User 2 balance: $($balance2.balance)" -ForegroundColor Green
    if ($balance2.balance -eq 500) {
        Write-Host "✓ Balance is correct (0 + 500 = 500)" -ForegroundColor Green
    } else {
        Write-Host "✗ Balance mismatch: expected 500, got $($balance2.balance)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Failed to get balance: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Test Completed Successfully ===" -ForegroundColor Green
Write-Host "All steps executed successfully!" -ForegroundColor Green
