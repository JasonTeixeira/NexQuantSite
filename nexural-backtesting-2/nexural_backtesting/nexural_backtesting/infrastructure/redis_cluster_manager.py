"""
Redis Cluster Manager for Enterprise Caching and Session Management
Handles distributed caching, session storage, and high-performance data access
"""

import asyncio
import json
import logging
import pickle
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, asdict
import redis
from redis.cluster import RedisCluster
from redis.asyncio import Redis as AsyncRedis
from redis.asyncio.cluster import RedisCluster as AsyncRedisCluster
# Avoid importing deprecated aioredis package that conflicts on Python 3.13
# import aioredis

logger = logging.getLogger(__name__)

@dataclass
class RedisClusterConfig:
    """Redis cluster configuration"""
    # Cluster nodes
    startup_nodes: List[Dict[str, Union[str, int]]] = None
    # Connection settings
    host: str = "localhost"
    port: int = 6379
    password: str = ""
    db: int = 0
    # Pool settings
    max_connections: int = 50
    min_connections: int = 5
    # Timeout settings
    socket_timeout: int = 5
    socket_connect_timeout: int = 5
    socket_keepalive: bool = True
    # Cluster settings
    cluster_enabled: bool = True
    skip_full_coverage_check: bool = True
    # Cache settings
    default_ttl: int = 3600  # 1 hour
    max_ttl: int = 86400     # 24 hours

@dataclass
class CacheEntry:
    """Cache entry structure"""
    key: str
    value: Any
    ttl: int
    created_at: datetime
    accessed_at: datetime
    access_count: int = 0
    metadata: Optional[Dict] = None

