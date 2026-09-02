#!/usr/bin/env bash
# Build, push and deploy the platform to Kubernetes for a given environment.
# Usage: ./deploy.sh <env>   (env = dev | staging | prod)
set -euo pipefail

ENV="${1:-dev}"
case "$ENV" in
  dev|staging|prod) ;;
  *)
    echo "Unknown env '$ENV'. Use dev, staging or prod." >&2
    exit 1
    ;;
esac

REGISTRY="${REGISTRY:-payment-online}"
TAG="${TAG:-1.0.0}"
OVERLAY_DIR="../infra/kubernetes/overlays/${ENV}"

echo "==> Building images with tag ${TAG}"
docker build -t "${REGISTRY}/backend:${TAG}" -f ../infra/docker/backend.Dockerfile ../backend
docker build -t "${REGISTRY}/frontend:${TAG}" -f ../infra/docker/frontend.prod.Dockerfile ../frontend
docker build -t "${REGISTRY}/ai-engine:${TAG}" ../ai-engine

if [[ -n "${PUSH:-}" ]]; then
  echo "==> Pushing images"
  for img in backend frontend ai-engine; do
    docker push "${REGISTRY}/${img}:${TAG}"
  done
fi

echo "==> Deploying overlay ${ENV}"
kubectl apply -k "$OVERLAY_DIR"

echo "==> Waiting for rollout"
kubectl -n payment-platform rollout status deployment/${ENV}-backend --timeout=300s || true
kubectl -n payment-platform rollout status deployment/${ENV}-frontend --timeout=300s || true
kubectl -n payment-platform rollout status deployment/${ENV}-ai-engine --timeout=300s || true

echo "Deploy to '${ENV}' complete."
