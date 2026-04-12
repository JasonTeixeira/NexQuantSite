"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Rocket, Server, Cpu, MemoryStick, HardDrive,
  Activity, Shield, Zap, Globe, Database,
  RefreshCw, CheckCircle, AlertTriangle, Clock,
  TrendingUp, TrendingDown, Eye, Settings,
  Play, Pause, StopCircle, RotateCcw,
  Users, Target, BarChart3, LineChart,
  Network, Wifi, Signal, Monitor,
  Upload, Download, Code, Package
} from "lucide-react"
import { toast } from "sonner"

interface DeploymentInstance {
  id: string
  botId: string
  botName: string
  region: string
  status: 'running' | 'starting' | 'stopping' | 'stopped' | 'error'
  version: string
  uptime: number
  cpu: number
  memory: number
  storage: number
  network: number
  activeUsers: number
  requestsPerSecond: number
  errorRate: number
  lastDeployment: string
  autoscaling: boolean
  scalingMetric: 'cpu' | 'memory' | 'requests' | 'users'
  minInstances: number
  maxInstances: number
  targetValue: number
}

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production'
  regions: string[]
  autoscaling: {
    enabled: boolean
    minInstances: number
    maxInstances: number
    targetCPU: number
    targetMemory: number
    scaleUpCooldown: number
    scaleDownCooldown: number
  }
  resources: {
    cpu: string
    memory: string
    storage: string
  }
  monitoring: {
    healthChecks: boolean
    alertsEnabled: boolean
    logRetention: number
    metricsRetention: number
  }
}

const MOCK_DEPLOYMENTS: DeploymentInstance[] = [
  {
    id: 'deploy_001',
    botId: 'quantum',
    botName: 'Quantum Momentum Engine',
    region: 'us-east-1',
    status: 'running',
    version: 'v3.2.1',
    uptime: 99.7,
    cpu: 34,
    memory: 42,
    storage: 28,
    network: 15.7,
    activeUsers: 847,
    requestsPerSecond: 247,
    errorRate: 0.2,
    lastDeployment: '2024-12-01T14:20:00Z',
    autoscaling: true,
    scalingMetric: 'cpu',
    minInstances: 2,
    maxInstances: 10,
    targetValue: 70
  },
  {
    id: 'deploy_002',
    botId: 'execution',
    botName: 'Execution Precision Protocol',
    region: 'us-west-2',
    status: 'running',
    version: 'v4.1.0',
    uptime: 99.9,
    cpu: 45,
    memory: 52,
    storage: 31,
    network: 28.4,
    activeUsers: 1247,
    requestsPerSecond: 892,
    errorRate: 0.1,
    lastDeployment: '2024-12-05T09:45:00Z',
    autoscaling: true,
    scalingMetric: 'requests',
    minInstances: 3,
    maxInstances: 15,
    targetValue: 1000
  },
  {
    id: 'deploy_003',
    botId: 'oracle',
    botName: 'Oracle Volatility Scanner',
    region: 'eu-west-1',
    status: 'error',
    version: 'v3.0.7',
    uptime: 97.8,
    cpu: 67,
    memory: 71,
    storage: 45,
    network: 12.3,
    activeUsers: 423,
    requestsPerSecond: 156,
    errorRate: 2.1,
    lastDeployment: '2024-11-30T13:10:00Z',
    autoscaling: false,
    scalingMetric: 'cpu',
    minInstances: 1,
    maxInstances: 5,
    targetValue: 60
  }
]

const DEFAULT_CONFIG: DeploymentConfig = {
  environment: 'production',
  regions: ['us-east-1', 'us-west-2', 'eu-west-1'],
  autoscaling: {
    enabled: true,
    minInstances: 2,
    maxInstances: 10,
    targetCPU: 70,
    targetMemory: 80,
    scaleUpCooldown: 300,
    scaleDownCooldown: 600
  },
  resources: {
    cpu: '2 vCPUs',
    memory: '4 GB',
    storage: '20 GB SSD'
  },
  monitoring: {
    healthChecks: true,
    alertsEnabled: true,
    logRetention: 30,
    metricsRetention: 90
  }
}

