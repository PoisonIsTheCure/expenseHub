#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.dev.yml"

cleanup() {
  echo ""
  echo "Stopping development containers..."
  (cd "$ROOT_DIR" && docker compose -f "$COMPOSE_FILE" down)
}

trap cleanup EXIT INT TERM

echo "Starting development stack with docker-compose.dev.yml..."
(cd "$ROOT_DIR" && docker compose -f "$COMPOSE_FILE" up --build)
