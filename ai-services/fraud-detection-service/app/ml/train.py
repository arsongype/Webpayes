import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import os

def generate_synthetic_data(n_samples: int = 10000) -> pd.DataFrame:
    np.random.seed(42)
    data = pd.DataFrame({
        'amount': np.random.exponential(100, n_samples),
        'sender_len': np.random.randint(5, 50, n_samples),
        'receiver_len': np.random.randint(5, 50, n_samples),
        'is_usd': np.random.randint(0, 2, n_samples),
        'is_fraud': np.random.randint(0, 2, n_samples),
    })
    data.loc[data['is_fraud'] == 1, 'amount'] *= 5
    return data

def train():
    print("Chargement des données...")
    df = generate_synthetic_data()
    
    X = df.drop('is_fraud', axis=1)
    y = df['is_fraud']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        use_label_encoder=False,
        eval_metric='logloss',
        random_state=42
    )
    
    print("Entraînement du modèle...")
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    print(classification_report(y_test, y_pred))
    print(f"AUC-ROC: {roc_auc_score(y_test, model.predict_proba(X_test_scaled)[:, 1])}")
    
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'models', 'trained')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'fraud_xgboost_v1.pkl')
    
    joblib.dump(model, model_path)
    print(f"Modèle sauvegardé dans {model_path}")

if __name__ == "__main__":
    train()
