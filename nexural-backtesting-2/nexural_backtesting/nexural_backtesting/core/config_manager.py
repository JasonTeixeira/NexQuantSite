"""
Enhanced Configuration Manager for Enterprise Quantitative Backtesting Engine
"""

import os
import yaml
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Union
from dataclasses import dataclass, field
from pydantic import BaseModel, ValidationError, Field
from pydantic_settings import BaseSettings
import json
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)

# Pydantic models for configuration validation
class DatabaseConfig(BaseModel):
    type: str = Field(default="postgresql")
    host: str = Field(default="localhost")
    port: int = Field(default=5432)
    database: str = Field(default="nexural_backtesting")
    username: str = Field(default="nexural_user")
    password: str = Field(default="")
    pool_size: int = Field(default=20)
    max_overflow: int = Field(default=30)

class CacheConfig(BaseModel):
    type: str = Field(default="redis")
    host: str = Field(default="localhost")
    port: int = Field(default=6379)
    password: str = Field(default="")
    db: int = Field(default=0)

class TimeSeriesConfig(BaseModel):
    type: str = Field(default="timescaledb")
    compression: bool = Field(default=True)
    retention_days: int = Field(default=2555)

class FileStorageConfig(BaseModel):
    type: str = Field(default="local")
    path: str = Field(default="./data/storage/")
    compression: str = Field(default="parquet")

class StorageConfig(BaseModel):
    database: DatabaseConfig
    cache: CacheConfig
    timeseries: TimeSeriesConfig
    file_storage: FileStorageConfig

class DataQualityConfig(BaseModel):
    min_data_quality_score: float = Field(default=0.95)
    outlier_detection: bool = Field(default=True)
    missing_data_interpolation: bool = Field(default=True)
    data_validation: bool = Field(default=True)
    cross_source_reconciliation: bool = Field(default=True)

class DataProcessingConfig(BaseModel):
    batch_size: int = Field(default=10000)
    parallel_workers: int = Field(default=4)
    memory_limit_gb: int = Field(default=16)
    enable_gpu: bool = Field(default=False)
    enable_distributed: bool = Field(default=False)

class DataConfig(BaseModel):
    asset_classes: Dict[str, bool]
    sources: Dict[str, str]
    quality: DataQualityConfig
    storage: StorageConfig
    processing: DataProcessingConfig

class ExecutionConfig(BaseModel):
    latency_ms: int = Field(default=5)
    fill_model: str = Field(default="realistic")
    use_real_fills: bool = Field(default=True)
    partial_fills: bool = Field(default=True)
    failed_trades: bool = Field(default=True)
    order_rejections: bool = Field(default=True)

class OrderTypesConfig(BaseModel):
    market: bool = Field(default=True)
    limit: bool = Field(default=True)
    stop: bool = Field(default=True)
    stop_limit: bool = Field(default=True)
    iceberg: bool = Field(default=True)
    twap: bool = Field(default=True)
    vwap: bool = Field(default=True)
    pegged: bool = Field(default=True)

class RiskConfig(BaseModel):
    max_position_pct: float = Field(default=0.10)
    max_daily_loss: float = Field(default=0.02)
    max_drawdown: float = Field(default=0.15)
    stop_loss_pct: float = Field(default=0.02)
    leverage_limit: float = Field(default=2.0)
    concentration_limit: float = Field(default=0.05)
    correlation_limit: float = Field(default=0.7)

class PerformanceConfig(BaseModel):
    enable_parallel: bool = Field(default=True)
    max_workers: int = Field(default=8)
    memory_optimization: bool = Field(default=True)
    cache_results: bool = Field(default=True)
    enable_profiling: bool = Field(default=False)

class BacktestConfig(BaseModel):
    initial_capital: float = Field(default=1000000)
    position_limit: int = Field(default=100)
    commission_per_side: float = Field(default=2.25)
    slippage_model: str = Field(default="calibrated")
    execution: ExecutionConfig
    order_types: OrderTypesConfig
    risk: RiskConfig
    performance: PerformanceConfig

