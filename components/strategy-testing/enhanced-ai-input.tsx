"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Sparkles, TrendingUp, BarChart3, Brain, Lightbulb } from 'lucide-react'

interface EnhancedAIInputProps {
  onCommand?: (command: string) => void
  className?: string
}

const SUGGESTED_PROMPTS = [
  "Analyze my current portfolio performance",
  "Show me market intelligence for tech stocks",
  "What's the optimal strategy for current conditions?",
  "Run a backtest on my momentum strategy",
  "Check risk metrics for my positions",
  "Find correlation patterns in my holdings"
]

export default function EnhancedAIInput({ onCommand, className = "" }: EnhancedAIInputProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setFocusedSuggestion(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSendMessage = async (message?: string) => {
    const commandText = message || input.trim()
    if (!commandText || isProcessing) return

    setIsProcessing(true)
    setShowSuggestions(false)
    setFocusedSuggestion(-1)
    
    // Call the onCommand callback if provided
    if (onCommand) {
      onCommand(commandText)
    }

    if (!message) {
      setInput('')
    }

    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (showSuggestions && focusedSuggestion >= 0) {
        handleSendMessage(SUGGESTED_PROMPTS[focusedSuggestion])
      } else {
        handleSendMessage()
      }
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault()
      setFocusedSuggestion(prev => (prev + 1) % SUGGESTED_PROMPTS.length)
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault()
      setFocusedSuggestion(prev => prev <= 0 ? SUGGESTED_PROMPTS.length - 1 : prev - 1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setFocusedSuggestion(-1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (e.target.value.length === 0) {
      setShowSuggestions(true)
      setFocusedSuggestion(-1)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleInputFocus = () => {
    if (input.length === 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#15151f] border border-[#2a2a3e] rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-[#2a2a3e]">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-white">AI Suggestions</span>
            </div>
            <p className="text-xs text-[#a0a0b8]">Try asking me about your portfolio, market analysis, or strategy optimization</p>
          </div>
          <div className="p-2">
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(prompt)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  focusedSuggestion === index
                    ? 'bg-[#00bbff]/20 border border-[#00bbff]/50'
                    : 'hover:bg-[#2a2a3e]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${
                    index % 3 === 0 ? 'bg-purple-500/20 text-purple-400' :
                    index % 3 === 1 ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {index % 3 === 0 ? <TrendingUp className="w-3 h-3" /> :
                     index % 3 === 1 ? <BarChart3 className="w-3 h-3" /> :
                     <Brain className="w-3 h-3" />}
                  </div>
                  <span className="text-sm text-white font-medium">{prompt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="bg-gradient-to-r from-[#0f1320] via-[#0f1320] to-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* AI Avatar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0f1320] animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Nexus AI
              </div>
              <div className="text-xs text-[#a0a0b8]">Ready to assist</div>
            </div>
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onFocus={handleInputFocus}
              placeholder="Enter command or ask AI... (e.g., 'analyze my portfolio', 'show market trends')"
              className="w-full bg-transparent text-white font-mono text-sm placeholder:text-[#606078] border-none outline-none ring-0 focus:ring-0 pr-12"
              disabled={isProcessing}
              autoComplete="off"
            />
            {/* Input Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00bbff]/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded pointer-events-none" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => handleSendMessage("Analyze my portfolio performance")}
                className="px-3 py-1.5 text-xs bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                disabled={isProcessing}
              >
                Portfolio
              </button>
              <button
                onClick={() => handleSendMessage("Show market intelligence")}
                className="px-3 py-1.5 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30"
                disabled={isProcessing}
              >
                Market
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isProcessing}
              className="group relative w-10 h-10 bg-gradient-to-r from-[#00bbff] to-[#0099dd] hover:from-[#0099dd] hover:to-[#0077bb] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 disabled:hover:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative flex items-center justify-center">
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="mt-3 pt-3 border-t border-[#2a2a3e]/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-cyan-400/30 rounded-full animate-pulse delay-150" />
              </div>
              <span className="text-sm text-cyan-400 font-medium">Processing your request...</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!isProcessing && input.length === 0 && !showSuggestions && (
          <div className="mt-3 pt-3 border-t border-[#2a2a3e]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-[#606078]">
                <span>Press <kbd className="px-1.5 py-0.5 bg-[#2a2a3e] rounded text-white font-mono">Enter</kbd> to send</span>
                <span>Press <kbd className="px-1.5 py-0.5 bg-[#2a2a3e] rounded text-white font-mono">↑↓</kbd> to navigate suggestions</span>
              </div>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-xs text-[#00bbff] hover:text-cyan-300 transition-colors"
              >
                Show suggestions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
