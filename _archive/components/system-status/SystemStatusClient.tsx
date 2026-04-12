"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Activity, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Zap,
  Shield,
  Database,
  Smartphone,
  Globe,
  Settings,
  Bell,
  Calendar,
  ExternalLink,
  RefreshCw,
  Mail,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Monitor,
  Server,
  Wifi,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  SYSTEM_SERVICES,
  SYSTEM_INCIDENTS,
  MAINTENANCE_WINDOWS,
  getOverallSystemStatus,
  getSystemMetrics,
  getServicesByCategory,
  getActiveIncidents,
  getScheduledMaintenance,
  getStatusColor,
  getStatusBadgeColor,
  getUptimeColor,
  getImpactColor,
  subscribeToStatusUpdates,
  ServiceCategory,
  SystemService,
  SystemIncident,
  MaintenanceWindow,
  StatusMetrics
} from "@/lib/system-status/status-utils"

const categoryIcons: Record<ServiceCategory, any> = {
  core_platform: Monitor,
  trading_engine: TrendingUp,
  market_data: BarChart3,
  user_authentication: Shield,
  payment_system: DollarSign,
  api_services: Database,
  mobile_apps: Smartphone,
  third_party: ExternalLink,
  infrastructure: Server
}

const categoryNames: Record<ServiceCategory, string> = {
  core_platform: 'Core Platform',
  trading_engine: 'Trading Engine',
  market_data: 'Market Data',
  user_authentication: 'Authentication',
  payment_system: 'Payment System',
  api_services: 'API Services',
  mobile_apps: 'Mobile Apps',
  third_party: 'Third Party',
  infrastructure: 'Infrastructure'
}

