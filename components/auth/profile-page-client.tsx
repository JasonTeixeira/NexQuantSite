"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { User, Mail, Shield, Bell, CreditCard, Settings, Camera, Edit, Save, Award, TrendingUp, Users, Eye, EyeOff, Smartphone, Key, Globe, DollarSign, Activity, Calendar, MapPin, LinkIcon, Check } from 'lucide-react'

interface UserProfile {
  username: string
  displayName: string
  email: string
  avatar: string
  bio: string
  location: string
  website: string
  joinDate: string
  verified: boolean
  level: string
  points: number
  followers: number
  following: number
  winRate: number
  totalTrades: number
  profitFactor: number
}

const mockUser: UserProfile = {
  username: "quanttrader_pro",
  displayName: "Alex Chen",
  email: "alex.chen@example.com",
  avatar: "",
  bio: "Professional quantitative trader with 8+ years experience in algorithmic trading. Specializing in momentum and mean reversion strategies.",
  location: "New York, NY",
  website: "https://alexchen.trading",
  joinDate: "2023-01-15",
  verified: true,
  level: "Diamond",
  points: 47500,
  followers: 2847,
  following: 156,
  winRate: 73.2,
  totalTrades: 1247,
  profitFactor: 1.85
}

const achievements = [
  { name: "First Blood", description: "Complete first trade", earned: true, rarity: "common" },
  { name: "Profit Master", description: "$10,000 total profit", earned: true, rarity: "rare" },
  { name: "Streak King", description: "10 wins in a row", earned: true, rarity: "epic" },
  { name: "Risk Manager", description: "Never exceed 2% risk", earned: false, rarity: "legendary" },
  { name: "Influencer", description: "1000 followers", earned: true, rarity: "rare" },
  { name: "Scholar", description: "Complete all courses", earned: false, rarity: "epic" }
]

