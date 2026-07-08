import re
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from app.schemas.kyc_schema import KycStatus, KycVerificationRequest, KycVerificationResponse

class KycService:
    def __init__(self):
        self.verifications: Dict[str, KycVerificationResponse] = {}

    def _extract_text_from_image(self, image_base64: Optional[str]) -> str:
        if not image_base64:
            return ""
        try:
            import pytesseract
            from PIL import Image
            import base64
            import io

            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            text = pytesseract.image_to_string(image, lang="fra+eng")
            return text.strip()
        except Exception:
            return ""

    def _analyze_document(self, text: str, full_name: str, date_of_birth: str) -> Dict[str, Any]:
        extracted_data = {
            "full_name_found": full_name.lower() in text.lower() if text else False,
            "dob_found": date_of_birth in text if text else False,
            "raw_text": text[:500] if text else "",
        }
        confidence = 0.0
        if extracted_data["full_name_found"]:
            confidence += 0.5
        if extracted_data["dob_found"]:
            confidence += 0.3
        if len(text) > 50:
            confidence += 0.2
        extracted_data["confidence"] = min(confidence, 1.0)
        return extracted_data

    def create_verification(self, request: KycVerificationRequest) -> KycVerificationResponse:
        verification_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat() + "Z"

        extracted_data = None
        confidence_score = None
        status = KycStatus.PENDING

        if request.id_document_image:
            text = self._extract_text_from_image(request.id_document_image)
            extracted_data = self._analyze_document(text, request.full_name, request.date_of_birth)
            confidence_score = extracted_data.get("confidence", 0.0)

            if confidence_score >= 0.8:
                status = KycStatus.VALIDATED
            elif confidence_score < 0.3:
                status = KycStatus.REJECTED

        response = KycVerificationResponse(
            verification_id=verification_id,
            user_id=request.user_id,
            status=status,
            extracted_data=extracted_data,
            confidence_score=confidence_score,
            created_at=now,
            updated_at=now,
        )
        self.verifications[verification_id] = response
        return response

    def get_verification(self, verification_id: str) -> Optional[KycVerificationResponse]:
        return self.verifications.get(verification_id)

    def update_status(self, verification_id: str, update: KycStatusUpdate) -> Optional[KycVerificationResponse]:
        verification = self.verifications.get(verification_id)
        if not verification:
            return None
        verification.status = update.status
        verification.rejection_reason = update.rejection_reason
        verification.updated_at = datetime.utcnow().isoformat() + "Z"
        return verification

kyc_service = KycService()
