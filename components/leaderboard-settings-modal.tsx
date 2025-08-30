"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Shield, Eye, EyeOff, Users, Trophy, Bell, Globe, Lock, Crown, Star } from 'lucide-react'

interface LeaderboardSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentSettings: {
    participation: boolean
    privacy: {
      showStats: boolean
      showCountry: boolean
      showTrades: boolean
      showProfile: boolean
      showRealName: boolean
      showAvatar: boolean
    }
    notifications: {
      rankChanges: boolean
      achievements: boolean
      competitions: boolean
      followers: boolean
    }
    visibility: 'public' | 'friends' | 'private'
  }
  onSave: (settings: any) => void
}

export default function LeaderboardSettingsModal({
  isOpen,
  onClose,
  currentSettings,
  onSave
}: LeaderboardSettingsModalProps) {
  const [settings, setSettings] = useState(currentSettings)

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as any),
        [key]: value
      }
    }))
  }

  const updateTopLevelSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2 text-primary" />
            Leaderboard Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="privacy" className="text-gray-300 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="participation" className="text-gray-300 data-[state=active]:text-white">
              <Trophy className="w-4 h-4 mr-2" />
              Participation
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-gray-300 data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="visibility" className="text-gray-300 data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              Visibility
            </TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="space-y-6 mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Show Trading Statistics</Label>
                    <p className="text-sm text-gray-400">Display win rate, profit factor, and returns</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showStats}
                    onCheckedChange={(checked) => updateSetting('privacy', 'showStats', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Show Country/Region</Label>
                    <p className="text-sm text-gray-400">Display your country flag and location</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showCountry}
                    onCheckedChange={(checked) => updateSetting('privacy', 'showCountry', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Show Trade History</Label>
                    <p className="text-sm text-gray-400">Allow others to view your recent trades</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showTrades}
                    onCheckedChange={(checked) => updateSetting('privacy', 'showTrades', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Show Full Profile</Label>
                    <p className="text-sm text-gray-400">Allow detailed profile viewing</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showProfile}
                    onCheckedChange={(checked) => updateSetting('privacy', 'showProfile', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Show Real Name</Label>
                    <p className="text-sm text-gray-400">Display your real name instead of username</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showRealName}
                    onCheckedChange={(checked) => updateSetting('privacy', 'showRealName', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Show Profile Picture</Label>
                    <p className="text-sm text-gray-400">Display your avatar on the leaderboard</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showAvatar}
                    onCheckedChange={(checked) => updateSetting('privacy', 'showAvatar', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participation" className="space-y-6 mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  Leaderboard Participation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Participate in Leaderboard</Label>
                    <p className="text-sm text-gray-400">
                      Enable this to appear on the public leaderboard and compete with other traders
                    </p>
                  </div>
                  <Switch
                    checked={settings.participation}
                    onCheckedChange={(checked) => updateTopLevelSetting('participation', checked)}
                  />
                </div>

                {!settings.participation && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <EyeOff className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">Leaderboard Participation Disabled</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      You won't appear on the leaderboard, but you can still track your personal progress.
                    </p>
                  </div>
                )}

                {settings.participation && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">Active Participant</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      You're competing on the leaderboard and eligible for competitions and rewards.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-5 h-5 mr-2 text-purple-400" />
                  Competition Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Preferred Competition Type</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all">All Competitions</SelectItem>
                        <SelectItem value="tournaments">Tournaments Only</SelectItem>
                        <SelectItem value="challenges">Challenges Only</SelectItem>
                        <SelectItem value="seasons">Seasonal Events</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Risk Level</Label>
                    <Select defaultValue="moderate">
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-green-400" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Rank Changes</Label>
                    <p className="text-sm text-gray-400">Get notified when your rank changes significantly</p>
                  </div>
                  <Switch
                    checked={settings.notifications.rankChanges}
                    onCheckedChange={(checked) => updateSetting('notifications', 'rankChanges', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">New Achievements</Label>
                    <p className="text-sm text-gray-400">Notifications for unlocked achievements and badges</p>
                  </div>
                  <Switch
                    checked={settings.notifications.achievements}
                    onCheckedChange={(checked) => updateSetting('notifications', 'achievements', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Competition Updates</Label>
                    <p className="text-sm text-gray-400">Updates about competitions and tournaments</p>
                  </div>
                  <Switch
                    checked={settings.notifications.competitions}
                    onCheckedChange={(checked) => updateSetting('notifications', 'competitions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">New Followers</Label>
                    <p className="text-sm text-gray-400">Get notified when someone follows you</p>
                  </div>
                  <Switch
                    checked={settings.notifications.followers}
                    onCheckedChange={(checked) => updateSetting('notifications', 'followers', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visibility" className="space-y-6 mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-cyan-400" />
                  Profile Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label className="text-white">Who can see your profile?</Label>
                  
                  <div className="space-y-3">
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        settings.visibility === 'public' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => updateTopLevelSetting('visibility', 'public')}
                    >
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="text-white font-medium">Public</div>
                          <div className="text-sm text-gray-400">
                            Anyone can view your profile and stats
                          </div>
                        </div>
                        {settings.visibility === 'public' && (
                          <Badge className="bg-primary/20 text-primary ml-auto">Selected</Badge>
                        )}
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        settings.visibility === 'friends' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => updateTopLevelSetting('visibility', 'friends')}
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-white font-medium">Friends Only</div>
                          <div className="text-sm text-gray-400">
                            Only people you follow can see your detailed stats
                          </div>
                        </div>
                        {settings.visibility === 'friends' && (
                          <Badge className="bg-primary/20 text-primary ml-auto">Selected</Badge>
                        )}
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        settings.visibility === 'private' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => updateTopLevelSetting('visibility', 'private')}
                    >
                      <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-red-400" />
                        <div>
                          <div className="text-white font-medium">Private</div>
                          <div className="text-sm text-gray-400">
                            Only you can see your detailed profile information
                          </div>
                        </div>
                        {settings.visibility === 'private' && (
                          <Badge className="bg-primary/20 text-primary ml-auto">Selected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-black"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
