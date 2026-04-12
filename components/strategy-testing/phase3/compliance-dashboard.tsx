"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, FileText, Shield } from "lucide-react"

const complianceMetrics = [
  { name: "Position Limits", status: "compliant", value: 85, limit: 100, color: "#00bbff" },
  { name: "Risk Limits", status: "warning", value: 92, limit: 100, color: "#ff6b35" },
  { name: "Concentration", status: "compliant", value: 67, limit: 80, color: "#00bbff" },
  { name: "Leverage", status: "compliant", value: 3.2, limit: 5.0, color: "#00bbff" },
]

const regulatoryReports = [
  { id: "REP001", name: "Daily Risk Report", status: "submitted", dueDate: "2024-01-15", type: "Risk" },
  { id: "REP002", name: "Position Report", status: "pending", dueDate: "2024-01-15", type: "Position" },
  { id: "REP003", name: "Trade Surveillance", status: "submitted", dueDate: "2024-01-14", type: "Surveillance" },
  { id: "REP004", name: "Liquidity Report", status: "overdue", dueDate: "2024-01-13", type: "Liquidity" },
]

const complianceAlerts = [
  {
    id: 1,
    severity: "high",
    message: "Position limit approaching for AAPL",
    timestamp: "2024-01-15 14:30:00",
    resolved: false,
  },
  {
    id: 2,
    severity: "medium",
    message: "Unusual trading pattern detected",
    timestamp: "2024-01-15 13:45:00",
    resolved: false,
  },
  {
    id: 3,
    severity: "low",
    message: "Daily report generation completed",
    timestamp: "2024-01-15 12:00:00",
    resolved: true,
  },
]

const auditTrail = [
  {
    timestamp: "2024-01-15 14:35:22",
    user: "trader1@firm.com",
    action: "Order Placed",
    details: "BUY 1000 AAPL @ 185.50",
    ip: "192.168.1.100",
  },
  {
    timestamp: "2024-01-15 14:34:15",
    user: "trader2@firm.com",
    action: "Position Modified",
    details: "Reduced TSLA position by 500 shares",
    ip: "192.168.1.101",
  },
  {
    timestamp: "2024-01-15 14:33:08",
    user: "admin@firm.com",
    action: "Risk Limit Updated",
    details: "VaR limit increased to $2M",
    ip: "192.168.1.102",
  },
  {
    timestamp: "2024-01-15 14:32:01",
    user: "trader1@firm.com",
    action: "Strategy Activated",
    details: "Momentum Strategy v2.1 enabled",
    ip: "192.168.1.100",
  },
]

const regulatoryIntegrations = [
  { name: "SEC EDGAR", status: "connected", lastSync: "2024-01-15 14:30:00", reports: 12 },
  { name: "FINRA CAT", status: "connected", lastSync: "2024-01-15 14:25:00", reports: 8 },
  { name: "CFTC SDR", status: "pending", lastSync: "2024-01-15 13:45:00", reports: 0 },
  { name: "MiFID II", status: "connected", lastSync: "2024-01-15 14:20:00", reports: 15 },
]

const automatedReports = [
  { name: "Daily Position Report", schedule: "Daily 6:00 AM", nextRun: "2024-01-16 06:00:00", status: "active" },
  { name: "Weekly Risk Summary", schedule: "Monday 8:00 AM", nextRun: "2024-01-22 08:00:00", status: "active" },
  { name: "Monthly Compliance Review", schedule: "1st of Month", nextRun: "2024-02-01 09:00:00", status: "active" },
  { name: "Quarterly Regulatory Filing", schedule: "Quarterly", nextRun: "2024-04-01 10:00:00", status: "pending" },
]

const complianceAnalytics = [
  { metric: "Regulatory Violations", value: 0, trend: "stable", benchmark: "< 1" },
  { metric: "Report Timeliness", value: 98.5, trend: "improving", benchmark: "> 95%" },
  { metric: "Audit Findings", value: 2, trend: "decreasing", benchmark: "< 5" },
  { metric: "Compliance Score", value: 94.2, trend: "stable", benchmark: "> 90" },
]

