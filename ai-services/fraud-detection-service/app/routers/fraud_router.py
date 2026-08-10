from fastapi import APIRouter, HTTPException
from app.schemas.fraud_schema import FraudDetectionRequest, FraudDetectionResponse
from app.services.fraud_service import fraud_model
import time
import random

router = APIRouter()

@router.post("/detect", response_model=FraudDetectionResponse)
def detect_fraud(request: FraudDetectionRequest):
    try:
        result = fraud_model.predict(request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts", response_model=list[FraudDetectionResponse])
def get_alerts(limit: int = 20):
    alerts = []
    for i in range(min(limit, 5)):
        alerts.append(FraudDetectionResponse(
            transactionId=f"alert-{i+1}",
            isFraudulent=random.choice([True, False]),
            fraudScore=round(random.uniform(0.0, 1.0), 2),
            riskLevel=random.choice(["LOW", "MEDIUM", "HIGH"]),
            recommendation="Transaction vérifiée",
            details={"source": "demo", "timestamp": time.time()}
        ))
    return alerts

@router.post("/analyze/{transaction_id}", response_model=FraudDetectionResponse)
def analyze_transaction(transaction_id: str):
    try:
        result = fraud_model.predict({
            "transaction_id": transaction_id,
            "amount": 1000.0,
            "currency": "MGA",
            "sender_account_id": "ACC1",
            "receiver_account_id": "ACC2",
            "metadata": {}
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
