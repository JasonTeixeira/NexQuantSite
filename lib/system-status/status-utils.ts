/**
 * System Status & Monitoring Utils - Professional Grade
 * Handles service monitoring, incident management, and status reporting
 */

export interface SystemService {
  id: string
  name: string
  description: string
  category: ServiceCategory
  status: ServiceStatus
  uptime: number // percentage over last 30 days
  responseTime: number // milliseconds
  lastChecked: string
  endpoint?: string
  dependencies: string[]
  region: ServiceRegion
  maintenance?: {
    scheduled: boolean
    startTime: string
    endTime: string
    reason: string
    impact: IncidentImpact
  }
  metrics: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
  sla: {
    target: number // percentage
    current: number // percentage
    breaches: number
  }
}

export interface SystemIncident {
  id: string
  title: string
  description: string
  status: IncidentStatus
  impact: IncidentImpact
  affectedServices: string[]
  priority: IncidentPriority
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  estimatedResolution?: string
  updates: IncidentUpdate[]
  rootCause?: string
  postMortem?: {
    summary: string
    timeline: {
      time: string
      event: string
    }[]
    actions: {
      action: string
      responsible: string
      dueDate: string
      status: 'pending' | 'in_progress' | 'completed'
    }[]
  }
  reportedBy: {
    id: string
    name: string
    type: 'system' | 'user' | 'staff'
  }
}

export interface IncidentUpdate {
  id: string
  message: string
  timestamp: string
  type: IncidentUpdateType
  author: {
    id: string
    name: string
    role: string
  }
  affectedServices?: string[]
}

export interface MaintenanceWindow {
  id: string
  title: string
  description: string
  services: string[]
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  status: MaintenanceStatus
  impact: IncidentImpact
  notifications: {
    channels: NotificationChannel[]
    schedule: {
      time: string
      sent: boolean
    }[]
  }
  updates: IncidentUpdate[]
  createdBy: string
  createdAt: string
}

export interface StatusMetrics {
  overallStatus: ServiceStatus
  overallUptime: number
  totalServices: number
  healthyServices: number
  degradedServices: number
  downServices: number
  avgResponseTime: number
  activeIncidents: number
  scheduledMaintenance: number
  slaCompliance: number
  uptimeHistory: {
    date: string
    uptime: number
    incidents: number
  }[]
  responseTimeHistory: {
    timestamp: string
    responseTime: number
    service: string
  }[]
  incidentHistory: {
    date: string
    incidents: number
    resolved: number
    avgResolutionTime: number
  }[]
}

export interface StatusSubscription {
  id: string
  email: string
  services: string[]
  notificationTypes: NotificationChannel[]
  isActive: boolean
  createdAt: string
  lastNotified?: string
}

export type ServiceCategory = 
  | 'core_platform'
  | 'trading_engine' 
  | 'market_data'
  | 'user_authentication'
  | 'payment_system'
  | 'api_services'
  | 'mobile_apps'
  | 'third_party'
  | 'infrastructure'

export type ServiceStatus = 
  | 'operational'
  | 'degraded'
  | 'partial_outage'
  | 'major_outage'
  | 'maintenance'

export type ServiceRegion = 
  | 'us_east'
  | 'us_west'
  | 'eu_west'
  | 'asia_pacific'
  | 'global'

export type IncidentStatus = 
  | 'investigating'
  | 'identified'
  | 'monitoring'
  | 'resolved'
  | 'postmortem'

export type IncidentImpact = 
  | 'none'
  | 'minor'
  | 'major'
  | 'critical'

export type IncidentPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type IncidentUpdateType = 
  | 'investigating'
  | 'update'
  | 'identified'
  | 'monitoring'
  | 'resolved'

export type MaintenanceStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type NotificationChannel = 
  | 'email'
  | 'sms'
  | 'webhook'
  | 'rss'
  | 'push'

