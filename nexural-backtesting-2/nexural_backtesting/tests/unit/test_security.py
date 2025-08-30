"""
Unit tests for security module
"""

import pytest
import os
import tempfile
from unittest.mock import patch, mock_open
import yaml

from core.security import SecurityManager, AuditLogger


class TestSecurityManager:
    """Test SecurityManager functionality"""
    
    def test_initialization_with_environment(self, mock_environment_vars):
        """Test SecurityManager initialization with environment variables"""
        security_manager = SecurityManager(environment='testing')
        
        assert security_manager.environment == 'testing'
        assert security_manager._cipher_suite is not None
    
    def test_get_api_key_valid(self, mock_environment_vars):
        """Test retrieving valid API keys"""
        security_manager = SecurityManager()
        
        # Test valid API key retrieval
        databento_key = security_manager.get_api_key('databento')
        assert databento_key == 'test_databento_key_12345'
        
        claude_key = security_manager.get_api_key('claude')
        assert claude_key == 'test_claude_key_12345'
    
    def test_get_api_key_invalid_service(self, mock_environment_vars):
        """Test retrieving API key for invalid service"""
        security_manager = SecurityManager()
        
        result = security_manager.get_api_key('invalid_service')
        assert result is None
    
    def test_get_api_key_missing_env_var(self):
        """Test retrieving API key when environment variable is missing"""
        security_manager = SecurityManager()
        
        result = security_manager.get_api_key('databento')
        assert result is None
    
    def test_validate_api_key_valid(self, mock_environment_vars):
        """Test API key validation with valid keys"""
        security_manager = SecurityManager()
        
        # Valid key
        assert security_manager._validate_api_key('databento', 'valid_key_12345')
        
        # Invalid keys (too short)
        assert not security_manager._validate_api_key('databento', 'short')
        
        # Invalid keys (placeholder values)
        assert not security_manager._validate_api_key('databento', 'YOUR_API_KEY')
        assert not security_manager._validate_api_key('databento', 'your_key_here')
        assert not security_manager._validate_api_key('databento', 'test_key')
    
    def test_encryption_decryption(self, mock_environment_vars):
        """Test data encryption and decryption"""
        security_manager = SecurityManager()
        
        original_data = "sensitive_trading_data_12345"
        
        # Encrypt data
        encrypted = security_manager.encrypt_data(original_data)
        assert encrypted != original_data
        assert len(encrypted) > len(original_data)
        
        # Decrypt data
        decrypted = security_manager.decrypt_data(encrypted)
        assert decrypted == original_data
    
    def test_load_secure_config(self, mock_environment_vars, temp_config_file):
        """Test loading configuration with secure API key replacement"""
        security_manager = SecurityManager()
        
        config = security_manager.load_secure_config(temp_config_file)
        
        # Check that API keys were replaced with environment variables
        assert config['api_keys']['databento'] == 'test_databento_key_12345'
        assert config['api_keys']['claude'] == 'test_claude_key_12345'
        assert config['api_keys']['quantconnect']['user_id'] == 'test_qc_user_12345'
        assert config['api_keys']['quantconnect']['token'] == 'test_qc_token_12345'
        
        # Check environment-specific settings
        assert config['environment'] == 'testing'
        assert 'debug' in config
    
    def test_load_secure_config_missing_file(self, mock_environment_vars):
        """Test loading configuration with missing file"""
        security_manager = SecurityManager()
        
        with pytest.raises(FileNotFoundError):
            security_manager.load_secure_config('nonexistent_file.yaml')


class TestAuditLogger:
    """Test AuditLogger functionality"""
    
    def test_initialization(self):
        """Test AuditLogger initialization"""
        with tempfile.NamedTemporaryFile(suffix='.log', delete=False) as f:
            log_file = f.name
        
        try:
            audit_logger = AuditLogger(log_file)
            assert audit_logger.log_file == log_file
            assert audit_logger.audit_logger is not None
        finally:
            os.unlink(log_file)
    
    def test_log_api_access(self):
        """Test API access logging"""
        with tempfile.NamedTemporaryFile(suffix='.log', delete=False) as f:
            log_file = f.name
        
        try:
            audit_logger = AuditLogger(log_file)
            
            # Test successful API access
            audit_logger.log_api_access('databento', 'fetch_data', True, 'ES symbol')
            
            # Test failed API access
            audit_logger.log_api_access('claude', 'analyze', False, 'Rate limit exceeded')
            
            # Check log file was created and has content
            assert os.path.exists(log_file)
            with open(log_file, 'r') as f:
                log_content = f.read()
                assert 'API_ACCESS' in log_content
                assert 'databento' in log_content
                assert 'SUCCESS' in log_content
                assert 'FAILURE' in log_content
        
        finally:
            os.unlink(log_file)
    
    def test_log_data_access(self):
        """Test data access logging"""
        with tempfile.NamedTemporaryFile(suffix='.log', delete=False) as f:
            log_file = f.name
        
        try:
            audit_logger = AuditLogger(log_file)
            
            audit_logger.log_data_access('databento', 'ES', '2023-01-01:2023-12-31', 'test_user')
            
            # Check log file content
            with open(log_file, 'r') as f:
                log_content = f.read()
                assert 'DATA_ACCESS' in log_content
                assert 'databento' in log_content
                assert 'ES' in log_content
                assert 'test_user' in log_content
        
        finally:
            os.unlink(log_file)
    
    def test_log_backtest_execution(self):
        """Test backtest execution logging"""
        with tempfile.NamedTemporaryFile(suffix='.log', delete=False) as f:
            log_file = f.name
        
        try:
            audit_logger = AuditLogger(log_file)
            
            results = {
                'total_return': 0.15,
                'sharpe_ratio': 1.8
            }
            parameters = {'param1': 10, 'param2': 0.5}
            
            audit_logger.log_backtest_execution('MomentumStrategy', 'ES', parameters, results)
            
            # Check log file content
            with open(log_file, 'r') as f:
                log_content = f.read()
                assert 'BACKTEST_EXECUTION' in log_content
                assert 'MomentumStrategy' in log_content
                assert 'ES' in log_content
                assert '15.00%' in log_content
                assert '1.80' in log_content
        
        finally:
            os.unlink(log_file)


class TestSecurityIntegration:
    """Integration tests for security components"""
    
    def test_end_to_end_secure_workflow(self, mock_environment_vars, temp_config_file):
        """Test complete secure workflow from config loading to audit logging"""
        # Initialize components
        security_manager = SecurityManager()
        
        with tempfile.NamedTemporaryFile(suffix='.log', delete=False) as f:
            audit_log_file = f.name
        
        try:
            audit_logger = AuditLogger(audit_log_file)
            
            # Load secure configuration
            config = security_manager.load_secure_config(temp_config_file)
            
            # Simulate API access
            databento_key = security_manager.get_api_key('databento')
            assert databento_key is not None
            
            # Log the access
            audit_logger.log_api_access('databento', 'load_data', True, 'Configuration loaded successfully')
            
            # Encrypt sensitive data
            sensitive_data = f"API_KEY:{databento_key}"
            encrypted_data = security_manager.encrypt_data(sensitive_data)
            decrypted_data = security_manager.decrypt_data(encrypted_data)
            
            assert decrypted_data == sensitive_data
            
            # Verify audit log
            with open(audit_log_file, 'r') as f:
                log_content = f.read()
                assert 'Configuration loaded successfully' in log_content
        
        finally:
            os.unlink(audit_log_file)