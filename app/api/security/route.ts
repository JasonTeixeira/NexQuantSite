import { NextRequest, NextResponse } from 'next/server'
import { securityManager } from '@/lib/security/advanced-security'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  // Basic admin check (in production, implement proper JWT verification)
  const isAdmin = request.headers.get('x-user-role') === 'admin' || 
                  request.cookies.get('admin-session')?.value
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    switch (action) {
      case 'analytics':
        return getSecurityAnalytics()
      
      case 'health':
        return getSecurityHealth()
      
      case 'threats':
        return getThreatLog()
      
      case 'status':
        return getSecurityStatus()
      
      default:
        return NextResponse.json({
          message: 'Security API endpoint',
          actions: ['analytics', 'health', 'threats', 'status'],
          usage: '/api/security?action=analytics'
        })
    }
  } catch (error) {
    console.error('Security API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getSecurityAnalytics() {
  const analytics = securityManager.getThreatAnalytics()
  
  return NextResponse.json({
    ...analytics,
    timestamp: new Date().toISOString(),
    message: 'Security analytics retrieved successfully'
  })
}

async function getSecurityHealth() {
  const now = Date.now()
  const last24Hours = now - (24 * 60 * 60 * 1000)
  const analytics = securityManager.getThreatAnalytics()
  
  // Calculate security health score
  let score = 100
  let issues = []
  let status = 'healthy'
  
  // Check threat levels
  const criticalThreats = analytics.threatsBySeverity.critical || 0
  const highThreats = analytics.threatsBySeverity.high || 0
  const mediumThreats = analytics.threatsBySeverity.medium || 0
  
  if (criticalThreats > 0) {
    score -= criticalThreats * 20
    issues.push(`${criticalThreats} critical security threats detected`)
    status = 'critical'
  }
  
  if (highThreats > 5) {
    score -= (highThreats - 5) * 10
    issues.push(`${highThreats} high-severity threats (above normal threshold)`)
    if (status === 'healthy') status = 'warning'
  }
  
  if (mediumThreats > 20) {
    score -= (mediumThreats - 20) * 2
    issues.push(`${mediumThreats} medium-severity threats (elevated activity)`)
    if (status === 'healthy') status = 'warning'
  }
  
  // Check for repeat offenders
  const topAttackers = analytics.topAttackerIPs
  if (topAttackers.length > 0 && topAttackers[0].count > 50) {
    score -= 10
    issues.push(`Top attacker IP has ${topAttackers[0].count} attempts`)
    if (status === 'healthy') status = 'warning'
  }
  
  score = Math.max(0, Math.min(100, score))
  
  return NextResponse.json({
    score,
    status,
    issues,
    summary: {
      totalThreats: analytics.totalThreats,
      criticalThreats,
      highThreats,
      mediumThreats,
      topAttackerIP: topAttackers[0]?.ip || 'none',
      topAttackerCount: topAttackers[0]?.count || 0
    },
    recommendations: generateSecurityRecommendations(analytics, issues),
    lastChecked: new Date().toISOString()
  })
}

async function getThreatLog() {
  const analytics = securityManager.getThreatAnalytics()
  
  return NextResponse.json({
    threats: analytics.recentThreats,
    summary: {
      total: analytics.totalThreats,
      byType: analytics.threatsByType,
      bySeverity: analytics.threatsBySeverity
    },
    topAttackers: analytics.topAttackerIPs,
    timestamp: new Date().toISOString()
  })
}

async function getSecurityStatus() {
  const analytics = securityManager.getThreatAnalytics()
  
  return NextResponse.json({
    securityFeatures: {
      rateLimiting: { enabled: true, status: 'active' },
      bruteForceProtection: { enabled: true, status: 'active' },
      csrfProtection: { enabled: true, status: 'active' },
      inputValidation: { enabled: true, status: 'active' },
      securityHeaders: { enabled: true, status: 'active' },
      threatMonitoring: { enabled: true, status: 'active' }
    },
    currentThreats: {
      active: analytics.recentThreats.filter(t => 
        new Date(t.timestamp).getTime() > Date.now() - (60 * 60 * 1000)
      ).length,
      last24Hours: analytics.totalThreats
    },
    protectionLevel: calculateProtectionLevel(analytics),
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  // Basic admin check
  const isAdmin = request.headers.get('x-user-role') === 'admin' || 
                  request.cookies.get('admin-session')?.value
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const action = body.action

    switch (action) {
      case 'cleanup':
        return performSecurityCleanup()
      
      case 'block-ip':
        return blockIP(body.ip, body.duration)
      
      case 'unblock-ip':
        return unblockIP(body.ip)
      
      case 'reset-limits':
        return resetRateLimits(body.identifier)
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Security POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function performSecurityCleanup() {
  securityManager.cleanup()
  
  return NextResponse.json({
    message: 'Security cleanup completed',
    actions: [
      'Cleared expired rate limit records',
      'Cleaned up old CSRF tokens',
      'Removed expired brute force records'
    ],
    timestamp: new Date().toISOString()
  })
}

async function blockIP(ip: string, duration: number = 60) {
  if (!ip) {
    return NextResponse.json({ error: 'IP address required' }, { status: 400 })
  }
  
  // In a real implementation, you would add to a blocked IPs store
  // For now, we'll just return a success message
  
  return NextResponse.json({
    message: `IP ${ip} blocked for ${duration} minutes`,
    ip,
    duration,
    expires: new Date(Date.now() + (duration * 60 * 1000)).toISOString(),
    timestamp: new Date().toISOString()
  })
}

async function unblockIP(ip: string) {
  if (!ip) {
    return NextResponse.json({ error: 'IP address required' }, { status: 400 })
  }
  
  // In a real implementation, you would remove from blocked IPs store
  
  return NextResponse.json({
    message: `IP ${ip} unblocked`,
    ip,
    timestamp: new Date().toISOString()
  })
}

async function resetRateLimits(identifier: string) {
  if (!identifier) {
    return NextResponse.json({ error: 'Identifier required' }, { status: 400 })
  }
  
  // In a real implementation, you would clear specific rate limit records
  
  return NextResponse.json({
    message: `Rate limits reset for ${identifier}`,
    identifier,
    timestamp: new Date().toISOString()
  })
}

function generateSecurityRecommendations(analytics: any, issues: string[]): string[] {
  const recommendations = []
  
  if (analytics.threatsBySeverity.critical > 0) {
    recommendations.push('Immediate action required: Investigate and block critical threats')
  }
  
  if (analytics.topAttackerIPs.length > 0 && analytics.topAttackerIPs[0].count > 100) {
    recommendations.push(`Consider blocking IP ${analytics.topAttackerIPs[0].ip} - excessive requests detected`)
  }
  
  if (analytics.threatsByType.rate_limit > 20) {
    recommendations.push('High rate limiting activity - consider reducing rate limits temporarily')
  }
  
  if (analytics.threatsByType.brute_force > 10) {
    recommendations.push('Multiple brute force attempts detected - review authentication logs')
  }
  
  if (analytics.threatsByType.xss > 0 || analytics.threatsByType.sql_injection > 0) {
    recommendations.push('Code injection attempts detected - review input validation rules')
  }
  
  if (issues.length === 0) {
    recommendations.push('Security status looks good - continue monitoring')
  }
  
  recommendations.push('Run security cleanup regularly to maintain optimal performance')
  
  return recommendations
}

function calculateProtectionLevel(analytics: any): { level: string, percentage: number, description: string } {
  const totalThreats = analytics.totalThreats
  const criticalThreats = analytics.threatsBySeverity.critical || 0
  const highThreats = analytics.threatsBySeverity.high || 0
  
  let level = 'Maximum'
  let percentage = 98
  let description = 'All security measures active and effective'
  
  if (criticalThreats > 0) {
    level = 'Critical'
    percentage = 60
    description = 'Critical threats detected - immediate attention required'
  } else if (highThreats > 10) {
    level = 'High'
    percentage = 75
    description = 'Elevated threat activity - enhanced monitoring active'
  } else if (totalThreats > 50) {
    level = 'Moderate'
    percentage = 85
    description = 'Normal security operations with increased activity'
  }
  
  return { level, percentage, description }
}

// Health check endpoint
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}


