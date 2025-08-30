"""
Advanced Security Manager for Enterprise-Grade Security
Handles MFA, API keys, audit logging, encryption, and security monitoring
"""

import asyncio
import json
import logging
import secrets
import hashlib
import hmac
import base64
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, asdict
import pyotp
import qrcode
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import jwt
from passlib.context import CryptContext
import sqlite3
import threading

logger = logging.getLogger(__name__)

@dataclass
class SecurityConfig:
    """Security configuration"""
    # JWT settings
    jwt_secret: str = "your-super-secret-jwt-key-change-this"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # MFA settings
    mfa_secret_length: int = 32
    mfa_backup_codes_count: int = 10
    
    # API key settings
    api_key_prefix: str = "nxs"
    api_key_length: int = 32
    api_key_expiration_days: int = 365
    
    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # 1 hour
    
    # Encryption
    encryption_key: str = None  # Will be auto-generated if None
    
    # Database
    db_path: str = "security.db"

@dataclass
class User:
    """User data structure"""
    user_id: str
    email: str
    username: str
    password_hash: str
    mfa_secret: Optional[str] = None
    mfa_enabled: bool = False
    mfa_backup_codes: List[str] = None
    api_keys: List[str] = None
    permissions: List[str] = None
    status: str = "active"  # active, suspended, deleted
    created_at: datetime = None
    last_login: datetime = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None

@dataclass
class APIKey:
    """API key data structure"""
    key_id: str
    user_id: str
    key_hash: str
    name: str
    permissions: List[str]
    created_at: datetime
    expires_at: datetime
    last_used: Optional[datetime] = None
    is_active: bool = True
    revoked_at: Optional[datetime] = None

@dataclass
class AuditLog:
    """Audit log entry"""
    log_id: str
    user_id: Optional[str]
    action: str
    resource: str
    details: Dict
    ip_address: str
    user_agent: str
    timestamp: datetime
    success: bool
    error_message: Optional[str] = None

