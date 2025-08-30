"""
Test API Integration System
Comprehensive testing of the REST API server
"""

import asyncio
import json
import logging
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any

import httpx
import pytest
from fastapi.testclient import TestClient

# Add the project root to the path
sys.path.append(str(Path(__file__).parent))

from api.rest_api_server import APIServer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class APITester:
    """Comprehensive API testing system"""
    
    def __init__(self, base_url: str = "http://localhost:8000", api_key: str = "test_key"):
        self.base_url = base_url
        self.api_key = api_key
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self.test_results = []
        
    async def test_health_endpoint(self):
        """Test health check endpoint"""
        print("\n🧪 Testing Health Endpoint...")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/health")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("data", {}).get("status") == "healthy":
                        print("✅ Health endpoint working correctly")
                        return True
                    else:
                        print("❌ Health endpoint returned unexpected data")
                        return False
                else:
                    print(f"❌ Health endpoint failed with status {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Health endpoint test failed: {e}")
            return False
    
    async def test_authentication(self):
        """Test authentication"""
        print("\n🧪 Testing Authentication...")
        
        try:
            async with httpx.AsyncClient() as client:
                # Test with valid token
                response = await client.get(
                    f"{self.base_url}/system/status",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    print("✅ Valid authentication working")
                else:
                    print(f"❌ Valid authentication failed: {response.status_code}")
                    return False
                
                # Test with invalid token
                invalid_headers = {"Authorization": "Bearer invalid_token"}
                response = await client.get(
                    f"{self.base_url}/system/status",
                    headers=invalid_headers
                )
                
                if response.status_code == 401:
                    print("✅ Invalid authentication properly rejected")
                    return True
                else:
                    print(f"❌ Invalid authentication not rejected: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Authentication test failed: {e}")
            return False
    
    async def test_backtest_endpoints(self):
        """Test backtesting endpoints"""
        print("\n🧪 Testing Backtest Endpoints...")
        
        try:
            async with httpx.AsyncClient() as client:
                # Create backtest
                backtest_request = {
                    "strategy_name": "Test Strategy",
                    "symbols": ["AAPL", "GOOGL"],
                    "start_date": "2024-01-01",
                    "end_date": "2024-12-31",
                    "initial_capital": 100000.0,
                    "mode": "simple",
                    "config": {
                        "lookback_period": 20,
                        "threshold": 0.02
                    }
                }
                
                response = await client.post(
                    f"{self.base_url}/backtest",
                    headers=self.headers,
                    json=backtest_request
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("data", {}).get("backtest_id"):
                        backtest_id = data["data"]["backtest_id"]
                        print(f"✅ Backtest created: {backtest_id}")
                        
                        # Wait a bit for backtest to complete
                        await asyncio.sleep(2)
                        
                        # Get backtest results
                        response = await client.get(
                            f"{self.base_url}/backtest/{backtest_id}",
                            headers=self.headers
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            if data.get("success") and data.get("data"):
                                print("✅ Backtest results retrieved successfully")
                                result_data = data["data"]
                                print(f"   Strategy: {result_data['strategy_name']}")
                                print(f"   Total Return: {result_data['total_return']:.2%}")
                                print(f"   Sharpe Ratio: {result_data['sharpe_ratio']:.2f}")
                            else:
                                print("❌ Failed to retrieve backtest results")
                                return False
                        else:
                            print(f"❌ Failed to get backtest: {response.status_code}")
                            return False
                    else:
                        print("❌ Failed to create backtest")
                        return False
                else:
                    print(f"❌ Backtest creation failed: {response.status_code}")
                    return False
                
                # Test list backtests
                response = await client.get(
                    f"{self.base_url}/backtests",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and isinstance(data.get("data"), list):
                        print(f"✅ Retrieved {len(data['data'])} backtests")
                        return True
                    else:
                        print("❌ Failed to list backtests")
                        return False
                else:
                    print(f"❌ List backtests failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Backtest endpoints test failed: {e}")
            return False
    
    async def test_market_data_endpoints(self):
        """Test market data endpoints"""
        print("\n🧪 Testing Market Data Endpoints...")
        
        try:
            async with httpx.AsyncClient() as client:
                # Get market data
                response = await client.get(
                    f"{self.base_url}/market-data/AAPL",
                    headers=self.headers,
                    params={
                        "start_date": "2024-01-01",
                        "end_date": "2024-01-31",
                        "limit": 100
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and isinstance(data.get("data"), list):
                        print(f"✅ Retrieved {len(data['data'])} market data points")
                        return True
                    else:
                        print("❌ Failed to retrieve market data")
                        return False
                else:
                    print(f"❌ Market data request failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Market data endpoints test failed: {e}")
            return False
    
    async def test_risk_endpoints(self):
        """Test risk management endpoints"""
        print("\n🧪 Testing Risk Management Endpoints...")
        
        try:
            async with httpx.AsyncClient() as client:
                # Calculate risk metrics
                risk_request = {
                    "portfolio_id": "test_portfolio",
                    "positions": {
                        "AAPL": 10000.0,
                        "GOOGL": 15000.0,
                        "MSFT": 12000.0
                    },
                    "prices": {
                        "AAPL": [150.0, 151.0, 152.0, 149.0, 153.0],
                        "GOOGL": [2800.0, 2810.0, 2790.0, 2820.0, 2830.0],
                        "MSFT": [350.0, 352.0, 348.0, 355.0, 358.0]
                    }
                }
                
                response = await client.post(
                    f"{self.base_url}/risk/calculate",
                    headers=self.headers,
                    json=risk_request
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("data"):
                        print("✅ Risk metrics calculated successfully")
                        risk_data = data["data"]
                        print(f"   Portfolio VaR: {risk_data['portfolio_var']:.2%}")
                        print(f"   Portfolio Volatility: {risk_data['portfolio_volatility']:.2%}")
                        print(f"   Portfolio Sharpe: {risk_data['portfolio_sharpe']:.2f}")
                        return True
                    else:
                        print("❌ Failed to calculate risk metrics")
                        return False
                else:
                    print(f"❌ Risk calculation failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Risk endpoints test failed: {e}")
            return False
    
    async def test_system_endpoints(self):
        """Test system endpoints"""
        print("\n🧪 Testing System Endpoints...")
        
        try:
            async with httpx.AsyncClient() as client:
                # Get system status
                response = await client.get(
                    f"{self.base_url}/system/status",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("data"):
                        print("✅ System status retrieved successfully")
                        status_data = data["data"]
                        print(f"   Database: {'Connected' if status_data['database']['connected'] else 'Disconnected'}")
                        print(f"   Trading: {status_data['trading']['status']}")
                        print(f"   WebSocket: {'Running' if status_data['websocket']['running'] else 'Stopped'}")
                    else:
                        print("❌ Failed to retrieve system status")
                        return False
                else:
                    print(f"❌ System status request failed: {response.status_code}")
                    return False
                
                # Get alerts
                response = await client.get(
                    f"{self.base_url}/alerts",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and isinstance(data.get("data"), list):
                        print(f"✅ Retrieved {len(data['data'])} alerts")
                        return True
                    else:
                        print("❌ Failed to retrieve alerts")
                        return False
                else:
                    print(f"❌ Alerts request failed: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ System endpoints test failed: {e}")
            return False
    
    async def test_error_handling(self):
        """Test error handling"""
        print("\n🧪 Testing Error Handling...")
        
        try:
            async with httpx.AsyncClient() as client:
                # Test invalid backtest ID
                response = await client.get(
                    f"{self.base_url}/backtest/invalid_id",
                    headers=self.headers
                )
                
                if response.status_code == 404:
                    print("✅ Invalid backtest ID properly handled")
                else:
                    print(f"❌ Invalid backtest ID not handled: {response.status_code}")
                    return False
                
                # Test invalid market data request
                response = await client.get(
                    f"{self.base_url}/market-data/INVALID",
                    headers=self.headers,
                    params={
                        "start_date": "invalid_date",
                        "end_date": "invalid_date"
                    }
                )
                
                if response.status_code in [400, 422, 500]:
                    print("✅ Invalid market data request properly handled")
                    return True
                else:
                    print(f"❌ Invalid market data request not handled: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Error handling test failed: {e}")
            return False
    
    async def test_performance(self):
        """Test API performance"""
        print("\n🧪 Testing API Performance...")
        
        try:
            async with httpx.AsyncClient() as client:
                # Test multiple concurrent requests
                start_time = time.time()
                
                tasks = []
                for i in range(10):
                    task = client.get(
                        f"{self.base_url}/health",
                        headers=self.headers
                    )
                    tasks.append(task)
                
                responses = await asyncio.gather(*tasks)
                end_time = time.time()
                
                successful_requests = sum(1 for r in responses if r.status_code == 200)
                total_time = end_time - start_time
                
                print(f"✅ Completed {successful_requests}/10 concurrent requests in {total_time:.2f}s")
                print(f"   Average response time: {total_time/10:.3f}s")
                
                if successful_requests == 10:
                    return True
                else:
                    print(f"❌ Only {successful_requests}/10 requests succeeded")
                    return False
                    
        except Exception as e:
            print(f"❌ Performance test failed: {e}")
            return False
    
    async def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting API Integration Tests")
        print("=" * 50)
        
        tests = [
            ("Health Endpoint", self.test_health_endpoint),
            ("Authentication", self.test_authentication),
            ("Backtest Endpoints", self.test_backtest_endpoints),
            ("Market Data Endpoints", self.test_market_data_endpoints),
            ("Risk Endpoints", self.test_risk_endpoints),
            ("System Endpoints", self.test_system_endpoints),
            ("Error Handling", self.test_error_handling),
            ("Performance", self.test_performance)
        ]
        
        for test_name, test_func in tests:
            try:
                result = await test_func()
                self.test_results.append((test_name, result))
            except Exception as e:
                print(f"❌ {test_name} test crashed: {e}")
                self.test_results.append((test_name, False))
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 API TEST SUMMARY")
        print("=" * 50)
        
        passed = 0
        total = len(self.test_results)
        
        for test_name, result in self.test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:<25} {status}")
            if result:
                passed += 1
        
        print(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            print("\n🎉 All API tests passed! API server is ready for production.")
        else:
            print(f"\n⚠️  {total - passed} tests failed. Please review the issues above.")
        
        return passed == total

async def main():
    """Main test function"""
    # Note: This test assumes the API server is running
    # In a real scenario, you would start the server in a separate process
    
    print("⚠️  Note: This test assumes the API server is running on http://localhost:8000")
    print("   Start the server with: python api/rest_api_server.py")
    print("   Or use the test client approach below...")
    
    # Alternative: Test with FastAPI TestClient (doesn't require running server)
    print("\n🧪 Testing with FastAPI TestClient...")
    
    try:
        from api.rest_api_server import APIServer
        
        # Create API server instance
        config = {
            "api_key": "test_key",
            "db_path": "test_api.db"
        }
        
        server = APIServer(config)
        
        # Initialize server components
        await server.initialize()
        
        # Create test client
        from fastapi.testclient import TestClient
        client = TestClient(server.app)
        
        # Test health endpoint
        response = client.get("/health")
        if response.status_code == 200:
            print("✅ Health endpoint working with TestClient")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
        
        # Test authentication
        headers = {"Authorization": "Bearer test_key"}
        response = client.get("/system/status", headers=headers)
        if response.status_code == 200:
            print("✅ Authentication working with TestClient")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
        
        # Cleanup
        await server.shutdown()
        
    except Exception as e:
        print(f"❌ TestClient test failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
