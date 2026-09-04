#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# 使用方式：
#
# OS=linux ARCH=arm64 VERSION=1.0.0 SAVE_TAR=1 ./package.sh
# OS=linux ARCH=amd64 VERSION=1.0.0 SAVE_TAR=1 ./package.sh
#
# 输出：
# ping-agent-linux-arm64.tar.gz
# ping-agent-linux-amd64.tar.gz
# ============================================================

# 默认参数
OS="${OS:-linux}"
ARCH="${ARCH:-amd64}"
VERSION="${VERSION:-dev}"

# Docker 镜像名称
IMAGE_NAME="${IMAGE_NAME:-okping-agent}"

# 导出文件名称
PACKAGE_NAME="${PACKAGE_NAME:-ping-agent}"

DOCKERFILE="${DOCKERFILE:-Dockerfile}"
BUILD_PKG="${BUILD_PKG:-.}"

# ============================================================
# 镜像名称
# ============================================================

# 版本镜像
IMAGE_TAG="${IMAGE_TAG:-${VERSION}-${OS}-${ARCH}}"
IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

# latest 镜像
LATEST_IMAGE="${IMAGE_NAME}:latest"

# ============================================================
# Go 构建
# ============================================================

BUILD_DIR=".build/${OS}-${ARCH}"

# 注意：
# 你的 Dockerfile 如果是 COPY blackbox_exporter，
# 这里就保持 blackbox_exporter
BIN_NAME="blackbox_exporter"
BIN_PATH="${BUILD_DIR}/${BIN_NAME}"

echo "=========================================="
echo "  OKPing Agent Build"
echo "=========================================="
echo "==> OS:           ${OS}"
echo "==> ARCH:         ${ARCH}"
echo "==> VERSION:      ${VERSION}"
echo "==> IMAGE:        ${IMAGE}"
echo "==> LATEST IMAGE: ${LATEST_IMAGE}"
echo "==> PACKAGE:      ${PACKAGE_NAME}-${OS}-${ARCH}.tar.gz"
echo "==> BUILD_DIR:    ${BUILD_DIR}"
echo "=========================================="

# ============================================================
# 检查必要文件
# ============================================================

if [ ! -f "${DOCKERFILE}" ]; then
  echo "ERROR: Dockerfile not found: ${DOCKERFILE}"
  exit 1
fi

if [ ! -f "blackbox.yml" ]; then
  echo "ERROR: blackbox.yml not found"
  exit 1
fi

# ============================================================
# 检查命令
# ============================================================

command -v go >/dev/null 2>&1 || {
  echo "ERROR: go command not found"
  exit 1
}

command -v docker >/dev/null 2>&1 || {
  echo "ERROR: docker command not found"
  exit 1
}

# ============================================================
# 处理 Go 架构参数
# ============================================================

GOARCH="${ARCH}"
GOARM_VALUE=""

case "${ARCH}" in
  amd64)
    GOARCH="amd64"
    ;;

  arm64)
    GOARCH="arm64"
    ;;

  armv6)
    GOARCH="arm"
    GOARM_VALUE="6"
    ;;

  armv7)
    GOARCH="arm"
    GOARM_VALUE="7"
    ;;

  386)
    GOARCH="386"
    ;;

  *)
    echo "WARN: unknown ARCH=${ARCH}, use GOARCH=${ARCH} directly"
    ;;
esac

# ============================================================
# 清理旧构建
# ============================================================

echo ""
echo "==> Cleaning old build output"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# ============================================================
# 编译 Go
# ============================================================

echo ""
echo "==> Building ${BIN_NAME}"

if [ -n "${GOARM_VALUE}" ]; then

  CGO_ENABLED=0 \
  GOOS="${OS}" \
  GOARCH="${GOARCH}" \
  GOARM="${GOARM_VALUE}" \
  go build \
    -trimpath \
    -ldflags="-s -w" \
    -o "${BIN_PATH}" \
    "${BUILD_PKG}"

else

  CGO_ENABLED=0 \
  GOOS="${OS}" \
  GOARCH="${GOARCH}" \
  go build \
    -trimpath \
    -ldflags="-s -w" \
    -o "${BIN_PATH}" \
    "${BUILD_PKG}"

fi

chmod +x "${BIN_PATH}"

echo "==> Binary built:"
ls -lh "${BIN_PATH}"

# ============================================================
# 构建 Docker 镜像
# ============================================================

echo ""
echo "==> Building docker image: ${IMAGE}"

docker build \
  --build-arg OS="${OS}" \
  --build-arg ARCH="${ARCH}" \
  -f "${DOCKERFILE}" \
  -t "${IMAGE}" \
  .

echo "==> Docker image built successfully:"
echo "    ${IMAGE}"

# ============================================================
# 创建 latest 标签
# ============================================================

echo ""
echo "==> Tagging latest image"

docker tag "${IMAGE}" "${LATEST_IMAGE}"

echo "==> Latest image:"
echo "    ${LATEST_IMAGE}"

# ============================================================
# 显示镜像
# ============================================================

echo ""
echo "==> Docker images:"

docker images "${IMAGE_NAME}" \
  --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}"

# ============================================================
# 导出 Docker 镜像
# ============================================================

if [ "${SAVE_TAR:-0}" = "1" ]; then

  TAR_NAME="${PACKAGE_NAME}-${OS}-${ARCH}.tar.gz"

  echo ""
  echo "==> Saving docker image to ${TAR_NAME}"

  # 导出 latest
  # 这样服务器 docker load 后可以直接使用：
  # okping-agent:latest
  docker save "${LATEST_IMAGE}" | gzip > "${TAR_NAME}"

  echo "==> Saved:"
  ls -lh "${TAR_NAME}"

fi

echo ""
echo "=========================================="
echo "  Build completed successfully"
echo "=========================================="
echo ""
echo "Docker image:"
echo "  ${IMAGE}"
echo "  ${LATEST_IMAGE}"

if [ "${SAVE_TAR:-0}" = "1" ]; then
  echo ""
  echo "Package:"
  echo "  ${PACKAGE_NAME}-${OS}-${ARCH}.tar.gz"
fi

echo ""
echo "==> Done"