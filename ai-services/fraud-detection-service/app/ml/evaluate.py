from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import pandas as pd
import numpy as np

def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    report = classification_report(y_test, y_pred, output_dict=True)
    cm = confusion_matrix(y_test, y_pred).tolist()
    auc = roc_auc_score(y_test, y_proba)
    
    return {
        "classification_report": report,
        "confusion_matrix": cm,
        "auc_roc": auc
    }
