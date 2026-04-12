"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Clock,
  Smile,
  Paperclip,
  MoreVertical,
  UserPlus,
  Volume2,
  VolumeX,
  Settings,
  Headphones,
  Users,
} from "lucide-react"
import { toast } from "sonner"

interface ChatMessage {
  id: string
  author: {
    name: string
    role: "customer" | "agent" | "system"
    avatar?: string
  }
  content: string
  timestamp: Date
  type: "text" | "image" | "file" | "system"
}

interface ChatSession {
  id: string
  customer: {
    name: string
    email: string
    avatar?: string
    tier: "free" | "premium" | "enterprise"
    location?: string
    browser?: string
  }
  agent?: {
    name: string
    email: string
    avatar?: string
  }
  status: "waiting" | "active" | "ended"
  startTime: Date
  endTime?: Date
  messages: ChatMessage[]
  satisfaction?: {
    rating: number
    feedback: string
  }
  tags: string[]
  priority: "low" | "medium" | "high"
}

export default function LiveChatManagement() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize mock data
  useEffect(() => {
    const mockSessions: ChatSession[] = [
      {
        id: "chat-001",
        customer: {
          name: "Robert Johnson",
          email: "robert.j@email.com",
          tier: "premium",
          location: "New York, US",
          browser: "Chrome 118",
        },
        agent: {
          name: "Sarah Johnson",
          email: "sarah@company.com",
        },
        status: "active",
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        messages: [
          {
            id: "msg-1",
            author: { name: "Robert Johnson", role: "customer" },
            content: "Hi, I'm having trouble with my premium signals not updating",
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            type: "text",
          },
          {
            id: "msg-2",
            author: { name: "Sarah Johnson", role: "agent" },
            content: "Hello Robert! I'd be happy to help you with that. Let me check your account status first.",
            timestamp: new Date(Date.now() - 14 * 60 * 1000),
            type: "text",
          },
          {
            id: "msg-3",
            author: { name: "System", role: "system" },
            content: "Agent Sarah Johnson joined the chat",
            timestamp: new Date(Date.now() - 14 * 60 * 1000),
            type: "system",
          },
          {
            id: "msg-4",
            author: { name: "Sarah Johnson", role: "agent" },
            content:
              "I can see your premium subscription is active. The signals should be updating every 5 minutes. Are you seeing any error messages?",
            timestamp: new Date(Date.now() - 12 * 60 * 1000),
            type: "text",
          },
          {
            id: "msg-5",
            author: { name: "Robert Johnson", role: "customer" },
            content: "No error messages, but the last update was 2 hours ago",
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            type: "text",
          },
        ],
        tags: ["signals", "premium", "technical"],
        priority: "medium",
      },
      {
        id: "chat-002",
        customer: {
          name: "Maria Garcia",
          email: "maria.g@email.com",
          tier: "free",
          location: "Madrid, ES",
          browser: "Firefox 119",
        },
        status: "waiting",
        startTime: new Date(Date.now() - 5 * 60 * 1000),
        messages: [
          {
            id: "msg-1",
            author: { name: "Maria Garcia", role: "customer" },
            content: "Hello, I'd like to know more about your premium plans",
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            type: "text",
          },
          {
            id: "msg-2",
            author: { name: "Maria Garcia", role: "customer" },
            content: "Is anyone available to help?",
            timestamp: new Date(Date.now() - 2 * 60 * 1000),
            type: "text",
          },
        ],
        tags: ["sales", "pricing"],
        priority: "low",
      },
      {
        id: "chat-003",
        customer: {
          name: "Alex Chen",
          email: "alex.chen@email.com",
          tier: "enterprise",
          location: "Singapore, SG",
          browser: "Safari 17",
        },
        status: "waiting",
        startTime: new Date(Date.now() - 1 * 60 * 1000),
        messages: [
          {
            id: "msg-1",
            author: { name: "Alex Chen", role: "customer" },
            content: "Urgent: Our API integration is failing",
            timestamp: new Date(Date.now() - 1 * 60 * 1000),
            type: "text",
          },
        ],
        tags: ["api", "enterprise", "urgent"],
        priority: "high",
      },
    ]

    setSessions(mockSessions)
    setActiveSession(mockSessions[0])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "ended":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "premium":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "free":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeSession) return

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      author: {
        name: "Current Agent",
        role: "agent",
      },
      content: newMessage,
      timestamp: new Date(),
      type: "text",
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id ? { ...session, messages: [...session.messages, message] } : session,
      ),
    )

    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, message],
          }
        : null,
    )

    setNewMessage("")
    toast.success("Message sent")
  }

  const handleJoinChat = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "active",
              agent: {
                name: "Current Agent",
                email: "agent@company.com",
              },
            }
          : session,
      ),
    )

    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      setActiveSession({
        ...session,
        status: "active",
        agent: {
          name: "Current Agent",
          email: "agent@company.com",
        },
      })
    }

    toast.success("Joined chat session")
  }

  const handleEndChat = () => {
    if (!activeSession) return

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id ? { ...session, status: "ended", endTime: new Date() } : session,
      ),
    )

    setActiveSession(null)
    toast.success("Chat session ended")
  }

  const waitingSessions = sessions.filter((s) => s.status === "waiting")
  const activeSessions = sessions.filter((s) => s.status === "active")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Chat Sessions Sidebar */}
      <div className="space-y-6">
        {/* Chat Stats */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Headphones className="w-5 h-5 mr-2" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Active Chats</span>
              <Badge className="bg-green-500/20 text-green-400">{activeSessions.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Waiting</span>
              <Badge className="bg-orange-500/20 text-orange-400">{waitingSessions.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Avg Response</span>
              <span className="text-sm text-white">1.2 min</span>
            </div>
          </CardContent>
        </Card>

        {/* Waiting Queue */}
        {waitingSessions.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-400" />
                Waiting Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {waitingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70 cursor-pointer transition-all"
                      onClick={() => handleJoinChat(session.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-black text-xs">
                              {session.customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">{session.customer.name}</p>
                            <Badge className={getTierColor(session.customer.tier)}>{session.customer.tier}</Badge>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(session.priority)}>{session.priority}</Badge>
                      </div>
                      <p className="text-xs text-gray-400">
                        Waiting {Math.floor((Date.now() - session.startTime.getTime()) / 60000)}m
                      </p>
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-primary hover:bg-primary/80 text-black"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoinChat(session.id)
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Chat
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Active Sessions */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-400" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activeSession?.id === session.id
                        ? "bg-gray-800/70 border-primary/50"
                        : "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
                    }`}
                    onClick={() => setActiveSession(session)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary text-black text-xs">
                            {session.customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{session.customer.name}</p>
                          <Badge className={getTierColor(session.customer.tier)}>{session.customer.tier}</Badge>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      {session.agent?.name} • {Math.floor((Date.now() - session.startTime.getTime()) / 60000)}m
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Controls */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Sound Notifications</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`border-gray-700 ${soundEnabled ? "text-green-400" : "text-gray-400"}`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
            <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent">
              <Settings className="w-4 h-4 mr-2" />
              Chat Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3">
        {activeSession ? (
          <Card className="bg-gray-900/50 border-gray-800 h-full flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-black">
                      {activeSession.customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-white text-lg">{activeSession.customer.name}</CardTitle>
                    <CardDescription className="text-gray-400 flex items-center space-x-2">
                      <span>{activeSession.customer.email}</span>
                      <Badge className={getTierColor(activeSession.customer.tier)}>{activeSession.customer.tier}</Badge>
                    </CardDescription>
                    <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                      <span>{activeSession.customer.location}</span>
                      <span>•</span>
                      <span>{activeSession.customer.browser}</span>
                      <span>•</span>
                      <span>Duration: {Math.floor((Date.now() - activeSession.startTime.getTime()) / 60000)}m</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(activeSession.status)}>{activeSession.status}</Badge>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeSession.messages.map((message) => (
                    <div key={message.id}>
                      {message.type === "system" ? (
                        <div className="flex justify-center">
                          <div className="bg-gray-700/50 rounded-lg px-3 py-1">
                            <p className="text-xs text-gray-400">{message.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`flex items-start space-x-3 ${
                            message.author.role === "agent" ? "justify-end" : ""
                          }`}
                        >
                          {message.author.role === "customer" && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-500 text-white text-xs">
                                {message.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={`flex-1 ${message.author.role === "agent" ? "flex justify-end" : ""}`}>
                            <div
                              className={`max-w-xs rounded-lg p-3 ${
                                message.author.role === "agent" ? "bg-primary text-black" : "bg-gray-800 text-white"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.author.role === "agent" ? "text-black/70" : "text-gray-400"
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          {message.author.role === "agent" && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-green-500 text-white text-xs">
                                {message.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                          {activeSession.customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="border-t border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-gray-800/50 border-gray-700 text-white"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-primary hover:bg-primary/80 text-black"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>Agent: {activeSession.agent?.name || "Current Agent"}</span>
                    <span>•</span>
                    <span>Response time: 1.2 min avg</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEndChat}
                    className="border-red-700 text-red-400 hover:bg-red-900/20 bg-transparent"
                  >
                    End Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-900/50 border-gray-800 h-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-xl font-medium text-white mb-2">No Active Chat</h3>
              <p className="text-gray-400 mb-4">Select a chat session to start helping customers</p>
              {waitingSessions.length > 0 && (
                <Button
                  onClick={() => handleJoinChat(waitingSessions[0].id)}
                  className="bg-primary hover:bg-primary/80 text-black"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Next in Queue
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
