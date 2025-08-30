"""
Unit tests for monitoring module
"""

import pytest
import time
import tempfile
import os
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

from core.monitoring import (
    MetricsCollector, MetricPoint, Alert, PerformanceProfiler,
    HealthChecker, AlertManager, MonitoringDashboard
)


class TestMetricPoint:
    """Test MetricPoint data class"""
    
    def test_metric_point_creation(self):
        """Test MetricPoint creation and attributes"""
        timestamp = datetime.now()
        point = MetricPoint(timestamp, 42.5, {'label1': 'value1'})
        
        assert point.timestamp == timestamp
        assert point.value == 42.5
        assert point.labels == {'label1': 'value1'}
    
    def test_metric_point_default_labels(self):
        """Test MetricPoint with default empty labels"""
        timestamp = datetime.now()
        point = MetricPoint(timestamp, 10.0)
        
        assert point.labels == {}


class TestAlert:
    """Test Alert data class"""
    
    def test_alert_creation(self):
        """Test Alert creation and attributes"""
        condition = lambda x: x > 80
        alert = Alert("High CPU", condition, "CPU usage is high", "warning", 10)
        
        assert alert.name == "High CPU"
        assert alert.condition(90) == True
        assert alert.condition(70) == False
        assert alert.message == "CPU usage is high"
        assert alert.severity == "warning"
        assert alert.cooldown_minutes == 10
        assert alert.last_triggered is None


class TestMetricsCollector:
    """Test MetricsCollector functionality"""
    
    def test_initialization(self):
        """Test MetricsCollector initialization"""
        collector = MetricsCollector(retention_hours=12)
        
        assert collector.retention_hours == 12
        assert len(collector.metrics) == 0
        assert len(collector.alerts) == 0
        assert not collector._running
    
    def test_record_metric(self):
        """Test recording metrics"""
        collector = MetricsCollector()
        timestamp = datetime.now()
        
        collector.record_metric("test_metric", 42.5, timestamp, {"env": "test"})
        
        assert "test_metric" in collector.metrics
        assert len(collector.metrics["test_metric"]) == 1
        
        point = collector.metrics["test_metric"][0]
        assert point.value == 42.5
        assert point.timestamp == timestamp
        assert point.labels == {"env": "test"}
    
    def test_record_metric_default_timestamp(self):
        """Test recording metrics with default timestamp"""
        collector = MetricsCollector()
        
        collector.record_metric("test_metric", 10.0)
        
        point = collector.metrics["test_metric"][0]
        assert isinstance(point.timestamp, datetime)
        assert abs((datetime.now() - point.timestamp).total_seconds()) < 1
    
    def test_get_metric_values(self):
        """Test retrieving metric values"""
        collector = MetricsCollector()
        now = datetime.now()
        
        # Record metrics at different times
        collector.record_metric("test_metric", 1.0, now - timedelta(hours=2))
        collector.record_metric("test_metric", 2.0, now - timedelta(minutes=30))
        collector.record_metric("test_metric", 3.0, now)
        
        # Get last hour
        recent_points = collector.get_metric_values("test_metric", hours_back=1)
        assert len(recent_points) == 2  # Last two points
        
        # Get all points
        all_points = collector.get_metric_values("test_metric", hours_back=24)
        assert len(all_points) == 3
    
    def test_get_metric_summary(self):
        """Test metric summary statistics"""
        collector = MetricsCollector()
        now = datetime.now()
        
        # Record some test data
        values = [10.0, 20.0, 30.0, 40.0, 50.0]
        for i, value in enumerate(values):
            collector.record_metric("test_metric", value, now - timedelta(minutes=i))
        
        summary = collector.get_metric_summary("test_metric", hours_back=1)
        
        assert summary['count'] == 5
        assert summary['mean'] == 30.0
        assert summary['median'] == 30.0
        assert summary['min'] == 10.0
        assert summary['max'] == 50.0
        assert summary['latest'] == 10.0  # Most recent (last recorded)
    
    def test_get_metric_summary_empty(self):
        """Test metric summary for non-existent metric"""
        collector = MetricsCollector()
        
        summary = collector.get_metric_summary("nonexistent_metric")
        assert summary == {}
    
    def test_add_alert(self):
        """Test adding alerts"""
        collector = MetricsCollector()
        alert = Alert("test_alert", lambda x: x > 50, "Test alert")
        
        collector.add_alert(alert)
        
        assert "test_alert" in collector.alerts
        assert collector.alerts["test_alert"] == alert
    
    @patch('psutil.cpu_percent')
    @patch('psutil.virtual_memory')
    @patch('psutil.disk_usage')
    @patch('psutil.Process')
    def test_collect_system_metrics(self, mock_process, mock_disk, mock_memory, mock_cpu):
        """Test system metrics collection"""
        # Mock system metrics
        mock_cpu.return_value = 45.5
        
        mock_memory_obj = MagicMock()
        mock_memory_obj.percent = 60.0
        mock_memory_obj.available = 8 * 1024**3  # 8GB
        mock_memory.return_value = mock_memory_obj
        
        mock_disk_obj = MagicMock()
        mock_disk_obj.used = 500 * 1024**3  # 500GB
        mock_disk_obj.total = 1000 * 1024**3  # 1TB
        mock_disk.return_value = mock_disk_obj
        
        mock_process_obj = MagicMock()
        mock_process_obj.memory_info.return_value.rss = 512 * 1024**2  # 512MB
        mock_process_obj.cpu_percent.return_value = 15.0
        mock_process.return_value = mock_process_obj
        
        collector = MetricsCollector()
        collector._collect_system_metrics()
        
        # Check that system metrics were recorded
        assert "system_cpu_percent" in collector.metrics
        assert "system_memory_percent" in collector.metrics
        assert "system_disk_percent" in collector.metrics
        assert "process_memory_mb" in collector.metrics
        assert "process_cpu_percent" in collector.metrics
        
        # Check values
        assert collector.metrics["system_cpu_percent"][-1].value == 45.5
        assert collector.metrics["system_memory_percent"][-1].value == 60.0
        assert abs(collector.metrics["process_memory_mb"][-1].value - 512.0) < 1.0


