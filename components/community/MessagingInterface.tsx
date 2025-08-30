"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Send,
  Search,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Archive,
  Pin,
  Mute,
  Trash2,
  Plus,
  Smile,
  Paperclip,
  Image as ImageIcon,
  File,
  Check,
  CheckCheck,
  Clock,
  User,
  Users,
  Edit3,
  Reply,
  Forward,
  Copy,
  Flag,
  X,
  ArrowLeft,
  Circle,
  Loader2,
  Settings,
  Bell,
  BellOff,
  Star,
  Heart,
  ThumbsUp,
  Zap
} from "lucide-react"
import { toast } from "sonner"
import Link from 'next/link'
import { format, isToday, isYesterday } from 'date-fns'

// Import hooks and file upload
import { 
  useConversations, 
  useConversation, 
  useSendMessage,
  useUsers 
} from '@/lib/hooks/use-community'
import { 
  useWebSocket, 
  useRealTimeMessages, 
  useTypingIndicator 
} from '@/lib/websocket/client'
import { FileUpload, FileUploadButton } from '@/components/ui/file-upload'
import type { Conversation, Message, User } from '@/lib/api/community-client'

interface MessagingInterfaceProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
  defaultConversationId?: string
}

export default function MessagingInterface({ 
  className,
  isOpen = true,
  onClose,
  defaultConversationId
}: MessagingInterfaceProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(defaultConversationId || null)
  const [newMessageText, setNewMessageText] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showConversationInfo, setShowConversationInfo] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // API hooks
  const { 
    data: conversations, 
    loading: conversationsLoading, 
    refetch: refetchConversations 
  } = useConversations({ search: searchQuery })

  const {
    data: selectedConversation,
    loading: conversationLoading,
    refetch: refetchConversation
  } = useConversation(selectedConversationId || '')

  const { sendMessage, loading: sendingMessage } = useSendMessage()

  // WebSocket hooks for real-time updates
  const { connected } = useWebSocket()
  const newMessage = useRealTimeMessages(selectedConversationId || undefined)
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(selectedConversationId || '')

  // Handle new real-time message
  useEffect(() => {
    if (newMessage) {
      refetchConversation()
      refetchConversations()
      scrollToBottom()
    }
  }, [newMessage, refetchConversation, refetchConversations])

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages, scrollToBottom])

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (selectedConversationId) {
      startTyping()
    }
  }, [selectedConversationId, startTyping])

  const handleStopTyping = useCallback(() => {
    if (selectedConversationId) {
      stopTyping()
    }
  }, [selectedConversationId, stopTyping])

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`
    } else {
      return format(date, 'MMM dd, HH:mm')
    }
  }

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessageText.trim() || !selectedConversationId) return

    const messageData = {
      conversationId: selectedConversationId,
      content: newMessageText.trim(),
      messageType: 'text' as const,
      replyTo: replyingTo?.id
    }

    const sent = await sendMessage(messageData)
    
    if (sent) {
      setNewMessageText('')
      setReplyingTo(null)
      handleStopTyping()
      refetchConversation()
      refetchConversations()
    }
  }

  // Handle message input changes
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessageText(e.target.value)
    
    if (e.target.value.trim()) {
      handleTyping()
    } else {
      handleStopTyping()
    }
  }

  // Message component
  const MessageBubble = ({ message, isOwn }: { message: Message, isOwn: boolean }) => {
    const [showActions, setShowActions] = useState(false)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {!isOwn && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={`/api/placeholder/32/32`} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Reply context */}
          {message.replyTo && (
            <div className="bg-gray-700/50 rounded-lg p-2 mb-2 border-l-2 border-blue-500 text-sm">
              <p className="text-gray-400">Replying to:</p>
              <p className="text-white truncate">Original message content...</p>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`relative px-4 py-2 rounded-2xl ${
              isOwn 
                ? 'bg-blue-600 text-white rounded-br-md' 
                : 'bg-gray-800 text-white rounded-bl-md'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                    <File className="w-4 h-4" />
                    <span className="text-xs">{attachment.filename}</span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Message reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <div key={index} className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-1">
                    <span className="text-xs">{getReactionEmoji(reaction.type)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message info */}
          <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span>{formatMessageTime(message.sentAt)}</span>
            {isOwn && (
              <div className="flex items-center gap-1">
                {message.isDelivered && <Check className="w-3 h-3" />}
                {message.isRead && <CheckCheck className="w-3 h-3 text-blue-400" />}
                {!message.isDelivered && <Clock className="w-3 h-3" />}
              </div>
            )}
            {message.isEdited && <span className="text-gray-500">(edited)</span>}
          </div>

          {/* Message actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex items-center gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(message)}
                  className="h-6 px-2 text-xs"
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  React
                </Button>

                {isOwn && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingMessage(message.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  // Get reaction emoji
  const getReactionEmoji = (type: string) => {
    switch (type) {
      case 'like': return '👍'
      case 'love': return '❤️'
      case 'laugh': return '😂'
      case 'surprise': return '😮'
      case 'sad': return '😢'
      case 'angry': return '😡'
      default: return '👍'
    }
  }

  // Conversation list item
  const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
    const isSelected = conversation.id === selectedConversationId
    const otherParticipant = conversation.participants[0] // Simplified - in real app, filter out current user

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-3 rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'bg-blue-600/20 border border-blue-500/50' 
            : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent'
        }`}
        onClick={() => setSelectedConversationId(conversation.id)}
      >
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherParticipant.avatar} />
              <AvatarFallback>{otherParticipant.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            {otherParticipant.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-white truncate">
                {otherParticipant.displayName}
              </span>
              <div className="flex items-center gap-2">
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(conversation.lastMessage.sentAt)}
                  </span>
                )}
                {conversation.isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
                {conversation.isMuted && <BellOff className="w-3 h-3 text-gray-500" />}
              </div>
            </div>

            {conversation.lastMessage && (
              <p className={`text-sm truncate mb-1 ${
                conversation.lastMessage.isRead ? 'text-gray-400' : 'text-white font-medium'
              }`}>
                {conversation.lastMessage.content}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {conversation.labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
              
              {conversation.unreadCount > 0 && (
                <Badge variant="default" className="bg-blue-600 text-white text-xs">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // New conversation modal
  const NewConversationModal = () => {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [userSearch, setUserSearch] = useState('')
    
    const { data: users, loading: usersLoading } = useUsers({ 
      search: userSearch,
      limit: 20 
    })

    const handleStartConversation = async () => {
      if (selectedUsers.length === 0) return

      // In a real app, you would create a new conversation
      toast.success('Conversation started!')
      setShowNewConversation(false)
      setSelectedUsers([])
    }

    return (
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-600"
              />
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {usersLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  users?.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id) 
                          ? 'bg-blue-600/20 border border-blue-500/50'
                          : 'hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        setSelectedUsers(prev => 
                          prev.includes(user.id) 
                            ? prev.filter(id => id !== user.id)
                            : [...prev, user.id]
                        )
                      }}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="font-medium text-white">{user.displayName}</p>
                        <p className="text-sm text-gray-400">@{user.username}</p>
                      </div>
                      
                      {selectedUsers.includes(user.id) && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setShowNewConversation(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStartConversation}
                disabled={selectedUsers.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Conversation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const content = (
    <div className={`bg-gray-950 text-white h-full flex ${className}`}>
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Messages</h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => setShowNewConversation(true)}
                className="bg-blue-600 hover:bg-blue-700 h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-600 h-9"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {conversationsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                <p>No conversations yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewConversation(true)}
                  className="mt-2"
                >
                  Start chatting
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Connection Status */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs">
            <Circle className={`w-2 h-2 ${connected ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
            <span className="text-gray-400">
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile back button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="md:hidden h-8 w-8 p-0"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>

                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.participants[0].avatar} />
                      <AvatarFallback>{selectedConversation.participants[0].displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedConversation.participants[0].isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {selectedConversation.participants[0].displayName}
                    </h3>
                    <div className="text-sm text-gray-400">
                      {selectedConversation.participants[0].isOnline ? (
                        'Online'
                      ) : (
                        `Last seen ${selectedConversation.participants[0].lastSeen}`
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConversationInfo(!showConversationInfo)}
                    className="h-8 w-8 p-0"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="mt-2 text-sm text-gray-400">
                  {typingUsers.length === 1 ? (
                    'Someone is typing...'
                  ) : (
                    `${typingUsers.length} people are typing...`
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversationLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  selectedConversation.messages?.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === 'current-user-id'} // In real app, use actual user ID
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-800">
              {/* Reply context */}
              {replyingTo && (
                <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border-l-2 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Replying to:</p>
                      <p className="text-sm text-white">{replyingTo.content}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyingTo(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1">
                  <div className="flex items-end gap-2 bg-gray-800 rounded-lg p-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    
                    <Input
                      value={newMessageText}
                      onChange={handleMessageInputChange}
                      placeholder="Type a message..."
                      className="border-none bg-transparent focus-visible:ring-0 flex-1"
                      disabled={sendingMessage}
                    />
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={!newMessageText.trim() || sendingMessage}
                  className="bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-400 mb-6">
                Choose from your existing conversations or start a new one
              </p>
              <Button
                onClick={() => setShowNewConversation(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Info Sidebar */}
      {showConversationInfo && selectedConversation && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 320 }}
          exit={{ width: 0 }}
          className="border-l border-gray-800 overflow-hidden"
        >
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarImage src={selectedConversation.participants[0].avatar} />
                  <AvatarFallback className="text-2xl">
                    {selectedConversation.participants[0].displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold text-white">
                  {selectedConversation.participants[0].displayName}
                </h3>
                <p className="text-sm text-gray-400">
                  @{selectedConversation.participants[0].displayName.toLowerCase().replace(' ', '')}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600">
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
              </div>

              <Separator className="bg-gray-800" />

              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  {selectedConversation.isMuted ? (
                    <>
                      <Bell className="w-4 h-4 mr-3" />
                      Unmute conversation
                    </>
                  ) : (
                    <>
                      <BellOff className="w-4 h-4 mr-3" />
                      Mute conversation
                    </>
                  )}
                </Button>
                
                <Button variant="ghost" className="w-full justify-start">
                  <Pin className="w-4 h-4 mr-3" />
                  Pin conversation
                </Button>
                
                <Button variant="ghost" className="w-full justify-start">
                  <Archive className="w-4 h-4 mr-3" />
                  Archive conversation
                </Button>
                
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete conversation
                </Button>
              </div>
            </div>
          </ScrollArea>
        </motion.div>
      )}

      {/* New Conversation Modal */}
      <NewConversationModal />
    </div>
  )

  if (isOpen && onClose) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-950 border-gray-800 max-w-7xl h-[90vh] p-0">
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return content
}

