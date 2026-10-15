@echo off
cd /d "%~dp0"
title Chaos Red Tide - Local Preview

echo.
echo   ============================================
echo    Chaos Red Tide - Local Preview Server
echo   ============================================
echo.

if not exist "node_modules\next\dist\bin\next" (
  echo   [ERROR] node_modules folder not found.
  echo   Please run "npm install" in this folder first.
  echo.
  pause
  exit /b 1
)

set "NODE_EXE=node"
if exist "D:\node.js\node.exe" set "NODE_EXE=D:\node.js\node.exe"

echo   Address : http://localhost:3210
echo   Stop    : press Ctrl+C, or just close this window
echo   Note    : keep this window open while browsing
echo.
echo   The browser will open automatically in a few seconds...
echo.

start "" cmd /c "timeout /t 8 /nobreak >nul && start http://localhost:3210"

"%NODE_EXE%" ".\node_modules\next\dist\bin\next" dev -p 3210

echo.
echo   Server stopped.
echo.
pause
