"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { 
  Shield,
  Database,
  HardDrive,
  Cloud,
  RefreshCw,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Download,
  Upload,
  Server,
  FileText,
  Zap,
  Lock,
  Unlock,
  Timer,
  Calendar,
  Users,
  Mail,
  Phone,
  Globe,
  Archive,
  Trash2,
  Eye,
  Edit3,
  Plus,
  MoreHorizontal,
  TrendingUp,
  Cpu,
  MemoryStick,
  Network,
  AlertCircle,
  Info,
  Layers,
  Copy,
  RotateCcw,
  Target
} from "lucide-react"

// Mock DR data - in production, this would come from the DR system
const mockDRData = {
  systemHealth: {
    status: 'healthy' as 'healthy' | 'degraded' | 'critical',
    uptime: 2592000, // 30 days in seconds
    backupStats: {
      totalBackups: 1247,
      successfulBackups: 1198,
      failedBackups: 49,
      totalDataBackedUpGB: 12847.5,
      averageBackupTime: 127.8,
      lastHealthCheck: new Date()
    },
    activeConfigurations: 12,
    scheduledJobs: 8,
    nextScheduledBackup: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  },
  backupConfigurations: [
    {
      id: 'backup_1',
      name: 'Critical Database Full Backup',
      description: 'Complete database backup with all user data and system tables',
      type: 'full',
      frequency: 'daily',
      schedule: { time: '02:00', timezone: 'UTC' },
      priority: 'critical',
      isActive: true,
      retention: { keepDaily: 7, keepWeekly: 4, keepMonthly: 12, keepYearly: 3 },
      encryption: { enabled: true, algorithm: 'AES-256-GCM' },
      compression: { enabled: true, algorithm: 'zstd', level: 6 },
      lastRun: '2024-01-15T02:00:00Z',
      nextRun: '2024-01-16T02:00:00Z',
      avgDuration: 142,
      successRate: 98.5,
      dataSize: 1250.5
    },
    {
      id: 'backup_2', 
      name: 'Incremental Database Backup',
      description: 'Fast incremental backups for minimal downtime',
      type: 'incremental',
      frequency: 'hourly',
      priority: 'high',
      isActive: true,
      retention: { keepDaily: 3, keepWeekly: 1, keepMonthly: 0, keepYearly: 0 },
      encryption: { enabled: true, algorithm: 'AES-256-GCM' },
      compression: { enabled: true, algorithm: 'zstd', level: 4 },
      lastRun: '2024-01-15T14:00:00Z',
      nextRun: '2024-01-15T15:00:00Z',
      avgDuration: 23,
      successRate: 99.2,
      dataSize: 85.2
    },
    {
      id: 'backup_3',
      name: 'Application Data Backup',
      description: 'User-uploaded files, logs, and application state',
      type: 'full',
      frequency: 'daily',
      schedule: { time: '03:00', timezone: 'UTC' },
      priority: 'high',
      isActive: true,
      retention: { keepDaily: 14, keepWeekly: 8, keepMonthly: 6, keepYearly: 1 },
      encryption: { enabled: true, algorithm: 'AES-256-GCM' },
      compression: { enabled: true, algorithm: 'gzip', level: 6 },
      lastRun: '2024-01-15T03:00:00Z',
      nextRun: '2024-01-16T03:00:00Z',
      avgDuration: 67,
      successRate: 96.8,
      dataSize: 890.3
    }
  ],
  recentJobs: [
    {
      id: 'job_1',
      configurationId: 'backup_1',
      configName: 'Critical Database Full Backup',
      type: 'full',
      status: 'completed',
      startTime: '2024-01-15T02:00:00Z',
      endTime: '2024-01-15T02:02:18Z',
      duration: 138,
      size: { originalMB: 1250.5, compressedMB: 892.3, ratio: 0.714 },
      verification: { passed: true, type: 'all' },
      metrics: { throughputMBps: 6.46, cpuUsagePercent: 35.2, memoryUsageMB: 1024 }
    },
    {
      id: 'job_2',
      configurationId: 'backup_2',
      configName: 'Incremental Database Backup',
      type: 'incremental',
      status: 'completed',
      startTime: '2024-01-15T14:00:00Z',
      endTime: '2024-01-15T14:00:25Z',
      duration: 25,
      size: { originalMB: 85.2, compressedMB: 67.8, ratio: 0.796 },
      verification: { passed: true, type: 'checksum' },
      metrics: { throughputMBps: 2.71, cpuUsagePercent: 18.5, memoryUsageMB: 256 }
    },
    {
      id: 'job_3',
      configurationId: 'backup_3',
      configName: 'Application Data Backup',
      type: 'full',
      status: 'failed',
      startTime: '2024-01-15T03:00:00Z',
      endTime: '2024-01-15T03:00:45Z',
      duration: 45,
      size: { originalMB: 0, compressedMB: 0, ratio: 0 },
      verification: { passed: false, type: 'none' },
      errors: [{ level: 'error', code: 'DISK_FULL', message: 'Insufficient disk space' }]
    }
  ],
  storageLocations: [
    {
      id: 'primary_s3',
      name: 'Primary S3 Storage',
      type: 's3',
      location: 's3://nexural-backups-primary',
      isPrimary: true,
      isOffsite: true,
      redundancy: 'geo_distributed',
      maxStorageGB: 10000,
      currentUsageGB: 2847.5,
      usagePercent: 28.5,
      status: 'healthy'
    },
    {
      id: 'secondary_local',
      name: 'Local Backup Storage',
      type: 'local',
      location: '/backup/local',
      isPrimary: false,
      isOffsite: false,
      redundancy: 'mirror',
      maxStorageGB: 5000,
      currentUsageGB: 1523.8,
      usagePercent: 30.5,
      status: 'healthy'
    },
    {
      id: 'archive_glacier',
      name: 'Archive Storage (Glacier)',
      type: 's3',
      location: 's3://nexural-archives',
      isPrimary: false,
      isOffsite: true,
      redundancy: 'geo_distributed',
      maxStorageGB: 50000,
      currentUsageGB: 8234.2,
      usagePercent: 16.5,
      status: 'healthy'
    }
  ]
}

