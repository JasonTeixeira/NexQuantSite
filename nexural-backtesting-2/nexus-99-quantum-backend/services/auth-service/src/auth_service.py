"""
Authentication Service - JWT-based authentication with user management
Integrates with frontend auth requirements and supports paper trading accounts
"""

import asyncio
import logging
import hashlib
import secrets
import sqlite3
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import jwt
from passlib.context import CryptContext
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Authentication Service",
    version="1.0.0",
    description="JWT Authentication with User Management for Nexus Quantum Terminal"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3025"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configuration
SECRET_KEY = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database setup
DB_PATH = Path("auth_users.db")

def init_database():
    """Initialize SQLite database for user management"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT,
            subscription TEXT DEFAULT 'free',
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            api_keys TEXT,  -- JSON string for encrypted API keys
            paper_trading_balance REAL DEFAULT 100000.0,
            settings TEXT  -- JSON string for user settings
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Initialize database on startup
init_database()

# Pydantic models
class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    name: str
    subscription: str = "free"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    subscription: str
    is_active: bool
    paper_trading_balance: float
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Utility functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_user_id() -> str:
    return secrets.token_urlsafe(16)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    token = secrets.token_urlsafe(32)
    
    # Store in database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expire.isoformat())
    )
    conn.commit()
    conn.close()
    
    return token

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError as e:
        logger.error(f"Token verification failed: {e}")
        return None

def get_user_from_db(user_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row[0],
            "email": row[1],
            "password_hash": row[2],
            "name": row[3],
            "subscription": row[4],
            "is_active": bool(row[5]),
            "created_at": row[6],
            "updated_at": row[7],
            "api_keys": row[8],
            "paper_trading_balance": row[9],
            "settings": row[10]
        }
    return None

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row[0],
            "email": row[1],
            "password_hash": row[2],
            "name": row[3],
            "subscription": row[4],
            "is_active": bool(row[5]),
            "created_at": row[6],
            "updated_at": row[7],
            "api_keys": row[8],
            "paper_trading_balance": row[9],
            "settings": row[10]
        }
    return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current user from JWT token"""
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    user = get_user_from_db(user_id)
    if not user or not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    return user

# API Endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "auth-service",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/auth/register", response_model=TokenResponse)
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user_id = generate_user_id()
        password_hash = get_password_hash(user_data.password)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (id, email, password_hash, name, subscription)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, user_data.email, password_hash, user_data.name, user_data.subscription))
        conn.commit()
        conn.close()
        
        # Generate tokens
        access_token = create_access_token(data={"sub": user_id, "email": user_data.email})
        refresh_token = create_refresh_token(user_id)
        
        # Get user data for response
        user = get_user_from_db(user_id)
        user_response = UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            subscription=user["subscription"],
            is_active=user["is_active"],
            paper_trading_balance=user["paper_trading_balance"],
            created_at=user["created_at"]
        )
        
        logger.info(f"User registered successfully: {user_data.email}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
        
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/auth/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin):
    """Authenticate user and return tokens"""
    try:
        # Get user from database
        user = get_user_by_email(login_data.email)
        if not user or not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify password
        if not verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Generate tokens
        access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
        refresh_token = create_refresh_token(user["id"])
        
        user_response = UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            subscription=user["subscription"],
            is_active=user["is_active"],
            paper_trading_balance=user["paper_trading_balance"],
            created_at=user["created_at"]
        )
        
        logger.info(f"User logged in successfully: {login_data.email}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh_access_token(refresh_data: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token exists in database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT user_id, expires_at FROM refresh_tokens 
            WHERE token = ? AND expires_at > datetime('now')
        """, (refresh_data.refresh_token,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        user_id, expires_at = row
        
        # Get user data
        user = get_user_from_db(user_id)
        if not user or not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Generate new tokens
        access_token = create_access_token(data={"sub": user_id, "email": user["email"]})
        new_refresh_token = create_refresh_token(user_id)
        
        # Remove old refresh token
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM refresh_tokens WHERE token = ?", (refresh_data.refresh_token,))
        conn.commit()
        conn.close()
        
        user_response = UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            subscription=user["subscription"],
            is_active=user["is_active"],
            paper_trading_balance=user["paper_trading_balance"],
            created_at=user["created_at"]
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )

@app.get("/auth/user", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        subscription=current_user["subscription"],
        is_active=current_user["is_active"],
        paper_trading_balance=current_user["paper_trading_balance"],
        created_at=current_user["created_at"]
    )

@app.post("/auth/logout")
async def logout_user(refresh_data: RefreshTokenRequest):
    """Logout user by invalidating refresh token"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM refresh_tokens WHERE token = ?", (refresh_data.refresh_token,))
        conn.commit()
        conn.close()
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@app.put("/auth/user/balance")
async def update_paper_trading_balance(
    balance_data: Dict[str, float],
    current_user: dict = Depends(get_current_user)
):
    """Update user's paper trading balance"""
    try:
        new_balance = balance_data.get("balance", current_user["paper_trading_balance"])
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET paper_trading_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_balance, current_user["id"])
        )
        conn.commit()
        conn.close()
        
        return {"message": "Balance updated successfully", "new_balance": new_balance}
        
    except Exception as e:
        logger.error(f"Balance update failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Balance update failed"
        )

if __name__ == "__main__":
    import uvicorn
    
    # Install required packages if not available
    try:
        import jwt, passlib, bcrypt
    except ImportError:
        print("Installing required packages...")
        import subprocess
        subprocess.run(["pip", "install", "PyJWT", "passlib[bcrypt]", "python-jose[cryptography]"])
    
    uvicorn.run(app, host="0.0.0.0", port=3013)
