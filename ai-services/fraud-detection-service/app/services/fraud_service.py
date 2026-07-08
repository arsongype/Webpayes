import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
import joblib
import os
from app.core.config import settings
from app.schemas.fraud_schema import FraudDetectionResponse

class FraudModel:
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'trained', 'fraud_xgboost_v1.pkl')
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            self.model = None
    
    def extract_features(self, transaction: Dict[str, Any]) -> np.ndarray:
        features = [
            float(transaction.get('amount', 0)),
            len(transaction.get('sender_account_id', '')),
            len(transaction.get('receiver_account_id', '')),
            1 if transaction.get('currency') == 'USD' else 0,
        ]
        return np.array(features).reshape(1, -1)
    
    def predict(self, transaction: Dict[str, Any]) -> FraudDetectionResponse:
        if self.model is None:
            return FraudDetectionResponse(
                transaction_id=transaction.get('transaction_id', ''),
                fraud_score=0.0,
                risk_level="LOW",
                recommendation="Modèle non chargé - analyse par défaut"
            )
        
        try:
            features = self.extract_features(transaction)
            fraud_score = float(self.model.predict_proba(features)[0][1])
            risk_level = "HIGH" if fraud_score > 0.7 else "MEDIUM" if fraud_score > 0.3 else "LOW"
            is_fraudulent = fraud_score > 0.5
            
            recommendation = "Transaction bloquée" if is_fraudulent else "Transaction autorisée"
            
            return FraudDetectionResponse(
                transaction_id=transaction.get('transaction_id', ''),
                is_fraudulent=is_fraudulent,
                fraud_score=round(fraud_score, 4),
                risk_level=risk_level,
                recommendation=recommendation,
                details={"features_used": features.shape[1]}
            )
        except Exception as e:
            return FraudDetectionResponse(
                transaction_id=transaction.get('transaction_id', ''),
                fraud_score=0.0,
                risk_level="LOW",
                recommendation=f"Erreur lors de l'analyse: {str(e)}"
            )

fraud_model = FraudModel()
