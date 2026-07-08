from fastapi import APIRouter, HTTPException
from app.schemas.risk_schema import RiskScoringRequest
from app.services.risk_service import calculate_risk_score

router = APIRouter()

@router.post("/score")
def score_risk(request: RiskScoringRequest):
    try:
        result = calculate_risk_score(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
