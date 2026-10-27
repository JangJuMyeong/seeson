@echo off
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  node scripts\serve.mjs
  pause
  exit /b
)
where py >nul 2>nul
if not errorlevel 1 (
  echo Open http://127.0.0.1:4173/?lang=zh in your browser.
  py -3 -m http.server 4173 --bind 127.0.0.1 --directory dist
  pause
  exit /b
)
where python >nul 2>nul
if not errorlevel 1 (
  echo Open http://127.0.0.1:4173/?lang=zh in your browser.
  python -m http.server 4173 --bind 127.0.0.1 --directory dist
  pause
  exit /b
)
echo Install Node.js 22+ or Python 3, then run again.
pause
exit /b 1
