#!/usr/bin/env python3
"""
Local Quick Deploy - Get platform running locally without Docker
"""

import subprocess
import os
import sys
import time
from pathlib import Path

def check_dependencies():
    """Check if required tools are available"""
    print("Checking dependencies...")
    
    # Check Python
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(f"✅ Python: {result.stdout.strip()}")
    except:
        print("❌ Python not available")
        return False
    
    # Check Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"✅ Node.js: {result.stdout.strip()}")
    except:
        print("❌ Node.js not available")
        return False
    
    return True

def start_backend_services():
    """Start backend services individually"""
    print("\nStarting backend services...")
    
    base_dir = Path.cwd() / "nexus-99-quantum-backend"
    
    services = [
        ("API Gateway", "services/api-gateway/src/gateway.py", 3010),
        ("Data Service", "services/data-service/src/data_service.py", 3012),
        ("Auth Service", "services/auth-service/src/auth_service.py", 3013),
        ("Portfolio Service", "services/portfolio-service/src/portfolio_service.py", 3014),
    ]
    
    processes = []
    
    for service_name, script_path, port in services:
        full_path = base_dir / script_path
        
        if full_path.exists():
            try:
                print(f"Starting {service_name} on port {port}...")
                process = subprocess.Popen([
                    sys.executable, str(full_path)
                ], cwd=full_path.parent)
                
                processes.append((service_name, process, port))
                print(f"✅ {service_name} started (PID: {process.pid})")
                time.sleep(2)  # Wait between services
                
            except Exception as e:
                print(f"❌ Failed to start {service_name}: {e}")
        else:
            print(f"❌ {service_name} script not found: {full_path}")
    
    return processes

def start_frontend():
    """Start frontend development server"""
    print("\nStarting frontend...")
    
    frontend_dir = Path.cwd() / "nexus-quantum-frontend/nexus-quantum-terminal"
    
    if not frontend_dir.exists():
        print(f"❌ Frontend directory not found: {frontend_dir}")
        return None
    
    try:
        # Start frontend
        print("Starting Next.js development server...")
        process = subprocess.Popen([
            "npm", "run", "dev"
        ], cwd=frontend_dir)
        
        print(f"✅ Frontend started (PID: {process.pid})")
        return process
        
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def wait_and_test():
    """Wait for services and test connectivity"""
    print("\nWaiting for services to initialize...")
    time.sleep(10)
    
    # Test services
    import requests
    
    services = [
        ("API Gateway", "http://localhost:3010/health"),
        ("Frontend", "http://localhost:3000"),
    ]
    
    for name, url in services:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: WORKING")
            else:
                print(f"⚠️ {name}: HTTP {response.status_code}")
        except:
            print(f"❌ {name}: NOT RESPONDING")

def main():
    print("🚀 NEXUS TRADING PLATFORM - LOCAL QUICK DEPLOY")
    print("=" * 60)
    
    if not check_dependencies():
        print("❌ Missing dependencies")
        return
    
    # Start services
    backend_processes = start_backend_services()
    frontend_process = start_frontend()
    
    # Test everything
    wait_and_test()
    
    # Keep running
    print("\n🎉 PLATFORM IS RUNNING!")
    print("=" * 60)
    print("Frontend: http://localhost:3000")
    print("API: http://localhost:3010")
    print("API Docs: http://localhost:3010/docs")
    print("=" * 60)
    print("Press Ctrl+C to stop all services")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping services...")
        
        # Stop frontend
        if frontend_process:
            frontend_process.terminate()
        
        # Stop backend services
        for name, process, port in backend_processes:
            try:
                process.terminate()
                print(f"✅ Stopped {name}")
            except:
                pass

if __name__ == "__main__":
    main()
