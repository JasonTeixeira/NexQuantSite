"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react"

const auditEvents = [
  {
    id: "AUD001",
    timestamp: "2024-01-15 14:35:22",
    user: "john.smith@firm.com",
    action: "Order Placed",
    category: "Trading",
    details: "BUY 1000 AAPL @ 185.50",
    ip: "192.168.1.100",
    status: "success",
    riskLevel: "low",
  },
  {
    id: "AUD002",
    timestamp: "2024-01-15 14:34:15",
    user: "sarah.johnson@firm.com",
    action: "Risk Limit Modified",
    category: "Risk Management",
    details: "VaR limit increased from $1.5M to $2M",
    ip: "192.168.1.101",
    status: "success",
    riskLevel: "high",
  },
  {
    id: "AUD003",
    timestamp: "2024-01-15 14:33:08",
    user: "mike.chen@firm.com",
    action: "Strategy Activated",
    category: "Strategy",
    details: "Momentum Strategy v2.1 enabled for TECH sector",
    ip: "192.168.1.102",
    status: "success",
    riskLevel: "medium",
  },
  {
    id: "AUD004",
    timestamp: "2024-01-15 14:32:01",
    user: "lisa.rodriguez@firm.com",
    action: "Compliance Check",
    category: "Compliance",
    details: "Position limit validation for portfolio ALPHA",
    ip: "192.168.1.103",
    status: "warning",
    riskLevel: "medium",
  },
  {
    id: "AUD005",
    timestamp: "2024-01-15 14:31:45",
    user: "john.smith@firm.com",
    action: "Position Modified",
    category: "Portfolio",
    details: "Reduced TSLA position by 500 shares",
    ip: "192.168.1.100",
    status: "success",
    riskLevel: "low",
  },
]

const transactionLogs = [
  {
    id: "TXN001",
    timestamp: "2024-01-15 14:35:22",
    type: "Order",
    symbol: "AAPL",
    side: "BUY",
    quantity: 1000,
    price: 185.5,
    value: 185500,
    status: "Filled",
    user: "john.smith@firm.com",
  },
  {
    id: "TXN002",
    timestamp: "2024-01-15 14:30:15",
    type: "Order",
    symbol: "TSLA",
    side: "SELL",
    quantity: 500,
    price: 242.8,
    value: 121400,
    status: "Filled",
    user: "john.smith@firm.com",
  },
  {
    id: "TXN003",
    timestamp: "2024-01-15 14:25:08",
    type: "Order",
    symbol: "MSFT",
    side: "BUY",
    quantity: 750,
    price: 378.9,
    value: 284175,
    status: "Partial",
    user: "sarah.johnson@firm.com",
  },
]

const systemLogs = [
  {
    id: "SYS001",
    timestamp: "2024-01-15 14:35:00",
    component: "Risk Engine",
    level: "INFO",
    message: "Daily risk calculations completed successfully",
    details: "Processed 1,247 positions across 15 portfolios",
  },
  {
    id: "SYS002",
    timestamp: "2024-01-15 14:30:00",
    component: "Market Data",
    level: "WARNING",
    message: "Delayed data feed detected for NASDAQ",
    details: "Latency increased to 150ms, investigating connection",
  },
  {
    id: "SYS003",
    timestamp: "2024-01-15 14:25:00",
    component: "Order Management",
    level: "INFO",
    message: "Order routing optimization updated",
    details: "New algorithm deployed for better execution quality",
  },
]

const blockchainVerification = [
  { hash: "0x1a2b3c4d5e6f7890", timestamp: "2024-01-15 14:35:22", status: "verified", transactions: 156 },
  { hash: "0x2b3c4d5e6f789012", timestamp: "2024-01-15 14:30:22", status: "verified", transactions: 142 },
  { hash: "0x3c4d5e6f78901234", timestamp: "2024-01-15 14:25:22", status: "pending", transactions: 89 },
]

const immutableLogs = [
  { id: "IMM001", merkleRoot: "0xabc123def456", blockHeight: 12456, entries: 234, integrity: "verified" },
  { id: "IMM002", merkleRoot: "0xdef456ghi789", blockHeight: 12455, entries: 198, integrity: "verified" },
  { id: "IMM003", merkleRoot: "0xghi789jkl012", blockHeight: 12454, entries: 167, integrity: "verified" },
]

const advancedAnalytics = [
  { metric: "Log Integrity Score", value: 99.8, status: "excellent" },
  { metric: "Tamper Attempts", value: 0, status: "secure" },
  { metric: "Retention Compliance", value: 100, status: "compliant" },
  { metric: "Access Violations", value: 2, status: "monitored" },
]

