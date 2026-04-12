#!/usr/bin/env python3
"""
EXPLORE DATABENTO SYMBOLOGY
Find the correct symbol format for NQ and YM futures
"""

import asyncio
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class DatabentoSymbologyExplorer:
    """Explore Databento symbology options"""

    def __init__(self):
        self.api_key = "db-hmi8FuiKD9ARQjvJ3G3gCnmat86Hi"
        self.client = None
        self.connected = False

        # Test different symbol formats
        self.symbol_variations = [
            "NQ",
            "YM",  # Simple
            "NQ.FUT",
            "YM.FUT",  # With .FUT
            "NQ1!",
            "YM1!",  # With ! for continuous
            "NQZ4",
            "YMZ4",  # Specific contract
            "NQH5",
            "YMH5",  # Different contract
            "NQ 1!",
            "YM 1!",  # With space
            "NQ-1!",
            "YM-1!",  # With dash
        ]

        # Test different symbology types
        self.symbology_types = [
            "raw_symbol",
            "symbol",
            "instrument_id",
            "smart",
            "continuous",
            "parent",
            "nasdaq_symbol",
            "cms_symbol",
            "isin",
            "us_code",
            "bbg_comp_id",
            "bbg_comp_ticker",
            "figi",
            "figi_ticker",
        ]

        logger.info("Databento Symbology Explorer initialized")
        logger.info(f"API Key: {self.api_key[:10]}...")

    async def connect_to_databento(self):
        """Connect to Databento API"""
        logger.info("CONNECTING TO DATABENTO...")

        try:
            import databento as db

            self.client = db.Historical(self.api_key)
            self.connected = True
            logger.info("SUCCESS: Connected to Databento API")
            return True
        except Exception as e:
            logger.error(f"ERROR: Failed to connect to Databento: {e}")
            return False

    async def test_symbology_combinations(self):
        """Test different symbology combinations"""
        logger.info("TESTING SYMBOLOGY COMBINATIONS...")

        results = {}
        test_date = "2024-08-05"  # Recent date

        for stype in self.symbology_types:
            logger.info(f"Testing symbology type: {stype}")
            results[stype] = {}

            for symbol in self.symbol_variations:
                try:
                    logger.info(f"  Testing {symbol} with {stype}...")

                    data = self.client.timeseries.get_range(
                        dataset="GLBX.MDP3",
                        symbols=symbol,
                        schema="mbp-10",
                        start=test_date,
                        end=test_date,
                        stype_in=stype,
                        stype_out=stype,
                    )

                    df = data.to_df()
                    if len(df) > 0:
                        results[stype][symbol] = {
                            "status": "SUCCESS",
                            "records": len(df),
                            "columns": list(df.columns),
                        }
                        logger.info(f"    SUCCESS: {symbol} - {len(df)} records")
                    else:
                        results[stype][symbol] = {"status": "NO_DATA", "records": 0}
                        logger.info(f"    NO DATA: {symbol}")

                except Exception as e:
                    results[stype][symbol] = {"status": "ERROR", "error": str(e)}
                    logger.info(f"    ERROR: {symbol} - {str(e)[:100]}")

        return results

    async def test_common_futures_symbols(self):
        """Test common futures symbol formats"""
        logger.info("TESTING COMMON FUTURES SYMBOLS...")

        common_symbols = [
            "ES",
            "NQ",
            "YM",
            "RTY",  # E-mini
            "CL",
            "GC",
            "NG",
            "SI",  # Commodities
            "6E",
            "6J",
            "6B",
            "6A",  # Currencies
            "ZN",
            "ZB",
            "ZF",
            "ZT",  # Bonds
        ]

        results = {}
        test_date = "2024-08-05"

        # Test with 'smart' symbology (most common for futures)
        for symbol in common_symbols:
            try:
                logger.info(f"Testing {symbol} with smart symbology...")

                data = self.client.timeseries.get_range(
                    dataset="GLBX.MDP3",
                    symbols=symbol,
                    schema="mbp-10",
                    start=test_date,
                    end=test_date,
                    stype_in="smart",
                    stype_out="smart",
                )

                df = data.to_df()
                if len(df) > 0:
                    results[symbol] = {
                        "status": "SUCCESS",
                        "records": len(df),
                        "columns": list(df.columns),
                    }
                    logger.info(f"  SUCCESS: {symbol} - {len(df)} records")
                else:
                    results[symbol] = {"status": "NO_DATA", "records": 0}
                    logger.info(f"  NO DATA: {symbol}")

            except Exception as e:
                results[symbol] = {"status": "ERROR", "error": str(e)}
                logger.info(f"  ERROR: {symbol} - {str(e)[:100]}")

        return results

    async def find_working_symbols(self):
        """Find symbols that work with different symbology types"""
        logger.info("FINDING WORKING SYMBOLS...")

        # Test with 'smart' symbology first (most likely to work)
        working_symbols = []

        test_symbols = ["ES", "NQ", "YM", "RTY", "CL", "GC"]
        test_date = "2024-08-05"

        for symbol in test_symbols:
            try:
                logger.info(f"Testing {symbol}...")

                data = self.client.timeseries.get_range(
                    dataset="GLBX.MDP3",
                    symbols=symbol,
                    schema="mbp-10",
                    start=test_date,
                    end=test_date,
                    stype_in="smart",
                    stype_out="smart",
                )

                df = data.to_df()
                if len(df) > 0:
                    working_symbols.append(
                        {"symbol": symbol, "records": len(df), "columns": list(df.columns)}
                    )
                    logger.info(f"  SUCCESS: {symbol} - {len(df)} records")
                else:
                    logger.info(f"  NO DATA: {symbol}")

            except Exception as e:
                logger.info(f"  ERROR: {symbol} - {str(e)[:100]}")

        return working_symbols

    async def run_exploration(self):
        """Run full symbology exploration"""
        logger.info("DATABENTO SYMBOLOGY EXPLORATION")
        logger.info("=" * 60)

        # Connect to Databento
        connected = await self.connect_to_databento()
        if not connected:
            logger.error("FAILED: Cannot connect to Databento")
            return False

        # Find working symbols
        working_symbols = await self.find_working_symbols()

        # Test symbology combinations
        symbology_results = await self.test_symbology_combinations()

        # Test common futures symbols
        futures_results = await self.test_common_futures_symbols()

        # Save results
        exploration_results = {
            "exploration_date": datetime.now().isoformat(),
            "working_symbols": working_symbols,
            "symbology_results": symbology_results,
            "futures_results": futures_results,
        }

        results_file = "ml-platform/databento_symbology_exploration.json"
        with open(results_file, "w") as f:
            json.dump(exploration_results, f, indent=2)

        logger.info("=" * 60)
        logger.info("EXPLORATION SUMMARY:")
        logger.info(f"Working symbols found: {len(working_symbols)}")
        logger.info(f"Results saved to: {results_file}")
        logger.info("=" * 60)

        # Show working symbols
        if working_symbols:
            logger.info("WORKING SYMBOLS:")
            for symbol_info in working_symbols:
                logger.info(f"  {symbol_info['symbol']}: {symbol_info['records']} records")

        return len(working_symbols) > 0


async def main():
    """Main function"""
    logger.info("DATABENTO SYMBOLOGY EXPLORATION LAUNCHER")
    logger.info("=" * 60)

    # Initialize explorer
    explorer = DatabentoSymbologyExplorer()

    # Run exploration
    success = await explorer.run_exploration()

    if success:
        logger.info("SUCCESS: Symbology exploration completed!")
        logger.info("Check the results file for working symbol formats!")
    else:
        logger.error("FAILED: Symbology exploration failed!")


if __name__ == "__main__":
    asyncio.run(main())
