from fastapi import APIRouter, HTTPException
from app.schemas.recommendation_schema import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import recommendation_service

router = APIRouter()

@router.post("/analyze", response_model=RecommendationResponse)
def analyze(request: RecommendationRequest):
    try:
        return recommendation_service.recommend(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
