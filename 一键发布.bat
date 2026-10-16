@echo off
cd /d "%~dp0"
title Chaos Red Tide - Publish

set "NODE_EXE=node"
if exist "D:\node.js\node.exe" set "NODE_EXE=D:\node.js\node.exe"

echo.
echo   =====================================================
echo    Chaos Red Tide - Publish  (GitHub + CN mirror)
echo   =====================================================
echo.
echo    Before starting, please CLOSE the local preview window
echo    (the one opened by start-site.bat), or the build may fail.
echo.

if not exist "scripts\publish.mjs" (
  echo   [ERROR] scripts\publish.mjs not found.
  pause
  exit /b 1
)

"%NODE_EXE%" "scripts\publish.mjs"
set "CODE=%errorlevel%"

echo.
if not "%CODE%"=="0" echo   [FAILED] Please screenshot this window and send it to the assistant.
echo.
pause
exit /b %CODE%
