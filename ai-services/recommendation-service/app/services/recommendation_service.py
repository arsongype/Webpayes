from typing import Dict, List, Any
from app.schemas.recommendation_schema import RecommendationRequest, RecommendationResponse, TransactionSummary

class RecommendationService:
    def __init__(self):
        self.default_budgets = {
            "logement": 0.30,
            "alimentation": 0.15,
            "transport": 0.10,
            "loisirs": 0.10,
            "epargne": 0.20,
            "autres": 0.15,
        }

    def _analyze_transactions(self, transactions: List[Dict[str, Any]]) -> TransactionSummary:
        total_sent = sum(t.get("amount", 0.0) for t in transactions if t.get("type") == "sent")
        total_received = sum(t.get("amount", 0.0) for t in transactions if t.get("type") == "received")
        count = len(transactions)
        avg = total_sent / count if count > 0 else 0.0
        return TransactionSummary(
            total_sent=total_sent,
            total_received=total_received,
            transaction_count=count,
            avg_amount=avg,
        )

    def _generate_savings_tip(self, summary: TransactionSummary, balance: float) -> str:
        if summary.transaction_count == 0:
            return "Commencez par enregistrer vos premières transactions pour recevoir des conseils personnalisés."
        if summary.avg_amount > 1000:
            return "Vos dépenses moyennes sont élevées. Envisagez de définir un plafond mensuel pour mieux contrôler votre budget."
        if balance < 100:
            return "Votre solde est bas. Essayez de réduire les dépenses non essentielles ce mois-ci."
        return "Bon travail ! Continuez à suivre vos dépenses et augmentez votre taux d'épargne progressivement."

    def _detect_spending_alert(self, transactions: List[Dict[str, Any]]) -> str | None:
        if not transactions:
            return None
        amounts = [t.get("amount", 0.0) for t in transactions if t.get("type") == "sent"]
        if len(amounts) >= 3 and all(a > 500 for a in amounts[-3:]):
            return "Attention : 3 transactions consécutives supérieures à 500€ détectées."
        return None

    def recommend(self, request: RecommendationRequest) -> RecommendationResponse:
        transactions = request.transaction_history or []
        summary = self._analyze_transactions(transactions)
        savings_tip = self._generate_savings_tip(summary, request.current_balance)
        spending_alert = self._detect_spending_alert(transactions)

        monthly_income = summary.total_received
        suggested_budget = {}
        for category, ratio in self.default_budgets.items():
            suggested_budget[category] = round(monthly_income * ratio, 2)

        confidence = 0.7 if summary.transaction_count > 10 else 0.5 if summary.transaction_count > 0 else 0.3

        return RecommendationResponse(
            user_id=request.user_id,
            savings_tip=savings_tip,
            spending_alert=spending_alert,
            suggested_budget=suggested_budget,
            confidence=confidence,
        )

recommendation_service = RecommendationService()