export default function SystemStatusClient() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const [expandedIncidents, setExpandedIncidents] = useState<Set<string>>(new Set())
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [subscriptionEmail, setSubscriptionEmail] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const metrics = getSystemMetrics()
  const overallStatus = getOverallSystemStatus()
  const activeIncidents = getActiveIncidents()
  const scheduledMaintenance = getScheduledMaintenance()

  // Auto refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // In real app, this would trigger data refetch
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const handleRefresh = () => {
    setLastUpdated(new Date())
    // In real app, this would trigger data refetch
  }

  const toggleIncidentExpansion = (incidentId: string) => {
    const newExpanded = new Set(expandedIncidents)
    if (newExpanded.has(incidentId)) {
      newExpanded.delete(incidentId)
    } else {
      newExpanded.add(incidentId)
    }
    setExpandedIncidents(newExpanded)
  }

  const handleSubscription = async () => {
    if (!subscriptionEmail) return
    
    const result = await subscribeToStatusUpdates({
      email: subscriptionEmail,
      services: selectedServices.length > 0 ? selectedServices : SYSTEM_SERVICES.map(s => s.id),
      notificationTypes: ['email'],
      isActive: true
    })
    
    if (result.success) {
      setShowSubscriptionDialog(false)
      setSubscriptionEmail('')
      setSelectedServices([])
      // Show success message
    }
  }

  const getOverallStatusMessage = () => {
    switch (overallStatus) {
      case 'operational':
        return 'All systems are operational'
      case 'degraded':
        return 'Some systems are experiencing issues'
      case 'partial_outage':
        return 'Partial service disruption'
      case 'major_outage':
        return 'Major service disruption'
      case 'maintenance':
        return 'Scheduled maintenance in progress'
      default:
        return 'Status unknown'
    }
  }

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
      case 'operational':
        return <CheckCircle className="w-8 h-8 text-green-400" />
      case 'degraded':
        return <AlertCircle className="w-8 h-8 text-yellow-400" />
      case 'partial_outage':
        return <AlertCircle className="w-8 h-8 text-orange-400" />
      case 'major_outage':
        return <AlertCircle className="w-8 h-8 text-red-400" />
      case 'maintenance':
        return <Settings className="w-8 h-8 text-blue-400" />
      default:
        return <Activity className="w-8 h-8 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900/50 via-black to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              {getOverallStatusIcon()}
              <h1 className="text-5xl font-bold text-white">System Status</h1>
            </div>
            
            <div className="mb-8">
              <h2 className={`text-2xl font-semibold mb-2 ${getStatusColor(overallStatus)}`}>
                {getOverallStatusMessage()}
              </h2>
              <p className="text-gray-400">
                Real-time monitoring of Nexural Trading platform services and infrastructure
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {metrics.overallUptime.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-400">Overall Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {Math.round(metrics.avgResponseTime)}ms
                </div>
                <div className="text-sm text-gray-400">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {metrics.healthyServices}/{metrics.totalServices}
                </div>
                <div className="text-sm text-gray-400">Services Up</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {metrics.activeIncidents}
                </div>
                <div className="text-sm text-gray-400">Active Issues</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <Bell className="w-4 h-4 mr-1" />
                    Subscribe
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Subscribe to Status Updates</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        value={subscriptionEmail}
                        onChange={(e) => setSubscriptionEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="bg-gray-800 border-gray-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label>Services to Monitor (leave empty for all)</Label>
                      <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                        {SYSTEM_SERVICES.map((service) => (
                          <div key={service.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={service.id}
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedServices([...selectedServices, service.id])
                                } else {
                                  setSelectedServices(selectedServices.filter(s => s !== service.id))
                                }
                              }}
                            />
                            <Label htmlFor={service.id} className="text-sm">
                              {service.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleSubscription} className="w-full bg-primary text-black hover:bg-primary/90">
                      Subscribe to Updates
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Active Incidents & Maintenance */}
      {(activeIncidents.length > 0 || scheduledMaintenance.length > 0) && (
        <section className="py-8 bg-gray-900/30">
          <div className="container mx-auto px-4">
            {/* Active Incidents */}
            {activeIncidents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  Active Incidents
                </h2>
                <div className="space-y-4">
                  {activeIncidents.map((incident) => (
                    <Card key={incident.id} className="bg-red-900/20 border-red-500/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={getStatusBadgeColor('major_outage')}>
                                {incident.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className={`${getImpactColor(incident.impact)} border-current`}>
                                {incident.impact.toUpperCase()} IMPACT
                              </Badge>
                              <span className="text-sm text-gray-400">
                                {new Date(incident.createdAt).toLocaleDateString()} at {new Date(incident.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{incident.title}</h3>
                            <p className="text-gray-300 mb-4">{incident.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">
                                Affected: {incident.affectedServices.map(serviceId => 
                                  SYSTEM_SERVICES.find(s => s.id === serviceId)?.name || serviceId
                                ).join(', ')}
                              </span>
                              {incident.estimatedResolution && (
                                <span className="text-gray-400">
                                  ETA: {new Date(incident.estimatedResolution).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleIncidentExpansion(incident.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            {expandedIncidents.has(incident.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        {/* Incident Updates */}
                        {expandedIncidents.has(incident.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="border-t border-gray-700 pt-4 mt-4"
                          >
                            <h4 className="text-lg font-medium text-white mb-3">Updates</h4>
                            <div className="space-y-3">
                              {incident.updates.map((update) => (
                                <div key={update.id} className="flex gap-3">
                                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm text-gray-400">
                                        {new Date(update.timestamp).toLocaleDateString()} at {new Date(update.timestamp).toLocaleTimeString()}
                                      </span>
                                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                                        {update.type.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-300">{update.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      by {update.author.name}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Scheduled Maintenance */}
            {scheduledMaintenance.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  Scheduled Maintenance
                </h2>
                <div className="space-y-4">
                  {scheduledMaintenance.map((maintenance) => (
                    <Card key={maintenance.id} className="bg-blue-900/20 border-blue-500/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                                {maintenance.status.toUpperCase().replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className={`${getImpactColor(maintenance.impact)} border-current`}>
                                {maintenance.impact.toUpperCase()} IMPACT
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{maintenance.title}</h3>
                            <p className="text-gray-300 mb-4">{maintenance.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>
                                {new Date(maintenance.scheduledStart).toLocaleDateString()} {new Date(maintenance.scheduledStart).toLocaleTimeString()} - {new Date(maintenance.scheduledEnd).toLocaleTimeString()}
                              </span>
                              <span>
                                Services: {maintenance.services.map(serviceId => 
                                  SYSTEM_SERVICES.find(s => s.id === serviceId)?.name || serviceId
                                ).join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Services Status */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Service Status</h2>
            
            {/* Services by Category */}
            <div className="space-y-8">
              {Object.entries(categoryNames).map(([category, name]) => {
                const services = getServicesByCategory(category as ServiceCategory)
                if (services.length === 0) return null
                
                const Icon = categoryIcons[category as ServiceCategory]
                
                return (
                  <div key={category}>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {name}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <Card key={service.id} className="bg-gray-900/50 border-gray-700">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-semibold text-white">{service.name}</h4>
                                  <Badge className={getStatusBadgeColor(service.status)}>
                                    {service.status.toUpperCase().replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                                
                                {/* Maintenance Banner */}
                                {service.maintenance && (
                                  <Alert className="mb-4 border-blue-500/50 bg-blue-900/20">
                                    <Settings className="h-4 w-4" />
                                    <AlertDescription className="text-blue-200">
                                      Scheduled maintenance: {service.maintenance.reason}
                                      <br />
                                      <span className="text-xs">
                                        {new Date(service.maintenance.startTime).toLocaleString()} - {new Date(service.maintenance.endTime).toLocaleString()}
                                      </span>
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm text-gray-400">Uptime (30d)</span>
                                      <span className={`text-sm font-semibold ${getUptimeColor(service.uptime)}`}>
                                        {service.uptime.toFixed(2)}%
                                      </span>
                                    </div>
                                    <Progress 
                                      value={service.uptime} 
                                      className="h-2"
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm text-gray-400">Response Time</span>
                                      <span className="text-sm font-semibold text-white">
                                        {service.responseTime}ms
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                                    </div>
                                  </div>
                                </div>

                                {/* Service Metrics (if available) */}
                                {service.metrics.cpu > 0 && (
                                  <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                                    <div className="text-center">
                                      <div className="text-white font-semibold">{service.metrics.cpu}%</div>
                                      <div className="text-gray-500">CPU</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-white font-semibold">{service.metrics.memory}%</div>
                                      <div className="text-gray-500">Memory</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-white font-semibold">{service.metrics.disk}%</div>
                                      <div className="text-gray-500">Disk</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-white font-semibold">{service.metrics.network}%</div>
                                      <div className="text-gray-500">Network</div>
                                    </div>
                                  </div>
                                )}

                                {/* SLA Information */}
                                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">SLA Target</span>
                                    <span className="text-white">{service.sla.target}%</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Current Performance</span>
                                    <span className={service.sla.current >= service.sla.target ? 'text-green-400' : 'text-red-400'}>
                                      {service.sla.current}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">SLA Breaches</span>
                                    <span className="text-white">{service.sla.breaches}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Historical Data */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Historical Performance</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Uptime History */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    30-Day Uptime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {metrics.uptimeHistory.slice(-7).map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between p-2 rounded hover:bg-gray-800/50">
                        <span className="text-sm text-gray-400">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${getUptimeColor(day.uptime)}`}>
                            {day.uptime.toFixed(2)}%
                          </span>
                          {day.incidents > 0 && (
                            <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">
                              {day.incidents} issues
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Incident History */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    7-Day Incidents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {metrics.incidentHistory.map((day) => (
                      <div key={day.date} className="flex items-center justify-between p-2 rounded hover:bg-gray-800/50">
                        <span className="text-sm text-gray-400">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-white">
                            {day.incidents} incidents
                          </div>
                          {day.resolved > 0 && (
                            <div className="text-xs text-green-400">
                              {day.resolved} resolved
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SLA Summary */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    SLA Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {metrics.slaCompliance.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Overall Compliance</div>
                    </div>
                    <div className="space-y-2">
                      {SYSTEM_SERVICES.slice(0, 5).map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-800/50">
                          <span className="text-sm text-gray-400">{service.name}</span>
                          <span className={`text-sm font-semibold ${
                            service.sla.current >= service.sla.target ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {service.sla.current}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