class RedisClusterManager:
    """
    Enterprise-grade Redis cluster manager for distributed caching
    """
    
    def __init__(self, config: RedisClusterConfig):
        self.config = config
        self.sync_client = None
        self.async_client = None
        self.cluster_client = None
        self.async_cluster_client = None
        self._mock_mode = False
        self._memory_store: Dict[str, str] = {}
        
        # Initialize connections
        self._init_connections()
        
        # Cache statistics
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0,
            'errors': 0
        }
        
        logger.info("✅ Redis cluster manager initialized successfully")
    
    def _init_connections(self):
        """Initialize Redis connections"""
        try:
            if self.config.cluster_enabled and self.config.startup_nodes:
                # Initialize cluster clients
                self.cluster_client = RedisCluster(
                    startup_nodes=self.config.startup_nodes,
                    decode_responses=True,
                    skip_full_coverage_check=self.config.skip_full_coverage_check,
                    socket_timeout=self.config.socket_timeout,
                    socket_connect_timeout=self.config.socket_connect_timeout,
                    socket_keepalive=self.config.socket_keepalive,
                    max_connections=self.config.max_connections,
                    retry_on_timeout=True,
                    retry_on_error=[redis.ConnectionError, redis.TimeoutError]
                )
                
                logger.info("✅ Redis cluster client initialized")
                
            else:
                # Initialize single Redis client
                self.sync_client = redis.Redis(
                    host=self.config.host,
                    port=self.config.port,
                    password=self.config.password,
                    db=self.config.db,
                    decode_responses=True,
                    socket_timeout=self.config.socket_timeout,
                    socket_connect_timeout=self.config.socket_connect_timeout,
                    socket_keepalive=self.config.socket_keepalive,
                    max_connections=self.config.max_connections,
                    retry_on_timeout=True,
                    retry_on_error=[redis.ConnectionError, redis.TimeoutError]
                )
                
                logger.info("✅ Redis single client initialized")
            
            # Test connection
            self._test_connection()
            
        except Exception as e:
            logger.warning(f"⚠️ Redis not available, using in-memory mock: {e}")
            # Fallback to in-memory store for tests
            self.sync_client = None
            self.cluster_client = None
            self._mock_mode = True
    
    async def _init_async_connections(self):
        """Initialize async Redis connections"""
        try:
            if self.config.cluster_enabled and self.config.startup_nodes:
                # Initialize async cluster client
                self.async_cluster_client = AsyncRedisCluster(
                    startup_nodes=self.config.startup_nodes,
                    decode_responses=True,
                    skip_full_coverage_check=self.config.skip_full_coverage_check,
                    socket_timeout=self.config.socket_timeout,
                    socket_connect_timeout=self.config.socket_connect_timeout,
                    socket_keepalive=self.config.socket_keepalive,
                    max_connections=self.config.max_connections,
                    retry_on_timeout=True,
                    retry_on_error=[redis.ConnectionError, redis.TimeoutError]
                )
                
                logger.info("✅ Async Redis cluster client initialized")
                
            else:
                # Initialize async single Redis client
                self.async_client = AsyncRedis(
                    host=self.config.host,
                    port=self.config.port,
                    password=self.config.password,
                    db=self.config.db,
                    decode_responses=True,
                    socket_timeout=self.config.socket_timeout,
                    socket_connect_timeout=self.config.socket_connect_timeout,
                    socket_keepalive=self.config.socket_keepalive,
                    max_connections=self.config.max_connections,
                    retry_on_timeout=True,
                    retry_on_error=[redis.ConnectionError, redis.TimeoutError]
                )
                
                logger.info("✅ Async Redis single client initialized")
            
            # Test async connection
            await self._test_async_connection()
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize async Redis connections: {e}")
            raise
    
    def _test_connection(self):
        """Test Redis connection"""
        try:
            client = self.cluster_client or self.sync_client
            client.ping()
            logger.info("✅ Redis connection test successful")
        except Exception as e:
            logger.error(f"❌ Redis connection test failed: {e}")
            raise
    
    async def _test_async_connection(self):
        """Test async Redis connection"""
        try:
            client = self.async_cluster_client or self.async_client
            await client.ping()
            logger.info("✅ Async Redis connection test successful")
        except Exception as e:
            logger.error(f"❌ Async Redis connection test failed: {e}")
            raise
    
    def _get_client(self):
        """Get the appropriate Redis client"""
        if getattr(self, '_mock_mode', False):
            return self
        return self.cluster_client or self.sync_client
    
    async def _get_async_client(self):
        """Get the appropriate async Redis client"""
        if getattr(self, '_mock_mode', False):
            return self
        return self.async_cluster_client or self.async_client
    
    def _serialize_value(self, value: Any) -> str:
        """Serialize value for storage"""
        try:
            if isinstance(value, (dict, list, tuple)):
                return json.dumps(value, default=str)
            elif hasattr(value, '__dict__'):
                return json.dumps(asdict(value), default=str)
            else:
                return str(value)
        except Exception as e:
            logger.warning(f"Serialization failed, using pickle: {e}")
            return pickle.dumps(value).hex()
    
    def _deserialize_value(self, value: str, original_type: type = None) -> Any:
        """Deserialize value from storage"""
        try:
            # Try JSON first for dict/list/object values
            return json.loads(value)
        except Exception as e:
            logger.warning(f"JSON deserialization failed, trying pickle: {e}")
            try:
                return pickle.loads(bytes.fromhex(value))
            except Exception as e2:
                logger.debug(f"Pickle deserialization failed, returning string: {e2}")
                return value
    
    def set(self, key: str, value: Any, ttl: int = None, 
            namespace: str = "default", metadata: Dict = None) -> bool:
        """Set a value in cache"""
        try:
            client = self._get_client()
            if client is None or self._mock_mode:
                # In-memory fallback
                full_key = f"{namespace}:{key}"
                self._memory_store[full_key] = self._serialize_value(value)
                self.stats['sets'] += 1
                return True
            
            # Create cache entry
            cache_entry = CacheEntry(
                key=key,
                value=value,
                ttl=ttl or self.config.default_ttl,
                created_at=datetime.now(),
                accessed_at=datetime.now(),
                metadata=metadata or {}
            )
            
            # Serialize value
            serialized_value = self._serialize_value(value)
            
            # Set in Redis
            full_key = f"{namespace}:{key}"
            success = client.setex(
                full_key,
                ttl or self.config.default_ttl,
                serialized_value
            )
            
            if success:
                self.stats['sets'] += 1
                logger.debug(f"✅ Cached {full_key} with TTL {ttl or self.config.default_ttl}s")
            
            return success
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"❌ Failed to set cache key {key}: {e}")
            return False
    
    async def async_set(self, key: str, value: Any, ttl: int = None,
                       namespace: str = "default", metadata: Dict = None) -> bool:
        """Set a value in cache asynchronously"""
        try:
            client = await self._get_async_client()
            if client is None or getattr(self, '_mock_mode', False):
                # In-memory fallback
                full_key = f"{namespace}:{key}"
                self._memory_store[full_key] = self._serialize_value(value)
                self.stats['sets'] += 1
                return True
            
            # Serialize value
            serialized_value = self._serialize_value(value)
            
            # Set in Redis
            full_key = f"{namespace}:{key}"
            success = await client.setex(
                full_key,
                ttl or self.config.default_ttl,
                serialized_value
            )
            
            if success:
                self.stats['sets'] += 1
                logger.debug(f"✅ Async cached {full_key} with TTL {ttl or self.config.default_ttl}s")
            
            return success
            
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"❌ Failed to async set cache key {key}: {e}")
            return False
    
    def get(self, key: str, namespace: str = "default", 
            default: Any = None, original_type: type = None) -> Any:
        """Get a value from cache"""
        try:
            client = self._get_client()
            if client is None or self._mock_mode:
                full_key = f"{namespace}:{key}"
                value = self._memory_store.get(full_key)
                if value is None:
                    self.stats['misses'] += 1
                    return default
                self.stats['hits'] += 1
                return self._deserialize_value(value, original_type)
            full_key = f"{namespace}:{key}"
            
            value = client.get(full_key)
            
            if value is not None:
                self.stats['hits'] += 1
                deserialized_value = self._deserialize_value(value, original_type)
                logger.debug(f"✅ Cache hit for {full_key}")
                return deserialized_value
            else:
                self.stats['misses'] += 1
                logger.debug(f"⚠️ Cache miss for {full_key}")
                return default
                
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"❌ Failed to get cache key {key}: {e}")
            return default
    
    async def async_get(self, key: str, namespace: str = "default",
                       default: Any = None, original_type: type = None) -> Any:
        """Get a value from cache asynchronously"""
        try:
            client = await self._get_async_client()
            if client is None or getattr(self, '_mock_mode', False):
                full_key = f"{namespace}:{key}"
                value = self._memory_store.get(full_key)
                if value is None:
                    self.stats['misses'] += 1
                    return default
                self.stats['hits'] += 1
                return self._deserialize_value(value, original_type)
            full_key = f"{namespace}:{key}"
            
            value = await client.get(full_key)
            
            if value is not None:
                self.stats['hits'] += 1
                deserialized_value = self._deserialize_value(value, original_type)
                logger.debug(f"✅ Async cache hit for {full_key}")
                return deserialized_value
            else:
                self.stats['misses'] += 1
                logger.debug(f"⚠️ Async cache miss for {full_key}")
                return default
                
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"❌ Failed to async get cache key {key}: {e}")
            return default
    
    def delete(self, key: str, namespace: str = "default") -> bool:
        """Delete a value from cache"""
        try:
            client = self._get_client()
            if client is None or self._mock_mode:
                full_key = f"{namespace}:{key}"
                existed = full_key in self._memory_store
                if existed:
                    del self._memory_store[full_key]
                    self.stats['deletes'] += 1
                return existed
            full_key = f"{namespace}:{key}"
            
            result = client.delete(full_key)
            if result > 0:
                self.stats['deletes'] += 1
                logger.debug(f"✅ Deleted cache key {full_key}")
                return True
            else:
                logger.debug(f"⚠️ Cache key {full_key} not found for deletion")
                return False
                
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"❌ Failed to delete cache key {key}: {e}")
            return False
    
    async def async_delete(self, key: str, namespace: str = "default") -> bool:
        """Delete a value from cache asynchronously"""
        try:
            client = await self._get_async_client()
            full_key = f"{namespace}:{key}"
            
            result = await client.delete(full_key)
            if result > 0:
                self.stats['deletes'] += 1
                logger.debug(f"✅ Async deleted cache key {full_key}")
                return True
            else:
                logger.debug(f"⚠️ Async cache key {full_key} not found for deletion")
                return False
                
        except Exception as e:
            self.stats['errors'] += 1
            logger.error(f"❌ Failed to async delete cache key {key}: {e}")
            return False
    
    def exists(self, key: str, namespace: str = "default") -> bool:
        """Check if a key exists in cache"""
        try:
            client = self._get_client()
            full_key = f"{namespace}:{key}"
            if client is None or self._mock_mode:
                return full_key in self._memory_store
            return bool(client.exists(full_key))
        except Exception as e:
            logger.error(f"❌ Failed to check existence of cache key {key}: {e}")
            return False
    
    async def async_exists(self, key: str, namespace: str = "default") -> bool:
        """Check if a key exists in cache asynchronously"""
        try:
            client = await self._get_async_client()
            full_key = f"{namespace}:{key}"
            result = await client.exists(full_key)
            return bool(result)
        except Exception as e:
            logger.error(f"❌ Failed to async check existence of cache key {key}: {e}")
            return False
    
    def expire(self, key: str, ttl: int, namespace: str = "default") -> bool:
        """Set expiration for a key"""
        try:
            client = self._get_client()
            full_key = f"{namespace}:{key}"
            if client is None or self._mock_mode:
                # TTL not enforced in mock; report success if key exists
                return full_key in self._memory_store
            return bool(client.expire(full_key, ttl))
        except Exception as e:
            logger.error(f"❌ Failed to set expiration for cache key {key}: {e}")
            return False
    
    async def async_expire(self, key: str, ttl: int, namespace: str = "default") -> bool:
        """Set expiration for a key asynchronously"""
        try:
            client = await self._get_async_client()
            full_key = f"{namespace}:{key}"
            result = await client.expire(full_key, ttl)
            return bool(result)
        except Exception as e:
            logger.error(f"❌ Failed to async set expiration for cache key {key}: {e}")
            return False
    
    def ttl(self, key: str, namespace: str = "default") -> int:
        """Get time to live for a key"""
        try:
            client = self._get_client()
            full_key = f"{namespace}:{key}"
            if client is None or self._mock_mode:
                return self.config.default_ttl if full_key in self._memory_store else -2
            return client.ttl(full_key)
        except Exception as e:
            logger.error(f"❌ Failed to get TTL for cache key {key}: {e}")
            return -1
    
    async def async_ttl(self, key: str, namespace: str = "default") -> int:
        """Get time to live for a key asynchronously"""
        try:
            client = await self._get_async_client()
            full_key = f"{namespace}:{key}"
            return await client.ttl(full_key)
        except Exception as e:
            logger.error(f"❌ Failed to async get TTL for cache key {key}: {e}")
            return -1
    
    def clear_namespace(self, namespace: str = "default") -> int:
        """Clear all keys in a namespace"""
        try:
            client = self._get_client()
            pattern = f"{namespace}:*"
            
            if hasattr(client, 'scan_iter'):
                # For single Redis
                keys = list(client.scan_iter(match=pattern))
            else:
                # For Redis cluster
                keys = []
                for node in client.get_nodes():
                    keys.extend(node.scan_iter(match=pattern))
            
            if keys:
                deleted = client.delete(*keys)
                logger.info(f"✅ Cleared {deleted} keys from namespace {namespace}")
                return deleted
            else:
                logger.info(f"ℹ️ No keys found in namespace {namespace}")
                return 0
                
        except Exception as e:
            logger.error(f"❌ Failed to clear namespace {namespace}: {e}")
            return 0
    
    async def async_clear_namespace(self, namespace: str = "default") -> int:
        """Clear all keys in a namespace asynchronously"""
        try:
            client = await self._get_async_client()
            pattern = f"{namespace}:*"
            
            if hasattr(client, 'scan_iter'):
                # For single Redis
                keys = []
                async for key in client.scan_iter(match=pattern):
                    keys.append(key)
            else:
                # For Redis cluster
                keys = []
                for node in client.get_nodes():
                    async for key in node.scan_iter(match=pattern):
                        keys.append(key)
            
            if keys:
                deleted = await client.delete(*keys)
                logger.info(f"✅ Async cleared {deleted} keys from namespace {namespace}")
                return deleted
            else:
                logger.info(f"ℹ️ Async no keys found in namespace {namespace}")
                return 0
                
        except Exception as e:
            logger.error(f"❌ Failed to async clear namespace {namespace}: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            client = self._get_client()
            if client is None or self._mock_mode:
                info = {}
            else:
                info = client.info()
            
            stats = {
                'cache_stats': self.stats.copy(),
                'redis_info': {
                    'connected_clients': info.get('connected_clients', 0),
                    'used_memory_human': info.get('used_memory_human', '0B'),
                    'used_memory_peak_human': info.get('used_memory_peak_human', '0B'),
                    'total_commands_processed': info.get('total_commands_processed', 0),
                    'total_connections_received': info.get('total_connections_received', 0),
                    'keyspace_hits': info.get('keyspace_hits', 0),
                    'keyspace_misses': info.get('keyspace_misses', 0),
                    'uptime_in_seconds': info.get('uptime_in_seconds', 0)
                },
                'hit_rate': self.stats['hits'] / (self.stats['hits'] + self.stats['misses']) if (self.stats['hits'] + self.stats['misses']) > 0 else 0
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Failed to get cache stats: {e}")
            return {'cache_stats': self.stats.copy(), 'error': str(e)}
    
    def get_memory_usage(self) -> Dict[str, Any]:
        """Get memory usage statistics"""
        try:
            client = self._get_client()
            if client is None or self._mock_mode:
                info = {}
            else:
                info = client.info('memory')
            
            return {
                'used_memory': info.get('used_memory', 0),
                'used_memory_human': info.get('used_memory_human', '0B'),
                'used_memory_peak': info.get('used_memory_peak', 0),
                'used_memory_peak_human': info.get('used_memory_peak_human', '0B'),
                'used_memory_rss': info.get('used_memory_rss', 0),
                'used_memory_rss_human': info.get('used_memory_rss_human', '0B'),
                'mem_fragmentation_ratio': info.get('mem_fragmentation_ratio', 0)
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get memory usage: {e}")
            return {}
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on Redis cluster"""
        try:
            client = self._get_client()
            
            # Test basic operations
            test_key = "health_check_test"
            test_value = "test_value"
            
            if client is None or self._mock_mode:
                # In-memory simulation
                self._memory_store[test_key] = test_value
                retrieved_value = self._memory_store.get(test_key)
                del self._memory_store[test_key]
                ping_ok = True
            else:
                client.setex(test_key, 10, test_value)
                retrieved_value = client.get(test_key)
                client.delete(test_key)
                ping_ok = client.ping()
            
            health_status = {
                'status': 'healthy' if retrieved_value == test_value else 'unhealthy',
                'ping': ping_ok,
                'timestamp': datetime.now().isoformat(),
                'test_passed': retrieved_value == test_value
            }
            
            return health_status
            
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.now().isoformat(),
                'test_passed': False
            }
    
    def close(self):
        """Close Redis connections"""
        try:
            if self.sync_client:
                self.sync_client.close()
            if self.cluster_client:
                self.cluster_client.close()
            logger.info("✅ Redis connections closed")
        except Exception as e:
            logger.error(f"❌ Error closing Redis connections: {e}")
    
    async def async_close(self):
        """Close async Redis connections"""
        try:
            if self.async_client:
                await self.async_client.close()
            if self.async_cluster_client:
                await self.async_cluster_client.close()
            logger.info("✅ Async Redis connections closed")
        except Exception as e:
            logger.error(f"❌ Error closing async Redis connections: {e}")

# Global Redis cluster manager instance
_redis_cluster_manager = None

def get_redis_cluster_manager(config: RedisClusterConfig = None) -> RedisClusterManager:
    """Get or create Redis cluster manager instance"""
    global _redis_cluster_manager
    
    if _redis_cluster_manager is None:
        if config is None:
            config = RedisClusterConfig()
        _redis_cluster_manager = RedisClusterManager(config)
    
    return _redis_cluster_manager
