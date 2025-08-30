@echo off
title Nexural Testing Engine - AI-Powered Desktop App
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║            NEXURAL TESTING ENGINE LAUNCHER                   ║
echo ║                                                              ║
echo ║  🧠 Starting AI-Powered Trading System...                    ║
echo ║                                                              ║
echo ║  Multi-AI Ensemble Backtesting Platform v1.0                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo 💡 Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo ✅ Python detected
echo 🚀 Launching desktop application...
echo.

REM Launch the application
python launch_app.py

if errorlevel 1 (
    echo.
    echo ❌ Application failed to start
    echo 💡 Check the error messages above
    pause
    exit /b 1
)

echo.
echo ✅ Application closed successfully
pause