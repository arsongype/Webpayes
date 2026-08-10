# Suivi Scrum — Payment Online Platform

## Sprint 0 — Fondations & mise en place ✅
- Monorepo structuré (frontend/, backend/, ai-services/, infra/, docs/, scrum/).
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

## Statut de vérification
- Backend : compile + tests passent (6/6).
- Frontend : build de production réussi.
- Docker : stack complète définie (nécessite Docker pour le lancement).
