"""
Enterprise-grade error handling, logging, and exception management
"""

import logging
import logging.handlers
import traceback
import sys
import functools
from typing import Dict, Any, Optional, Callable, Type, Union
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import json
import os
from pathlib import Path


class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorCategory(Enum):
    """Error categories for classification"""
    DATA_ERROR = "data_error"
    API_ERROR = "api_error"
    CALCULATION_ERROR = "calculation_error"
    CONFIGURATION_ERROR = "configuration_error"
    SYSTEM_ERROR = "system_error"
    VALIDATION_ERROR = "validation_error"
    NETWORK_ERROR = "network_error"
    SECURITY_ERROR = "security_error"


@dataclass
class ErrorContext:
    """Context information for errors"""
    timestamp: datetime
    severity: ErrorSeverity
    category: ErrorCategory
    component: str
    operation: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    additional_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ErrorReport:
    """Comprehensive error report"""
    error_id: str
    context: ErrorContext
    exception_type: str
    exception_message: str
    traceback_info: str
    recovery_attempted: bool = False
    recovery_successful: bool = False
    impact_assessment: str = ""


class BacktestException(Exception):
    """Base exception for backtesting system"""
    
    def __init__(self, message: str, category: ErrorCategory = ErrorCategory.SYSTEM_ERROR,
                 severity: ErrorSeverity = ErrorSeverity.MEDIUM, context: Dict[str, Any] = None):
        super().__init__(message)
        self.category = category
        self.severity = severity
        self.context = context or {}
        self.timestamp = datetime.now()


class DataQualityException(BacktestException):
    """Exception for data quality issues"""
    
    def __init__(self, message: str, data_source: str = None, symbol: str = None, 
                 quality_score: float = None, **kwargs):
        super().__init__(message, ErrorCategory.DATA_ERROR, ErrorSeverity.HIGH, **kwargs)
        self.data_source = data_source
        self.symbol = symbol
        self.quality_score = quality_score


class APIException(BacktestException):
    """Exception for API-related errors"""
    
    def __init__(self, message: str, api_name: str = None, status_code: int = None,
                 retry_count: int = 0, **kwargs):
        super().__init__(message, ErrorCategory.API_ERROR, ErrorSeverity.MEDIUM, **kwargs)
        self.api_name = api_name
        self.status_code = status_code
        self.retry_count = retry_count


class CalculationException(BacktestException):
    """Exception for calculation errors"""
    
    def __init__(self, message: str, calculation_type: str = None, input_data: Dict = None, **kwargs):
        super().__init__(message, ErrorCategory.CALCULATION_ERROR, ErrorSeverity.HIGH, **kwargs)
        self.calculation_type = calculation_type
        self.input_data = input_data


class ConfigurationException(BacktestException):
    """Exception for configuration errors"""
    
    def __init__(self, message: str, config_file: str = None, config_key: str = None, **kwargs):
        super().__init__(message, ErrorCategory.CONFIGURATION_ERROR, ErrorSeverity.HIGH, **kwargs)
        self.config_file = config_file
        self.config_key = config_key


class ValidationException(BacktestException):
    """Exception for validation errors"""
    
    def __init__(self, message: str, validation_type: str = None, **kwargs):
        super().__init__(message, ErrorCategory.VALIDATION_ERROR, ErrorSeverity.MEDIUM, **kwargs)
        self.validation_type = validation_type


