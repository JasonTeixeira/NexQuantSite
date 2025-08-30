#!/usr/bin/env python3
"""
Comprehensive Environment Setup Script for Nexural Backtesting Engine

This script sets up the complete development environment including:
- Python installation check
- Dependencies installation
- Environment configuration
- Test suite execution
"""

import subprocess
import sys
import os
import platform
from pathlib import Path
import logging
import json

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('setup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def check_python_installation():
    """Check if Python is properly installed"""
    logger.info("🔍 Checking Python installation...")
    
    try:
        # Check Python version
        result = subprocess.run([sys.executable, '--version'], 
                              capture_output=True, text=True, check=True)
        logger.info(f"✅ Python found: {result.stdout.strip()}")
        
        # Check pip
        result = subprocess.run([sys.executable, '-m', 'pip', '--version'], 
                              capture_output=True, text=True, check=True)
        logger.info(f"✅ pip found: {result.stdout.strip()}")
        
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Python check failed: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        return False


def install_dependencies():
    """Install all required dependencies"""
    logger.info("📦 Installing dependencies...")
    
    try:
        # Upgrade pip first
        subprocess.run([sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'], 
                      check=True, capture_output=True)
        logger.info("✅ pip upgraded")
        
        # Install core dependencies
        requirements_file = Path(__file__).parent.parent / 'requirements.txt'
        if requirements_file.exists():
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)], 
                          check=True, capture_output=True)
            logger.info("✅ Core dependencies installed")
        else:
            logger.error("❌ requirements.txt not found")
            return False
        
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Dependency installation failed: {e}")
        return False


def setup_environment():
    """Set up environment configuration"""
    logger.info("⚙️ Setting up environment...")
    
    try:
        # Create .env file if it doesn't exist
        env_file = Path(__file__).parent.parent / '.env'
        env_example = Path(__file__).parent.parent / 'env.example'
        
        if not env_file.exists() and env_example.exists():
            import shutil
            shutil.copy(env_example, env_file)
            logger.info("✅ Created .env file from template")
        
        # Create necessary directories
        directories = ['logs', 'data', 'data/cache']
        for dir_name in directories:
            dir_path = Path(__file__).parent.parent / dir_name
            dir_path.mkdir(exist_ok=True)
            logger.info(f"✅ Created directory: {dir_name}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Environment setup failed: {e}")
        return False


def run_tests():
    """Run the comprehensive test suite"""
    logger.info("🧪 Running test suite...")
    
    try:
        # Add src to Python path
        src_path = Path(__file__).parent.parent / 'src'
        sys.path.insert(0, str(src_path))
        
        # Run tests
        test_results = {}
        
        # Test each phase
        for phase in range(5):
            test_file = Path(__file__).parent.parent / 'tests' / f'test_phase{phase}.py'
            if test_file.exists():
                logger.info(f"Running Phase {phase} tests...")
                try:
                    result = subprocess.run([sys.executable, str(test_file)], 
                                          capture_output=True, text=True, timeout=300)
                    test_results[f'phase_{phase}'] = result.returncode == 0
                    if result.returncode == 0:
                        logger.info(f"✅ Phase {phase} tests passed")
                    else:
                        logger.warning(f"⚠️ Phase {phase} tests had issues")
                        logger.debug(f"Output: {result.stdout}")
                        logger.debug(f"Errors: {result.stderr}")
                except subprocess.TimeoutExpired:
                    logger.warning(f"⚠️ Phase {phase} tests timed out")
                    test_results[f'phase_{phase}'] = False
                except Exception as e:
                    logger.error(f"❌ Phase {phase} tests failed: {e}")
                    test_results[f'phase_{phase}'] = False
        
        return test_results
        
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return {}


def main():
    """Main setup function"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║         NEXURAL BACKTESTING ENGINE - ENVIRONMENT SETUP       ║
    ║                                                              ║
    ║  🚀 Setting up enterprise quantitative backtesting engine    ║
    ║  🤖 AI/ML Integration • Risk Management • Strategy Dev       ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    setup_steps = [
        ("Python Installation Check", check_python_installation),
        ("Dependencies Installation", install_dependencies),
        ("Environment Setup", setup_environment),
        ("Test Suite Execution", run_tests)
    ]
    
    results = {}
    
    for step_name, step_func in setup_steps:
        logger.info(f"\n{'='*60}")
        logger.info(f"STEP: {step_name}")
        logger.info(f"{'='*60}")
        
        try:
            if step_name == "Test Suite Execution":
                results[step_name] = step_func()
            else:
                results[step_name] = step_func()
                
            if results[step_name]:
                logger.info(f"✅ {step_name} completed successfully")
            else:
                logger.error(f"❌ {step_name} failed")
                
        except Exception as e:
            logger.error(f"❌ {step_name} failed with exception: {e}")
            results[step_name] = False
    
    # Summary
    print("\n" + "="*80)
    print("SETUP SUMMARY")
    print("="*80)
    
    for step_name, result in results.items():
        if step_name == "Test Suite Execution":
            if isinstance(result, dict):
                passed = sum(result.values())
                total = len(result)
                status = f"✅ {passed}/{total} test phases passed"
            else:
                status = "❌ Test execution failed"
        else:
            status = "✅ PASSED" if result else "❌ FAILED"
        
        print(f"{step_name:<30} {status}")
    
    print("\n" + "="*80)
    print("NEXT STEPS")
    print("="*80)
    print("1. Configure API keys in .env file")
    print("2. Run: python apps/main.py")
    print("3. Or run: python scripts/launch_app.py")
    print("4. Check logs/ directory for detailed logs")
    
    if all(results.values()):
        print("\n🎉 Environment setup completed successfully!")
        print("🚀 Ready to run the Nexural Backtesting Engine!")
    else:
        print("\n⚠️ Some setup steps failed. Check the logs above for details.")


if __name__ == "__main__":
    main()