export default function DisasterRecoveryAdmin() {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemHealth, setSystemHealth] = useState(mockDRData.systemHealth)
  const [isSystemRunning, setIsSystemRunning] = useState(true)
  const [selectedConfig, setSelectedConfig] = useState<string>('')

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`
    }
    return `${sizeInMB.toFixed(1)} MB`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'completed': return 'text-green-400 bg-green-600'
      case 'degraded': case 'running': return 'text-amber-400 bg-amber-600'
      case 'critical': case 'failed': return 'text-red-400 bg-red-600'
      case 'queued': return 'text-blue-400 bg-blue-600'
      default: return 'text-gray-400 bg-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-600'
      case 'high': return 'text-amber-400 bg-amber-600'
      case 'medium': return 'text-blue-400 bg-blue-600'
      case 'low': return 'text-gray-400 bg-gray-600'
      default: return 'text-gray-400 bg-gray-600'
    }
  }

  const handleStartSystem = async () => {
    setIsSystemRunning(true)
    // In production, this would call the actual DR system API
    console.log('Starting DR system...')
  }

  const handleStopSystem = async () => {
    setIsSystemRunning(false)
    // In production, this would call the actual DR system API
    console.log('Stopping DR system...')
  }

  const handleRunBackup = async (configId: string) => {
    console.log(`Running backup: ${configId}`)
    // In production, this would trigger the backup job
  }

  const handleTestRestore = async (jobId: string) => {
    console.log(`Testing restore: ${jobId}`)
    // In production, this would create a test restore job
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Disaster Recovery & Backups</h1>
          <p className="text-gray-400">Enterprise-grade backup and disaster recovery management</p>
        </div>
        <div className="flex gap-4">
          {isSystemRunning ? (
            <Button 
              onClick={handleStopSystem}
              className="bg-red-600 hover:bg-red-700"
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop System
            </Button>
          ) : (
            <Button 
              onClick={handleStartSystem}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start System
            </Button>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backups">Backup Configs</TabsTrigger>
          <TabsTrigger value="jobs">Backup Jobs</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="restore">Restore</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={`border ${systemHealth.status === 'healthy' ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'}`}>
              <CardContent className="p-6 text-center">
                <Shield className={`w-8 h-8 mx-auto mb-4 ${systemHealth.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`} />
                <div className="text-2xl font-bold text-white mb-2">
                  {systemHealth.status.toUpperCase()}
                </div>
                <div className="text-sm text-gray-400">System Status</div>
                <div className="text-xs text-green-400 mt-1">
                  {formatUptime(systemHealth.uptime)} uptime
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Database className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">
                  {systemHealth.backupStats.totalBackups}
                </div>
                <div className="text-sm text-gray-400">Total Backups</div>
                <div className="text-xs text-blue-400 mt-1">
                  {systemHealth.backupStats.successfulBackups} successful
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <HardDrive className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">
                  {systemHealth.backupStats.totalDataBackedUpGB.toLocaleString()} GB
                </div>
                <div className="text-sm text-gray-400">Data Backed Up</div>
                <div className="text-xs text-purple-400 mt-1">
                  Avg: {systemHealth.backupStats.averageBackupTime.toFixed(1)}s
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-amber-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">
                  {systemHealth.scheduledJobs}
                </div>
                <div className="text-sm text-gray-400">Scheduled Jobs</div>
                <div className="text-xs text-amber-400 mt-1">
                  {systemHealth.activeConfigurations} configurations
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Backup Jobs */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Recent Backup Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDRData.recentJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status).split(' ')[1]}`} />
                        <div>
                          <div className="font-semibold text-white text-sm">{job.configName}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(job.startTime).toLocaleString()} • {job.type}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <div className="text-xs text-gray-400 mt-1">
                          {job.duration}s • {formatFileSize(job.size.compressedMB)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Storage Overview */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-green-400" />
                  Storage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDRData.storageLocations.map((storage) => (
                    <div key={storage.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {storage.type === 's3' ? (
                            <Cloud className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Server className="w-4 h-4 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium text-white text-sm">{storage.name}</div>
                            <div className="text-xs text-gray-400">{storage.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white">
                            {storage.currentUsageGB.toLocaleString()} GB
                          </div>
                          <div className="text-xs text-gray-400">
                            {storage.usagePercent}% used
                          </div>
                        </div>
                      </div>
                      <Progress value={storage.usagePercent} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Scheduled Backup */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-400" />
                Next Scheduled Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">
                    Incremental Database Backup
                  </div>
                  <div className="text-gray-400">
                    Scheduled for {new Date(systemHealth.nextScheduledBackup).toLocaleString()}
                  </div>
                </div>
                <Button 
                  onClick={() => handleRunBackup('backup_2')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Configurations Tab */}
        <TabsContent value="backups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Backup Configurations</h3>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              New Configuration
            </Button>
          </div>

          <div className="space-y-4">
            {mockDRData.backupConfigurations.map((config) => (
              <Card key={config.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h4 className="text-lg font-semibold text-white">{config.name}</h4>
                        <Badge className={getPriorityColor(config.priority)}>
                          {config.priority}
                        </Badge>
                        <Badge className={config.isActive ? 'bg-green-600' : 'bg-gray-600'}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-400 mb-4">{config.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Type</div>
                          <div className="text-white font-medium">{config.type}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Frequency</div>
                          <div className="text-white font-medium">{config.frequency}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Success Rate</div>
                          <div className="text-green-400 font-medium">{config.successRate}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Avg Duration</div>
                          <div className="text-white font-medium">{config.avgDuration}s</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleRunBackup(config.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">
                        {config.encryption.enabled ? config.encryption.algorithm : 'No encryption'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400">
                        {config.compression.enabled ? `${config.compression.algorithm} L${config.compression.level}` : 'No compression'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-amber-400" />
                      <span className="text-gray-400">
                        Next: {new Date(config.nextRun).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Backup Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Backup Jobs</h3>
            <div className="flex gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <div className="space-y-4 p-6">
                {mockDRData.recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex items-start gap-6">
                      <div className={`w-4 h-4 rounded-full mt-1 ${getStatusColor(job.status).split(' ')[1]}`} />
                      
                      <div>
                        <h4 className="font-semibold text-white mb-1">{job.configName}</h4>
                        <div className="text-sm text-gray-400 mb-2">
                          Job ID: {job.id} • Type: {job.type}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6 text-sm">
                          <div>
                            <span className="text-gray-400">Started:</span>
                            <div className="text-white">{new Date(job.startTime).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Duration:</span>
                            <div className="text-white">{job.duration}s</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Size:</span>
                            <div className="text-white">
                              {formatFileSize(job.size.compressedMB)} 
                              {job.size.ratio > 0 && (
                                <span className="text-blue-400 ml-1">
                                  ({(job.size.ratio * 100).toFixed(1)}% compression)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {job.verification && (
                          <div className="flex items-center gap-2 mt-2">
                            {job.verification.passed ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-sm text-gray-400">
                              Verification: {job.verification.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        )}
                        
                        {job.errors && job.errors.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm text-red-400">
                              Error: {job.errors[0].message}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        {job.metrics && (
                          <div className="text-xs text-gray-400 mt-2 space-y-1">
                            <div className="flex items-center gap-1">
                              <Cpu className="w-3 h-3" />
                              {job.metrics.cpuUsagePercent.toFixed(1)}%
                            </div>
                            <div className="flex items-center gap-1">
                              <MemoryStick className="w-3 h-3" />
                              {job.metrics.memoryUsageMB}MB
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTestRestore(job.id)}
                          disabled={job.status !== 'completed'}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Storage Locations</h3>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Storage
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDRData.storageLocations.map((storage) => (
              <Card key={storage.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {storage.type === 's3' ? (
                        <Cloud className="w-6 h-6 text-blue-400" />
                      ) : (
                        <Server className="w-6 h-6 text-gray-400" />
                      )}
                      <div>
                        <h4 className="font-semibold text-white">{storage.name}</h4>
                        <div className="text-sm text-gray-400">{storage.type.toUpperCase()}</div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(storage.status)}>
                      {storage.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-400">Location</div>
                      <div className="text-white text-sm font-mono break-all">{storage.location}</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Usage</span>
                        <span className="text-white">
                          {storage.currentUsageGB.toLocaleString()} / {storage.maxStorageGB.toLocaleString()} GB
                        </span>
                      </div>
                      <Progress value={storage.usagePercent} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Type</span>
                      <span className="text-white">{storage.isPrimary ? 'Primary' : 'Secondary'}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Location</span>
                      <span className="text-white">{storage.isOffsite ? 'Offsite' : 'Local'}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Redundancy</span>
                      <span className="text-white">{storage.redundancy.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Restore Tab */}
        <TabsContent value="restore" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Restore Operations</h3>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Upload className="w-4 h-4 mr-2" />
              New Restore
            </Button>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Create Restore Job</CardTitle>
              <CardDescription>Restore from a completed backup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Source Backup</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select backup to restore" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {mockDRData.recentJobs
                        .filter(job => job.status === 'completed')
                        .map(job => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.configName} - {new Date(job.startTime).toLocaleDateString()}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Restore Type</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select restore type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="full_restore">Full Restore</SelectItem>
                      <SelectItem value="partial_restore">Partial Restore</SelectItem>
                      <SelectItem value="point_in_time">Point in Time</SelectItem>
                      <SelectItem value="verification_test">Verification Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Target Location</Label>
                <Input 
                  placeholder="/restore/target/location"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div>
                <Label>Reason for Restore</Label>
                <Textarea 
                  placeholder="Describe why this restore is needed..."
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Upload className="w-4 h-4 mr-2" />
                Create Restore Job
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <h3 className="text-2xl font-bold text-white">System Monitoring</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">98.7%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">127.8s</div>
                <div className="text-sm text-gray-400">Avg Backup Time</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <Network className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">6.4 MB/s</div>
                <div className="text-sm text-gray-400">Avg Throughput</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardContent className="p-6">
                <Layers className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">71.4%</div>
                <div className="text-sm text-gray-400">Compression Ratio</div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Real-time System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Live Monitoring Dashboard</h3>
                <p className="text-gray-400">Real-time system metrics and alerting would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h3 className="text-2xl font-bold text-white">DR System Settings</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Enable automatic backups</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Enable backup verification</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Send failure notifications</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Compress backups by default</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-white">Encrypt backups by default</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email Recipients</Label>
                  <Input 
                    placeholder="admin@nexural.com, ops@nexural.com"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div>
                  <Label>SMS Recipients</Label>
                  <Input 
                    placeholder="+1-555-0101, +1-555-0102"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div>
                  <Label>Webhook URL</Label>
                  <Input 
                    placeholder="https://alerts.company.com/webhook"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quiet Hours Start</Label>
                    <Input 
                      placeholder="22:00"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label>Quiet Hours End</Label>
                    <Input 
                      placeholder="06:00"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Disaster Recovery Plans</CardTitle>
              <CardDescription>Manage automated disaster recovery procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">DR Plan Management</h3>
                <p className="text-gray-400 mb-4">Configure automated disaster recovery procedures and failover policies</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create DR Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


