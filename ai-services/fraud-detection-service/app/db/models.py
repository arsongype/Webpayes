from sqlalchemy import Column, String, Float, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from app.db.session import Base

class FraudAnalysis(Base):
    __tablename__ = "fraud_analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String, unique=True, index=True)
    is_fraudulent = Column(Boolean, default=False)
    fraud_score = Column(Float)
    risk_level = Column(String)
    recommendation = Column(String)
    details = Column(String)  # JSON as string
    created_at = Column(DateTime, default=datetime.utcnow)
