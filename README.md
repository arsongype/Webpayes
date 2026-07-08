# Payment Online Platform

Plateforme de paiement en ligne avec architecture monorepo composée de :
- Backend Spring Boot 3 / Java 21
- Frontend React + TypeScript + Vite
- Services IA Python/FastAPI
- Infrastructure Docker Compose + Kubernetes

## Sprint 1 – État

Les éléments suivants sont déjà présents :
- Structure monorepo
- Backend Spring Boot avec sécurité JWT
- Frontend React TypeScript
- Base Docker Compose
- Services IA et infrastructure Kubernetes

Les éléments complétés dans cette passe :
- Initialisation Git locale
- Configuration de base pour GitHub Actions
- Variables d’environnement de développement
- Documentation de démarrage

## Démarrage rapide

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker Compose
```bash
docker compose -f infra/docker-compose.yml up --build
```

## CI/CD
La validation automatique est prévue via GitHub Actions pour :
- compilation du backend Maven
- build du frontend Vite