export function ComplianceDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "#00ff88"
      case "warning":
        return "#ff6b35"
      case "violation":
        return "#ff4757"
      case "submitted":
        return "#00bbff"
      case "pending":
        return "#ffa502"
      case "overdue":
        return "#ff4757"
      default:
        return "#666"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#ff4757"
      case "medium":
        return "#ff6b35"
      case "low":
        return "#ffa502"
      default:
        return "#666"
    }
  }

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Compliance Dashboard</h1>
        <p className="text-gray-400">Regulatory compliance monitoring and reporting</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#1a1a2e] border-[#2a2a3e]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Reports
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Alerts
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceMetrics.map((metric, index) => (
              <Card key={index} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">{metric.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-white">
                      {typeof metric.value === "number" ? metric.value.toFixed(1) : metric.value}
                    </span>
                    <Badge
                      variant="outline"
                      className={`border-[${getStatusColor(metric.status)}] text-[${getStatusColor(metric.status)}]`}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <Progress
                    value={(metric.value / metric.limit) * 100}
                    className="h-2"
                    style={{ "--progress-background": metric.color } as React.CSSProperties}
                  />
                  <p className="text-xs text-gray-400 mt-1">Limit: {metric.limit}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#00bbff]" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Overall Compliance</span>
                    <Badge className="bg-[#00ff88] text-black">98.5%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Violations</span>
                    <Badge variant="destructive">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Pending Reviews</span>
                    <Badge className="bg-[#ffa502] text-black">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#00bbff]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditTrail.slice(0, 4).map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-[#00bbff] rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{entry.action}</p>
                        <p className="text-gray-400 text-xs">{entry.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#00bbff]" />
                Regulatory Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regulatoryIntegrations.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                    <div>
                      <p className="font-medium text-white">{integration.name}</p>
                      <p className="text-xs text-gray-400">Last sync: {integration.lastSync}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          integration.status === "connected" ? "bg-[#00ff88] text-black" : "bg-[#ffa502] text-black"
                        }
                      >
                        {integration.status}
                      </Badge>
                      <span className="text-sm text-gray-300">{integration.reports}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#00bbff]" />
                Automated Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {automatedReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                    <div>
                      <p className="font-medium text-white">{report.name}</p>
                      <p className="text-xs text-gray-400">{report.schedule}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">Next: {report.nextRun}</span>
                      <Badge
                        className={report.status === "active" ? "bg-[#00ff88] text-black" : "bg-[#ffa502] text-black"}
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Compliance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {complianceAnalytics.map((analytic, index) => (
                  <div key={index} className="p-3 bg-[#0f0f1a] rounded-lg">
                    <p className="text-sm text-gray-400">{analytic.metric}</p>
                    <p className="text-xl font-bold text-white">
                      {analytic.value}
                      {typeof analytic.value === "number" && analytic.value < 10 ? "" : "%"}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge
                        className={`text-xs ${analytic.trend === "improving" ? "bg-[#00ff88] text-black" : analytic.trend === "stable" ? "bg-[#00bbff] text-black" : "bg-[#ffa502] text-black"}`}
                      >
                        {analytic.trend}
                      </Badge>
                      <span className="text-xs text-gray-500">{analytic.benchmark}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4">
            {regulatoryReports.map((report) => (
              <Card key={report.id} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[#00bbff]" />
                      <div>
                        <h3 className="font-medium text-white">{report.name}</h3>
                        <p className="text-sm text-gray-400">
                          ID: {report.id} • Due: {report.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`border-[${getStatusColor(report.status)}] text-[${getStatusColor(report.status)}]`}
                      >
                        {report.status}
                      </Badge>
                      <Button size="sm" variant="outline" className="border-[#2a2a3e] text-[#00bbff] bg-transparent">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid gap-4">
            {complianceAlerts.map((alert) => (
              <Card key={alert.id} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 text-[${getSeverityColor(alert.severity)}]`} />
                      <div>
                        <p className="font-medium text-white">{alert.message}</p>
                        <p className="text-sm text-gray-400">{alert.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`border-[${getSeverityColor(alert.severity)}] text-[${getSeverityColor(alert.severity)}]`}
                      >
                        {alert.severity}
                      </Badge>
                      {!alert.resolved && (
                        <Button size="sm" variant="outline" className="border-[#2a2a3e] text-[#00bbff] bg-transparent">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Audit Trail</CardTitle>
              <CardDescription className="text-gray-400">Complete transaction and system activity log</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditTrail.map((entry, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-[#0f0f1a] rounded-lg">
                    <div className="w-2 h-2 bg-[#00bbff] rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Timestamp</p>
                        <p className="text-white font-mono">{entry.timestamp}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">User</p>
                        <p className="text-white">{entry.user}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Action</p>
                        <p className="text-[#00bbff] font-medium">{entry.action}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Details</p>
                        <p className="text-white">{entry.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
