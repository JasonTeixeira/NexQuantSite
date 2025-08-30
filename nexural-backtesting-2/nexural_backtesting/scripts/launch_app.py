"""
Ultimate Backtesting Engine - Desktop App Launcher
Simple launcher script for the desktop application
"""

import sys
import os
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'tkinter', 'matplotlib', 'pandas', 'numpy', 'psutil'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'tkinter':
                import tkinter
            elif package == 'matplotlib':
                import matplotlib
            elif package == 'pandas':
                import pandas
            elif package == 'numpy':
                import numpy
            elif package == 'psutil':
                import psutil
        except ImportError:
            missing_packages.append(package)
    
    return missing_packages

def install_missing_packages(packages):
    """Install missing packages"""
    print(f"Installing missing packages: {', '.join(packages)}")
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ {package} installed successfully")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
            return False
    
    return True

def main():
    """Main launcher function"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║            NEXURAL TESTING ENGINE LAUNCHER                   ║
    ║                                                              ║
    ║  🧠 Starting AI-Powered Desktop Application...               ║
    ║                                                              ║
    ║  Professional AI Trading System v1.0                        ║
    ║  Multi-AI Ensemble Backtesting Platform                     ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Check dependencies
    print("🔍 Checking dependencies...")
    missing = check_dependencies()
    
    if missing:
        print(f"⚠️  Missing packages detected: {', '.join(missing)}")
        
        install_choice = input("📦 Install missing packages? (y/n): ").lower().strip()
        if install_choice == 'y':
            if not install_missing_packages(missing):
                print("❌ Failed to install some packages. Please install manually.")
                return
        else:
            print("❌ Cannot start application without required packages.")
            return
    
    print("✅ All dependencies satisfied!")
    
    # Launch desktop app
    try:
        print("🧠 Launching Nexural Testing Engine Desktop App...")
        
        # Import and run the professional desktop app
        from nexural_pro import main as run_app
        run_app()
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure desktop_app.py is in the same directory")
    
    except Exception as e:
        print(f"❌ Error launching application: {e}")
        print("💡 Try running 'python desktop_app.py' directly")

if __name__ == "__main__":
    main()