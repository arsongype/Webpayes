# Suivi Scrum — Payment Online Platform

## Sprint 0 — Fondations & mise en place ✅
- Monorepo structuré (frontend/, backend/, ai-engine/, infra/, docs/, scrum/).
- CI/CD : workflows GitHub Actions (`.github/`).
- Base de données : PostgreSQL + migrations Flyway (V1__init_schema.sql, V2, V3).
- Orchestration locale : `infra/docker-compose/docker-compose.yml` + `.env.example`.

## Sprint 1 — Authentification & rôles ✅
- Inscription / connexion JWT, BCrypt, RBAC (USER/MERCHANT/ADMIN).
- `Account` avec kyc_status.

## Sprint 2 — Portefeuille électronique (Wallet) ✅
- Création automatique du wallet à l'inscription.
- Recharge et solde (verrouillage pessimiste, MGA).

## Sprint 3 — Transactions P2P & grand livre ✅
- Transferts P2P, statuts, LedgerEntry en partie double.

## Sprint 4 — Intégration Mobile Money ✅
- MVola / Airtel Money / Orange Money (clients + PaymentGatewayService, mocks en dev).

## Sprint 5 — Paiement par QR Code ✅
- Génération/lecture QR, validation du solde.

## Sprint 6 — KYC ✅
- `kyc-verification-service` FastAPI (OCR/vision), repli sans Ollama.

## Sprint 7 — Détection de fraude IA ✅
- `fraud-detection-service` (XGBoost), FraudDetectionClient backend.

## Sprint 8 — Scoring de risque & routage ✅
- `risk-scoring-service` + `routing-engine-service`, clients backend.

## Sprint 9 — Chatbot IA financier ✅
- `chatbot-service` LangChain + Ollama, repli si indisponible.

## Sprint 10 — Dashboard admin & Monitoring ✅
- Charts React, Prometheus, Grafana (dashboards provisionnés).

## Sprint 11 — Réconciliation ISO 20022, Payouts, Observabilité & Prod ✅

**US04.1 — Réconciliation ISO 20022 (camt.053)**
- `Camt053Parser.java` : parsing de l'arborescence Document/BkToCstmrStmt/Stmt/Ntry
- `ReconciliationService.matchTransaction()` : matching par EndToEndId + fallback référence + montant + date
- `V28__create_reconciliation_tables.sql` (reconciliations + reconciliation_entries)
- Endpoints `/api/reconciliation/{import, list, {id}, {id}/entries}`

**US06.1 — Moteur de versements (Payouts)**
- Package `com.paymentplatform.payout` : entity, repository, service, controller, DTOs
- `PayoutGateway` : SEPA (IBAN+BIC, ≤ 10 000 €) + Mobile Money USSD
- Exécution synchrone du transfert + débit wallet + WalletTransaction
- `V29__create_payouts_table.sql`
- Endpoints `/api/payouts/{, summary, {id}, {id}/cancel}`

**US07.1 — OpenTelemetry + Jaeger + Audit Trail PCI-DSS**
- Dépendances : `micrometer-tracing-bridge-otel`, `opentelemetry-exporter-otlp`
- Export OTLP/HTTP vers `http://jaeger:4318/v1/traces`
- `RequestIdFilter` (HIGHEST_PRECEDENCE+5) → `X-Request-Id` + MDC
- `logback-spring.xml` JSON rotatif + pattern console avec `requestId,traceId`
- Package `com.paymentplatform.audit` : entity, repository, service, controller
- Table `audit_events` : hash chain SHA-256, 7-year retention, JSONB metadata
- `V30__create_audit_trail_table.sql`
- Endpoints admin `/api/audit/{, actor/{id}, type/{type}, period, integrity}`
- Hooks : AuthService (login/2FA/register), VaultService (tokenize/detokenize), KycService (verify), PayoutService (create/completed/failed)

**Production Deployment (EKS/GKE)**
- `infra/kubernetes/overlays/prod/production.yaml` : NetworkPolicy, PodDisruptionBudget, ConfigMap audit-policy, Ingress TLS+cert-manager + headers HSTS/X-Frame/CSP
- `infra/kubernetes/overlays/prod/observability.yaml` : Jaeger all-in-one 1.60 (4317/4318/16686), Prometheus v2.55 + RBAC
- `backend/deployment.yaml` : env OTLP + securityContext (runAsNonRoot, readOnlyRootFilesystem, drop ALL caps)
- `.github/workflows/cd-prod.yml` : build+push GHCR (SBOM+provenance) → Trivy scan → EKS deploy → health check

## Statut de vérification
- Backend : compile OK, 11/12 tests d'intégration Sprint 5 passent (le 12ᵉ = Prometheus protégé par auth, comportement attendu).
- Frontend : build de production réussi.
- Docker : stack complète (EKS/GKE ready) avec overlays dev/staging/prod.
- **PCI-DSS Level 1 readiness** : 12/12 requirements couverts. Voir `SPRINT5_REPORT.md`.