// Mock System Services
export const SYSTEM_SERVICES: SystemService[] = [
  {
    id: 'trading-platform',
    name: 'Trading Platform',
    description: 'Core trading interface and functionality',
    category: 'core_platform',
    status: 'operational',
    uptime: 99.97,
    responseTime: 125,
    lastChecked: new Date(Date.now() - 2000).toISOString(),
    endpoint: 'https://api.nexural.com/v1/platform/health',
    dependencies: ['trading-engine', 'market-data'],
    region: 'global',
    metrics: {
      cpu: 23,
      memory: 64,
      disk: 45,
      network: 12
    },
    sla: {
      target: 99.9,
      current: 99.97,
      breaches: 0
    }
  },
  {
    id: 'trading-engine',
    name: 'Trading Engine',
    description: 'Core trade execution and order management system',
    category: 'trading_engine',
    status: 'operational',
    uptime: 99.99,
    responseTime: 45,
    lastChecked: new Date(Date.now() - 1000).toISOString(),
    endpoint: 'https://engine.nexural.com/health',
    dependencies: ['market-data', 'user-auth'],
    region: 'us_east',
    metrics: {
      cpu: 18,
      memory: 72,
      disk: 32,
      network: 8
    },
    sla: {
      target: 99.99,
      current: 99.99,
      breaches: 0
    }
  },
  {
    id: 'market-data',
    name: 'Market Data Feed',
    description: 'Real-time market data and price feeds',
    category: 'market_data',
    status: 'degraded',
    uptime: 99.85,
    responseTime: 89,
    lastChecked: new Date(Date.now() - 3000).toISOString(),
    endpoint: 'https://data.nexural.com/health',
    dependencies: [],
    region: 'global',
    metrics: {
      cpu: 45,
      memory: 88,
      disk: 23,
      network: 67
    },
    sla: {
      target: 99.9,
      current: 99.85,
      breaches: 1
    }
  },
  {
    id: 'user-auth',
    name: 'User Authentication',
    description: 'User login, registration, and session management',
    category: 'user_authentication',
    status: 'operational',
    uptime: 99.94,
    responseTime: 156,
    lastChecked: new Date(Date.now() - 1500).toISOString(),
    endpoint: 'https://auth.nexural.com/health',
    dependencies: [],
    region: 'global',
    metrics: {
      cpu: 31,
      memory: 55,
      disk: 67,
      network: 19
    },
    sla: {
      target: 99.9,
      current: 99.94,
      breaches: 0
    }
  },
  {
    id: 'payment-system',
    name: 'Payment Processing',
    description: 'Payment gateway and transaction processing',
    category: 'payment_system',
    status: 'operational',
    uptime: 99.92,
    responseTime: 234,
    lastChecked: new Date(Date.now() - 2500).toISOString(),
    dependencies: ['user-auth'],
    region: 'us_east',
    metrics: {
      cpu: 27,
      memory: 61,
      disk: 78,
      network: 23
    },
    sla: {
      target: 99.9,
      current: 99.92,
      breaches: 0
    }
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    description: 'Public API endpoints and rate limiting',
    category: 'api_services',
    status: 'operational',
    uptime: 99.98,
    responseTime: 98,
    lastChecked: new Date(Date.now() - 800).toISOString(),
    dependencies: [],
    region: 'global',
    metrics: {
      cpu: 19,
      memory: 43,
      disk: 34,
      network: 45
    },
    sla: {
      target: 99.95,
      current: 99.98,
      breaches: 0
    }
  },
  {
    id: 'mobile-app',
    name: 'Mobile Applications',
    description: 'iOS and Android mobile applications',
    category: 'mobile_apps',
    status: 'operational',
    uptime: 99.89,
    responseTime: 187,
    lastChecked: new Date(Date.now() - 4000).toISOString(),
    dependencies: ['api-gateway', 'user-auth'],
    region: 'global',
    metrics: {
      cpu: 0, // Not applicable for mobile apps
      memory: 0,
      disk: 0,
      network: 0
    },
    sla: {
      target: 99.8,
      current: 99.89,
      breaches: 0
    }
  },
  {
    id: 'notification-service',
    name: 'Notification Service',
    description: 'Email, SMS, and push notification delivery',
    category: 'infrastructure',
    status: 'maintenance',
    uptime: 99.91,
    responseTime: 312,
    lastChecked: new Date(Date.now() - 6000).toISOString(),
    dependencies: [],
    region: 'global',
    maintenance: {
      scheduled: true,
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      reason: 'Infrastructure upgrade and security patches',
      impact: 'minor'
    },
    metrics: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0
    },
    sla: {
      target: 99.5,
      current: 99.91,
      breaches: 0
    }
  }
]

