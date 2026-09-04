#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")"

echo "==> checking old RabbitMQ boot definitions"
if grep "management.load_definitions\|definitions.json\|RABBITMQ_DEFAULT_USER=ping" docker-compose.yml rabbitmq.conf .env 2>/dev/null; then
  echo
  echo "Old RabbitMQ settings are still present. Remove the matched lines/files before starting."
  echo "Current deployment must not load definitions.json during RabbitMQ boot."
  exit 1
fi

echo "==> removing failed containers"
docker rm -f ping-rabbitmq ping-rabbitmq-init 2>/dev/null || true

echo "==> stopping compose stack and removing project volumes"
docker compose down -v --remove-orphans

echo "==> removing common stale volume names"
docker volume rm rabbitmq_rabbitmq-data ping-rabbitmq-data 2>/dev/null || true

echo "==> pulling images"
docker compose pull

echo "==> starting RabbitMQ"
docker compose up -d

echo "==> current services"
docker compose ps

echo
echo "RabbitMQ management: http://SERVER_IP:15672"
echo "RabbitMQ metrics:    http://SERVER_IP:15692/metrics"
echo "Default account: guest / guest"
