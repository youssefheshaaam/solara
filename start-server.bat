@echo off
echo ========================================
echo    SOLARA Fashion Store Server
echo ========================================
echo.
echo Starting server...
echo.
cd /d "%~dp0server"
npm run dev
pause

