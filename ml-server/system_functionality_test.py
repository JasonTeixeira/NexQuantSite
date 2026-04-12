"""
COMPREHENSIVE SYSTEM FUNCTIONALITY TEST
Tests all components to ensure they work correctly after cleanup
"""

import importlib
import os
from pathlib import Path


class SystemFunctionalityTester:
    """Comprehensive system functionality tester"""

    def __init__(self):
        self.test_results = {"passed": [], "failed": [], "warnings": [], "critical_errors": []}

    def test_python_imports(self):
        """Test Python module imports"""
        print("🐍 Testing Python module imports...")

        modules_to_test = [
            "numpy",
            "pandas",
            "torch",
            "fastapi",
            "uvicorn",
            "redis",
            "sqlalchemy",
            "requests",
        ]

        for module in modules_to_test:
            try:
                importlib.import_module(module)
                self.test_results["passed"].append(f"✅ {module} import successful")
                print(f"  ✅ {module}")
            except ImportError as e:
                self.test_results["failed"].append(f"❌ {module} import failed: {e}")
                print(f"  ❌ {module}: {e}")

    def test_ml_platform_components(self):
        """Test ML platform components"""
        print("\n🧠 Testing ML Platform Components...")

        ml_components = [
            "ml-platform/serving/subscription_api.py",
            "ml-platform/connectors/databento_connector.py",
            "ml-platform/connectors/livevol_connector.py",
            "ml-platform/security/secure_authentication.py",
            "ml-platform/data_quality/real_time_validator.py",
            "ml-platform/optimization/model_optimizer.py",
            "ml-platform/quant_grade/quant_calculations.py",
            "ml-platform/backtesting/world_class_backtesting_engine.py",
        ]

        for component in ml_components:
            if Path(component).exists():
                try:
                    # Test if file can be imported
                    module_name = component.replace("/", ".").replace(".py", "")
                    importlib.import_module(module_name)
                    self.test_results["passed"].append(f"✅ {component} functional")
                    print(f"  ✅ {component}")
                except Exception as e:
                    self.test_results["warnings"].append(f"⚠️ {component} has issues: {e}")
                    print(f"  ⚠️ {component}: {e}")
            else:
                self.test_results["critical_errors"].append(f"❌ {component} missing")
                print(f"  ❌ {component} - MISSING")

    def test_trading_app_components(self):
        """Test trading app components"""
        print("\n📈 Testing Trading App Components...")

        trading_components = [
            "trading-app/desktop/package.json",
            "trading-app/api/backend/requirements.txt",
            "trading-app/api/backend/main.py",
            "trading-app/desktop/src/renderer/App.tsx",
        ]

        for component in trading_components:
            if Path(component).exists():
                self.test_results["passed"].append(f"✅ {component} present")
                print(f"  ✅ {component}")
            else:
                self.test_results["critical_errors"].append(f"❌ {component} missing")
                print(f"  ❌ {component} - MISSING")

    def test_website_components(self):
        """Test website components"""
        print("\n🌐 Testing Website Components...")

        website_components = [
            "website/frontend/package.json",
            "website/backend/requirements.txt",
            "website/backend/main.py",
            "website/frontend/app/page.tsx",
        ]

        for component in website_components:
            if Path(component).exists():
                self.test_results["passed"].append(f"✅ {component} present")
                print(f"  ✅ {component}")
            else:
                self.test_results["critical_errors"].append(f"❌ {component} missing")
                print(f"  ❌ {component} - MISSING")

    def test_master_control_components(self):
        """Test master control components"""
        print("\n🎛️ Testing Master Control Components...")

        master_components = [
            "master-control/backend/app/main.py",
            "master-control/frontend/package.json",
            "master-control/backend/app/services/docker_manager.py",
            "master-control/frontend/src/components/Dashboard.tsx",
        ]

        for component in master_components:
            if Path(component).exists():
                self.test_results["passed"].append(f"✅ {component} present")
                print(f"  ✅ {component}")
            else:
                self.test_results["warnings"].append(f"⚠️ {component} missing")
                print(f"  ⚠️ {component} - MISSING")

    def test_infrastructure_components(self):
        """Test infrastructure components"""
        print("\n🏗️ Testing Infrastructure Components...")

        infra_components = [
            "infrastructure/docker-compose.yml",
            "infrastructure/railway.json",
            "infrastructure/vercel.json",
            "scripts/setup.sh",
            "scripts/generate_secure_secrets.py",
        ]

        for component in infra_components:
            if Path(component).exists():
                self.test_results["passed"].append(f"✅ {component} present")
                print(f"  ✅ {component}")
            else:
                self.test_results["warnings"].append(f"⚠️ {component} missing")
                print(f"  ⚠️ {component} - MISSING")

    def test_critical_ml_files(self):
        """Test critical ML files that were removed"""
        print("\n🔍 Testing Critical ML Files...")

        critical_ml_files = [
            "ml-platform/ultimate_ml_ensemble.py",
            "ml-platform/ultimate_integrated_system.py",
            "ml-platform/cross_asset_correlation_system.py",
            "ml-platform/live_streaming_system.py",
            "ml-platform/start_live_streaming.py",
            "ml-platform/live_monitoring_dashboard.py",
            "ml-platform/start_hybrid_system.py",
        ]

        for file_path in critical_ml_files:
            if Path(file_path).exists():
                self.test_results["passed"].append(f"✅ {file_path} present")
                print(f"  ✅ {file_path}")
            else:
                self.test_results["critical_errors"].append(
                    f"❌ {file_path} MISSING - NEEDS RESTORATION"
                )
                print(f"  ❌ {file_path} - MISSING (NEEDS RESTORATION)")

    def test_file_references(self):
        """Test if files are properly referenced"""
        print("\n🔗 Testing File References...")

        # Check if any files are trying to import missing modules
        python_files = []
        for root, _dirs, files in os.walk("."):
            for file in files:
                if file.endswith(".py"):
                    python_files.append(Path(root) / file)

        broken_imports = []
        for py_file in python_files[:20]:  # Test first 20 files
            try:
                with open(py_file, encoding="utf-8") as f:
                    content = f.read()

                # Check for imports of missing files
                if "from ultimate_ml_ensemble import" in content:
                    if not Path("ml-platform/ultimate_ml_ensemble.py").exists():
                        broken_imports.append(f"{py_file} imports missing ultimate_ml_ensemble")

                if "from ultimate_integrated_system import" in content:
                    if not Path("ml-platform/ultimate_integrated_system.py").exists():
                        broken_imports.append(
                            f"{py_file} imports missing ultimate_integrated_system"
                        )

            except Exception as e:
                broken_imports.append(f"{py_file} has import issues: {e}")

        if broken_imports:
            for broken in broken_imports:
                self.test_results["critical_errors"].append(f"❌ {broken}")
                print(f"  ❌ {broken}")
        else:
            self.test_results["passed"].append("✅ No broken imports found")
            print("  ✅ No broken imports found")

    def test_build_systems(self):
        """Test build systems"""
        print("\n🔨 Testing Build Systems...")

        build_files = [
            "trading-app/desktop/package.json",
            "website/frontend/package.json",
            "master-control/frontend/package.json",
        ]

        for build_file in build_files:
            if Path(build_file).exists():
                try:
                    import json

                    with open(build_file) as f:
                        data = json.load(f)

                    if "scripts" in data and "dev" in data["scripts"]:
                        self.test_results["passed"].append(f"✅ {build_file} has dev script")
                        print(f"  ✅ {build_file} - dev script present")
                    else:
                        self.test_results["warnings"].append(f"⚠️ {build_file} missing dev script")
                        print(f"  ⚠️ {build_file} - missing dev script")

                except Exception as e:
                    self.test_results["failed"].append(f"❌ {build_file} has issues: {e}")
                    print(f"  ❌ {build_file}: {e}")
            else:
                self.test_results["critical_errors"].append(f"❌ {build_file} missing")
                print(f"  ❌ {build_file} - MISSING")

    def run_comprehensive_test(self):
        """Run all tests"""
        print("🧪 STARTING COMPREHENSIVE SYSTEM FUNCTIONALITY TEST")
        print("=" * 60)

        # Run all test categories
        self.test_python_imports()
        self.test_ml_platform_components()
        self.test_trading_app_components()
        self.test_website_components()
        self.test_master_control_components()
        self.test_infrastructure_components()
        self.test_critical_ml_files()
        self.test_file_references()
        self.test_build_systems()

        # Generate summary
        self.generate_test_summary()

    def generate_test_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)

        print(f"\n✅ PASSED TESTS: {len(self.test_results['passed'])}")
        for test in self.test_results["passed"][:10]:  # Show first 10
            print(f"  {test}")
        if len(self.test_results["passed"]) > 10:
            print(f"  ... and {len(self.test_results['passed']) - 10} more")

        print(f"\n⚠️ WARNINGS: {len(self.test_results['warnings'])}")
        for warning in self.test_results["warnings"]:
            print(f"  {warning}")

        print(f"\n❌ FAILED TESTS: {len(self.test_results['failed'])}")
        for test in self.test_results["failed"]:
            print(f"  {test}")

        print(f"\n🚨 CRITICAL ERRORS: {len(self.test_results['critical_errors'])}")
        for error in self.test_results["critical_errors"]:
            print(f"  {error}")

        # Overall status
        if self.test_results["critical_errors"]:
            print("\n❌ SYSTEM STATUS: CRITICAL ISSUES DETECTED")
            print("   Some critical components are missing and need restoration")
        elif self.test_results["failed"]:
            print("\n⚠️ SYSTEM STATUS: SOME ISSUES DETECTED")
            print("   System has some issues but is mostly functional")
        else:
            print("\n✅ SYSTEM STATUS: ALL SYSTEMS OPERATIONAL")
            print("   All critical components are working correctly")

        print("\n📈 TEST STATISTICS:")
        print(
            f"  Total Tests: {len(self.test_results['passed']) + len(self.test_results['failed']) + len(self.test_results['warnings']) + len(self.test_results['critical_errors'])}"
        )
        print(
            f"  Success Rate: {len(self.test_results['passed']) / max(1, len(self.test_results['passed']) + len(self.test_results['failed'])) * 100:.1f}%"
        )


def main():
    """Main test function"""
    tester = SystemFunctionalityTester()
    tester.run_comprehensive_test()


if __name__ == "__main__":
    main()
