import { NextRequest } from 'next/server'
import { WebSocket, WebSocketServer } from 'ws'

// Global WebSocket server instance
let wss: WebSocketServer | null = null
const clients = new Map<string, { ws: WebSocket, userId?: string, lastPing: number }>()

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
  id?: string
}

// Initialize WebSocket server if not already created
function initWebSocketServer() {
  if (!wss) {
    wss = new WebSocketServer({ 
      port: 8080,
      perMessageDeflate: false,
      clientTracking: true
    })

    wss.on('connection', (ws, request) => {
      const clientId = generateClientId()
      const url = new URL(request.url || '', `http://${request.headers.host}`)
      const userId = url.searchParams.get('userId')
      
      console.log(`[WebSocket] New connection: ${clientId}`, { userId })

      // Store client
      clients.set(clientId, { 
        ws, 
        userId: userId || undefined,
        lastPing: Date.now()
      })

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString())
          handleMessage(clientId, message)
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error)
          sendToClient(clientId, {
            type: 'error',
            data: { message: 'Invalid message format' },
            timestamp: new Date().toISOString()
          })
        }
      })

      // Handle ping/pong for heartbeat
      ws.on('ping', () => {
        const client = clients.get(clientId)
        if (client) {
          client.lastPing = Date.now()
          ws.pong()
        }
      })

      // Handle connection close
      ws.on('close', (code, reason) => {
        console.log(`[WebSocket] Client disconnected: ${clientId}`, { code, reason: reason.toString() })
        clients.delete(clientId)
        
        // Notify others if user was online
        const client = clients.get(clientId)
        if (client?.userId) {
          broadcast({
            type: 'user_offline',
            data: { userId: client.userId },
            timestamp: new Date().toISOString()
          }, clientId)
        }
      })

      // Handle errors
      ws.on('error', (error) => {
        console.error(`[WebSocket] Client error: ${clientId}`, error)
        clients.delete(clientId)
      })

      // Send welcome message
      sendToClient(clientId, {
        type: 'system_announcement',
        data: { 
          message: 'Connected to Nexural Trading Platform',
          clientId
        },
        timestamp: new Date().toISOString()
      })

      // Notify others that user is online
      if (userId) {
        broadcast({
          type: 'user_online',
          data: { userId },
          timestamp: new Date().toISOString()
        }, clientId)
      }
    })

    // Cleanup dead connections every 30 seconds
    setInterval(() => {
      const now = Date.now()
      for (const [clientId, client] of clients.entries()) {
        if (now - client.lastPing > 60000) { // 60 seconds timeout
          console.log(`[WebSocket] Removing stale client: ${clientId}`)
          client.ws.terminate()
          clients.delete(clientId)
        }
      }
    }, 30000)

    console.log('[WebSocket] Server started on port 8080')
  }
}

// Handle incoming messages
function handleMessage(clientId: string, message: WebSocketMessage) {
  console.log(`[WebSocket] Message from ${clientId}:`, message)

  switch (message.type) {
    case 'ping':
      // Update last ping time and respond
      const client = clients.get(clientId)
      if (client) {
        client.lastPing = Date.now()
        sendToClient(clientId, {
          type: 'system_announcement',
          data: { type: 'pong', timestamp: message.data?.timestamp },
          timestamp: new Date().toISOString()
        })
      }
      break

    case 'message_sent':
      // Broadcast message to conversation participants
      broadcastToConversation(message.data.conversationId, {
        type: 'message_received',
        data: message.data,
        timestamp: new Date().toISOString()
      }, clientId)
      break

    case 'post_reaction':
      // Broadcast reaction to interested users
      broadcastPostUpdate(message.data.postId, {
        type: 'post_reaction',
        data: message.data,
        timestamp: new Date().toISOString()
      }, clientId)
      break

    case 'comment_added':
      // Broadcast new comment to post followers
      broadcastPostUpdate(message.data.postId, {
        type: 'comment_added',
        data: message.data,
        timestamp: new Date().toISOString()
      }, clientId)
      break

    case 'typing_start':
    case 'typing_stop':
      // Broadcast typing status to conversation participants
      broadcastToConversation(message.data.conversationId, {
        type: message.type,
        data: { ...message.data, userId: getClientUserId(clientId) },
        timestamp: new Date().toISOString()
      }, clientId)
      break

    case 'join_room':
      // Handle room/channel joining
      handleRoomJoin(clientId, message.data.roomId)
      break

    case 'leave_room':
      // Handle room/channel leaving
      handleRoomLeave(clientId, message.data.roomId)
      break

    default:
      console.log(`[WebSocket] Unknown message type: ${message.type}`)
      sendToClient(clientId, {
        type: 'error',
        data: { message: `Unknown message type: ${message.type}` },
        timestamp: new Date().toISOString()
      })
  }
}

