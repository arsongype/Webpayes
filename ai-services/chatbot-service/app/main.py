from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat_router

app = FastAPI(
    title="Chatbot Financial Assistant",
    description="Assistant financier conversationnel basé sur Ollama (Llama3/Mistral)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router.router, prefix="/api/chatbot", tags=["chatbot"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "chatbot"}
