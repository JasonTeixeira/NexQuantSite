"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Bell, AlertTriangle, CheckCircle, Clock, Eye, 
  Mail, MessageSquare, Smartphone, Webhook, Plus,
  Settings, Trash2, Volume2, VolumeX, Filter,
  Target, Zap, Brain, Crown, Activity, Users
} from "lucide-react"
import type { OptionsFlow } from "@/lib/options-flow-data"

interface AlertRule {
  id: string
  name: string
  description: string
  enabled: boolean
  conditions: AlertCondition[]
  channels: AlertChannel[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'flow' | 'gamma' | 'smart-money' | 'unusual' | 'custom'
  cooldown: number // minutes
  lastTriggered?: Date
  triggerCount: number
  createdAt: Date
}

interface AlertCondition {
  id: string
  type: 'volume' | 'premium' | 'smart-money-score' | 'unusual-activity' | 'gamma-squeeze' | 'symbol'
  operator: '>' | '<' | '=' | '>=' | '<=' | 'contains'
  value: string | number
  symbol?: string
  timeframe?: string
}

interface AlertChannel {
  id: string
  type: 'in-app' | 'email' | 'sms' | 'discord' | 'telegram' | 'webhook' | 'push'
  config: {
    url?: string
    email?: string
    phone?: string
    template?: string
  }
  enabled: boolean
}

interface Alert {
  id: string
  ruleId: string
  ruleName: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  timestamp: Date
  read: boolean
  dismissed: boolean
  data?: any
}

interface IntelligentAlertsProps {
  flows: OptionsFlow[]
  className?: string
}

export default function IntelligentAlerts({ flows, className = "" }: IntelligentAlertsProps) {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [newRuleName, setNewRuleName] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Initialize with example data
  useEffect(() => {
    const exampleRules: AlertRule[] = [
      {
        id: '1',
        name: 'Large Smart Money Flow',
        description: 'Alert when institutional flow exceeds $1M premium',
        enabled: true,
        priority: 'high',
        category: 'smart-money',
        cooldown: 15,
        triggerCount: 23,
        createdAt: new Date(Date.now() - 86400000 * 7),
        lastTriggered: new Date(Date.now() - 1800000),
        conditions: [
          {
            id: 'cond-1',
            type: 'premium',
            operator: '>',
            value: 1000000,
            timeframe: '5m'
          },
          {
            id: 'cond-2',
            type: 'smart-money-score',
            operator: '>=',
            value: 80
          }
        ],
        channels: [
          {
            id: 'chan-1',
            type: 'in-app',
            enabled: true,
            config: { template: 'Smart Money Alert: {{symbol}} - ${{premium}}' }
          },
          {
            id: 'chan-2',
            type: 'discord',
            enabled: true,
            config: { 
              url: 'https://discord.com/api/webhooks/...',
              template: '🚨 **Smart Money Alert** 🚨\n{{symbol}}: ${{premium}} institutional flow'
            }
          }
        ]
      },
      {
        id: '2',
        name: 'Gamma Squeeze Risk',
        description: 'Critical alert for high gamma squeeze probability',
        enabled: true,
        priority: 'critical',
        category: 'gamma',
        cooldown: 30,
        triggerCount: 8,
        createdAt: new Date(Date.now() - 86400000 * 14),
        lastTriggered: new Date(Date.now() - 7200000),
        conditions: [
          {
            id: 'cond-3',
            type: 'gamma-squeeze',
            operator: '>',
            value: 85
          }
        ],
        channels: [
          {
            id: 'chan-3',
            type: 'email',
            enabled: true,
            config: { 
              email: 'trader@example.com',
              template: 'CRITICAL: Gamma squeeze risk {{risk}}% on {{symbol}}'
            }
          },
          {
            id: 'chan-4',
            type: 'sms',
            enabled: true,
            config: { 
              phone: '+1234567890',
              template: 'GAMMA ALERT: {{symbol}} {{risk}}% squeeze risk'
            }
          }
        ]
      },
      {
        id: '3',
        name: 'Unusual Activity Spike',
        description: 'Detect unusual options activity across all symbols',
        enabled: true,
        priority: 'medium',
        category: 'unusual',
        cooldown: 10,
        triggerCount: 45,
        createdAt: new Date(Date.now() - 86400000 * 3),
        lastTriggered: new Date(Date.now() - 600000),
        conditions: [
          {
            id: 'cond-4',
            type: 'unusual-activity',
            operator: '>',
            value: 5,
            timeframe: '1m'
          }
        ],
        channels: [
          {
            id: 'chan-5',
            type: 'in-app',
            enabled: true,
            config: { template: 'Unusual Activity: {{count}} symbols showing abnormal flow' }
          }
        ]
      }
    ]

    const exampleAlerts: Alert[] = [
      {
        id: '1',
        ruleId: '1',
        ruleName: 'Large Smart Money Flow',
        title: 'Smart Money Alert',
        message: 'AAPL: $1.2M institutional flow detected with 92% smart money score',
        priority: 'high',
        category: 'smart-money',
        timestamp: new Date(Date.now() - 300000), // 5 mins ago
        read: false,
        dismissed: false,
        data: { symbol: 'AAPL', premium: 1200000, score: 92 }
      },
      {
        id: '2',
        ruleId: '2',
        ruleName: 'Gamma Squeeze Risk',
        title: 'CRITICAL: Gamma Squeeze Risk',
        message: 'SPY showing 89% gamma squeeze probability. High risk detected.',
        priority: 'critical',
        category: 'gamma',
        timestamp: new Date(Date.now() - 1800000), // 30 mins ago
        read: true,
        dismissed: false,
        data: { symbol: 'SPY', risk: 89 }
      },
      {
        id: '3',
        ruleId: '3',
        ruleName: 'Unusual Activity Spike',
        title: 'Unusual Activity',
        message: '7 symbols showing unusual options activity in the last minute',
        priority: 'medium',
        category: 'unusual',
        timestamp: new Date(Date.now() - 600000), // 10 mins ago
        read: true,
        dismissed: false,
        data: { count: 7 }
      }
    ]

    setAlertRules(exampleRules)
    setAlerts(exampleAlerts)
  }, [])

  const createAlertRule = () => {
    if (!newRuleName.trim()) return

    const newRule: AlertRule = {
      id: Date.now().toString(),
      name: newRuleName,
      description: 'New alert rule',
      enabled: true,
      priority: 'medium',
      category: 'custom',
      cooldown: 15,
      triggerCount: 0,
      createdAt: new Date(),
      conditions: [],
      channels: []
    }

    setAlertRules([...alertRules, newRule])
    setSelectedRule(newRule)
    setNewRuleName("")
    setIsCreateMode(false)
  }

  const toggleRule = (ruleId: string) => {
    setAlertRules(rules =>
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    )
  }

  const deleteRule = (ruleId: string) => {
    setAlertRules(rules => rules.filter(rule => rule.id !== ruleId))
    if (selectedRule?.id === ruleId) {
      setSelectedRule(null)
    }
  }

  const markAsRead = (alertId: string) => {
    setAlerts(alerts =>
      alerts.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    )
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts =>
      alerts.map(alert =>
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    )
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'text-blue-400 border-blue-400/30',
      'medium': 'text-yellow-400 border-yellow-400/30',
      'high': 'text-orange-400 border-orange-400/30',
      'critical': 'text-red-400 border-red-400/30'
    }
    return colors[priority as keyof typeof colors] || 'text-gray-400 border-gray-400/30'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      'flow': Activity,
      'gamma': Target,
      'smart-money': Crown,
      'unusual': AlertTriangle,
      'custom': Settings
    }
    return icons[category as keyof typeof icons] || Bell
  }

  const getChannelIcon = (type: string) => {
    const icons = {
      'in-app': Bell,
      'email': Mail,
      'sms': Smartphone,
      'discord': MessageSquare,
      'telegram': MessageSquare,
      'webhook': Webhook,
      'push': Volume2
    }
    return icons[type as keyof typeof icons] || Bell
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filteredAlerts = alerts.filter(alert => {
    if (alert.dismissed) return false
    if (filterPriority !== 'all' && alert.priority !== filterPriority) return false
    if (filterCategory !== 'all' && alert.category !== filterCategory) return false
    return true
  })

  const unreadCount = alerts.filter(a => !a.read && !a.dismissed).length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-600/40 flex items-center justify-center"
            animate={{
              boxShadow: unreadCount > 0 ? [
                "0 0 20px rgba(239, 68, 68, 0.3)",
                "0 0 30px rgba(219, 39, 119, 0.5)",
                "0 0 20px rgba(239, 68, 68, 0.3)"
              ] : []
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bell className="w-6 h-6 text-red-400" />
            {unreadCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Intelligent Alerts</h2>
            <p className="text-gray-400">AI-powered notification system</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge className="bg-red-500/20 text-red-400 border border-red-400/30">
            {unreadCount} Unread
          </Badge>
          <Badge className="bg-primary/20 text-primary border border-primary/30">
            {alertRules.filter(r => r.enabled).length} Active Rules
          </Badge>
          <Button
            onClick={() => setIsCreateMode(true)}
            className="bg-primary/20 text-primary hover:bg-primary/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-primary/20 mb-6">
          <TabsTrigger value="alerts">Active Alerts ({filteredAlerts.length})</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules ({alertRules.length})</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters */}
            <div className="lg:col-span-1">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Priority</Label>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="bg-black/60 border-primary/30 mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="bg-black/60 border-primary/30 mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="flow">Flow</SelectItem>
                        <SelectItem value="gamma">Gamma</SelectItem>
                        <SelectItem value="smart-money">Smart Money</SelectItem>
                        <SelectItem value="unusual">Unusual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <Button
                      onClick={() => {
                        setFilterPriority('all')
                        setFilterCategory('all')
                      }}
                      variant="ghost"
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts List */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredAlerts.map((alert, index) => {
                    const CategoryIcon = getCategoryIcon(alert.category)
                    
                    return (
                      <motion.div
                        key={alert.id}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          !alert.read 
                            ? 'bg-primary/5 border-primary/30 shadow-lg' 
                            : 'bg-black/20 border-primary/10'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <CategoryIcon className={`w-5 h-5 mt-1 ${
                              alert.priority === 'critical' ? 'text-red-400' :
                              alert.priority === 'high' ? 'text-orange-400' :
                              alert.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                            }`} />
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-semibold">{alert.title}</h3>
                                <Badge className={getPriorityColor(alert.priority)}>
                                  {alert.priority.toUpperCase()}
                                </Badge>
                                {!alert.read && (
                                  <Badge className="bg-primary/20 text-primary text-xs">
                                    NEW
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-gray-300 mb-2">{alert.message}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>Rule: {alert.ruleName}</span>
                                <span>•</span>
                                <span>{formatTimeAgo(alert.timestamp)}</span>
                                <span>•</span>
                                <span className="capitalize">{alert.category}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {!alert.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(alert.id)}
                                className="p-2"
                              >
                                <Eye className="w-4 h-4 text-blue-400" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => dismissAlert(alert.id)}
                              className="p-2 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {filteredAlerts.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Alerts</h3>
                    <p className="text-gray-400">
                      {alerts.filter(a => a.dismissed).length > 0 
                        ? "All alerts have been dismissed" 
                        : "No alerts match your current filters"
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rules List */}
            <div className="lg:col-span-1">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Alert Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Create New Rule */}
                  {isCreateMode && (
                    <motion.div
                      className="p-4 border-2 border-dashed border-primary/30 rounded-lg mb-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="space-y-3">
                        <Input
                          placeholder="Rule name..."
                          value={newRuleName}
                          onChange={(e) => setNewRuleName(e.target.value)}
                          className="bg-black/60 border-primary/30"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={createAlertRule}
                            disabled={!newRuleName.trim()}
                            size="sm"
                            className="flex-1"
                          >
                            Create
                          </Button>
                          <Button
                            onClick={() => setIsCreateMode(false)}
                            variant="ghost"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {alertRules.map((rule, index) => {
                    const CategoryIcon = getCategoryIcon(rule.category)
                    
                    return (
                      <motion.div
                        key={rule.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                          selectedRule?.id === rule.id
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-primary/20 hover:border-primary/40 bg-black/20'
                        }`}
                        onClick={() => setSelectedRule(rule)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={() => toggleRule(rule.id)}
                            />
                            <Badge className={getPriorityColor(rule.priority)}>
                              {rule.priority}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteRule(rule.id)
                            }}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className="w-4 h-4 text-primary" />
                          <h3 className="text-white font-medium text-sm">{rule.name}</h3>
                        </div>
                        
                        <p className="text-gray-400 text-xs mb-2">{rule.description}</p>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">
                            {rule.conditions.length} conditions • {rule.channels.length} channels
                          </span>
                          <span className="text-primary">
                            {rule.triggerCount} triggers
                          </span>
                        </div>
                        
                        {rule.lastTriggered && (
                          <div className="text-xs text-gray-500 mt-1">
                            Last: {formatTimeAgo(rule.lastTriggered)}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Rule Editor */}
            <div className="lg:col-span-2">
              {selectedRule ? (
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        {selectedRule.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(selectedRule.priority)}>
                          {selectedRule.priority}
                        </Badge>
                        <Switch
                          checked={selectedRule.enabled}
                          onCheckedChange={() => toggleRule(selectedRule.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Rule Name</Label>
                        <Input
                          value={selectedRule.name}
                          className="bg-black/40 border-primary/20 mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Priority</Label>
                        <Select value={selectedRule.priority}>
                          <SelectTrigger className="bg-black/40 border-primary/20 mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300">Description</Label>
                      <Textarea
                        value={selectedRule.description}
                        className="bg-black/40 border-primary/20 mt-2"
                        rows={3}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Conditions</h4>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Condition
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedRule.conditions.map((condition, index) => (
                          <div key={condition.id} className="p-3 bg-black/20 rounded-lg border border-primary/10">
                            <div className="grid grid-cols-3 gap-3">
                              <Select value={condition.type}>
                                <SelectTrigger className="bg-black/40 border-primary/20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="volume">Volume</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                  <SelectItem value="smart-money-score">Smart Money Score</SelectItem>
                                  <SelectItem value="unusual-activity">Unusual Activity</SelectItem>
                                  <SelectItem value="gamma-squeeze">Gamma Squeeze</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Select value={condition.operator}>
                                <SelectTrigger className="bg-black/40 border-primary/20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value=">">Greater than</SelectItem>
                                  <SelectItem value="<">Less than</SelectItem>
                                  <SelectItem value="=">=Equals</SelectItem>
                                  <SelectItem value=">=">=Greater or equal</SelectItem>
                                  <SelectItem value="<=">=Less or equal</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Input
                                value={condition.value.toString()}
                                placeholder="Value..."
                                className="bg-black/40 border-primary/20"
                              />
                            </div>
                            
                            {condition.symbol && (
                              <div className="mt-2">
                                <Label className="text-gray-400 text-xs">Symbol: {condition.symbol}</Label>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {selectedRule.conditions.length === 0 && (
                          <div className="text-center py-6 text-gray-400">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No conditions defined</p>
                            <p className="text-sm">Add conditions to trigger this alert</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Notification Channels</h4>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Channel
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedRule.channels.map((channel) => {
                          const ChannelIcon = getChannelIcon(channel.type)
                          
                          return (
                            <div key={channel.id} className="p-3 bg-black/20 rounded-lg border border-primary/10">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <ChannelIcon className="w-4 h-4 text-primary" />
                                  <span className="text-white capitalize">{channel.type.replace('-', ' ')}</span>
                                </div>
                                <Switch checked={channel.enabled} />
                              </div>
                              
                              {channel.config.template && (
                                <div className="text-xs text-gray-400 font-mono p-2 bg-black/40 rounded">
                                  {channel.config.template}
                                </div>
                              )}
                              
                              {channel.config.email && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Email: {channel.config.email}
                                </div>
                              )}
                              
                              {channel.config.phone && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Phone: {channel.config.phone}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        
                        {selectedRule.channels.length === 0 && (
                          <div className="text-center py-6 text-gray-400">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No notification channels</p>
                            <p className="text-sm">Add channels to receive alerts</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-primary">{selectedRule.triggerCount}</div>
                          <div className="text-xs text-gray-400">Total Triggers</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-400">
                            {selectedRule.enabled ? 'Active' : 'Inactive'}
                          </div>
                          <div className="text-xs text-gray-400">Status</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-400">
                            {selectedRule.cooldown}m
                          </div>
                          <div className="text-xs text-gray-400">Cooldown</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">Select an Alert Rule</h3>
                      <p className="text-gray-400">Choose a rule from the list to configure conditions and channels</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="channels">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { type: 'in-app', name: 'In-App Notifications', icon: Bell, enabled: true, description: 'Show alerts within the platform' },
              { type: 'email', name: 'Email Alerts', icon: Mail, enabled: true, description: 'Send alerts via email' },
              { type: 'sms', name: 'SMS Notifications', icon: Smartphone, enabled: false, description: 'Send alerts via SMS' },
              { type: 'discord', name: 'Discord Webhook', icon: MessageSquare, enabled: true, description: 'Post alerts to Discord channel' },
              { type: 'telegram', name: 'Telegram Bot', icon: MessageSquare, enabled: false, description: 'Send via Telegram bot' },
              { type: 'webhook', name: 'Custom Webhook', icon: Webhook, enabled: true, description: 'Send to custom endpoint' },
              { type: 'push', name: 'Push Notifications', icon: Volume2, enabled: false, description: 'Browser push notifications' },
              { type: 'slack', name: 'Slack Integration', icon: MessageSquare, enabled: false, description: 'Post to Slack channels' }
            ].map((channel, index) => (
              <motion.div
                key={channel.type}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  channel.enabled 
                    ? 'border-primary/40 bg-primary/5' 
                    : 'border-gray-600 bg-black/20'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <channel.icon className={`w-6 h-6 ${
                    channel.enabled ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <Switch checked={channel.enabled} />
                </div>
                
                <h3 className={`font-semibold mb-2 ${
                  channel.enabled ? 'text-white' : 'text-gray-400'
                }`}>
                  {channel.name}
                </h3>
                
                <p className="text-gray-400 text-sm">{channel.description}</p>
                
                {channel.enabled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-3 text-primary hover:text-primary"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info */}
      <motion.div
        className="text-center p-6 bg-black/20 rounded-xl border border-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Brain className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-semibold text-white">AI-Powered Alert Intelligence</span>
        </div>
        <p className="text-xs text-gray-400 max-w-4xl mx-auto">
          Advanced machine learning algorithms automatically filter noise and prioritize critical alerts. 
          Multi-channel delivery ensures you never miss important market events. Smart cooldown periods 
          prevent alert fatigue while maintaining high accuracy.
        </p>
      </motion.div>
    </div>
  )
}
