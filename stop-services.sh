#!/bin/bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
PID_DIR="$REPO_ROOT/.pids"

if [ ! -d "$PID_DIR" ]; then
  echo "Aucun fichier PID trouve dans $PID_DIR. Les services ne sont probablement pas demarres par le script."
  exit 0
fi

echo "Arret des services..."

for pidFile in "$PID_DIR"/*.pid; do
  [ -e "$pidFile" ] || continue
  name=$(basename "$pidFile" .pid)
  pid=$(cat "$pidFile" 2>/dev/null || true)

  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    echo "Arret de $name (PID $pid)..."
    kill "$pid" 2>/dev/null || true
  else
    echo "$name n'est pas en cours d'execution."
  fi
done

rm -rf "$PID_DIR"
echo "Tous les services ont ete arretes et les fichiers PID nettoyes."
