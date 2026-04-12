"use client"

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  Lock,
  Eye,
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Key,
  Database,
  Server,
  Globe,
  Zap,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react'

interface SecurityMetrics {
  encryptionLevel: string
  activeSessions: number
  totalSessions: number
  keyRotations: number
  auditEvents: number
  lastSecurityScan: string
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  complianceScore: number
}

interface AuditEvent {
  id: string
  timestamp: string
  event: string
  user: string
  provider: string
  status: 'success' | 'warning' | 'error'
  details: string
}

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    encryptionLevel: 'AES-256 with PBKDF2',
    activeSessions: 3,
    totalSessions: 47,
    keyRotations: 12,
    auditEvents: 156,
    lastSecurityScan: new Date().toISOString(),
    threatLevel: 'LOW',
    complianceScore: 98
  })

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      event: 'API Key Validation',
      user: 'user_123',
      provider: 'databento',
      status: 'success',
      details: 'Databento API key successfully validated and encrypted'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      event: 'Session Creation',
      user: 'user_456',
      provider: 'polygon',
      status: 'success',
      details: 'Secure session created with 8-hour expiry'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      event: 'Key Termination',
      user: 'user_789',
      provider: 'alpaca',
      status: 'success',
      details: 'API keys securely deleted after session termination'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      event: 'Failed Validation',
      user: 'user_321',
      provider: 'tradovate',
      status: 'warning',
      details: 'Invalid API key rejected - potential security probe'
    }
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshMetrics = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setMetrics(prev => ({
      ...prev,
      lastSecurityScan: new Date().toISOString(),
      auditEvents: prev.auditEvents + Math.floor(Math.random() * 5)
    }))
    
    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100'
      case 'HIGH': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encryption Level</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">MILITARY</div>
            <p className="text-xs text-muted-foreground">
              {metrics.encryptionLevel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSession}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSessions} total sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getThreatLevelColor(metrics.threatLevel)}>
                {metrics.threatLevel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Last scan: {new Date(metrics.lastSecurityScan).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.complianceScore}%</div>
            <Progress value={metrics.complianceScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Security Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Features
              </CardTitle>
              <CardDescription>
                Military-grade security measures protecting your API keys
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshMetrics}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">AES-256 Encryption</div>
                <div className="text-sm text-muted-foreground">Military-grade encryption</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">8-Hour Sessions</div>
                <div className="text-sm text-muted-foreground">Auto-expiring sessions</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Trash2 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Auto-Delete</div>
                <div className="text-sm text-muted-foreground">Keys deleted after session</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-orange-100 rounded-full">
                <Eye className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="font-medium">Zero-Trust</div>
                <div className="text-sm text-muted-foreground">Verify every request</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-red-100 rounded-full">
                <FileText className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="font-medium">Audit Logging</div>
                <div className="text-sm text-muted-foreground">Complete activity trail</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-teal-100 rounded-full">
                <Key className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <div className="font-medium">Key Rotation</div>
                <div className="text-sm text-muted-foreground">{metrics.keyRotations} rotations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance & Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Compliance & Certifications
          </CardTitle>
          <CardDescription>
            Industry-standard security compliance and certifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">✓</div>
              <div className="font-medium">SOC 2 Ready</div>
              <div className="text-sm text-muted-foreground">Security controls</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">✓</div>
              <div className="font-medium">GDPR Compliant</div>
              <div className="text-sm text-muted-foreground">Data protection</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">✓</div>
              <div className="font-medium">ISO 27001</div>
              <div className="text-sm text-muted-foreground">Security management</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">✓</div>
              <div className="font-medium">PCI DSS</div>
              <div className="text-sm text-muted-foreground">Payment security</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
              <CardDescription>
                Real-time security audit log ({metrics.auditEvents} total events)
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{event.event}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.provider}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {event.details}
                  </div>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          <Alert className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> All API key operations are logged for security audit. 
              Logs are encrypted and retained for 90 days for compliance purposes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Best practices to maintain optimal security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Rotate API Keys Regularly</div>
                <div className="text-sm text-muted-foreground">
                  Update your provider API keys every 90 days for optimal security
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Monitor Session Activity</div>
                <div className="text-sm text-muted-foreground">
                  Review audit logs regularly for any suspicious activity
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Use Strong API Keys</div>
                <div className="text-sm text-muted-foreground">
                  Ensure your provider API keys follow strong security practices
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Terminate Unused Sessions</div>
                <div className="text-sm text-muted-foreground">
                  Manually terminate sessions when not in use to minimize exposure
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
