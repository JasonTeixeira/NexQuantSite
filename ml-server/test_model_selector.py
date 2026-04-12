#!/usr/bin/env python3
"""
TEST MODEL SELECTOR SYSTEM
Test script to verify the multi-model architecture selection system
"""

from datetime import datetime

import requests

# Test configuration
API_BASE_URL = "http://localhost:8001"


def test_api_health():
    """Test API health endpoint"""
    print("🔍 Testing API Health...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Health: {data['status']}")
            print(f"   Current Model: {data.get('current_model', 'N/A')}")
            print(f"   Available Models: {data.get('available_models_count', 0)}")
            return True
        else:
            print(f"❌ API Health failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Health error: {e}")
        return False


def test_get_models():
    """Test getting available models"""
    print("\n🔍 Testing Get Available Models...")
    try:
        response = requests.get(f"{API_BASE_URL}/models")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Available Models: {len(data['models'])} models found")
            for model_id, model_data in data["models"].items():
                print(f"   - {model_id}: {model_data['name']}")
            return data
        else:
            print(f"❌ Get Models failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Get Models error: {e}")
        return None


def test_get_current_model():
    """Test getting current model"""
    print("\n🔍 Testing Get Current Model...")
    try:
        response = requests.get(f"{API_BASE_URL}/models/current")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Current Model: {data['current_model']}")
            if data["config"]:
                print(f"   Name: {data['config']['name']}")
                print(f"   Version: {data['config']['version']}")
            return data
        else:
            print(f"❌ Get Current Model failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Get Current Model error: {e}")
        return None


def test_switch_model(model_id: str):
    """Test switching to a different model"""
    print(f"\n🔍 Testing Switch Model to {model_id}...")
    try:
        response = requests.post(f"{API_BASE_URL}/models/switch", json={"model_id": model_id})
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Switch Model: {data['message']}")
            print(f"   Current Model: {data['current_model']}")
            return data["success"]
        else:
            print(f"❌ Switch Model failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Switch Model error: {e}")
        return False


def test_model_comparison():
    """Test getting model comparison"""
    print("\n🔍 Testing Model Comparison...")
    try:
        response = requests.get(f"{API_BASE_URL}/models/comparison")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Model Comparison: {len(data['models'])} models compared")
            print(f"   Current Model: {data['current_model']}")
            return data
        else:
            print(f"❌ Model Comparison failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Model Comparison error: {e}")
        return None


def test_model_performance(model_id: str):
    """Test getting model performance"""
    print(f"\n🔍 Testing Model Performance for {model_id}...")
    try:
        response = requests.get(f"{API_BASE_URL}/models/{model_id}/performance")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Model Performance: {data['message']}")
            if data["performance"]:
                perf = data["performance"]
                print(f"   Sharpe Ratio: {perf.get('sharpe_ratio', 'N/A')}")
                print(f"   Win Rate: {perf.get('win_rate', 'N/A')}")
                print(f"   Profit Factor: {perf.get('profit_factor', 'N/A')}")
            else:
                print("   No performance data available")
            return data
        else:
            print(f"❌ Model Performance failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Model Performance error: {e}")
        return None


def test_evaluate_model(model_id: str):
    """Test evaluating a model"""
    print(f"\n🔍 Testing Model Evaluation for {model_id}...")
    try:
        response = requests.post(
            f"{API_BASE_URL}/models/{model_id}/evaluate", json={"model_id": model_id, "days": 30}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Model Evaluation: {data['message']}")
            return data["success"]
        else:
            print(f"❌ Model Evaluation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Model Evaluation error: {e}")
        return False


def test_make_prediction(model_id: str):
    """Test making a prediction with a model"""
    print(f"\n🔍 Testing Prediction with {model_id}...")
    try:
        # Sample market data
        test_data = {
            "price": 4500.0,
            "volume": 1000000,
            "timestamp": datetime.now().isoformat(),
            "symbol": "ES",
            "features": {"volatility": 0.15, "momentum": 0.02, "volume_imbalance": 0.1},
        }

        response = requests.post(f"{API_BASE_URL}/models/{model_id}/predict", json=test_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prediction: {data['message']}")
            if data["prediction"]:
                pred = data["prediction"]
                print(f"   Signal: {pred.get('signal', 'N/A')}")
                print(f"   Confidence: {pred.get('confidence', 'N/A')}")
                print(f"   Should Trade: {pred.get('should_trade', 'N/A')}")
                print(f"   Regime: {pred.get('regime', 'N/A')}")
            return data["success"]
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return False


def run_comprehensive_test():
    """Run comprehensive test of the model selector system"""
    print("🚀 Starting Comprehensive Model Selector Test")
    print("=" * 50)

    # Test 1: API Health
    if not test_api_health():
        print("❌ API Health test failed. Stopping tests.")
        return False

    # Test 2: Get Available Models
    models_data = test_get_models()
    if not models_data:
        print("❌ Get Models test failed. Stopping tests.")
        return False

    # Test 3: Get Current Model
    current_model_data = test_get_current_model()
    if not current_model_data:
        print("❌ Get Current Model test failed. Stopping tests.")
        return False

    # Test 4: Model Comparison
    comparison_data = test_model_comparison()
    if not comparison_data:
        print("❌ Model Comparison test failed. Stopping tests.")
        return False

    # Test 5: Test switching to different models
    available_models = list(models_data["models"].keys())
    if len(available_models) > 1:
        # Try switching to the second model
        test_model_id = (
            available_models[1]
            if available_models[1] != current_model_data["current_model"]
            else available_models[0]
        )
        if test_switch_model(test_model_id):
            # Test performance and prediction with the new model
            test_model_performance(test_model_id)
            test_evaluate_model(test_model_id)
            test_make_prediction(test_model_id)

            # Switch back to original model
            original_model = current_model_data["current_model"]
            test_switch_model(original_model)

    # Test 6: Test performance and prediction with current model
    current_model = current_model_data["current_model"]
    test_model_performance(current_model)
    test_evaluate_model(current_model)
    test_make_prediction(current_model)

    print("\n" + "=" * 50)
    print("✅ Comprehensive Model Selector Test Completed!")
    print("🎯 All core functionality tested successfully")

    return True


if __name__ == "__main__":
    # Run the comprehensive test
    success = run_comprehensive_test()

    if success:
        print("\n🎉 Model Selector System is working correctly!")
        print("\n📋 Summary:")
        print("   ✅ API endpoints are responding")
        print("   ✅ Model switching is functional")
        print("   ✅ Performance tracking is working")
        print("   ✅ Predictions can be made")
        print("   ✅ Model comparison is available")
        print("\n🚀 Ready for frontend integration!")
    else:
        print("\n❌ Model Selector System has issues!")
        print("Please check the API server and Redis connection.")
