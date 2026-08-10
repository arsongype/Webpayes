#!/bin/bash
set -e

echo "=== Payment Online - Demarrage des services (Linux/macOS/WSL) ==="

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
FRAUD_DIR="$REPO_ROOT/ai-services/fraud-detection-service"
RISK_DIR="$REPO_ROOT/ai-services/risk-scoring-service"
KYC_DIR="$REPO_ROOT/ai-services/kyc-verification-service"
CHATBOT_DIR="$REPO_ROOT/ai-services/chatbot-service"
REC_DIR="$REPO_ROOT/ai-services/recommendation-service"
ROUTING_DIR="$REPO_ROOT/ai-services/routing-engine-service"

PYTHON="$REPO_ROOT/.venv/bin/python"

check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "Commande introuvable: $1"
    exit 1
  fi
}

check_command python
check_command npm
check_command mvn

mkdir -p "$REPO_ROOT/logs" "$REPO_ROOT/.pids"

echo "[1/3] Backend Spring Boot..."
cd "$BACKEND_DIR"
nohup mvn spring-boot:run > "$REPO_ROOT/logs/backend.log" 2>&1 &
echo $! > "$REPO_ROOT/.pids/backend.pid"

echo "[2/3] Services IA Python..."
cd "$FRAUD_DIR" && nohup "$PYTHON" -m uvicorn app.main:app --reload --port 8001 > "$REPO_ROOT/logs/fraud.log" 2>&1 &
echo $! > "$REPO_ROOT/.pids/fraud.pid"

cd "$RISK_DIR" && nohup "$PYTHON" -m uvicorn app.main:app --reload --port 8002 > "$REPO_ROOT/logs/risk.log" 2>&1 &
echo $! > "$REPO_ROOT/.pids/risk.pid"

cd "$KYC_DIR" && nohup "$PYTHON" -m uvicorn app.main:app --reload --port 8003 > "$REPO_ROOT/logs/kyc.log" 2>&1 &
echo $! > "$REPO_ROOT/.pids/kyc.pid"

cd "$CHATBOT_DIR" && nohup "$PYTHON" -m uvicorn app.main:app --reload --port 8004 > "$REPO_ROOT/logs/chatbot.log" 2>&1 &
echo $! > "$REPO_ROOT/.pids/chatbot.pid"

cd "$REC_DIR" && nohup "$PYTHON" -m uvicorn app.main:app --reload --port 8005 > "$REPO_ROOT/logs/recommendation.log" 2>&1 &
echo $! > "$REPO_ROOT/.pids/recommendation.pid"

cd "$ROUTING_DIR" && nohup "$PYTHON" -m uvicorn app.main:app --reload --port 8006 > "$REPO_ROOT/logs/routing.log" 2>&1 &
echo $! > "$REPO_ROOT/.pids/routing.pid"

echo "[3/3] Frontend Vite..."
cd "$FRONTEND_DIR"
nohup npm run dev > "$REPO_ROOT/logs/frontend.log" 2>&1 &
echo $! > "$REPO_ROOT/.pids/frontend.pid"

echo ""
echo "=== Services demarres ==="
echo "Backend   : http://localhost:8081  (logs: logs/backend.log)"
echo "Fraud     : http://127.0.0.1:8001 (logs: logs/fraud.log)"
echo "Risk      : http://127.0.0.1:8002 (logs: logs/risk.log)"
echo "KYC       : http://127.0.0.1:8003 (logs: logs/kyc.log)"
echo "Chatbot   : http://127.0.0.1:8004 (logs: logs/chatbot.log)"
echo "Recommend : http://127.0.0.1:8005 (logs: logs/recommendation.log)"
echo "Routing   : http://127.0.0.1:8006 (logs: logs/routing.log)"
echo "Frontend  : http://localhost:5173 (logs: logs/frontend.log)"
echo ""
echo "Pour arreter tous les services: ./stop-services.sh"
