#!/usr/bin/env bash

set -euo pipefail

IMAGE_SOURCE="${PING_AGENT_IMAGE_SOURCE:-${1:-}}"
MASTER_URL="${PING_AGENT_MASTER_URL:-${2:-}}"
AGENT_UUID="${PING_AGENT_UUID:-${3:-}}"
IMAGE_NAME="${PING_AGENT_IMAGE_NAME:-ping-agent:latest}"
CONTAINER_NAME="${PING_AGENT_CONTAINER_NAME:-ping-agent}"
INSTALL_DIR="${PING_AGENT_INSTALL_DIR:-/opt/ping-agent}"
HOST_UUID_FILE="${PING_AGENT_HOST_UUID_FILE:-/etc/ping-agent/uuid}"

if [[ -z "$IMAGE_SOURCE" || -z "$MASTER_URL" ]]; then
  printf 'Usage: %s <image.tar.gz path-or-url> <controller-url> [node-uuid]\n' "$0" >&2
  exit 1
fi

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
else
  SUDO="sudo"
fi

$SUDO install -d -m 0755 "$INSTALL_DIR"
ARCHIVE_FILE="$INSTALL_DIR/ping-agent.tar.gz"

if [[ -n "$AGENT_UUID" ]]; then
  $SUDO install -d -m 0755 "$(dirname "$HOST_UUID_FILE")"
  printf '%s\n' "$AGENT_UUID" | $SUDO tee "$HOST_UUID_FILE" >/dev/null
  $SUDO chmod 0644 "$HOST_UUID_FILE"
elif ! $SUDO test -s "$HOST_UUID_FILE"; then
  printf 'Agent UUID file %s does not exist; provide node-uuid for the first deployment.\n' "$HOST_UUID_FILE" >&2
  exit 1
fi

case "$IMAGE_SOURCE" in
  http://*|https://*) $SUDO curl -fL --retry 3 "$IMAGE_SOURCE" -o "$ARCHIVE_FILE" ;;
  *) $SUDO cp "$IMAGE_SOURCE" "$ARCHIVE_FILE" ;;
esac

$SUDO gzip -dc "$ARCHIVE_FILE" | $SUDO docker load
$SUDO docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
$SUDO docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --cap-add NET_RAW \
  --sysctl net.ipv4.ping_group_range="0 2147483647" \
  -p 9115:9115 \
  -v "$HOST_UUID_FILE:/etc/ping-agent/uuid:ro" \
  -e PING_AGENT_ENABLED=true \
  -e "PING_AGENT_MASTER_URL=$MASTER_URL" \
  -e PING_AGENT_UUID_FILE=/etc/ping-agent/uuid \
  "$IMAGE_NAME"

$SUDO docker ps --filter "name=^/${CONTAINER_NAME}$"
