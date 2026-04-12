"""
🛡️ ELITE SECURITY CONFIGURATION
World-class security settings for Nexural Trading Platform
"""

import os
from typing import Any


class SecurityConfig:
    """Enterprise-grade security configuration"""

    @staticmethod
    def get_cors_config() -> dict[str, Any]:
        """Get secure CORS configuration based on environment"""

        # Production domains (replace with your actual domains)
        production_origins = [
            "https://nexuraltrading.com",
            "https://app.nexuraltrading.com",
            "https://admin.nexuraltrading.com",
            "https://api.nexuraltrading.com",
        ]

        # Development origins
        development_origins = [
            "http://localhost:3000",  # Next.js frontend
            "http://localhost:3001",  # Website backend
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ]

        # Get environment
        environment = os.getenv("ENVIRONMENT", "development").lower()

        if environment == "production":
            allowed_origins = production_origins
        else:
            allowed_origins = development_origins + production_origins

        return {
            "allow_origins": allowed_origins,
            "allow_credentials": True,
            "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": [
                "Authorization",
                "Content-Type",
                "X-API-Key",
                "X-Requested-With",
                "Accept",
                "Origin",
                "X-CSRF-Token",
            ],
            "expose_headers": ["X-Total-Count", "X-Rate-Limit-Remaining"],
            "max_age": 86400,  # 24 hours
        }
