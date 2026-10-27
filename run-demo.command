#!/bin/zsh
set -eu
cd "$(dirname "$0")"
print '시선 데모: http://127.0.0.1:4173'
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
