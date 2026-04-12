#!/usr/bin/env python3
"""
LIVE STREAMING LAUNCHER
Launches the world-class live streaming system
"""

import asyncio
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def launch_live_streaming(symbols: list[str] = None):
    """Launch the live streaming system"""
    try:
        logger.info("🚀 LAUNCHING WORLD-CLASS LIVE STREAMING SYSTEM")

        # Import the live streaming system
        from live_streaming_system import live_streaming_system

        # Start streaming
        await live_streaming_system.start_streaming(symbols)

        logger.info("✅ Live streaming system launched successfully")

        # Keep the system running
        while True:
            await asyncio.sleep(1)

            # Log status every 30 seconds
            if asyncio.get_event_loop().time() % 30 < 1:
                status = live_streaming_system.get_stream_status()
                logger.info(
                    f"📊 Status: {status['performance_metrics']['processed_messages']} messages processed"
                )

    except KeyboardInterrupt:
        logger.info("🛑 Received stop signal")
        await live_streaming_system.stop_streaming()
    except Exception as e:
        logger.error(f"❌ Live streaming launch failed: {e}")
        raise


def main():
    """Main function"""
    # Default symbols
    symbols = ["ES", "NQ", "YM", "RTY"]

    # Parse command line arguments
    if len(sys.argv) > 1:
        symbols = sys.argv[1:]

    logger.info(f"🎯 Starting live streaming for symbols: {symbols}")

    # Run the live streaming system
    asyncio.run(launch_live_streaming(symbols))


if __name__ == "__main__":
    main()
