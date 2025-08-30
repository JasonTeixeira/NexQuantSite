#!/usr/bin/env python3
"""
Test Integration API - Simple Version
====================================
"""

import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Load API keys
claude_key = os.getenv('CLAUDE_API_KEY')
openai_key = os.getenv('OPENAI_API_KEY')
databento_key = os.getenv('DATABENTO_API_KEY')

print("🚀 TESTING INTEGRATION API")
print("=" * 40)
print(f"Claude API: {'✅' if claude_key else '❌'}")
print(f"OpenAI API: {'✅' if openai_key else '❌'}")
print(f"Databento API: {'✅' if databento_key else '❌'}")
print("=" * 40)

# Simple FastAPI app
app = FastAPI(title="Test Integration API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Test Integration API",
        "status": "working",
        "apis": {
            "claude": claude_key is not None,
            "openai": openai_key is not None,
            "databento": databento_key is not None
        }
    }

@app.get("/test")
async def test():
    return {"test": "API is working!"}

if __name__ == "__main__":
    print("🚀 Starting test API on port 3011...")
    uvicorn.run(app, host="0.0.0.0", port=3011)
