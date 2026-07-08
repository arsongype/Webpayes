from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import recommendation_router

app = FastAPI(
    title="Recommendation Service",
    description="Service de recommandations financières basées sur l'historique des transactions",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendation_router.router, prefix="/api/recommendations", tags=["recommendations"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "recommendation"}