class TestPerformanceProfiler:
    """Test PerformanceProfiler functionality"""
    
    def test_initialization(self):
        """Test PerformanceProfiler initialization"""
        collector = MetricsCollector()
        profiler = PerformanceProfiler(collector)
        
        assert profiler.metrics_collector == collector
        assert len(profiler.timers) == 0
        assert len(profiler.counters) == 0
    
    def test_timer_functionality(self):
        """Test timer start/end functionality"""
        collector = MetricsCollector()
        profiler = PerformanceProfiler(collector)
        
        # Start timer
        profiler.start_timer("test_operation")
        assert "test_operation" in profiler.timers
        
        # Simulate some work
        time.sleep(0.01)
        
        # End timer
        duration = profiler.end_timer("test_operation")
        
        assert duration > 0
        assert "test_operation" not in profiler.timers
        assert "timer_test_operation_seconds" in collector.metrics
    
    def test_timer_nonexistent(self):
        """Test ending non-existent timer"""
        collector = MetricsCollector()
        profiler = PerformanceProfiler(collector)
        
        result = profiler.end_timer("nonexistent_timer")
        assert result is None
    
    def test_counter_functionality(self):
        """Test counter increment functionality"""
        collector = MetricsCollector()
        profiler = PerformanceProfiler(collector)
        
        # Increment counter
        profiler.increment_counter("test_counter", 5)
        assert profiler.counters["test_counter"] == 5
        assert "counter_test_counter" in collector.metrics
        
        # Increment again
        profiler.increment_counter("test_counter", 3)
        assert profiler.counters["test_counter"] == 8
    
    def test_profile_function_decorator(self):
        """Test function profiling decorator"""
        collector = MetricsCollector()
        profiler = PerformanceProfiler(collector)
        
        @profiler.profile_function("test_function")
        def test_function(x, y):
            time.sleep(0.01)
            return x + y
        
        result = test_function(2, 3)
        
        assert result == 5
        assert "timer_test_function_seconds" in collector.metrics
        assert collector.metrics["timer_test_function_seconds"][-1].value > 0


