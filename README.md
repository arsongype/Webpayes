# Payment Online Platform

Plateforme de paiement en ligne PCI-DSS Level 1 ready avec architecture monorepo :
- **Backend** : Spring Boot 3.3.4 / Java 21 (port 8081)
- **Frontend** : Vite + React 19 + TypeScript + Tailwind v4 (port 5173)
- **AI Engine** : FastAPI + scikit-learn (port 8001) — fraud detection, routing, KYC, 3DS2 exemption
- **Infra** : Docker Compose + Kubernetes (overlays dev/staging/prod)
- **Observabilité** : OpenTelemetry → Jaeger + Prometheus, audit trail PCI-DSS 7 ans avec hash chain SHA-256

## Sprints complétés
| Sprint | Contenu |
|---|---|
| 0 | Fondations monorepo, CI/CD |
| 1 | PCI Vault AES-256-GCM, Mobile Money (Orange/MTN/M-Pesa), Redis idempotency, double-entry ledger |
| 2 | AI engine : fraud detection (XGBoost), routing, 3DS2 exemption, KYC |
| 3 | Resilience4j circuit breaker, AI agents (API key + budget) |
| 4 | KYC + 2FA TOTP + Merchant Dashboard (analytics) |
| 5 | **Réconciliation ISO 20022 camt.053, Payouts SEPA/Mobile Money, OpenTelemetry+Jaeger, Audit Trail PCI-DSS 7 ans** |

## Démarrage rapide

### Tous les services (PowerShell)
```powershell
.\start-all.ps1
```

### Manuel
```bash
# AI engine
python -m venv .venv && .venv\Scripts\python.exe -m pip install -r ai-engine/requirements.txt
.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8001 --app-dir ai-engine

# Backend
cd backend && mvn spring-boot:run

# Frontend
cd frontend && npm install && npm run dev
```

### Production (EKS/GKE)
```bash
cd infra/kubernetes/overlays/prod
kubectl apply -k .
```
Inclut : NetworkPolicy, PodDisruptionBudget, Ingress TLS (cert-manager), Jaeger, Prometheus, securityContext runAsNonRoot.

## Endpoints principaux
| Endpoint | Description |
|---|---|
| `POST /api/auth/login` | Login (avec 2FA si activé) |
| `POST /api/payments` | Paiement (carte, mobile money) |
| `GET /api/wallet/balance?accountId=` | Solde |
| `GET /api/merchant/dashboard` | Dashboard analytics |
| `GET /api/kyc/status` | Statut KYC |
| `POST /api/kyc/verify` | Vérification KYC |
| `POST /api/reconciliation/import` | Import camt.053 |
| `GET /api/reconciliation` | Liste des réconciliations |
| `POST /api/payouts` | Créer un payout (banque ou mobile money) |
| `GET /api/payouts` | Liste payouts |
| `GET /api/audit` | Audit trail (admin) |
| `GET /api/audit/integrity` | Vérification chaîne de hash |
| `GET /actuator/prometheus` | Métriques Prometheus |
| `GET /actuator/health` | Health check |

## CI/CD
- `.github/workflows/ci.yml` : compile + lint
- `.github/workflows/cd-prod.yml` : build+push GHCR (SBOM+provenance) → Trivy → EKS deploy

## Conformité PCI-DSS
Voir [`SPRINT5_REPORT.md`](SPRINT5_REPORT.md) pour le détail des 12 requirements.

## Identifiants de test
- Admin : `admin@localhost` / `Admin123!`
