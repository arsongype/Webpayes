# Risk Scoring Service

Service de scoring de risque basé sur des règles.

## Démarrage

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8002
```

## Endpoints

- `POST /api/risk/score` - Calculer le score de risque
- `GET /health` - Health check