class APIConfig(BaseModel):
    rest: Dict[str, Any]
    websocket: Dict[str, Any]
    grpc: Dict[str, Any]
    message_queue: Dict[str, Any]

class LoggingConfig(BaseModel):
    level: str = Field(default="INFO")
    format: str = Field(default="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    handlers: list = Field(default_factory=list)
    rotation: Dict[str, Any] = Field(default_factory=dict)
    structured: bool = Field(default=True)

class DevelopmentConfig(BaseModel):
    debug: bool = Field(default=False)
    profiling: bool = Field(default=False)
    hot_reload: bool = Field(default=False)
    auto_migrate: bool = Field(default=True)
    seed_data: bool = Field(default=False)

@dataclass
class ConfigValidationResult:
    is_valid: bool
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    validation_timestamp: datetime = field(default_factory=datetime.now)

class EnhancedConfigManager:
    """
    Enhanced configuration manager with validation, environment handling, and security
    """
    
    def __init__(self, config_path: str = "config/config.yaml", environment: str = None):
        """
        Initialize configuration manager
        
        Args:
            config_path: Path to configuration file
            environment: Environment name (development, staging, production)
        """
        self.config_path = Path(config_path)
        self.environment = environment or os.getenv("ENVIRONMENT", "development")
        self.config = {}
        self.validation_result = None
        self.config_hash = None
        
        # Load and validate configuration
        self._load_configuration()
        self._apply_environment_overrides()
        self._validate_configuration()
        self._setup_logging()
        
        logger.info(f"✅ Configuration loaded for environment: {self.environment}")
    
    def _load_configuration(self):
        """Load configuration from YAML file"""
        try:
            if not self.config_path.exists():
                raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
            
            with open(self.config_path, 'r') as f:
                self.config = yaml.safe_load(f)
            
            # Calculate config hash for change detection
            config_str = yaml.dump(self.config, default_flow_style=False)
            self.config_hash = hashlib.md5(config_str.encode()).hexdigest()
            
            logger.info(f"Configuration loaded from: {self.config_path}")
            
        except Exception as e:
            logger.error(f"Failed to load configuration: {e}")
            raise
    
    def _apply_environment_overrides(self):
        """Apply environment-specific overrides"""
        # Load environment-specific config if exists
        env_config_path = self.config_path.parent / f"environments/{self.environment}.yaml"
        
        if env_config_path.exists():
            try:
                with open(env_config_path, 'r') as f:
                    env_config = yaml.safe_load(f)
                
                # Merge environment config with base config
                self._deep_merge(self.config, env_config)
                logger.info(f"Applied environment overrides from: {env_config_path}")
                
            except Exception as e:
                logger.warning(f"Failed to load environment config: {e}")
        
        # Apply environment variables
        self._apply_env_variables()
    
    def _apply_env_variables(self):
        """Apply environment variable overrides"""
        env_mappings = {
            'DATABASE_HOST': ['data', 'storage', 'database', 'host'],
            'DATABASE_PORT': ['data', 'storage', 'database', 'port'],
            'DATABASE_NAME': ['data', 'storage', 'database', 'database'],
            'DATABASE_USER': ['data', 'storage', 'database', 'username'],
            'DATABASE_PASSWORD': ['data', 'storage', 'database', 'password'],
            'REDIS_HOST': ['data', 'storage', 'cache', 'host'],
            'REDIS_PORT': ['data', 'storage', 'cache', 'port'],
            'REDIS_PASSWORD': ['data', 'storage', 'cache', 'password'],
            'LOG_LEVEL': ['logging', 'level'],
            'DEBUG': ['development', 'debug'],
        }
        
        for env_var, config_path in env_mappings.items():
            env_value = os.getenv(env_var)
            if env_value is not None:
                self._set_nested_value(self.config, config_path, env_value)
                logger.debug(f"Applied env override: {env_var} = {env_value}")
    
    def _deep_merge(self, base: dict, override: dict):
        """Deep merge two dictionaries"""
        for key, value in override.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._deep_merge(base[key], value)
            else:
                base[key] = value
    
    def _set_nested_value(self, config: dict, path: list, value: Any):
        """Set nested value in configuration"""
        current = config
        for key in path[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        # Convert value type if needed
        if path[-1] in ['port', 'pool_size', 'max_overflow', 'db', 'batch_size', 'parallel_workers', 'memory_limit_gb', 'max_workers']:
            value = int(value)
        elif path[-1] in ['min_data_quality_score', 'max_position_pct', 'max_daily_loss', 'max_drawdown', 'stop_loss_pct', 'leverage_limit', 'concentration_limit', 'correlation_limit']:
            value = float(value)
        elif path[-1] in ['enable_gpu', 'enable_distributed', 'use_real_fills', 'partial_fills', 'failed_trades', 'order_rejections', 'enable_parallel', 'memory_optimization', 'cache_results', 'enable_profiling', 'debug', 'profiling', 'hot_reload', 'auto_migrate', 'seed_data']:
            value = value.lower() in ['true', '1', 'yes', 'on']
        
        current[path[-1]] = value
    
    def _validate_configuration(self):
        """Validate configuration using Pydantic models"""
        errors = []
        warnings = []
        
        try:
            # Validate data configuration
            if 'data' in self.config:
                DataConfig(**self.config['data'])
            
            # Validate backtest configuration
            if 'backtest' in self.config:
                BacktestConfig(**self.config['backtest'])
            
            # Validate API configuration
            if 'api' in self.config:
                APIConfig(**self.config['api'])
            
            # Validate logging configuration
            if 'logging' in self.config:
                LoggingConfig(**self.config['logging'])
            
            # Validate development configuration
            if 'development' in self.config:
                DevelopmentConfig(**self.config['development'])
            
            # Additional custom validations
            self._custom_validations(errors, warnings)
            
        except ValidationError as e:
            errors.extend([f"Validation error: {err}" for err in e.errors()])
        
        self.validation_result = ConfigValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )
        
        if errors:
            logger.error(f"Configuration validation failed: {errors}")
        if warnings:
            logger.warning(f"Configuration warnings: {warnings}")
    
    def _custom_validations(self, errors: list, warnings: list):
        """Custom validation rules"""
        # Check for placeholder API keys in production
        if self.environment == "production":
            api_keys = self.config.get('api_keys', {})
            for key_name, key_value in api_keys.items():
                if isinstance(key_value, str) and key_value.startswith("PLACEHOLDER"):
                    warnings.append(f"Placeholder API key found in production: {key_name}")
        
        # Validate database connection
        db_config = self.config.get('data', {}).get('storage', {}).get('database', {})
        if db_config.get('password') == "":
            warnings.append("Database password is empty")
        
        # Validate Redis connection
        redis_config = self.config.get('data', {}).get('storage', {}).get('cache', {})
        if redis_config.get('password') == "":
            warnings.append("Redis password is empty")
        
        # Check memory limits
        memory_limit = self.config.get('data', {}).get('processing', {}).get('memory_limit_gb', 16)
        if memory_limit > 64:
            warnings.append(f"High memory limit configured: {memory_limit}GB")
    
    def _setup_logging(self):
        """Setup logging based on configuration"""
        log_config = self.config.get('logging', {})
        
        # Configure logging level
        log_level = getattr(logging, log_config.get('level', 'INFO').upper())
        logging.basicConfig(level=log_level)
        
        # Setup file handler if specified
        handlers = log_config.get('handlers', [])
        for handler in handlers:
            if isinstance(handler, dict) and 'file' in handler:
                file_path = Path(handler['file'])
                file_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Setup rotating file handler
                rotation = log_config.get('rotation', {})
                max_size = rotation.get('max_size', '100MB')
                backup_count = rotation.get('backup_count', 10)
                
                from logging.handlers import RotatingFileHandler
                file_handler = RotatingFileHandler(
                    file_path,
                    maxBytes=self._parse_size(max_size),
                    backupCount=backup_count
                )
                
                formatter = logging.Formatter(log_config.get('format'))
                file_handler.setFormatter(formatter)
                logging.getLogger().addHandler(file_handler)
    
    def _parse_size(self, size_str: str) -> int:
        """Parse size string to bytes"""
        size_str = size_str.upper()
        if size_str.endswith('KB'):
            return int(size_str[:-2]) * 1024
        elif size_str.endswith('MB'):
            return int(size_str[:-2]) * 1024 * 1024
        elif size_str.endswith('GB'):
            return int(size_str[:-2]) * 1024 * 1024 * 1024
        else:
            return int(size_str)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by key (supports dot notation)"""
        keys = key.split('.')
        value = self.config
        
        try:
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return default
    
    def get_section(self, section: str) -> Dict[str, Any]:
        """Get entire configuration section"""
        return self.config.get(section, {})
    
    def get_api_key(self, service: str) -> str:
        """Get API key for specific service"""
        api_keys = self.config.get('api_keys', {})
        return api_keys.get(service, "")
    
    def is_placeholder_key(self, service: str) -> bool:
        """Check if API key is a placeholder"""
        api_key = self.get_api_key(service)
        return isinstance(api_key, str) and api_key.startswith("PLACEHOLDER")
    
    def get_database_url(self) -> str:
        """Get database connection URL"""
        db_config = self.get('data.storage.database')
        if not db_config:
            return ""
        
        return f"postgresql://{db_config['username']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
    
    def get_redis_url(self) -> str:
        """Get Redis connection URL"""
        redis_config = self.get('data.storage.cache')
        if not redis_config:
            return ""
        
        password_part = f":{redis_config['password']}@" if redis_config['password'] else ""
        return f"redis://{password_part}{redis_config['host']}:{redis_config['port']}/{redis_config['db']}"
    
    def validate_api_keys(self) -> Dict[str, bool]:
        """Validate all API keys and return status"""
        api_keys = self.config.get('api_keys', {})
        validation_results = {}
        
        for service, key in api_keys.items():
            if isinstance(key, str) and key.startswith("PLACEHOLDER"):
                validation_results[service] = False
            elif key:
                validation_results[service] = True
            else:
                validation_results[service] = False
        
        return validation_results
    
    def export_config(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Export configuration (optionally excluding sensitive data)"""
        if include_sensitive:
            return self.config.copy()
        
        # Create copy and mask sensitive fields
        export_config = self.config.copy()
        
        # Mask API keys
        if 'api_keys' in export_config:
            for key in export_config['api_keys']:
                if isinstance(export_config['api_keys'][key], str) and not export_config['api_keys'][key].startswith("PLACEHOLDER"):
                    export_config['api_keys'][key] = "***MASKED***"
        
        # Mask database passwords
        sensitive_fields = ['password', 'username', 'host']
        for field in sensitive_fields:
            if 'data' in export_config and 'storage' in export_config['data']:
                for storage_type in ['database', 'cache']:
                    if storage_type in export_config['data']['storage'] and field in export_config['data']['storage'][storage_type]:
                        export_config['data']['storage'][storage_type][field] = "***MASKED***"
        
        return export_config
    
    def reload_config(self) -> bool:
        """Reload configuration from file"""
        try:
            old_hash = self.config_hash
            self._load_configuration()
            
            if self.config_hash != old_hash:
                self._apply_environment_overrides()
                self._validate_configuration()
                logger.info("Configuration reloaded successfully")
                return True
            else:
                logger.info("Configuration unchanged, no reload needed")
                return False
                
        except Exception as e:
            logger.error(f"Failed to reload configuration: {e}")
            return False
    
    def get_validation_result(self) -> ConfigValidationResult:
        """Get configuration validation result"""
        return self.validation_result
    
    def is_valid(self) -> bool:
        """Check if configuration is valid"""
        return self.validation_result.is_valid if self.validation_result else False