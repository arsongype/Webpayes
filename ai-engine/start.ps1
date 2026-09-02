Set-Location "D:\M2 STAGE\payment-online\ai-engine"
& "D:\M2 STAGE\payment-online\.venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8001
