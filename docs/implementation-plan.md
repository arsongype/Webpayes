# Plan d'Implémentation - WebPaysh Payment Platform

## Statut Global

| Item | Status |
|------|--------|
| Fix Payment 500 | ✅ Fait |
| External Service Graceful Degradation | ✅ Fait |
| Backend Unit Tests | ✅ 77 tests passent |
| Frontend Unit Tests (Vitest) | ✅ Configuré, 6 tests passent |
| US01.3 Idempotency 409 Conflict | ✅ Fait |
| US01.4 Ledger Immutability | ✅ Fait |
| US02.6 Circuit Breaker Config | ✅ Fait |
| US03.2 2FA Recovery Codes (8 + AES-256) | ✅ Fait |
| Alignement Seuils Spec | ✅ Fait |
| Security Headers OWASP | ✅ Fait |
| CI Workflow | ✅ Fait |
| Integration Tests (Testcontainers) | ✅ Fait |
| US07.1 WORM Storage | ✅ Fait |
| JaCoCo Coverage | ✅ Configuré |
| k6 Load Tests | ✅ Script créé : `backend/src/test/resources/k6-payment-load.js` (voir `docs/k6-load-tests.md`) |

## Détails par US

### US01.3 - Idempotency 409 Conflict
- `IdempotencyService` : méthodes `markProcessing` et `isProcessing` ajoutées
- `IdempotencyInterceptor` : retourne 409 si requête en cours
- Tests : 21 tests passent

### US01.4 - Ledger Immutability
- Migration V32 : trigger PostgreSQL anti-UPDATE/DELETE sur `ledger_entries`
- `LedgerService` : `saveEntriesAndValidate` et `validateBalance` vérifient `DEBIT = CREDIT`
- Tests : 10 tests passent

### US03.2 - 2FA Recovery Codes
- `TwoFactorService` : chiffrement AES-256-GCM des codes
- `TwoFactorController` : 8 codes générés, chiffrés en base
- Tests : 16 tests passent

### US07.1 - WORM Storage
- `WormStorageService` : append-only fichier chiffré AES-256
- Intégré dans `AuditService` (async + sync)
- Tests : 3 tests passent

### WebSocket/SSE - Notifications temps réel
- Endpoint SSE : `GET /api/transactions/stream/balance`
- `TransactionService` : `streamBalance()` pour ouvrir le flux
- Après transfert, `sendBalanceUpdate()` notifie l'expéditeur et le récepteur
- Frontend : hook `useBalanceStream` + composant `BalanceDisplay`

### Build & Tests
- Backend : 77 tests passent, JaCoCo configuré
- Frontend : 6 tests unitaires passent (Vitest)
- Script k6 load test créé

## Tests Backend (77 passent)

| Catégorie | Tests |
|-----------|-------|
| Services | PaymentService, WalletService, TransactionService, LedgerService, TwoFactorService, IdempotencyService, AuditService |
| Contrôleurs | AccountController, AuthController, QrCodeController, TransactionController |
| Intercepteurs | IdempotencyInterceptor |
| Sécurité | SecurityHeadersTest |
| WORM | WormStorageServiceTest |
| Intégration | PaymentIntegrationTest, AuthIntegrationTest (nécessitent Docker) |

## Configuration CI

- `.github/workflows/ci.yml` :
  - Job `backend` : build + tests unitaires
  - Job `backend-integration` : tests d'intégration avec Testcontainers
  - Job `frontend` : install + lint + tests unitaires + build

## Coverage

- JaCoCo 0.8.12 configuré
- Rapport dans `backend/target/site/jacoco/`
