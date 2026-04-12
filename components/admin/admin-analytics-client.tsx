"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { ArrowLeft, Users, DollarSign, TrendingUp, Activity, Download } from "lucide-react"

export default function AdminAnalyticsClient() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }
    setIsLoading(false)
  }, [router])

  const userGrowthData = [
    { month: "Jan", users: 1200, newUsers: 150 },
    { month: "Feb", users: 1350, newUsers: 180 },
    { month: "Mar", users: 1530, newUsers: 220 },
    { month: "Apr", users: 1750, newUsers: 190 },
    { month: "May", users: 1940, newUsers: 240 },
    { month: "Jun", users: 2180, newUsers: 280 },
  ]

  const revenueData = [
    { month: "Jan", revenue: 12500, subscriptions: 85 },
    { month: "Feb", revenue: 15200, subscriptions: 102 },
    { month: "Mar", revenue: 18900, subscriptions: 125 },
    { month: "Apr", revenue: 22100, subscriptions: 148 },
    { month: "May", revenue: 25800, subscriptions: 172 },
    { month: "Jun", revenue: 29400, subscriptions: 196 },
  ]

  const engagementData = [
    { day: "Mon", pageViews: 2400, sessions: 1200 },
    { day: "Tue", pageViews: 2100, sessions: 1100 },
    { day: "Wed", pageViews: 2800, sessions: 1400 },
    { day: "Thu", pageViews: 2600, sessions: 1300 },
    { day: "Fri", pageViews: 3200, sessions: 1600 },
    { day: "Sat", pageViews: 1800, sessions: 900 },
    { day: "Sun", pageViews: 1600, sessions: 800 },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Header */}
      <div className="relative border-b border-purple-500/20 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
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
                <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-gray-400">Platform insights and metrics</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">12,847</p>
                  <p className="text-green-400 text-sm">+12% from last month</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">$29,400</p>
                  <p className="text-green-400 text-sm">+18% from last month</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-white">3,421</p>
                  <p className="text-green-400 text-sm">+8% from last month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Daily Active Users</p>
                  <p className="text-2xl font-bold text-white">1,847</p>
                  <p className="text-green-400 text-sm">+5% from yesterday</p>
                </div>
                <Activity className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">User Growth</CardTitle>
                <CardDescription className="text-gray-400">
                  Total users and new user registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    users: {
                      label: "Total Users",
                      color: "#8B5CF6",
                    },
                    newUsers: {
                      label: "New Users",
                      color: "#06B6D4",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stackId="1"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="newUsers"
                        stackId="2"
                        stroke="#06B6D4"
                        fill="#06B6D4"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Revenue Analytics</CardTitle>
                <CardDescription className="text-gray-400">Monthly revenue and subscription growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "#10B981",
                    },
                    subscriptions: {
                      label: "Subscriptions",
                      color: "#F59E0B",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="subscriptions" stroke="#F59E0B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">User Engagement</CardTitle>
                <CardDescription className="text-gray-400">Daily page views and user sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    pageViews: {
                      label: "Page Views",
                      color: "#EF4444",
                    },
                    sessions: {
                      label: "Sessions",
                      color: "#3B82F6",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="pageViews" fill="#EF4444" />
                      <Bar dataKey="sessions" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
