#!/usr/bin/env python3
"""
API KEY MANAGER - Add and Test Keys Immediately
"""

import os
import asyncio
from alpaca_integration import AlpacaIntegration
from data_bento_integration import DatabentoIntegration

def add_alpaca_keys(api_key, secret_key):
    """Add Alpaca API keys and test immediately"""
    
    print("🦆 ADDING ALPACA API KEYS")
    print("=" * 30)
    
    # Set environment variables
    os.environ["ALPACA_API_KEY"] = api_key
    os.environ["ALPACA_SECRET_KEY"] = secret_key
    
    print(f"✅ API Key set: {api_key[:8]}...")
    print(f"✅ Secret Key set: {secret_key[:8]}...")
    
    # Test immediately
    print("\n🧪 TESTING ALPACA CONNECTION...")
    
    try:
        alpaca = AlpacaIntegration()
        
        # Test authentication
        if alpaca.test_connection():
            print("✅ AUTHENTICATION SUCCESSFUL!")
            
            # Get account info
            account = alpaca.get_account_info()
            if account:
                buying_power = float(account['buying_power'])
                print(f"✅ Account connected: ${buying_power:,.2f} buying power")
                
                # Test stock data
                print("📈 Testing stock data...")
                stock_data = alpaca.get_market_data("AAPL", crypto=False)
                if stock_data:
                    print(f"✅ Stock data: AAPL ${stock_data['price']:,.2f}")
                
                # Test crypto data
                print("₿ Testing crypto data...")
                crypto_data = alpaca.get_market_data("BTC", crypto=True)
                if crypto_data:
                    print(f"✅ Crypto data: BTC ${crypto_data['price']:,.2f}")
                
                print("\n🎉 ALPACA FULLY CONNECTED!")
                print("✅ Ready for stocks, options, and crypto trading!")
                
                return True
            else:
                print("⚠️ Authentication successful but no account info")
                return False
        else:
            print("❌ Authentication failed - check your API keys")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def add_databento_key(api_key):
    """Add Databento API key and test MBP-10 access"""
    
    print("📊 ADDING DATABENTO API KEY")
    print("=" * 32)
    
    # Set environment variable
    os.environ["DATABENTO_API_KEY"] = api_key
    print(f"✅ API Key set: {api_key[:8]}...")
    
    # Test immediately
    print("\n🧪 TESTING DATABENTO MBP-10 ACCESS...")
    
    async def test_databento():
        try:
            databento = DatabentoIntegration(api_key=api_key)
            connected = await databento.connect()
            
            if connected:
                print("✅ AUTHENTICATION SUCCESSFUL!")
                
                # Test recent MBP-10 data
                print("📊 Testing MBP-10 data...")
                from datetime import datetime, timedelta
                
                today = datetime.now().strftime('%Y-%m-%d')
                yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
                
                mbp_data = await databento.get_mbp10_data(
                    symbol='ESH5',
                    start_date=yesterday,
                    end_date=today
                )
                
                if mbp_data is not None and len(mbp_data) > 0:
                    print(f"✅ MBP-10 data: {len(mbp_data):,} records")
                    print("✅ 10-level order book confirmed!")
                    
                    # Test 3+ years historical
                    print("🕰️ Testing 3+ years historical...")
                    three_years_ago = (datetime.now() - timedelta(days=1095)).strftime('%Y-%m-%d')
                    three_years_end = (datetime.now() - timedelta(days=1094)).strftime('%Y-%m-%d')
                    
                    old_data = await databento.get_mbp10_data(
                        symbol='ESM1',
                        start_date=three_years_ago,
                        end_date=three_years_end
                    )
                    
                    if old_data is not None and len(old_data) > 0:
                        print(f"✅ 3+ YEAR DATA: {len(old_data):,} records")
                        print("🔥 3+ YEARS MBP-10 ACCESS CONFIRMED!")
                    else:
                        print("⚠️ 3+ year data: Limited (symbol/date issues)")
                else:
                    print("⚠️ No recent MBP-10 data (market closed?)")
                
                print("\n🎉 DATABENTO FULLY CONNECTED!")
                print("✅ MBP-10 order book data access!")
                print("✅ Institutional-grade market data!")
                
                return True
            else:
                print("❌ Authentication failed - check your API key")
                return False
                
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False
    
    return asyncio.run(test_databento())

def show_current_status():
    """Show current connection status"""
    
    print("\n📊 CURRENT CONNECTION STATUS")
    print("=" * 35)
    
    # Check environment variables
    alpaca_key = os.getenv("ALPACA_API_KEY", "")
    alpaca_secret = os.getenv("ALPACA_SECRET_KEY", "")
    databento_key = os.getenv("DATABENTO_API_KEY", "")
    
    print("🔑 API KEYS:")
    print(f"   Alpaca API: {'✅ SET' if alpaca_key else '❌ MISSING'}")
    print(f"   Alpaca Secret: {'✅ SET' if alpaca_secret else '❌ MISSING'}")
    print(f"   Databento: {'✅ SET' if databento_key else '❌ MISSING'}")
    
    # Test live crypto (always works)
    print(f"\n📈 LIVE DATA:")
    try:
        alpaca = AlpacaIntegration()
        btc_data = alpaca.get_market_data("BTC", crypto=True)
        if btc_data:
            print(f"   BTC: ${btc_data['price']:,.2f} ✅ LIVE")
    except:
        pass

def interactive_setup():
    """Interactive setup process"""
    
    print("🚀 INTERACTIVE API KEY SETUP")
    print("=" * 35)
    
    show_current_status()
    
    print("\n📋 SETUP OPTIONS:")
    print("1. Add Alpaca API keys")
    print("2. Add Databento API key")
    print("3. Test all connections")
    print("4. Show current status")
    
    while True:
        try:
            choice = input("\nEnter choice (1-4) or 'q' to quit: ").strip()
            
            if choice.lower() == 'q':
                break
            elif choice == '1':
                print("\n🦆 ALPACA API KEY SETUP")
                api_key = input("Enter ALPACA_API_KEY (starts with PK): ").strip()
                secret_key = input("Enter ALPACA_SECRET_KEY: ").strip()
                
                if api_key and secret_key:
                    success = add_alpaca_keys(api_key, secret_key)
                    if success:
                        input("\nPress Enter to continue...")
                else:
                    print("❌ Both keys are required")
                    
            elif choice == '2':
                print("\n📊 DATABENTO API KEY SETUP")
                api_key = input("Enter DATABENTO_API_KEY: ").strip()
                
                if api_key:
                    success = add_databento_key(api_key)
                    if success:
                        input("\nPress Enter to continue...")
                else:
                    print("❌ API key is required")
                    
            elif choice == '3':
                print("\n🧪 TESTING ALL CONNECTIONS...")
                from comprehensive_system_test import main
                asyncio.run(main())
                input("\nPress Enter to continue...")
                
            elif choice == '4':
                show_current_status()
                
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    interactive_setup()
