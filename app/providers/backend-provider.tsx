'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { backendConnector } from '@/lib/api/backend-connector'
import { websocketManager } from '@/lib/realtime/websocket-manager'

interface BackendContextValue {
  initialized: boolean
  connected: boolean
  error: Error | null
  reconnect: () => Promise<void>
}

const BackendContext = createContext<BackendContextValue | undefined>(undefined)

export function BackendProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const initialize = async () => {
    try {
      setError(null)
      
      // Initialize backend connector
      await backendConnector.initialize()
      setInitialized(true)
      
      // Check WebSocket connection
      setConnected(websocketManager.connectionState === 'connected')
      
      // Reset retry count on successful connection
      setRetryCount(0)
    } catch (err) {
      console.error('Failed to initialize backend:', err)
      setError(err as Error)
      setInitialized(false)
      setConnected(false)
      
      // Auto-retry with exponential backoff
      if (retryCount < 5) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          initialize()
        }, delay)
      }
    }
  }

  useEffect(() => {
    // Initialize on mount
    initialize()

    // Listen for WebSocket connection events
    const handleConnected = () => setConnected(true)
    const handleDisconnected = () => setConnected(false)
    const handleError = (event: CustomEvent) => setError(new Error(event.detail))

    window.addEventListener('ws:connected', handleConnected)
    window.addEventListener('ws:disconnected', handleDisconnected)
    window.addEventListener('ws:error', handleError as any)

    // Cleanup
    return () => {
      window.removeEventListener('ws:connected', handleConnected)
      window.removeEventListener('ws:disconnected', handleDisconnected)
      window.removeEventListener('ws:error', handleError as any)
      
      // Disconnect WebSocket on unmount
      websocketManager.disconnect()
    }
  }, [])

  const reconnect = async () => {
    setRetryCount(0)
    await initialize()
  }

  return (
    <BackendContext.Provider value={{ initialized, connected, error, reconnect }}>
      {/* Show connection status banner */}
      {!connected && initialized && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-2">
          <span className="font-semibold">⚠️ Backend connection lost.</span>
          {' '}
          <button 
            onClick={reconnect}
            className="underline hover:no-underline"
          >
            Reconnect
          </button>
        </div>
      )}
      
      {/* Show error banner */}
      {error && retryCount >= 5 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2">
          <span className="font-semibold">❌ Failed to connect to backend.</span>
          {' '}
          <button 
            onClick={reconnect}
            className="underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}
      
      {children}
    </BackendContext.Provider>
  )
}

export function useBackend() {
  const context = useContext(BackendContext)
  if (context === undefined) {
    throw new Error('useBackend must be used within BackendProvider')
  }
  return context
}
