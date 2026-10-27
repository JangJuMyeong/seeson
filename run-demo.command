#!/bin/sh
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then
  exec node scripts/serve.mjs
elif command -v python3 >/dev/null 2>&1; then
  printf '%s\n' 'Open http://127.0.0.1:4173/?lang=ko (or zh / en). Press Ctrl+C to stop.'
  exec python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
else
  printf '%s\n' 'Install Node.js 22+ or Python 3, then run again.'
  exit 1
fi
