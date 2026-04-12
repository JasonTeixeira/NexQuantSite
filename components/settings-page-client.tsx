"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings, User, TrendingUp, Monitor, Bell, Shield, Key, Globe, Clock, Palette, Volume2, Eye, EyeOff, Trash2, Download, Upload, RefreshCw, AlertTriangle, Check, Copy, Plus, Minus } from 'lucide-react'

interface SettingsState {
  general: {
    language: string
    timezone: string
    dateFormat: string
    theme: string
    autoSave: boolean
    soundEnabled: boolean
  }
  trading: {
    defaultRiskPercent: number[]
    maxPositions: number[]
    autoCloseEnabled: boolean
    confirmTrades: boolean
    showPnL: boolean
    alertsEnabled: boolean
    stopLossDefault: number[]
    takeProfitDefault: number[]
  }
  display: {
    chartTheme: string
    defaultTimeframe: string
    showGrid: boolean
    showVolume: boolean
    candlestickStyle: string
    fontSize: string
    compactMode: boolean
  }
  notifications: {
    email: {
      trades: boolean
      signals: boolean
      news: boolean
      system: boolean
    }
    push: {
      trades: boolean
      signals: boolean
      priceAlerts: boolean
      maintenance: boolean
    }
    desktop: {
      enabled: boolean
      sound: boolean
      position: string
    }
  }
  privacy: {
    profileVisible: boolean
    showTradingStats: boolean
    allowMessages: boolean
    shareData: boolean
    twoFactorEnabled: boolean
  }
  api: {
    keys: Array<{
      id: string
      name: string
      key: string
      permissions: string[]
      created: string
      lastUsed: string
      active: boolean
    }>
    rateLimit: number[]
    webhookUrl: string
    ipWhitelist: string[]
  }
}

const defaultSettings: SettingsState = {
  general: {
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    theme: "dark",
    autoSave: true,
    soundEnabled: true
  },
  trading: {
    defaultRiskPercent: [2],
    maxPositions: [10],
    autoCloseEnabled: false,
    confirmTrades: true,
    showPnL: true,
    alertsEnabled: true,
    stopLossDefault: [2],
    takeProfitDefault: [6]
  },
  display: {
    chartTheme: "dark",
    defaultTimeframe: "1h",
    showGrid: true,
    showVolume: true,
    candlestickStyle: "candles",
    fontSize: "medium",
    compactMode: false
  },
  notifications: {
    email: {
      trades: true,
      signals: true,
      news: false,
      system: true
    },
    push: {
      trades: true,
      signals: true,
      priceAlerts: true,
      maintenance: true
    },
    desktop: {
      enabled: true,
      sound: true,
      position: "top-right"
    }
  },
  privacy: {
    profileVisible: true,
    showTradingStats: true,
    allowMessages: true,
    shareData: false,
    twoFactorEnabled: false
  },
  api: {
    keys: [
      {
        id: "1",
        name: "Trading Bot",
        key: "sk_live_1234567890abcdef...",
        permissions: ["read", "trade"],
        created: "2024-01-15",
        lastUsed: "2 hours ago",
        active: true
      }
    ],
    rateLimit: [1000],
    webhookUrl: "",
    ipWhitelist: []
  }
}

