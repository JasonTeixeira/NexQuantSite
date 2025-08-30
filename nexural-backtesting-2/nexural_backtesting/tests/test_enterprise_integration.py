"""
Enterprise Integration Test Suite
Tests all new enterprise components working together
"""

import pytest
import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Import all enterprise components
from src.infrastructure.timescaledb_manager import (
    TimescaleDBManager, TimescaleDBConfig, MarketTick, OrderBookSnapshot
)
from src.infrastructure.redis_cluster_manager import (
    RedisClusterManager, RedisClusterConfig
)
from src.security.advanced_security_manager import (
    AdvancedSecurityManager, SecurityConfig, User
)
from src.streaming.kafka_event_manager import (
    KafkaEventManager, KafkaConfig, EventMessage, TopicConfig
)

class TestEnterpriseIntegration:
    """Test suite for enterprise component integration"""
    
    @pytest.fixture(scope="class")
    def timescaledb_config(self):
        """TimescaleDB configuration for testing"""
        return TimescaleDBConfig(
            host="localhost",
            port=5432,
            database="nexural_test_timeseries",
            username="test_user",
            password="test_password",
            compression_enabled=False,  # Disable for testing
            retention_days=1  # Short retention for testing
        )
    
    @pytest.fixture(scope="class")
    def redis_config(self):
        """Redis configuration for testing"""
        return RedisClusterConfig(
            host="localhost",
            port=6379,
            cluster_enabled=False,  # Use single Redis for testing
            default_ttl=300  # 5 minutes for testing
        )
    
    @pytest.fixture(scope="class")
    def security_config(self):
        """Security configuration for testing"""
        return SecurityConfig(
            jwt_secret="test-jwt-secret-key-for-testing-only",
            db_path="test_security.db",
            rate_limit_requests=1000,  # High limit for testing
            rate_limit_window=3600
        )
    
    @pytest.fixture(scope="class")
    def kafka_config(self):
        """Kafka configuration for testing"""
        return KafkaConfig(
            bootstrap_servers=["localhost:9092"],
            topic_partitions=1,  # Single partition for testing
            topic_replication_factor=1
        )
    
    @pytest.fixture(scope="class")
    def timescaledb_manager(self, timescaledb_config):
        """TimescaleDB manager instance"""
        try:
            manager = TimescaleDBManager(timescaledb_config)
            yield manager
        finally:
            manager.close()
    
    @pytest.fixture(scope="class")
    def redis_manager(self, redis_config):
        """Redis cluster manager instance"""
        try:
            manager = RedisClusterManager(redis_config)
            yield manager
        finally:
            manager.close()
    
    @pytest.fixture(scope="class")
    def security_manager(self, security_config):
        """Security manager instance"""
        try:
            manager = AdvancedSecurityManager(security_config)
            yield manager
        finally:
            # Clean up test database
            import os
            if os.path.exists(security_config.db_path):
                os.remove(security_config.db_path)
    
    @pytest.fixture(scope="class")
    def kafka_manager(self, kafka_config):
        """Kafka event manager instance"""
        try:
            manager = KafkaEventManager(kafka_config)
            yield manager
        finally:
            manager.close()
    
    def test_timescaledb_initialization(self, timescaledb_manager):
        """Test TimescaleDB initialization"""
        assert timescaledb_manager is not None
        assert timescaledb_manager.pool is not None
        
        # Test database stats
        stats = timescaledb_manager.get_database_stats()
        assert isinstance(stats, dict)
        assert 'table_sizes' in stats
    
    def test_redis_initialization(self, redis_manager):
        """Test Redis initialization"""
        assert redis_manager is not None
        assert redis_manager._get_client() is not None
        
        # Test basic operations
        assert redis_manager.set("test_key", "test_value", ttl=60)
        assert redis_manager.get("test_key") == "test_value"
        assert redis_manager.delete("test_key")
    
    def test_security_initialization(self, security_manager):
        """Test security manager initialization"""
        assert security_manager is not None
        
        # Test basic operations
        user = security_manager.create_user(
            email="test@example.com",
            username="testuser",
            password="testpassword123"
        )
        assert user is not None
        assert user.email == "test@example.com"
        assert user.username == "testuser"
    
    def test_kafka_initialization(self, kafka_manager):
        """Test Kafka initialization"""
        assert kafka_manager is not None
        assert kafka_manager.producer is not None
        assert kafka_manager.admin_client is not None
        
        # Test topic creation
        topic_config = TopicConfig(
            name="test_topic",
            partitions=1,
            replication_factor=1
        )
        assert kafka_manager.create_topic(topic_config)
    
    def test_timescaledb_market_data(self, timescaledb_manager):
        """Test TimescaleDB market data operations"""
        # Create test market ticks
        ticks = [
            MarketTick(
                timestamp=datetime.now(),
                symbol="AAPL",
                exchange="NASDAQ",
                bid=150.0,
                ask=150.1,
                last=150.05,
                volume=1000
            ),
            MarketTick(
                timestamp=datetime.now(),
                symbol="AAPL",
                exchange="NASDAQ",
                bid=150.1,
                ask=150.2,
                last=150.15,
                volume=1500
            )
        ]
        
        # Insert ticks
        inserted_count = timescaledb_manager.insert_market_ticks(ticks)
        assert inserted_count == 2
        
        # Retrieve data
        start_time = datetime.now() - timedelta(minutes=5)
        end_time = datetime.now() + timedelta(minutes=5)
        
        df = timescaledb_manager.get_market_data(
            symbol="AAPL",
            start_time=start_time,
            end_time=end_time,
            interval="1 minute"
        )
        
        assert len(df) > 0
        assert "symbol" in df.columns
        assert "open" in df.columns
        assert "close" in df.columns
    
    def test_redis_caching(self, redis_manager):
        """Test Redis caching operations"""
        # Test basic caching
        test_data = {
            "symbol": "AAPL",
            "price": 150.25,
            "volume": 1000000,
            "timestamp": datetime.now().isoformat()
        }
        
        # Set cache
        assert redis_manager.set("market:AAPL", test_data, ttl=300)
        
        # Get cache
        cached_data = redis_manager.get("market:AAPL")
        assert cached_data is not None
        assert cached_data["symbol"] == "AAPL"
        assert cached_data["price"] == 150.25
        
        # Test namespace operations
        assert redis_manager.set("user:profile:123", {"name": "John"}, namespace="users")
        assert redis_manager.get("user:profile:123", namespace="users")["name"] == "John"
        
        # Test statistics
        stats = redis_manager.get_stats()
        assert "cache_stats" in stats
        assert stats["cache_stats"]["hits"] > 0
    
    def test_security_authentication(self, security_manager):
        """Test security authentication"""
        # Create test user
        user = security_manager.create_user(
            email="auth@example.com",
            username="authuser",
            password="securepassword123"
        )
        
        # Test authentication
        authenticated_user = security_manager.authenticate_user(
            email="auth@example.com",
            password="securepassword123",
            ip_address="127.0.0.1",
            user_agent="test-agent"
        )
        
        assert authenticated_user is not None
        assert authenticated_user.user_id == user.user_id
        
        # Test failed authentication
        failed_user = security_manager.authenticate_user(
            email="auth@example.com",
            password="wrongpassword",
            ip_address="127.0.0.1",
            user_agent="test-agent"
        )
        
        assert failed_user is None
    
    def test_security_mfa(self, security_manager):
        """Test MFA functionality"""
        # Create test user
        user = security_manager.create_user(
            email="mfa@example.com",
            username="mfauser",
            password="mfapassword123"
        )
        
        # Generate MFA secret
        secret = security_manager.generate_mfa_secret(user.user_id)
        assert secret is not None
        assert len(secret) > 0
        
        # Generate QR code
        qr_uri = security_manager.generate_mfa_qr_code(secret, user.email)
        assert qr_uri is not None
        assert "otpauth://" in qr_uri
        
        # Generate backup codes
        backup_codes = security_manager.generate_backup_codes(user.user_id)
        assert len(backup_codes) == 10
        assert all(len(code) > 0 for code in backup_codes)
    
    def test_security_api_keys(self, security_manager):
        """Test API key management"""
        # Create test user
        user = security_manager.create_user(
            email="api@example.com",
            username="apiuser",
            password="apipassword123"
        )
        
        # Generate API key
        api_key = security_manager.generate_api_key(
            user_id=user.user_id,
            name="Test API Key",
            permissions=["read", "write"]
        )
        
        assert api_key is not None
        assert api_key.startswith("nxs_")
        
        # Validate API key
        key_info = security_manager.validate_api_key(api_key)
        assert key_info is not None
        assert key_info["user_id"] == user.user_id
        assert "read" in key_info["api_key_permissions"]
        assert "write" in key_info["api_key_permissions"]
    
    def test_kafka_event_streaming(self, kafka_manager):
        """Test Kafka event streaming"""
        # Create test topic
        topic_config = TopicConfig(
            name="test_events",
            partitions=1,
            replication_factor=1
        )
        kafka_manager.create_topic(topic_config)
        
        # Create test event
        event = kafka_manager.create_event_message(
            event_type="test_event",
            data={"message": "Hello Kafka!", "timestamp": datetime.now().isoformat()},
            source="test_suite",
            correlation_id="test_correlation_123"
        )
        
        # Send event
        success = kafka_manager.send_event("test_events", event)
        assert success
        
        # Test batch events
        events = [
            kafka_manager.create_event_message(
                event_type="batch_event",
                data={"index": i, "message": f"Batch message {i}"}
            )
            for i in range(5)
        ]
        
        sent_count = kafka_manager.send_batch_events("test_events", events)
        assert sent_count == 5
    
    def test_integration_workflow(self, timescaledb_manager, redis_manager, 
                                security_manager, kafka_manager):
        """Test complete integration workflow"""
        # 1. Create user and authenticate
        user = security_manager.create_user(
            email="integration@example.com",
            username="integrationuser",
            password="integrationpass123"
        )
        
        authenticated_user = security_manager.authenticate_user(
            email="integration@example.com",
            password="integrationpass123",
            ip_address="127.0.0.1",
            user_agent="integration-test"
        )
        
        assert authenticated_user is not None
        
        # 2. Generate API key
        api_key = security_manager.generate_api_key(
            user_id=user.user_id,
            name="Integration Test Key",
            permissions=["market_data", "trading"]
        )
        
        # 3. Cache market data in Redis
        market_data = {
            "symbol": "TSLA",
            "price": 250.75,
            "volume": 5000000,
            "timestamp": datetime.now().isoformat(),
            "user_id": user.user_id
        }
        
        cache_key = f"market_data:{market_data['symbol']}"
        redis_manager.set(cache_key, market_data, ttl=300)
        
        # 4. Store market data in TimescaleDB
        ticks = [
            MarketTick(
                timestamp=datetime.now(),
                symbol="TSLA",
                exchange="NASDAQ",
                bid=250.70,
                ask=250.80,
                last=250.75,
                volume=5000000
            )
        ]
        
        timescaledb_manager.insert_market_ticks(ticks)
        
        # 5. Send event to Kafka
        event = kafka_manager.create_event_message(
            event_type="market_data_updated",
            data=market_data,
            source="integration_test",
            user_id=user.user_id,
            correlation_id="integration_workflow_123"
        )
        
        success = kafka_manager.send_event("test_events", event)
        assert success
        
        # 6. Verify data consistency
        cached_data = redis_manager.get(cache_key)
        assert cached_data is not None
        assert cached_data["symbol"] == "TSLA"
        
        # 7. Verify API key still valid
        key_info = security_manager.validate_api_key(api_key)
        assert key_info is not None
        assert key_info["user_id"] == user.user_id
        
        # 8. Check audit logs
        audit_logs = security_manager.get_audit_logs(
            user_id=user.user_id,
            limit=10
        )
        
        assert len(audit_logs) > 0
        assert any(log.action == "login_success" for log in audit_logs)
        assert any(log.action == "api_key_created" for log in audit_logs)
    
    def test_performance_metrics(self, timescaledb_manager, redis_manager, 
                               security_manager, kafka_manager):
        """Test performance metrics collection"""
        # TimescaleDB stats
        db_stats = timescaledb_manager.get_database_stats()
        assert isinstance(db_stats, dict)
        
        # Redis stats
        redis_stats = redis_manager.get_stats()
        assert "cache_stats" in redis_stats
        assert "redis_info" in redis_stats
        
        # Security stats
        security_stats = security_manager.get_security_stats()
        assert "users" in security_stats
        assert "api_keys" in security_stats
        assert "audit_logs" in security_stats
        
        # Kafka stats
        kafka_stats = kafka_manager.get_stats()
        assert "messages_produced" in kafka_stats
        assert "messages_consumed" in kafka_stats
        assert "errors" in kafka_stats
    
    def test_health_checks(self, timescaledb_manager, redis_manager, 
                          security_manager, kafka_manager):
        """Test health check functionality"""
        # Redis health check
        redis_health = redis_manager.health_check()
        assert "status" in redis_health
        assert "timestamp" in redis_health
        
        # Kafka health check
        kafka_health = kafka_manager.health_check()
        assert "status" in kafka_health
        assert "timestamp" in kafka_health
        
        # Security health check (via stats)
        security_stats = security_manager.get_security_stats()
        assert security_stats is not None
    
    @pytest.mark.asyncio
    async def test_async_operations(self, redis_manager, kafka_manager):
        """Test async operations"""
        # Async Redis operations
        await redis_manager.async_set("async_test", {"async": True}, ttl=60)
        cached_data = await redis_manager.async_get("async_test")
        assert cached_data["async"] is True
        
        # Async Kafka operations
        event = kafka_manager.create_event_message(
            event_type="async_test_event",
            data={"async": True, "timestamp": datetime.now().isoformat()}
        )
        
        success = await kafka_manager.async_send_event("test_events", event)
        assert success
    
    def test_error_handling(self, timescaledb_manager, redis_manager, 
                          security_manager, kafka_manager):
        """Test error handling"""
        # Test invalid cache key
        invalid_data = redis_manager.get("nonexistent_key")
        assert invalid_data is None
        
        # Test invalid authentication
        invalid_user = security_manager.authenticate_user(
            email="nonexistent@example.com",
            password="wrongpassword",
            ip_address="127.0.0.1",
            user_agent="test-agent"
        )
        assert invalid_user is None
        
        # Test invalid API key
        invalid_key_info = security_manager.validate_api_key("invalid_key")
        assert invalid_key_info is None
        
        # Test rate limiting
        for i in range(10):
            security_manager.check_rate_limit(
                identifier="test_rate_limit",
                ip_address="127.0.0.1",
                user_agent="test-agent"
            )
    
    def test_data_persistence(self, timescaledb_manager, redis_manager):
        """Test data persistence across operations"""
        # Store data in TimescaleDB
        test_ticks = [
            MarketTick(
                timestamp=datetime.now(),
                symbol="PERSIST",
                exchange="TEST",
                bid=100.0,
                ask=100.1,
                last=100.05,
                volume=1000
            )
        ]
        
        timescaledb_manager.insert_market_ticks(test_ticks)
        
        # Store data in Redis
        persist_data = {
            "symbol": "PERSIST",
            "data": "persistent_test_data",
            "timestamp": datetime.now().isoformat()
        }
        
        redis_manager.set("persist:test", persist_data, ttl=600)
        
        # Verify data persistence
        cached_data = redis_manager.get("persist:test")
        assert cached_data is not None
        assert cached_data["symbol"] == "PERSIST"
        
        # Verify TimescaleDB data
        start_time = datetime.now() - timedelta(minutes=5)
        end_time = datetime.now() + timedelta(minutes=5)
        
        df = timescaledb_manager.get_market_data(
            symbol="PERSIST",
            start_time=start_time,
            end_time=end_time
        )
        
        assert len(df) > 0
        assert df.iloc[0]["symbol"] == "PERSIST"

if __name__ == "__main__":
    # Run integration tests
    pytest.main([__file__, "-v", "--tb=short"])
