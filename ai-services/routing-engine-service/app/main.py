from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import routing_router

app = FastAPI(
    title="Routing Engine Service",
    description="Service de choix du meilleur canal de paiement",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routing_router.router, prefix="/api/routing", tags=["routing"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "routing-engine"}
