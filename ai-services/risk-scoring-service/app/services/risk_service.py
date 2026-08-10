import os
import joblib
import numpy as np
from app.schemas.risk_schema import RiskScoringRequest, RiskScoringResponse

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'trained', 'risk_model.pkl')

try:
    model = joblib.load(MODEL_PATH)
except Exception:
    model = None

def calculate_risk_score(transaction: RiskScoringRequest) -> RiskScoringResponse:
    if model is not None:
        features = np.array([[
            transaction.amount / 1_000_000,
            len(transaction.sender_account_id) % 10,
            len(transaction.receiver_account_id) % 10,
            1 if transaction.metadata else 0,
        ]])
        risk_prob = float(model.predict_proba(features)[0][1])
        risk_score = round(risk_prob, 2)
    else:
        amount = float(transaction.amount)
        if amount > 1000000:
            risk_score = 0.9
        elif amount > 500000:
            risk_score = 0.6
        else:
            risk_score = 0.1

    if risk_score >= 0.8:
        risk_level = "HIGH"
        recommendation = "Transaction bloquée - risque trop élevé"
        max_recommended = "500000"
    elif risk_score >= 0.5:
        risk_level = "MEDIUM"
        recommendation = "Vérification supplémentaire requise"
        max_recommended = "500000"
    else:
        risk_level = "LOW"
        recommendation = "Transaction autorisée"
        max_recommended = "1000000"

    return RiskScoringResponse(
        transaction_id=transaction.transaction_id,
        risk_score=risk_score,
        risk_level=risk_level,
        recommendation=recommendation,
        max_recommended_amount=max_recommended
    )
