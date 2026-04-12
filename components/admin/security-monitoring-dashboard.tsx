"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from "recharts"
import {
  Shield, AlertTriangle, Eye, Ban, UserX, Activity, Globe, Zap,
  Search, Filter, Download, RefreshCw, Settings, Bell, Lock,
  ShieldAlert, TrendingUp, TrendingDown, Clock, MapPin, Smartphone,
  AlertCircle, CheckCircle, XCircle, Info, Target
} from "lucide-react"
import { toast } from "sonner"

interface SecurityIncident {
  id: string
  type: "fraud" | "breach" | "ddos" | "suspicious_login" | "malware" | "phishing"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  status: "open" | "investigating" | "resolved" | "false_positive"
  timestamp: string
  affectedUsers: number
  source: string
  location?: string
  riskScore: number
  aiConfidence: number
}

interface ThreatAlert {
  id: string
  type: "real_time" | "pattern_detected" | "anomaly" | "ml_prediction"
  message: string
  severity: "low" | "medium" | "high" | "critical"
  timestamp: string
  actionTaken: boolean
  details?: Record<string, any>
}

interface UserRiskProfile {
  userId: string
  username: string
  email: string
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "critical"
  indicators: string[]
  lastActivity: string
  location: string
  deviceInfo: string
  flaggedActions: number
}

interface SecurityMetrics {
  threatsPrevented: number
  incidentsResolved: number
  riskScore: number
  uptime: number
  monitoringStatus: "active" | "warning" | "critical"
}

const SEVERITY_COLORS = {
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", 
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30"
}

const STATUS_COLORS = {
  open: "bg-red-500/20 text-red-400",
  investigating: "bg-yellow-500/20 text-yellow-400",
  resolved: "bg-green-500/20 text-green-400", 
  false_positive: "bg-gray-500/20 text-gray-400"
}

