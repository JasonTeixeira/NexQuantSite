"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Zap, Plus, Play, Pause, Settings, Trash2, Copy, Eye,
  ArrowRight, ArrowDown, GitBranch, Target, Bell, 
  Mail, MessageSquare, Webhook, Database, Cloud,
  Bot, Crown, Sparkles, Activity, AlertTriangle, Clock
} from "lucide-react"
import type { OptionsFlow } from "@/lib/options-flow-data"

interface WorkflowTrigger {
  id: string
  type: 'flow-volume' | 'unusual-activity' | 'gamma-squeeze' | 'smart-money' | 'price-change' | 'time-based'
  conditions: {
    symbol?: string
    operator: '>' | '<' | '=' | '>=' | '<=' | 'contains'
    value: string | number
    timeframe?: string
  }[]
  name: string
  enabled: boolean
}

interface WorkflowAction {
  id: string
  type: 'alert' | 'email' | 'webhook' | 'discord' | 'telegram' | 'database' | 'api-call'
  config: {
    title?: string
    message?: string
    url?: string
    method?: string
    headers?: { [key: string]: string }
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }
  enabled: boolean
}

interface Workflow {
  id: string
  name: string
  description: string
  triggers: WorkflowTrigger[]
  actions: WorkflowAction[]
  enabled: boolean
  createdAt: Date
  lastTriggered?: Date
  triggerCount: number
  category: 'trading' | 'alerts' | 'analysis' | 'reporting'
}

interface WorkflowAutomationProps {
  flows: OptionsFlow[]
  className?: string
}

