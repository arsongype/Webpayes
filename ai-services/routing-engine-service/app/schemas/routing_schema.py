from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class PaymentChannel(BaseModel):
    id: str
    name: str
    type: str
    fee_percent: float
    min_amount: float
    max_amount: float
    processing_time_seconds: int
    available: bool = True

class RoutingRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    sender_country: str
    receiver_country: str
    urgency_seconds: Optional[int] = None
    preferred_channel: Optional[str] = None

class RoutingResponse(BaseModel):
    recommended_channel: str
    reason: str
    estimated_fee: float
    estimated_arrival_seconds: int
    alternatives: List[Dict[str, Any]]
