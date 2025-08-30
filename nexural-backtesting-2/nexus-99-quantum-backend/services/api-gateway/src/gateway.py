"""
API Gateway Service - Production Implementation
Routes requests to appropriate backend services
"""

import asyncio
import logging
import httpx
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Nexural API Gateway",
    version="1.0.0",
    description="API Gateway for Nexural Backtesting Platform"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Service discovery - in production, use proper service discovery
SERVICES = {
    "hpo": os.getenv("HPO_SERVICE_URL", "http://localhost:3011"),
    "data": os.getenv("DATA_SERVICE_URL", "http://localhost:3012"),
    "auth": os.getenv("AUTH_SERVICE_URL", "http://localhost:3013"),
    "portfolio": os.getenv("PORTFOLIO_SERVICE_URL", "http://localhost:3014"),
    "ai": os.getenv("AI_SERVICE_URL", "http://localhost:3015"),
    "websocket": os.getenv("WEBSOCKET_SERVICE_URL", "http://localhost:3016"),
}

# HTTP client for service communication
client = httpx.AsyncClient(timeout=30.0)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Simple token verification - replace with real auth in production
    """
    if not credentials:
        return None
    
    # Simple validation - in production, verify JWT or API key
    if credentials.credentials.startswith("test_"):
        return {"user_id": "test_user", "permissions": ["read", "write"]}
    
    return None

@app.get("/health")
async def health_check():
    """Gateway health check"""
    return {
        "status": "healthy",
        "service": "api-gateway",
        "timestamp": datetime.utcnow().isoformat(),
        "services": SERVICES
    }

@app.get("/services/status")
async def check_services_status():
    """Check status of all backend services"""
    status = {}
    
    for service_name, service_url in SERVICES.items():
        try:
            response = await client.get(f"{service_url}/health", timeout=5.0)
            status[service_name] = {
                "url": service_url,
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "response_time": response.elapsed.total_seconds(),
                "status_code": response.status_code
            }
        except Exception as e:
            status[service_name] = {
                "url": service_url,
                "status": "error",
                "error": str(e)
            }
    
    return status

@app.post("/hpo/optimize")
async def optimize_strategy(request: Dict[str, Any], user = Depends(verify_token)):
    """Route HPO optimization requests"""
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        response = await client.post(
            f"{SERVICES['hpo']}/optimize",
            json=request
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        return response.json()
    
    except httpx.RequestError as e:
        logger.error(f"HPO service request failed: {e}")
        raise HTTPException(status_code=503, detail="HPO service unavailable")

@app.get("/hpo/results/{study_id}")
async def get_optimization_result(study_id: str, user = Depends(verify_token)):
    """Get HPO optimization results"""
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        response = await client.get(f"{SERVICES['hpo']}/results/{study_id}")
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        return response.json()
    
    except httpx.RequestError as e:
        logger.error(f"HPO service request failed: {e}")
        raise HTTPException(status_code=503, detail="HPO service unavailable")

@app.post("/data/ingest")
async def ingest_market_data(request: Dict[str, Any], user = Depends(verify_token)):
    """Route market data ingestion requests"""
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Route to data service when implemented
        raise HTTPException(status_code=501, detail="Data service not yet implemented")
    
    except Exception as e:
        logger.error(f"Data service request failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Authentication routes
@app.post("/auth/register")
async def register_user(request: Dict[str, Any]):
    """Route user registration"""
    try:
        response = await client.post(f"{SERVICES['auth']}/auth/register", json=request)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except httpx.RequestError as e:
        logger.error(f"Auth service request failed: {e}")
        raise HTTPException(status_code=503, detail="Auth service unavailable")

@app.post("/auth/login")
async def login_user(request: Dict[str, Any]):
    """Route user login"""
    try:
        response = await client.post(f"{SERVICES['auth']}/auth/login", json=request)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except httpx.RequestError as e:
        logger.error(f"Auth service request failed: {e}")
        raise HTTPException(status_code=503, detail="Auth service unavailable")

@app.get("/auth/user")
async def get_user(user = Depends(verify_token)):
    """Get current user info"""
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        response = await client.get(f"{SERVICES['auth']}/auth/user", 
                                  headers={"Authorization": f"Bearer {user.get('token', '')}"})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except httpx.RequestError as e:
        logger.error(f"Auth service request failed: {e}")
        raise HTTPException(status_code=503, detail="Auth service unavailable")

# Portfolio routes
@app.get("/portfolio")
async def get_portfolio(user = Depends(verify_token)):
    """Get user portfolio"""
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        response = await client.get(f"{SERVICES['portfolio']}/portfolio",
                                  headers={"Authorization": f"Bearer {user.get('token', '')}"})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except httpx.RequestError as e:
        logger.error(f"Portfolio service request failed: {e}")
        raise HTTPException(status_code=503, detail="Portfolio service unavailable")

@app.post("/orders")
async def place_order(request: Dict[str, Any], user = Depends(verify_token)):
    """Place trading order"""
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        response = await client.post(f"{SERVICES['portfolio']}/orders", json=request,
                                   headers={"Authorization": f"Bearer {user.get('token', '')}"})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except httpx.RequestError as e:
        logger.error(f"Portfolio service request failed: {e}")
        raise HTTPException(status_code=503, detail="Portfolio service unavailable")

# AI routes
@app.post("/ai/analyze")
async def ai_analyze(request: Dict[str, Any], user = Depends(verify_token)):
    """Route AI analysis requests"""
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        response = await client.post(f"{SERVICES['ai']}/ai/analyze", json=request,
                                   headers={"Authorization": f"Bearer {user.get('token', '')}"})
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except httpx.RequestError as e:
        logger.error(f"AI service request failed: {e}")
        raise HTTPException(status_code=503, detail="AI service unavailable")

# Market data routes
@app.post("/data/fetch")
async def fetch_market_data(request: Dict[str, Any]):
    """Route market data requests"""
    try:
        response = await client.post(f"{SERVICES['data']}/data/fetch", json=request)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()
    except httpx.RequestError as e:
        logger.error(f"Data service request failed: {e}")
        raise HTTPException(status_code=503, detail="Data service unavailable")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests for monitoring"""
    start_time = datetime.utcnow()
    
    response = await call_next(request)
    
    process_time = (datetime.utcnow() - start_time).total_seconds()
    
    logger.info(
        f"Request: {request.method} {request.url.path} "
        f"Status: {response.status_code} "
        f"Time: {process_time:.3f}s"
    )
    
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3010)


