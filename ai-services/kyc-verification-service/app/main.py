from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import kyc_router

app = FastAPI(
    title="KYC Verification Service",
    description="Service de vérification d'identité par OCR et workflow de validation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kyc_router.router, prefix="/api/kyc", tags=["kyc"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "kyc-verification"}
