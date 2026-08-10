from fastapi import APIRouter, HTTPException
from app.schemas.risk_schema import RiskScoringRequest, RiskScoringResponse
from app.services.risk_service import calculate_risk_score

router = APIRouter()

@router.post("/score")
def score_risk(request: RiskScoringRequest):
    try:
        result = calculate_risk_score(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/score/{transaction_id}", response_model=RiskScoringResponse)
def get_score(transaction_id: str):
    try:
        result = calculate_risk_score(RiskScoringRequest(
            transactionId=transaction_id,
            amount=1000.0,
            currency="MGA",
            senderAccountId="ACC1",
            receiverAccountId="ACC2",
            metadata={}
        ))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
