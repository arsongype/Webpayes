# Documentation — Payment Online Platform

Plateforme de paiement en ligne (MGA) avec architecture monorepo.

## Architecture

- **backend/** : API REST Spring Boot 3 (Java 21), sécurité JWT, Flyway.
- **frontend/** : SPA React + TypeScript + Vite.
- **ai-engine/** : service IA unifié Python/FastAPI (fraude, risque, KYC, exemption 3DS2, routage dynamique).
- **infra/** : Docker Compose, Kubernetes (kustomize), monitoring (Prometheus/Grafana).
- **load-tests/** : tests de charge (k6).

## Modèle de données

- `Account` : utilisateur (email, mot de passe BCrypt, rôle, kyc_status).
- `Wallet` : solde par compte (verrouillage pessimiste), devise MGA.
- `Transaction` : transferts P2P avec statut (INITIEE/VALIDEE/EXECUTEE/REJETEE).
- `LedgerEntry` : grand livre comptable en partie double.

## Démarrage local

```bash
cp .env.example .env
docker compose -f infra/docker-compose/docker-compose.yml up --build
```

Sans Docker : voir `backend/README.md` et `frontend/README.md`.

## Health-checks

Chaque service expose `/health` (backend, frontend et microservices IA) et
Postgres/Redis disposent de healthchecks Compose.
