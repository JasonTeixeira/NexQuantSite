"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Globe, Server, Shield, Zap, Activity, AlertTriangle, 
  MapPin, Wifi, Database, Network, Clock, DollarSign,
  TrendingUp, TrendingDown, RefreshCw, Settings, Eye, Users
} from "lucide-react"

// Import our global infrastructure manager
import { 
  globalInfrastructureManager, 
  Region, 
  EdgeLocation, 
  DisasterRecovery 
} from "@/lib/global/infrastructure-manager"

interface GlobalInfrastructureDashboardProps {
  className?: string
}

export default function GlobalInfrastructureDashboard({ className = "" }: GlobalInfrastructureDashboardProps) {
  const [regions, setRegions] = useState<Region[]>([])
  const [edgeLocations, setEdgeLocations] = useState<EdgeLocation[]>([])
  const [globalMetrics, setGlobalMetrics] = useState<any>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGlobalInfrastructureData()
    
    // Real-time updates every 30 seconds
    const interval = setInterval(loadGlobalInfrastructureData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadGlobalInfrastructureData = async () => {
    try {
      setIsLoading(true)
      
      // Load global metrics
      const metrics = await globalInfrastructureManager.getGlobalMetrics()
      setGlobalMetrics(metrics)
      
      // Simulate loading regions and edge locations
      const mockRegions: Region[] = [
        {
          id: 'us-east-1',
          name: 'US East (Virginia)',
          code: 'us-east-1',
          location: {
            country: 'United States',
            city: 'Virginia',
            continent: 'north_america',
            coordinates: { lat: 39.0458, lng: -76.6413 }
          },
          status: 'active',
          capacity: {
            maxConcurrentUsers: 100000,
            maxApiRequests: 1000000,
            maxDatabaseConnections: 1000,
            maxStorageGB: 10000,
            maxBandwidthMbps: 10000,
            currentUsers: 45230,
            currentApiRequests: 450000,
            currentStorageGB: 3200,
            currentBandwidthMbps: 2100,
            autoScalingEnabled: true,
            scaleUpThreshold: 80,
            scaleDownThreshold: 30
          },
          services: {
            apiGateway: { enabled: true, status: 'healthy', responseTime: 45, errorRate: 0.02, uptime: 99.98, lastCheck: new Date() },
            database: { enabled: true, status: 'healthy', responseTime: 12, errorRate: 0.01, uptime: 99.99, lastCheck: new Date() },
            cache: { enabled: true, status: 'healthy', responseTime: 3, errorRate: 0.001, uptime: 99.99, lastCheck: new Date() },
            messageQueue: { enabled: true, status: 'healthy', responseTime: 8, errorRate: 0.01, uptime: 99.97, lastCheck: new Date() },
            storage: { enabled: true, status: 'healthy', responseTime: 25, errorRate: 0.005, uptime: 99.98, lastCheck: new Date() },
            aiProcessing: { enabled: true, status: 'healthy', responseTime: 150, errorRate: 0.02, uptime: 99.95, lastCheck: new Date() },
            patternRecognition: { enabled: true, status: 'healthy', responseTime: 200, errorRate: 0.03, uptime: 99.94, lastCheck: new Date() },
            smartMoneyAnalysis: { enabled: true, status: 'healthy', responseTime: 180, errorRate: 0.025, uptime: 99.96, lastCheck: new Date() },
            realtimeAnalytics: { enabled: true, status: 'healthy', responseTime: 75, errorRate: 0.015, uptime: 99.97, lastCheck: new Date() },
            businessIntelligence: { enabled: true, status: 'healthy', responseTime: 120, errorRate: 0.02, uptime: 99.95, lastCheck: new Date() },
            threatDetection: { enabled: true, status: 'healthy', responseTime: 90, errorRate: 0.01, uptime: 99.98, lastCheck: new Date() },
            compliance: { enabled: true, status: 'healthy', responseTime: 60, errorRate: 0.005, uptime: 99.99, lastCheck: new Date() },
            encryption: { enabled: true, status: 'healthy', responseTime: 15, errorRate: 0.001, uptime: 99.99, lastCheck: new Date() }
          },
          metrics: {
            avgResponseTime: 85,
            p95ResponseTime: 180,
            p99ResponseTime: 350,
            throughput: 8500,
            errorRate: 0.02,
            uptime: 99.97,
            cpuUtilization: 65,
            memoryUtilization: 72,
            diskUtilization: 45,
            networkUtilization: 58,
            activeUsers: 45230,
            apiCalls: 2850000,
            dataTransfer: 850,
            revenue: 125000,
            computeCost: 8500,
            storageCost: 1200,
            networkCost: 800,
            totalCost: 10500
          },
          compliance: {
            gdpr: false,
            ccpa: true,
            pipeda: true,
            lgpd: false,
            sox: true,
            hipaa: true,
            pciDss: true,
            fedramp: true,
            dataLocalization: true,
            crossBorderTransfer: true,
            encryptionAtRest: true,
            encryptionInTransit: true
          },
          dataResidency: true,
          endpoints: {
            api: 'https://api-us-east-1.optionsflow.com',
            websocket: 'wss://ws-us-east-1.optionsflow.com',
            cdn: 'https://cdn-us-east-1.optionsflow.com',
            monitoring: 'https://monitor-us-east-1.optionsflow.com',
            admin: 'https://admin-us-east-1.optionsflow.com'
          },
          latency: { 'us-west-2': 70, 'eu-west-1': 80, 'ap-southeast-1': 180 },
          createdAt: new Date('2023-01-01'),
          lastHealthCheck: new Date()
        },
        {
          id: 'eu-west-1',
          name: 'Europe (Ireland)',
          code: 'eu-west-1',
          location: {
            country: 'Ireland',
            city: 'Dublin',
            continent: 'europe',
            coordinates: { lat: 53.3498, lng: -6.2603 }
          },
          status: 'active',
          capacity: {
            maxConcurrentUsers: 80000,
            maxApiRequests: 800000,
            maxDatabaseConnections: 800,
            maxStorageGB: 8000,
            maxBandwidthMbps: 8000,
            currentUsers: 28150,
            currentApiRequests: 320000,
            currentStorageGB: 2100,
            currentBandwidthMbps: 1400,
            autoScalingEnabled: true,
            scaleUpThreshold: 80,
            scaleDownThreshold: 30
          },
          services: {
            apiGateway: { enabled: true, status: 'healthy', responseTime: 38, errorRate: 0.015, uptime: 99.99, lastCheck: new Date() },
            database: { enabled: true, status: 'healthy', responseTime: 15, errorRate: 0.01, uptime: 99.98, lastCheck: new Date() },
            cache: { enabled: true, status: 'healthy', responseTime: 4, errorRate: 0.001, uptime: 99.99, lastCheck: new Date() },
            messageQueue: { enabled: true, status: 'degraded', responseTime: 25, errorRate: 0.05, uptime: 99.85, lastCheck: new Date() },
            storage: { enabled: true, status: 'healthy', responseTime: 20, errorRate: 0.003, uptime: 99.99, lastCheck: new Date() },
            aiProcessing: { enabled: true, status: 'healthy', responseTime: 160, errorRate: 0.02, uptime: 99.96, lastCheck: new Date() },
            patternRecognition: { enabled: true, status: 'healthy', responseTime: 190, errorRate: 0.025, uptime: 99.95, lastCheck: new Date() },
            smartMoneyAnalysis: { enabled: true, status: 'healthy', responseTime: 170, errorRate: 0.02, uptime: 99.97, lastCheck: new Date() },
            realtimeAnalytics: { enabled: true, status: 'healthy', responseTime: 65, errorRate: 0.01, uptime: 99.98, lastCheck: new Date() },
            businessIntelligence: { enabled: true, status: 'healthy', responseTime: 110, errorRate: 0.015, uptime: 99.97, lastCheck: new Date() },
            threatDetection: { enabled: true, status: 'healthy', responseTime: 80, errorRate: 0.008, uptime: 99.99, lastCheck: new Date() },
            compliance: { enabled: true, status: 'healthy', responseTime: 55, errorRate: 0.003, uptime: 99.99, lastCheck: new Date() },
            encryption: { enabled: true, status: 'healthy', responseTime: 12, errorRate: 0.001, uptime: 99.99, lastCheck: new Date() }
          },
          metrics: {
            avgResponseTime: 72,
            p95ResponseTime: 145,
            p99ResponseTime: 280,
            throughput: 6200,
            errorRate: 0.018,
            uptime: 99.96,
            cpuUtilization: 58,
            memoryUtilization: 68,
            diskUtilization: 41,
            networkUtilization: 52,
            activeUsers: 28150,
            apiCalls: 1950000,
            dataTransfer: 620,
            revenue: 95000,
            computeCost: 6800,
            storageCost: 950,
            networkCost: 650,
            totalCost: 8400
          },
          compliance: {
            gdpr: true,
            ccpa: false,
            pipeda: false,
            lgpd: false,
            sox: true,
            hipaa: true,
            pciDss: true,
            fedramp: false,
            dataLocalization: true,
            crossBorderTransfer: false,
            encryptionAtRest: true,
            encryptionInTransit: true
          },
          dataResidency: true,
          endpoints: {
            api: 'https://api-eu-west-1.optionsflow.com',
            websocket: 'wss://ws-eu-west-1.optionsflow.com',
            cdn: 'https://cdn-eu-west-1.optionsflow.com',
            monitoring: 'https://monitor-eu-west-1.optionsflow.com',
            admin: 'https://admin-eu-west-1.optionsflow.com'
          },
          latency: { 'us-east-1': 80, 'us-west-2': 140, 'ap-southeast-1': 160 },
          createdAt: new Date('2023-02-15'),
          lastHealthCheck: new Date()
        },
        {
          id: 'ap-southeast-1',
          name: 'Asia Pacific (Singapore)',
          code: 'ap-southeast-1',
          location: {
            country: 'Singapore',
            city: 'Singapore',
            continent: 'asia',
            coordinates: { lat: 1.3521, lng: 103.8198 }
          },
          status: 'active',
          capacity: {
            maxConcurrentUsers: 60000,
            maxApiRequests: 600000,
            maxDatabaseConnections: 600,
            maxStorageGB: 6000,
            maxBandwidthMbps: 6000,
            currentUsers: 18750,
            currentApiRequests: 210000,
            currentStorageGB: 1400,
            currentBandwidthMbps: 950,
            autoScalingEnabled: true,
            scaleUpThreshold: 80,
            scaleDownThreshold: 30
          },
          services: {
            apiGateway: { enabled: true, status: 'healthy', responseTime: 42, errorRate: 0.02, uptime: 99.97, lastCheck: new Date() },
            database: { enabled: true, status: 'healthy', responseTime: 18, errorRate: 0.012, uptime: 99.97, lastCheck: new Date() },
            cache: { enabled: true, status: 'healthy', responseTime: 5, errorRate: 0.002, uptime: 99.98, lastCheck: new Date() },
            messageQueue: { enabled: true, status: 'healthy', responseTime: 12, errorRate: 0.015, uptime: 99.96, lastCheck: new Date() },
            storage: { enabled: true, status: 'healthy', responseTime: 28, errorRate: 0.008, uptime: 99.97, lastCheck: new Date() },
            aiProcessing: { enabled: true, status: 'healthy', responseTime: 175, errorRate: 0.025, uptime: 99.94, lastCheck: new Date() },
            patternRecognition: { enabled: true, status: 'healthy', responseTime: 210, errorRate: 0.03, uptime: 99.93, lastCheck: new Date() },
            smartMoneyAnalysis: { enabled: true, status: 'healthy', responseTime: 195, errorRate: 0.028, uptime: 99.94, lastCheck: new Date() },
            realtimeAnalytics: { enabled: true, status: 'healthy', responseTime: 85, errorRate: 0.018, uptime: 99.96, lastCheck: new Date() },
            businessIntelligence: { enabled: true, status: 'healthy', responseTime: 130, errorRate: 0.022, uptime: 99.95, lastCheck: new Date() },
            threatDetection: { enabled: true, status: 'healthy', responseTime: 95, errorRate: 0.012, uptime: 99.97, lastCheck: new Date() },
            compliance: { enabled: true, status: 'healthy', responseTime: 70, errorRate: 0.008, uptime: 99.98, lastCheck: new Date() },
            encryption: { enabled: true, status: 'healthy', responseTime: 18, errorRate: 0.002, uptime: 99.98, lastCheck: new Date() }
          },
          metrics: {
            avgResponseTime: 92,
            p95ResponseTime: 195,
            p99ResponseTime: 380,
            throughput: 4100,
            errorRate: 0.022,
            uptime: 99.95,
            cpuUtilization: 62,
            memoryUtilization: 70,
            diskUtilization: 38,
            networkUtilization: 48,
            activeUsers: 18750,
            apiCalls: 1250000,
            dataTransfer: 420,
            revenue: 68000,
            computeCost: 4200,
            storageCost: 600,
            networkCost: 480,
            totalCost: 5280
          },
          compliance: {
            gdpr: false,
            ccpa: false,
            pipeda: false,
            lgpd: false,
            sox: true,
            hipaa: false,
            pciDss: true,
            fedramp: false,
            dataLocalization: true,
            crossBorderTransfer: false,
            encryptionAtRest: true,
            encryptionInTransit: true
          },
          dataResidency: true,
          endpoints: {
            api: 'https://api-ap-southeast-1.optionsflow.com',
            websocket: 'wss://ws-ap-southeast-1.optionsflow.com',
            cdn: 'https://cdn-ap-southeast-1.optionsflow.com',
            monitoring: 'https://monitor-ap-southeast-1.optionsflow.com',
            admin: 'https://admin-ap-southeast-1.optionsflow.com'
          },
          latency: { 'us-east-1': 180, 'us-west-2': 120, 'eu-west-1': 160 },
          createdAt: new Date('2023-03-20'),
          lastHealthCheck: new Date()
        }
      ]

      const mockEdgeLocations: EdgeLocation[] = [
        {
          id: 'edge-nyc',
          regionId: 'us-east-1',
          city: 'New York',
          country: 'United States',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          caching: true,
          computeAtEdge: true,
          realTimeAnalytics: true,
          hitRate: 92.5,
          avgLatency: 12,
          bandwidth: 850,
          status: 'active',
          lastSync: new Date()
        },
        {
          id: 'edge-lon',
          regionId: 'eu-west-1',
          city: 'London',
          country: 'United Kingdom',
          coordinates: { lat: 51.5074, lng: -0.1278 },
          caching: true,
          computeAtEdge: true,
          realTimeAnalytics: true,
          hitRate: 89.2,
          avgLatency: 15,
          bandwidth: 720,
          status: 'active',
          lastSync: new Date()
        },
        {
          id: 'edge-sgp',
          regionId: 'ap-southeast-1',
          city: 'Singapore',
          country: 'Singapore',
          coordinates: { lat: 1.3521, lng: 103.8198 },
          caching: true,
          computeAtEdge: true,
          realTimeAnalytics: true,
          hitRate: 87.8,
          avgLatency: 18,
          bandwidth: 650,
          status: 'active',
          lastSync: new Date()
        }
      ]

      setRegions(mockRegions)
      setEdgeLocations(mockEdgeLocations)
      
    } catch (error) {
      console.error('Error loading global infrastructure data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRegionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-500/30 text-green-400'
      case 'degraded': return 'border-yellow-500/30 text-yellow-400'
      case 'maintenance': return 'border-blue-500/30 text-blue-400'
      case 'offline': return 'border-red-500/30 text-red-400'
      default: return 'border-gray-500/30 text-gray-400'
    }
  }

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'unhealthy': return 'text-red-400'
      case 'maintenance': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <Globe className="w-12 h-12 text-primary" />
        </motion.div>
        <div className="ml-4">
          <h3 className="text-lg font-bold text-white">Loading Global Infrastructure...</h3>
          <p className="text-gray-400">Connecting to regions worldwide</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-white">Global Infrastructure</h2>
            <p className="text-gray-400">Multi-region deployment management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={loadGlobalInfrastructureData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-black/40 border border-primary/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="edge">Edge Network</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="disaster-recovery">DR & Backup</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Global Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-400">Global Users</p>
                      <p className="text-3xl font-bold text-white">
                        {regions.reduce((sum, r) => sum + r.metrics.activeUsers, 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Across {regions.length} regions
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-400">API Requests</p>
                      <p className="text-3xl font-bold text-white">
                        {(regions.reduce((sum, r) => sum + r.metrics.apiCalls, 0) / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {regions.reduce((sum, r) => sum + r.metrics.avgResponseTime, 0) / regions.length}ms avg
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-400">Global Uptime</p>
                      <p className="text-3xl font-bold text-white">
                        {(regions.reduce((sum, r) => sum + r.metrics.uptime, 0) / regions.length).toFixed(2)}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {edgeLocations.length} edge locations
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-black/40 backdrop-blur-sm border border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-400">Total Cost</p>
                      <p className="text-3xl font-bold text-white">
                        ${(regions.reduce((sum, r) => sum + r.metrics.totalCost, 0) / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Monthly operational
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* World Map Placeholder */}
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Global Infrastructure Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center border border-primary/10">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Interactive World Map</h3>
                  <p className="text-gray-400 mb-4">Real-time visualization of global infrastructure</p>
                  <div className="flex justify-center gap-4 text-sm">
                    {regions.map(region => (
                      <div key={region.id} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          region.status === 'active' ? 'bg-green-400' :
                          region.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <span className="text-gray-300">{region.location.city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regions Tab */}
        <TabsContent value="regions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {regions.map((region, i) => (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{region.name}</CardTitle>
                      <Badge variant="outline" className={getRegionStatusColor(region.status)}>
                        {region.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{region.location.country}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Active Users</p>
                        <p className="font-medium text-green-400">{region.metrics.activeUsers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">API Calls</p>
                        <p className="font-medium">{(region.metrics.apiCalls / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Response Time</p>
                        <p className="font-medium text-blue-400">{region.metrics.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Uptime</p>
                        <p className="font-medium text-primary">{region.metrics.uptime}%</p>
                      </div>
                    </div>

                    {/* Resource Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">CPU Usage</span>
                        <span>{region.metrics.cpuUtilization}%</span>
                      </div>
                      <Progress value={region.metrics.cpuUtilization} className="h-1" />
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Memory Usage</span>
                        <span>{region.metrics.memoryUtilization}%</span>
                      </div>
                      <Progress value={region.metrics.memoryUtilization} className="h-1" />
                    </div>

                    {/* Compliance Badges */}
                    <div className="flex flex-wrap gap-1">
                      {region.compliance.gdpr && <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">GDPR</Badge>}
                      {region.compliance.sox && <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">SOX</Badge>}
                      {region.compliance.pciDss && <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">PCI DSS</Badge>}
                      {region.compliance.fedramp && <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">FedRAMP</Badge>}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Monitor
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Edge Network Tab */}
        <TabsContent value="edge" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-primary" />
                  Edge Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {(edgeLocations.reduce((sum, loc) => sum + loc.hitRate, 0) / edgeLocations.length).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Global Cache Hit Rate</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-xl font-bold text-blue-400">
                        {(edgeLocations.reduce((sum, loc) => sum + loc.avgLatency, 0) / edgeLocations.length).toFixed(0)}ms
                      </div>
                      <div className="text-xs text-gray-400">Avg Latency</div>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="text-xl font-bold text-purple-400">
                        {edgeLocations.reduce((sum, loc) => sum + loc.bandwidth, 0).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-400">Total Bandwidth</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  Edge Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {edgeLocations.map((location, i) => (
                    <div key={location.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          location.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <div className="font-medium">{location.city}</div>
                          <div className="text-xs text-gray-400">{location.country}</div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-primary">{location.hitRate.toFixed(1)}%</div>
                        <div className="text-gray-400">{location.avgLatency}ms</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-primary/50 mx-auto mb-2" />
                    <p className="text-gray-400">Real-time performance chart</p>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      {regions.map(region => (
                        <div key={region.id} className="text-center">
                          <div className="text-primary font-bold">{region.metrics.avgResponseTime}ms</div>
                          <div className="text-gray-400 text-xs">{region.location.city}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regions.map(region => (
                    <div key={region.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{region.name}</span>
                        <span>{region.metrics.cpuUtilization}% CPU</span>
                      </div>
                      <Progress value={region.metrics.cpuUtilization} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Disaster Recovery Tab */}
        <TabsContent value="disaster-recovery" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/40 backdrop-blur-sm border border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Shield className="w-5 h-5" />
                  Backup Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">Healthy</div>
                    <div className="text-sm text-gray-400">All backups current</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">RTO</p>
                      <p className="font-medium text-blue-400">15 minutes</p>
                    </div>
                    <div>
                      <p className="text-gray-400">RPO</p>
                      <p className="font-medium text-blue-400">5 minutes</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last Backup</p>
                      <p className="font-medium">2 hours ago</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Next DR Test</p>
                      <p className="font-medium text-yellow-400">60 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Failover Regions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regions.map((region, i) => {
                    const backupRegion = regions.find(r => r.id !== region.id)
                    return (
                      <div key={region.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <div>
                          <div className="font-medium">{region.name}</div>
                          <div className="text-xs text-gray-400">Primary</div>
                        </div>
                        <div className="text-center">
                          <div className="text-primary">→</div>
                        </div>
                        <div>
                          <div className="font-medium">{backupRegion?.name}</div>
                          <div className="text-xs text-gray-400">Backup</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
