"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, Settings, Plus, Search, Filter } from "lucide-react"

const users = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@firm.com",
    role: "Senior Trader",
    permissions: ["trading", "portfolio", "research"],
    status: "active",
    lastLogin: "2024-01-15 14:30:00",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@firm.com",
    role: "Risk Manager",
    permissions: ["risk", "compliance", "reports"],
    status: "active",
    lastLogin: "2024-01-15 13:45:00",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike.chen@firm.com",
    role: "Quant Analyst",
    permissions: ["research", "backtesting", "data"],
    status: "active",
    lastLogin: "2024-01-15 12:15:00",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@firm.com",
    role: "Compliance Officer",
    permissions: ["compliance", "audit", "reports"],
    status: "inactive",
    lastLogin: "2024-01-14 16:20:00",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const roles = [
  {
    name: "Senior Trader",
    permissions: ["trading", "portfolio", "research", "execution"],
    userCount: 5,
    description: "Full trading access with portfolio management",
  },
  {
    name: "Risk Manager",
    permissions: ["risk", "compliance", "reports", "monitoring"],
    userCount: 2,
    description: "Risk monitoring and compliance oversight",
  },
  {
    name: "Quant Analyst",
    permissions: ["research", "backtesting", "data", "modeling"],
    userCount: 8,
    description: "Research and quantitative analysis access",
  },
  {
    name: "Compliance Officer",
    permissions: ["compliance", "audit", "reports"],
    userCount: 3,
    description: "Regulatory compliance and audit functions",
  },
]

const permissions = [
  { id: "trading", name: "Trading", description: "Execute trades and manage orders" },
  { id: "portfolio", name: "Portfolio", description: "View and manage portfolios" },
  { id: "research", name: "Research", description: "Access research tools and data" },
  { id: "risk", name: "Risk Management", description: "Monitor and control risk metrics" },
  { id: "compliance", name: "Compliance", description: "Access compliance tools and reports" },
  { id: "backtesting", name: "Backtesting", description: "Run strategy backtests" },
  { id: "execution", name: "Execution", description: "Advanced execution algorithms" },
  { id: "data", name: "Data Access", description: "Access to market and alternative data" },
  { id: "reports", name: "Reporting", description: "Generate and view reports" },
  { id: "audit", name: "Audit", description: "Access audit trails and logs" },
]

const enterpriseIntegrations = [
  { name: "Active Directory", status: "connected", users: 245, lastSync: "2024-01-15 14:30:00" },
  { name: "LDAP", status: "connected", users: 89, lastSync: "2024-01-15 14:25:00" },
  { name: "SAML SSO", status: "configured", users: 156, lastSync: "2024-01-15 14:20:00" },
  { name: "OAuth 2.0", status: "active", users: 78, lastSync: "2024-01-15 14:15:00" },
]

const userAnalytics = [
  { metric: "Active Users (24h)", value: 89, change: 5.2, trend: "up" },
  { metric: "Average Session Time", value: "2h 34m", change: -8.1, trend: "down" },
  { metric: "Failed Login Attempts", value: 12, change: -15.3, trend: "down" },
  { metric: "Permission Changes", value: 8, change: 12.5, trend: "up" },
]

const advancedPermissions = [
  { id: "market_data_level1", name: "Market Data Level 1", description: "Basic market data access", category: "Data" },
  {
    id: "market_data_level2",
    name: "Market Data Level 2",
    description: "Advanced market data with depth",
    category: "Data",
  },
  {
    id: "options_trading",
    name: "Options Trading",
    description: "Options and derivatives trading",
    category: "Trading",
  },
  {
    id: "futures_trading",
    name: "Futures Trading",
    description: "Futures and commodities trading",
    category: "Trading",
  },
  {
    id: "high_frequency",
    name: "High Frequency Trading",
    description: "HFT algorithms and execution",
    category: "Advanced",
  },
  { id: "risk_override", name: "Risk Override", description: "Override risk limits in emergencies", category: "Risk" },
  {
    id: "system_admin",
    name: "System Administration",
    description: "Full system configuration access",
    category: "Admin",
  },
  {
    id: "compliance_review",
    name: "Compliance Review",
    description: "Review and approve compliance reports",
    category: "Compliance",
  },
]

