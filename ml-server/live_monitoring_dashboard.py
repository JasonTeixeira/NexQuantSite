"""
LIVE MONITORING DASHBOARD
Real-time monitoring and visualization of the ML trading system
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any

import websockets

logger = logging.getLogger(__name__)


@dataclass
class SystemMetrics:
    """System performance metrics"""

    cpu_usage: float
    memory_usage: float
    network_io: float
    active_connections: int
    messages_per_second: float
    error_rate: float
    uptime_seconds: float


class LiveMonitoringDashboard:
    """
    World-Class Live Monitoring Dashboard
    Provides real-time monitoring of the entire ML trading system
    """

    def __init__(self):
        self.metrics_history = []
        self.alerts = []
        self.dashboard_config = {
            "refresh_rate_ms": 1000,
            "max_history_points": 1000,
            "alert_thresholds": {
                "cpu_warning": 70.0,
                "cpu_critical": 90.0,
                "memory_warning": 80.0,
                "memory_critical": 95.0,
                "error_rate_warning": 5.0,
                "error_rate_critical": 10.0,
            },
        }

        # System components to monitor
        self.monitored_components = {
            "ml_ensemble": {"status": "active", "last_update": datetime.now()},
            "live_streaming": {"status": "active", "last_update": datetime.now()},
            "risk_engine": {"status": "active", "last_update": datetime.now()},
            "data_connectors": {"status": "active", "last_update": datetime.now()},
            "regime_detector": {"status": "active", "last_update": datetime.now()},
        }

        logger.info("Live Monitoring Dashboard initialized")

    async def start_monitoring(self):
        """Start the live monitoring dashboard"""
        logger.info("📊 Starting Live Monitoring Dashboard...")

        try:
            # Start metrics collection
            asyncio.create_task(self._collect_metrics())

            # Start alert monitoring
            asyncio.create_task(self._monitor_alerts())

            # Start WebSocket server for real-time updates
            asyncio.create_task(self._start_websocket_server())

            logger.info("✅ Live Monitoring Dashboard started successfully")

        except Exception as e:
            logger.error(f"❌ Failed to start monitoring dashboard: {e}")
            raise

    async def _collect_metrics(self):
        """Collect system metrics"""
        while True:
            try:
                # Collect current metrics
                metrics = await self._gather_system_metrics()

                # Store in history
                self.metrics_history.append(metrics)

                # Keep only recent history
                if len(self.metrics_history) > self.dashboard_config["max_history_points"]:
                    self.metrics_history = self.metrics_history[
                        -self.dashboard_config["max_history_points"] :
                    ]

                # Update component status
                await self._update_component_status()

                # Wait for next collection
                await asyncio.sleep(self.dashboard_config["refresh_rate_ms"] / 1000)

            except Exception as e:
                logger.error(f"❌ Metrics collection error: {e}")
                await asyncio.sleep(5)

    async def _gather_system_metrics(self) -> SystemMetrics:
        """Gather current system metrics"""
        try:
            # Simulate system metrics collection
            import psutil

            # CPU usage
            cpu_usage = psutil.cpu_percent(interval=1)

            # Memory usage
            memory = psutil.virtual_memory()
            memory_usage = memory.percent

            # Network I/O
            net_io = psutil.net_io_counters()
            network_io = (net_io.bytes_sent + net_io.bytes_recv) / 1024 / 1024  # MB

            # Active connections (simulated)
            active_connections = len(self.monitored_components)

            # Messages per second (simulated)
            messages_per_second = 100.0 + (time.time() % 10) * 10  # Varying load

            # Error rate (simulated)
            error_rate = 2.5 + (time.time() % 5) * 0.5  # Varying error rate

            # Uptime
            uptime_seconds = (
                time.time() - self.metrics_history[0].timestamp if self.metrics_history else 0
            )

            return SystemMetrics(
                cpu_usage=cpu_usage,
                memory_usage=memory_usage,
                network_io=network_io,
                active_connections=active_connections,
                messages_per_second=messages_per_second,
                error_rate=error_rate,
                uptime_seconds=uptime_seconds,
            )

        except Exception as e:
            logger.error(f"❌ Error gathering metrics: {e}")
            # Return default metrics
            return SystemMetrics(
                cpu_usage=0.0,
                memory_usage=0.0,
                network_io=0.0,
                active_connections=0,
                messages_per_second=0.0,
                error_rate=0.0,
                uptime_seconds=0.0,
            )

    async def _update_component_status(self):
        """Update status of monitored components"""
        current_time = datetime.now()

        for component, status in self.monitored_components.items():
            # Simulate component health checks
            if component == "ml_ensemble":
                status["status"] = "active" if time.time() % 60 < 55 else "warning"
            elif component == "live_streaming":
                status["status"] = "active" if time.time() % 60 < 58 else "warning"
            elif component == "risk_engine":
                status["status"] = "active" if time.time() % 60 < 57 else "warning"
            elif component == "data_connectors":
                status["status"] = "active" if time.time() % 60 < 56 else "warning"
            elif component == "regime_detector":
                status["status"] = "active" if time.time() % 60 < 54 else "warning"

            status["last_update"] = current_time

    async def _monitor_alerts(self):
        """Monitor for system alerts"""
        while True:
            try:
                if not self.metrics_history:
                    await asyncio.sleep(5)
                    continue

                latest_metrics = self.metrics_history[-1]
                alerts = []

                # Check CPU usage
                if (
                    latest_metrics.cpu_usage
                    > self.dashboard_config["alert_thresholds"]["cpu_critical"]
                ):
                    alerts.append(
                        {
                            "level": "CRITICAL",
                            "component": "CPU",
                            "message": f"CPU usage critical: {latest_metrics.cpu_usage:.1f}%",
                            "timestamp": datetime.now(),
                        }
                    )
                elif (
                    latest_metrics.cpu_usage
                    > self.dashboard_config["alert_thresholds"]["cpu_warning"]
                ):
                    alerts.append(
                        {
                            "level": "WARNING",
                            "component": "CPU",
                            "message": f"CPU usage high: {latest_metrics.cpu_usage:.1f}%",
                            "timestamp": datetime.now(),
                        }
                    )

                # Check memory usage
                if (
                    latest_metrics.memory_usage
                    > self.dashboard_config["alert_thresholds"]["memory_critical"]
                ):
                    alerts.append(
                        {
                            "level": "CRITICAL",
                            "component": "Memory",
                            "message": f"Memory usage critical: {latest_metrics.memory_usage:.1f}%",
                            "timestamp": datetime.now(),
                        }
                    )
                elif (
                    latest_metrics.memory_usage
                    > self.dashboard_config["alert_thresholds"]["memory_warning"]
                ):
                    alerts.append(
                        {
                            "level": "WARNING",
                            "component": "Memory",
                            "message": f"Memory usage high: {latest_metrics.memory_usage:.1f}%",
                            "timestamp": datetime.now(),
                        }
                    )

                # Check error rate
                if (
                    latest_metrics.error_rate
                    > self.dashboard_config["alert_thresholds"]["error_rate_critical"]
                ):
                    alerts.append(
                        {
                            "level": "CRITICAL",
                            "component": "Error Rate",
                            "message": f"Error rate critical: {latest_metrics.error_rate:.1f}%",
                            "timestamp": datetime.now(),
                        }
                    )
                elif (
                    latest_metrics.error_rate
                    > self.dashboard_config["alert_thresholds"]["error_rate_warning"]
                ):
                    alerts.append(
                        {
                            "level": "WARNING",
                            "component": "Error Rate",
                            "message": f"Error rate high: {latest_metrics.error_rate:.1f}%",
                            "timestamp": datetime.now(),
                        }
                    )

                # Add new alerts
                for alert in alerts:
                    self.alerts.append(alert)
                    logger.warning(f"🚨 {alert['level']}: {alert['message']}")

                # Keep only recent alerts
                if len(self.alerts) > 100:
                    self.alerts = self.alerts[-100:]

                await asyncio.sleep(10)  # Check every 10 seconds

            except Exception as e:
                logger.error(f"❌ Alert monitoring error: {e}")
                await asyncio.sleep(10)

    async def _start_websocket_server(self):
        """Start WebSocket server for real-time updates"""
        try:

            async def websocket_handler(websocket, path):
                """Handle WebSocket connections"""
                logger.info("🔌 New WebSocket connection established")

                try:
                    while True:
                        # Send current dashboard data
                        dashboard_data = self.get_dashboard_data()
                        await websocket.send(json.dumps(dashboard_data))

                        # Wait before next update
                        await asyncio.sleep(1)

                except websockets.exceptions.ConnectionClosed:
                    logger.info("🔌 WebSocket connection closed")
                except Exception as e:
                    logger.error(f"❌ WebSocket error: {e}")

            # Start WebSocket server
            server = await websockets.serve(websocket_handler, "localhost", 8765)
            logger.info("✅ WebSocket server started on ws://localhost:8765")

            await server.wait_closed()

        except Exception as e:
            logger.error(f"❌ WebSocket server error: {e}")

    def get_dashboard_data(self) -> dict[str, Any]:
        """Get current dashboard data"""
        if not self.metrics_history:
            return {"error": "No metrics available"}

        latest_metrics = self.metrics_history[-1]

        return {
            "timestamp": datetime.now().isoformat(),
            "system_metrics": {
                "cpu_usage": latest_metrics.cpu_usage,
                "memory_usage": latest_metrics.memory_usage,
                "network_io": latest_metrics.network_io,
                "active_connections": latest_metrics.active_connections,
                "messages_per_second": latest_metrics.messages_per_second,
                "error_rate": latest_metrics.error_rate,
                "uptime_seconds": latest_metrics.uptime_seconds,
            },
            "component_status": self.monitored_components,
            "alerts": self.alerts[-10:],  # Last 10 alerts
            "performance_summary": {
                "total_metrics_collected": len(self.metrics_history),
                "active_alerts": len([a for a in self.alerts if a["level"] == "CRITICAL"]),
                "system_health": self._calculate_system_health(),
            },
        }

    def _calculate_system_health(self) -> str:
        """Calculate overall system health"""
        if not self.metrics_history:
            return "UNKNOWN"

        latest_metrics = self.metrics_history[-1]

        # Check for critical issues
        if (
            latest_metrics.cpu_usage > self.dashboard_config["alert_thresholds"]["cpu_critical"]
            or latest_metrics.memory_usage
            > self.dashboard_config["alert_thresholds"]["memory_critical"]
            or latest_metrics.error_rate
            > self.dashboard_config["alert_thresholds"]["error_rate_critical"]
        ):
            return "CRITICAL"

        # Check for warnings
        if (
            latest_metrics.cpu_usage > self.dashboard_config["alert_thresholds"]["cpu_warning"]
            or latest_metrics.memory_usage
            > self.dashboard_config["alert_thresholds"]["memory_warning"]
            or latest_metrics.error_rate
            > self.dashboard_config["alert_thresholds"]["error_rate_warning"]
        ):
            return "WARNING"

        return "HEALTHY"

    def get_performance_summary(self) -> dict[str, Any]:
        """Get performance summary"""
        if not self.metrics_history:
            return {"error": "No metrics available"}

        recent_metrics = self.metrics_history[-100:]  # Last 100 metrics

        return {
            "total_metrics": len(self.metrics_history),
            "recent_metrics": len(recent_metrics),
            "average_cpu": sum(m.cpu_usage for m in recent_metrics) / len(recent_metrics),
            "average_memory": sum(m.memory_usage for m in recent_metrics) / len(recent_metrics),
            "average_throughput": sum(m.messages_per_second for m in recent_metrics)
            / len(recent_metrics),
            "total_alerts": len(self.alerts),
            "system_health": self._calculate_system_health(),
            "uptime_hours": (recent_metrics[-1].uptime_seconds if recent_metrics else 0) / 3600,
        }


# Global monitoring dashboard instance
live_monitoring_dashboard = LiveMonitoringDashboard()
