"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, User, Tag, Send, Paperclip, FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface TicketMessage {
  id: string
  author: {
    name: string
    email: string
    role: "customer" | "agent" | "system"
    avatar?: string
  }
  content: string
  timestamp: Date
  attachments?: {
    name: string
    url: string
    type: string
  }[]
  isInternal?: boolean
}

interface TicketDetails {
  id: string
  subject: string
  description: string
  customer: {
    name: string
    email: string
    avatar?: string
    tier: "free" | "premium" | "enterprise"
    joinDate: Date
    totalTickets: number
  }
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: "technical" | "billing" | "general" | "feature-request"
  assignedTo?: {
    name: string
    email: string
    avatar?: string
  }
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  tags: string[]
  messages: TicketMessage[]
  satisfaction?: {
    rating: number
    feedback: string
  }
}

interface TicketManagementProps {
  ticketId: string
  onClose: () => void
}

export default function TicketManagement({ ticketId, onClose }: TicketManagementProps) {
  const [ticket, setTicket] = useState<TicketDetails>({
    id: "TK-001",
    subject: "Unable to access premium signals",
    description:
      "I'm having trouble accessing my premium trading signals. When I try to view them, I get an error message saying 'Access Denied'. I've tried refreshing the page and logging out/in but the issue persists.",
    customer: {
      name: "John Smith",
      email: "john.smith@email.com",
      tier: "premium",
      joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      totalTickets: 3,
    },
    status: "open",
    priority: "high",
    category: "technical",
    assignedTo: {
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    tags: ["signals", "premium", "access", "urgent"],
    messages: [
      {
        id: "msg-1",
        author: {
          name: "John Smith",
          email: "john.smith@email.com",
          role: "customer",
        },
        content:
          "I'm having trouble accessing my premium trading signals. When I try to view them, I get an error message saying 'Access Denied'. I've tried refreshing the page and logging out/in but the issue persists.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "msg-2",
        author: {
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          role: "agent",
        },
        content:
          "Hi John, thank you for reaching out. I can see your premium subscription is active. Let me check your account permissions and get back to you shortly.",
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
      },
      {
        id: "msg-3",
        author: {
          name: "System",
          email: "system@company.com",
          role: "system",
        },
        content: "Ticket assigned to Sarah Johnson",
        timestamp: new Date(Date.now() - 85 * 60 * 1000),
      },
      {
        id: "msg-4",
        author: {
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          role: "agent",
        },
        content:
          "I've identified the issue - there was a temporary sync problem with your subscription status. I've manually refreshed your permissions. Please try accessing the signals now and let me know if you still encounter any issues.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  })

  const [newMessage, setNewMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [newStatus, setNewStatus] = useState(ticket.status)
  const [newPriority, setNewPriority] = useState(ticket.priority)
  const [newAssignee, setNewAssignee] = useState(ticket.assignedTo?.name || "")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "closed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
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
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "premium":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "free":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: TicketMessage = {
      id: `msg-${Date.now()}`,
      author: {
        name: "Current Agent",
        email: "agent@company.com",
        role: "agent",
      },
      content: newMessage,
      timestamp: new Date(),
      isInternal,
    }

    setTicket((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      updatedAt: new Date(),
    }))

    setNewMessage("")
    toast.success(isInternal ? "Internal note added" : "Message sent to customer")
  }

  const handleUpdateTicket = () => {
    setTicket((prev) => ({
      ...prev,
      status: newStatus as any,
      priority: newPriority as any,
      updatedAt: new Date(),
      resolvedAt: newStatus === "resolved" ? new Date() : prev.resolvedAt,
    }))

    toast.success("Ticket updated successfully")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4" />
      case "in-progress":
        return <Clock className="w-4 h-4" />
      case "resolved":
        return <CheckCircle className="w-4 h-4" />
      case "closed":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Ticket Details Sidebar */}
      <div className="space-y-6">
        {/* Customer Info */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-black">
                  {ticket.customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-white">{ticket.customer.name}</h3>
                <p className="text-sm text-gray-400">{ticket.customer.email}</p>
                <Badge className={getTierColor(ticket.customer.tier)}>{ticket.customer.tier}</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Member since:</span>
                <span className="text-white">{ticket.customer.joinDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total tickets:</span>
                <span className="text-white">{ticket.customer.totalTickets}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Info */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Ticket Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Status</label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as "open" | "closed" | "in-progress" | "resolved")}>
                <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400">Priority</label>
              <Select value={newPriority} onValueChange={(value) => setNewPriority(value as "low" | "medium" | "high" | "urgent")}>
                <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400">Assigned To</label>
              <Select value={newAssignee} onValueChange={setNewAssignee}>
                <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="Mike Wilson">Mike Wilson</SelectItem>
                  <SelectItem value="Lisa Brown">Lisa Brown</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-white">{ticket.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Updated:</span>
                <span className="text-white">{ticket.updatedAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span className="text-white capitalize">{ticket.category.replace("-", " ")}</span>
              </div>
            </div>

            <Button onClick={handleUpdateTicket} className="w-full bg-primary hover:bg-primary/80 text-black">
              Update Ticket
            </Button>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="border-gray-600 text-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
            <Input placeholder="Add new tag..." className="mt-3 bg-gray-800/50 border-gray-700 text-white" />
          </CardContent>
        </Card>
      </div>

      {/* Main Conversation Area */}
      <div className="lg:col-span-2">
        <Card className="bg-gray-900/50 border-gray-800 h-full flex flex-col">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">{ticket.subject}</CardTitle>
                <CardDescription className="text-gray-400 flex items-center space-x-2 mt-1">
                  <span>#{ticket.id}</span>
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1">{ticket.status}</span>
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                </CardDescription>
              </div>
              <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 bg-transparent">
                Close
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {ticket.messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    {message.author.role === "system" ? (
                      <div className="flex justify-center">
                        <div className="bg-gray-700/50 rounded-lg px-3 py-1">
                          <p className="text-xs text-gray-400">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex items-start space-x-3 ${message.author.role === "agent" ? "justify-end" : ""}`}
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
                            className={`max-w-2xl ${
                              message.author.role === "agent" ? "bg-primary text-black" : "bg-gray-800 text-white"
                            } rounded-lg p-3`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{message.author.name}</span>
                              <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            {message.isInternal && (
                              <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 text-xs">Internal Note</Badge>
                            )}
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
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-gray-700 p-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm text-gray-400">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-800"
                      />
                      <span>Internal note</span>
                    </label>
                    <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 bg-transparent">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setNewMessage("")}
                      className="border-gray-700 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-primary hover:bg-primary/80 text-black"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isInternal ? "Add Note" : "Send Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
