// 🏥 HEALTH CHECK API - Simple endpoint for connectivity testing
// Used by PWA service worker to test network connectivity

import { NextRequest, NextResponse } from 'next/server'

// GET - Simple health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
}

// HEAD - Lightweight connectivity test (used by service worker)
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

