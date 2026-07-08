# Backend — Payment Platform (Spring Boot)

## Prérequis
- Java 21 (JDK)
- Maven 3.9+
- PostgreSQL 16 (DB `monorepo_db`, user `postgres`, password `arson`)
- Redis 7

## Lancer en local (sans Docker)

```bash
# 1. Créer la base
psql -U postgres -c "CREATE DATABASE monorepo_db;"

# 2. Variables d'environnement (ou éditer application.yml directement)
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/monorepo_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=arson
export JWT_SECRET=un_secret_dev_de_32_caracteres_minimum

# 3. Lancer
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

L'API démarre sur `http://localhost:8080`.
Swagger UI : `http://localhost:8080/swagger-ui.html`

## Lancer avec Docker Compose (depuis la racine du monorepo)

```bash
docker compose up --build
```

## Endpoints disponibles (Sprint 1)

| Méthode | URL                  | Description                    | Auth requise |
|---------|----------------------|---------------------------------|--------------|
| POST    | `/api/auth/register` | Inscription utilisateur         | Non          |
| POST    | `/api/auth/login`    | Connexion, retourne un JWT       | Non          |

### Exemple d'inscription

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bonjours",
    "lastName": "Rakoto",
    "email": "bonjours@example.com",
    "password": "MotDePasse123!"
  }'
```

### Exemple de connexion

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "bonjours@example.com", "password": "MotDePasse123!"}'
```

La réponse contient `accessToken` à utiliser dans l'en-tête `Authorization: Bearer <token>` pour les routes protégées.

## Prochaines étapes (Sprint 2+)
- Module `wallet` (solde, dépôt simulé, historique)
- Module `transaction` + `ledger` (transferts, double écriture comptable)
- Clients IA (`aiclient`) vers les microservices FastAPI
