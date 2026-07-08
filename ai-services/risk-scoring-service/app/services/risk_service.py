from app.schemas.risk_schema import RiskScoringRequest, RiskScoringResponse

def calculate_risk_score(transaction: RiskScoringRequest) -> RiskScoringResponse:
    amount = float(transaction.amount)
    
    if amount > 1000000:
        risk_score = 0.9
        risk_level = "HIGH"
        recommendation = "Transaction bloquée - montant trop élevé"
        max_recommended = "500000"
    elif amount > 500000:
        risk_score = 0.6
        risk_level = "MEDIUM"
        recommendation = "Vérification supplémentaire requise"
        max_recommended = "500000"
    else:
        risk_score = 0.1
        risk_level = "LOW"
        recommendation = "Transaction autorisée"
        max_recommended = "1000000"
    
    return RiskScoringResponse(
        transaction_id=transaction.transaction_id,
        risk_score=risk_score,
        risk_level=risk_level,
        recommendation=recommendation,
        max_recommended_amount=max_recommended
    )
