"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, MessageSquare, Share, Video, Mic, MicOff, 
  VideoOff, ScreenShare, ScreenShareOff, Bell, BellOff,
  Pin, Eye, EyeOff, Star, Heart, ThumbsUp, ThumbsDown,
  Send, Paperclip, Image, MoreVertical, Crown, Shield,
  Clock, Target, TrendingUp, AlertTriangle, Zap, Bot, X
} from "lucide-react"

interface User {
  id: string
  name: string
  avatar: string
  role: 'admin' | 'analyst' | 'trader' | 'viewer'
  status: 'online' | 'away' | 'busy' | 'offline'
  location: string
  joinedAt: Date
  permissions: {
    canEdit: boolean
    canShare: boolean
    canInvite: boolean
    canModerate: boolean
  }
  activity: {
    lastActive: Date
    viewingTab: string
    currentSymbol: string
  }
}

interface Message {
  id: string
  userId: string
  content: string
  type: 'text' | 'trade-alert' | 'analysis' | 'system' | 'image' | 'chart'
  timestamp: Date
  reactions: { emoji: string; count: number; users: string[] }[]
  isImportant: boolean
  mentions: string[]
  attachments?: {
    type: 'chart' | 'analysis' | 'image'
    url: string
    title: string
  }[]
}

interface LiveSession {
  id: string
  name: string
  host: string
  participants: string[]
  startTime: Date
  type: 'voice' | 'video' | 'screen-share'
  topic: string
  recording: boolean
}

interface SharedView {
  id: string
  userId: string
  title: string
  description: string
  symbol: string
  tab: string
  settings: any
  timestamp: Date
  likes: number
  comments: number
  isPublic: boolean
}

interface CollaborationHubProps {
  className?: string
}