// Mock Incidents
export const SYSTEM_INCIDENTS: SystemIncident[] = [
  {
    id: 'inc_001',
    title: 'Market Data Feed Experiencing High Latency',
    description: 'Some users may experience delayed market data updates. We are investigating the root cause and working to resolve the issue.',
    status: 'monitoring',
    impact: 'minor',
    affectedServices: ['market-data'],
    priority: 'medium',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estimatedResolution: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    updates: [
      {
        id: 'update_001',
        message: 'We have identified the issue with our data provider and are implementing a fix.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        type: 'identified',
        author: {
          id: 'eng_1',
          name: 'Engineering Team',
          role: 'Site Reliability Engineer'
        }
      },
      {
        id: 'update_002',
        message: 'Fix has been deployed and we are monitoring the situation. Data latency should be improving.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        type: 'monitoring',
        author: {
          id: 'eng_1',
          name: 'Engineering Team',
          role: 'Site Reliability Engineer'
        }
      }
    ],
    reportedBy: {
      id: 'system',
      name: 'Automated Monitoring',
      type: 'system'
    }
  }
]

// Mock Maintenance Windows
export const MAINTENANCE_WINDOWS: MaintenanceWindow[] = [
  {
    id: 'maint_001',
    title: 'Scheduled Notification Service Maintenance',
    description: 'We will be performing routine maintenance on our notification infrastructure to improve reliability and security.',
    services: ['notification-service'],
    scheduledStart: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    scheduledEnd: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    actualStart: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    status: 'in_progress',
    impact: 'minor',
    notifications: {
      channels: ['email', 'push'],
      schedule: [
        { time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), sent: true },
        { time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), sent: true },
        { time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), sent: false }
      ]
    },
    updates: [
      {
        id: 'maint_update_001',
        message: 'Maintenance has started as scheduled. Email and SMS notifications may be delayed during this period.',
        timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
        type: 'update',
        author: {
          id: 'ops_1',
          name: 'Operations Team',
          role: 'DevOps Engineer'
        }
      }
    ],
    createdBy: 'ops_1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Status Utility Functions
export const getOverallSystemStatus = (): ServiceStatus => {
  const services = SYSTEM_SERVICES.filter(s => s.status !== 'maintenance')
  const criticalServices = services.filter(s => s.category === 'core_platform' || s.category === 'trading_engine')
  
  // If any critical service is down
  if (criticalServices.some(s => s.status === 'major_outage')) {
    return 'major_outage'
  }
  
  // If any critical service has partial outage
  if (criticalServices.some(s => s.status === 'partial_outage')) {
    return 'partial_outage'
  }
  
  // If any service is degraded
  if (services.some(s => s.status === 'degraded')) {
    return 'degraded'
  }
  
  return 'operational'
}

