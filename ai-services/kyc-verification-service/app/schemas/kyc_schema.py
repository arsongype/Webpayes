from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from enum import Enum

class KycStatus(str, Enum):
    PENDING = "en_attente"
    VALIDATED = "valide"
    REJECTED = "rejete"

class KycVerificationRequest(BaseModel):
    user_id: str
    id_document_image: Optional[str] = None
    full_name: str = Field(min_length=2, max_length=100)
    date_of_birth: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    nationality: str = Field(min_length=2, max_length=50)

class KycVerificationResponse(BaseModel):
    verification_id: str
    user_id: str
    status: KycStatus
    extracted_data: Optional[Dict[str, Any]] = None
    confidence_score: Optional[float] = None
    rejection_reason: Optional[str] = None
    created_at: str
    updated_at: str

class KycStatusUpdate(BaseModel):
    status: KycStatus
    rejection_reason: Optional[str] = None
