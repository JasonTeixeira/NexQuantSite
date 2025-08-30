"""
Start All Services - Launch all backend services with proper dependencies
"""

import subprocess
import sys
import time
import os
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def install_requirements():
    """Install required Python packages"""
    requirements = [
        "fastapi",
        "uvicorn[standard]",
        "httpx",
        "pydantic[email]",
        "PyJWT",
        "passlib[bcrypt]",
        "python-multipart",
        "python-jose[cryptography]",
        "yfinance",
        "pandas",
        "optuna",
        "numpy",
        "websockets"
    ]
    
    logger.info("Installing required packages...")
    for package in requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            logger.info(f"✅ Installed {package}")
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Failed to install {package}: {e}")
            continue

def start_service(service_name, script_path, port):
    """Start a service in background"""
    try:
        logger.info(f"Starting {service_name} on port {port}...")
        
        # Change to service directory
        service_dir = Path(script_path).parent
        
        # Start service
        process = subprocess.Popen([
            sys.executable, script_path
        ], cwd=service_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Give service time to start
        time.sleep(2)
        
        # Check if process is still running
        if process.poll() is None:
            logger.info(f"✅ {service_name} started successfully on port {port}")
            return process
        else:
            stdout, stderr = process.communicate()
            logger.error(f"❌ {service_name} failed to start:")
            logger.error(f"STDOUT: {stdout.decode()}")
            logger.error(f"STDERR: {stderr.decode()}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Failed to start {service_name}: {e}")
        return None

def check_service_health(service_name, port):
    """Check if service is healthy"""
    import httpx
    try:
        response = httpx.get(f"http://localhost:{port}/health", timeout=5.0)
        if response.status_code == 200:
            logger.info(f"✅ {service_name} health check passed")
            return True
        else:
            logger.warning(f"⚠️ {service_name} health check failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ {service_name} health check error: {e}")
        return False

def main():
    """Main function to start all services"""
    logger.info("🚀 Starting Nexus Quantum Backend Services...")
    
    # Install requirements first
    install_requirements()
    
    # Define services
    services = [
        ("API Gateway", "services/api-gateway/src/gateway.py", 3010),
        ("HPO Service", "services/hpo-service/src/hpo_service.py", 3011),
        ("Data Service", "services/data-service/src/data_service.py", 3012),
        ("Auth Service", "services/auth-service/src/auth_service.py", 3013),
        ("Portfolio Service", "services/portfolio-service/src/portfolio_service.py", 3014),
        ("AI Service", "services/ai-service/src/ai_service.py", 3015),
        ("WebSocket Service", "services/websocket-service/src/websocket_service.py", 3016),
    ]
    
    processes = []
    
    # Start services
    for service_name, script_path, port in services:
        process = start_service(service_name, script_path, port)
        if process:
            processes.append((service_name, process, port))
        
        # Wait between services to avoid port conflicts
        time.sleep(1)
    
    # Give all services time to fully start
    logger.info("⏳ Waiting for services to initialize...")
    time.sleep(5)
    
    # Health check all services
    logger.info("🔍 Performing health checks...")
    healthy_services = 0
    
    for service_name, process, port in processes:
        if check_service_health(service_name, port):
            healthy_services += 1
    
    # Summary
    logger.info(f"\n📊 STARTUP SUMMARY")
    logger.info(f"Total services: {len(services)}")
    logger.info(f"Started successfully: {len(processes)}")
    logger.info(f"Health checks passed: {healthy_services}")
    
    if healthy_services == len(services):
        logger.info("🎉 All services are running and healthy!")
    else:
        logger.warning(f"⚠️ {len(services) - healthy_services} service(s) may have issues")
    
    logger.info("\n🌐 SERVICE ENDPOINTS:")
    logger.info("API Gateway:      http://localhost:3010")
    logger.info("HPO Service:      http://localhost:3011") 
    logger.info("Data Service:     http://localhost:3012")
    logger.info("Auth Service:     http://localhost:3013")
    logger.info("Portfolio Service: http://localhost:3014")
    logger.info("AI Service:       http://localhost:3015")
    logger.info("WebSocket Service: ws://localhost:3016")
    
    logger.info("\n📖 API DOCUMENTATION:")
    logger.info("API Gateway Docs: http://localhost:3010/docs")
    logger.info("All services have /docs endpoints for API documentation")
    
    logger.info("\n🎯 FRONTEND CONNECTION:")
    logger.info("Configure your frontend to use: http://localhost:3010")
    logger.info("WebSocket URL: ws://localhost:3016")
    
    # Keep services running
    try:
        logger.info("\n⏸️ Press Ctrl+C to stop all services")
        while True:
            time.sleep(1)
            
            # Check if any process died
            for i, (name, process, port) in enumerate(processes[:]):
                if process.poll() is not None:
                    logger.error(f"❌ {name} has stopped unexpectedly")
                    processes.pop(i)
                    
    except KeyboardInterrupt:
        logger.info("\n🛑 Shutting down services...")
        
        for service_name, process, port in processes:
            try:
                process.terminate()
                logger.info(f"✅ Stopped {service_name}")
            except Exception as e:
                logger.error(f"❌ Error stopping {service_name}: {e}")
        
        logger.info("👋 All services stopped")

if __name__ == "__main__":
    main()
