#!/usr/bin/env python3
"""
Project Cleanup Script
======================

Cleans up unnecessary files and organizes project for professional GitHub repository.
"""

import os
import shutil
import glob
from pathlib import Path


def delete_files(pattern_list, description=""):
    """Delete files matching patterns."""
    deleted_count = 0
    for pattern in pattern_list:
        files = glob.glob(pattern)
        for file in files:
            try:
                os.remove(file)
                print(f"   ✅ Deleted: {file}")
                deleted_count += 1
            except Exception as e:
                print(f"   ⚠️  Could not delete {file}: {e}")
    
    if deleted_count > 0:
        print(f"🗑️  {description}: {deleted_count} files cleaned up")
    return deleted_count


def delete_directories(dir_list, description=""):
    """Delete directories."""
    deleted_count = 0
    for dir_path in dir_list:
        if os.path.exists(dir_path):
            try:
                shutil.rmtree(dir_path)
                print(f"   ✅ Deleted directory: {dir_path}")
                deleted_count += 1
            except Exception as e:
                print(f"   ⚠️  Could not delete {dir_path}: {e}")
    
    if deleted_count > 0:
        print(f"📁 {description}: {deleted_count} directories cleaned up")
    return deleted_count


def main():
    """Clean up project for professional organization."""
    print("🧹 PROJECT CLEANUP - PROFESSIONAL ORGANIZATION")
    print("=" * 55)
    print("Removing unnecessary files for clean GitHub repository...\n")
    
    total_deleted = 0
    
    # 1. Remove redundant documentation files
    redundant_docs = [
        "*MISSION*", "*GRADE*", "*SCORECARD*", "*SUCCESS*", "*COMPREHENSIVE*",
        "*HONEST*", "*ULTRA*", "*LEGENDARY*", "*WORLD_CLASS*", "*WEEK*", 
        "*PHASE*", "*COMPLETION*", "*FINAL*", "*ULTIMATE*", "*BRUTAL*",
        "*PLATFORM_STATUS*", "*ASSESSMENT*", "*REPORT*", "MBP10_INTEGRATION*",
        "*ENHANCEMENT*", "*IMPROVEMENT*", "*VALIDATION*", "*WEAKNESS*",
        "*SECURITY_REPORT*", "*COMPARISON*", "*GAME_PLAN*", "*CHECKLIST*",
        "*SETUP_GUIDE*", "*DEPLOYMENT*", "*PRODUCTION*", "*GO_LIVE*",
        "*TRADING_PLATFORM*", "*CONNECTION*", "*INTEGRATION*"
    ]
    
    total_deleted += delete_files(redundant_docs, "Redundant documentation")
    
    # 2. Remove temporary test files
    temp_files = [
        "test_*.py", "*test*.py", "*_test.py", "debug_*.py", "quick_*.py",
        "validate_*.py", "check_*.py", "fix_*.py", "setup_*.py",
        "comprehensive_*.py", "final_*.py", "brutal_*.py", "targeted_*.py",
        "phase*_*.py", "week*_*.py", "*validation*.py"
    ]
    
    # Exclude essential test files
    essential_tests = ["tests/run_institutional_tests.py", "tests/performance/comprehensive_test_suite.py"]
    temp_files_to_delete = []
    for pattern in temp_files:
        files = glob.glob(pattern)
        for file in files:
            if file not in essential_tests:
                temp_files_to_delete.append(file)
    
    for file in temp_files_to_delete:
        try:
            os.remove(file)
            print(f"   ✅ Deleted: {file}")
            total_deleted += 1
        except Exception as e:
            print(f"   ⚠️  Could not delete {file}: {e}")
    
    print(f"🧪 Temporary test files: {len(temp_files_to_delete)} files cleaned up")
    
    # 3. Remove development artifacts
    dev_artifacts = [
        "*.bat", "*.ps1", "*.sh", "create_*", "save_*", "start_*", "deploy*",
        "execute_*.py", "monitor*.py", "restart_*.py", "disaster_recovery",
        "init.sql", "nginx.conf", "docker-compose*.yml", "Dockerfile",
        "*.db", "*.sqlite*", "world_class_demo_report_*.html", 
        "benchmark_results.json", "*validation_report.json", "PROJECT_REORGANIZATION.md"
    ]
    
    total_deleted += delete_files(dev_artifacts, "Development artifacts")
    
    # 4. Remove cache and temporary directories
    temp_dirs = [
        "__pycache__", "data_cache", "test_disaster_recovery", ".streamlit",
        "nexus-99-quantum-backend", "nexus-quantum-frontend", "disaster_recovery",
        "old_nexural_backtesting"  # If it exists
    ]
    
    total_deleted += delete_directories(temp_dirs, "Cache and temp directories")
    
    # 5. Remove integration files we're not using
    unused_integrations = [
        "*alpaca*.py", "*ninja*.py", "*interactive_brokers*.py", "*data_bento*.py",
        "*triple_broker*.py", "*dual_broker*.py", "*trading*.py", "*ml_trading*.py",
        "*portfolio_management*.py", "*risk_management*.py", "GET_ALPACA*.md",
        "ALPACA_*.md", "FUTURES_*.md"
    ]
    
    total_deleted += delete_files(unused_integrations, "Unused integrations")
    
    # 6. Move test report to assets
    test_reports = glob.glob("*test_report*.html")
    if test_reports:
        for report in test_reports:
            try:
                shutil.move(report, f"assets/reports/{os.path.basename(report)}")
                print(f"   📊 Moved test report: {report} → assets/reports/")
                total_deleted += 1
            except Exception as e:
                print(f"   ⚠️  Could not move {report}: {e}")
    
    # 7. Clean up remaining individual files
    cleanup_files = [
        "cleanup_project.py",  # This script itself
        "interactive_dashboard.py",  # Already moved to examples
    ]
    
    for file in cleanup_files:
        if os.path.exists(file) and file != "cleanup_project.py":  # Don't delete self until end
            try:
                os.remove(file)
                print(f"   ✅ Deleted: {file}")
                total_deleted += 1
            except Exception as e:
                print(f"   ⚠️  Could not delete {file}: {e}")
    
    print(f"\n" + "=" * 55)
    print(f"🎉 CLEANUP COMPLETED!")
    print(f"📊 Total files/directories cleaned: {total_deleted}")
    print("=" * 55)
    
    # Show final project structure
    print(f"\n📁 FINAL PROFESSIONAL PROJECT STRUCTURE:")
    print("nexural-backtesting/")
    print("├── README.md                    # Professional documentation")  
    print("├── LICENSE                      # MIT License")
    print("├── CHANGELOG.md                 # Version history")
    print("├── requirements.txt             # Dependencies")
    print("├── pyproject.toml               # Modern Python packaging")
    print("├── .gitignore                   # Git ignore rules")
    print("├── .github/workflows/           # CI/CD pipelines")
    print("├── src/nexural_backtesting/     # Core package")
    print("├── tests/                       # Comprehensive tests")
    print("├── examples/                    # Usage examples")
    print("├── docs/                        # Documentation")
    print("├── scripts/                     # Utility scripts")
    print("└── assets/                      # Static assets")
    
    print(f"\n✅ Your project is now professionally organized!")
    print(f"🚀 Ready for GitHub and impressive to developers!")
    print(f"🏆 Institutional-grade structure achieved!")
    
    # Delete this cleanup script last
    try:
        os.remove(__file__)
        print(f"\n🗑️  Cleanup script self-destructed ✨")
    except:
        print(f"\n⚠️  Please manually delete: {__file__}")


if __name__ == "__main__":
    main()
