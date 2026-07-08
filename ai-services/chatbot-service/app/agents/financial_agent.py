from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

OLLAMA_BASE_URL = "http://localhost:11434"
MODEL_NAME = "llama3"

SYSTEM_PROMPT = """Tu es un assistant financier conversationnel spécialisé dans l'aide à la gestion de budget, l'épargne, les investissements et les produits bancaires.
Tu dois répondre de manière claire, concise et pédagogique.
Ne donne jamais de conseils d'investissement risqués sans avertir l'utilisateur.
Si tu ne sais pas, dis-le honnêtement.
Réponds toujours en français."""

class FinancialAgent:
    def __init__(self):
        self.llm = ChatOllama(base_url=OLLAMA_BASE_URL, model=MODEL_NAME, temperature=0.7)
        self.history_store: Dict[str, ChatMessageHistory] = {}
        self.chain = self._build_chain()

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

    def chat(self, session_id: str, message: str) -> str:
        history = self.get_session_history(session_id)
        chain_with_history = RunnableWithMessageHistory(
            self.chain,
            lambda sid: history,
            input_messages_key="input",
            history_messages_key="history",
        )
        response = chain_with_history.invoke({"input": message}, config={"configurable": {"session_id": session_id}})
        return response

financial_agent = FinancialAgent()
