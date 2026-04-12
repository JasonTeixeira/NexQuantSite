"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  ArrowLeft,
  Search,
  Ban,
  CheckCircle,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Shield,
  CreditCard,
  Activity,
  Download,
  Users,
  Brain,
  Target,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Globe,
  Smartphone,
  Calendar,
  Award,
  Clock,
  Filter,
  BarChart3,
  PieChart,
  Zap,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Star,
} from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  status: "active" | "inactive" | "banned" | "pending"
  subscription: "free" | "pro" | "elite" | "enterprise"
  role: "user" | "admin" | "moderator" | "vip"
  joinDate: string
  lastLogin: string
  totalSpent: number
  tradesCount: number
  winRate: number
  avatar?: string
  phone?: string
  country?: string
  verified: boolean
  twoFactorEnabled: boolean
  referralCode: string
  referredBy?: string
  notes?: string
  // Enhanced fields for advanced features
  riskScore?: number
  lifetimeValue?: number
  engagementScore?: number
  churnRisk?: "low" | "medium" | "high"
  segment?: string
  lastActivity?: string
  deviceInfo?: {
    platform: string
    browser: string
    location: string
  }
  fraudFlags?: string[]
  tags?: string[]
  customFields?: Record<string, any>
}

export default function AdminUsersClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subscriptionFilter, setSubscriptionFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const router = useRouter()

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }
    loadUsers()
  }, [router])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with real API
      const mockUsers: User[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          status: "active",
          subscription: "pro",
          role: "user",
          joinDate: "2024-01-15",
          lastLogin: "2024-01-20 14:30",
          totalSpent: 299.99,
          tradesCount: 156,
          winRate: 68.5,
          phone: "+1-555-0123",
          country: "United States",
          verified: true,
          twoFactorEnabled: true,
          referralCode: "JOHN2024",
          notes: "Premium user, very active trader",
        },
        {
          id: "2",
          name: "Sarah Smith",
          email: "sarah@example.com",
          status: "active",
          subscription: "elite",
          role: "vip",
          joinDate: "2024-01-10",
          lastLogin: "2024-01-20 16:45",
          totalSpent: 999.99,
          tradesCount: 342,
          winRate: 72.1,
          phone: "+1-555-0456",
          country: "Canada",
          verified: true,
          twoFactorEnabled: true,
          referralCode: "SARAH2024",
          referredBy: "PROMO2024",
          notes: "VIP client, excellent performance",
        },
      ]
      
      setTimeout(() => {
        setUsers(mockUsers)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error loading users:", error)
      setIsLoading(false)
      toast.error("Failed to load users")
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesSubscription = subscriptionFilter === "all" || user.subscription === subscriptionFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesSubscription && matchesRole
  })

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin/dashboard")}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <p className="text-gray-400">Manage platform users and subscriptions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">{users.filter((u) => u.status === "active").length}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Premium Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter((u) => u.subscription !== "free").length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ${users.reduce((sum, user) => sum + user.totalSpent, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white/10 border-purple-500/30 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
            <CardDescription className="text-gray-400">Manage your platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Subscription</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-white">{user.name}</TableCell>
                    <TableCell className="text-gray-300">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          user.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : user.status === "inactive"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : user.status === "banned"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          user.subscription === "free"
                            ? "bg-gray-500/20 text-gray-400"
                            : user.subscription === "pro"
                            ? "bg-blue-500/20 text-blue-400"
                            : user.subscription === "elite"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {user.subscription}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}