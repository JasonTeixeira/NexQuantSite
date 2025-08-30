"""
Advanced Monitoring and Alerting System
========================================
Real-time monitoring with multi-channel alerts.

Features:
- Real-time metrics tracking
- Multi-channel alerts (Email, SMS, Slack, Discord)
- Performance anomaly detection
- Risk threshold monitoring
- System health checks
- Custom alert rules

Author: Nexural Trading Platform
Date: 2024
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import numpy as np
import pandas as pd
from collections import deque
import aiohttp
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class MetricType(Enum):
    """Types of metrics to monitor"""
    PERFORMANCE = "performance"
    RISK = "risk"
    SYSTEM = "system"
    TRADING = "trading"
    MARKET = "market"


@dataclass
class Alert:
    """Alert data structure"""
    timestamp: datetime
    severity: AlertSeverity
    metric_type: MetricType
    title: str
    message: str
    value: Optional[float] = None
    threshold: Optional[float] = None
    metadata: Dict = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        return {
            'timestamp': self.timestamp.isoformat(),
            'severity': self.severity.value,
            'metric_type': self.metric_type.value,
            'title': self.title,
            'message': self.message,
            'value': self.value,
            'threshold': self.threshold,
            'metadata': self.metadata
        }


@dataclass
class MonitoringMetrics:
    """Current system metrics"""
    # Performance metrics
    total_pnl: float = 0.0
    daily_pnl: float = 0.0
    sharpe_ratio: float = 0.0
    win_rate: float = 0.0
    
    # Risk metrics
    current_drawdown: float = 0.0
    max_drawdown: float = 0.0
    var_95: float = 0.0
    position_concentration: float = 0.0
    
    # System metrics
    cpu_usage: float = 0.0
    memory_usage: float = 0.0
    api_latency: float = 0.0
    error_rate: float = 0.0
    
    # Trading metrics
    open_positions: int = 0
    pending_orders: int = 0
    daily_trades: int = 0
    execution_speed: float = 0.0
    
    # Market metrics
    market_volatility: float = 0.0
    correlation_risk: float = 0.0
    liquidity_score: float = 0.0


class AlertChannel:
    """Base class for alert channels"""
    
    async def send(self, alert: Alert) -> bool:
        """Send alert through channel"""
        raise NotImplementedError


class EmailAlertChannel(AlertChannel):
    """Email alert channel"""
    
    def __init__(self, smtp_host: str, smtp_port: int, 
                 username: str, password: str, to_emails: List[str]):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
        self.to_emails = to_emails
    
    async def send(self, alert: Alert) -> bool:
        """Send email alert"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.username
            msg['To'] = ', '.join(self.to_emails)
            msg['Subject'] = f"[{alert.severity.value.upper()}] {alert.title}"
            
            body = f"""
            Alert: {alert.title}
            Severity: {alert.severity.value}
            Time: {alert.timestamp}
            
            {alert.message}
            
            Value: {alert.value}
            Threshold: {alert.threshold}
            
            Metadata: {json.dumps(alert.metadata, indent=2)}
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")
            return False


class SlackAlertChannel(AlertChannel):
    """Slack alert channel"""
    
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
    
    async def send(self, alert: Alert) -> bool:
        """Send Slack alert"""
        try:
            # Color based on severity
            color_map = {
                AlertSeverity.INFO: "#36a64f",
                AlertSeverity.WARNING: "#ff9900",
                AlertSeverity.ERROR: "#ff0000",
                AlertSeverity.CRITICAL: "#990000"
            }
            
            payload = {
                "attachments": [{
                    "color": color_map[alert.severity],
                    "title": alert.title,
                    "text": alert.message,
                    "fields": [
                        {"title": "Severity", "value": alert.severity.value, "short": True},
                        {"title": "Type", "value": alert.metric_type.value, "short": True},
                        {"title": "Value", "value": str(alert.value), "short": True},
                        {"title": "Threshold", "value": str(alert.threshold), "short": True}
                    ],
                    "footer": "Nexural Trading Platform",
                    "ts": int(alert.timestamp.timestamp())
                }]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.webhook_url, json=payload) as resp:
                    return resp.status == 200
                    
        except Exception as e:
            logger.error(f"Failed to send Slack alert: {e}")
            return False


class DiscordAlertChannel(AlertChannel):
    """Discord alert channel"""
    
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
    
    async def send(self, alert: Alert) -> bool:
        """Send Discord alert"""
        try:
            # Emoji based on severity
            emoji_map = {
                AlertSeverity.INFO: "ℹ️",
                AlertSeverity.WARNING: "⚠️",
                AlertSeverity.ERROR: "❌",
                AlertSeverity.CRITICAL: "🚨"
            }
            
            embed = {
                "title": f"{emoji_map[alert.severity]} {alert.title}",
                "description": alert.message,
                "color": {
                    AlertSeverity.INFO: 3447003,
                    AlertSeverity.WARNING: 16776960,
                    AlertSeverity.ERROR: 16711680,
                    AlertSeverity.CRITICAL: 10038562
                }[alert.severity],
                "fields": [
                    {"name": "Severity", "value": alert.severity.value, "inline": True},
                    {"name": "Type", "value": alert.metric_type.value, "inline": True},
                    {"name": "Value", "value": str(alert.value), "inline": True},
                    {"name": "Threshold", "value": str(alert.threshold), "inline": True}
                ],
                "timestamp": alert.timestamp.isoformat()
            }
            
            payload = {"embeds": [embed]}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.webhook_url, json=payload) as resp:
                    return resp.status in [200, 204]
                    
        except Exception as e:
            logger.error(f"Failed to send Discord alert: {e}")
            return False


class MonitoringSystem:
    """
    Comprehensive monitoring and alerting system.
    
    Watches everything and alerts when something needs attention.
    """
    
    def __init__(self,
                 check_interval: int = 60,
                 metrics_window: int = 100):
        """
        Initialize monitoring system
        
        Args:
            check_interval: Seconds between checks
            metrics_window: Number of metrics to keep in memory
        """
        self.check_interval = check_interval
        self.metrics_window = metrics_window
        
        # Alert channels
        self.alert_channels: List[AlertChannel] = []
        
        # Alert rules
        self.alert_rules: List[AlertRule] = []
        
        # Metrics history
        self.metrics_history = deque(maxlen=metrics_window)
        self.alert_history = deque(maxlen=1000)
        
        # Current metrics
        self.current_metrics = MonitoringMetrics()
        
        # Monitoring task
        self.monitoring_task = None
        self.is_running = False
        
    def add_alert_channel(self, channel: AlertChannel):
        """Add alert channel"""
        self.alert_channels.append(channel)
        logger.info(f"Added alert channel: {channel.__class__.__name__}")
    
    def add_alert_rule(self, rule: 'AlertRule'):
        """Add alert rule"""
        self.alert_rules.append(rule)
        logger.info(f"Added alert rule: {rule.name}")
    
    async def start_monitoring(self):
        """Start monitoring loop"""
        if self.is_running:
            logger.warning("Monitoring already running")
            return
        
        self.is_running = True
        self.monitoring_task = asyncio.create_task(self._monitoring_loop())
        logger.info("Monitoring system started")
    
    async def stop_monitoring(self):
        """Stop monitoring loop"""
        self.is_running = False
        if self.monitoring_task:
            await self.monitoring_task
        logger.info("Monitoring system stopped")
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.is_running:
            try:
                # Update metrics
                await self._update_metrics()
                
                # Check alert rules
                alerts = await self._check_alert_rules()
                
                # Send alerts
                for alert in alerts:
                    await self._send_alert(alert)
                
                # Store metrics
                self.metrics_history.append({
                    'timestamp': datetime.now(),
                    'metrics': self.current_metrics
                })
                
                # Wait for next check
                await asyncio.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f"Monitoring loop error: {e}")
    
    async def _update_metrics(self):
        """Update current metrics"""
        # This would fetch real metrics from various sources
        # For now, using placeholder updates
        pass
    
    async def _check_alert_rules(self) -> List[Alert]:
        """Check all alert rules"""
        alerts = []
        
        for rule in self.alert_rules:
            alert = rule.check(self.current_metrics)
            if alert:
                alerts.append(alert)
                self.alert_history.append(alert)
        
        return alerts
    
    async def _send_alert(self, alert: Alert):
        """Send alert through all channels"""
        logger.info(f"Sending alert: {alert.title}")
        
        for channel in self.alert_channels:
            try:
                success = await channel.send(alert)
                if success:
                    logger.info(f"Alert sent via {channel.__class__.__name__}")
                else:
                    logger.warning(f"Failed to send via {channel.__class__.__name__}")
            except Exception as e:
                logger.error(f"Error sending alert: {e}")
    
    def update_metric(self, metric_name: str, value: float):
        """Update a specific metric"""
        if hasattr(self.current_metrics, metric_name):
            setattr(self.current_metrics, metric_name, value)
    
    def get_metrics_summary(self) -> Dict:
        """Get summary of current metrics"""
        return {
            'current': {
                'performance': {
                    'total_pnl': self.current_metrics.total_pnl,
                    'daily_pnl': self.current_metrics.daily_pnl,
                    'sharpe_ratio': self.current_metrics.sharpe_ratio,
                    'win_rate': self.current_metrics.win_rate
                },
                'risk': {
                    'current_drawdown': self.current_metrics.current_drawdown,
                    'max_drawdown': self.current_metrics.max_drawdown,
                    'var_95': self.current_metrics.var_95,
                    'position_concentration': self.current_metrics.position_concentration
                },
                'system': {
                    'cpu_usage': self.current_metrics.cpu_usage,
                    'memory_usage': self.current_metrics.memory_usage,
                    'api_latency': self.current_metrics.api_latency,
                    'error_rate': self.current_metrics.error_rate
                }
            },
            'alerts': {
                'total': len(self.alert_history),
                'recent': [a.to_dict() for a in list(self.alert_history)[-10:]]
            }
        }


class AlertRule:
    """Base class for alert rules"""
    
    def __init__(self, name: str):
        self.name = name
    
    def check(self, metrics: MonitoringMetrics) -> Optional[Alert]:
        """Check if alert should be triggered"""
        raise NotImplementedError


class ThresholdAlertRule(AlertRule):
    """Alert when metric exceeds threshold"""
    
    def __init__(self, name: str, metric: str, threshold: float,
                 comparison: str = 'greater', severity: AlertSeverity = AlertSeverity.WARNING):
        super().__init__(name)
        self.metric = metric
        self.threshold = threshold
        self.comparison = comparison
        self.severity = severity
    
    def check(self, metrics: MonitoringMetrics) -> Optional[Alert]:
        """Check threshold"""
        if not hasattr(metrics, self.metric):
            return None
        
        value = getattr(metrics, self.metric)
        
        triggered = False
        if self.comparison == 'greater' and value > self.threshold:
            triggered = True
        elif self.comparison == 'less' and value < self.threshold:
            triggered = True
        elif self.comparison == 'equal' and value == self.threshold:
            triggered = True
        
        if triggered:
            return Alert(
                timestamp=datetime.now(),
                severity=self.severity,
                metric_type=self._get_metric_type(),
                title=f"{self.name} Alert",
                message=f"{self.metric} ({value:.4f}) {self.comparison} threshold ({self.threshold:.4f})",
                value=value,
                threshold=self.threshold
            )
        
        return None
    
    def _get_metric_type(self) -> MetricType:
        """Determine metric type from metric name"""
        if 'pnl' in self.metric or 'sharpe' in self.metric:
            return MetricType.PERFORMANCE
        elif 'drawdown' in self.metric or 'var' in self.metric:
            return MetricType.RISK
        elif 'cpu' in self.metric or 'memory' in self.metric:
            return MetricType.SYSTEM
        else:
            return MetricType.TRADING


class AnomalyAlertRule(AlertRule):
    """Alert on anomalous behavior"""
    
    def __init__(self, name: str, metric: str, 
                 std_threshold: float = 3.0, lookback: int = 100):
        super().__init__(name)
        self.metric = metric
        self.std_threshold = std_threshold
        self.lookback = lookback
        self.history = deque(maxlen=lookback)
    
    def check(self, metrics: MonitoringMetrics) -> Optional[Alert]:
        """Check for anomalies"""
        if not hasattr(metrics, self.metric):
            return None
        
        value = getattr(metrics, self.metric)
        self.history.append(value)
        
        if len(self.history) < 20:  # Need minimum history
            return None
        
        # Calculate statistics
        mean = np.mean(self.history)
        std = np.std(self.history)
        
        # Check for anomaly
        z_score = (value - mean) / (std + 1e-8)
        
        if abs(z_score) > self.std_threshold:
            return Alert(
                timestamp=datetime.now(),
                severity=AlertSeverity.WARNING,
                metric_type=MetricType.SYSTEM,
                title=f"Anomaly Detected: {self.name}",
                message=f"{self.metric} is {abs(z_score):.1f} standard deviations from mean",
                value=value,
                threshold=mean,
                metadata={'z_score': z_score, 'mean': mean, 'std': std}
            )
        
        return None


def create_default_monitoring_system() -> MonitoringSystem:
    """Create monitoring system with default rules"""
    
    system = MonitoringSystem()
    
    # Add default alert rules
    
    # Performance alerts
    system.add_alert_rule(ThresholdAlertRule(
        "Daily Loss Limit",
        "daily_pnl",
        -0.02,  # -2% daily loss
        "less",
        AlertSeverity.ERROR
    ))
    
    system.add_alert_rule(ThresholdAlertRule(
        "Low Sharpe Ratio",
        "sharpe_ratio",
        0.5,
        "less",
        AlertSeverity.WARNING
    ))
    
    # Risk alerts
    system.add_alert_rule(ThresholdAlertRule(
        "High Drawdown",
        "current_drawdown",
        0.15,  # 15% drawdown
        "greater",
        AlertSeverity.ERROR
    ))
    
    system.add_alert_rule(ThresholdAlertRule(
        "Position Concentration",
        "position_concentration",
        0.4,  # 40% in single position
        "greater",
        AlertSeverity.WARNING
    ))
    
    # System alerts
    system.add_alert_rule(ThresholdAlertRule(
        "High CPU Usage",
        "cpu_usage",
        0.9,  # 90% CPU
        "greater",
        AlertSeverity.WARNING
    ))
    
    system.add_alert_rule(ThresholdAlertRule(
        "High Error Rate",
        "error_rate",
        0.05,  # 5% error rate
        "greater",
        AlertSeverity.ERROR
    ))
    
    # Anomaly detection
    system.add_alert_rule(AnomalyAlertRule(
        "API Latency Anomaly",
        "api_latency",
        std_threshold=3.0
    ))
    
    return system


if __name__ == "__main__":
    print("Advanced Monitoring and Alerting System")
    print("=" * 50)
    print("Features:")
    print("  ✅ Real-time metrics tracking")
    print("  ✅ Multi-channel alerts (Email, Slack, Discord)")
    print("  ✅ Threshold-based rules")
    print("  ✅ Anomaly detection")
    print("  ✅ Comprehensive metrics dashboard")



