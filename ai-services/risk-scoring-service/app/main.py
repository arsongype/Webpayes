from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import risk_router
from app.core.config import settings

app = FastAPI(
    title="Risk Scoring Service",
    description="Service de scoring de risque",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk_router.router, prefix="/api/risk", tags=["risk"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "risk-scoring"}
