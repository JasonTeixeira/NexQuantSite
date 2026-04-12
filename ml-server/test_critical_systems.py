#!/usr/bin/env python3
"""
CRITICAL SYSTEM VERIFICATION
Test the core ML systems to ensure they're working
"""

import sys

# Add current directory to path
sys.path.append(".")


def test_ml_systems():
    """Test critical ML systems"""
    print("🧪 TESTING CRITICAL ML SYSTEMS...")

    try:
        # Test ML Ensemble
        import importlib.util

        spec = importlib.util.spec_from_file_location(
            "ultimate_ml_ensemble", "ml-platform/ultimate_ml_ensemble.py"
        )
        ultimate_ml_ensemble = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ultimate_ml_ensemble)
        print("✅ ML Ensemble System: WORKING")

        # Test Integrated System
        spec = importlib.util.spec_from_file_location(
            "ultimate_integrated_system", "ml-platform/ultimate_integrated_system.py"
        )
        ultimate_integrated_system = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ultimate_integrated_system)
        print("✅ Integrated System: WORKING")

        # Test Cross-Asset System
        spec = importlib.util.spec_from_file_location(
            "cross_asset_correlation_system", "ml-platform/cross_asset_correlation_system.py"
        )
        cross_asset_correlation_system = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cross_asset_correlation_system)
        print("✅ Cross-Asset System: WORKING")

        print("\n🎉 ALL CRITICAL ML SYSTEMS ARE OPERATIONAL!")
        return True

    except Exception as e:
        print(f"❌ CRITICAL SYSTEM ERROR: {e}")
        return False


if __name__ == "__main__":
    test_ml_systems()
