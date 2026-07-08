import numpy as np
import pandas as pd
from typing import Dict, Any, List

def extract_features(transaction: Dict[str, Any]) -> List[float]:
    features = [
        float(transaction.get('amount', 0)),
        len(transaction.get('sender_account_id', '')),
        len(transaction.get('receiver_account_id', '')),
        1 if transaction.get('currency') == 'USD' else 0,
    ]
    return features

def extract_features_batch(transactions: pd.DataFrame) -> np.ndarray:
    features = pd.DataFrame()
    features['amount'] = transactions['amount'].fillna(0)
    features['sender_len'] = transactions['sender_account_id'].str.len().fillna(0)
    features['receiver_len'] = transactions['receiver_account_id'].str.len().fillna(0)
    features['is_usd'] = (transactions['currency'] == 'USD').astype(int)
    return features.values
