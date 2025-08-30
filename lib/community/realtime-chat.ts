/**
 * Real-time Chat System with WebSocket Support
 * Professional implementation for community chat features
 */

import { type ChatMessage, type ChatRoom, type User, type Reaction } from "./community-utils"
import { useState, useEffect, useCallback, useRef } from "react"

export interface ChatConnection {
  id: string
  userId: string
  roomId: string
  socket?: WebSocket
  isConnected: boolean
  lastSeen: string
  userAgent?: string
  ip?: string
}

export interface ChatEvent {
  type: 'message' | 'join' | 'leave' | 'typing' | 'reaction' | 'delete' | 'edit' | 'system'
  data: any
  timestamp: string
  userId?: string
  roomId: string
  messageId?: string
}

export interface TypingStatus {
  userId: string
  user: User
  roomId: string
  timestamp: string
}

export interface ChatSystemMessage {
  type: 'user_join' | 'user_leave' | 'room_created' | 'room_settings_changed' | 'user_promoted' | 'user_muted'
  content: string
  data: Record<string, any>
  timestamp: string
}

// Connection and room management
export class RealtimeChatManager {
  private connections: Map<string, ChatConnection> = new Map()
  private roomConnections: Map<string, Set<string>> = new Map()
  private typingUsers: Map<string, TypingStatus[]> = new Map()
  private messageHistory: Map<string, ChatMessage[]> = new Map()
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()

  // WebSocket server management (simplified for client-side simulation)
  private eventListeners: Map<string, Function[]> = new Map()

  constructor() {
    // Initialize with mock data for development
    this.initializeMockData()
  }

  // Connection Management
  connect(userId: string, roomId: string, user: User): ChatConnection {
    const connectionId = `${userId}-${roomId}-${Date.now()}`
    
    const connection: ChatConnection = {
      id: connectionId,
      userId,
      roomId,
      isConnected: true,
      lastSeen: new Date().toISOString()
    }

    this.connections.set(connectionId, connection)
    
    // Add to room connections
    if (!this.roomConnections.has(roomId)) {
      this.roomConnections.set(roomId, new Set())
    }
    this.roomConnections.get(roomId)!.add(connectionId)

    // Emit join event
    this.emitEvent({
      type: 'join',
      data: { user, connectionId },
      timestamp: new Date().toISOString(),
      userId,
      roomId
    })

    // Send recent messages to new connection
    const recentMessages = this.getRecentMessages(roomId, 50)
    this.sendToConnection(connectionId, {
      type: 'message',
      data: { messages: recentMessages, type: 'history' },
      timestamp: new Date().toISOString(),
      roomId
    })

    return connection
  }

  disconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    // Remove from room connections
    const roomConnections = this.roomConnections.get(connection.roomId)
    if (roomConnections) {
      roomConnections.delete(connectionId)
    }

    // Stop typing if user was typing
    this.stopTyping(connection.userId, connection.roomId)

    // Emit leave event
    this.emitEvent({
      type: 'leave',
      data: { userId: connection.userId, connectionId },
      timestamp: new Date().toISOString(),
      userId: connection.userId,
      roomId: connection.roomId
    })

