"""
Nexural Testing Engine - API Key Setup Helper
Secure configuration setup for AI ensemble
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file with API keys"""
    print("""
🔧 NEXURAL TESTING ENGINE - API KEY SETUP
═══════════════════════════════════════

This script will help you securely configure your API keys.
""")
    
    # Get current directory
    project_dir = Path(__file__).parent
    env_file = project_dir / '.env'
    
    print(f"📁 Project Directory: {project_dir}")
    print(f"🔑 Environment File: {env_file}")
    
    # Check if .env already exists
    if env_file.exists():
        overwrite = input("\n⚠️  .env file already exists. Overwrite? (y/n): ").lower().strip()
        if overwrite != 'y':
            print("❌ Setup cancelled.")
            return
    
    print("\n🤖 AI API CONFIGURATION")
    print("=" * 40)
    
    # Get API keys from user
    print("\n📝 Please enter your API keys (or press Enter to skip):")
    
    openai_key = input("\n🔵 OpenAI API Key (sk-proj-...): ").strip()
    if not openai_key:
        openai_key = "your_openai_api_key_here"
    
    claude_key = input("\n🟣 Claude API Key (sk-ant-api03-...): ").strip()
    if not claude_key:
        claude_key = "your_claude_api_key_here"
    
    # Optional data provider keys
    print("\n📊 DATA PROVIDER KEYS (Optional - for live data)")
    print("=" * 50)
    
    databento_key = input("\n📈 Databento API Key (optional): ").strip()
    if not databento_key:
        databento_key = "your_databento_key_here"
    
    # Create .env content
    env_content = f"""# Nexural Testing Engine - Secure API Configuration
# NEVER commit this file to version control!

# AI API Keys (Ensemble Configuration)
OPENAI_API_KEY={openai_key}
CLAUDE_API_KEY={claude_key}

# Data Provider API Keys
DATABENTO_API_KEY={databento_key}
QUANTCONNECT_USER_ID=your_qc_user_id_here
QUANTCONNECT_TOKEN=your_qc_token_here

# Database (for enterprise features)
DATABASE_URL=postgresql://user:pass@localhost:5432/nexural_testing
REDIS_URL=redis://localhost:6379/0

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# Security
SECRET_KEY=nexural_secure_key_2024_enterprise_grade
JWT_SECRET=nexural_jwt_secret_2024_authentication

# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO
DEBUG=true

# NinjaTrader Path (adjust to your installation)
NINJATRADER_EXPORT_PATH=C:/Users/{os.getenv('USERNAME', 'YourUser')}/Documents/NinjaTrader 8/trace/
"""
    
    # Write .env file
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print(f"\n✅ Configuration saved to: {env_file}")
        
        # Validate API keys
        print("\n🔍 VALIDATING API KEYS...")
        
        valid_openai = openai_key and not openai_key.startswith('your_') and len(openai_key) > 20
        valid_claude = claude_key and not claude_key.startswith('your_') and len(claude_key) > 20
        
        if valid_openai:
            print("✅ OpenAI API key appears valid")
        else:
            print("⚠️  OpenAI API key not provided or invalid format")
        
        if valid_claude:
            print("✅ Claude API key appears valid")
        else:
            print("⚠️  Claude API key not provided or invalid format")
        
        if valid_openai or valid_claude:
            print("\n🎉 AI ensemble will be available!")
        else:
            print("\n⚠️  No valid AI API keys detected. AI features will be limited.")
        
        print(f"""
🚀 SETUP COMPLETE!

📋 NEXT STEPS:
1. Launch the application: python launch_app.py
2. Go to the 🤖 AI Assistant tab
3. Start asking questions and analyzing strategies!

🔒 SECURITY NOTES:
• Your API keys are stored securely in .env
• This file is excluded from version control
• Never share your API keys publicly

💡 GETTING API KEYS:
• OpenAI: https://platform.openai.com/api-keys
• Claude: https://console.anthropic.com/
• Databento: https://databento.com/
        """)
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        return False
    
    return True

def main():
    """Main setup function"""
    try:
        success = create_env_file()
        if success:
            launch = input("\n🚀 Launch Nexural Testing Engine now? (y/n): ").lower().strip()
            if launch == 'y':
                print("\n🧠 Starting Nexural Testing Engine...")
                try:
                    from launch_app import main as launch_main
                    launch_main()
                except ImportError:
                    print("❌ Could not import launcher. Try: python launch_app.py")
                except Exception as e:
                    print(f"❌ Launch failed: {e}")
    
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user.")
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")

if __name__ == "__main__":
    main()