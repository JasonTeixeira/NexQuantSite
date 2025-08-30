// 📊 ADMIN ANALYTICS API
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth/verify'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Admin access required' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7days'
    
    // Generate mock analytics data
    const analytics = {
      overview: {
        revenue: {
          current: 45234.56,
          previous: 38921.23,
          change: 16.2
        },
        users: {
          current: 15234,
          previous: 13421,
          change: 13.5
        },
        orders: {
          current: 892,
          previous: 756,
          change: 18.0
        },
        conversion: {
          current: 3.4,
          previous: 2.9,
          change: 17.2
        }
      },
      charts: {
        revenue: generateChartData(30, 1000, 5000),
        users: generateChartData(30, 100, 500),
        traffic: generateChartData(30, 5000, 20000),
        conversions: generateChartData(30, 2, 5)
      },
      topProducts: [
        { name: 'Premium Trading Bot', sales: 234, revenue: 70166 },
        { name: 'Professional Plan', sales: 189, revenue: 18889 },
        { name: 'Strategy Pack', sales: 145, revenue: 21755 },
        { name: 'Master Course', sales: 98, revenue: 19599 }
      ],
      traffic: {
        sources: [
          { name: 'Organic', visits: 45234, percentage: 35 },
          { name: 'Direct', visits: 32145, percentage: 25 },
          { name: 'Social', visits: 25678, percentage: 20 },
          { name: 'Referral', visits: 19234, percentage: 15 },
          { name: 'Paid', visits: 6432, percentage: 5 }
        ],
        devices: {
          desktop: 55,
          mobile: 35,
          tablet: 10
        },
        countries: [
          { code: 'US', name: 'United States', users: 5234 },
          { code: 'GB', name: 'United Kingdom', users: 2345 },
          { code: 'CA', name: 'Canada', users: 1876 },
          { code: 'AU', name: 'Australia', users: 1234 }
        ]
      },
      performance: {
        serverUptime: 99.98,
        avgResponseTime: 125,
        errorRate: 0.02,
        cacheHitRate: 89.5
      }
    }
    
    return NextResponse.json({
      success: true,
      period,
      analytics,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// Generate mock chart data
function generateChartData(points: number, min: number, max: number): any[] {
  const data = []
  const now = new Date()
  
  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * (max - min + 1)) + min
    })
  }
  
  return data
}

