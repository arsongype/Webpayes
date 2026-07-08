# Fraud Detection Service

Service de détection de fraude basé sur XGBoost.

## Installation

```bash
pip install -r requirements.txt
```

## Entraînement

```bash
python app/ml/train.py
```

## Démarrage

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

## Endpoints

- `POST /api/fraud/detect` - Détecter la fraude
- `GET /health` - Health check
