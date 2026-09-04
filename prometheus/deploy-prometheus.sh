#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")"

WITH_CADVISOR=1
SKIP_PULL=0

usage() {
  cat <<'EOF'
Usage: ./deploy-prometheus.sh [options]

Options:
  --without-cadvisor  Do not start cAdvisor.
  --skip-pull         Do not pull images before starting.
  -h, --help          Show this help.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --without-cadvisor)
      WITH_CADVISOR=0
      ;;
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
  if [ ! -f .env.example ]; then
    echo ".env.example not found. Cannot initialize .env." >&2
    exit 1
  fi

  cp .env.example .env
  echo "Created .env from .env.example. Edit .env if ports or public URL need changes."
fi

set -a
# shellcheck disable=SC1091
. ./.env
set +a

PROMETHEUS_PORT="${PROMETHEUS_PORT:-9090}"
GRAFANA_PORT="${GRAFANA_PORT:-3001}"
GRAFANA_ROOT_URL="${GRAFANA_ROOT_URL:-http://YOUR_SERVER_IP:3001}"

OS="$(uname -s)"

echo "==> detected operating system: ${OS}"

# macOS Docker Desktop cannot provide the Linux mount propagation
# required by node-exporter/cAdvisor.
if [ "$OS" = "Darwin" ]; then
  echo "==> macOS development environment detected"
  echo "==> node-exporter and cAdvisor will be skipped"

  WITH_NODE_EXPORTER=0
  WITH_CADVISOR=0
else
  WITH_NODE_EXPORTER=1
fi

echo "==> validating docker compose"
"${COMPOSE[@]}" config >/dev/null

CORE_SERVICES=(prometheus grafana)
ALL_SERVICES=(prometheus grafana)

if [ "$WITH_NODE_EXPORTER" -eq 1 ]; then
  CORE_SERVICES+=(node-exporter)
  ALL_SERVICES+=(node-exporter)
fi

if [ "$WITH_CADVISOR" -eq 1 ]; then
  ALL_SERVICES+=(cadvisor)
fi

if [ "$SKIP_PULL" -eq 0 ]; then
  echo "==> pulling core images"
  "${COMPOSE[@]}" pull "${CORE_SERVICES[@]}"

  if [ "$WITH_CADVISOR" -eq 1 ]; then
    echo "==> pulling cAdvisor image"

    if ! "${COMPOSE[@]}" pull cadvisor; then
      cat <<'EOF'

cAdvisor image pull failed.
Prometheus and Grafana can still be deployed now.

Retry later, change CADVISOR_IMAGE in .env, or run:
  ./deploy-prometheus.sh --without-cadvisor
EOF

      WITH_CADVISOR=0
      ALL_SERVICES=(prometheus grafana)

      if [ "$WITH_NODE_EXPORTER" -eq 1 ]; then
        ALL_SERVICES+=(node-exporter)
      fi
    fi
  fi
fi

echo "==> starting Prometheus stack"

"${COMPOSE[@]}" up -d "${ALL_SERVICES[@]}"

echo "==> current services"
"${COMPOSE[@]}" ps

cat <<EOF

Deployment finished.

Operating system: ${OS}

Prometheus: http://SERVER_IP:${PROMETHEUS_PORT}
Grafana:    http://SERVER_IP:${GRAFANA_PORT}
Grafana default account: admin / admin123456
Grafana root URL from .env: ${GRAFANA_ROOT_URL}

Node exporter: $(
  if [ "$WITH_NODE_EXPORTER" -eq 1 ]; then
    echo "enabled"
  else
    echo "disabled"
  fi
)

cAdvisor: $(
  if [ "$WITH_CADVISOR" -eq 1 ]; then
    echo "enabled"
  else
    echo "disabled"
  fi
)

If the panel cannot be accessed externally, check the server firewall
and cloud security group ports:
  ${PROMETHEUS_PORT}, ${GRAFANA_PORT}
EOF