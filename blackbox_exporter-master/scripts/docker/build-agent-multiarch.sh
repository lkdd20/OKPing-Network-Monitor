#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
IMAGE="${1:-${PING_AGENT_IMAGE:-}}"
BUILDER_NAME="${PING_BUILDX_BUILDER:-ping-agent-builder}"
BUILDKIT_IMAGE="${PING_BUILDKIT_IMAGE:-}"
GO_BUILDER_IMAGE="${PING_GO_BUILDER_IMAGE:-golang:1.25-alpine}"
ALPINE_IMAGE="${PING_ALPINE_IMAGE:-alpine:3.22}"
GOPROXY="${PING_GOPROXY:-https://proxy.golang.org,direct}"
ALPINE_REPOSITORY_MIRROR="${PING_ALPINE_REPOSITORY_MIRROR:-}"

if [[ -z "$IMAGE" ]]; then
  printf 'Usage: %s <registry/image:tag>\n' "$0" >&2
  printf 'Example: %s registry.example.com/ping/agent:1.0.0\n' "$0" >&2
  exit 1
fi

if ! docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1; then
  create_args=(docker buildx create --name "$BUILDER_NAME" --driver docker-container --use)
  if [[ -n "$BUILDKIT_IMAGE" ]]; then
    create_args+=(--driver-opt "image=$BUILDKIT_IMAGE")
  fi
  "${create_args[@]}"
else
  docker buildx use "$BUILDER_NAME"
fi

docker buildx inspect --bootstrap >/dev/null
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file "$ROOT_DIR/Dockerfile.agent" \
  --build-arg "GO_BUILDER_IMAGE=$GO_BUILDER_IMAGE" \
  --build-arg "ALPINE_IMAGE=$ALPINE_IMAGE" \
  --build-arg "GOPROXY=$GOPROXY" \
  --build-arg "ALPINE_REPOSITORY_MIRROR=$ALPINE_REPOSITORY_MIRROR" \
  --tag "$IMAGE" \
  --provenance=false \
  --push \
  "$ROOT_DIR"

printf 'Published multi-architecture Agent image: %s\n' "$IMAGE"
