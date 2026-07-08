from fastapi import APIRouter, HTTPException
from app.schemas.routing_schema import RoutingRequest, RoutingResponse
from app.services.routing_service import routing_service

router = APIRouter()

@router.post("/best-channel", response_model=RoutingResponse)
def best_channel(request: RoutingRequest):
    try:
        return routing_service.route(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
