#!/usr/bin/env python3
"""
TEST CORRECT SYMBOLOGY
Test the correct symbology types for GLBX.MDP3 dataset
"""

import asyncio
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class CorrectSymbologyTester:
    """Test correct symbology for GLBX.MDP3"""

    def __init__(self):
        self.api_key = "db-hmi8FuiKD9ARQjvJ3G3gCnmat86Hi"
        self.client = None
        self.connected = False

        # Only supported symbology types for GLBX.MDP3
        self.supported_symbology = ["instrument_id", "raw_symbol", "parent"]

        # Test different symbol formats
        self.test_symbols = [
            # Simple symbols
            "NQ",
            "YM",
            "ES",
            "RTY",
            # With .FUT
            "NQ.FUT",
            "YM.FUT",
            "ES.FUT",
            "RTY.FUT",
            # Continuous contracts
            "NQ1!",
            "YM1!",
            "ES1!",
            "RTY1!",
            # Specific contracts
            "NQZ4",
            "YMZ4",
            "ESZ4",
            "RTYZ4",
            "NQH5",
            "YMH5",
            "ESH5",
            "RTYH5",
            # With spaces
            "NQ 1!",
            "YM 1!",
            "ES 1!",
            "RTY 1!",
            # With dashes
            "NQ-1!",
            "YM-1!",
            "ES-1!",
            "RTY-1!",
            # Different formats
            "NQ.FUT.1!",
            "YM.FUT.1!",
            "ES.FUT.1!",
            "RTY.FUT.1!",
        ]

        logger.info("Correct Symbology Tester initialized")
        logger.info(f"Supported symbology: {self.supported_symbology}")

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

    async def test_instrument_id(self):
        """Test with instrument_id symbology"""
        logger.info("TESTING INSTRUMENT_ID SYMBOLOGY...")

        results = {}
        test_date = "2024-08-05"

        # Try some common instrument IDs
        instrument_ids = ["1", "2", "3", "4", "5", "10", "20", "30", "40", "50"]

        for instrument_id in instrument_ids:
            try:
                logger.info(f"Testing instrument_id: {instrument_id}")

                data = self.client.timeseries.get_range(
                    dataset="GLBX.MDP3",
                    symbols=instrument_id,
                    schema="mbp-10",
                    start=test_date,
                    end=test_date,
                    stype_in="instrument_id",
                    stype_out="instrument_id",
                )

                df = data.to_df()
                if len(df) > 0:
                    results[instrument_id] = {
                        "status": "SUCCESS",
                        "records": len(df),
                        "symbols": df["symbol"].unique().tolist() if "symbol" in df.columns else [],
                    }
                    logger.info(f"  SUCCESS: {instrument_id} - {len(df)} records")
                else:
                    results[instrument_id] = {"status": "NO_DATA", "records": 0}
                    logger.info(f"  NO DATA: {instrument_id}")

            except Exception as e:
                results[instrument_id] = {"status": "ERROR", "error": str(e)}
                logger.info(f"  ERROR: {instrument_id} - {str(e)[:100]}")

        return results

    async def test_raw_symbol(self):
        """Test with raw_symbol symbology"""
        logger.info("TESTING RAW_SYMBOL SYMBOLOGY...")

        results = {}
        test_date = "2024-08-05"

        for symbol in self.test_symbols:
            try:
                logger.info(f"Testing raw_symbol: {symbol}")

                data = self.client.timeseries.get_range(
                    dataset="GLBX.MDP3",
                    symbols=symbol,
                    schema="mbp-10",
                    start=test_date,
                    end=test_date,
                    stype_in="raw_symbol",
                    stype_out="raw_symbol",
                )

                df = data.to_df()
                if len(df) > 0:
                    results[symbol] = {
                        "status": "SUCCESS",
                        "records": len(df),
                        "symbols": df["symbol"].unique().tolist() if "symbol" in df.columns else [],
                    }
                    logger.info(f"  SUCCESS: {symbol} - {len(df)} records")
                else:
                    results[symbol] = {"status": "NO_DATA", "records": 0}
                    logger.info(f"  NO DATA: {symbol}")

            except Exception as e:
                results[symbol] = {"status": "ERROR", "error": str(e)}
                logger.info(f"  ERROR: {symbol} - {str(e)[:100]}")

        return results

    async def test_parent(self):
        """Test with parent symbology"""
        logger.info("TESTING PARENT SYMBOLOGY...")

        results = {}
        test_date = "2024-08-05"

        # Parent symbology expects format: [ROOT].FUT
        parent_symbols = ["NQ.FUT", "YM.FUT", "ES.FUT", "RTY.FUT"]

        for symbol in parent_symbols:
            try:
                logger.info(f"Testing parent: {symbol}")

                data = self.client.timeseries.get_range(
                    dataset="GLBX.MDP3",
                    symbols=symbol,
                    schema="mbp-10",
                    start=test_date,
                    end=test_date,
                    stype_in="parent",
                    stype_out="parent",
                )

                df = data.to_df()
                if len(df) > 0:
                    results[symbol] = {
                        "status": "SUCCESS",
                        "records": len(df),
                        "symbols": df["symbol"].unique().tolist() if "symbol" in df.columns else [],
                    }
                    logger.info(f"  SUCCESS: {symbol} - {len(df)} records")
                else:
                    results[symbol] = {"status": "NO_DATA", "records": 0}
                    logger.info(f"  NO DATA: {symbol}")

            except Exception as e:
                results[symbol] = {"status": "ERROR", "error": str(e)}
                logger.info(f"  ERROR: {symbol} - {str(e)[:100]}")

        return results

    async def run_tests(self):
        """Run all symbology tests"""
        logger.info("CORRECT SYMBOLOGY TESTING")
        logger.info("=" * 60)

        # Connect to Databento
        connected = await self.connect_to_databento()
        if not connected:
            logger.error("FAILED: Cannot connect to Databento")
            return False

        # Test each symbology type
        test_results = {}

        # Test instrument_id
        test_results["instrument_id"] = await self.test_instrument_id()

        # Test raw_symbol
        test_results["raw_symbol"] = await self.test_raw_symbol()

        # Test parent
        test_results["parent"] = await self.test_parent()

        # Find working combinations
        working_combinations = []

        for symbology_type, results in test_results.items():
            for symbol, result in results.items():
                if result["status"] == "SUCCESS":
                    working_combinations.append(
                        {
                            "symbology_type": symbology_type,
                            "symbol": symbol,
                            "records": result["records"],
                        }
                    )

        # Save results
        summary = {
            "test_date": datetime.now().isoformat(),
            "api_key": self.api_key[:10] + "...",
            "supported_symbology": self.supported_symbology,
            "test_results": test_results,
            "working_combinations": working_combinations,
        }

        results_file = "ml-platform/correct_symbology_results.json"
        with open(results_file, "w") as f:
            json.dump(summary, f, indent=2)

        logger.info("=" * 60)
        logger.info("TEST SUMMARY:")
        logger.info(f"Working combinations found: {len(working_combinations)}")
        logger.info(f"Results saved to: {results_file}")
        logger.info("=" * 60)

        # Show working combinations
        if working_combinations:
            logger.info("WORKING COMBINATIONS:")
            for combo in working_combinations:
                logger.info(
                    f"  {combo['symbology_type']}: {combo['symbol']} - {combo['records']} records"
                )
        else:
            logger.info("NO WORKING COMBINATIONS FOUND")

        return len(working_combinations) > 0


async def main():
    """Main function"""
    logger.info("CORRECT SYMBOLOGY TESTING LAUNCHER")
    logger.info("=" * 60)

    # Initialize tester
    tester = CorrectSymbologyTester()

    # Run tests
    success = await tester.run_tests()

    if success:
        logger.info("SUCCESS: Found working symbology combinations!")
    else:
        logger.error("FAILED: No working combinations found!")


if __name__ == "__main__":
    asyncio.run(main())
