"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Server,
  Database,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
} from "lucide-react"
import { toast } from "sonner"

export default function BackupRecoveryDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)

  const metrics = {
    totalBackups: 1234,
    successfulBackups: 1198,
    failedBackups: 36,
    totalStorage: "2.4 TB",
    compressionRatio: "65%",
    averageBackupTime: "45 min",
  }

  const handleRunBackup = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Backup job started successfully")
    } catch (error) {
      console.error("Failed to start backup:", error)
      toast.error("Failed to start backup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              AUTOMATED <span className="text-primary">BACKUP & RECOVERY</span>
            </h1>
            <p className="text-gray-400">
              Comprehensive backup solutions with enterprise-grade disaster recovery
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRunBackup}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Running..." : "Run Backup"}
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                  <p className="text-sm font-medium text-gray-400">Total Backups</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalBackups}</p>
                    </div>
                <Database className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                  <p className="text-sm font-medium text-gray-400">Successful</p>
                  <p className="text-2xl font-bold text-green-400">{metrics.successfulBackups}</p>
                    </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                  <p className="text-sm font-medium text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{metrics.failedBackups}</p>
                    </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                  <p className="text-sm font-medium text-gray-400">Total Storage</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalStorage}</p>
                    </div>
                <Server className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                  <p className="text-sm font-medium text-gray-400">Compression</p>
                  <p className="text-2xl font-bold text-white">{metrics.compressionRatio}</p>
                    </div>
                <Activity className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                  <p className="text-sm font-medium text-gray-400">Avg Time</p>
                  <p className="text-2xl font-bold text-white">{metrics.averageBackupTime}</p>
                    </div>
                <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
          </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/40">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="jobs">Backup Jobs</TabsTrigger>
            <TabsTrigger value="recovery">Recovery</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                <CardTitle className="text-white">System Status</CardTitle>
                <CardDescription>Current backup system health and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Backup Service</span>
                    <Badge className="bg-green-500/20 text-green-400">Running</Badge>
                        </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Storage Usage</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={75} className="w-32" />
                      <span className="text-sm text-gray-400">75%</span>
                          </div>
                        </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Last Backup</span>
                    <span className="text-gray-400">2 hours ago</span>
                  </div>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="configurations">
              <Card className="bg-black/40 border-primary/30">
                <CardHeader>
                <CardTitle className="text-white">Backup Configurations</CardTitle>
                <CardDescription>Manage your backup schedules and settings</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="text-center py-8">
                  <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Configurations</h3>
                  <p className="text-gray-400 mb-4">Create your first backup configuration to get started.</p>
                  <Button className="bg-primary">Create Configuration</Button>
                    </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="jobs">
                <Card className="bg-black/40 border-primary/30">
                  <CardHeader>
                <CardTitle className="text-white">Recent Backup Jobs</CardTitle>
                <CardDescription>Monitor backup job progress and history</CardDescription>
                  </CardHeader>
                  <CardContent>
                <div className="text-center py-8">
                  <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Recent Jobs</h3>
                  <p className="text-gray-400">Backup job history will appear here.</p>
                      </div>
                  </CardContent>
                </Card>
          </TabsContent>

          <TabsContent value="recovery">
                <Card className="bg-black/40 border-primary/30">
                  <CardHeader>
                <CardTitle className="text-white">Disaster Recovery</CardTitle>
                <CardDescription>Recovery options and disaster recovery planning</CardDescription>
                  </CardHeader>
                  <CardContent>
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Recovery Center</h3>
                  <p className="text-gray-400 mb-4">Access point-in-time recovery and disaster recovery options.</p>
                  <Button variant="outline">Browse Backups</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
                          </div>
                        </div>
  )
}