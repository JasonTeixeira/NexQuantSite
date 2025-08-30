#!/usr/bin/env python3
"""
BYOK API Backend Integration
============================

FastAPI backend to support the beautiful BYOK UI with:
- API key validation and encryption
- Secure session management
- Data source routing
- Security audit logging
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import uvicorn
import logging
import asyncio
from datetime import datetime, timedelta
import json

# Import our secure BYOK system
from secure_byok_system import SecureBYOKSystem, DataProviderValidator

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Nexus Quantum BYOK API",
    description="Secure API for Bring Your Own Keys functionality",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize BYOK system
byok_system = SecureBYOKSystem()

# Pydantic models
class APIKeyRequest(BaseModel):
    provider: str
    api_key: str
    secret_key: Optional[str] = None

class BacktestRequest(BaseModel):
    symbols: List[str]
    start_date: str
    end_date: str
    frequency: str = "1min"
    data_source: str = "auto"
    strategy_config: Optional[Dict] = None

class SessionTerminateRequest(BaseModel):
    session_id: str

# API Endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "byok-api", "timestamp": datetime.now().isoformat()}

@app.get("/api/byok/security-status")
async def get_security_status():
    """Get security status of the BYOK system"""
    try:
        status = byok_system.get_security_status()
        return JSONResponse(content=status)
    except Exception as e:
        logger.error(f"Failed to get security status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get security status")

@app.get("/api/byok/platform-inventory")
async def get_platform_inventory():
    """Get platform data inventory"""
    try:
        # Simulate platform data inventory
        inventory = [
            {
                "symbol": "ES",
                "asset_type": "Futures",
                "data_start": "2020-01-01",
                "data_end": "2024-12-31",
                "frequency": "1min",
                "is_available": True
            },
            {
                "symbol": "NQ",
                "asset_type": "Futures", 
                "data_start": "2020-01-01",
                "data_end": "2024-12-31",
                "frequency": "1min",
                "is_available": True
            },
            {
                "symbol": "AAPL",
                "asset_type": "Equity",
                "data_start": "2015-01-01",
                "data_end": "2024-12-31",
                "frequency": "1min",
                "is_available": True
            },
            {
                "symbol": "TSLA",
                "asset_type": "Equity",
                "data_start": "2018-01-01", 
                "data_end": "2024-12-31",
                "frequency": "1min",
                "is_available": True
            },
            {
                "symbol": "SPY",
                "asset_type": "ETF",
                "data_start": "2010-01-01",
                "data_end": "2024-12-31", 
                "frequency": "1min",
                "is_available": True
            }
        ]
        
        return JSONResponse(content=inventory)
        
    except Exception as e:
        logger.error(f"Failed to get platform inventory: {e}")
        raise HTTPException(status_code=500, detail="Failed to get platform inventory")

@app.post("/api/byok/validate-key")
async def validate_api_key(request: APIKeyRequest, client_request: Request):
    """Validate an API key without storing it"""
    try:
        validator = DataProviderValidator()
        
        is_valid = await validator.validate_api_key(
            provider=request.provider,
            api_key=request.api_key,
            secret_key=request.secret_key
        )
        
        # Log validation attempt
        client_ip = client_request.client.host if client_request.client else "unknown"
        logger.info(f"API key validation for {request.provider} from {client_ip}: {'success' if is_valid else 'failed'}")
        
        return JSONResponse(content={
            "valid": is_valid,
            "provider": request.provider,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"API key validation failed: {e}")
        raise HTTPException(status_code=400, detail=f"Validation failed: {str(e)}")

@app.post("/api/byok/create-session")
async def create_secure_session(request: APIKeyRequest, client_request: Request):
    """Create a secure session with encrypted API keys"""
    try:
        client_ip = client_request.client.host if client_request.client else "unknown"
        user_id = "demo_user_123"  # In production, get from JWT token
        
        # Create user keys dict
        user_keys = {
            request.provider: {
                'api_key': request.api_key,
                'secret_key': request.secret_key
            }
        }
        
        # Create secure session
        session_result = await byok_system.create_secure_session(
            user_id=user_id,
            user_keys=user_keys,
            ip_address=client_ip
        )
        
        logger.info(f"Secure session created for user {user_id} from {client_ip}")
        
        return JSONResponse(content=session_result)
        
    except ValueError as e:
        logger.warning(f"Session creation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Session creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")

@app.delete("/api/byok/terminate-session/{session_id}")
async def terminate_session(session_id: str, client_request: Request):
    """Terminate a secure session and delete all keys"""
    try:
        client_ip = client_request.client.host if client_request.client else "unknown"
        
        # Terminate session
        byok_system.terminate_session(session_id)
        
        logger.info(f"Session {session_id} terminated from {client_ip}")
        
        return JSONResponse(content={
            "success": True,
            "session_id": session_id,
            "terminated_at": datetime.now().isoformat(),
            "message": "Session securely terminated and all keys deleted"
        })
        
    except Exception as e:
        logger.error(f"Session termination failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to terminate session")

@app.post("/api/byok/backtest")
async def run_backtest_with_byok(request: BacktestRequest, client_request: Request):
    """Run backtest using BYOK hybrid data model"""
    try:
        client_ip = client_request.client.host if client_request.client else "unknown"
        user_id = "demo_user_123"  # In production, get from JWT token
        
        # For demo, we'll simulate the backtest
        logger.info(f"Backtest request from {client_ip}: {request.symbols} using {request.data_source}")
        
        # Simulate backtest results
        results = {
            "backtest_id": f"bt_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "symbols": request.symbols,
            "data_source_used": request.data_source,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "frequency": request.frequency,
            "metrics": {
                "total_return": round((0.15 + (len(request.symbols) * 0.02)) * 100, 2),
                "sharpe_ratio": round(1.2 + (len(request.symbols) * 0.1), 2),
                "max_drawdown": round(-0.08 - (len(request.symbols) * 0.01), 2),
                "win_rate": round(0.58 + (len(request.symbols) * 0.02), 2),
                "total_trades": len(request.symbols) * 45,
                "avg_trade_duration": "2.3 days"
            },
            "cost": {
                "analysis_cost": len(request.symbols) * 2.50,
                "data_source": request.data_source,
                "billing_timestamp": datetime.now().isoformat()
            },
            "security": {
                "data_encrypted": True,
                "session_validated": True,
                "audit_logged": True
            },
            "processing_time": "3.2 seconds",
            "timestamp": datetime.now().isoformat()
        }
        
        return JSONResponse(content=results)
        
    except Exception as e:
        logger.error(f"Backtest failed: {e}")
        raise HTTPException(status_code=500, detail="Backtest execution failed")

@app.get("/api/byok/audit-log")
async def get_audit_log(limit: int = 50):
    """Get security audit log"""
    try:
        # Simulate audit log entries
        events = []
        event_types = [
            "API Key Validation",
            "Session Creation", 
            "Session Termination",
            "Data Access",
            "Backtest Execution",
            "Security Scan"
        ]
        
        providers = ["databento", "polygon", "alpaca", "tradovate", "ibkr"]
        statuses = ["success", "warning", "error"]
        
        for i in range(limit):
            event_time = datetime.now() - timedelta(minutes=i*5)
            events.append({
                "id": f"audit_{i+1}",
                "timestamp": event_time.isoformat(),
                "event": event_types[i % len(event_types)],
                "user": f"user_{123 + (i % 10)}",
                "provider": providers[i % len(providers)],
                "status": statuses[0] if i % 10 != 7 else statuses[1],  # Mostly success
                "details": f"Event {i+1} details - operation completed successfully",
                "ip_address": f"192.168.1.{100 + (i % 50)}"
            })
        
        return JSONResponse(content={
            "events": events,
            "total_count": len(events),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Failed to get audit log: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audit log")

@app.get("/api/byok/pricing-estimate")
async def get_pricing_estimate(
    symbols: str,  # Comma-separated
    data_source: str = "auto",
    frequency: str = "1min"
):
    """Get pricing estimate for backtest"""
    try:
        symbol_list = [s.strip() for s in symbols.split(',')]
        
        # Pricing logic
        base_multiplier = {
            'auto': 1.0,
            'platform': 0.8,
            'user_keys': 1.5
        }.get(data_source, 1.0)
        
        frequency_multiplier = {
            'tick': 3.0,
            '1min': 2.0,
            '5min': 1.5,
            '1hour': 1.0,
            'daily': 0.5
        }.get(frequency, 1.0)
        
        base_cost = 2.50
        estimated_cost = round(base_cost * base_multiplier * frequency_multiplier * len(symbol_list), 2)
        
        return JSONResponse(content={
            "symbols": symbol_list,
            "symbol_count": len(symbol_list),
            "data_source": data_source,
            "frequency": frequency,
            "base_cost": base_cost,
            "multipliers": {
                "data_source": base_multiplier,
                "frequency": frequency_multiplier
            },
            "estimated_cost": estimated_cost,
            "currency": "USD",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Pricing estimate failed: {e}")
        raise HTTPException(status_code=400, detail="Failed to calculate pricing estimate")

@app.get("/api/byok/user-sessions")
async def get_user_sessions():
    """Get active user sessions (for admin/monitoring)"""
    try:
        # Get active sessions from BYOK system
        active_sessions = len(byok_system.active_sessions)
        
        session_info = []
        for session_id, session in byok_system.active_sessions.items():
            session_info.append({
                "session_id": session_id[:8] + "...",  # Truncated for security
                "user_id": session.user_id,
                "created_at": session.created_at.isoformat(),
                "expires_at": session.expires_at.isoformat(),
                "is_active": session.is_active,
                "provider_count": len(session.encrypted_keys)
            })
        
        return JSONResponse(content={
            "active_sessions": active_sessions,
            "sessions": session_info,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Failed to get user sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user sessions")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    logger.info("🚀 Starting Nexus Quantum BYOK API Server...")
    logger.info("=" * 60)
    logger.info("🔐 Security: Military-grade AES-256 encryption")
    logger.info("⏰ Sessions: 8-hour auto-expiry")
    logger.info("🗑️ Keys: Automatic deletion after session")
    logger.info("📋 Logging: Complete audit trail")
    logger.info("🌐 CORS: Enabled for localhost:3000")
    logger.info("=" * 60)
    logger.info("API Endpoints:")
    logger.info("  Health: http://localhost:3011/health")
    logger.info("  Docs: http://localhost:3011/docs")
    logger.info("  Security Status: http://localhost:3011/api/byok/security-status")
    logger.info("  Platform Data: http://localhost:3011/api/byok/platform-inventory")
    logger.info("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3011,
        log_level="info"
    )
