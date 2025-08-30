"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Palette, 
  TrendingUp, 
  Gift, 
  Settings, 
  Camera, 
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  BarChart3,
  Trophy,
  Star,
  Calendar,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useAuth, useRequireAuth } from "@/lib/auth/auth-context"

export default function ProfilePageClient() {
  const auth = useRequireAuth() // Redirect to login if not authenticated
  const { user, updateUser } = auth
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    avatar: ''
  })

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
    if (message) setMessage(null)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (data.success) {
        updateUser(data.user)
        setIsEditing(false)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const copyReferralLink = () => {
    if (user?.referralCode) {
      const link = `${window.location.origin}/register?ref=${user.referralCode}`
      navigator.clipboard.writeText(link)
      setMessage({ type: 'success', text: 'Referral link copied to clipboard!' })
    }
  }

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // useRequireAuth will redirect
  }

  const completionPercentage = Math.round(
    ((user.firstName ? 20 : 0) +
     (user.lastName ? 20 : 0) +
     (user.bio ? 30 : 0) +
     (user.avatar ? 20 : 0) +
     (user.isEmailVerified ? 10 : 0))
  )

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-2 ring-primary/20">
                  <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-black hover:bg-primary/90 p-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-400 mb-2">@{user.username}</p>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    {user.role.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                    {user.subscription.toUpperCase()}
                  </Badge>
                  {user.isEmailVerified ? (
                    <Badge className="bg-green-900/50 text-green-400 border-green-500/50">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-900/50 text-yellow-400 border-yellow-500/50">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-sm text-gray-400 mb-2">Profile Completion</p>
              <div className="flex items-center gap-2">
                <Progress value={completionPercentage} className="w-32" />
                <span className="text-primary font-semibold">{completionPercentage}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Member since {new Date(user.createdAt).getFullYear()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className={message.type === 'success' 
              ? 'border-green-500/50 bg-green-900/20' 
              : 'border-red-500/50 bg-red-900/20'
            }>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
                {message.text}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-gray-900/50">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Referrals
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900/50 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-white">Personal Information</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      disabled={isSaving}
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">First Name</Label>
                        <Input
                          value={isEditing ? editForm.firstName : user.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={!isEditing}
                          className="bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Last Name</Label>
                        <Input
                          value={isEditing ? editForm.lastName : user.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={!isEditing}
                          className="bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Email</Label>
                      <Input
                        value={user.email}
                        disabled
                        className="bg-gray-800/30 border-gray-700 text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Bio</Label>
                      <Textarea
                        value={isEditing ? editForm.bio : user.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Tell us about your trading experience..."
                        className="bg-gray-800/50 border-gray-700 text-white disabled:opacity-50 min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Account Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <span className="text-white">Email Verification</span>
                      </div>
                      {user.isEmailVerified ? (
                        <Badge className="bg-green-900/50 text-green-400 border-green-500/50">
                          Verified
                        </Badge>
                      ) : (
                        <Button size="sm" className="bg-primary text-black hover:bg-primary/90">
                          Verify
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">Two-Factor Auth</span>
                      </div>
                      {user.isTwoFactorEnabled ? (
                        <Badge className="bg-green-900/50 text-green-400 border-green-500/50">
                          Enabled
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="border-primary/50 text-primary">
                          Enable
                        </Button>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Logins</span>
                        <span className="text-white font-medium">{user.loginCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Last Login</span>
                        <span className="text-white font-medium">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Joined</span>
                        <span className="text-white font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-900/50 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{user.stats.totalTrades}</p>
                        <p className="text-sm text-gray-400">Total Trades</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{Math.round(user.stats.winRate * 100)}%</p>
                        <p className="text-sm text-gray-400">Win Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{user.stats.badgesEarned.length}</p>
                        <p className="text-sm text-gray-400">Badges</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{user.stats.referralsCount}</p>
                        <p className="text-sm text-gray-400">Referrals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="mt-6">
              <Card className="bg-gray-900/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Referral Program</CardTitle>
                  <p className="text-gray-400">Earn rewards by inviting friends to join Nexural Trading</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Your Referral Code</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        value={user.referralCode}
                        readOnly
                        className="bg-gray-800/50 border-gray-700 text-white font-mono"
                      />
                      <Button
                        onClick={copyReferralLink}
                        className="bg-primary text-black hover:bg-primary/90"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Link
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400">
                      Share your referral code and earn <span className="text-primary font-semibold">35% commission</span> on all successful referrals.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{user.stats.referralsCount}</p>
                      <p className="text-gray-400">Total Referrals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">$2,847</p>
                      <p className="text-gray-400">Earnings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400">35%</p>
                      <p className="text-gray-400">Commission Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs would go here (Preferences, Security) */}
            <TabsContent value="preferences" className="mt-6">
              <Card className="bg-gray-900/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">User preferences will be available in the next update.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card className="bg-gray-900/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Security settings will be available in the next update.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}


