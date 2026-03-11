#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTO_YES=false
REINSTALL=false

for arg in "$@"; do
  case "$arg" in
    --yes|-y)
      AUTO_YES=true
      ;;
    --install|-i)
      REINSTALL=true
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: ./cleanup.sh [--yes] [--install]"
      exit 1
      ;;
  esac
done

if [ "$AUTO_YES" = false ]; then
  echo "This will delete dependency artifacts in backend and frontend:"
  echo "- node_modules"
  echo "- package-lock.json"
  read -r -p "Continue? (y/N): " answer
  case "$answer" in
    y|Y|yes|YES)
      ;;
    *)
      echo "Cleanup cancelled."
      exit 0
      ;;
  esac
fi

for app in backend frontend; do
  APP_DIR="$ROOT_DIR/$app"
  echo "Cleaning $app..."
  rm -rf "$APP_DIR/node_modules"
  rm -f "$APP_DIR/package-lock.json"
done

echo "Cleanup complete."

if [ "$REINSTALL" = true ]; then
  for app in backend frontend; do
    echo "Installing $app dependencies..."
    (cd "$ROOT_DIR/$app" && npm install)
  done
  echo "Reinstall complete."
fi