export default function CollaborationHub({ className = "" }: CollaborationHubProps) {
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([])
  const [sharedViews, setSharedViews] = useState<SharedView[]>([])
  const [isInVoiceCall, setIsInVoiceCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [notifications, setNotifications] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUser = {
    id: '1',
    name: 'You',
    avatar: '',
    role: 'admin' as const,
    status: 'online' as const
  }

  // Initialize with mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Alex Thompson',
        avatar: '',
        role: 'admin',
        status: 'online',
        location: 'New York',
        joinedAt: new Date(Date.now() - 3600000),
        permissions: { canEdit: true, canShare: true, canInvite: true, canModerate: true },
        activity: { lastActive: new Date(), viewingTab: 'live-flow', currentSymbol: 'SPY' }
      },
      {
        id: '2',
        name: 'Sarah Chen',
        avatar: '',
        role: 'analyst',
        status: 'online',
        location: 'San Francisco',
        joinedAt: new Date(Date.now() - 7200000),
        permissions: { canEdit: true, canShare: true, canInvite: false, canModerate: false },
        activity: { lastActive: new Date(Date.now() - 300000), viewingTab: 'gamma-squeeze', currentSymbol: 'AAPL' }
      },
      {
        id: '3',
        name: 'Mike Rodriguez',
        avatar: '',
        role: 'trader',
        status: 'busy',
        location: 'Chicago',
        joinedAt: new Date(Date.now() - 1800000),
        permissions: { canEdit: false, canShare: true, canInvite: false, canModerate: false },
        activity: { lastActive: new Date(Date.now() - 600000), viewingTab: 'charts', currentSymbol: 'TSLA' }
      },
      {
        id: '4',
        name: 'Emma Wilson',
        avatar: '',
        role: 'viewer',
        status: 'away',
        location: 'London',
        joinedAt: new Date(Date.now() - 10800000),
        permissions: { canEdit: false, canShare: false, canInvite: false, canModerate: false },
        activity: { lastActive: new Date(Date.now() - 1200000), viewingTab: 'heatmap', currentSymbol: 'QQQ' }
      }
    ]

    const mockMessages: Message[] = [
      {
        id: '1',
        userId: '2',
        content: 'SPY showing unusual call activity at $480 strike. Volume is 5x normal.',
        type: 'trade-alert',
        timestamp: new Date(Date.now() - 1800000),
        reactions: [
          { emoji: '👀', count: 3, users: ['1', '3', '4'] },
          { emoji: '🔥', count: 2, users: ['1', '3'] }
        ],
        isImportant: true,
        mentions: ['1']
      },
      {
        id: '2',
        userId: '1',
        content: 'Great catch! I see the same pattern. Smart money seems to be positioning for a move above $480.',
        type: 'text',
        timestamp: new Date(Date.now() - 1740000),
        reactions: [{ emoji: '💯', count: 1, users: ['2'] }],
        isImportant: false,
        mentions: []
      },
      {
        id: '3',
        userId: '3',
        content: 'TSLA gamma squeeze risk is spiking. AI model shows 87% probability.',
        type: 'analysis',
        timestamp: new Date(Date.now() - 900000),
        reactions: [
          { emoji: '⚡', count: 2, users: ['1', '2'] },
          { emoji: '🎯', count: 1, users: ['1'] }
        ],
        isImportant: true,
        mentions: [],
        attachments: [{
          type: 'chart',
          url: '#',
          title: 'TSLA Gamma Risk Analysis'
        }]
      },
      {
        id: '4',
        userId: '4',
        content: 'Thanks for sharing the analysis! Very helpful for understanding the setup.',
        type: 'text',
        timestamp: new Date(Date.now() - 600000),
        reactions: [],
        isImportant: false,
        mentions: ['3']
      }
    ]

    const mockSharedViews: SharedView[] = [
      {
        id: '1',
        userId: '2',
        title: 'SPY Gamma Squeeze Setup',
        description: 'Detailed analysis of the current SPY gamma levels and potential squeeze zones',
        symbol: 'SPY',
        tab: 'gamma-squeeze',
        settings: {},
        timestamp: new Date(Date.now() - 1800000),
        likes: 8,
        comments: 3,
        isPublic: true
      },
      {
        id: '2',
        userId: '1',
        title: 'Tech Sector Flow Heatmap',
        description: 'Real-time options flow across major tech stocks showing unusual activity',
        symbol: 'QQQ',
        tab: 'heatmap',
        settings: {},
        timestamp: new Date(Date.now() - 3600000),
        likes: 12,
        comments: 7,
        isPublic: true
      }
    ]

    setActiveUsers(mockUsers)
    setMessages(mockMessages)
    setSharedViews(mockSharedViews)
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!currentMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content: currentMessage,
      type: 'text',
      timestamp: new Date(),
      reactions: [],
      isImportant: false,
      mentions: []
    }

    setMessages([...messages, newMessage])
    setCurrentMessage("")
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(message => {
      if (message.id === messageId) {
        const existingReaction = message.reactions.find(r => r.emoji === emoji)
        if (existingReaction) {
          if (existingReaction.users.includes(currentUser.id)) {
            // Remove reaction
            return {
              ...message,
              reactions: message.reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser.id) }
                  : r
              ).filter(r => r.count > 0)
            }
          } else {
            // Add reaction
            return {
              ...message,
              reactions: message.reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, count: r.count + 1, users: [...r.users, currentUser.id] }
                  : r
              )
            }
          }
        } else {
          // New reaction
          return {
            ...message,
            reactions: [...message.reactions, { emoji, count: 1, users: [currentUser.id] }]
          }
        }
      }
      return message
    }))
  }

  const startVoiceCall = () => {
    setIsInVoiceCall(true)
    // In real implementation, this would initialize WebRTC
  }

  const shareCurrentView = () => {
    const newSharedView: SharedView = {
      id: Date.now().toString(),
      userId: currentUser.id,
      title: 'Current Analysis View',
      description: 'Shared view of current market analysis',
      symbol: 'SPY',
      tab: 'live-flow',
      settings: {},
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isPublic: true
    }
    
    setSharedViews([newSharedView, ...sharedViews])
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-400" />
      case 'analyst': return <TrendingUp className="w-4 h-4 text-blue-400" />
      case 'trader': return <Target className="w-4 h-4 text-green-400" />
      default: return <Eye className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400'
      case 'away': return 'bg-yellow-400'
      case 'busy': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const getUserName = (userId: string) => {
    const user = activeUsers.find(u => u.id === userId)
    return user?.name || 'Unknown User'
  }

  const getUserRole = (userId: string) => {
    const user = activeUsers.find(u => u.id === userId)
    return user?.role || 'viewer'
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
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/40 flex items-center justify-center"
            animate={{
              boxShadow: [
                "0 0 20px rgba(168, 85, 247, 0.3)",
                "0 0 30px rgba(236, 72, 153, 0.5)",
                "0 0 20px rgba(168, 85, 247, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Users className="w-6 h-6 text-purple-400" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Collaboration Hub</h2>
            <p className="text-gray-400">Real-time team collaboration & communication</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge className="bg-green-500/20 text-green-400 border border-green-400/30">
            {activeUsers.filter(u => u.status === 'online').length} Online
          </Badge>
          
          <div className="flex items-center gap-2">
            {!isInVoiceCall ? (
              <Button
                onClick={startVoiceCall}
                size="sm"
                className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Call
              </Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                  className={isMuted ? 'text-red-400' : 'text-green-400'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={isVideoOn ? 'text-blue-400' : 'text-gray-400'}
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={isScreenSharing ? 'text-primary' : 'text-gray-400'}
                >
                  {isScreenSharing ? <ScreenShare className="w-4 h-4" /> : <ScreenShareOff className="w-4 h-4" />}
                </Button>
              </div>
            )}
            
            <Button
              onClick={shareCurrentView}
              size="sm"
              className="bg-primary/20 text-primary hover:bg-primary/30"
            >
              <Share className="w-4 h-4 mr-2" />
              Share View
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Active Users */}
        <div className="lg:col-span-1">
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Team Members ({activeUsers.length})</span>
                <Button
                  onClick={() => setNotifications(!notifications)}
                  size="sm"
                  variant="ghost"
                  className="p-1"
                >
                  {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-purple-600/60 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-black`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm truncate">
                        {user.name}
                      </span>
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {user.activity.currentSymbol} • {user.activity.viewingTab}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.location} • {formatTimestamp(user.activity.lastActive)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Shared Views */}
          <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Share className="w-5 h-5 text-primary" />
                Shared Views
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-60 overflow-y-auto">
              {sharedViews.map((view, index) => (
                <motion.div
                  key={view.id}
                  className="p-3 bg-black/20 rounded-lg border border-primary/10 hover:border-primary/30 cursor-pointer transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-primary/20 text-primary text-xs">
                      {view.symbol}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Heart className="w-3 h-3" />
                      {view.likes}
                    </div>
                  </div>
                  
                  <h4 className="text-white font-medium text-sm mb-1">{view.title}</h4>
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">{view.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>by {getUserName(view.userId)}</span>
                    <span>{formatTimestamp(view.timestamp)}</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat & Communication */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-primary/20 mb-6">
              <TabsTrigger value="chat">Live Chat</TabsTrigger>
              <TabsTrigger value="alerts">Trade Alerts</TabsTrigger>
              <TabsTrigger value="analysis">Shared Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="chat">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardContent className="p-0">
                  {/* Messages */}
                  <div className="h-96 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          className={`flex gap-3 ${message.isImportant ? 'bg-primary/5 p-3 rounded-lg border-l-4 border-primary' : ''}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-purple-600/60 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">
                              {getUserName(message.userId).split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium text-sm">
                                {getUserName(message.userId)}
                              </span>
                              {getRoleIcon(getUserRole(message.userId))}
                              <span className="text-gray-500 text-xs">
                                {formatTimestamp(message.timestamp)}
                              </span>
                              {message.type === 'trade-alert' && (
                                <Badge className="bg-red-500/20 text-red-400 text-xs">
                                  ALERT
                                </Badge>
                              )}
                              {message.type === 'analysis' && (
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                  ANALYSIS
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-gray-300 text-sm mb-2">
                              {message.content}
                            </div>
                            
                            {message.attachments && (
                              <div className="flex gap-2 mb-2">
                                {message.attachments.map((attachment, idx) => (
                                  <div key={idx} className="p-2 bg-black/40 rounded border border-primary/20 text-xs text-primary">
                                    📊 {attachment.title}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {message.reactions.length > 0 && (
                              <div className="flex items-center gap-2 mb-1">
                                {message.reactions.map((reaction, idx) => (
                                  <Button
                                    key={idx}
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 px-2 text-xs bg-black/20 hover:bg-black/40"
                                    onClick={() => addReaction(message.id, reaction.emoji)}
                                  >
                                    {reaction.emoji} {reaction.count}
                                  </Button>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              {['👍', '👎', '❤️', '🔥', '💯', '👀'].map((emoji) => (
                                <Button
                                  key={emoji}
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-xs hover:bg-primary/10"
                                  onClick={() => addReaction(message.id, emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div className="border-t border-primary/10 p-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                          placeholder="Type a message... (@mention users, #symbols)"
                          className="bg-black/60 border-primary/30 text-white"
                        />
                      </div>
                      <Button
                        onClick={sendMessage}
                        disabled={!currentMessage.trim()}
                        className="bg-primary/20 text-primary hover:bg-primary/30"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Live Trade Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messages.filter(m => m.type === 'trade-alert' || m.type === 'analysis').map((alert) => (
                    <motion.div
                      key={alert.id}
                      className="p-4 bg-black/20 rounded-lg border-l-4 border-red-400"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={alert.type === 'trade-alert' ? 
                            "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                          }>
                            {alert.type === 'trade-alert' ? 'TRADE ALERT' : 'ANALYSIS'}
                          </Badge>
                          <span className="text-gray-400 text-sm">
                            by {getUserName(alert.userId)}
                          </span>
                        </div>
                        <span className="text-gray-500 text-xs">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                      
                      <div className="text-white text-sm">
                        {alert.content}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <Button size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                          Follow Alert
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <Card className="bg-black/40 backdrop-blur-sm border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Collaborative Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sharedViews.map((analysis) => (
                      <motion.div
                        key={analysis.id}
                        className="p-4 bg-black/20 rounded-lg border border-primary/10 hover:border-primary/30 cursor-pointer transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-primary/20 text-primary">
                            {analysis.symbol}
                          </Badge>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {analysis.likes}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {analysis.comments}
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-white font-semibold mb-2">{analysis.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{analysis.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>by {getUserName(analysis.userId)}</span>
                          <span>{formatTimestamp(analysis.timestamp)}</span>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1 bg-primary/20 text-primary hover:bg-primary/30">
                            Open Analysis
                          </Button>
                          <Button size="sm" variant="ghost" className="px-2">
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Voice Call Indicator */}
      {isInVoiceCall && (
        <motion.div
          className="fixed bottom-4 right-4 p-4 bg-black/90 backdrop-blur-sm rounded-xl border border-primary/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm">In call with {activeUsers.filter(u => u.status === 'online').length - 1} others</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 ${isMuted ? 'text-red-400' : 'text-green-400'}`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsInVoiceCall(false)}
                className="p-2 text-red-400 hover:bg-red-500/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