export default function BotDeploymentAutomation() {
  const [deployments, setDeployments] = useState<DeploymentInstance[]>(MOCK_DEPLOYMENTS)
  const [config, setConfig] = useState<DeploymentConfig>(DEFAULT_CONFIG)
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentInstance | null>(null)
  const [isScaling, setIsScaling] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDeployments(prev => prev.map(deployment => ({
        ...deployment,
        cpu: Math.max(10, Math.min(90, deployment.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(15, Math.min(95, deployment.memory + (Math.random() - 0.5) * 8)),
        requestsPerSecond: Math.max(50, deployment.requestsPerSecond + Math.floor((Math.random() - 0.5) * 50)),
        network: Math.max(5, deployment.network + (Math.random() - 0.5) * 5)
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-600 text-green-100'
      case 'starting': return 'bg-blue-600 text-blue-100'
      case 'stopping': return 'bg-yellow-600 text-yellow-100'
      case 'stopped': return 'bg-gray-600 text-gray-100'
      case 'error': return 'bg-red-600 text-red-100'
      default: return 'bg-gray-600 text-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4" />
      case 'starting': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'stopping': return <StopCircle className="w-4 h-4" />
      case 'stopped': return <Pause className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      default: return <Server className="w-4 h-4" />
    }
  }

  const handleScaleBot = async (deploymentId: string, action: 'up' | 'down') => {
    setIsScaling(true)
    // Simulate scaling operation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setDeployments(prev => prev.map(deployment => 
      deployment.id === deploymentId 
        ? { 
            ...deployment, 
            status: 'running',
            activeUsers: action === 'up' ? deployment.activeUsers + 100 : Math.max(0, deployment.activeUsers - 100),
            lastDeployment: new Date().toISOString()
          }
        : deployment
    ))
    
    setIsScaling(false)
    toast.success(`Bot scaled ${action} successfully`)
  }

  const handleStatusChange = async (deploymentId: string, newStatus: 'running' | 'stopped') => {
    setDeployments(prev => prev.map(deployment => 
      deployment.id === deploymentId 
        ? { 
            ...deployment, 
            status: newStatus === 'running' ? 'starting' : 'stopping'
          }
        : deployment
    ))

    // Simulate status change
    setTimeout(() => {
      setDeployments(prev => prev.map(deployment => 
        deployment.id === deploymentId 
          ? { 
              ...deployment, 
              status: newStatus,
              lastDeployment: new Date().toISOString()
            }
          : deployment
      ))
      toast.success(`Bot ${newStatus === 'running' ? 'started' : 'stopped'} successfully`)
    }, 3000)
  }

  const totalActiveInstances = deployments.filter(d => d.status === 'running').length
  const totalUsers = deployments.reduce((sum, d) => sum + d.activeUsers, 0)
  const avgCPU = deployments.reduce((sum, d) => sum + d.cpu, 0) / deployments.length
  const avgMemory = deployments.reduce((sum, d) => sum + d.memory, 0) / deployments.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Rocket className="w-6 h-6 mr-2 text-green-400" />
            Bot Deployment Automation
          </h2>
          <p className="text-gray-400">Manage automated deployment, scaling, and infrastructure</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setIsScaling(true)}
            disabled={isScaling}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isScaling ? 'animate-spin' : ''}`} />
            Auto-Scale All
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Deploy New Bot
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Active Instances</p>
                <p className="text-3xl font-bold text-white">{totalActiveInstances}</p>
                <p className="text-green-400 text-xs">of {deployments.length} total</p>
              </div>
              <Server className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-white">{totalUsers.toLocaleString()}</p>
                <p className="text-blue-400 text-xs">Across all bots</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Avg CPU Usage</p>
                <p className="text-3xl font-bold text-white">{avgCPU.toFixed(0)}%</p>
                <p className={`text-xs ${avgCPU <= 60 ? 'text-green-400' : avgCPU <= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {avgCPU <= 60 ? 'Optimal' : avgCPU <= 80 ? 'Good' : 'High'}
                </p>
              </div>
              <Cpu className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Avg Memory</p>
                <p className="text-3xl font-bold text-white">{avgMemory.toFixed(0)}%</p>
                <p className={`text-xs ${avgMemory <= 60 ? 'text-green-400' : avgMemory <= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {avgMemory <= 60 ? 'Optimal' : avgMemory <= 80 ? 'Good' : 'High'}
                </p>
              </div>
              <MemoryStick className="w-10 h-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Instances */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-blue-400" />
            Active Deployment Instances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <motion.div
                key={deployment.id}
                layout
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                      <Server className="w-6 h-6 text-blue-400" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-white font-semibold">{deployment.botName}</h3>
                        <Badge className={getStatusColor(deployment.status)}>
                          {getStatusIcon(deployment.status)}
                          <span className="ml-1">{deployment.status}</span>
                        </Badge>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {deployment.version}
                        </Badge>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {deployment.region} • {deployment.activeUsers.toLocaleString()} active users • {deployment.requestsPerSecond} req/s
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-4">
                      <div className="text-white font-semibold">Uptime: {deployment.uptime}%</div>
                      <div className="text-gray-400 text-sm">Last deploy: {new Date(deployment.lastDeployment).toLocaleDateString()}</div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(deployment.id, deployment.status === 'running' ? 'stopped' : 'running')}
                        className={deployment.status === 'running' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                      >
                        {deployment.status === 'running' ? <StopCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDeployment(deployment)}
                        className="border-gray-700"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Resource Usage */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 flex items-center">
                        <Cpu className="w-3 h-3 mr-1" />
                        CPU
                      </span>
                      <span className="text-white">{deployment.cpu}%</span>
                    </div>
                    <Progress value={deployment.cpu} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 flex items-center">
                        <MemoryStick className="w-3 h-3 mr-1" />
                        Memory
                      </span>
                      <span className="text-white">{deployment.memory}%</span>
                    </div>
                    <Progress value={deployment.memory} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 flex items-center">
                        <HardDrive className="w-3 h-3 mr-1" />
                        Storage
                      </span>
                      <span className="text-white">{deployment.storage}%</span>
                    </div>
                    <Progress value={deployment.storage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 flex items-center">
                        <Network className="w-3 h-3 mr-1" />
                        Network
                      </span>
                      <span className="text-white">{deployment.network} MB/s</span>
                    </div>
                    <Progress value={Math.min(100, deployment.network * 3)} className="h-2" />
                  </div>
                </div>

                {/* Autoscaling Info */}
                {deployment.autoscaling && (
                  <div className="mt-4 bg-blue-900/20 p-3 rounded-lg border border-blue-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-200 text-sm">Autoscaling Enabled</span>
                      </div>
                      <div className="text-blue-300 text-sm">
                        {deployment.minInstances}-{deployment.maxInstances} instances | Target: {deployment.targetValue}
                        {deployment.scalingMetric === 'cpu' ? '% CPU' : 
                         deployment.scalingMetric === 'memory' ? '% Memory' :
                         deployment.scalingMetric === 'requests' ? ' req/s' : ' users'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Status */}
                {deployment.status === 'error' && (
                  <div className="mt-4 bg-red-900/20 p-3 rounded-lg border border-red-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-red-200 text-sm">High resource usage detected</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleScaleBot(deployment.id, 'up')}
                          disabled={isScaling}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Scale Up
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-gray-700"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-400" />
              Global Deployment Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Environment</Label>
              <Select value={config.environment} onValueChange={(value) => setConfig(prev => ({ ...prev, environment: value as any }))}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Default Resource Allocation</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <Label className="text-gray-400 text-sm">CPU</Label>
                  <Input value={config.resources.cpu} className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Memory</Label>
                  <Input value={config.resources.memory} className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Storage</Label>
                  <Input value={config.resources.storage} className="bg-gray-800 border-gray-700 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Enable Autoscaling</Label>
                  <p className="text-gray-400 text-sm">Automatically scale based on demand</p>
                </div>
                <Switch 
                  checked={config.autoscaling.enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev, 
                    autoscaling: { ...prev.autoscaling, enabled: checked } 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Health Monitoring</Label>
                  <p className="text-gray-400 text-sm">Enable automated health checks</p>
                </div>
                <Switch 
                  checked={config.monitoring.healthChecks}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev, 
                    monitoring: { ...prev.monitoring, healthChecks: checked } 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Alert Notifications</Label>
                  <p className="text-gray-400 text-sm">Send alerts for issues</p>
                </div>
                <Switch 
                  checked={config.monitoring.alertsEnabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev, 
                    monitoring: { ...prev.monitoring, alertsEnabled: checked } 
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Autoscaling Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Target CPU Utilization (%)</Label>
              <Slider 
                value={[config.autoscaling.targetCPU]} 
                onValueChange={([value]) => setConfig(prev => ({ 
                  ...prev, 
                  autoscaling: { ...prev.autoscaling, targetCPU: value } 
                }))}
                max={90} 
                min={30} 
                step={5} 
                className="mt-2" 
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>30%</span>
                <span>Current: {config.autoscaling.targetCPU}%</span>
                <span>90%</span>
              </div>
            </div>

            <div>
              <Label className="text-white">Target Memory Utilization (%)</Label>
              <Slider 
                value={[config.autoscaling.targetMemory]} 
                onValueChange={([value]) => setConfig(prev => ({ 
                  ...prev, 
                  autoscaling: { ...prev.autoscaling, targetMemory: value } 
                }))}
                max={90} 
                min={40} 
                step={5} 
                className="mt-2" 
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>40%</span>
                <span>Current: {config.autoscaling.targetMemory}%</span>
                <span>90%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Min Instances</Label>
                <Input 
                  type="number"
                  value={config.autoscaling.minInstances}
                  min="1"
                  max="50"
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    autoscaling: { ...prev.autoscaling, minInstances: parseInt(e.target.value) } 
                  }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white">Max Instances</Label>
                <Input 
                  type="number"
                  value={config.autoscaling.maxInstances}
                  min="2"
                  max="100"
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    autoscaling: { ...prev.autoscaling, maxInstances: parseInt(e.target.value) } 
                  }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Scale Up Cooldown (seconds)</Label>
                <Input 
                  type="number"
                  value={config.autoscaling.scaleUpCooldown}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    autoscaling: { ...prev.autoscaling, scaleUpCooldown: parseInt(e.target.value) } 
                  }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-white">Scale Down Cooldown (seconds)</Label>
                <Input 
                  type="number"
                  value={config.autoscaling.scaleDownCooldown}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    autoscaling: { ...prev.autoscaling, scaleDownCooldown: parseInt(e.target.value) } 
                  }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment History & Analytics */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
            Deployment Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <LineChart className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Deployment Analytics Dashboard</h3>
              <p className="text-sm mb-4">Real-time deployment performance, scaling events, and resource optimization insights</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong className="text-white">Performance Tracking</strong>
                  <br />Instance performance over time
                </div>
                <div>
                  <strong className="text-white">Scaling Events</strong>
                  <br />Auto-scale triggers and outcomes
                </div>
                <div>
                  <strong className="text-white">Cost Optimization</strong>
                  <br />Resource usage and cost analysis
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Configuration Dialog */}
      <Dialog open={!!selectedDeployment} onOpenChange={() => setSelectedDeployment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-green-400" />
              Configure Deployment: {selectedDeployment?.botName}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage deployment settings, resources, and autoscaling configuration
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeployment && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Instance ID</Label>
                    <div className="text-white font-mono text-sm">{selectedDeployment.id}</div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Region</Label>
                    <div className="text-white">{selectedDeployment.region}</div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Version</Label>
                    <div className="text-white">{selectedDeployment.version}</div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Status</Label>
                    <Badge className={getStatusColor(selectedDeployment.status)}>
                      {selectedDeployment.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Resource Configuration */}
              <div>
                <Label className="text-white text-lg">Resource Limits</Label>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <Label className="text-gray-400">CPU Limit (%)</Label>
                    <Slider defaultValue={[80]} max={100} min={20} step={5} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-gray-400">Memory Limit (%)</Label>
                    <Slider defaultValue={[85]} max={100} min={30} step={5} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-gray-400">Network Limit (MB/s)</Label>
                    <Slider defaultValue={[50]} max={100} min={10} step={5} className="mt-2" />
                  </div>
                </div>
              </div>

              {/* Autoscaling Configuration */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-white text-lg">Autoscaling Configuration</Label>
                  <Switch 
                    checked={selectedDeployment.autoscaling}
                    onCheckedChange={(checked) => {
                      setDeployments(prev => prev.map(d => 
                        d.id === selectedDeployment.id ? { ...d, autoscaling: checked } : d
                      ))
                    }}
                  />
                </div>

                {selectedDeployment.autoscaling && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Scaling Metric</Label>
                      <Select 
                        value={selectedDeployment.scalingMetric} 
                        onValueChange={(value) => {
                          setDeployments(prev => prev.map(d => 
                            d.id === selectedDeployment.id ? { ...d, scalingMetric: value as any } : d
                          ))
                        }}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="cpu">CPU Usage</SelectItem>
                          <SelectItem value="memory">Memory Usage</SelectItem>
                          <SelectItem value="requests">Requests/Second</SelectItem>
                          <SelectItem value="users">Active Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Target Value</Label>
                      <Input 
                        type="number"
                        value={selectedDeployment.targetValue}
                        onChange={(e) => {
                          setDeployments(prev => prev.map(d => 
                            d.id === selectedDeployment.id ? { ...d, targetValue: parseInt(e.target.value) } : d
                          ))
                        }}
                        className="bg-gray-800 border-gray-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Min Instances</Label>
                      <Input 
                        type="number"
                        value={selectedDeployment.minInstances}
                        onChange={(e) => {
                          setDeployments(prev => prev.map(d => 
                            d.id === selectedDeployment.id ? { ...d, minInstances: parseInt(e.target.value) } : d
                          ))
                        }}
                        className="bg-gray-800 border-gray-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Max Instances</Label>
                      <Input 
                        type="number"
                        value={selectedDeployment.maxInstances}
                        onChange={(e) => {
                          setDeployments(prev => prev.map(d => 
                            d.id === selectedDeployment.id ? { ...d, maxInstances: parseInt(e.target.value) } : d
                          ))
                        }}
                        className="bg-gray-800 border-gray-700 text-white mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setSelectedDeployment(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    toast.success('Deployment configuration saved')
                    setSelectedDeployment(null)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