export default function ProfilePageClient() {
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showApiKey, setShowApiKey] = useState(false)
  const [notifications, setNotifications] = useState({
    email: {
      trades: true,
      followers: true,
      messages: true,
      marketing: false
    },
    push: {
      signals: true,
      priceAlerts: true,
      news: false
    }
  })

  const handleSave = () => {
    setIsEditing(false)
    // Save user data
  }

  const levelProgress = (user.points % 10000) / 10000 * 100

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Header */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Avatar Section */}
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-green-400 text-black text-3xl font-bold">
                      {user.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">{user.displayName}</h1>
                    {user.verified && (
                      <Badge className="bg-blue-500 text-white">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {user.level}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-400">@{user.username}</p>
                  
                  <p className="text-gray-300 max-w-2xl">{user.bio}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <a href={user.website} className="text-primary hover:underline">
                        {user.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(user.joinDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Level Progress</span>
                      <span className="text-primary">{user.points.toLocaleString()} points</span>
                    </div>
                    <Progress value={levelProgress} className="h-2 bg-gray-800" />
                    <p className="text-xs text-gray-500">
                      {10000 - (user.points % 10000)} points to next level
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:min-w-[200px]">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.followers.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.following.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{user.winRate}%</div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{user.profitFactor}</div>
                    <div className="text-sm text-gray-400">Profit Factor</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-gray-900/50 border border-gray-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                Overview
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                Billing
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                Achievements
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trading Stats */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Trading Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Trades</span>
                      <span className="font-semibold">{user.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="font-semibold text-green-400">{user.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit Factor</span>
                      <span className="font-semibold text-blue-400">{user.profitFactor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Best Streak</span>
                      <span className="font-semibold">12 wins</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Stats */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Social Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Followers</span>
                      <span className="font-semibold">{user.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Following</span>
                      <span className="font-semibold">{user.following}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Posts</span>
                      <span className="font-semibold">247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Strategies Shared</span>
                      <span className="font-semibold">18</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300">Profitable trade on AAPL</span>
                      <span className="text-gray-500 ml-auto">2h ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">Shared new strategy</span>
                      <span className="text-gray-500 ml-auto">1d ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-gray-300">Earned "Streak King" badge</span>
                      <span className="text-gray-500 ml-auto">3d ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-gray-300">Reached Diamond level</span>
                      <span className="text-gray-500 ml-auto">1w ago</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information and preferences</CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className={isEditing ? "bg-primary text-black" : "border-gray-700 text-gray-300"}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={user.displayName}
                        onChange={(e) => setUser({ ...user, displayName: e.target.value })}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={user.username}
                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={user.location}
                        onChange={(e) => setUser({ ...user, location: e.target.value })}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={user.website}
                        onChange={(e) => setUser({ ...user, website: e.target.value })}
                        disabled={!isEditing}
                        className="bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={user.bio}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      className="bg-gray-800/50 border-gray-700 text-white disabled:opacity-50 resize-none"
                      placeholder="Tell us about yourself and your trading experience..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Manage your account security and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password Change */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <Button className="bg-primary text-black hover:bg-primary/90">
                      Update Password
                    </Button>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                      </div>
                      <Switch className="data-[state=checked]:bg-primary" />
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Smartphone className="w-5 h-5 text-primary" />
                        <span className="font-medium">Authenticator App</span>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Recommended
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Use an authenticator app like Google Authenticator or Authy
                      </p>
                      <Button variant="outline" className="border-gray-700 text-gray-300">
                        Setup Authenticator
                      </Button>
                    </div>
                  </div>

                  {/* API Keys */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">API Keys</h4>
                        <p className="text-sm text-gray-400">Manage your API keys for third-party integrations</p>
                      </div>
                      <Button variant="outline" className="border-gray-700 text-gray-300">
                        <Key className="w-4 h-4 mr-2" />
                        Generate New Key
                      </Button>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Trading API Key</span>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-900 px-3 py-1 rounded text-sm font-mono">
                          {showApiKey ? "sk_live_1234567890abcdef..." : "sk_live_••••••••••••••••"}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="text-gray-400 hover:text-white"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Created on Jan 15, 2024 • Last used 2 hours ago
                      </p>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <h4 className="font-medium text-white">Active Sessions</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Current Session</div>
                            <div className="text-sm text-gray-400">Chrome on macOS • New York, NY</div>
                            <div className="text-xs text-gray-500">Last active: Now</div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">Current</Badge>
                        </div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Mobile App</div>
                            <div className="text-sm text-gray-400">iPhone • New York, NY</div>
                            <div className="text-xs text-gray-500">Last active: 2 hours ago</div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            Revoke
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to be notified about important events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Notifications
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Trade Confirmations</div>
                          <div className="text-sm text-gray-400">Get notified when trades are executed</div>
                        </div>
                        <Switch
                          checked={notifications.email.trades}
                          onCheckedChange={(checked) => 
                            setNotifications({
                              ...notifications,
                              email: { ...notifications.email, trades: checked }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">New Followers</div>
                          <div className="text-sm text-gray-400">When someone follows your account</div>
                        </div>
                        <Switch
                          checked={notifications.email.followers}
                          onCheckedChange={(checked) => 
                            setNotifications({
                              ...notifications,
                              email: { ...notifications.email, followers: checked }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Direct Messages</div>
                          <div className="text-sm text-gray-400">When you receive a private message</div>
                        </div>
                        <Switch
                          checked={notifications.email.messages}
                          onCheckedChange={(checked) => 
                            setNotifications({
                              ...notifications,
                              email: { ...notifications.email, messages: checked }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Marketing Updates</div>
                          <div className="text-sm text-gray-400">Product updates and trading insights</div>
                        </div>
                        <Switch
                          checked={notifications.email.marketing}
                          onCheckedChange={(checked) => 
                            setNotifications({
                              ...notifications,
                              email: { ...notifications.email, marketing: checked }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Push Notifications
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Trading Signals</div>
                          <div className="text-sm text-gray-400">Real-time trading opportunities</div>
                        </div>
                        <Switch
                          checked={notifications.push.signals}
                          onCheckedChange={(checked) => 
                            setNotifications({
                              ...notifications,
                              push: { ...notifications.push, signals: checked }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Price Alerts</div>
                          <div className="text-sm text-gray-400">When watchlist items hit target prices</div>
                        </div>
                        <Switch
                          checked={notifications.push.priceAlerts}
                          onCheckedChange={(checked) => 
                            setNotifications({
                              ...notifications,
                              push: { ...notifications.push, priceAlerts: checked }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Market News</div>
                          <div className="text-sm text-gray-400">Breaking news and market updates</div>
                        </div>
                        <Switch
                          checked={notifications.push.news}
                          onCheckedChange={(checked) => 
                            setNotifications({
                              ...notifications,
                              push: { ...notifications.push, news: checked }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <h4 className="font-medium text-white">Quiet Hours</h4>
                    <p className="text-sm text-gray-400">Set times when you don't want to receive notifications</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Select defaultValue="22:00">
                          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="22:00">10:00 PM</SelectItem>
                            <SelectItem value="23:00">11:00 PM</SelectItem>
                            <SelectItem value="00:00">12:00 AM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Select defaultValue="08:00">
                          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="06:00">6:00 AM</SelectItem>
                            <SelectItem value="07:00">7:00 AM</SelectItem>
                            <SelectItem value="08:00">8:00 AM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Plan */}
                  <div className="bg-gradient-to-r from-primary/20 to-green-400/20 rounded-lg p-6 border border-primary/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Pro Plan</h3>
                        <p className="text-gray-300">Full access to all trading features</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">$55</div>
                        <div className="text-sm text-gray-400">per month</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Next billing: February 15, 2024
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" className="border-gray-700 text-gray-300">
                          Change Plan
                        </Button>
                        <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gray-800/30 border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">∞</div>
                          <div className="text-sm text-gray-400">API Calls</div>
                          <div className="text-xs text-gray-500">Unlimited</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/30 border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">247</div>
                          <div className="text-sm text-gray-400">Signals Used</div>
                          <div className="text-xs text-gray-500">This month</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800/30 border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">18</div>
                          <div className="text-sm text-gray-400">Strategies</div>
                          <div className="text-xs text-gray-500">Active</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Payment Methods</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-800/30 rounded-lg p-4 border border-primary/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                              VISA
                            </div>
                            <div>
                              <div className="font-medium">•••• •••• •••• 4242</div>
                              <div className="text-sm text-gray-400">Expires 12/26</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary/20 text-primary">Default</Badge>
                            <Button variant="ghost" size="sm" className="text-gray-400">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full border-gray-700 text-gray-300">
                        Add Payment Method
                      </Button>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Billing History</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div>
                          <div className="font-medium">Pro Plan - January 2024</div>
                          <div className="text-sm text-gray-400">Jan 15, 2024</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">$55.00</span>
                          <Button variant="ghost" size="sm" className="text-primary">
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div>
                          <div className="font-medium">Pro Plan - December 2023</div>
                          <div className="text-sm text-gray-400">Dec 15, 2023</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">$55.00</span>
                          <Button variant="ghost" size="sm" className="text-primary">
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Achievements & Badges
                  </CardTitle>
                  <CardDescription>Track your progress and unlock new achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border transition-all ${
                          achievement.earned
                            ? `border-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'green'}-500 bg-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'green'}-500/10`
                            : "border-gray-700 bg-gray-800/30 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            achievement.earned
                              ? `bg-${achievement.rarity === 'legendary' ? 'yellow' : achievement.rarity === 'epic' ? 'purple' : achievement.rarity === 'rare' ? 'blue' : 'green'}-500`
                              : "bg-gray-700"
                          }`}>
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{achievement.name}</h4>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                                achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                                achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-green-500/20 text-green-400'
                              }`}
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                        {achievement.earned && (
                          <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Unlocked
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
