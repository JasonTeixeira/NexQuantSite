import { NextRequest, NextResponse } from 'next/server'
import { sreMonitor } from '@/lib/sre/monitoring-dashboard'

export async function GET(request: NextRequest) {
  try {
    const dashboardData = sreMonitor.getDashboardData()
    
    return NextResponse.json(dashboardData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Monitoring-Dashboard': 'true'
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: Date.now()
    }, {
      status: 500
    })
  }
}
