#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"

GO_BIN="${GO_BIN:-$(command -v go)}"
AGENT_BIN="${PING_AGENT_BIN:-/tmp/ping-agent-${UID}}"
CONFIG_FILE="${PING_AGENT_CONFIG_FILE:-blackbox.yml}"
MASTER_URL="${PING_AGENT_MASTER_URL:-http://localhost:8080}"
AGENT_UUID="${PING_AGENT_UUID:-dfc9f4e4-d595-4cca-a0c1-2b2acc0986d0}"
RETRY_INTERVAL="${PING_AGENT_RETRY_INTERVAL:-30s}"

"$GO_BIN" build -o "$AGENT_BIN" .

agent_env=(
  "PING_AGENT_ENABLED=true"
  "PING_AGENT_MASTER_URL=$MASTER_URL"
  "PING_AGENT_UUID=$AGENT_UUID"
  "PING_AGENT_RETRY_INTERVAL=$RETRY_INTERVAL"
)
agent_command=("$AGENT_BIN" "--config.file=$CONFIG_FILE")

if [[ "$EUID" -eq 0 ]]; then
  exec env "${agent_env[@]}" "${agent_command[@]}"
fi

printf 'Traceroute requires a privileged raw ICMP socket; requesting sudo for the Agent process.\n' >&2
exec sudo env "${agent_env[@]}" "${agent_command[@]}"
