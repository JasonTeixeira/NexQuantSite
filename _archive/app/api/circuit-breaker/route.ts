import { NextRequest, NextResponse } from 'next/server'
import { getCircuitBreakerStatus } from '@/lib/sre/circuit-breaker'

export async function GET(request: NextRequest) {
  try {
    const status = getCircuitBreakerStatus()
    
    return NextResponse.json(status, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, {
      status: 500
    })
  }
}