class ErrorHandler:
    """
    Centralized error handling and logging system
    """
    
    def __init__(self, log_dir: str = "logs", max_log_size_mb: int = 100):
        """
        Initialize error handler
        
        Args:
            log_dir: Directory for log files
            max_log_size_mb: Maximum log file size in MB
        """
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        self.max_log_size = max_log_size_mb * 1024 * 1024
        
        self.error_reports: Dict[str, ErrorReport] = {}
        self.error_counts: Dict[ErrorCategory, int] = {cat: 0 for cat in ErrorCategory}
        
        self._setup_logging()
        self._setup_error_handlers()
        
        self.logger = logging.getLogger(__name__)
        self.logger.info("Error handler initialized")
    
    def _setup_logging(self):
        """Setup comprehensive logging configuration"""
        # Create formatters
        detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        
        json_formatter = JsonFormatter()
        
        # Setup main application logger
        app_logger = logging.getLogger('backtesting')
        app_logger.setLevel(logging.INFO)
        
        # File handler for general logs
        app_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / 'application.log',
            maxBytes=self.max_log_size,
            backupCount=5
        )
        app_handler.setFormatter(detailed_formatter)
        app_logger.addHandler(app_handler)
        
        # File handler for errors (JSON format)
        error_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / 'errors.jsonl',
            maxBytes=self.max_log_size,
            backupCount=10
        )
        error_handler.setFormatter(json_formatter)
        error_handler.setLevel(logging.ERROR)
        
        # Setup error logger
        error_logger = logging.getLogger('backtesting.errors')
        error_logger.addHandler(error_handler)
        error_logger.setLevel(logging.ERROR)
        
        # Console handler for development
        if os.getenv('ENVIRONMENT', 'production') == 'development':
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(detailed_formatter)
            app_logger.addHandler(console_handler)
        
        # Performance logger
        perf_logger = logging.getLogger('backtesting.performance')
        perf_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / 'performance.log',
            maxBytes=self.max_log_size,
            backupCount=3
        )
        perf_handler.setFormatter(detailed_formatter)
        perf_logger.addHandler(perf_handler)
        perf_logger.setLevel(logging.INFO)
    
    def _setup_error_handlers(self):
        """Setup system-level error handlers"""
        # Handle uncaught exceptions
        def handle_exception(exc_type, exc_value, exc_traceback):
            if issubclass(exc_type, KeyboardInterrupt):
                sys.__excepthook__(exc_type, exc_value, exc_traceback)
                return
            
            self.handle_exception(
                exc_value,
                context=ErrorContext(
                    timestamp=datetime.now(),
                    severity=ErrorSeverity.CRITICAL,
                    category=ErrorCategory.SYSTEM_ERROR,
                    component="system",
                    operation="uncaught_exception"
                )
            )
        
        sys.excepthook = handle_exception
    
    def handle_exception(self, exception: Exception, context: ErrorContext = None,
                        attempt_recovery: bool = True) -> Optional[ErrorReport]:
        """
        Handle and log exceptions with comprehensive error reporting
        
        Args:
            exception: The exception to handle
            context: Error context information
            attempt_recovery: Whether to attempt automatic recovery
            
        Returns:
            ErrorReport if error was handled, None if re-raised
        """
        # Generate unique error ID
        error_id = f"ERR_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{id(exception)}"
        
        # Create context if not provided
        if context is None:
            context = ErrorContext(
                timestamp=datetime.now(),
                severity=ErrorSeverity.MEDIUM,
                category=ErrorCategory.SYSTEM_ERROR,
                component="unknown",
                operation="unknown"
            )
        
        # Extract exception information
        exception_type = type(exception).__name__
        exception_message = str(exception)
        traceback_info = traceback.format_exc()
        
        # Create error report
        error_report = ErrorReport(
            error_id=error_id,
            context=context,
            exception_type=exception_type,
            exception_message=exception_message,
            traceback_info=traceback_info
        )
        
        # Attempt recovery if requested
        if attempt_recovery:
            recovery_result = self._attempt_recovery(exception, context)
            error_report.recovery_attempted = True
            error_report.recovery_successful = recovery_result
        
        # Assess impact
        error_report.impact_assessment = self._assess_impact(exception, context)
        
        # Log the error
        self._log_error(error_report)
        
        # Store error report
        self.error_reports[error_id] = error_report
        self.error_counts[context.category] += 1
        
        # Determine if we should re-raise based on severity and recovery
        if context.severity == ErrorSeverity.CRITICAL or not error_report.recovery_successful:
            if isinstance(exception, BacktestException):
                raise exception
            else:
                raise BacktestException(
                    f"Unhandled {exception_type}: {exception_message}",
                    context.category,
                    context.severity
                ) from exception
        
        return error_report
    
    def _attempt_recovery(self, exception: Exception, context: ErrorContext) -> bool:
        """
        Attempt automatic recovery from errors
        
        Args:
            exception: The exception to recover from
            context: Error context
            
        Returns:
            True if recovery was successful
        """
        recovery_strategies = {
            ErrorCategory.DATA_ERROR: self._recover_data_error,
            ErrorCategory.API_ERROR: self._recover_api_error,
            ErrorCategory.CALCULATION_ERROR: self._recover_calculation_error,
            ErrorCategory.NETWORK_ERROR: self._recover_network_error
        }
        
        strategy = recovery_strategies.get(context.category)
        if strategy:
            try:
                return strategy(exception, context)
            except Exception as recovery_exception:
                self.logger.error(f"Recovery attempt failed: {recovery_exception}")
                return False
        
        return False
    
    def _recover_data_error(self, exception: Exception, context: ErrorContext) -> bool:
        """Attempt recovery from data errors"""
        # Implement data error recovery logic
        if isinstance(exception, DataQualityException):
            # Could attempt data cleaning or use backup data source
            self.logger.info(f"Attempting data error recovery for {context.operation}")
            # Placeholder for actual recovery logic
            return False
        return False
    
    def _recover_api_error(self, exception: Exception, context: ErrorContext) -> bool:
        """Attempt recovery from API errors"""
        if isinstance(exception, APIException):
            # Could implement retry logic with exponential backoff
            if exception.retry_count < 3:
                self.logger.info(f"Attempting API retry {exception.retry_count + 1}/3")
                # Placeholder for retry logic
                return False
        return False
    
    def _recover_calculation_error(self, exception: Exception, context: ErrorContext) -> bool:
        """Attempt recovery from calculation errors"""
        # Could use alternative calculation methods or default values
        self.logger.info(f"Attempting calculation error recovery for {context.operation}")
        return False
    
    def _recover_network_error(self, exception: Exception, context: ErrorContext) -> bool:
        """Attempt recovery from network errors"""
        # Could switch to backup endpoints or cached data
        self.logger.info(f"Attempting network error recovery for {context.operation}")
        return False
    
    def _assess_impact(self, exception: Exception, context: ErrorContext) -> str:
        """
        Assess the impact of an error
        
        Args:
            exception: The exception
            context: Error context
            
        Returns:
            Impact assessment string
        """
        impact_levels = {
            ErrorSeverity.LOW: "Minimal impact - operation can continue with degraded functionality",
            ErrorSeverity.MEDIUM: "Moderate impact - some features may be unavailable",
            ErrorSeverity.HIGH: "High impact - core functionality affected",
            ErrorSeverity.CRITICAL: "Critical impact - system operation compromised"
        }
        
        base_impact = impact_levels[context.severity]
        
        # Add specific impact details based on category
        if context.category == ErrorCategory.DATA_ERROR:
            base_impact += " - Data quality or availability issues detected"
        elif context.category == ErrorCategory.API_ERROR:
            base_impact += " - External service integration affected"
        elif context.category == ErrorCategory.CALCULATION_ERROR:
            base_impact += " - Mathematical calculations may be incorrect"
        
        return base_impact
    
    def _log_error(self, error_report: ErrorReport):
        """
        Log error report to appropriate loggers
        
        Args:
            error_report: The error report to log
        """
        # Log to error logger (JSON format)
        error_logger = logging.getLogger('backtesting.errors')
        error_data = {
            'error_id': error_report.error_id,
            'timestamp': error_report.context.timestamp.isoformat(),
            'severity': error_report.context.severity.value,
            'category': error_report.context.category.value,
            'component': error_report.context.component,
            'operation': error_report.context.operation,
            'exception_type': error_report.exception_type,
            'exception_message': error_report.exception_message,
            'recovery_attempted': error_report.recovery_attempted,
            'recovery_successful': error_report.recovery_successful,
            'impact_assessment': error_report.impact_assessment
        }
        
        error_logger.error(json.dumps(error_data))
        
        # Log to main application logger
        app_logger = logging.getLogger('backtesting')
        log_level = {
            ErrorSeverity.LOW: logging.INFO,
            ErrorSeverity.MEDIUM: logging.WARNING,
            ErrorSeverity.HIGH: logging.ERROR,
            ErrorSeverity.CRITICAL: logging.CRITICAL
        }[error_report.context.severity]
        
        app_logger.log(
            log_level,
            f"[{error_report.error_id}] {error_report.context.category.value.upper()} in "
            f"{error_report.context.component}.{error_report.context.operation}: "
            f"{error_report.exception_message}"
        )
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """
        Get error statistics
        
        Returns:
            Dictionary with error statistics
        """
        total_errors = sum(self.error_counts.values())
        
        return {
            'total_errors': total_errors,
            'error_counts_by_category': {cat.value: count for cat, count in self.error_counts.items()},
            'recent_errors': len([
                report for report in self.error_reports.values()
                if (datetime.now() - report.context.timestamp).total_seconds() < 3600  # Last hour
            ]),
            'critical_errors': len([
                report for report in self.error_reports.values()
                if report.context.severity == ErrorSeverity.CRITICAL
            ]),
            'recovery_success_rate': self._calculate_recovery_rate()
        }
    
    def _calculate_recovery_rate(self) -> float:
        """Calculate recovery success rate"""
        recovery_attempts = [r for r in self.error_reports.values() if r.recovery_attempted]
        if not recovery_attempts:
            return 0.0
        
        successful_recoveries = [r for r in recovery_attempts if r.recovery_successful]
        return len(successful_recoveries) / len(recovery_attempts)


