import os
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'trained', 'risk_model.pkl')

def generate_dummy_data(n_samples=1000):
    np.random.seed(42)
    X = np.random.rand(n_samples, 4)
    y = ((X[:, 0] * 0.5 + X[:, 1] * 0.3 + X[:, 2] * 0.2) > 0.5).astype(int)
    return X, y

def train_and_save():
    X, y = generate_dummy_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42)
    model.fit(X_train, y_train)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == '__main__':
    train_and_save()
