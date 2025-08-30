"""
Create professional desktop shortcut for Nexural Testing Engine
"""

import os
import sys
from pathlib import Path
import winshell
from win32com.client import Dispatch

def create_desktop_shortcut():
    """Create a professional desktop shortcut with icon"""
    
    desktop = winshell.desktop()
    path = os.path.join(desktop, "Nexural Testing Engine.lnk")
    
    # Get paths
    target = str(Path.cwd() / "Launch Backtesting App.bat")
    working_dir = str(Path.cwd())
    icon_path = str(Path.cwd() / "nexural_icon.ico")
    
    # Create shortcut
    shell = Dispatch('WScript.Shell')
    shortcut = shell.CreateShortCut(path)
    shortcut.Targetpath = target
    shortcut.WorkingDirectory = working_dir
    shortcut.IconLocation = icon_path if os.path.exists(icon_path) else target
    shortcut.Description = "Nexural Testing Engine - Professional AI-Powered Trading Platform"
    shortcut.save()
    
    print(f"""
✅ Desktop shortcut created successfully!

📍 Location: {path}
🎯 Target: {target}
📁 Working Directory: {working_dir}

You can now launch Nexural Testing Engine from your desktop!
    """)
    
    return path

if __name__ == "__main__":
    try:
        shortcut_path = create_desktop_shortcut()
        print(f"✅ Success! Shortcut created at: {shortcut_path}")
    except Exception as e:
        print(f"❌ Error creating shortcut: {e}")
        print("\n💡 Try running as administrator or create shortcut manually")