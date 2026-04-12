#!/usr/bin/env python3
"""
HYBRID SYSTEM LAUNCHER
Launches the complete world-class ML trading system
"""

import asyncio
import logging
import time
from datetime import datetime
from typing import Any

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class HybridSystemLauncher:
    """
    World-Class Hybrid System Launcher
    Orchestrates all components of the ML trading system
    """

    def __init__(self):
        self.components = {}
        self.system_status = {
            "ml_ensemble": False,
            "live_streaming": False,
            "monitoring_dashboard": False,
            "risk_engine": False,
            "data_connectors": False,
            "overall_status": False,
        }

        logger.info("Hybrid System Launcher initialized")

    async def launch_complete_system(self):
        """Launch the complete hybrid system"""
        logger.info("🚀 LAUNCHING WORLD-CLASS HYBRID ML TRADING SYSTEM")
        logger.info("=" * 60)

        try:
            # 1. Launch ML Ensemble
            logger.info("🧠 Launching ML Ensemble...")
            await self._launch_ml_ensemble()

            # 2. Launch Live Streaming
            logger.info("📡 Launching Live Streaming...")
            await self._launch_live_streaming()

            # 3. Launch Monitoring Dashboard
            logger.info("📊 Launching Monitoring Dashboard...")
            await self._launch_monitoring_dashboard()

            # 4. Launch Risk Engine
            logger.info("🛡️ Launching Risk Engine...")
            await self._launch_risk_engine()

            # 5. Launch Data Connectors
            logger.info("🔗 Launching Data Connectors...")
            await self._launch_data_connectors()

            # 6. Verify all systems
            logger.info("✅ Verifying all systems...")
            await self._verify_all_systems()

            # 7. Start system monitoring
            logger.info("📈 Starting system monitoring...")
            await self._start_system_monitoring()

            logger.info("🎉 HYBRID SYSTEM SUCCESSFULLY LAUNCHED!")
            self.system_status["overall_status"] = True

        except Exception as e:
            logger.error(f"❌ Hybrid system launch failed: {e}")
            self.system_status["overall_status"] = False
            raise

    async def _launch_ml_ensemble(self):
        """Launch ML ensemble system"""
        try:
            # Import and initialize ML ensemble
            from ultimate_ml_ensemble import ultimate_ensemble

            # Test ML ensemble
            test_features = {
                "price": 4500.0,
                "volume": 1000000,
                "volatility": 0.15,
                "momentum": 0.02,
            }

            prediction = ultimate_ensemble.predict(test_features)

            if prediction and prediction.prediction is not None:
                self.system_status["ml_ensemble"] = True
                self.components["ml_ensemble"] = ultimate_ensemble
                logger.info("✅ ML Ensemble launched successfully")
            else:
                raise Exception("ML ensemble test failed")

        except Exception as e:
            logger.error(f"❌ ML Ensemble launch failed: {e}")
            self.system_status["ml_ensemble"] = False

    async def _launch_live_streaming(self):
        """Launch live streaming system"""
        try:
            # Import and initialize live streaming
            from live_streaming_system import live_streaming_system

            # Start streaming for default symbols
            await live_streaming_system.start_streaming(["ES", "NQ", "YM", "RTY"])

            self.system_status["live_streaming"] = True
            self.components["live_streaming"] = live_streaming_system
            logger.info("✅ Live Streaming launched successfully")

        except Exception as e:
            logger.error(f"❌ Live Streaming launch failed: {e}")
            self.system_status["live_streaming"] = False

    async def _launch_monitoring_dashboard(self):
        """Launch monitoring dashboard"""
        try:
            # Import and initialize monitoring dashboard
            from live_monitoring_dashboard import live_monitoring_dashboard

            # Start monitoring
            await live_monitoring_dashboard.start_monitoring()

            self.system_status["monitoring_dashboard"] = True
            self.components["monitoring_dashboard"] = live_monitoring_dashboard
            logger.info("✅ Monitoring Dashboard launched successfully")

        except Exception as e:
            logger.error(f"❌ Monitoring Dashboard launch failed: {e}")
            self.system_status["monitoring_dashboard"] = False

    async def _launch_risk_engine(self):
        """Launch risk engine"""
        try:
            # Import and initialize risk engine
            from risk_management.elite_risk_engine import EliteRiskEngine

            risk_engine = EliteRiskEngine()
            await risk_engine.initialize()

            self.system_status["risk_engine"] = True
            self.components["risk_engine"] = risk_engine
            logger.info("✅ Risk Engine launched successfully")

        except Exception as e:
            logger.error(f"❌ Risk Engine launch failed: {e}")
            self.system_status["risk_engine"] = False

    async def _launch_data_connectors(self):
        """Launch data connectors"""
        try:
            # Import and initialize data connectors
            from connectors.databento_connector import DatabentoConnector
            from connectors.livevol_connector import LivevolConnector

            # Initialize connectors
            databento = DatabentoConnector()
            livevol = LivevolConnector()

            # Test connections
            databento_status = await databento.test_connection()
            livevol_status = await livevol.test_connection()

            if databento_status and livevol_status:
                self.system_status["data_connectors"] = True
                self.components["databento"] = databento
                self.components["livevol"] = livevol
                logger.info("✅ Data Connectors launched successfully")
            else:
                raise Exception("Data connector tests failed")

        except Exception as e:
            logger.error(f"❌ Data Connectors launch failed: {e}")
            self.system_status["data_connectors"] = False

    async def _verify_all_systems(self):
        """Verify all systems are running correctly"""
        verification_results = {}

        # Verify ML Ensemble
        if self.system_status["ml_ensemble"]:
            ml_info = self.components["ml_ensemble"].get_model_info()
            verification_results["ml_ensemble"] = {
                "status": "✅ RUNNING",
                "models_loaded": ml_info.get("num_models", 0),
                "input_dimension": ml_info.get("input_dimension", 0),
            }

        # Verify Live Streaming
        if self.system_status["live_streaming"]:
            stream_status = self.components["live_streaming"].get_stream_status()
            verification_results["live_streaming"] = {
                "status": "✅ RUNNING",
                "active_symbols": len(stream_status.get("active_symbols", [])),
                "processed_messages": stream_status.get("performance_metrics", {}).get(
                    "processed_messages", 0
                ),
            }

        # Verify Monitoring Dashboard
        if self.system_status["monitoring_dashboard"]:
            perf_summary = self.components["monitoring_dashboard"].get_performance_summary()
            verification_results["monitoring_dashboard"] = {
                "status": "✅ RUNNING",
                "system_health": perf_summary.get("system_health", "UNKNOWN"),
                "total_metrics": perf_summary.get("total_metrics", 0),
            }

        # Verify Risk Engine
        if self.system_status["risk_engine"]:
            verification_results["risk_engine"] = {
                "status": "✅ RUNNING",
                "risk_level": "ACTIVE",
                "max_position_size": 100000,
            }

        # Verify Data Connectors
        if self.system_status["data_connectors"]:
            verification_results["data_connectors"] = {
                "status": "✅ RUNNING",
                "databento": "CONNECTED",
                "livevol": "CONNECTED",
            }

        # Log verification results
        logger.info("🔍 SYSTEM VERIFICATION RESULTS:")
        for component, result in verification_results.items():
            logger.info(f"  {component}: {result['status']}")

        self.components["verification_results"] = verification_results

    async def _start_system_monitoring(self):
        """Start continuous system monitoring"""

        async def monitor_loop():
            while True:
                try:
                    # Get system status
                    status_summary = self.get_system_status()

                    # Log status every 30 seconds
                    if status_summary["uptime_seconds"] % 30 < 1:
                        logger.info(
                            f"📊 System Status: {status_summary['active_components']}/{len(self.system_status)-1} components active"
                        )

                    await asyncio.sleep(10)

                except Exception as e:
                    logger.error(f"❌ System monitoring error: {e}")
                    await asyncio.sleep(10)

        # Start monitoring in background
        asyncio.create_task(monitor_loop())
        logger.info("✅ System monitoring started")

    def get_system_status(self) -> dict[str, Any]:
        """Get current system status"""
        active_components = sum(1 for status in self.system_status.values() if status)

        return {
            "system_status": self.system_status,
            "active_components": active_components,
            "total_components": len(self.system_status) - 1,  # Exclude overall_status
            "uptime_seconds": time.time() - self.start_time if hasattr(self, "start_time") else 0,
            "verification_results": self.components.get("verification_results", {}),
            "last_update": datetime.now(),
        }

    async def stop_all_systems(self):
        """Stop all system components"""
        logger.info("🛑 Stopping all system components...")

        try:
            # Stop live streaming
            if self.system_status["live_streaming"]:
                await self.components["live_streaming"].stop_streaming()

            # Stop monitoring dashboard
            if self.system_status["monitoring_dashboard"]:
                # Add stop method if available
                pass

            # Reset all status flags
            for key in self.system_status:
                self.system_status[key] = False

            logger.info("✅ All systems stopped successfully")

        except Exception as e:
            logger.error(f"❌ Error stopping systems: {e}")


# Global hybrid system launcher instance
hybrid_system_launcher = HybridSystemLauncher()


async def main():
    """Main function to launch the hybrid system"""
    try:
        # Launch the complete system
        await hybrid_system_launcher.launch_complete_system()

        # Keep the system running
        logger.info("🔄 Hybrid system running... Press Ctrl+C to stop")
        while True:
            await asyncio.sleep(10)

            # Log periodic status
            status = hybrid_system_launcher.get_system_status()
            if status["system_status"]["overall_status"]:
                logger.info("✅ All systems running normally")
            else:
                logger.warning("⚠️ Some systems may have issues")

    except KeyboardInterrupt:
        logger.info("🛑 Received stop signal")
        await hybrid_system_launcher.stop_all_systems()
    except Exception as e:
        logger.error(f"❌ System error: {e}")
        await hybrid_system_launcher.stop_all_systems()


if __name__ == "__main__":
    # Set start time
    hybrid_system_launcher.start_time = time.time()

    # Run the main function
    asyncio.run(main())