export default function SettingsPageClient() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [activeTab, setActiveTab] = useState("general")
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({})
  const [newIpAddress, setNewIpAddress] = useState("")

  const handleSaveSettings = () => {
    // Save settings logic
    console.log("Settings saved:", settings)
  }

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: "New API Key",
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}...`,
      permissions: ["read"],
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never",
      active: true
    }
    setSettings({
      ...settings,
      api: {
        ...settings.api,
        keys: [...settings.api.keys, newKey]
      }
    })
  }

  const deleteApiKey = (keyId: string) => {
    setSettings({
      ...settings,
      api: {
        ...settings.api,
        keys: settings.api.keys.filter(key => key.id !== keyId)
      }
    })
  }

  const addIpAddress = () => {
    if (newIpAddress && !settings.api.ipWhitelist.includes(newIpAddress)) {
      setSettings({
        ...settings,
        api: {
          ...settings.api,
          ipWhitelist: [...settings.api.ipWhitelist, newIpAddress]
        }
      })
      setNewIpAddress("")
    }
  }

  const removeIpAddress = (ip: string) => {
    setSettings({
      ...settings,
      api: {
        ...settings.api,
        ipWhitelist: settings.api.ipWhitelist.filter(address => address !== ip)
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account preferences and trading configuration</p>
          </div>

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-gray-900/50 border border-gray-800">
              <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Globe className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="trading" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trading
              </TabsTrigger>
              <TabsTrigger value="display" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Monitor className="w-4 h-4 mr-2" />
                Display
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Shield className="w-4 h-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Key className="w-4 h-4 mr-2" />
                API
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    General Preferences
                  </CardTitle>
                  <CardDescription>Configure your basic account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={settings.general.language} onValueChange={(value) => 
                        setSettings({...settings, general: {...settings.general, language: value}})
                      }>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={settings.general.timezone} onValueChange={(value) => 
                        setSettings({...settings, general: {...settings.general, timezone: value}})
                      }>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Europe/Paris">Paris</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select value={settings.general.dateFormat} onValueChange={(value) => 
                        setSettings({...settings, general: {...settings.general, dateFormat: value}})
                      }>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={settings.general.theme} onValueChange={(value) => 
                        setSettings({...settings, general: {...settings.general, theme: value}})
                      }>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Auto-save Settings</div>
                        <div className="text-sm text-gray-400">Automatically save changes as you make them</div>
                      </div>
                      <Switch
                        checked={settings.general.autoSave}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, general: {...settings.general, autoSave: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Sound Effects</div>
                        <div className="text-sm text-gray-400">Enable sound notifications and feedback</div>
                      </div>
                      <Switch
                        checked={settings.general.soundEnabled}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, general: {...settings.general, soundEnabled: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trading Settings */}
            <TabsContent value="trading" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Trading Configuration
                  </CardTitle>
                  <CardDescription>Configure your trading preferences and risk management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Default Risk Per Trade</Label>
                        <p className="text-sm text-gray-400 mb-3">Percentage of account to risk per trade</p>
                        <Slider
                          value={settings.trading.defaultRiskPercent}
                          onValueChange={(value) => 
                            setSettings({...settings, trading: {...settings.trading, defaultRiskPercent: value}})
                          }
                          max={10}
                          min={0.1}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400 mt-1">
                          <span>0.1%</span>
                          <span className="text-primary font-medium">{settings.trading.defaultRiskPercent[0]}%</span>
                          <span>10%</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-base font-medium">Maximum Positions</Label>
                        <p className="text-sm text-gray-400 mb-3">Maximum number of concurrent positions</p>
                        <Slider
                          value={settings.trading.maxPositions}
                          onValueChange={(value) => 
                            setSettings({...settings, trading: {...settings.trading, maxPositions: value}})
                          }
                          max={50}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400 mt-1">
                          <span>1</span>
                          <span className="text-primary font-medium">{settings.trading.maxPositions[0]}</span>
                          <span>50</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Default Stop Loss</Label>
                        <p className="text-sm text-gray-400 mb-3">Default stop loss percentage</p>
                        <Slider
                          value={settings.trading.stopLossDefault}
                          onValueChange={(value) => 
                            setSettings({...settings, trading: {...settings.trading, stopLossDefault: value}})
                          }
                          max={10}
                          min={0.5}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400 mt-1">
                          <span>0.5%</span>
                          <span className="text-primary font-medium">{settings.trading.stopLossDefault[0]}%</span>
                          <span>10%</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-base font-medium">Default Take Profit</Label>
                        <p className="text-sm text-gray-400 mb-3">Default take profit percentage</p>
                        <Slider
                          value={settings.trading.takeProfitDefault}
                          onValueChange={(value) => 
                            setSettings({...settings, trading: {...settings.trading, takeProfitDefault: value}})
                          }
                          max={20}
                          min={1}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400 mt-1">
                          <span>1%</span>
                          <span className="text-primary font-medium">{settings.trading.takeProfitDefault[0]}%</span>
                          <span>20%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Auto-close at Market Close</div>
                        <div className="text-sm text-gray-400">Automatically close positions at market close</div>
                      </div>
                      <Switch
                        checked={settings.trading.autoCloseEnabled}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, trading: {...settings.trading, autoCloseEnabled: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Confirm Trades</div>
                        <div className="text-sm text-gray-400">Require confirmation before executing trades</div>
                      </div>
                      <Switch
                        checked={settings.trading.confirmTrades}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, trading: {...settings.trading, confirmTrades: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Show P&L in Real-time</div>
                        <div className="text-sm text-gray-400">Display profit/loss updates in real-time</div>
                      </div>
                      <Switch
                        checked={settings.trading.showPnL}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, trading: {...settings.trading, showPnL: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Trading Alerts</div>
                        <div className="text-sm text-gray-400">Enable alerts for trading opportunities</div>
                      </div>
                      <Switch
                        checked={settings.trading.alertsEnabled}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, trading: {...settings.trading, alertsEnabled: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Display Settings */}
            <TabsContent value="display" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    Display Preferences
                  </CardTitle>
                  <CardDescription>Customize the appearance of charts and interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="chartTheme">Chart Theme</Label>
                      <Select value={settings.display.chartTheme} onValueChange={(value) => 
                        setSettings({...settings, display: {...settings.display, chartTheme: value}})
                      }>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="pro">Pro Dark</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultTimeframe">Default Timeframe</Label>
                      <Select value={settings.display.defaultTimeframe} onValueChange={(value) => 
                        setSettings({...settings, display: {...settings.display, defaultTimeframe: value}})
                      }>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="1m">1 Minute</SelectItem>
                          <SelectItem value="5m">5 Minutes</SelectItem>
                          <SelectItem value="15m">15 Minutes</SelectItem>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="4h">4 Hours</SelectItem>
                          <SelectItem value="1d">1 Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candlestickStyle">Candlestick Style</Label>
                      <Select value={settings.display.candlestickStyle} onValueChange={(value) => 
                        setSettings({...settings, display: {...settings.display, candlestickStyle: value}})
                      }>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="candles">Candlesticks</SelectItem>
                          <SelectItem value="bars">OHLC Bars</SelectItem>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <Select value={settings.display.fontSize} onValueChange={(value) => 
                        setSettings({...settings, display: {...settings.display, fontSize: value}})
                      }>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="extra-large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Show Grid Lines</div>
                        <div className="text-sm text-gray-400">Display grid lines on charts</div>
                      </div>
                      <Switch
                        checked={settings.display.showGrid}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, display: {...settings.display, showGrid: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Show Volume</div>
                        <div className="text-sm text-gray-400">Display volume bars below charts</div>
                      </div>
                      <Switch
                        checked={settings.display.showVolume}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, display: {...settings.display, showVolume: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Compact Mode</div>
                        <div className="text-sm text-gray-400">Use compact layout to show more information</div>
                      </div>
                      <Switch
                        checked={settings.display.compactMode}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, display: {...settings.display, compactMode: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Configure how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Email Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Trade Executions</div>
                          <div className="text-sm text-gray-400">Get notified when trades are executed</div>
                        </div>
                        <Switch
                          checked={settings.notifications.email.trades}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                email: {...settings.notifications.email, trades: checked}
                              }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Trading Signals</div>
                          <div className="text-sm text-gray-400">New trading opportunities and signals</div>
                        </div>
                        <Switch
                          checked={settings.notifications.email.signals}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                email: {...settings.notifications.email, signals: checked}
                              }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Market News</div>
                          <div className="text-sm text-gray-400">Important market news and updates</div>
                        </div>
                        <Switch
                          checked={settings.notifications.email.news}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                email: {...settings.notifications.email, news: checked}
                              }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">System Updates</div>
                          <div className="text-sm text-gray-400">Platform updates and maintenance notices</div>
                        </div>
                        <Switch
                          checked={settings.notifications.email.system}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                email: {...settings.notifications.email, system: checked}
                              }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <h4 className="font-medium text-white">Push Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Trade Executions</div>
                          <div className="text-sm text-gray-400">Instant notifications for trade executions</div>
                        </div>
                        <Switch
                          checked={settings.notifications.push.trades}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                push: {...settings.notifications.push, trades: checked}
                              }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Trading Signals</div>
                          <div className="text-sm text-gray-400">Real-time trading opportunities</div>
                        </div>
                        <Switch
                          checked={settings.notifications.push.signals}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                push: {...settings.notifications.push, signals: checked}
                              }
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
                          checked={settings.notifications.push.priceAlerts}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                push: {...settings.notifications.push, priceAlerts: checked}
                              }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Maintenance Alerts</div>
                          <div className="text-sm text-gray-400">System maintenance and downtime notices</div>
                        </div>
                        <Switch
                          checked={settings.notifications.push.maintenance}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                push: {...settings.notifications.push, maintenance: checked}
                              }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Desktop Notifications */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <h4 className="font-medium text-white">Desktop Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Enable Desktop Notifications</div>
                          <div className="text-sm text-gray-400">Show notifications on your desktop</div>
                        </div>
                        <Switch
                          checked={settings.notifications.desktop.enabled}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                desktop: {...settings.notifications.desktop, enabled: checked}
                              }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Sound Alerts</div>
                          <div className="text-sm text-gray-400">Play sound with desktop notifications</div>
                        </div>
                        <Switch
                          checked={settings.notifications.desktop.sound}
                          onCheckedChange={(checked) => 
                            setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications,
                                desktop: {...settings.notifications.desktop, sound: checked}
                              }
                            })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notificationPosition">Notification Position</Label>
                        <Select value={settings.notifications.desktop.position} onValueChange={(value) => 
                          setSettings({
                            ...settings, 
                            notifications: {
                              ...settings.notifications,
                              desktop: {...settings.notifications.desktop, position: value}
                            }
                          })
                        }>
                          <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>Control your privacy settings and data sharing preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Public Profile</div>
                        <div className="text-sm text-gray-400">Make your profile visible to other users</div>
                      </div>
                      <Switch
                        checked={settings.privacy.profileVisible}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, privacy: {...settings.privacy, profileVisible: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Show Trading Statistics</div>
                        <div className="text-sm text-gray-400">Display your trading performance publicly</div>
                      </div>
                      <Switch
                        checked={settings.privacy.showTradingStats}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, privacy: {...settings.privacy, showTradingStats: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Allow Direct Messages</div>
                        <div className="text-sm text-gray-400">Let other users send you private messages</div>
                      </div>
                      <Switch
                        checked={settings.privacy.allowMessages}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, privacy: {...settings.privacy, allowMessages: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Share Anonymous Data</div>
                        <div className="text-sm text-gray-400">Help improve our platform with anonymous usage data</div>
                      </div>
                      <Switch
                        checked={settings.privacy.shareData}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, privacy: {...settings.privacy, shareData: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-400">Add an extra layer of security to your account</div>
                      </div>
                      <Switch
                        checked={settings.privacy.twoFactorEnabled}
                        onCheckedChange={(checked) => 
                          setSettings({...settings, privacy: {...settings.privacy, twoFactorEnabled: checked}})
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <h4 className="font-medium text-white">Data Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="border-gray-700 text-gray-300">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                      <Button variant="outline" className="border-gray-700 text-gray-300">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Cache
                      </Button>
                      <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* API Settings */}
            <TabsContent value="api" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    API Management
                  </CardTitle>
                  <CardDescription>Manage your API keys and integration settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* API Keys */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">API Keys</h4>
                      <Button onClick={generateApiKey} className="bg-primary text-black hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate New Key
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {settings.api.keys.map((key) => (
                        <div key={key.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-medium">{key.name}</div>
                              <div className="text-sm text-gray-400">
                                Created: {key.created} • Last used: {key.lastUsed}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={key.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                                {key.active ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteApiKey(key.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <code className="bg-gray-900 px-3 py-1 rounded text-sm font-mono flex-1">
                              {showApiKey[key.id] ? key.key : key.key.replace(/./g, '•')}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey({...showApiKey, [key.id]: !showApiKey[key.id]})}
                              className="text-gray-400 hover:text-white"
                            >
                              {showApiKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(key.key)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {key.permissions.map((permission) => (
                              <Badge key={permission} variant="secondary" className="bg-primary/20 text-primary">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rate Limiting */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <h4 className="font-medium text-white">Rate Limiting</h4>
                    <div>
                      <Label className="text-base font-medium">Requests per Hour</Label>
                      <p className="text-sm text-gray-400 mb-3">Maximum API requests per hour</p>
                      <Slider
                        value={settings.api.rateLimit}
                        onValueChange={(value) => 
                          setSettings({...settings, api: {...settings.api, rateLimit: value}})
                        }
                        max={10000}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-400 mt-1">
                        <span>100</span>
                        <span className="text-primary font-medium">{settings.api.rateLimit[0]}</span>
                        <span>10,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Webhook Configuration */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <h4 className="font-medium text-white">Webhook Configuration</h4>
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input
                        id="webhookUrl"
                        value={settings.api.webhookUrl}
                        onChange={(e) => setSettings({...settings, api: {...settings.api, webhookUrl: e.target.value}})}
                        placeholder="https://your-domain.com/webhook"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                      <p className="text-sm text-gray-400">
                        Receive real-time notifications about trades and account events
                      </p>
                    </div>
                  </div>

                  {/* IP Whitelist */}
                  <div className="space-y-4 border-t border-gray-800 pt-6">
                    <h4 className="font-medium text-white">IP Whitelist</h4>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newIpAddress}
                          onChange={(e) => setNewIpAddress(e.target.value)}
                          placeholder="192.168.1.1"
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                        <Button onClick={addIpAddress} className="bg-primary text-black hover:bg-primary/90">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {settings.api.ipWhitelist.map((ip, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-800/30 rounded px-3 py-2">
                            <code className="text-sm">{ip}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIpAddress(ip)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {settings.api.ipWhitelist.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-4">
                            No IP addresses whitelisted. API access allowed from any IP.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="bg-primary text-black hover:bg-primary/90">
              <Settings className="w-4 h-4 mr-2" />
              Save All Settings
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
