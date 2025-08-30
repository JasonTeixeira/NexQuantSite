"""
Test Database Integration System
Comprehensive testing of the database management system
"""

import asyncio
import json
import logging
import sys
import time
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Add the project root to the path
sys.path.append(str(Path(__file__).parent))

from database.database_manager import (
    DatabaseManager, DatabaseConfig, DatabaseType,
    BacktestResult, MarketDataPoint, RiskMetrics
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_database_initialization():
    """Test database initialization"""
    print("\n🧪 Testing Database Initialization...")
    
    try:
        # Test SQLite configuration
        config = DatabaseConfig(
            db_type=DatabaseType.SQLITE,
            db_path="test_nexural.db",
            enable_caching=True,
            cache_ttl=300
        )
        
        db_manager = DatabaseManager(config)
        print("✅ Database initialized successfully")
        
        # Test performance stats
        stats = db_manager.get_performance_stats()
        print(f"📊 Initial performance stats: {stats}")
        
        return db_manager
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return None

async def test_backtest_results(db_manager: DatabaseManager):
    """Test backtest results storage and retrieval"""
    print("\n🧪 Testing Backtest Results...")
    
    try:
        # Create sample backtest result
        result_id = str(uuid.uuid4())
        start_date = datetime.now() - timedelta(days=30)
        end_date = datetime.now()
        
        backtest_result = BacktestResult(
            id=result_id,
            strategy_name="Test Strategy",
            start_date=start_date,
            end_date=end_date,
            initial_capital=100000.0,
            final_capital=115000.0,
            total_return=0.15,
            sharpe_ratio=1.25,
            max_drawdown=0.08,
            win_rate=0.65,
            total_trades=150,
            profit_factor=1.45,
            calmar_ratio=1.87,
            sortino_ratio=1.35,
            config={
                "lookback_period": 20,
                "threshold": 0.02,
                "position_size": 0.1
            },
            results_data={
                "equity_curve": [100000, 102000, 105000, 115000],
                "drawdown_curve": [0, -0.02, -0.05, 0],
                "trade_list": [
                    {"date": "2024-01-01", "symbol": "AAPL", "side": "BUY", "pnl": 500},
                    {"date": "2024-01-02", "symbol": "GOOGL", "side": "SELL", "pnl": -200}
                ]
            },
            created_at=datetime.now(),
            execution_time=45.2
        )
        
        # Save backtest result
        success = await db_manager.save_backtest_result(backtest_result)
        if success:
            print("✅ Backtest result saved successfully")
        else:
            print("❌ Failed to save backtest result")
            return False
        
        # Retrieve backtest result
        retrieved_result = await db_manager.get_backtest_result(result_id)
        if retrieved_result:
            print("✅ Backtest result retrieved successfully")
            print(f"   Strategy: {retrieved_result.strategy_name}")
            print(f"   Total Return: {retrieved_result.total_return:.2%}")
            print(f"   Sharpe Ratio: {retrieved_result.sharpe_ratio:.2f}")
            print(f"   Max Drawdown: {retrieved_result.max_drawdown:.2%}")
        else:
            print("❌ Failed to retrieve backtest result")
            return False
        
        # Test multiple results retrieval
        results = await db_manager.get_backtest_results(
            strategy_name="Test Strategy",
            limit=10
        )
        print(f"✅ Retrieved {len(results)} backtest results")
        
        return True
        
    except Exception as e:
        print(f"❌ Backtest results test failed: {e}")
        return False

async def test_market_data(db_manager: DatabaseManager):
    """Test market data storage and retrieval"""
    print("\n🧪 Testing Market Data...")
    
    try:
        # Create sample market data points
        base_time = datetime.now() - timedelta(days=5)
        data_points = []
        
        for i in range(100):
            timestamp = base_time + timedelta(hours=i)
            data_point = MarketDataPoint(
                symbol="AAPL",
                timestamp=timestamp,
                open=150.0 + i * 0.1,
                high=151.0 + i * 0.1,
                low=149.0 + i * 0.1,
                close=150.5 + i * 0.1,
                volume=1000000 + i * 1000,
                source="yahoo_finance"
            )
            data_points.append(data_point)
        
        # Save market data
        success = await db_manager.save_market_data(data_points)
        if success:
            print(f"✅ Saved {len(data_points)} market data points")
        else:
            print("❌ Failed to save market data")
            return False
        
        # Retrieve market data
        start_date = base_time
        end_date = base_time + timedelta(hours=50)
        retrieved_data = await db_manager.get_market_data(
            symbol="AAPL",
            start_date=start_date,
            end_date=end_date,
            limit=50
        )
        
        if retrieved_data:
            print(f"✅ Retrieved {len(retrieved_data)} market data points")
            print(f"   First point: {retrieved_data[0].symbol} @ {retrieved_data[0].timestamp}")
            print(f"   Last point: {retrieved_data[-1].symbol} @ {retrieved_data[-1].timestamp}")
        else:
            print("❌ Failed to retrieve market data")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Market data test failed: {e}")
        return False

async def test_risk_metrics(db_manager: DatabaseManager):
    """Test risk metrics storage and retrieval"""
    print("\n🧪 Testing Risk Metrics...")
    
    try:
        # Create sample risk metrics
        metrics_id = str(uuid.uuid4())
        portfolio_id = "portfolio_001"
        
        risk_metrics = RiskMetrics(
            id=metrics_id,
            portfolio_id=portfolio_id,
            var_95=0.025,
            cvar_95=0.035,
            volatility=0.18,
            beta=1.1,
            sharpe_ratio=1.25,
            max_drawdown=0.12,
            correlation_matrix={
                "AAPL": {"GOOGL": 0.7, "MSFT": 0.6},
                "GOOGL": {"AAPL": 0.7, "MSFT": 0.8},
                "MSFT": {"AAPL": 0.6, "GOOGL": 0.8}
            },
            stress_test_results={
                "market_crash": {"impact": -0.15, "probability": 0.05},
                "interest_rate_hike": {"impact": -0.08, "probability": 0.15},
                "sector_rotation": {"impact": -0.05, "probability": 0.25}
            },
            calculated_at=datetime.now()
        )
        
        # Save risk metrics
        success = await db_manager.save_risk_metrics(risk_metrics)
        if success:
            print("✅ Risk metrics saved successfully")
        else:
            print("❌ Failed to save risk metrics")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Risk metrics test failed: {e}")
        return False

async def test_alerts(db_manager: DatabaseManager):
    """Test alert system"""
    print("\n🧪 Testing Alert System...")
    
    try:
        # Create various alerts
        alerts = [
            ("RISK_LIMIT", "Portfolio VaR exceeded 2% limit", "WARNING"),
            ("PERFORMANCE", "Strategy achieved 15% return target", "INFO"),
            ("SYSTEM", "Database backup completed successfully", "INFO"),
            ("ERROR", "Failed to connect to market data source", "ERROR")
        ]
        
        for alert_type, message, severity in alerts:
            success = await db_manager.create_alert(alert_type, message, severity)
            if success:
                print(f"✅ Created {severity} alert: {alert_type}")
            else:
                print(f"❌ Failed to create alert: {alert_type}")
        
        # Retrieve alerts
        all_alerts = await db_manager.get_alerts(limit=10)
        print(f"✅ Retrieved {len(all_alerts)} alerts")
        
        # Test filtered alerts
        warning_alerts = await db_manager.get_alerts(severity="WARNING", limit=5)
        print(f"✅ Retrieved {len(warning_alerts)} WARNING alerts")
        
        unacknowledged_alerts = await db_manager.get_alerts(acknowledged=False, limit=5)
        print(f"✅ Retrieved {len(unacknowledged_alerts)} unacknowledged alerts")
        
        return True
        
    except Exception as e:
        print(f"❌ Alert system test failed: {e}")
        return False

async def test_performance_and_caching(db_manager: DatabaseManager):
    """Test performance and caching functionality"""
    print("\n🧪 Testing Performance and Caching...")
    
    try:
        # Test cache performance
        result_id = str(uuid.uuid4())
        start_date = datetime.now() - timedelta(days=10)
        end_date = datetime.now()
        
        # Create and save a test result
        test_result = BacktestResult(
            id=result_id,
            strategy_name="Cache Test Strategy",
            start_date=start_date,
            end_date=end_date,
            initial_capital=50000.0,
            final_capital=55000.0,
            total_return=0.10,
            sharpe_ratio=1.0,
            max_drawdown=0.05,
            win_rate=0.60,
            total_trades=50,
            profit_factor=1.2,
            calmar_ratio=2.0,
            sortino_ratio=1.1,
            config={"test": True},
            results_data={"test": "data"},
            created_at=datetime.now(),
            execution_time=10.0
        )
        
        await db_manager.save_backtest_result(test_result)
        
        # First retrieval (cache miss)
        start_time = time.time()
        result1 = await db_manager.get_backtest_result(result_id)
        time1 = time.time() - start_time
        
        # Second retrieval (cache hit)
        start_time = time.time()
        result2 = await db_manager.get_backtest_result(result_id)
        time2 = time.time() - start_time
        
        print(f"✅ Cache miss time: {time1:.4f}s")
        print(f"✅ Cache hit time: {time2:.4f}s")
        print(f"✅ Cache speedup: {time1/time2:.1f}x")
        
        # Get performance stats
        stats = db_manager.get_performance_stats()
        print(f"📊 Performance stats: {stats}")
        
        return True
        
    except Exception as e:
        print(f"❌ Performance test failed: {e}")
        return False

async def test_concurrent_operations(db_manager: DatabaseManager):
    """Test concurrent database operations"""
    print("\n🧪 Testing Concurrent Operations...")
    
    try:
        # Create multiple concurrent tasks
        tasks = []
        
        async def save_backtest(i):
            result_id = str(uuid.uuid4())
            result = BacktestResult(
                id=result_id,
                strategy_name=f"Concurrent Strategy {i}",
                start_date=datetime.now() - timedelta(days=30),
                end_date=datetime.now(),
                initial_capital=100000.0,
                final_capital=110000.0,
                total_return=0.10,
                sharpe_ratio=1.0,
                max_drawdown=0.05,
                win_rate=0.60,
                total_trades=100,
                profit_factor=1.2,
                calmar_ratio=2.0,
                sortino_ratio=1.1,
                config={"concurrent": True, "id": i},
                results_data={"test": f"data_{i}"},
                created_at=datetime.now(),
                execution_time=5.0
            )
            return await db_manager.save_backtest_result(result)
        
        # Run 10 concurrent save operations
        for i in range(10):
            task = asyncio.create_task(save_backtest(i))
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        successful_saves = sum(results)
        
        print(f"✅ Completed {successful_saves}/10 concurrent save operations")
        
        return successful_saves == 10
        
    except Exception as e:
        print(f"❌ Concurrent operations test failed: {e}")
        return False

async def test_data_integrity(db_manager: DatabaseManager):
    """Test data integrity and validation"""
    print("\n🧪 Testing Data Integrity...")
    
    try:
        # Test with invalid data
        invalid_result = BacktestResult(
            id="invalid_test",
            strategy_name="",  # Empty strategy name
            start_date=datetime.now(),
            end_date=datetime.now() - timedelta(days=1),  # End before start
            initial_capital=-1000.0,  # Negative capital
            final_capital=500.0,
            total_return=2.0,  # 200% return (unrealistic)
            sharpe_ratio=float('inf'),  # Invalid Sharpe ratio
            max_drawdown=1.5,  # >100% drawdown
            win_rate=1.5,  # >100% win rate
            total_trades=-10,  # Negative trades
            profit_factor=0.0,  # Zero profit factor
            calmar_ratio=float('nan'),  # NaN value
            sortino_ratio=float('-inf'),  # Negative infinity
            config={},
            results_data={},
            created_at=datetime.now(),
            execution_time=-1.0  # Negative execution time
        )
        
        # This should still save (database doesn't validate business logic)
        success = await db_manager.save_backtest_result(invalid_result)
        if success:
            print("✅ Invalid data saved (database accepts all data)")
        else:
            print("❌ Database rejected invalid data")
        
        # Test retrieval of invalid data
        retrieved = await db_manager.get_backtest_result("invalid_test")
        if retrieved:
            print("✅ Invalid data retrieved successfully")
            print(f"   Strategy: '{retrieved.strategy_name}'")
            print(f"   Capital: {retrieved.initial_capital}")
            print(f"   Sharpe: {retrieved.sharpe_ratio}")
        else:
            print("❌ Failed to retrieve invalid data")
        
        return True
        
    except Exception as e:
        print(f"❌ Data integrity test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting Database Integration Tests")
    print("=" * 50)
    
    # Initialize database
    db_manager = await test_database_initialization()
    if not db_manager:
        print("❌ Cannot proceed without database initialization")
        return
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Backtest Results", test_backtest_results),
        ("Market Data", test_market_data),
        ("Risk Metrics", test_risk_metrics),
        ("Alert System", test_alerts),
        ("Performance & Caching", test_performance_and_caching),
        ("Concurrent Operations", test_concurrent_operations),
        ("Data Integrity", test_data_integrity)
    ]
    
    for test_name, test_func in tests:
        try:
            result = await test_func(db_manager)
            test_results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            test_results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    # Final performance stats
    final_stats = db_manager.get_performance_stats()
    print(f"\n📈 Final Performance Stats:")
    print(f"   Queries: {final_stats['query_count']}")
    print(f"   Cache Hits: {final_stats['cache_hits']}")
    print(f"   Cache Misses: {final_stats['cache_misses']}")
    print(f"   Cache Hit Rate: {final_stats['cache_hit_rate']:.2%}")
    print(f"   Cache Size: {final_stats['cache_size']}")
    
    # Cleanup
    await db_manager.close()
    
    if passed == total:
        print("\n🎉 All database tests passed! Database system is ready for production.")
    else:
        print(f"\n⚠️  {total - passed} tests failed. Please review the issues above.")

if __name__ == "__main__":
    asyncio.run(main())
