@echo off
echo 🚀 NEXURAL PLATFORM - QUICK FIX VERSION
echo =======================================

cd "C:\Users\Jason\OneDrive\Desktop\Nexural Backtesting\nexus-quantum-frontend\nexus-quantum-terminal"

echo 📁 Directory: %CD%
echo 🧹 Cleaning build cache...
rmdir /s /q .next 2>nul

echo 🔧 Starting simplified server (no AI dependencies)...
echo 🌐 Will be available at: http://localhost:3075
echo.

set SKIP_AI_IMPORTS=true
npx next dev --port 3075

pause
