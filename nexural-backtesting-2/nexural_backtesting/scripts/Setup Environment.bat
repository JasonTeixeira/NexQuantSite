@echo off
title Nexural Backtesting Engine - Environment Setup
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         NEXURAL BACKTESTING ENGINE - ENVIRONMENT SETUP       ║
echo ║                                                              ║
echo ║  🚀 Setting up enterprise quantitative backtesting engine    ║
echo ║  🤖 AI/ML Integration • Risk Management • Strategy Dev       ║
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

REM Run the setup script
echo 🚀 Running environment setup...
python scripts/setup_environment.py

if errorlevel 1 (
    echo.
    echo ❌ Environment setup failed
    echo 💡 Check the error messages above
    echo 💡 Check setup.log for detailed information
    pause
    exit /b 1
)

echo.
echo ✅ Environment setup completed successfully!
echo.
echo 🎉 Nexural Backtesting Engine is ready to use!
echo.
echo 📋 Next steps:
echo    1. Configure API keys in .env file
echo    2. Run: python apps/main.py
echo    3. Or run: python scripts/launch_app.py
echo    4. Check logs/ directory for detailed logs
echo.
pause
