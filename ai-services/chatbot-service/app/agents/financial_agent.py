import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:12000")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "llama3.2:1b")

SYSTEM_PROMPT = """Tu es un assistant financier conversationnel spécialisé dans l'aide à la gestion de budget, l'épargne, les investissements et les produits bancaires.
Tu dois répondre de manière claire, concise et pédagogique.
Ne donne jamais de conseils d'investissement risqués sans avertir l'utilisateur.
Si tu ne sais pas, dis-le honnêtement.
Réponds toujours en français."""

class FinancialAgent:
    def __init__(self):
        self.llm = ChatOllama(base_url=OLLAMA_BASE_URL, model=MODEL_NAME, temperature=0.8)
        self.history_store: Dict[str, ChatMessageHistory] = {}
        self.chain = self._build_chain()
        self._executor = ThreadPoolExecutor(max_workers=2)

    def _build_chain(self):
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}"),
        ])
        chain = prompt | self.llm | StrOutputParser()
        return chain

    def get_session_history(self, session_id: str) -> ChatMessageHistory:
        if session_id not in self.history_store:
            self.history_store[session_id] = ChatMessageHistory()
        return self.history_store[session_id]

    def _invoke_sync(self, chain_with_history, message, session_id):
        return chain_with_history.invoke({"input": message}, config={"configurable": {"session_id": session_id}})

    def chat(self, session_id: str, message: str) -> str:
        try:
            history = self.get_session_history(session_id)
            chain_with_history = RunnableWithMessageHistory(
                self.chain,
                lambda sid: history,
                input_messages_key="input",
                history_messages_key="history",
            )
            future = self._executor.submit(
                self._invoke_sync, chain_with_history, message, session_id
            )
            response = future.result(timeout=25)
            if not response or not str(response).strip():
                raise ValueError("empty response")
            return response
        except Exception as e:
            return "Je suis temporairement indisponible. En attendant, je te suggère de vérifier tes dépenses fixes, d'épargner au moins 10% de tes revenus et de relire ton budget mensuel."

financial_agent = FinancialAgent()