export function MultiUserManagement() {
  const [selectedTab, setSelectedTab] = useState("users")
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusColor = (status: string) => {
    return status === "active" ? "#00ff88" : "#666"
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      "Senior Trader": "#00bbff",
      "Risk Manager": "#ff6b35",
      "Quant Analyst": "#00ff88",
      "Compliance Officer": "#ffa502",
    }
    return colors[role] || "#666"
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage users, roles, and permissions</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a1a2e] border-[#2a2a3e]">
          <TabsTrigger value="users" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-[#00bbff] data-[state=active]:text-black">
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1a1a2e] border-[#2a2a3e] text-white w-64"
                />
              </div>
              <Button variant="outline" className="border-[#2a2a3e] text-gray-400 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <Button 
              onClick={() => {
                console.log('Add User clicked')
                alert('Opening user creation form...')
              }}
              className="bg-[#00bbff] text-black hover:bg-[#0099cc]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-[#2a2a3e] text-white">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-white">{user.name}</h3>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500">Last login: {user.lastLogin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={`bg-[${getRoleColor(user.role)}] text-black mb-2`}>{user.role}</Badge>
                        <div className="flex gap-1">
                          {user.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs border-[#2a2a3e] text-gray-400">
                              {perm}
                            </Badge>
                          ))}
                          {user.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs border-[#2a2a3e] text-gray-400">
                              +{user.permissions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`border-[${getStatusColor(user.status)}] text-[${getStatusColor(user.status)}]`}
                        >
                          {user.status}
                        </Badge>
                        <Button 
                          onClick={() => {
                            console.log(`Edit user clicked: ${user.name}`)
                            alert(`Editing user: ${user.name}`)
                          }}
                          size="sm" 
                          variant="outline" 
                          className="border-[#2a2a3e] text-[#00bbff] bg-transparent"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Enterprise Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enterpriseIntegrations.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                    <div>
                      <p className="font-medium text-white">{integration.name}</p>
                      <p className="text-xs text-gray-400">Last sync: {integration.lastSync}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          integration.status === "connected" ? "bg-[#00ff88] text-black" : "bg-[#00bbff] text-black"
                        }
                      >
                        {integration.status}
                      </Badge>
                      <span className="text-sm text-gray-300">{integration.users}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">User Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {userAnalytics.map((analytic, index) => (
                  <div key={index} className="p-3 bg-[#0f0f1a] rounded-lg">
                    <p className="text-sm text-gray-400">{analytic.metric}</p>
                    <p className="text-xl font-bold text-white">{analytic.value}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={`text-xs ${analytic.trend === "up" ? "bg-[#00ff88] text-black" : "bg-[#ff4757] text-white"}`}
                      >
                        {analytic.change > 0 ? "+" : ""}
                        {analytic.change}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Role Management</h2>
            <Button 
              onClick={() => {
                console.log('Create Role clicked')
                alert('Opening role creation form...')
              }}
              className="bg-[#00bbff] text-black hover:bg-[#0099cc]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role, index) => (
              <Card key={index} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#00bbff]" />
                      {role.name}
                    </CardTitle>
                    <Badge className="bg-[#2a2a3e] text-white">{role.userCount} users</Badge>
                  </div>
                  <CardDescription className="text-gray-400">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-300 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs border-[#2a2a3e] text-gray-400">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="border-[#2a2a3e] text-[#00bbff] bg-transparent">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#2a2a3e] text-gray-400 bg-transparent">
                        View Users
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Permission Management</h2>
            <Button 
              onClick={() => {
                console.log('Add Permission clicked')
                alert('Opening permission creation form...')
              }}
              className="bg-[#00bbff] text-black hover:bg-[#0099cc]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Permission
            </Button>
          </div>

          <div className="grid gap-4">
            {permissions.map((permission) => (
              <Card key={permission.id} className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-[#00bbff]" />
                      <div>
                        <h3 className="font-medium text-white">{permission.name}</h3>
                        <p className="text-sm text-gray-400">{permission.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-[#2a2a3e] text-gray-400">
                        {permission.id}
                      </Badge>
                      <Button size="sm" variant="outline" className="border-[#2a2a3e] text-[#00bbff] bg-transparent">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
            <CardHeader>
              <CardTitle className="text-white">Advanced Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {advancedPermissions.map((permission) => (
                  <Card key={permission.id} className="bg-[#0f0f1a] border-[#2a2a3e]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Settings className="h-5 w-5 text-[#00bbff]" />
                          <div>
                            <h3 className="font-medium text-white">{permission.name}</h3>
                            <p className="text-sm text-gray-400">{permission.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#2a2a3e] text-gray-400">
                            {permission.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#2a2a3e] text-[#00bbff] bg-transparent"
                          >
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