class AdvancedSecurityManager:
    """
    Enterprise-grade security manager with comprehensive security features
    """
    
    def __init__(self, config: SecurityConfig):
        self.config = config
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Initialize encryption
        self._init_encryption()
        
        # Initialize database
        self._init_database()
        
        # Rate limiting storage
        self.rate_limit_store = {}
        self.rate_limit_lock = threading.Lock()
        
        # Session storage
        self.active_sessions = {}
        self.session_lock = threading.Lock()
        
        logger.info("✅ Advanced security manager initialized successfully")
    
    def _init_encryption(self):
        """Initialize encryption key"""
        if not self.config.encryption_key:
            self.config.encryption_key = Fernet.generate_key().decode()
        
        self.cipher = Fernet(self.config.encryption_key.encode())
        logger.info("✅ Encryption initialized")
    
    def _init_database(self):
        """Initialize security database"""
        try:
            conn = sqlite3.connect(self.config.db_path)
            cursor = conn.cursor()
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    mfa_secret TEXT,
                    mfa_enabled BOOLEAN DEFAULT FALSE,
                    mfa_backup_codes TEXT,
                    api_keys TEXT,
                    permissions TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    failed_login_attempts INTEGER DEFAULT 0,
                    locked_until TIMESTAMP
                )
            """)
            
            # API keys table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS api_keys (
                    key_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    key_hash TEXT NOT NULL,
                    name TEXT NOT NULL,
                    permissions TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    last_used TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    revoked_at TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            """)
            
            # Audit logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    log_id TEXT PRIMARY KEY,
                    user_id TEXT,
                    action TEXT NOT NULL,
                    resource TEXT NOT NULL,
                    details TEXT NOT NULL,
                    ip_address TEXT NOT NULL,
                    user_agent TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    success BOOLEAN NOT NULL,
                    error_message TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            """)
            
            # Rate limiting table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rate_limits (
                    identifier TEXT PRIMARY KEY,
                    requests_count INTEGER DEFAULT 0,
                    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys (user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys (key_hash)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action)")
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Security database initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize security database: {e}")
            raise
    
    def _get_db_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.config.db_path)
    
    def hash_password(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(password, hashed)
    
    def create_user(self, email: str, username: str, password: str, 
                   permissions: List[str] = None) -> User:
        """Create a new user"""
        try:
            user_id = secrets.token_urlsafe(16)
            password_hash = self.hash_password(password)
            
            user = User(
                user_id=user_id,
                email=email,
                username=username,
                password_hash=password_hash,
                permissions=permissions or ["user"],
                created_at=datetime.now()
            )
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO users (user_id, email, username, password_hash, permissions)
                VALUES (?, ?, ?, ?, ?)
            """, (
                user.user_id,
                user.email,
                user.username,
                user.password_hash,
                json.dumps(user.permissions)
            ))
            
            conn.commit()
            conn.close()
            
            # Log user creation
            self.log_audit_event(
                user_id=user.user_id,
                action="user_created",
                resource="user",
                details={"email": email, "username": username},
                ip_address="system",
                user_agent="system",
                success=True
            )
            
            logger.info(f"✅ Created user {username}")
            return user
            
        except Exception as e:
            logger.error(f"❌ Failed to create user: {e}")
            raise
    
    def authenticate_user(self, email: str, password: str, 
                         ip_address: str, user_agent: str) -> Optional[User]:
        """Authenticate a user"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT * FROM users WHERE email = ?
            """, (email,))
            
            row = cursor.fetchone()
            conn.close()
            
            if not row:
                self.log_audit_event(
                    user_id=None,
                    action="login_failed",
                    resource="user",
                    details={"email": email, "reason": "user_not_found"},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False
                )
                return None
            
            user = self._row_to_user(row)
            
            # Check if account is locked
            if user.locked_until and user.locked_until > datetime.now():
                self.log_audit_event(
                    user_id=user.user_id,
                    action="login_failed",
                    resource="user",
                    details={"email": email, "reason": "account_locked"},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False
                )
                return None
            
            # Verify password
            if not self.verify_password(password, user.password_hash):
                # Increment failed login attempts
                self._increment_failed_logins(user.user_id)
                
                self.log_audit_event(
                    user_id=user.user_id,
                    action="login_failed",
                    resource="user",
                    details={"email": email, "reason": "invalid_password"},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False
                )
                return None
            
            # Reset failed login attempts on successful login
            self._reset_failed_logins(user.user_id)
            
            # Update last login
            self._update_last_login(user.user_id)
            
            self.log_audit_event(
                user_id=user.user_id,
                action="login_success",
                resource="user",
                details={"email": email},
                ip_address=ip_address,
                user_agent=user_agent,
                success=True
            )
            
            logger.info(f"✅ User {email} authenticated successfully")
            return user
            
        except Exception as e:
            logger.error(f"❌ Authentication failed: {e}")
            return None
    
    def _increment_failed_logins(self, user_id: str):
        """Increment failed login attempts"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE users 
                SET failed_login_attempts = failed_login_attempts + 1,
                    locked_until = CASE 
                        WHEN failed_login_attempts >= 5 THEN datetime('now', '+30 minutes')
                        ELSE locked_until 
                    END
                WHERE user_id = ?
            """, (user_id,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to increment failed logins: {e}")
    
    def _reset_failed_logins(self, user_id: str):
        """Reset failed login attempts"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE users 
                SET failed_login_attempts = 0, locked_until = NULL
                WHERE user_id = ?
            """, (user_id,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to reset failed logins: {e}")
    
    def _update_last_login(self, user_id: str):
        """Update last login timestamp"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE users 
                SET last_login = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (user_id,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to update last login: {e}")
    
    def _row_to_user(self, row) -> User:
        """Convert database row to User object"""
        return User(
            user_id=row[0],
            email=row[1],
            username=row[2],
            password_hash=row[3],
            mfa_secret=row[4],
            mfa_enabled=bool(row[5]),
            mfa_backup_codes=json.loads(row[6]) if row[6] else [],
            api_keys=json.loads(row[7]) if row[7] else [],
            permissions=json.loads(row[8]) if row[8] else [],
            status=row[9],
            created_at=datetime.fromisoformat(row[10]) if row[10] else None,
            last_login=datetime.fromisoformat(row[11]) if row[11] else None,
            failed_login_attempts=row[12] or 0,
            locked_until=datetime.fromisoformat(row[13]) if row[13] else None
        )
    
    def generate_mfa_secret(self, user_id: str) -> str:
        """Generate MFA secret for a user"""
        try:
            secret = pyotp.random_base32(length=self.config.mfa_secret_length)
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE users 
                SET mfa_secret = ?
                WHERE user_id = ?
            """, (secret, user_id))
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Generated MFA secret for user {user_id}")
            return secret
            
        except Exception as e:
            logger.error(f"❌ Failed to generate MFA secret: {e}")
            raise
    
    def generate_mfa_qr_code(self, secret: str, user_email: str) -> str:
        """Generate QR code for MFA setup"""
        try:
            totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
                name=user_email,
                issuer_name="NEXUS AI"
            )
            
            # Generate QR code
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(totp_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            # Ensure directory exists for tests/Windows
            import os
            os.makedirs("qr_codes", exist_ok=True)
            qr_path = f"qr_codes/{user_email}_mfa.png"
            img.save(qr_path)
            
            return totp_uri
            
        except Exception as e:
            logger.error(f"❌ Failed to generate QR code: {e}")
            raise
    
    def verify_mfa_token(self, user_id: str, token: str) -> bool:
        """Verify MFA token"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT mfa_secret FROM users WHERE user_id = ?
            """, (user_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if not row or not row[0]:
                return False
            
            secret = row[0]
            totp = pyotp.TOTP(secret)
            return totp.verify(token, valid_window=2)
            
        except Exception as e:
            logger.error(f"❌ Failed to verify MFA token: {e}")
            return False
    
    def generate_backup_codes(self, user_id: str) -> List[str]:
        """Generate backup codes for MFA"""
        try:
            backup_codes = [secrets.token_urlsafe(8) for _ in range(self.config.mfa_backup_codes_count)]
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE users 
                SET mfa_backup_codes = ?
                WHERE user_id = ?
            """, (json.dumps(backup_codes), user_id))
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Generated backup codes for user {user_id}")
            return backup_codes
            
        except Exception as e:
            logger.error(f"❌ Failed to generate backup codes: {e}")
            raise
    
    def generate_api_key(self, user_id: str, name: str, 
                        permissions: List[str]) -> str:
        """Generate API key for a user"""
        try:
            key_id = secrets.token_urlsafe(16)
            key = f"{self.config.api_key_prefix}_{secrets.token_urlsafe(self.config.api_key_length)}"
            key_hash = hashlib.sha256(key.encode()).hexdigest()
            
            expires_at = datetime.now() + timedelta(days=self.config.api_key_expiration_days)
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO api_keys (key_id, user_id, key_hash, name, permissions, expires_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                key_id,
                user_id,
                key_hash,
                name,
                json.dumps(permissions),
                expires_at.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            # Log API key creation
            self.log_audit_event(
                user_id=user_id,
                action="api_key_created",
                resource="api_key",
                details={"key_id": key_id, "name": name},
                ip_address="system",
                user_agent="system",
                success=True
            )
            
            logger.info(f"✅ Generated API key for user {user_id}")
            return key
            
        except Exception as e:
            logger.error(f"❌ Failed to generate API key: {e}")
            raise
    
    def validate_api_key(self, api_key: str) -> Optional[Dict]:
        """Validate API key and return user info"""
        try:
            key_hash = hashlib.sha256(api_key.encode()).hexdigest()
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    ak.key_id,
                    ak.user_id,
                    ak.key_hash,
                    ak.name,
                    ak.permissions AS api_permissions,
                    ak.created_at,
                    ak.expires_at,
                    ak.last_used,
                    ak.is_active,
                    ak.revoked_at,
                    u.user_id AS u_user_id,
                    u.email,
                    u.username,
                    u.permissions AS user_permissions
                FROM api_keys ak
                JOIN users u ON ak.user_id = u.user_id
                WHERE ak.key_hash = ? AND ak.is_active = TRUE
            """, (key_hash,))
            
            row = cursor.fetchone()
            
            if row:
                # Update last used
                cursor.execute("""
                    UPDATE api_keys 
                    SET last_used = CURRENT_TIMESTAMP
                    WHERE key_hash = ?
                """, (key_hash,))
                
                conn.commit()
                conn.close()
                
                return {
                    'user_id': row[10],
                    'email': row[11],
                    'username': row[12],
                    'permissions': json.loads(row[13]) if row[13] else [],
                    'api_key_permissions': json.loads(row[4]) if row[4] else []
                }
            
            conn.close()
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to validate API key: {e}")
            return None
    
    def revoke_api_key(self, key_id: str, user_id: str) -> bool:
        """Revoke an API key"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE api_keys 
                SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP
                WHERE key_id = ? AND user_id = ?
            """, (key_id, user_id))
            
            success = cursor.rowcount > 0
            conn.commit()
            conn.close()
            
            if success:
                self.log_audit_event(
                    user_id=user_id,
                    action="api_key_revoked",
                    resource="api_key",
                    details={"key_id": key_id},
                    ip_address="system",
                    user_agent="system",
                    success=True
                )
                logger.info(f"✅ Revoked API key {key_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to revoke API key: {e}")
            return False
    
    def check_rate_limit(self, identifier: str, ip_address: str, 
                        user_agent: str) -> bool:
        """Check rate limiting"""
        try:
            current_time = datetime.now()
            window_start = current_time - timedelta(seconds=self.config.rate_limit_window)
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT requests_count, window_start 
                FROM rate_limits 
                WHERE identifier = ?
            """, (identifier,))
            
            row = cursor.fetchone()
            
            if row:
                requests_count, stored_window_start = row
                stored_window_start = datetime.fromisoformat(stored_window_start)
                
                if stored_window_start < window_start:
                    # Reset window
                    cursor.execute("""
                        UPDATE rate_limits 
                        SET requests_count = 1, window_start = ?, last_request = ?
                        WHERE identifier = ?
                    """, (current_time.isoformat(), current_time.isoformat(), identifier))
                else:
                    # Increment count
                    cursor.execute("""
                        UPDATE rate_limits 
                        SET requests_count = requests_count + 1, last_request = ?
                        WHERE identifier = ?
                    """, (current_time.isoformat(), identifier))
            else:
                # Create new entry
                cursor.execute("""
                    INSERT INTO rate_limits (identifier, requests_count, window_start, last_request)
                    VALUES (?, 1, ?, ?)
                """, (identifier, current_time.isoformat(), current_time.isoformat()))
            
            conn.commit()
            conn.close()
            
            # Check if limit exceeded
            if row and row[0] >= self.config.rate_limit_requests:
                self.log_audit_event(
                    user_id=None,
                    action="rate_limit_exceeded",
                    resource="api",
                    details={"identifier": identifier},
                    ip_address=ip_address,
                    user_agent=user_agent,
                    success=False
                )
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Rate limit check failed: {e}")
            return True  # Allow on error
    
    def log_audit_event(self, user_id: Optional[str], action: str, resource: str,
                       details: Dict, ip_address: str, user_agent: str, 
                       success: bool, error_message: str = None):
        """Log audit event"""
        try:
            log_id = secrets.token_urlsafe(16)
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO audit_logs (log_id, user_id, action, resource, details, 
                                      ip_address, user_agent, success, error_message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                log_id,
                user_id,
                action,
                resource,
                json.dumps(details),
                ip_address,
                user_agent,
                success,
                error_message
            ))
            
            conn.commit()
            conn.close()
            
            logger.debug(f"✅ Logged audit event: {action} - {resource}")
            
        except Exception as e:
            logger.error(f"❌ Failed to log audit event: {e}")
    
    def get_audit_logs(self, user_id: str = None, action: str = None,
                      start_date: datetime = None, end_date: datetime = None,
                      limit: int = 100) -> List[AuditLog]:
        """Get audit logs with filters"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            query = "SELECT * FROM audit_logs WHERE 1=1"
            params = []
            
            if user_id:
                query += " AND user_id = ?"
                params.append(user_id)
            
            if action:
                query += " AND action = ?"
                params.append(action)
            
            if start_date:
                query += " AND timestamp >= ?"
                params.append(start_date.isoformat())
            
            if end_date:
                query += " AND timestamp <= ?"
                params.append(end_date.isoformat())
            
            query += " ORDER BY timestamp DESC LIMIT ?"
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            conn.close()
            
            logs = []
            for row in rows:
                logs.append(AuditLog(
                    log_id=row[0],
                    user_id=row[1],
                    action=row[2],
                    resource=row[3],
                    details=json.loads(row[4]) if row[4] else {},
                    ip_address=row[5],
                    user_agent=row[6],
                    timestamp=datetime.fromisoformat(row[7]),
                    success=bool(row[8]),
                    error_message=row[9]
                ))
            
            return logs
            
        except Exception as e:
            logger.error(f"❌ Failed to get audit logs: {e}")
            return []
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        try:
            return self.cipher.encrypt(data.encode()).decode()
        except Exception as e:
            logger.error(f"❌ Encryption failed: {e}")
            raise
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        try:
            return self.cipher.decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            logger.error(f"❌ Decryption failed: {e}")
            raise
    
    def generate_jwt_token(self, user: User) -> str:
        """Generate JWT token for user"""
        try:
            payload = {
                'user_id': user.user_id,
                'email': user.email,
                'username': user.username,
                'permissions': user.permissions,
                'exp': datetime.utcnow() + timedelta(hours=self.config.jwt_expiration_hours),
                'iat': datetime.utcnow()
            }
            
            token = jwt.encode(payload, self.config.jwt_secret, algorithm=self.config.jwt_algorithm)
            return token
            
        except Exception as e:
            logger.error(f"❌ Failed to generate JWT token: {e}")
            raise
    
    def verify_jwt_token(self, token: str) -> Optional[Dict]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.config.jwt_secret, algorithms=[self.config.jwt_algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid JWT token: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ JWT verification failed: {e}")
            return None
    
    def get_security_stats(self) -> Dict[str, Any]:
        """Get security statistics"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # User statistics
            cursor.execute("SELECT COUNT(*) FROM users")
            total_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE mfa_enabled = TRUE")
            mfa_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE status = 'active'")
            active_users = cursor.fetchone()[0]
            
            # API key statistics
            cursor.execute("SELECT COUNT(*) FROM api_keys WHERE is_active = TRUE")
            active_api_keys = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM api_keys WHERE is_active = FALSE")
            revoked_api_keys = cursor.fetchone()[0]
            
            # Audit log statistics
            cursor.execute("SELECT COUNT(*) FROM audit_logs WHERE success = TRUE")
            successful_events = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM audit_logs WHERE success = FALSE")
            failed_events = cursor.fetchone()[0]
            
            # Recent activity
            cursor.execute("""
                SELECT COUNT(*) FROM audit_logs 
                WHERE timestamp >= datetime('now', '-24 hours')
            """)
            events_24h = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                'users': {
                    'total': total_users,
                    'active': active_users,
                    'mfa_enabled': mfa_users,
                    'mfa_rate': mfa_users / total_users if total_users > 0 else 0
                },
                'api_keys': {
                    'active': active_api_keys,
                    'revoked': revoked_api_keys
                },
                'audit_logs': {
                    'successful_events': successful_events,
                    'failed_events': failed_events,
                    'events_24h': events_24h,
                    'success_rate': successful_events / (successful_events + failed_events) if (successful_events + failed_events) > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get security stats: {e}")
            return {}

# Global security manager instance
_security_manager = None

def get_security_manager(config: SecurityConfig = None) -> AdvancedSecurityManager:
    """Get or create security manager instance"""
    global _security_manager
    
    if _security_manager is None:
        if config is None:
            config = SecurityConfig()
        _security_manager = AdvancedSecurityManager(config)
    
    return _security_manager