// Send message to specific client
function sendToClient(clientId: string, message: WebSocketMessage) {
  const client = clients.get(clientId)
  if (client && client.ws.readyState === WebSocket.OPEN) {
    try {
      client.ws.send(JSON.stringify(message))
    } catch (error) {
      console.error(`[WebSocket] Error sending to client ${clientId}:`, error)
      clients.delete(clientId)
    }
  }
}

// Broadcast to all clients except sender
function broadcast(message: WebSocketMessage, excludeClientId?: string) {
  for (const [clientId, client] of clients.entries()) {
    if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`[WebSocket] Error broadcasting to client ${clientId}:`, error)
        clients.delete(clientId)
      }
    }
  }
}

// Broadcast to specific conversation participants
function broadcastToConversation(conversationId: string, message: WebSocketMessage, excludeClientId?: string) {
  // In a real implementation, you would query the database to get conversation participants
  // For now, we'll broadcast to all clients (simplified version)
  broadcast(message, excludeClientId)
}

// Broadcast post updates to interested users
function broadcastPostUpdate(postId: string, message: WebSocketMessage, excludeClientId?: string) {
  // In a real implementation, you would determine which users should receive this update
  // (followers of the post author, users who commented, etc.)
  broadcast(message, excludeClientId)
}

// Handle room joining (for groups, channels, etc.)
function handleRoomJoin(clientId: string, roomId: string) {
  console.log(`[WebSocket] Client ${clientId} joined room ${roomId}`)
  
  // In a real implementation, you would track room memberships
  // and send room-specific messages
  
  sendToClient(clientId, {
    type: 'room_joined',
    data: { roomId },
    timestamp: new Date().toISOString()
  })
}

// Handle room leaving
function handleRoomLeave(clientId: string, roomId: string) {
  console.log(`[WebSocket] Client ${clientId} left room ${roomId}`)
  
  sendToClient(clientId, {
    type: 'room_left',
    data: { roomId },
    timestamp: new Date().toISOString()
  })
}

// Utility functions
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getClientUserId(clientId: string): string | undefined {
  return clients.get(clientId)?.userId
}

// Send notification to specific user
export function sendNotificationToUser(userId: string, notification: any) {
  const message: WebSocketMessage = {
    type: 'notification_received',
    data: notification,
    timestamp: new Date().toISOString()
  }

  for (const [clientId, client] of clients.entries()) {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      sendToClient(clientId, message)
    }
  }
}

// Send message to conversation
export function sendMessageToConversation(conversationId: string, messageData: any) {
  broadcastToConversation(conversationId, {
    type: 'message_received',
    data: messageData,
    timestamp: new Date().toISOString()
  })
}

// Broadcast system announcement
export function broadcastSystemAnnouncement(announcement: any) {
  broadcast({
    type: 'system_announcement',
    data: announcement,
    timestamp: new Date().toISOString()
  })
}

// HTTP endpoint to trigger WebSocket events (for testing)
export async function POST(request: NextRequest) {
  try {
    initWebSocketServer()

    const body = await request.json()
    const { type, data, userId, conversationId, postId } = body

    switch (type) {
      case 'send_notification':
        if (userId) {
          sendNotificationToUser(userId, data)
        }
        break

      case 'broadcast_message':
        if (conversationId) {
          sendMessageToConversation(conversationId, data)
        }
        break

      case 'broadcast_announcement':
        broadcastSystemAnnouncement(data)
        break

      case 'broadcast_post_update':
        if (postId) {
          broadcastPostUpdate(postId, {
            type: 'post_updated',
            data,
            timestamp: new Date().toISOString()
          })
        }
        break

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown broadcast type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WebSocket event triggered',
        connectedClients: clients.size 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[WebSocket API] Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process WebSocket event',
        details: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// WebSocket upgrade endpoint
export async function GET(request: NextRequest) {
  // Check if this is a WebSocket upgrade request
  const upgrade = request.headers.get('upgrade')
  
  if (upgrade?.toLowerCase() === 'websocket') {
    // Initialize WebSocket server
    initWebSocketServer()
    
    return new Response('WebSocket server running on port 8080', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'X-WebSocket-Port': '8080'
      }
    })
  }

  // Return WebSocket connection info
  return new Response(
    JSON.stringify({ 
      message: 'WebSocket server is running',
      port: 8080,
      connectedClients: clients.size,
      endpoint: 'ws://localhost:8080'
    }),
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  )
}