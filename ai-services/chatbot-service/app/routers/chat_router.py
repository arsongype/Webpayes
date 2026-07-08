from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.agents.financial_agent import financial_agent

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1)
    message: str = Field(min_length=1, max_length=2000)

class ChatResponse(BaseModel):
    session_id: str
    reply: str

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        reply = financial_agent.chat(request.session_id, request.message)
        return ChatResponse(session_id=request.session_id, reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement: {str(e)}")

@router.post("/chat/reset")
def reset_chat(session_id: str):
    try:
        history_store = financial_agent.history_store
        if session_id in history_store:
            history_store[session_id].clear()
        return {"status": "ok", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
