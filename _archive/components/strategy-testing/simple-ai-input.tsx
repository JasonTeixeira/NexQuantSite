"use client"

import React, { useState } from 'react'
import { Send, Terminal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SimpleAIInputProps {
  onCommand?: (command: string) => void
  className?: string
}

export default function SimpleAIInput({ onCommand, className = "" }: SimpleAIInputProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const command = input.trim()
    setIsProcessing(true)
    
    // Call the onCommand callback if provided
    if (onCommand) {
      onCommand(command)
    }

    setInput('')

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`bg-[#0f1320] border-t border-[#2a2a3e] p-4 ${className}`}>
      <div className="flex items-center gap-3">
        {/* AI Status Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center">
            <Terminal className="w-3 h-3 text-white" />
          </div>
          <span className="text-cyan-400 font-mono text-sm font-semibold">nexus@ai $</span>
        </div>

        {/* Input Field */}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter command or ask AI... (e.g., 'show performance', 'analyze my portfolio', 'what is my sharpe ratio?')"
          className="flex-1 bg-transparent border-none text-white font-mono text-sm placeholder:text-[#606078] focus:outline-none focus:ring-0"
          disabled={isProcessing}
          autoFocus
        />

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={!input.trim() || isProcessing}
          size="sm"
          className="bg-[#00bbff] hover:bg-[#0099dd] text-white border-0 h-8 w-8 p-0 flex-shrink-0"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 mt-2 text-cyan-400 font-mono text-xs">
          <div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <span>Processing your request...</span>
        </div>
      )}
    </div>
  )
}
