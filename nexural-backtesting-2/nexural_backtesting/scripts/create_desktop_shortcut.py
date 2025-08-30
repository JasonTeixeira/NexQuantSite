"""
Create Desktop Shortcut for Ultimate Backtesting Engine
"""

import os
import sys
from pathlib import Path

def create_windows_shortcut():
    """Create Windows desktop shortcut"""
    try:
        import winshell
        from win32com.client import Dispatch
        
        desktop = winshell.desktop()
        path = os.path.join(desktop, "Ultimate Backtesting Engine.lnk")
        target = str(Path(__file__).parent / "Launch Backtesting App.bat")
        wDir = str(Path(__file__).parent)
        icon = target
        
        shell = Dispatch('WScript.Shell')
        shortcut = shell.CreateShortCut(path)
        shortcut.Targetpath = target
        shortcut.WorkingDirectory = wDir
        shortcut.IconLocation = icon
        shortcut.save()
        
        print(f"✅ Desktop shortcut created: {path}")
        return True
        
    except ImportError:
        print("⚠️  Windows shortcut creation requires pywin32 and winshell packages")
        print("💡 Install with: pip install pywin32 winshell")
        return False
    
    except Exception as e:
        print(f"❌ Error creating shortcut: {e}")
        return False

def create_simple_launcher():
    """Create a simple Python launcher on desktop"""
    try:
        desktop_path = Path.home() / "Desktop"
        if not desktop_path.exists():
            desktop_path = Path.home() / "OneDrive" / "Desktop"
        
        if not desktop_path.exists():
            print("❌ Could not find Desktop folder")
            return False
        
        launcher_content = f'''#!/usr/bin/env python3
"""Ultimate Backtesting Engine Desktop Launcher"""

import os
import sys
from pathlib import Path

# Change to app directory
app_dir = Path(r"{Path(__file__).parent.absolute()}")
os.chdir(app_dir)

# Add to Python path
sys.path.insert(0, str(app_dir))

# Launch the app
try:
    from desktop_app import main
    main()
except Exception as e:
    print(f"Error launching app: {{e}}")
    input("Press Enter to exit...")
'''
        
        launcher_path = desktop_path / "Ultimate Backtesting Engine.py"
        
        with open(launcher_path, 'w') as f:
            f.write(launcher_content)
        
        print(f"✅ Desktop launcher created: {launcher_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating launcher: {e}")
        return False

def main():
    """Main function"""
    print("""
🖥️  DESKTOP SHORTCUT CREATOR
═══════════════════════════

Creating desktop shortcut for Ultimate Backtesting Engine...
    """)
    
    # Try Windows shortcut first
    if sys.platform == "win32":
        if not create_windows_shortcut():
            create_simple_launcher()
    else:
        create_simple_launcher()
    
    print("""
✅ Setup complete!

📋 HOW TO USE:
1. Look for "Ultimate Backtesting Engine" on your desktop
2. Double-click to launch the application
3. Use the professional GUI interface to run backtests

🚀 Enjoy your world-class backtesting platform!
    """)

if __name__ == "__main__":
    main()