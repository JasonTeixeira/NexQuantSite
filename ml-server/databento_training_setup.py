#!/usr/bin/env python3
"""
DATABENTO TRAINING SETUP
Setup script for NQ and YM tick-by-tick training
"""

import json
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class DatabentoTrainingSetup:
    """Setup Databento training for NQ and YM"""

    def __init__(self):
        self.config = {
            "symbols": ["NQ.FUT", "YM.FUT"],
            "timeframe": "3_years",
            "start_date": "2021-01-01",
            "end_date": "2024-01-01",
            "data_type": "MBP-10",
            "frequency": "tick_by_tick",
            "estimated_cost": 12500,
            "expected_sharpe": 2.8,
        }

    def check_connection_status(self):
        """Check current connection status"""
        logger.info("CHECKING DATABENTO CONNECTION STATUS...")

        # Check API key
        api_key = os.getenv("DATABENTO_API_KEY")
        if api_key:
            logger.info("SUCCESS: DATABENTO_API_KEY is set")
            return True
        else:
            logger.warning("WARNING: DATABENTO_API_KEY not found")
            logger.info("Please add your Databento API key to environment")
            return False

    def create_training_config(self):
        """Create training configuration file"""
        logger.info("CREATING TRAINING CONFIGURATION...")

        training_config = {
            "data_config": {
                "symbols": self.config["symbols"],
                "timeframe": self.config["timeframe"],
                "start_date": self.config["start_date"],
                "end_date": self.config["end_date"],
                "data_type": self.config["data_type"],
                "frequency": self.config["frequency"],
            },
            "model_config": {
                "ensemble_models": [
                    "Temporal Graph Attention Network",
                    "Fourier Neural Operator",
                    "Bayesian Hierarchical Ensemble",
                    "Flow Transformer XL",
                    "Mamba State Space Model",
                    "Neural Stochastic DE",
                    "Variational Regime Encoder",
                ],
                "feature_engineering": {
                    "microstructure_features": 150,
                    "volatility_features": 100,
                    "cross_asset_features": 100,
                    "temporal_features": 150,
                },
                "training_params": {
                    "epochs": 100,
                    "batch_size": 32,
                    "learning_rate": 0.001,
                    "validation_split": 0.2,
                },
            },
            "performance_targets": {
                "target_sharpe": 2.8,
                "target_win_rate": 0.72,
                "target_profit_factor": 3.1,
                "max_drawdown": -0.08,
            },
            "cost_estimation": {
                "data_cost": 12500,
                "compute_cost": 500,
                "total_cost": 13000,
                "expected_roi": 500,
            },
        }

        # Save configuration
        config_file = "ml-platform/training_config.json"
        with open(config_file, "w") as f:
            json.dump(training_config, f, indent=2)

        logger.info(f"SUCCESS: Created training configuration: {config_file}")
        return training_config

    def show_setup_instructions(self):
        """Show setup instructions"""
        logger.info("SETUP INSTRUCTIONS:")
        logger.info("=" * 60)

        instructions = [
            "1. Get your Databento API key from https://databento.com",
            "2. Set environment variable: DATABENTO_API_KEY=your_key_here",
            "3. Install required packages: pip install databento pandas numpy",
            "4. Run training: python ml-platform/train_nq_ym.py",
            "",
            "TRAINING SPECIFICATIONS:",
            f"  Symbols: {', '.join(self.config['symbols'])}",
            f"  Timeframe: {self.config['timeframe']}",
            f"  Data Type: {self.config['data_type']}",
            f"  Estimated Cost: ${self.config['estimated_cost']:,.0f}",
            f"  Expected Sharpe: {self.config['expected_sharpe']:.2f}",
            "",
            "EXPECTED TIMELINE:",
            "  Data Download: 2-4 hours",
            "  Feature Extraction: 1-2 hours",
            "  Model Training: 4-8 hours",
            "  Total Time: 7-14 hours",
        ]

        for instruction in instructions:
            logger.info(instruction)

    def run_setup(self):
        """Run complete setup"""
        logger.info("DATABENTO TRAINING SETUP")
        logger.info("=" * 60)

        # Check connection status
        connected = self.check_connection_status()

        # Create training configuration
        self.create_training_config()

        # Show instructions
        self.show_setup_instructions()

        logger.info("=" * 60)
        if connected:
            logger.info("SUCCESS: READY TO START TRAINING!")
        else:
            logger.info("WARNING: Add DATABENTO_API_KEY to start training")


def main():
    """Main setup function"""
    setup = DatabentoTrainingSetup()
    setup.run_setup()


if __name__ == "__main__":
    main()
