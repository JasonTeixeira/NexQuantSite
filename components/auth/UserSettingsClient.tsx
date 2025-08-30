"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Settings, 
  Camera, 
  Eye, 
  EyeOff,
  Smartphone,
  Mail,
  Globe,
  Palette,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Gift,
  TrendingUp,
  BarChart3,
  Target
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

interface UserPreferences {
  theme: 'dark' | 'light' | 'auto'
  language: string
  timezone: string
  currency: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    marketing: boolean
    signals: boolean
    portfolio: boolean
    security: boolean
  }
  privacy: {
    profileVisible: boolean
    showTrades: boolean
    showPerformance: boolean
    allowAnalytics: boolean
  }
  trading: {
    riskLevel: 'conservative' | 'moderate' | 'aggressive'
    defaultPosition: string
    autoTrade: boolean
    stopLoss: boolean
  }
}

const mockUserData = {
  id: 'user123',
  email: 'trader@nexural.com',
  firstName: 'Alex',
  lastName: 'Thompson',
  username: 'alextrader',
  avatar: '/placeholder-avatar.jpg',
  phone: '+1 (555) 123-4567',
  bio: 'Professional trader with 5+ years of experience in algorithmic trading.',
  joinedAt: '2023-03-15',
  lastLogin: '2024-01-15T10:30:00Z',
  emailVerified: true,
  phoneVerified: false,
  twoFactorEnabled: false,
  plan: 'pro',
  referralCode: 'ALEX2024',
  totalReferrals: 12,
  referralEarnings: 450.75,
  accountValue: 25750.80,
  totalTrades: 1847,
  winRate: 72.3,
  preferences: {
    theme: 'dark',
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      signals: true,
      portfolio: true,
      security: true
    },
    privacy: {
      profileVisible: true,
      showTrades: false,
      showPerformance: true,
      allowAnalytics: true
    },
    trading: {
      riskLevel: 'moderate',
      defaultPosition: '1000',
      autoTrade: false,
      stopLoss: true
    }
  } as UserPreferences
}

