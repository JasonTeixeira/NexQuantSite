@echo off
title Nexural Terminal Integration System
color 0A
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         NEXURAL TERMINAL INTEGRATION SYSTEM                  ║
echo ║                                                              ║
echo ║  🤖 AI-Powered Dependency Management & System Updates       ║
echo ║  📊 Real-Time Monitoring • Smart Suggestions • Auto-Updates ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
REM Check if Python is installed
echo 🔍 Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo.
    echo 💡 Please install Python 3.8+ from python.org
    echo 💡 Make sure to check "Add Python to PATH" during installation
    echo.
    echo 📥 Download from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
echo ✅ Python detected
echo.
REM Check if terminal integration is initialized
if not exist "terminal\config\settings.json" (
    echo 🔧 Terminal integration not initialized. Running initialization...
    python terminal/nexural_cli.py init
    if errorlevel 1 (
        echo ❌ Initialization failed
        pause
        exit /b 1
    )
    echo.
)
echo 🚀 Starting Nexural Terminal Integration System...
echo.
echo 📋 Available Commands:
echo   nexural status     - Show system health
echo   nexural suggest    - Get AI suggestions
echo   nexural update     - Update system
echo   nexural metrics    - Show metrics
echo   nexural optimize   - Optimize system
echo.
echo 💡 Type 'nexural --help' for more options
echo.
REM Launch the CLI
python terminal/nexural_cli.py
if errorlevel 1 (
    echo.
    echo ❌ Terminal integration failed
    echo 💡 Check the error messages above
    pause
    exit /b 1
)
echo.
echo ✅ Terminal integration completed successfully!
pause
