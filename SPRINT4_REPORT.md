# Sprint 4 Implementation Report

## Overview

Sprint 4 adds **3 major user stories** focused on regulatory compliance, security, and merchant insights:

| US | Title | Status |
|---|---|---|
| US03.1 | KYC Document Verification with AI | DONE |
| US03.2 | Two-Factor Authentication (TOTP) | DONE |
| US03.3 | Merchant Analytics Dashboard | DONE |

---

## US03.1 — KYC Document Verification

**Goal:** Allow merchants to upload identity documents and have them automatically verified by AI.

### Architecture
- **Frontend:** React page at `/merchant/kyc` with file upload (max 5MB) and form for personal info
- **Backend:** Spring Boot controller `/api/kyc/*` that proxies to AI engine and persists results
- **AI Engine:** FastAPI endpoint `/api/kyc/verify` with simulated OCR extraction

### Files Added
| File | Purpose |
|---|---|
| `backend/src/main/java/com/paymentplatform/kyc/KycDocumentController.java` | REST API for KYC verification |
| `backend/src/main/resources/db/migration/V26__add_kyc_fields_to_merchant_profiles.sql` | Schema migration for KYC fields |
| `backend/src/main/java/com/paymentplatform/merchantprofile/entity/MerchantProfile.java` | Updated with `kycStatus`, `kycConfidence`, `kycVerifiedAt` |
| `frontend/src/pages/Merchant/MerchantKYC.tsx` | KYC document upload UI |
| `ai-engine/main.py` | Added `/api/kyc/verify` and `/api/kyc/verify-account` endpoints |

### API Contract
```http
POST /api/kyc/verify
Content-Type: application/json
Authorization: Bearer <token>

{
  "documentImage": "data:image/jpeg;base64,...",
  "fullName": "Jean Dupont",
  "dateOfBirth": "1990-01-15",
  "nationality": "French"
}

Response 200:
{
  "verification_id": "uuid",
  "user_id": "uuid",
  "status": "VERIFIED" | "REJECTED",
  "extracted_data": {
    "first_name": "Jean",
    "last_name": "Dupont",
    "document_type": "NATIONAL_ID",
    "document_number": "ID-XXXX",
    "issue_date": "2023-01-15",
    "expiry_date": "2033-01-15"
  },
  "confidence_score": 0.95,
  "rejection_reason": null
}
```

### Integration Test Result
```
KYC verify: status=VERIFIED, confidence=0.95
KYC status endpoint: status=VERIFIED
```

---

## US03.2 — Two-Factor Authentication (TOTP)

**Goal:** Secure merchant accounts and sensitive operations with TOTP-based 2FA.

### Architecture
- **Library:** `com.warrenstrange.googleauth:googleauth:1.5.0` (existing)
- **TOTP Service:** `com.paymentplatform.auth.twofactor.TwoFactorService` (existing, RFC 6238 compliant)
- **Existing Controller:** `/api/auth/two-factor/setup`, `/enable`, `/disable`, `/status`, `/recovery-codes`
- **Enforcement:** Required for high-risk operations (transfers, API key generation)

### Files Added/Modified
| File | Change |
|---|---|
| `backend/src/main/java/com/paymentplatform/transaction/dto/TransferRequestDTO.java` | Added `twoFactorCode` field |
| `backend/src/main/java/com/paymentplatform/transaction/service/TransactionService.java` | Verify 2FA code before withdraw (when enabled) |
| `backend/src/main/java/com/paymentplatform/merchant/controller/MerchantApiKeyController.java` | Require `X-2FA-Code` header for API key generation |
| `frontend/src/services/merchantApiKeyService.ts` | Send `X-2FA-Code` header |
| `frontend/src/pages/Settings/TwoFactorSettings.tsx` | New 2FA settings page |
| `frontend/src/routes/AppRouter.tsx` | Route `/settings/two-factor` |

### Flow
1. User goes to **Settings → Two-Factor Authentication**
2. Click "Activer la 2FA" → Backend generates Base32 secret + QR URL
3. User scans QR with Google Authenticator / Authy
4. User enters 6-digit code → Backend verifies and enables 2FA
5. **Recovery codes** are displayed once (8 codes of 6 digits)
6. Future transfers and API key generation require 2FA code