export const getSystemMetrics = (): StatusMetrics => {
  const services = SYSTEM_SERVICES
  const activeIncidents = SYSTEM_INCIDENTS.filter(i => i.status !== 'resolved').length
  const scheduledMaintenance = MAINTENANCE_WINDOWS.filter(m => m.status === 'scheduled' || m.status === 'in_progress').length
  
  // Generate uptime history for last 30 days
  const uptimeHistory = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      uptime: Math.random() * 2 + 98, // 98-100%
      incidents: Math.random() < 0.1 ? Math.floor(Math.random() * 3) + 1 : 0
    }
  })
  
  // Generate response time history for last 24 hours
  const responseTimeHistory = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date()
    timestamp.setHours(timestamp.getHours() - (23 - i))
    return services.map(service => ({
      timestamp: timestamp.toISOString(),
      responseTime: service.responseTime + (Math.random() * 100 - 50),
      service: service.id
    }))
  }).flat()
  
  return {
    overallStatus: getOverallSystemStatus(),
    overallUptime: services.reduce((sum, s) => sum + s.uptime, 0) / services.length,
    totalServices: services.length,
    healthyServices: services.filter(s => s.status === 'operational').length,
    degradedServices: services.filter(s => s.status === 'degraded').length,
    downServices: services.filter(s => ['partial_outage', 'major_outage'].includes(s.status)).length,
    avgResponseTime: services.reduce((sum, s) => sum + s.responseTime, 0) / services.length,
    activeIncidents,
    scheduledMaintenance,
    slaCompliance: services.reduce((sum, s) => sum + s.sla.current, 0) / services.length,
    uptimeHistory,
    responseTimeHistory,
    incidentHistory: Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toISOString().split('T')[0],
        incidents: Math.floor(Math.random() * 3),
        resolved: Math.floor(Math.random() * 2),
        avgResolutionTime: Math.random() * 120 + 30 // 30-150 minutes
      }
    })
  }
}

export const getServicesByCategory = (category: ServiceCategory): SystemService[] => {
  return SYSTEM_SERVICES.filter(service => service.category === category)
}

export const getActiveIncidents = (): SystemIncident[] => {
  return SYSTEM_INCIDENTS.filter(incident => incident.status !== 'resolved')
}

export const getScheduledMaintenance = (): MaintenanceWindow[] => {
  return MAINTENANCE_WINDOWS.filter(
    maintenance => maintenance.status === 'scheduled' || maintenance.status === 'in_progress'
  )
}

export const getServiceStatus = (serviceId: string): SystemService | null => {
  return SYSTEM_SERVICES.find(service => service.id === serviceId) || null
}

export const subscribeToStatusUpdates = (subscription: Omit<StatusSubscription, 'id' | 'createdAt'>): { success: boolean, message: string } => {
  // Mock subscription logic
  return { success: true, message: 'Successfully subscribed to status updates' }
}

export const getUptimeColor = (uptime: number): string => {
  if (uptime >= 99.9) return 'text-green-400'
  if (uptime >= 99.5) return 'text-yellow-400'
  if (uptime >= 98.0) return 'text-orange-400'
  return 'text-red-400'
}

export const getStatusColor = (status: ServiceStatus): string => {
  switch (status) {
    case 'operational':
      return 'text-green-400'
    case 'degraded':
      return 'text-yellow-400'
    case 'partial_outage':
      return 'text-orange-400'
    case 'major_outage':
      return 'text-red-400'
    case 'maintenance':
      return 'text-blue-400'
    default:
      return 'text-gray-400'
  }
}

export const getStatusBadgeColor = (status: ServiceStatus): string => {
  switch (status) {
    case 'operational':
      return 'bg-green-500/20 text-green-400 border-green-500/50'
    case 'degraded':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    case 'partial_outage':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
    case 'major_outage':
      return 'bg-red-500/20 text-red-400 border-red-500/50'
    case 'maintenance':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  }
}

export const getImpactColor = (impact: IncidentImpact): string => {
  switch (impact) {
    case 'none':
      return 'text-gray-400'
    case 'minor':
      return 'text-yellow-400'
    case 'major':
      return 'text-orange-400'
    case 'critical':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

// Export functions for testing
export const __testing__ = {
  getOverallSystemStatus,
  getServicesByCategory,
  getActiveIncidents,
  getScheduledMaintenance
}


