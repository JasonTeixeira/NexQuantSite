"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Globe,
  Smartphone,
  Zap,
  Shield,
  BarChart3,
  Bell,
  Calendar,
  ExternalLink,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  Eye,
  Mail,
  Rss,
  Info
} from "lucide-react"

interface ServiceStatus {
  id: string
  name: string
  description: string
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance'
  uptime: number
  responseTime: number
  lastIncident?: string
  icon: any
  metrics: {
    uptime90d: number
    avgResponseTime: number
    availability: number
  }
}

interface Incident {
  id: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  impact: 'none' | 'minor' | 'major' | 'critical'
  created: string
  updated: string
  description: string
  services: string[]
}

const mockServices: ServiceStatus[] = [
  {
    id: 'api',
    name: 'Trading API',
    description: 'Core trading and market data API',
    status: 'operational',
    uptime: 99.99,
    responseTime: 45,
    icon: Server,
    metrics: {
      uptime90d: 99.95,
      avgResponseTime: 52,
      availability: 99.99
    }
  },
  {
    id: 'web',
    name: 'Web Platform',
    description: 'Main trading platform interface',
    status: 'operational',
    uptime: 99.97,
    responseTime: 156,
    icon: Globe,
    metrics: {
      uptime90d: 99.92,
      avgResponseTime: 168,
      availability: 99.97
    }
  },
  {
    id: 'mobile',
    name: 'Mobile Apps',
    description: 'iOS and Android applications',
    status: 'operational',
    uptime: 99.95,
    responseTime: 89,
    icon: Smartphone,
    metrics: {
      uptime90d: 99.89,
      avgResponseTime: 95,
      availability: 99.95
    }
  },
  {
    id: 'database',
    name: 'Database Cluster',
    description: 'Primary and backup database systems',
    status: 'operational',
    uptime: 100.0,
    responseTime: 12,
    icon: Database,
    metrics: {
      uptime90d: 99.98,
      avgResponseTime: 15,
      availability: 100.0
    }
  },
  {
    id: 'realtime',
    name: 'Real-time Data',
    description: 'Live market data and price feeds',
    status: 'operational',
    uptime: 99.98,
    responseTime: 8,
    icon: Activity,
    metrics: {
      uptime90d: 99.96,
      avgResponseTime: 10,
      availability: 99.98
    }
  },
  {
    id: 'security',
    name: 'Security Services',
    description: 'Authentication and security monitoring',
    status: 'operational',
    uptime: 99.99,
    responseTime: 23,
    icon: Shield,
    metrics: {
      uptime90d: 99.97,
      avgResponseTime: 28,
      availability: 99.99
    }
  }
]

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Intermittent API Response Delays',
    status: 'resolved',
    impact: 'minor',
    created: '2024-01-15T10:30:00Z',
    updated: '2024-01-15T11:45:00Z',
    description: 'Some users experienced increased response times on API endpoints between 10:30 and 11:45 UTC.',
    services: ['api']
  },
  {
    id: '2',
    title: 'Mobile App Authentication Issues',
    status: 'resolved',
    impact: 'major',
    created: '2024-01-12T15:20:00Z',
    updated: '2024-01-12T16:10:00Z',
    description: 'Authentication service was temporarily unavailable affecting mobile app logins.',
    services: ['mobile', 'security']
  }
]

const mockMaintenance = [
  {
    id: '1',
    title: 'Database Performance Optimization',
    scheduled: '2024-01-20T02:00:00Z',
    duration: '2 hours',
    impact: 'Minimal impact expected',
    services: ['database']
  },
  {
    id: '2',
    title: 'Security Certificate Renewal',
    scheduled: '2024-01-25T01:00:00Z',
    duration: '30 minutes',
    impact: 'Brief interruption to web platform',
    services: ['web', 'api']
  }
]

