#!/usr/bin/env python3
"""
Environment Setup Script
========================

Sets up the development environment for Nexural Backtesting System.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path


def run_command(cmd, description=""):
    """Run a command and handle errors gracefully."""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"   ✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"   ❌ {description} failed: {e.stderr}")
        return False


def check_python_version():
    """Check if Python version is compatible."""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True


def install_dependencies():
    """Install project dependencies."""
    print("\n📦 Installing Dependencies")
    print("=" * 30)
    
    # Upgrade pip
    run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip")
    
    # Install main dependencies
    run_command(f"{sys.executable} -m pip install -r requirements.txt", "Installing main dependencies")
    
    # Install package in development mode
    run_command(f"{sys.executable} -m pip install -e .", "Installing package in development mode")
    
    # Install development dependencies
    run_command(f"{sys.executable} -m pip install pytest pytest-cov black flake8 mypy", "Installing development tools")


def run_tests():
    """Run basic tests to verify installation."""
    print("\n🧪 Running Basic Tests")
    print("=" * 25)
    
    # Quick smoke test
    test_code = """
import sys
sys.path.insert(0, 'src')

try:
    from nexural_backtesting import ReliableBacktestEngine, BacktestConfig
    print('✅ Core imports working')
    
    engine = ReliableBacktestEngine()
    print('✅ Engine initialization working')
    
    print('✅ All basic tests passed!')
except Exception as e:
    print(f'❌ Test failed: {e}')
    sys.exit(1)
"""
    
    with open('temp_test.py', 'w') as f:
        f.write(test_code)
    
    success = run_command(f"{sys.executable} temp_test.py", "Running smoke tests")
    
    # Cleanup
    if os.path.exists('temp_test.py'):
        os.remove('temp_test.py')
    
    return success


def setup_pre_commit_hooks():
    """Setup pre-commit hooks for code quality."""
    print("\n🔗 Setting Up Pre-commit Hooks")
    print("=" * 35)
    
    # Install pre-commit
    run_command(f"{sys.executable} -m pip install pre-commit", "Installing pre-commit")
    
    # Create pre-commit config
    pre_commit_config = """
repos:
  - repo: https://github.com/psf/black
    rev: 23.7.0
    hooks:
      - id: black
        language_version: python3
        
  - repo: https://github.com/PyCQA/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: [--max-line-length=88, --extend-ignore=E203,W503]
        
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.5.1
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
"""
    
    with open('.pre-commit-config.yaml', 'w') as f:
        f.write(pre_commit_config.strip())
    
    # Install hooks
    run_command("pre-commit install", "Installing pre-commit hooks")


def create_dev_config():
    """Create development configuration."""
    print("\n⚙️ Creating Development Configuration")
    print("=" * 40)
    
    # Create local config directory
    config_dir = Path("config")
    config_dir.mkdir(exist_ok=True)
    
    dev_config = """
# Development Configuration
# ========================

# Logging level (DEBUG, INFO, WARNING, ERROR)
LOG_LEVEL = "INFO"

# Performance settings
ENABLE_PROFILING = False
ENABLE_CACHING = True

# Test settings
TEST_DATA_PATH = "tests/data"
PERFORMANCE_BASELINE = 100000  # rows/sec

# Dashboard settings
DASHBOARD_PORT = 8501
DASHBOARD_HOST = "localhost"
"""
    
    with open(config_dir / "dev_config.py", 'w') as f:
        f.write(dev_config.strip())
    
    print("   ✅ Development configuration created")


def main():
    """Main setup routine."""
    print("🚀 Nexural Backtesting System - Setup")
    print("=" * 45)
    print("Setting up development environment...\n")
    
    # Check requirements
    if not check_python_version():
        sys.exit(1)
    
    print(f"💻 Platform: {platform.system()} {platform.release()}")
    print(f"📁 Working Directory: {os.getcwd()}")
    
    # Run setup steps
    steps = [
        install_dependencies,
        run_tests, 
        setup_pre_commit_hooks,
        create_dev_config,
    ]
    
    for step in steps:
        if not step():
            print(f"\n❌ Setup failed at step: {step.__name__}")
            sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 SETUP COMPLETED SUCCESSFULLY!")
    print("=" * 50)
    print("\n✅ Next steps:")
    print("   1. Run tests: python -m pytest tests/")
    print("   2. Start dashboard: streamlit run examples/interactive_dashboard.py")  
    print("   3. Try examples: python examples/basic_backtest.py")
    print("   4. Read documentation: docs/")
    print("\n🏆 Your institutional-grade backtesting system is ready!")


if __name__ == "__main__":
    main()
