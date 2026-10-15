@echo off
title Chaos Red Tide - Site Server
cd /d "%~dp0"
set "PATH=D:\node.js;%PATH%"
echo.
echo  Starting Chaos Red Tide site server...
echo  When ready, open http://localhost:3000 in your browser.
echo  Closing this window stops the server.
echo.
npm run dev
echo.
echo  Server stopped, or failed to start (see messages above).
pause
