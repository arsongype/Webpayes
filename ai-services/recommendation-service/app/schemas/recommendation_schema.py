from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TransactionSummary(BaseModel):
    total_sent: float = 0.0
    total_received: float = 0.0
    transaction_count: int = 0
    avg_amount: float = 0.0
    top_recipients: List[Dict[str, Any]] = []
    monthly_spending: Dict[str, float] = {}

class RecommendationRequest(BaseModel):
    user_id: str
    transaction_history: Optional[List[Dict[str, Any]]] = None
    current_balance: float = 0.0

class RecommendationResponse(BaseModel):
    user_id: str
    savings_tip: str
    spending_alert: Optional[str] = None
    suggested_budget: Dict[str, float]
    recommended_channel: Optional[str] = None
    confidence: float
