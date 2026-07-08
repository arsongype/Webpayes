from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class RiskScoringRequest(BaseModel):
    transaction_id: str
    amount: float = Field(gt=0)
    currency: str
    sender_account_id: str
    receiver_account_id: str
    metadata: Optional[Dict[str, Any]] = None

class RiskScoringResponse(BaseModel):
    transaction_id: str
    risk_score: float = Field(ge=0, le=1)
    risk_level: str
    recommendation: str
    max_recommended_amount: str
