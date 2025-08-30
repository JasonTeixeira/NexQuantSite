#!/usr/bin/env python3
"""
Comprehensive Installation Script for Enterprise Quantitative Backtesting Engine

This script installs all required dependencies and sets up the environment
for institutional-grade quantitative backtesting.
"""

import subprocess
import sys
import os
import platform
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def run_command(command: str, description: str) -> bool:
    """Run a command and handle errors"""
    logger.info(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        logger.info(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"✗ {description} failed: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False


def check_python_version():
    """Check Python version compatibility"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        logger.error("Python 3.8 or higher is required")
        sys.exit(1)
    
    logger.info(f"✓ Python {version.major}.{version.minor}.{version.micro} detected")


def install_core_dependencies():
    """Install core Python dependencies"""
    logger.info("Installing core dependencies...")
    
    # Core data science packages
    packages = [
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "scipy>=1.10.0",
        "scikit-learn>=1.3.0",
        "matplotlib>=3.7.0",
        "seaborn>=0.12.0",
        "plotly>=5.15.0"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_financial_libraries():
    """Install financial and trading libraries"""
    logger.info("Installing financial libraries...")
    
    packages = [
        "yfinance>=0.2.0",
        "ccxt>=4.0.0",
        "pyfolio>=0.9.2",
        "empyrical>=0.5.5",
        "pykalman>=0.9.5"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_machine_learning():
    """Install machine learning libraries"""
    logger.info("Installing machine learning libraries...")
    
    packages = [
        "xgboost>=1.7.0",
        "lightgbm>=4.0.0",
        "catboost>=1.2.0",
        "optuna>=3.2.0",
        "hyperopt>=0.2.7"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_deep_learning():
    """Install deep learning libraries"""
    logger.info("Installing deep learning libraries...")
    
    # Install PyTorch (CPU version for compatibility)
    if not run_command("pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu", 
                      "Installing PyTorch"):
        return False
    
    # Install TensorFlow
    if not run_command("pip install tensorflow>=2.13.0", "Installing TensorFlow"):
        return False
    
    # Install transformers
    if not run_command("pip install transformers>=4.30.0", "Installing Transformers"):
        return False
    
    return True


def install_optimization_libraries():
    """Install optimization libraries"""
    logger.info("Installing optimization libraries...")
    
    packages = [
        "cvxpy>=1.3.0",
        "cvxopt>=1.3.0",
        "pulp>=2.7.0",
        "ortools>=9.6.0"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_database_libraries():
    """Install database libraries"""
    logger.info("Installing database libraries...")
    
    packages = [
        "sqlalchemy>=2.0.0",
        "pymongo>=4.4.0",
        "redis>=4.6.0",
        "influxdb>=5.3.0"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_api_libraries():
    """Install API and web service libraries"""
    logger.info("Installing API libraries...")
    
    packages = [
        "requests>=2.31.0",
        "aiohttp>=3.8.0",
        "websockets>=11.0.0",
        "fastapi>=0.100.0",
        "uvicorn>=0.23.0"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_visualization_libraries():
    """Install visualization libraries"""
    logger.info("Installing visualization libraries...")
    
    packages = [
        "bokeh>=3.2.0",
        "dash>=2.11.0",
        "streamlit>=1.25.0"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_testing_libraries():
    """Install testing and quality libraries"""
    logger.info("Installing testing libraries...")
    
    packages = [
        "pytest>=7.4.0",
        "pytest-cov>=4.1.0",
        "pytest-asyncio>=0.21.0",
        "black>=23.7.0",
        "flake8>=6.0.0",
        "mypy>=1.5.0"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_performance_libraries():
    """Install performance optimization libraries"""
    logger.info("Installing performance libraries...")
    
    packages = [
        "numba>=0.57.0",
        "cython>=3.0.0",
        "joblib>=1.3.0"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_utility_libraries():
    """Install utility libraries"""
    logger.info("Installing utility libraries...")
    
    packages = [
        "pyyaml>=6.0.0",
        "python-dotenv>=1.0.0",
        "structlog>=23.1.0",
        "loguru>=0.7.0",
        "tqdm>=4.65.0",
        "click>=8.1.0",
        "rich>=13.4.0",
        "colorama>=0.4.6"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True


def install_ta_lib():
    """Install TA-Lib (Technical Analysis Library)"""
    logger.info("Installing TA-Lib...")
    
    system = platform.system()
    
    if system == "Windows":
        # For Windows, download and install from wheel
        if not run_command("pip install TA-Lib", "Installing TA-Lib for Windows"):
            logger.warning("TA-Lib installation failed. You may need to install it manually.")
            return False
    elif system == "Darwin":  # macOS
        # For macOS, use Homebrew
        if not run_command("brew install ta-lib", "Installing TA-Lib via Homebrew"):
            logger.warning("TA-Lib installation failed. You may need to install it manually.")
            return False
        if not run_command("pip install TA-Lib", "Installing TA-Lib Python wrapper"):
            return False
    else:  # Linux
        # For Linux, install system dependencies first
        if not run_command("sudo apt-get install -y ta-lib", "Installing TA-Lib system package"):
            logger.warning("TA-Lib system installation failed. You may need to install it manually.")
            return False
        if not run_command("pip install TA-Lib", "Installing TA-Lib Python wrapper"):
            return False
    
    return True


def create_directories():
    """Create necessary directories"""
    logger.info("Creating project directories...")
    
    directories = [
        "data",
        "data/raw",
        "data/processed",
        "data/features",
        "strategies",
        "strategies/saved",
        "strategies/results",
        "risk_engines",
        "risk_engines/configs",
        "risk_engines/reports",
        "logs",
        "config",
        "config/environments",
        "tests",
        "tests/unit",
        "tests/integration",
        "docs",
        "docs/api",
        "docs/user_guides",
        "scripts",
        "notebooks"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info(f"✓ Created directory: {directory}")


def create_config_files():
    """Create default configuration files"""
    logger.info("Creating configuration files...")
    
    # Main config file
    config_content = """# Enterprise Quantitative Backtesting Engine Configuration

# Data Sources
data_sources:
  databento:
    api_key: ""
    enabled: false
  yfinance:
    enabled: true
  polygon:
    api_key: ""
    enabled: false

# Risk Management
risk_management:
  max_position_size: 0.05
  max_drawdown: 0.15
  max_var: 0.03
  emergency_stop: 0.20

# Backtesting
backtesting:
  initial_capital: 100000
  commission: 0.001
  slippage: 0.0001
  benchmark: "SPY"

# AI/ML
ai:
  openai_api_key: ""
  claude_api_key: ""
  enabled: false

# Logging
logging:
  level: "INFO"
  file: "logs/backtest.log"
  max_size: "100MB"
  backup_count: 5
"""
    
    with open("config/config.yaml", "w") as f:
        f.write(config_content)
    
    logger.info("✓ Created config/config.yaml")


def create_environment_file():
    """Create .env file template"""
    logger.info("Creating environment file...")
    
    env_content = """# Environment Variables for Enterprise Quantitative Backtesting Engine

# API Keys
DATABENTO_API_KEY=your_databento_api_key_here
POLYGON_API_KEY=your_polygon_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# Database
DATABASE_URL=sqlite:///data/backtest.db
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/backtest.log

# Trading
NINJATRADER_CONNECTION=simulation
RISK_LIMITS_ENABLED=true
EMERGENCY_STOP_THRESHOLD=0.20
"""
    
    with open(".env.template", "w") as f:
        f.write(env_content)
    
    logger.info("✓ Created .env.template")


def run_tests():
    """Run basic tests to verify installation"""
    logger.info("Running installation tests...")
    
    test_script = """
import sys
import pandas as pd
import numpy as np
import scipy
import sklearn
import matplotlib
import plotly
import yfinance
import xgboost
import torch
import tensorflow as tf
import cvxpy
import sqlalchemy
import fastapi
import pytest

print("✓ All core libraries imported successfully")
print(f"Python version: {sys.version}")
print(f"Pandas version: {pd.__version__}")
print(f"NumPy version: {np.__version__}")
print(f"Scikit-learn version: {sklearn.__version__}")
"""
    
    with open("test_installation.py", "w") as f:
        f.write(test_script)
    
    if run_command("python test_installation.py", "Testing installation"):
        logger.info("✓ Installation test passed")
        os.remove("test_installation.py")
        return True
    else:
        logger.error("✗ Installation test failed")
        return False


def main():
    """Main installation function"""
    logger.info("🚀 Starting Enterprise Quantitative Backtesting Engine Installation")
    logger.info("=" * 60)
    
    # Check Python version
    check_python_version()
    
    # Upgrade pip
    run_command("python -m pip install --upgrade pip", "Upgrading pip")
    
    # Install dependencies in order
    steps = [
        ("Core Dependencies", install_core_dependencies),
        ("Financial Libraries", install_financial_libraries),
        ("Machine Learning", install_machine_learning),
        ("Deep Learning", install_deep_learning),
        ("Optimization Libraries", install_optimization_libraries),
        ("Database Libraries", install_database_libraries),
        ("API Libraries", install_api_libraries),
        ("Visualization Libraries", install_visualization_libraries),
        ("Testing Libraries", install_testing_libraries),
        ("Performance Libraries", install_performance_libraries),
        ("Utility Libraries", install_utility_libraries),
        ("TA-Lib", install_ta_lib),
    ]
    
    failed_steps = []
    
    for step_name, step_func in steps:
        logger.info(f"\n📦 {step_name}")
        logger.info("-" * 40)
        
        if not step_func():
            failed_steps.append(step_name)
            logger.warning(f"⚠️  {step_name} installation had issues")
    
    # Create project structure
    logger.info("\n📁 Creating Project Structure")
    logger.info("-" * 40)
    create_directories()
    create_config_files()
    create_environment_file()
    
    # Run tests
    logger.info("\n🧪 Testing Installation")
    logger.info("-" * 40)
    if not run_tests():
        failed_steps.append("Installation Tests")
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("🎉 Installation Complete!")
    
    if failed_steps:
        logger.warning(f"⚠️  The following steps had issues: {', '.join(failed_steps)}")
        logger.info("You may need to install these manually or troubleshoot the issues.")
    else:
        logger.info("✅ All components installed successfully!")
    
    logger.info("\n📋 Next Steps:")
    logger.info("1. Copy .env.template to .env and add your API keys")
    logger.info("2. Configure config/config.yaml for your needs")
    logger.info("3. Run 'python -m pytest tests/' to verify everything works")
    logger.info("4. Check the documentation in docs/ for usage examples")
    
    logger.info("\n🚀 Ready to start quantitative backtesting!")


if __name__ == "__main__":
    main()
