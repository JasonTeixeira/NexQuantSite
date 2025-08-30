"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Navigation,
  Sparkles,
  Home,
  BarChart3,
  BookOpen,
  Users,
  Settings,
  Mic,
  MicOff,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
  isRead?: boolean
  rating?: "up" | "down"
}

interface QuickAction {
  label: string
  icon: React.ElementType
  action: string
  href?: string
  category: string
}

const quickActions: QuickAction[] = [
  { label: "Dashboard", icon: BarChart3, action: "navigate", href: "/dashboard", category: "trading" },
  { label: "Learning Hub", icon: BookOpen, action: "navigate", href: "/learning", category: "education" },
  { label: "Community", icon: Users, action: "navigate", href: "/community", category: "social" },
  { label: "Bots", icon: Bot, action: "navigate", href: "/bots", category: "trading" },
  { label: "Signals", icon: Navigation, action: "navigate", href: "/signals", category: "trading" },
  { label: "Settings", icon: Settings, action: "navigate", href: "/settings", category: "account" },
  { label: "Home", icon: Home, action: "navigate", href: "/", category: "navigation" },
]

const suggestedQuestions = [
  { text: "How do I start trading with bots?", category: "getting-started" },
  { text: "What are the different pricing plans?", category: "pricing" },
  { text: "How does the AI signal system work?", category: "features" },
  { text: "Can you explain risk management?", category: "education" },
  { text: "Where can I find trading tutorials?", category: "education" },
  { text: "How do I join the community?", category: "community" },
  { text: "What's the difference between bot types?", category: "features" },
  { text: "How accurate are the trading signals?", category: "performance" },
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const initialMessage = useMemo(
    () => ({
      id: "welcome",
      type: "assistant" as const,
      content:
        "👋 Hi! I'm your Nexural AI assistant. I can help you navigate the platform, answer questions about trading, and guide you to the right resources. How can I assist you today?",
      timestamp: new Date(),
      suggestions: suggestedQuestions.slice(0, 3).map((q) => q.text),
      isRead: true,
    }),
    [],
  )

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([initialMessage])
    }
  }, [initialMessage, messages.length])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
      // Mark messages as read when chat is opened
      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })))
      setUnreadCount(0)
    }
  }, [isOpen, isMinimized])

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isTyping) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: "user",
        content: content.trim(),
        timestamp: new Date(),
        isRead: true,
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsTyping(true)

      try {
        // Simulate AI response with more realistic timing
        const responseTime = Math.random() * 1000 + 800 // 800-1800ms

        setTimeout(() => {
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            type: "assistant",
            content: getAIResponse(content.trim()),
            timestamp: new Date(),
            suggestions: getRelevantSuggestions(content.trim()),
            isRead: isOpen && !isMinimized,
          }

          setMessages((prev) => [...prev, assistantMessage])
          setIsTyping(false)

          // Update unread count if chat is closed
          if (!isOpen || isMinimized) {
            setUnreadCount((prev) => prev + 1)
          }
        }, responseTime)
      } catch (error) {
        console.error("[v0] Error sending message:", error)
        setIsTyping(false)
      }
    },
    [isTyping, isOpen, isMinimized],
  )

  const getAIResponse = useCallback((input: string): string => {
    const lowerInput = input.toLowerCase()

    const responses = {
      bot: "🤖 Our AI trading bots (Q, R, X, O, Z) use advanced algorithms to analyze market patterns and execute trades automatically. Each bot specializes in different strategies:\n\n• **Q Bot**: Momentum-based trading with 89% win rate\n• **R Bot**: Mean reversion strategies, perfect for volatile markets\n• **X Bot**: Scalping specialist for quick profits\n• **O Bot**: Options trading with advanced Greeks analysis\n• **Z Bot**: Multi-timeframe analysis for swing trades\n\nStart with Signals Pro ($55/month) to access all bot signals with real-time notifications.",

      price:
        "💰 **Pricing Plans:**\n\n🆓 **Free Discord Community**\n• General chat access\n• Weekly market outlooks\n• Basic educational content\n\n💎 **Signals Pro - $55/month**\n• All bot trading signals\n• Real-time notifications\n• Advanced analytics\n• Priority support\n\n🚀 **Automation - $300/month** (Coming Soon)\n• Full trade automation\n• Custom bot configurations\n• 1-on-1 strategy sessions\n• White-glove onboarding\n\nAll plans include 7-day money-back guarantee!",

      learn:
        "📚 **Learning Resources:**\n\n🎯 **Interactive Courses**\n• Trading Fundamentals & Market Structure (Beginner)\n• Technical Analysis Mastery (Intermediate)\n• Advanced Options Strategies (Expert)\n• Risk Management Essentials\n\n📹 **Video Library**\n• 200+ HD tutorials\n• Live trading sessions\n• Market analysis breakdowns\n\n🏆 **Gamified Learning**\n• Progress tracking\n• Achievement badges\n• Leaderboards\n• Quiz competitions\n\nStart your journey in the Learning Hub!",

      risk: "🛡️ **Risk Management Best Practices:**\n\n📊 **Position Sizing**\n• Never risk more than 2% per trade\n• Use our Risk Calculator for optimal sizing\n• Diversify across multiple strategies\n\n🎯 **Stop Losses**\n• Always set stops before entering\n• Use trailing stops for trending markets\n• Risk/reward ratio minimum 1:2\n\n📈 **Portfolio Management**\n• Maximum 5% total portfolio risk\n• Regular performance reviews\n• Emotional discipline protocols\n\nOur bots include built-in risk controls and automatic stop-loss mechanisms.",

      community:
        "👥 **Join Our Thriving Community:**\n\n💬 **Discord Server** (150K+ members)\n• Real-time market discussions\n• Strategy sharing\n• Mentorship programs\n• Weekly live sessions\n\n🏆 **Leaderboard Competitions**\n• Monthly trading contests\n• Performance rankings\n• Exclusive rewards\n\n🤝 **Networking Opportunities**\n• Regional meetups\n• Virtual conferences\n• Mastermind groups\n\nJoin for free and connect with traders worldwide!",

      signal:
        "📊 **AI Signal System:**\n\n🎯 **Real-time Alerts**\n• Futures markets: ES, NQ, YM, RTY\n• Entry/exit points with precision timing\n• Confidence scores (0-100%)\n• Risk parameters included\n\n📈 **Performance Metrics**\n• 87% average accuracy across all bots\n• 2.3:1 average risk/reward ratio\n• Real-time P&L tracking\n\n🔔 **Delivery Methods**\n• Discord notifications\n• Email alerts\n• SMS (premium)\n• Mobile app push notifications\n\nSignals Pro subscribers get priority access with zero delays!",

      dashboard:
        "🎯 **Dashboard Features:**\n\n📊 **Trading Command Center**\n• Real-time bot performance\n• Active signal monitoring\n• Portfolio allocation charts\n• P&L tracking\n\n🔧 **Customization**\n• Resizable panels\n• Custom layouts\n• Dark/light themes\n• Widget preferences\n\n⚡ **Quick Actions**\n• One-click bot activation\n• Instant signal access\n• Performance analytics\n• Settings management\n\nYour personalized trading headquarters!",
    }

    // Enhanced keyword matching
    for (const [key, response] of Object.entries(responses)) {
      if (
        lowerInput.includes(key) ||
        (key === "bot" && (lowerInput.includes("trading") || lowerInput.includes("algorithm"))) ||
        (key === "price" &&
          (lowerInput.includes("plan") || lowerInput.includes("cost") || lowerInput.includes("subscription"))) ||
        (key === "learn" &&
          (lowerInput.includes("tutorial") || lowerInput.includes("education") || lowerInput.includes("course"))) ||
        (key === "signal" && (lowerInput.includes("alert") || lowerInput.includes("notification")))
      ) {
        return response
      }
    }

    return "I'd be happy to help! I can assist with questions about our trading bots, pricing plans, educational resources, risk management, community features, and platform navigation. Feel free to ask me anything specific, or choose from the suggested questions below."
  }, [])

  const getRelevantSuggestions = useCallback((input: string): string[] => {
    const lowerInput = input.toLowerCase()

    const suggestionMap = {
      bot: [
        "How do I choose the right bot?",
        "What's the difference between Q and R bots?",
        "Can I customize bot settings?",
      ],
      price: ["What's included in Signals Pro?", "Is there a free trial?", "How do I upgrade my plan?"],
      learn: ["Where do I start as a beginner?", "Are there video tutorials?", "How do I track my progress?"],
      risk: ["What's proper position sizing?", "How do stop losses work?", "Can you explain drawdown?"],
      community: ["How do I join Discord?", "Are there trading competitions?", "Can I share my strategies?"],
      signal: ["How accurate are the signals?", "What markets do you cover?", "How fast are notifications?"],
    }

    for (const [key, suggestions] of Object.entries(suggestionMap)) {
      if (lowerInput.includes(key)) {
        return suggestions
      }
    }

    return suggestedQuestions.slice(0, 3).map((q) => q.text)
  }, [])

  const handleQuickAction = useCallback((action: QuickAction) => {
    if (action.href) {
      // Add analytics tracking here when backend is connected
      console.log("[v0] Quick action clicked:", action.label)
      window.location.href = action.href
    }
    setIsOpen(false)
  }, [])

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const rateMessage = useCallback((messageId: string, rating: "up" | "down") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, rating } : msg)))
    // Send rating to backend when available
    console.log("[v0] Message rated:", messageId, rating)
  }, [])

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
    // Show toast notification when available
    console.log("[v0] Message copied to clipboard")
  }, [])

  const clearChat = useCallback(() => {
    setMessages([initialMessage])
    setUnreadCount(0)
  }, [initialMessage])

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 left-6 z-40"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-green-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
              <MessageCircle className="h-6 w-6 text-black relative z-10 group-hover:scale-110 transition-transform" />

              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />

              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 left-6 z-40"
          >
            <Card
              className={`bg-black/95 border-primary/30 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
                isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
              }`}
            >
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 bg-gradient-to-r from-primary to-green-400 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-black" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Nexural AI</h3>
                    <p className="text-xs text-gray-400">Always here to help</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearChat}
                    className="h-8 w-8 text-gray-400 hover:text-white"
                    title="Clear chat"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 text-gray-400 hover:text-white"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="flex flex-col h-[calc(600px-80px)] p-0">
                  {/* Quick Actions */}
                  <div className="p-4 border-b border-primary/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Navigation className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-gray-300">Quick Actions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.slice(0, 4).map((action) => (
                        <Button
                          key={action.label}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className="text-xs border-primary/30 text-primary hover:bg-primary/10 h-7"
                        >
                          <action.icon className="h-3 w-3 mr-1" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-start gap-2 max-w-[85%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.type === "user"
                                ? "bg-primary text-black"
                                : "bg-gradient-to-r from-primary to-green-400 text-black"
                            }`}
                          >
                            {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>

                          <div className="flex flex-col gap-2">
                            <div
                              className={`rounded-2xl p-3 relative group ${
                                message.type === "user"
                                  ? "bg-primary text-black"
                                  : "bg-gray-800/50 text-white border border-primary/20"
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>

                              {message.type === "assistant" && (
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyMessage(message.content)}
                                    className="h-6 w-6 text-gray-400 hover:text-white"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => rateMessage(message.id, "up")}
                                    className={`h-6 w-6 ${message.rating === "up" ? "text-green-400" : "text-gray-400 hover:text-white"}`}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => rateMessage(message.id, "down")}
                                    className={`h-6 w-6 ${message.rating === "down" ? "text-red-400" : "text-gray-400 hover:text-white"}`}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}

                              {message.suggestions && (
                                <div className="mt-3 space-y-2">
                                  {message.suggestions.map((suggestion, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleSendMessage(suggestion)}
                                      className="block w-full text-left text-xs p-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary transition-colors"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-2">
                          <div className="h-8 w-8 bg-gradient-to-r from-primary to-green-400 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-black" />
                          </div>
                          <div className="bg-gray-800/50 border border-primary/20 rounded-2xl p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                              <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-primary/20">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                          placeholder="Ask me anything about Nexural..."
                          className="w-full bg-gray-800/50 border border-primary/30 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary/60 focus:bg-gray-800/70 transition-all"
                        />
                        {recognitionRef.current && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleVoiceInput}
                            className={`absolute right-1 top-1 h-6 w-6 ${isListening ? "text-red-400" : "text-gray-400 hover:text-white"}`}
                          >
                            {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                      <Button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim() || isTyping}
                        className="bg-primary hover:bg-primary/90 text-black px-3"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-center mt-2">
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary/70">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Powered by Nexural AI
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