class JsonFormatter(logging.Formatter):
    """JSON formatter for structured logging"""
    
    def format(self, record):
        log_entry = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
            'message': record.getMessage()
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry)


def error_handler_decorator(category: ErrorCategory = ErrorCategory.SYSTEM_ERROR,
                          severity: ErrorSeverity = ErrorSeverity.MEDIUM,
                          component: str = None,
                          attempt_recovery: bool = True):
    """
    Decorator for automatic error handling
    
    Args:
        category: Error category
        severity: Error severity
        component: Component name
        attempt_recovery: Whether to attempt recovery
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                context = ErrorContext(
                    timestamp=datetime.now(),
                    severity=severity,
                    category=category,
                    component=component or func.__module__,
                    operation=func.__name__
                )
                
                # Get global error handler
                error_handler = getattr(wrapper, '_error_handler', None)
                if error_handler is None:
                    error_handler = ErrorHandler()
                    wrapper._error_handler = error_handler
                
                error_handler.handle_exception(e, context, attempt_recovery)
        
        return wrapper
    return decorator


def log_performance(operation: str):
    """
    Decorator for performance logging
    
    Args:
        operation: Operation name
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            perf_logger = logging.getLogger('backtesting.performance')
            
            import time
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                
                perf_logger.info(
                    f"PERFORMANCE - {operation} in {func.__name__} completed in {duration:.3f}s"
                )
                
                return result
                
            except Exception as e:
                duration = time.time() - start_time
                perf_logger.warning(
                    f"PERFORMANCE - {operation} in {func.__name__} failed after {duration:.3f}s: {str(e)}"
                )
                raise
        
        return wrapper
    return decorator


# Global error handler instance
global_error_handler = ErrorHandler()