#!/usr/bin/env bash
# Serve the game locally (HTTP required; file:// will break module loading).
PORT="${1:-8080}"
python3 -m http.server "$PORT" --bind 0.0.0.0
