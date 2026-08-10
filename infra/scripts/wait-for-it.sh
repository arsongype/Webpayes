#!/usr/bin/env bash
# Wait for a host:port to become available before executing a command.
# Usage: wait-for-it.sh host:port [-t timeout] [-- command args]
set -euo pipefail

WAITFORIT_TIMEOUT=15
WAITFORIT_HOST=""
WAITFORIT_PORT=""
WAITFORIT_CLI=""

usage() {
  echo "Usage: $0 host:port [-t timeout] [-- command args]" >&2
  exit 1
}

parse_host_port() {
  local input="$1"
  WAITFORIT_HOST="${input%:*}"
  WAITFORIT_PORT="${input##*:}"
  if [[ -z "$WAITFORIT_HOST" || -z "$WAITFORIT_PORT" || "$WAITFORIT_HOST" == "$WAITFORIT_PORT" ]]; then
    echo "Error: invalid host:port '$input'" >&2
    usage
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    *:*)
      parse_host_port "$1"
      shift
      ;;
    -t)
      WAITFORIT_TIMEOUT="$2"
      shift 2
      ;;
    --)
      shift
      WAITFORIT_CLI="$*"
      break
      ;;
    *)
      usage
      ;;
  esac
done

if [[ -z "$WAITFORIT_HOST" ]]; then
  usage
fi

echo "Waiting for $WAITFORIT_HOST:$WAITFORIT_PORT (timeout ${WAITFORIT_TIMEOUT}s)..."
start=$(date +%s)
while true; do
  if (echo > "/dev/tcp/${WAITFORIT_HOST}/${WAITFORIT_PORT}") >/dev/null 2>&1; then
    echo "$WAITFORIT_HOST:$WAITFORIT_PORT is available."
    break
  fi
  now=$(date +%s)
  if (( now - start >= WAITFORIT_TIMEOUT )); then
    echo "Timeout waiting for $WAITFORIT_HOST:$WAITFORIT_PORT" >&2
    exit 1
  fi
  sleep 1
done

if [[ -n "$WAITFORIT_CLI" ]]; then
  exec $WAITFORIT_CLI
fi