class TestHealthChecker:
    """Test HealthChecker functionality"""
    
    def test_initialization(self):
        """Test HealthChecker initialization"""
        collector = MetricsCollector()
        checker = HealthChecker(collector)
        
        assert checker.metrics_collector == collector
        assert len(checker.checks) > 0  # Default checks registered
        assert "cpu_usage" in checker.checks
        assert "memory_usage" in checker.checks
    
    def test_register_check(self):
        """Test registering custom health checks"""
        collector = MetricsCollector()
        checker = HealthChecker(collector)
        
        def custom_check():
            return True
        
        checker.register_check("custom_check", custom_check)
        
        assert "custom_check" in checker.checks
        assert checker.checks["custom_check"] == custom_check
    
    @patch('psutil.cpu_percent')
    @patch('psutil.virtual_memory')
    @patch('psutil.disk_usage')
    def test_run_all_checks_healthy(self, mock_disk, mock_memory, mock_cpu):
        """Test running all health checks when system is healthy"""
        # Mock healthy system
        mock_cpu.return_value = 50.0  # < 90%
        
        mock_memory_obj = MagicMock()
        mock_memory_obj.percent = 70.0  # < 90%
        mock_memory.return_value = mock_memory_obj
        
        mock_disk_obj = MagicMock()
        mock_disk_obj.used = 400 * 1024**3
        mock_disk_obj.total = 1000 * 1024**3  # 40% usage < 90%
        mock_disk.return_value = mock_disk_obj
        
        collector = MetricsCollector()
        checker = HealthChecker(collector)
        
        results = checker.run_all_checks()
        
        assert all(results.values())  # All checks should pass
        assert checker.is_healthy()
    
    @patch('psutil.cpu_percent')
    def test_run_all_checks_unhealthy(self, mock_cpu):
        """Test running health checks when system is unhealthy"""
        # Mock unhealthy CPU
        mock_cpu.return_value = 95.0  # > 90%
        
        collector = MetricsCollector()
        checker = HealthChecker(collector)
        
        results = checker.run_all_checks()
        
        assert not results["cpu_usage"]  # CPU check should fail
        assert not checker.is_healthy()


class TestAlertManager:
    """Test AlertManager functionality"""
    
    def test_initialization(self):
        """Test AlertManager initialization"""
        with tempfile.NamedTemporaryFile(suffix='.log', delete=False) as f:
            log_file = f.name
        
        try:
            manager = AlertManager(log_file)
            assert manager.log_file == log_file
            assert manager.alert_log is not None
        finally:
            os.unlink(log_file)
    
    def test_handle_alert(self):
        """Test alert handling"""
        with tempfile.NamedTemporaryFile(suffix='.log', delete=False) as f:
            log_file = f.name
        
        try:
            manager = AlertManager(log_file)
            alert = Alert("test_alert", lambda x: x > 50, "Test alert message", "warning")
            
            manager.handle_alert("test_metric", alert, 75.0)
            
            # Check log file
            with open(log_file, 'r') as f:
                log_content = f.read()
                assert "test_alert" in log_content
                assert "Test alert message" in log_content
                assert "75.00" in log_content
        
        finally:
            os.unlink(log_file)


