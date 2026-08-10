from fastapi import APIRouter, HTTPException
from app.schemas.kyc_schema import (
    KycVerificationRequest,
    KycVerificationResponse,
    KycStatusUpdate,
    AccountVerificationRequest,
    AccountVerificationResponse,
)
from app.services.kyc_service import kyc_service

router = APIRouter()

@router.post("/verify", response_model=KycVerificationResponse)
def verify_identity(request: KycVerificationRequest):
    try:
        return kyc_service.create_verification(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-account", response_model=AccountVerificationResponse)
def verify_account(request: AccountVerificationRequest):
    try:
        return kyc_service.verify_account(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/verification/{verification_id}", response_model=KycVerificationResponse)
def get_verification(verification_id: str):
    verification = kyc_service.get_verification(verification_id)
    if not verification:
        raise HTTPException(status_code=404, detail="Vérification non trouvée")
    return verification

@router.patch("/verification/{verification_id}", response_model=KycVerificationResponse)
def update_verification(verification_id: str, update: KycStatusUpdate):
    verification = kyc_service.update_status(verification_id, update)
    if not verification:
        raise HTTPException(status_code=404, detail="Vérification non trouvée")
    return verification

@router.get("/user/{user_id}/verifications", response_model=list[KycVerificationResponse])
def list_user_verifications(user_id: str):
    return [v for v in kyc_service.verifications.values() if v.user_id == user_id]