export default function SystemStatusClient() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState('90d')

  const overallStatus = mockServices.some(s => s.status === 'major_outage') ? 'major_outage' :
                       mockServices.some(s => s.status === 'partial_outage') ? 'partial_outage' :
                       mockServices.some(s => s.status === 'degraded') ? 'degraded' :
                       mockServices.some(s => s.status === 'maintenance') ? 'maintenance' : 'operational'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'partial_outage': return 'text-orange-400'
      case 'major_outage': return 'text-red-400'
      case 'maintenance': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      operational: 'bg-green-500',
      degraded: 'bg-yellow-500',
      partial_outage: 'bg-orange-500',
      major_outage: 'bg-red-500',
      maintenance: 'bg-blue-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return CheckCircle
      case 'degraded': return AlertTriangle
      case 'partial_outage': return AlertTriangle
      case 'major_outage': return XCircle
      case 'maintenance': return Clock
      default: return Info
    }
  }

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return 'text-red-400'
      case 'identified': return 'text-orange-400'
      case 'monitoring': return 'text-yellow-400'
      case 'resolved': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const refreshStatus = () => {
    setLastUpdated(new Date())
  }

  // Generate a stable array for uptime visualization
  const generateUptimeData = (uptime: number) => {
    const failures = Math.floor(90 * (1 - uptime / 100))
    const data = Array(90).fill(true)
    
    // Randomly distribute failures
    let count = 0
    while (count < failures) {
      const index = Math.floor(Math.random() * 90)
      if (data[index]) {
        data[index] = false
        count++
      }
    }
    
    return data
  }

  // Pre-generate uptime data for stability
  const uptimeData = React.useMemo(() => {
    return mockServices.reduce((acc, service) => {
      acc[service.id] = generateUptimeData(service.metrics.uptime90d)
      return acc
    }, {} as Record<string, boolean[]>)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Status</h1>
            <p className="text-gray-400">
              Real-time status and performance metrics for all Nexural Trading services
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button variant="outline" onClick={refreshStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getStatusBadge(overallStatus)}`}>
                  {React.createElement(getStatusIcon(overallStatus), { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {overallStatus === 'operational' ? 'All Systems Operational' :
                     overallStatus === 'degraded' ? 'Some Systems Degraded' :
                     overallStatus === 'partial_outage' ? 'Partial Service Outage' :
                     overallStatus === 'major_outage' ? 'Major Service Outage' : 'Scheduled Maintenance'}
                  </h2>
                  <p className="text-gray-400">
                    {overallStatus === 'operational' 
                      ? 'All services are running smoothly' 
                      : 'Some services are experiencing issues'}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(overallStatus)}>
                {overallStatus.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Services Status */}
        <div className="grid gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Service Status
              </CardTitle>
              <CardDescription>
                Current operational status of all platform services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusBadge(service.status)}`}>
                      {React.createElement(service.icon, { className: "w-4 h-4 text-white" })}
                    </div>
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-gray-400">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={getStatusColor(service.status)}>
                      {service.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-sm text-gray-400 mt-1">
                      {service.uptime}% uptime
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Response times and availability over the last {selectedPeriod}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Time Period</span>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {mockServices.map((service) => (
                <div key={service.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{service.name}</span>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>{service.metrics.avgResponseTime}ms avg</span>
                      <span>{service.metrics.availability}% available</span>
                    </div>
                  </div>
                  <Progress value={service.metrics.uptime90d} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Uptime History */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Uptime History
              </CardTitle>
              <CardDescription>
                90-day uptime history for all services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {React.createElement(service.icon, { className: "w-4 h-4 text-gray-400" })}
                      <span className="text-sm">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {uptimeData[service.id]?.map((isUp, i) => (
                          <div
                            key={i}
                            className={`w-1 h-6 rounded-sm ${isUp ? 'bg-green-500' : 'bg-red-500'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400 ml-2">
                        {service.metrics.uptime90d}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Incidents
              </CardTitle>
              <CardDescription>
                Past incidents and their resolution status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockIncidents.length > 0 ? (
                mockIncidents.map((incident) => (
                  <div key={incident.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{incident.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={getIncidentStatusColor(incident.status)}
                      >
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      {incident.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Impact: {incident.impact}</span>
                      <span>{formatTimeAgo(incident.updated)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Info className="w-8 h-8 mx-auto mb-2" />
                  <p>No recent incidents to display</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduled Maintenance */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Maintenance
              </CardTitle>
              <CardDescription>
                Upcoming maintenance windows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockMaintenance.length > 0 ? (
                mockMaintenance.map((maintenance) => (
                  <div key={maintenance.id} className="p-4 bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">{maintenance.title}</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>
                        <Clock className="w-4 h-4 inline mr-1" />
                        {new Date(maintenance.scheduled).toLocaleString()}
                      </p>
                      <p>Duration: {maintenance.duration}</p>
                      <p>Impact: {maintenance.impact}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <p>No scheduled maintenance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Page Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Status Page powered by Nexural Trading</span>
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" />
              Subscribe to Updates
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-1" />
              Email Updates
            </Button>
            <Button variant="outline" size="sm">
              <Rss className="w-4 h-4 mr-1" />
              RSS Feed
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
