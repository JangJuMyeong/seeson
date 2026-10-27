@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:4173/?lang=zh in your browser.
python -m http.server 4173 --bind 127.0.0.1 --directory dist
pause
