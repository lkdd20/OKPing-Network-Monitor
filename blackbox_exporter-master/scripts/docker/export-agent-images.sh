#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUTPUT_DIR="${PING_AGENT_OUTPUT_DIR:-$ROOT_DIR/dist}"
IMAGE_NAME="${PING_AGENT_IMAGE_NAME:-ping-agent:latest}"
BUILDER_NAME="${PING_BUILDX_BUILDER:-ping-agent-builder}"
BUILDKIT_IMAGE="${PING_BUILDKIT_IMAGE:-}"
GO_BUILDER_IMAGE="${PING_GO_BUILDER_IMAGE:-golang:1.25-alpine}"
ALPINE_IMAGE="${PING_ALPINE_IMAGE:-alpine:3.22}"
GOPROXY="${PING_GOPROXY:-https://proxy.golang.org,direct}"
ALPINE_REPOSITORY_MIRROR="${PING_ALPINE_REPOSITORY_MIRROR:-}"

mkdir -p "$OUTPUT_DIR"

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

build_archive() {
  local platform="$1"
  local architecture="$2"
  local tar_file="$OUTPUT_DIR/ping-agent-linux-${architecture}.tar"

  docker buildx build \
    --platform "$platform" \
    --file "$ROOT_DIR/Dockerfile.agent" \
    --build-arg "GO_BUILDER_IMAGE=$GO_BUILDER_IMAGE" \
    --build-arg "ALPINE_IMAGE=$ALPINE_IMAGE" \
    --build-arg "GOPROXY=$GOPROXY" \
    --build-arg "ALPINE_REPOSITORY_MIRROR=$ALPINE_REPOSITORY_MIRROR" \
    --tag "$IMAGE_NAME" \
    --provenance=false \
    --output "type=docker,dest=$tar_file" \
    "$ROOT_DIR"
  gzip -f "$tar_file"
}

build_archive linux/amd64 amd64
build_archive linux/arm64 arm64

if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$OUTPUT_DIR"/ping-agent-linux-*.tar.gz > "$OUTPUT_DIR/SHA256SUMS"
else
  shasum -a 256 "$OUTPUT_DIR"/ping-agent-linux-*.tar.gz > "$OUTPUT_DIR/SHA256SUMS"
fi

printf 'Offline Agent images created in %s\n' "$OUTPUT_DIR"
printf '  %s\n' "$OUTPUT_DIR/ping-agent-linux-amd64.tar.gz"
printf '  %s\n' "$OUTPUT_DIR/ping-agent-linux-arm64.tar.gz"