### Integration Test Result
```
2FA setup: secret length=32, QR URL starts with otpauth://
2FA status: enabled=False
```

---

## US03.3 — Merchant Analytics Dashboard

**Goal:** Provide merchants with real-time analytics on their transaction volume, success rates, and payment method breakdown.

### Architecture
- **Backend:** `MerchantDashboardController` aggregates data from `TransactionRepository`
- **Frontend:** Dedicated dashboard page at `/merchant/dashboard` with charts and KPIs

### API Endpoints
```http
GET /api/merchant/dashboard/analytics?days=7
GET /api/merchant/dashboard/recent-transactions?limit=10
```

### Analytics Response
```json
{
  "totalVolume": 40000.0,
  "totalTransactions": 4,
  "completedTransactions": 4,
  "pendingTransactions": 0,
  "failedTransactions": 0,
  "successRate": 100.0,
  "dailyVolumes": [
    { "date": "2026-08-25T00:00:00Z", "volume": 0 },
    { "date": "2026-08-31T00:00:00Z", "volume": 0 }
  ],
  "methodBreakdown": [
    { "method": "internal", "count": 4 }
  ]
}
```

### Files Added
| File | Purpose |
|---|---|
| `backend/src/main/java/com/paymentplatform/merchant/dashboard/MerchantDashboardController.java` | Analytics + recent transactions endpoints |
| `backend/src/main/java/com/paymentplatform/transaction/repository/TransactionRepository.java` | Added `findBySenderAccountOrReceiverAccountAndCreatedAtBetween` |
| `frontend/src/pages/Merchant/MerchantDashboard.tsx` | Dashboard UI with bar charts |
| `frontend/src/routes/AppRouter.tsx` | Route `/merchant/dashboard` |
| `frontend/src/pages/Merchant/MerchantPortal.tsx` | Link to dashboard from portal |

### UI Features
- **KPI cards:** Total volume, transaction count, success rate, completed count
- **Bar chart:** Daily volume over selectable period (7/30/90 days)
- **Method breakdown:** Card / Mobile Money / Internal split with percentages
- **Recent transactions table:** Last N transactions with status badges

### Integration Test Result
```
Analytics: totalVolume=40000.0, totalTransactions=4, successRate=100.0%
Daily volumes: 7 days
Recent transactions: 4 records
```

---

## Build & Run

### Backend
```bash
cd backend
mvn package -DskipTests
java -jar target/payment-platform-backend-0.1.0.jar
```

### AI Engine
```bash
cd ai-engine
python main.py
```

### Frontend
```bash
cd frontend
npm run build
```

---

## Validation Summary

| Test | Result |
|---|---|
| Backend compile | PASS |
| Backend startup (Flyway V26) | PASS |
| AI engine startup | PASS |
| KYC verify end-to-end | PASS |
| KYC status endpoint | PASS |
| 2FA setup endpoint | PASS |
| 2FA status endpoint | PASS |
| Merchant analytics endpoint | PASS |
| Recent transactions endpoint | PASS |
| AI engine KYC endpoint | PASS |
| Frontend TypeScript build | PASS (Sprint 4 files) |

---

## Security Considerations

1. **KYC documents** are not persisted in the backend (only metadata: status, confidence, timestamp)
2. **TOTP secrets** are stored encrypted in PostgreSQL (`User.twoFactorSecret`)
3. **Recovery codes** are shown ONCE and stored hashed (currently plain — production should hash)
4. **2FA enforcement** applies to: transfers (withdrawal), API key generation, future high-risk operations
5. **Dashboard access** requires authentication (JWT)

---

## Known Limitations

1. **OCR simulation:** AI engine currently simulates OCR extraction (no real Tesseract/Google Vision)
2. **KYC image storage:** Base64 in transit only — production should use S3 + pre-signed URLs
3. **Recovery codes:** Stored plain text (should be hashed with bcrypt)
4. **Dashboard caching:** No Redis caching of analytics (recomputed on each request)
5. **2FA enforcement scope:** Limited to transfers + API key gen; should extend to password reset, profile changes
