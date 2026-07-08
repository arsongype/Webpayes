import joblib
import os
from app.core.config import settings
from app.services.fraud_service import FraudModel

def get_model():
    return FraudModel()
