@echo off
echo 🚀 NEXURAL PLATFORM - STARTING ON PORT 3075
echo =============================================

REM Change to the correct directory
cd "C:\Users\Jason\OneDrive\Desktop\Nexural Backtesting\nexus-quantum-frontend\nexus-quantum-terminal"

REM Show current directory
echo 📁 Current Directory: %CD%

REM Check if package.json exists
if exist "package.json" (
    echo ✅ package.json found
) else (
    echo ❌ package.json NOT found - wrong directory!
    pause
    exit /b 1
)

REM Kill existing node processes
taskkill /f /im node.exe >nul 2>&1

REM Start the server
echo.
echo 🚀 Starting Next.js server on port 3075...
echo Press Ctrl+C to stop the server
echo.

npx next dev --port 3075

pause
