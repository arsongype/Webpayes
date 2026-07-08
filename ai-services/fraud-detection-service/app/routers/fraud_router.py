from fastapi import APIRouter, HTTPException
from app.schemas.fraud_schema import FraudDetectionRequest, FraudDetectionResponse
from app.services.fraud_service import fraud_model

router = APIRouter()

@router.post("/detect", response_model=FraudDetectionResponse)
def detect_fraud(request: FraudDetectionRequest):
    try:
        result = fraud_model.predict(request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
