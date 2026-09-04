#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")"

SKIP_PULL=0

usage() {
  cat <<'EOF'
Usage: ./deploy-rabbitmq.sh [options]

Options:
  --skip-pull  Do not pull images before starting.
  -h, --help   Show this help.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --skip-pull)
      SKIP_PULL=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH." >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is not installed." >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example."
fi

set -a
# shellcheck disable=SC1091
. ./.env
set +a

RABBITMQ_AMQP_PORT="${RABBITMQ_AMQP_PORT:-5672}"
RABBITMQ_MANAGEMENT_PORT="${RABBITMQ_MANAGEMENT_PORT:-15672}"
RABBITMQ_PROMETHEUS_PORT="${RABBITMQ_PROMETHEUS_PORT:-15692}"

echo "==> validating docker compose"
"${COMPOSE[@]}" config >/dev/null

if [ "$SKIP_PULL" -eq 0 ]; then
  echo "==> pulling RabbitMQ images"
  "${COMPOSE[@]}" pull
fi

echo "==> starting RabbitMQ"
"${COMPOSE[@]}" up -d

echo "==> waiting for RabbitMQ health check"
for _ in $(seq 1 45); do
  status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' ping-rabbitmq 2>/dev/null || true)"
  if [ "$status" = "healthy" ]; then
    break
  fi
  if [ "$status" = "unhealthy" ] || [ "$status" = "exited" ] || [ "$status" = "dead" ]; then
    echo "RabbitMQ entered state: $status" >&2
    docker logs --tail 100 ping-rabbitmq >&2 || true
    exit 1
  fi
  sleep 2
done

status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' ping-rabbitmq 2>/dev/null || true)"
if [ "$status" != "healthy" ]; then
  echo "RabbitMQ did not become healthy; current state: ${status:-unknown}" >&2
  docker logs --tail 100 ping-rabbitmq >&2 || true
  exit 1
fi

if ! docker exec ping-rabbitmq rabbitmq-plugins list -e | grep -q '^\[E.\].*rabbitmq_prometheus'; then
  echo "rabbitmq_prometheus is not enabled." >&2
  exit 1
fi

if command -v curl >/dev/null 2>&1; then
  if ! curl -fsS "http://127.0.0.1:${RABBITMQ_PROMETHEUS_PORT}/metrics" >/dev/null; then
    echo "RabbitMQ is healthy, but its Prometheus metrics endpoint is unavailable." >&2
    exit 1
  fi
fi

echo "==> current services"
"${COMPOSE[@]}" ps

cat <<EOF

Deployment finished.

AMQP:       SERVER_IP:${RABBITMQ_AMQP_PORT}
Management: http://SERVER_IP:${RABBITMQ_MANAGEMENT_PORT}
Metrics:    http://SERVER_IP:${RABBITMQ_PROMETHEUS_PORT}/metrics
EOF
