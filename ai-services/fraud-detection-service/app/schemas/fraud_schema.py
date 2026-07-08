from pydantic import BaseModel, Field
from typing import Dict, Optional, Any

class FraudDetectionRequest(BaseModel):
    transaction_id: str
    amount: float = Field(gt=0)
    currency: str
    sender_account_id: str
    receiver_account_id: str
    metadata: Optional[Dict[str, Any]] = None

class FraudDetectionResponse(BaseModel):
    transaction_id: str
    is_fraudulent: bool = False
    fraud_score: float = 0.0
    risk_level: str = "LOW"
    recommendation: str = "Transaction normale"
    details: Optional[Dict[str, Any]] = None