class TestMonitoringDashboard:
    """Test MonitoringDashboard functionality"""
    
    def test_initialization(self):
        """Test MonitoringDashboard initialization"""
        collector = MetricsCollector()
        checker = HealthChecker(collector)
        dashboard = MonitoringDashboard(collector, checker)
        
        assert dashboard.metrics_collector == collector
        assert dashboard.health_checker == checker
    
    @patch('psutil.cpu_percent')
    @patch('psutil.virtual_memory')
    @patch('psutil.disk_usage')
    def test_get_dashboard_data(self, mock_disk, mock_memory, mock_cpu):
        """Test getting dashboard data"""
        # Mock system metrics
        mock_cpu.return_value = 45.0
        
        mock_memory_obj = MagicMock()
        mock_memory_obj.percent = 60.0
        mock_memory_obj.available = 8 * 1024**3
        mock_memory.return_value = mock_memory_obj
        
        mock_disk_obj = MagicMock()
        mock_disk_obj.used = 500 * 1024**3
        mock_disk_obj.total = 1000 * 1024**3
        mock_disk.return_value = mock_disk_obj
        
        collector = MetricsCollector()
        checker = HealthChecker(collector)
        dashboard = MonitoringDashboard(collector, checker)
        
        # Add some test metrics
        collector.record_metric("system_cpu_percent", 45.0)
        collector.record_metric("timer_test_operation_seconds", 0.5)
        
        data = dashboard.get_dashboard_data()
        
        assert 'timestamp' in data
        assert 'overall_health' in data
        assert 'health_checks' in data
        assert 'system_metrics' in data
        assert 'performance_metrics' in data
        assert 'alerts_active' in data
        
        assert isinstance(data['overall_health'], bool)
        assert isinstance(data['system_metrics'], dict)
    
    def test_export_metrics_csv(self):
        """Test exporting metrics to CSV"""
        collector = MetricsCollector()
        checker = HealthChecker(collector)
        dashboard = MonitoringDashboard(collector, checker)
        
        # Add test metrics
        collector.record_metric("test_metric1", 10.0)
        collector.record_metric("test_metric2", 20.0)
        
        with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as f:
            output_path = f.name
        
        try:
            dashboard.export_metrics_csv(output_path, hours_back=1)
            
            # Check file was created and has content
            assert os.path.exists(output_path)
            
            with open(output_path, 'r') as f:
                content = f.read()
                assert 'metric_name' in content
                assert 'test_metric1' in content
                assert 'test_metric2' in content
        
        finally:
            os.unlink(output_path)


class TestMonitoringIntegration:
    """Integration tests for monitoring components"""
    
    @patch('psutil.cpu_percent')
    @patch('psutil.virtual_memory')
    @patch('psutil.disk_usage')
    @patch('psutil.Process')
    def test_end_to_end_monitoring(self, mock_process, mock_disk, mock_memory, mock_cpu):
        """Test complete monitoring workflow"""
        # Mock system metrics
        mock_cpu.return_value = 85.0  # High CPU to trigger alert
        
        mock_memory_obj = MagicMock()
        mock_memory_obj.percent = 70.0
        mock_memory_obj.available = 8 * 1024**3
        mock_memory.return_value = mock_memory_obj
        
        mock_disk_obj = MagicMock()
        mock_disk_obj.used = 500 * 1024**3
        mock_disk_obj.total = 1000 * 1024**3
        mock_disk.return_value = mock_disk_obj
        
        mock_process_obj = MagicMock()
        mock_process_obj.memory_info.return_value.rss = 512 * 1024**2
        mock_process_obj.cpu_percent.return_value = 15.0
        mock_process.return_value = mock_process_obj
        
        # Initialize components
        collector = MetricsCollector()
        profiler = PerformanceProfiler(collector)
        checker = HealthChecker(collector)
        
        with tempfile.NamedTemporaryFile(suffix='.log', delete=False) as f:
            alert_log = f.name
        
        try:
            manager = AlertManager(alert_log)
            dashboard = MonitoringDashboard(collector, checker)
            
            # Add alert and handler
            high_cpu_alert = Alert("High CPU", lambda x: x > 80, "CPU is high", "warning")
            collector.add_alert(high_cpu_alert)
            collector.add_alert_handler(manager.handle_alert)
            
            # Collect system metrics (should trigger CPU alert)
            collector._collect_system_metrics()
            
            # Profile an operation
            profiler.start_timer("test_operation")
            time.sleep(0.01)
            profiler.end_timer("test_operation")
            
            # Check health
            health_results = checker.run_all_checks()
            
            # Check alerts
            collector._check_alerts()
            
            # Get dashboard data
            dashboard_data = dashboard.get_dashboard_data()
            
            # Verify integration
            assert "system_cpu_percent" in collector.metrics
            assert "timer_test_operation_seconds" in collector.metrics
            assert not health_results["cpu_usage"]  # Should fail due to high CPU
            assert not dashboard_data["overall_health"]
            
            # Check alert was logged
            with open(alert_log, 'r') as f:
                log_content = f.read()
                assert "High CPU" in log_content
        
        finally:
            os.unlink(alert_log)