export default function WorkflowAutomation({ flows, className = "" }: WorkflowAutomationProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [newWorkflowName, setNewWorkflowName] = useState("")

  // Initialize with example workflows
  useEffect(() => {
    const exampleWorkflows: Workflow[] = [
      {
        id: '1',
        name: 'Large Smart Money Alert',
        description: 'Alert when smart money flows exceed $1M premium',
        category: 'trading',
        enabled: true,
        createdAt: new Date(),
        triggerCount: 42,
        lastTriggered: new Date(Date.now() - 1800000), // 30 mins ago
        triggers: [
          {
            id: 'trigger-1',
            type: 'smart-money',
            name: 'Smart Money Volume Threshold',
            enabled: true,
            conditions: [
              { operator: '>', value: 1000000 },
              { operator: '>=', value: 80 }
            ]
          }
        ],
        actions: [
          {
            id: 'action-1',
            type: 'alert',
            enabled: true,
            config: {
              title: 'Smart Money Alert',
              message: 'Large institutional flow detected: {{premium}} premium on {{symbol}}',
              priority: 'high'
            }
          },
          {
            id: 'action-2',
            type: 'discord',
            enabled: true,
            config: {
              url: 'https://discord.com/api/webhooks/...',
              message: '🚨 **Smart Money Alert** 🚨\n{{symbol}}: ${{premium}} premium flow detected'
            }
          }
        ]
      },
      {
        id: '2',
        name: 'Gamma Squeeze Predictor',
        description: 'Monitor gamma squeeze risk and send critical alerts',
        category: 'analysis',
        enabled: true,
        createdAt: new Date(),
        triggerCount: 18,
        lastTriggered: new Date(Date.now() - 7200000), // 2 hours ago
        triggers: [
          {
            id: 'trigger-2',
            type: 'gamma-squeeze',
            name: 'High Gamma Risk',
            enabled: true,
            conditions: [
              { operator: '>', value: 80 },
              { symbol: 'SPY', operator: '=', value: 'SPY' }
            ]
          }
        ],
        actions: [
          {
            id: 'action-3',
            type: 'email',
            enabled: true,
            config: {
              title: 'CRITICAL: Gamma Squeeze Risk',
              message: 'High probability gamma squeeze detected on {{symbol}} with {{risk}}% risk score',
              priority: 'critical'
            }
          }
        ]
      },
      {
        id: '3',
        name: 'Daily Flow Summary',
        description: 'Send daily summary of unusual options activity',
        category: 'reporting',
        enabled: true,
        createdAt: new Date(),
        triggerCount: 7,
        triggers: [
          {
            id: 'trigger-3',
            type: 'time-based',
            name: 'Daily at 4PM EST',
            enabled: true,
            conditions: [
              { operator: '=', value: '16:00', timeframe: 'daily' }
            ]
          }
        ],
        actions: [
          {
            id: 'action-4',
            type: 'email',
            enabled: true,
            config: {
              title: 'Daily Options Flow Report',
              message: 'Summary of today\'s unusual activity and smart money flows',
              priority: 'medium'
            }
          }
        ]
      }
    ]
    
    setWorkflows(exampleWorkflows)
  }, [])

  const createWorkflow = () => {
    if (!newWorkflowName.trim()) return
    
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: newWorkflowName,
      description: 'New workflow automation',
      category: 'trading',
      enabled: true,
      createdAt: new Date(),
      triggerCount: 0,
      triggers: [],
      actions: []
    }
    
    setWorkflows([...workflows, newWorkflow])
    setSelectedWorkflow(newWorkflow)
    setNewWorkflowName("")
    setIsCreateMode(false)
  }

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(workflows.map(w =>
      w.id === workflowId ? { ...w, enabled: !w.enabled } : w
    ))
  }

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(workflows.filter(w => w.id !== workflowId))
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(null)
    }
  }

  const addTrigger = (workflow: Workflow) => {
    const newTrigger: WorkflowTrigger = {
      id: `trigger-${Date.now()}`,
      type: 'flow-volume',
      name: 'New Trigger',
      enabled: true,
      conditions: [{ operator: '>', value: 1000 }]
    }
    
    const updatedWorkflow = {
      ...workflow,
      triggers: [...workflow.triggers, newTrigger]
    }
    
    setSelectedWorkflow(updatedWorkflow)
    updateWorkflow(updatedWorkflow)
  }

  const addAction = (workflow: Workflow) => {
    const newAction: WorkflowAction = {
      id: `action-${Date.now()}`,
      type: 'alert',
      enabled: true,
      config: {
        title: 'New Alert',
        message: 'Workflow triggered for {{symbol}}',
        priority: 'medium'
      }
    }
    
    const updatedWorkflow = {
      ...workflow,
      actions: [...workflow.actions, newAction]
    }
    
    setSelectedWorkflow(updatedWorkflow)
    updateWorkflow(updatedWorkflow)
  }

  const updateWorkflow = (updatedWorkflow: Workflow) => {
    setWorkflows(workflows.map(w =>
      w.id === updatedWorkflow.id ? updatedWorkflow : w
    ))
  }

  const getTriggerIcon = (type: string) => {
    const icons = {
      'flow-volume': Activity,
      'unusual-activity': AlertTriangle,
      'gamma-squeeze': Target,
      'smart-money': Crown,
      'price-change': Zap,
      'time-based': Clock
    }
    return icons[type as keyof typeof icons] || Activity
  }

  const getActionIcon = (type: string) => {
    const icons = {
      'alert': Bell,
      'email': Mail,
      'webhook': Webhook,
      'discord': MessageSquare,
      'telegram': MessageSquare,
      'database': Database,
      'api-call': Cloud
    }
    return icons[type as keyof typeof icons] || Bell
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'trading': 'text-green-400 border-green-400/30',
      'alerts': 'text-yellow-400 border-yellow-400/30',
      'analysis': 'text-blue-400 border-blue-400/30',
      'reporting': 'text-purple-400 border-purple-400/30'
    }
    return colors[category as keyof typeof colors] || 'text-gray-400 border-gray-400/30'
  }

  const formatLastTriggered = (date?: Date) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

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
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/40 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(251, 146, 60, 0.3)",
                "0 0 30px rgba(239, 68, 68, 0.5)",
                "0 0 20px rgba(251, 146, 60, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="w-6 h-6 text-orange-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Workflow Automation</h2>
            <p className="text-gray-400">AI-powered trading automation engine</p>
          </div>
        </div>

        <Button
          onClick={() => setIsCreateMode(true)}
          className="bg-primary/20 text-primary hover:bg-primary/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <div className="lg:col-span-1">
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Active Workflows ({workflows.filter(w => w.enabled).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {workflows.map((workflow, index) => (
                  <motion.div
                    key={workflow.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      selectedWorkflow?.id === workflow.id
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-primary/20 hover:border-primary/40 bg-black/20'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={workflow.enabled}
                          onCheckedChange={() => toggleWorkflow(workflow.id)}
                        />
                        <Badge className={getCategoryColor(workflow.category)}>
                          {workflow.category}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteWorkflow(workflow.id)
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <h3 className="text-white font-semibold mb-1">{workflow.name}</h3>
                    <p className="text-gray-400 text-xs mb-3">{workflow.description}</p>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        {workflow.triggers.length} triggers • {workflow.actions.length} actions
                      </span>
                      <span className="text-primary">
                        {workflow.triggerCount} runs
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs mt-2">
                      <span className="text-gray-500">Last triggered:</span>
                      <span className="text-yellow-400">
                        {formatLastTriggered(workflow.lastTriggered)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Create New Workflow */}
              {isCreateMode && (
                <motion.div
                  className="p-4 border-2 border-dashed border-primary/30 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="space-y-3">
                    <Input
                      placeholder="Workflow name..."
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                      className="bg-black/60 border-primary/30"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={createWorkflow}
                        disabled={!newWorkflowName.trim()}
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
            </CardContent>
          </Card>
        </div>

        {/* Workflow Editor */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    {selectedWorkflow.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(selectedWorkflow.category)}>
                      {selectedWorkflow.category}
                    </Badge>
                    <Switch
                      checked={selectedWorkflow.enabled}
                      onCheckedChange={() => toggleWorkflow(selectedWorkflow.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="triggers" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-primary/20 mb-6">
                    <TabsTrigger value="triggers">Triggers</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="triggers" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">When should this workflow run?</h3>
                      <Button onClick={() => addTrigger(selectedWorkflow)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Trigger
                      </Button>
                    </div>
                    
                    {selectedWorkflow.triggers.map((trigger, index) => {
                      const TriggerIcon = getTriggerIcon(trigger.type)
                      return (
                        <div key={trigger.id} className="p-4 bg-black/20 rounded-lg border border-primary/10">
                          <div className="flex items-center gap-3 mb-3">
                            <TriggerIcon className="w-5 h-5 text-primary" />
                            <Input
                              value={trigger.name}
                              onChange={(e) => {
                                const updated = {
                                  ...selectedWorkflow,
                                  triggers: selectedWorkflow.triggers.map(t =>
                                    t.id === trigger.id ? { ...t, name: e.target.value } : t
                                  )
                                }
                                setSelectedWorkflow(updated)
                                updateWorkflow(updated)
                              }}
                              className="bg-black/40 border-primary/20"
                            />
                            <Switch
                              checked={trigger.enabled}
                              onCheckedChange={(checked) => {
                                const updated = {
                                  ...selectedWorkflow,
                                  triggers: selectedWorkflow.triggers.map(t =>
                                    t.id === trigger.id ? { ...t, enabled: checked } : t
                                  )
                                }
                                setSelectedWorkflow(updated)
                                updateWorkflow(updated)
                              }}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-300 text-xs">Trigger Type</Label>
                              <Select value={trigger.type}>
                                <SelectTrigger className="bg-black/40 border-primary/20 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="flow-volume">Flow Volume</SelectItem>
                                  <SelectItem value="unusual-activity">Unusual Activity</SelectItem>
                                  <SelectItem value="gamma-squeeze">Gamma Squeeze</SelectItem>
                                  <SelectItem value="smart-money">Smart Money</SelectItem>
                                  <SelectItem value="price-change">Price Change</SelectItem>
                                  <SelectItem value="time-based">Time Based</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-gray-300 text-xs">Conditions</Label>
                              <div className="text-xs text-gray-400 mt-1 p-2 bg-black/40 rounded">
                                {trigger.conditions.map((condition, i) => (
                                  <div key={i}>
                                    {condition.symbol && `Symbol: ${condition.symbol} • `}
                                    Value {condition.operator} {condition.value}
                                    {condition.timeframe && ` • ${condition.timeframe}`}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    
                    {selectedWorkflow.triggers.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No triggers configured</p>
                        <p className="text-sm">Add a trigger to activate this workflow</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">What should happen when triggered?</h3>
                      <Button onClick={() => addAction(selectedWorkflow)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Action
                      </Button>
                    </div>
                    
                    {selectedWorkflow.actions.map((action, index) => {
                      const ActionIcon = getActionIcon(action.type)
                      return (
                        <div key={action.id} className="p-4 bg-black/20 rounded-lg border border-primary/10">
                          <div className="flex items-center gap-3 mb-3">
                            <ActionIcon className="w-5 h-5 text-primary" />
                            <Input
                              value={action.config.title || ''}
                              onChange={(e) => {
                                const updated = {
                                  ...selectedWorkflow,
                                  actions: selectedWorkflow.actions.map(a =>
                                    a.id === action.id ? { 
                                      ...a, 
                                      config: { ...a.config, title: e.target.value }
                                    } : a
                                  )
                                }
                                setSelectedWorkflow(updated)
                                updateWorkflow(updated)
                              }}
                              placeholder="Action title..."
                              className="bg-black/40 border-primary/20"
                            />
                            <Switch
                              checked={action.enabled}
                              onCheckedChange={(checked) => {
                                const updated = {
                                  ...selectedWorkflow,
                                  actions: selectedWorkflow.actions.map(a =>
                                    a.id === action.id ? { ...a, enabled: checked } : a
                                  )
                                }
                                setSelectedWorkflow(updated)
                                updateWorkflow(updated)
                              }}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-300 text-xs">Action Type</Label>
                              <Select value={action.type}>
                                <SelectTrigger className="bg-black/40 border-primary/20 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="alert">In-App Alert</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="webhook">Webhook</SelectItem>
                                  <SelectItem value="discord">Discord</SelectItem>
                                  <SelectItem value="telegram">Telegram</SelectItem>
                                  <SelectItem value="database">Database</SelectItem>
                                  <SelectItem value="api-call">API Call</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-gray-300 text-xs">Priority</Label>
                              <Select value={action.config.priority || 'medium'}>
                                <SelectTrigger className="bg-black/40 border-primary/20 mt-1">
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
                          
                          <div className="mt-3">
                            <Label className="text-gray-300 text-xs">Message Template</Label>
                            <Textarea
                              value={action.config.message || ''}
                              onChange={(e) => {
                                const updated = {
                                  ...selectedWorkflow,
                                  actions: selectedWorkflow.actions.map(a =>
                                    a.id === action.id ? { 
                                      ...a, 
                                      config: { ...a.config, message: e.target.value }
                                    } : a
                                  )
                                }
                                setSelectedWorkflow(updated)
                                updateWorkflow(updated)
                              }}
                              placeholder="Use {{symbol}}, {{premium}}, {{risk}} for dynamic values..."
                              className="bg-black/40 border-primary/20 mt-1 text-sm"
                              rows={3}
                            />
                          </div>
                        </div>
                      )
                    })}
                    
                    {selectedWorkflow.actions.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No actions configured</p>
                        <p className="text-sm">Add an action to define what happens when triggered</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label className="text-gray-300">Workflow Name</Label>
                        <Input
                          value={selectedWorkflow.name}
                          onChange={(e) => {
                            const updated = { ...selectedWorkflow, name: e.target.value }
                            setSelectedWorkflow(updated)
                            updateWorkflow(updated)
                          }}
                          className="bg-black/40 border-primary/20 mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-300">Category</Label>
                        <Select
                          value={selectedWorkflow.category}
                          onValueChange={(value) => {
                            const updated = { ...selectedWorkflow, category: value as any }
                            setSelectedWorkflow(updated)
                            updateWorkflow(updated)
                          }}
                        >
                          <SelectTrigger className="bg-black/40 border-primary/20 mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trading">Trading</SelectItem>
                            <SelectItem value="alerts">Alerts</SelectItem>
                            <SelectItem value="analysis">Analysis</SelectItem>
                            <SelectItem value="reporting">Reporting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-gray-300">Description</Label>
                      <Textarea
                        value={selectedWorkflow.description}
                        onChange={(e) => {
                          const updated = { ...selectedWorkflow, description: e.target.value }
                          setSelectedWorkflow(updated)
                          updateWorkflow(updated)
                        }}
                        className="bg-black/40 border-primary/20 mt-2"
                        rows={3}
                      />
                    </div>
                    
                    <div className="p-4 bg-black/20 rounded-lg border border-primary/10">
                      <h4 className="text-white font-semibold mb-3">Statistics</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{selectedWorkflow.triggerCount}</div>
                          <div className="text-xs text-gray-400">Total Triggers</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">
                            {selectedWorkflow.enabled ? 'Active' : 'Paused'}
                          </div>
                          <div className="text-xs text-gray-400">Status</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-400">
                            {formatLastTriggered(selectedWorkflow.lastTriggered)}
                          </div>
                          <div className="text-xs text-gray-400">Last Run</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Workflow</h3>
                  <p className="text-gray-400">Choose a workflow from the list to configure triggers and actions</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Info */}
      <motion.div
        className="text-center p-6 bg-black/20 rounded-xl border border-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-semibold text-white">Advanced Workflow Automation</span>
        </div>
        <p className="text-xs text-gray-400 max-w-4xl mx-auto">
          Create sophisticated automation workflows with conditional triggers, multi-step actions, and enterprise integrations. 
          Build custom alerts, automated reports, and intelligent responses to market conditions with institutional-grade reliability.
        </p>
      </motion.div>
    </div>
  )
}
