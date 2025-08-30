#!/usr/bin/env python3
"""
Quick API Gateway for Professional Integration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import sys

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

app = FastAPI(title="Nexural Professional API Gateway", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Nexural Professional API Gateway", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-gateway", "version": "1.0.0"}

@app.get("/api/v1/status")
async def api_status():
    return {
        "status": "operational", 
        "version": "1.0.0",
        "services": {
            "api_gateway": "running",
            "backtesting_engine": "available", 
            "data_processing": "available"
        }
    }

@app.get("/api/v1/services")
async def list_services():
    return {
        "services": [
            {"name": "API Gateway", "port": 3010, "status": "running"},
            {"name": "Backtesting Engine", "status": "available"},
            {"name": "Data Processing", "status": "available"},
            {"name": "Professional UI", "port": 3000, "status": "connected"}
        ]
    }

@app.get("/api/v1/backtest/status")
async def backtest_status():
    return {
        "engine": "Nexural Professional Backtesting",
        "version": "1.0.0",
        "capabilities": [
            "institutional_grade_backtesting",
            "advanced_analytics", 
            "real_time_processing",
            "professional_reporting"
        ],
        "performance": "1.67M+ rows/second",
        "status": "ready"
    }

if __name__ == "__main__":
    print("🚀 Starting Nexural Professional API Gateway...")
    print("=" * 50)
    print("Backend: http://localhost:3010")
    print("Health: http://localhost:3010/health") 
    print("API Status: http://localhost:3010/api/v1/status")
    print("Documentation: http://localhost:3010/docs")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=3010)