export function AuditTrail() {
  const [selectedTab, setSelectedTab] = useState("events")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-[#00ff88]" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-[#ffa502]" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-[#ff4757]" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "#ff4757"
      case "medium":
        return "#ffa502"
      case "low":
        return "#00ff88"
      default:
        return "#666"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Filled":
        return "#00ff88"
      case "Partial":
        return "#ffa502"
      case "Cancelled":
        return "#ff4757"
      case "Pending":
        return "#00bbff"
      default:
        return "#666"
    }
  }

  const filteredEvents = auditEvents.filter((event) => {
    const matchesSearch =
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || event.category === filterCategory
    const matchesStatus = filterStatus === "all" || event.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Audit Trail</h1>
        <p className="text-gray-400">Complete system activity and transaction logging</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a1a2e] border-[#2a2a3e]">
          <TabsTrigger value="events" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Audit Events
          </TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            System Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1a1a2e] border-[#2a2a3e] text-white w-64"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40 bg-[#1a1a2e] border-[#2a2a3e] text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Trading">Trading</SelectItem>
                  <SelectItem value="Risk Management">Risk Management</SelectItem>
                  <SelectItem value="Strategy">Strategy</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Portfolio">Portfolio</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-[#1a1a2e] border-[#2a2a3e] text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => {
                console.log('Export audit trail clicked')
                alert('Exporting audit trail to CSV...')
              }}
              className="bg-[#00bbff] text-black hover:bg-[#0099cc]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(event.status)}
                        <Badge
                          variant="outline"
                          className={`border-[${getRiskLevelColor(event.riskLevel)}] text-[${getRiskLevelColor(event.riskLevel)}] text-xs`}
                        >
                          {event.riskLevel}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-white">{event.action}</h3>
                          <Badge className="bg-[#2a2a3e] text-gray-300 text-xs">{event.category}</Badge>
                          <span className="text-xs text-gray-500">ID: {event.id}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{event.details}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>User: {event.user}</span>
                          <span>IP: {event.ip}</span>
                          <span>Time: {event.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        console.log('View audit details clicked')
                        alert('Opening detailed audit view...')
                      }}
                      size="sm" 
                      variant="outline" 
                      className="border-[#2a2a3e] text-[#00bbff] bg-transparent"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Immutable Log Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {immutableLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                    <div>
                      <p className="font-medium text-white">Block {log.blockHeight}</p>
                      <p className="text-xs text-gray-400 font-mono">{log.merkleRoot}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">{log.entries} entries</span>
                      <Badge className="bg-[#00ff88] text-black">{log.integrity}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Blockchain Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockchainVerification.map((block, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                    <div>
                      <p className="font-medium text-white font-mono">{block.hash}</p>
                      <p className="text-xs text-gray-400">{block.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300">{block.transactions} txns</span>
                      <Badge
                        className={block.status === "verified" ? "bg-[#00ff88] text-black" : "bg-[#ffa502] text-black"}
                      >
                        {block.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Transaction Log</h2>
            <Button 
              onClick={() => {
                console.log('Export transactions clicked')
                alert('Exporting transaction log to CSV...')
              }}
              className="bg-[#00bbff] text-black hover:bg-[#0099cc]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Transactions
            </Button>
          </div>

          <div className="space-y-3">
            {transactionLogs.map((txn) => (
              <Card key={txn.id} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="text-sm text-gray-400">Transaction</p>
                      <p className="font-medium text-white">{txn.id}</p>
                      <p className="text-xs text-gray-500">{txn.timestamp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Symbol</p>
                      <p className="font-medium text-[#00bbff]">{txn.symbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Side</p>
                      <Badge className={txn.side === "BUY" ? "bg-[#00ff88] text-black" : "bg-[#ff4757] text-white"}>
                        {txn.side}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Quantity</p>
                      <p className="font-medium text-white">{txn.quantity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Value</p>
                      <p className="font-medium text-white">${txn.value.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge
                          variant="outline"
                          className={`border-[${getStatusColor(txn.status)}] text-[${getStatusColor(txn.status)}]`}
                        >
                          {txn.status}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" className="border-[#2a2a3e] text-[#00bbff] bg-transparent">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">System Logs</h2>
            <Button 
              onClick={() => {
                console.log('Export system logs clicked')
                alert('Exporting system logs to CSV...')
              }}
              className="bg-[#00bbff] text-black hover:bg-[#0099cc]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>

          <div className="space-y-3">
            {systemLogs.map((log) => (
              <Card key={log.id} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-2 h-2 bg-[#00bbff] rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-white">{log.component}</h3>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              log.level === "INFO"
                                ? "border-[#00bbff] text-[#00bbff]"
                                : log.level === "WARNING"
                                  ? "border-[#ffa502] text-[#ffa502]"
                                  : "border-[#ff4757] text-[#ff4757]"
                            }`}
                          >
                            {log.level}
                          </Badge>
                          <span className="text-xs text-gray-500">ID: {log.id}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{log.message}</p>
                        <p className="text-xs text-gray-400">{log.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        console.log('View audit details clicked')
                        alert('Opening detailed audit view...')
                      }}
                      size="sm" 
                      variant="outline" 
                      className="border-[#2a2a3e] text-[#00bbff] bg-transparent"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Advanced Audit Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {advancedAnalytics.map((analytic, index) => (
                  <div key={index} className="p-3 bg-[#0f0f1a] rounded-lg">
                    <p className="text-sm text-gray-400">{analytic.metric}</p>
                    <p className="text-xl font-bold text-white">
                      {analytic.value}
                      {typeof analytic.value === "number" && analytic.value > 10 ? "%" : ""}
                    </p>
                    <Badge
                      className={`text-xs mt-1 ${analytic.status === "excellent" || analytic.status === "secure" || analytic.status === "compliant" ? "bg-[#00ff88] text-black" : "bg-[#ffa502] text-black"}`}
                    >
                      {analytic.status}
                    </Badge>
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