export default function SecurityMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null)
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false)

  // State for security data
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([])
  const [riskProfiles, setRiskProfiles] = useState<UserRiskProfile[]>([])
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    threatsPrevented: 0,
    incidentsResolved: 0,
    riskScore: 0,
    uptime: 0,
    monitoringStatus: "active"
  })

  useEffect(() => {
    loadSecurityData()
  }, [selectedTimeframe])

  const loadSecurityData = async () => {
    setIsLoading(true)
    try {
      // Mock security incidents
      const mockIncidents: SecurityIncident[] = [
        {
          id: "1",
          type: "suspicious_login",
          severity: "high",
          title: "Multiple Failed Login Attempts",
          description: "User attempting to login from multiple IPs in different countries",
          status: "investigating",
          timestamp: "2024-01-20T15:30:00Z",
          affectedUsers: 1,
          source: "185.220.100.240",
          location: "Russia",
          riskScore: 85,
          aiConfidence: 92
        },
        {
          id: "2", 
          type: "fraud",
          severity: "critical",
          title: "Potential Credit Card Fraud",
          description: "Suspicious payment patterns detected from compromised cards",
          status: "open",
          timestamp: "2024-01-20T14:15:00Z",
          affectedUsers: 3,
          source: "Payment Gateway",
          riskScore: 95,
          aiConfidence: 96
        },
        {
          id: "3",
          type: "ddos",
          severity: "medium", 
          title: "DDoS Attack Mitigated",
          description: "Automated DDoS protection successfully blocked attack",
          status: "resolved",
          timestamp: "2024-01-20T12:45:00Z",
          affectedUsers: 0,
          source: "Multiple Sources",
          riskScore: 65,
          aiConfidence: 89
        },
        {
          id: "4",
          type: "breach", 
          severity: "low",
          title: "API Rate Limit Exceeded",
          description: "Potential scraping attempt detected and blocked",
          status: "resolved",
          timestamp: "2024-01-20T11:20:00Z",
          affectedUsers: 0,
          source: "54.230.100.15",
          location: "Unknown",
          riskScore: 35,
          aiConfidence: 76
        }
      ]

      // Mock threat alerts  
      const mockAlerts: ThreatAlert[] = [
        {
          id: "1",
          type: "real_time",
          message: "Anomalous trading pattern detected - user making unusually large trades",
          severity: "medium",
          timestamp: "2024-01-20T16:45:00Z",
          actionTaken: false
        },
        {
          id: "2",
          type: "ml_prediction", 
          message: "ML model predicts high fraud probability for recent transactions",
          severity: "high",
          timestamp: "2024-01-20T16:30:00Z",
          actionTaken: true
        },
        {
          id: "3",
          type: "pattern_detected",
          message: "Coordinated account creation from similar IPs detected",
          severity: "medium",
          timestamp: "2024-01-20T16:15:00Z", 
          actionTaken: true
        }
      ]

      // Mock user risk profiles
      const mockRiskProfiles: UserRiskProfile[] = [
        {
          userId: "user_001",
          username: "suspicious_trader",
          email: "user@tempmail.com",
          riskScore: 92,
          riskLevel: "critical",
          indicators: ["Multiple failed logins", "VPN usage", "Unusual trading patterns"],
          lastActivity: "2024-01-20T15:30:00Z",
          location: "Russia",
          deviceInfo: "Mobile - Android",
          flaggedActions: 8
        },
        {
          userId: "user_002", 
          username: "high_volume_user",
          email: "trader@example.com",
          riskScore: 78,
          riskLevel: "high",
          indicators: ["High volume trades", "Off-hours activity", "API abuse"],
          lastActivity: "2024-01-20T14:22:00Z",
          location: "Nigeria",
          deviceInfo: "Desktop - Windows",
          flaggedActions: 3
        },
        {
          userId: "user_003",
          username: "pattern_user",
          email: "test@domain.co",
          riskScore: 65,
          riskLevel: "medium", 
          indicators: ["Repetitive behavior", "Similar to flagged accounts"],
          lastActivity: "2024-01-20T13:15:00Z",
          location: "Romania",
          deviceInfo: "Mobile - iOS",
          flaggedActions: 2
        }
      ]

      // Mock security metrics
      const mockMetrics: SecurityMetrics = {
        threatsPrevented: 127,
        incidentsResolved: 89,
        riskScore: 23, // Lower is better
        uptime: 99.97,
        monitoringStatus: "active"
      }

      setIncidents(mockIncidents)
      setThreatAlerts(mockAlerts)
      setRiskProfiles(mockRiskProfiles) 
      setSecurityMetrics(mockMetrics)

      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading security data:", error)
      toast.error("Failed to load security data")
      setIsLoading(false)
    }
  }

  const securityTrendData = [
    { time: "00:00", threats: 12, incidents: 2, resolved: 1 },
    { time: "04:00", threats: 8, incidents: 1, resolved: 2 },
    { time: "08:00", threats: 15, incidents: 3, resolved: 2 },
    { time: "12:00", threats: 23, incidents: 4, resolved: 3 },
    { time: "16:00", threats: 18, incidents: 2, resolved: 4 },
    { time: "20:00", threats: 14, incidents: 1, resolved: 1 }
  ]

  const riskDistributionData = [
    { name: "Low Risk", value: 65, color: "#10B981" },
    { name: "Medium Risk", value: 22, color: "#F59E0B" }, 
    { name: "High Risk", value: 10, color: "#F97316" },
    { name: "Critical Risk", value: 3, color: "#EF4444" }
  ]

  const handleIncidentAction = (incidentId: string, action: "resolve" | "investigate" | "false_positive") => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status: action === "resolve" ? "resolved" : action === "investigate" ? "investigating" : "false_positive" }
        : incident
    ))
    toast.success(`Incident ${action === "resolve" ? "resolved" : action === "investigate" ? "marked for investigation" : "marked as false positive"}`)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="w-4 h-4" />
      case "high": return <AlertTriangle className="w-4 h-4" />
      case "medium": return <Info className="w-4 h-4" />
      case "low": return <CheckCircle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading security monitoring...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-400" />
            Security Monitoring
          </h1>
          <p className="text-gray-400 mt-1">
            Advanced threat detection and fraud prevention
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="border-gray-600 text-gray-400">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadSecurityData} className="border-gray-600 text-gray-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Threats Prevented</p>
                <p className="text-2xl font-bold text-white">{securityMetrics.threatsPrevented}</p>
                <p className="text-green-400 text-xs">Last 24h</p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Incidents Resolved</p>
                <p className="text-2xl font-bold text-white">{securityMetrics.incidentsResolved}</p>
                <p className="text-blue-400 text-xs">This week</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Risk Score</p>
                <p className="text-2xl font-bold text-white">{securityMetrics.riskScore}/100</p>
                <p className="text-yellow-400 text-xs">Lower is better</p>
              </div>
              <Target className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">System Uptime</p>
                <p className="text-2xl font-bold text-white">{securityMetrics.uptime}%</p>
                <p className="text-purple-400 text-xs">99.9% target</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Security Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="incidents" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Incidents
          </TabsTrigger>
          <TabsTrigger 
            value="threats" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Threat Alerts
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            Risk Profiles
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Trends Chart */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Security Activity Trends</CardTitle>
                <CardDescription>
                  Threats, incidents, and resolutions over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <LineChart data={securityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Line type="monotone" dataKey="threats" stroke="#EF4444" strokeWidth={2} name="Threats" />
                    <Line type="monotone" dataKey="incidents" stroke="#F59E0B" strokeWidth={2} name="Incidents" />
                    <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} name="Resolved" />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Risk Distribution</CardTitle>
                <CardDescription>
                  Current user risk level breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        color: '#F9FAFB'
                      }} 
                    />
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {riskDistributionData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-300 text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Security Events</CardTitle>
              <CardDescription>
                Latest security incidents and threat detections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...incidents.slice(0, 3), ...threatAlerts.slice(0, 2)].map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      {'severity' in event ? getSeverityIcon(event.severity) : <Bell className="w-4 h-4 text-blue-400" />}
                      <div>
                        <p className="text-white text-sm font-medium">
                          {'title' in event ? event.title : event.message}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date((event as any).timestamp || Date.now()).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={SEVERITY_COLORS[(event as any).severity] || "bg-blue-500/20 text-blue-400"}>
                      {(event as any).severity || 'medium'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          <div className="flex items-center space-x-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Incidents</CardTitle>
              <CardDescription>
                Monitor and manage security incidents and breaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Incident</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Severity</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Risk Score</TableHead>
                    <TableHead className="text-gray-300">Time</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{incident.title}</p>
                          <p className="text-gray-400 text-sm">{incident.source}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                          {incident.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${SEVERITY_COLORS[incident.severity]} flex items-center w-fit`}>
                          {getSeverityIcon(incident.severity)}
                          <span className="ml-1 capitalize">{incident.severity}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[incident.status]}>
                          {incident.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${incident.riskScore >= 80 ? 'text-red-400' : incident.riskScore >= 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {incident.riskScore}
                          </span>
                          <div className="w-12">
                            <Progress 
                              value={incident.riskScore} 
                              className={`h-2 ${incident.riskScore >= 80 ? 'bg-red-900' : incident.riskScore >= 60 ? 'bg-yellow-900' : 'bg-green-900'}`}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white text-sm">
                          {new Date(incident.timestamp).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedIncident(incident)
                              setIsIncidentDialogOpen(true)
                            }}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {incident.status === "open" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleIncidentAction(incident.id, "resolve")}
                              className="border-green-600 text-green-400 hover:bg-green-600/10"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Alerts Tab */}
        <TabsContent value="threats" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Real-time Threat Alerts</CardTitle>
              <CardDescription>
                AI-powered threat detection and anomaly alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {threatAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${SEVERITY_COLORS[alert.severity]}`}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{alert.message}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-gray-400 text-sm">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                            {alert.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.actionTaken && (
                        <Badge className="bg-green-500/20 text-green-400">
                          Action Taken
                        </Badge>
                      )}
                      <Badge className={SEVERITY_COLORS[alert.severity]}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Profiles Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">High-Risk User Profiles</CardTitle>
              <CardDescription>
                Users identified as potential security risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Risk Level</TableHead>
                    <TableHead className="text-gray-300">Risk Score</TableHead>
                    <TableHead className="text-gray-300">Location</TableHead>
                    <TableHead className="text-gray-300">Flagged Actions</TableHead>
                    <TableHead className="text-gray-300">Last Activity</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskProfiles.map((profile) => (
                    <TableRow key={profile.userId} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{profile.username}</p>
                          <p className="text-gray-400 text-sm">{profile.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={SEVERITY_COLORS[profile.riskLevel as keyof typeof SEVERITY_COLORS]}>
                          {profile.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${profile.riskScore >= 80 ? 'text-red-400' : profile.riskScore >= 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {profile.riskScore}
                          </span>
                          <div className="w-12">
                            <Progress value={profile.riskScore} className="h-2" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-white text-sm">{profile.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-500/20 text-orange-400">
                          {profile.flaggedActions}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-white text-sm">
                          {new Date(profile.lastActivity).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                          >
                            <Ban className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Incident Details Dialog */}
      <Dialog open={isIncidentDialogOpen} onOpenChange={setIsIncidentDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedIncident?.title}</DialogTitle>
            <DialogDescription>
              Incident details and analysis
            </DialogDescription>
          </DialogHeader>
          
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Type</Label>
                  <p className="text-white capitalize">{selectedIncident.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Severity</Label>
                  <Badge className={SEVERITY_COLORS[selectedIncident.severity]}>
                    {selectedIncident.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-300">Risk Score</Label>
                  <p className="text-white font-bold">{selectedIncident.riskScore}/100</p>
                </div>
                <div>
                  <Label className="text-gray-300">AI Confidence</Label>
                  <p className="text-white">{selectedIncident.aiConfidence}%</p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300">Description</Label>
                <p className="text-white mt-1">{selectedIncident.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Source</Label>
                  <p className="text-white">{selectedIncident.source}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Location</Label>
                  <p className="text-white">{selectedIncident.location || 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsIncidentDialogOpen(false)}
              className="border-gray-600 text-gray-400"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                if (selectedIncident) {
                  handleIncidentAction(selectedIncident.id, "resolve")
                  setIsIncidentDialogOpen(false)
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Resolve Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