export default function UserSettingsClient() {
  const { user } = useAuth()
  const [userData, setUserData] = useState(mockUserData)
  const [preferences, setPreferences] = useState<UserPreferences>(userData.preferences)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const handleSave = async (section: string) => {
    setIsLoading(true)
    try {
      // In production, save to API
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`Saving ${section}:`, { userData, preferences })
      // Show success message
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any> || {}),
        [key]: value
      }
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Account Settings</h1>
              <p className="text-gray-400">Manage your account preferences and security settings</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Account Value</p>
                    <p className="text-lg font-bold text-green-400">${userData.accountValue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="text-lg font-bold text-blue-400">{userData.winRate}%</p>
                  </div>
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Referrals</p>
                    <p className="text-lg font-bold text-purple-400">{userData.totalReferrals}</p>
                  </div>
                  <Gift className="w-5 h-5 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Trades</p>
                    <p className="text-lg font-bold text-amber-400">{userData.totalTrades.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload and manage your profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={userData.avatar} alt={userData.firstName} />
                      <AvatarFallback>{userData.firstName[0]}{userData.lastName[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                        <Camera className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={userData.firstName}
                        onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={userData.lastName}
                        onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={userData.username}
                      onChange={(e) => setUserData({...userData, username: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="bg-gray-800 border-gray-700 flex-1"
                      />
                      <Badge variant={userData.emailVerified ? 'default' : 'destructive'} className="flex items-center gap-1">
                        {userData.emailVerified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {userData.emailVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        className="bg-gray-800 border-gray-700 flex-1"
                      />
                      <Badge variant={userData.phoneVerified ? 'default' : 'destructive'} className="flex items-center gap-1">
                        {userData.phoneVerified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {userData.phoneVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={userData.bio}
                      onChange={(e) => setUserData({...userData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      className="bg-gray-800 border-gray-700 min-h-[100px]"
                    />
                  </div>

                  <Button onClick={() => handleSave('profile')} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password for security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        className="bg-gray-800 border-gray-700 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password Strength</Label>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-gray-400">Strong password</p>
                  </div>

                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-cyan-400" />
                      <div>
                        <div className="font-semibold">Authenticator App</div>
                        <div className="text-sm text-gray-400">
                          {userData.twoFactorEnabled ? 'Enabled' : 'Not configured'}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={userData.twoFactorEnabled}
                      onCheckedChange={(checked) => setUserData({...userData, twoFactorEnabled: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-6 h-6 text-green-400" />
                      <div>
                        <div className="font-semibold">Email Verification</div>
                        <div className="text-sm text-gray-400">
                          {userData.emailVerified ? 'Verified' : 'Pending verification'}
                        </div>
                      </div>
                    </div>
                    <Badge variant={userData.emailVerified ? 'default' : 'destructive'}>
                      {userData.emailVerified ? 'Active' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="font-semibold">SMS Verification</div>
                        <div className="text-sm text-gray-400">
                          {userData.phoneVerified ? 'Verified' : 'Not verified'}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={userData.phoneVerified ? 'outline' : 'default'}
                      className={userData.phoneVerified ? 'border-gray-600' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      {userData.phoneVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>

                  {!userData.twoFactorEnabled && (
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Enable 2FA
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Login Sessions */}
              <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>Manage your active login sessions across devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                          <Globe className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <div className="font-semibold">Chrome on Windows</div>
                          <div className="text-sm text-gray-400">New York, United States • Current session</div>
                          <div className="text-xs text-gray-500">Last active: Just now</div>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-600">Current</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-semibold">Mobile App - iPhone</div>
                          <div className="text-sm text-gray-400">New York, United States</div>
                          <div className="text-xs text-gray-500">Last active: 2 hours ago</div>
                        </div>
                      </div>
                      <Button size="sm" variant="destructive">
                        Revoke
                      </Button>
                    </div>
                  </div>

                  <Button variant="destructive" className="w-full mt-4">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Sign Out All Devices
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-gray-400">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={preferences.notifications.email}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'email', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-gray-400">Receive browser push notifications</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={preferences.notifications.push}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'push', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                        <p className="text-sm text-gray-400">Receive text messages</p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={preferences.notifications.sms}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'sms', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Notification Types</CardTitle>
                  <CardDescription>Customize what you get notified about</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="signals-notifications">Trading Signals</Label>
                        <p className="text-sm text-gray-400">New trading opportunities</p>
                      </div>
                      <Switch
                        id="signals-notifications"
                        checked={preferences.notifications.signals}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'signals', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="portfolio-notifications">Portfolio Updates</Label>
                        <p className="text-sm text-gray-400">Changes in your portfolio</p>
                      </div>
                      <Switch
                        id="portfolio-notifications"
                        checked={preferences.notifications.portfolio}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'portfolio', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="security-notifications">Security Alerts</Label>
                        <p className="text-sm text-gray-400">Login and security events</p>
                      </div>
                      <Switch
                        id="security-notifications"
                        checked={preferences.notifications.security}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'security', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing-notifications">Marketing</Label>
                        <p className="text-sm text-gray-400">Product updates and promotions</p>
                      </div>
                      <Switch
                        id="marketing-notifications"
                        checked={preferences.notifications.marketing}
                        onCheckedChange={(checked) => handlePreferenceChange('notifications', 'marketing', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => handleSave('notifications')} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700">
                {isLoading ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your subscription and billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-700">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        <span className="font-semibold text-lg">Pro Plan</span>
                      </div>
                      <p className="text-gray-400">Advanced trading features</p>
                      <p className="text-2xl font-bold text-cyan-400 mt-2">$99/month</p>
                    </div>
                    <Badge className="bg-cyan-600">Active</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Next billing date</span>
                      <span>February 15, 2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Payment method</span>
                      <span>•••• •••• •••• 4242</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Billing cycle</span>
                      <span>Monthly</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                      Upgrade Plan
                    </Button>
                    <Button variant="outline" className="border-gray-600">
                      Change Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Visa •••• 4242</div>
                        <div className="text-sm text-gray-400">Expires 12/26</div>
                      </div>
                    </div>
                    <Badge variant="default">Primary</Badge>
                  </div>

                  <Button className="w-full" variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>Your recent transactions and invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: '2024-01-15', amount: 99, status: 'paid', invoice: 'INV-001' },
                      { date: '2023-12-15', amount: 99, status: 'paid', invoice: 'INV-002' },
                      { date: '2023-11-15', amount: 99, status: 'paid', invoice: 'INV-003' },
                    ].map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <div className="font-semibold">Pro Plan - Monthly</div>
                            <div className="text-sm text-gray-400">{transaction.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">${transaction.amount}</span>
                          <Badge variant={transaction.status === 'paid' ? 'default' : 'destructive'}>
                            {transaction.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Display Preferences</CardTitle>
                  <CardDescription>Customize your interface experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={preferences.theme} onValueChange={(value) => handlePreferenceChange('theme', 'theme', value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', 'language', value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', 'timezone', value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={preferences.currency} onValueChange={(value) => handlePreferenceChange('currency', 'currency', value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Trading Preferences</CardTitle>
                  <CardDescription>Configure your trading defaults</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select 
                      value={preferences.trading.riskLevel} 
                      onValueChange={(value) => handlePreferenceChange('trading', 'riskLevel', value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultPosition">Default Position Size</Label>
                    <Input
                      id="defaultPosition"
                      value={preferences.trading.defaultPosition}
                      onChange={(e) => handlePreferenceChange('trading', 'defaultPosition', e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoTrade">Auto Trading</Label>
                        <p className="text-sm text-gray-400">Enable automated trading</p>
                      </div>
                      <Switch
                        id="autoTrade"
                        checked={preferences.trading.autoTrade}
                        onCheckedChange={(checked) => handlePreferenceChange('trading', 'autoTrade', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="stopLoss">Stop Loss</Label>
                        <p className="text-sm text-gray-400">Automatic stop loss orders</p>
                      </div>
                      <Switch
                        id="stopLoss"
                        checked={preferences.trading.stopLoss}
                        onCheckedChange={(checked) => handlePreferenceChange('trading', 'stopLoss', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control your privacy and data sharing preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="profileVisible">Public Profile</Label>
                          <p className="text-sm text-gray-400">Make your profile visible to others</p>
                        </div>
                        <Switch
                          id="profileVisible"
                          checked={preferences.privacy.profileVisible}
                          onCheckedChange={(checked) => handlePreferenceChange('privacy', 'profileVisible', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showTrades">Show Trades</Label>
                          <p className="text-sm text-gray-400">Display your trading activity</p>
                        </div>
                        <Switch
                          id="showTrades"
                          checked={preferences.privacy.showTrades}
                          onCheckedChange={(checked) => handlePreferenceChange('privacy', 'showTrades', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showPerformance">Show Performance</Label>
                          <p className="text-sm text-gray-400">Share your trading performance</p>
                        </div>
                        <Switch
                          id="showPerformance"
                          checked={preferences.privacy.showPerformance}
                          onCheckedChange={(checked) => handlePreferenceChange('privacy', 'showPerformance', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allowAnalytics">Analytics</Label>
                          <p className="text-sm text-gray-400">Allow anonymous usage analytics</p>
                        </div>
                        <Switch
                          id="allowAnalytics"
                          checked={preferences.privacy.allowAnalytics}
                          onCheckedChange={(checked) => handlePreferenceChange('privacy', 'allowAnalytics', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => handleSave('preferences')} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700">
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="mt-8 bg-red-900/20 border-red-700">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-300">
              Actions that permanently affect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-red-400">Export Data</div>
                <div className="text-sm text-gray-400">Download all your account data</div>
              </div>
              <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/30">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-red-400">Delete Account</div>
                <div className="text-sm text-gray-400">Permanently delete your account and data</div>
              </div>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