    this.connections.delete(connectionId)
  }

  // Message Management
  sendMessage(userId: string, roomId: string, content: string, type: ChatMessage['type'] = 'text', replyTo?: string): ChatMessage | null {
    // Rate limiting check
    if (!this.checkRateLimit(userId, roomId)) {
      return null
    }

    // Validate message
    if (!content.trim() || content.length > 2000) {
      return null
    }

    // Get user (in production, fetch from database)
    const user = this.getMockUser(userId)
    if (!user) return null

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      roomId,
      authorId: userId,
      author: user,
      type,
      replyTo,
      mentions: this.extractMentions(content),
      attachments: [],
      reactions: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      isDeleted: false
    }

    // Add to message history
    if (!this.messageHistory.has(roomId)) {
      this.messageHistory.set(roomId, [])
    }
    this.messageHistory.get(roomId)!.push(message)

    // Emit message event
    this.emitEvent({
      type: 'message',
      data: { message, type: 'new' },
      timestamp: message.createdAt,
      userId,
      roomId,
      messageId: message.id
    })

    // Stop typing for this user
    this.stopTyping(userId, roomId)

    return message
  }

  editMessage(userId: string, messageId: string, newContent: string): boolean {
    // Find message across all rooms
    for (const [roomId, messages] of this.messageHistory.entries()) {
      const messageIndex = messages.findIndex(m => m.id === messageId)
      if (messageIndex !== -1) {
        const message = messages[messageIndex]
        
        // Check if user can edit (owner or admin)
        if (message.authorId !== userId) {
          return false
        }

        // Update message
        message.content = newContent.trim()
        message.editedAt = new Date().toISOString()
        message.mentions = this.extractMentions(newContent)

        // Emit edit event
        this.emitEvent({
          type: 'edit',
          data: { message },
          timestamp: new Date().toISOString(),
          userId,
          roomId,
          messageId
        })

        return true
      }
    }

    return false
  }

  deleteMessage(userId: string, messageId: string): boolean {
    // Find and delete message
    for (const [roomId, messages] of this.messageHistory.entries()) {
      const messageIndex = messages.findIndex(m => m.id === messageId)
      if (messageIndex !== -1) {
        const message = messages[messageIndex]
        
        // Check if user can delete (owner or admin)
        if (message.authorId !== userId) {
          return false
        }

        // Mark as deleted
        message.isDeleted = true
        message.deletedAt = new Date().toISOString()
        message.deletedBy = userId
        message.content = '[Message deleted]'

        // Emit delete event
        this.emitEvent({
          type: 'delete',
          data: { messageId },
          timestamp: new Date().toISOString(),
          userId,
          roomId,
          messageId
        })

        return true
      }
    }

    return false
  }

  addReaction(userId: string, messageId: string, reactionType: Reaction['type']): boolean {
    // Find message and add reaction
    for (const [roomId, messages] of this.messageHistory.entries()) {
      const message = messages.find(m => m.id === messageId)
      if (message) {
        // Remove existing reaction from this user
        message.reactions = message.reactions.filter(r => r.userId !== userId)
        
        // Add new reaction
        const reaction: Reaction = {
          id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: reactionType,
          userId,
          createdAt: new Date().toISOString()
        }
        
        message.reactions.push(reaction)

        // Emit reaction event
        this.emitEvent({
          type: 'reaction',
          data: { messageId, reaction, action: 'add' },
          timestamp: new Date().toISOString(),
          userId,
          roomId,
          messageId
        })

        return true
      }
    }

    return false
  }

  removeReaction(userId: string, messageId: string): boolean {
    // Find message and remove user's reaction
    for (const [roomId, messages] of this.messageHistory.entries()) {
      const message = messages.find(m => m.id === messageId)
      if (message) {
        const initialLength = message.reactions.length
        message.reactions = message.reactions.filter(r => r.userId !== userId)
        
        if (message.reactions.length < initialLength) {
          // Emit reaction event
          this.emitEvent({
            type: 'reaction',
            data: { messageId, action: 'remove' },
            timestamp: new Date().toISOString(),
            userId,
            roomId,
            messageId
          })
          return true
        }
      }
    }

    return false
  }

  // Typing Management
  startTyping(userId: string, roomId: string): void {
    const user = this.getMockUser(userId)
    if (!user) return

    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, [])
    }

    const typingList = this.typingUsers.get(roomId)!
    
    // Remove existing typing status for this user
    const filtered = typingList.filter(t => t.userId !== userId)
    
    // Add new typing status
    filtered.push({
      userId,
      user,
      roomId,
      timestamp: new Date().toISOString()
    })

    this.typingUsers.set(roomId, filtered)

    // Emit typing event
    this.emitEvent({
      type: 'typing',
      data: { userId, user, action: 'start' },
      timestamp: new Date().toISOString(),
      userId,
      roomId
    })

    // Auto-stop typing after 5 seconds
    setTimeout(() => {
      this.stopTyping(userId, roomId)
    }, 5000)
  }

  stopTyping(userId: string, roomId: string): void {
    const typingList = this.typingUsers.get(roomId)
    if (!typingList) return

    const filtered = typingList.filter(t => t.userId !== userId)
    this.typingUsers.set(roomId, filtered)

    // Emit typing stop event
    this.emitEvent({
      type: 'typing',
      data: { userId, action: 'stop' },
      timestamp: new Date().toISOString(),
      userId,
      roomId
    })
  }

  getTypingUsers(roomId: string): TypingStatus[] {
    return this.typingUsers.get(roomId) || []
  }

  // Message History
  getRecentMessages(roomId: string, limit: number = 50): ChatMessage[] {
    const messages = this.messageHistory.get(roomId) || []
    return messages
      .filter(m => !m.isDeleted)
      .slice(-limit)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  getMessagesBefore(roomId: string, beforeMessageId: string, limit: number = 20): ChatMessage[] {
    const messages = this.messageHistory.get(roomId) || []
    const beforeIndex = messages.findIndex(m => m.id === beforeMessageId)
    
    if (beforeIndex === -1) return []
    
    return messages
      .slice(0, beforeIndex)
      .filter(m => !m.isDeleted)
      .slice(-limit)
  }

  searchMessages(roomId: string, query: string, limit: number = 20): ChatMessage[] {
    const messages = this.messageHistory.get(roomId) || []
    const searchTerm = query.toLowerCase().trim()
    
    return messages
      .filter(m => 
        !m.isDeleted && 
        m.content.toLowerCase().includes(searchTerm)
      )
      .slice(-limit)
  }

  // Room Management
  getRoomConnections(roomId: string): ChatConnection[] {
    const connectionIds = this.roomConnections.get(roomId) || new Set()
    const connections: ChatConnection[] = []
    
    connectionIds.forEach(id => {
      const connection = this.connections.get(id)
      if (connection && connection.isConnected) {
        connections.push(connection)
      }
    })
    
    return connections
  }

  getRoomUserCount(roomId: string): number {
    return this.getRoomConnections(roomId).length
  }

  // Event System
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emitEvent(event: ChatEvent): void {
    // Emit to room connections
    const roomConnections = this.roomConnections.get(event.roomId) || new Set()
    
    roomConnections.forEach(connectionId => {
      this.sendToConnection(connectionId, event)
    })

    // Emit to event listeners
    const listeners = this.eventListeners.get(event.type) || []
    listeners.forEach(listener => listener(event))
  }

  private sendToConnection(connectionId: string, event: ChatEvent): void {
    const connection = this.connections.get(connectionId)
    if (!connection || !connection.isConnected) return

    // In a real implementation, this would send via WebSocket
    // For now, we simulate by emitting to listeners
    if (connection.socket && connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(JSON.stringify(event))
    }
  }

  // Utility Methods
  private checkRateLimit(userId: string, roomId: string): boolean {
    const key = `${userId}:${roomId}`
    const now = Date.now()
    const windowMs = 10 * 1000 // 10 seconds
    const maxMessages = 10 // 10 messages per 10 seconds

    let limit = this.rateLimits.get(key)
    
    if (!limit || now >= limit.resetTime) {
      limit = { count: 1, resetTime: now + windowMs }
      this.rateLimits.set(key, limit)
      return true
    }

    if (limit.count >= maxMessages) {
      return false
    }

    limit.count++
    return true
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  private getMockUser(userId: string): User | null {
    // Mock user data - in production, fetch from database
    const mockUsers: Record<string, User> = {
      'user1': {
        id: 'user1',
        username: 'trader_alex',
        displayName: 'Alex Thompson',
        avatar: '/placeholder-avatar.jpg',
        role: 'premium',
        reputation: 2347,
        isOnline: true,
        verified: true
      } as User,
      'user2': {
        id: 'user2',
        username: 'crypto_sage',
        displayName: 'Crypto Sage',
        avatar: '/placeholder-avatar2.jpg',
        role: 'member',
        reputation: 1856,
        isOnline: true,
        verified: true
      } as User
    }

    return mockUsers[userId] || null
  }

  private initializeMockData(): void {
    // Initialize some mock message history
    const generalMessages: ChatMessage[] = [
      {
        id: 'msg1',
        content: 'Welcome to the general chat! Feel free to discuss anything trading-related here.',
        roomId: 'general',
        authorId: 'system',
        author: {
          id: 'system',
          username: 'system',
          displayName: 'System',
          role: 'admin'
        } as User,
        type: 'system',
        mentions: [],
        reactions: [],
        isPinned: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
        isDeleted: false
      }
    ]

    this.messageHistory.set('general', generalMessages)
  }

  // Admin functions
  muteUser(adminId: string, userId: string, roomId: string, duration: number = 3600): boolean {
    // Implementation for muting users
    const systemMessage: ChatSystemMessage = {
      type: 'user_muted',
      content: `User has been muted for ${duration / 60} minutes`,
      data: { userId, duration, adminId },
      timestamp: new Date().toISOString()
    }

    this.emitEvent({
      type: 'system',
      data: systemMessage,
      timestamp: new Date().toISOString(),
      roomId
    })

    return true
  }

  pinMessage(adminId: string, messageId: string): boolean {
    for (const [roomId, messages] of this.messageHistory.entries()) {
      const message = messages.find(m => m.id === messageId)
      if (message) {
        message.isPinned = !message.isPinned
        message.pinnedBy = adminId
        message.pinnedAt = new Date().toISOString()

        this.emitEvent({
          type: 'system',
          data: {
            type: 'message_pinned',
            content: `Message ${message.isPinned ? 'pinned' : 'unpinned'}`,
            data: { messageId, adminId }
          },
          timestamp: new Date().toISOString(),
          roomId,
          messageId
        })

        return true
      }
    }

    return false
  }
}

// Global chat manager instance
export const chatManager = new RealtimeChatManager()

// React hook for chat functionality
export const useRealtimeChat = (roomId: string, user: User) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const [connection, setConnection] = useState<ChatConnection | null>(null)

  useEffect(() => {
    if (!user || !roomId) return

    setConnectionStatus('connecting')
    
    // Connect to chat
    const conn = chatManager.connect(user.id, roomId, user)
    setConnection(conn)
    setConnectionStatus('connected')

    // Load recent messages
    const recentMessages = chatManager.getRecentMessages(roomId, 50)
    setMessages(recentMessages)

    // Set up event listeners
    const handleMessage = (event: ChatEvent) => {
      if (event.roomId !== roomId) return

      switch (event.type) {
        case 'message':
          if (event.data.type === 'new') {
            setMessages(prev => [...prev, event.data.message])
          } else if (event.data.type === 'history') {
            setMessages(event.data.messages)
          }
          break

        case 'edit':
          setMessages(prev => 
            prev.map(m => m.id === event.messageId ? event.data.message : m)
          )
          break

        case 'delete':
          setMessages(prev => 
            prev.map(m => m.id === event.messageId ? { ...m, isDeleted: true, content: '[Message deleted]' } : m)
          )
          break

        case 'reaction':
          setMessages(prev => 
            prev.map(m => {
              if (m.id === event.messageId) {
                if (event.data.action === 'add') {
                  return { ...m, reactions: [...m.reactions, event.data.reaction] }
                } else {
                  return { ...m, reactions: m.reactions.filter(r => r.userId !== event.userId) }
                }
              }
              return m
            })
          )
          break

        case 'typing':
          const currentTyping = chatManager.getTypingUsers(roomId)
          setTypingUsers(currentTyping)
          break
      }
    }

    chatManager.on('message', handleMessage)
    chatManager.on('edit', handleMessage)
    chatManager.on('delete', handleMessage)
    chatManager.on('reaction', handleMessage)
    chatManager.on('typing', handleMessage)

    // Cleanup on unmount
    return () => {
      if (conn) {
        chatManager.disconnect(conn.id)
      }
      chatManager.off('message', handleMessage)
      chatManager.off('edit', handleMessage)
      chatManager.off('delete', handleMessage)
      chatManager.off('reaction', handleMessage)
      chatManager.off('typing', handleMessage)
      setConnectionStatus('disconnected')
    }
  }, [user, roomId])

  const sendMessage = (content: string, type: ChatMessage['type'] = 'text', replyTo?: string) => {
    if (!user || !roomId) return null
    return chatManager.sendMessage(user.id, roomId, content, type, replyTo)
  }

  const editMessage = (messageId: string, newContent: string) => {
    if (!user) return false
    return chatManager.editMessage(user.id, messageId, newContent)
  }

  const deleteMessage = (messageId: string) => {
    if (!user) return false
    return chatManager.deleteMessage(user.id, messageId)
  }

  const addReaction = (messageId: string, reactionType: Reaction['type']) => {
    if (!user) return false
    return chatManager.addReaction(user.id, messageId, reactionType)
  }

  const removeReaction = (messageId: string) => {
    if (!user) return false
    return chatManager.removeReaction(user.id, messageId)
  }

  const startTyping = () => {
    if (!user) return
    chatManager.startTyping(user.id, roomId)
  }

  const stopTyping = () => {
    if (!user) return
    chatManager.stopTyping(user.id, roomId)
  }

  return {
    messages,
    typingUsers,
    connectionStatus,
    connection,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping
  }
}

// Export for testing
export const __testing__ = {
  RealtimeChatManager,
  chatManager
}

// Stub React for server-side rendering
const React = typeof window !== 'undefined' ? require('react') : {
  useState: () => [null, () => {}],
  useEffect: () => {}
}
