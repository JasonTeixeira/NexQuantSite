"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  Send,
  Minimize2,
  Maximize2,
  X,
  Loader2,
  Search,
  Users,
  Signal,
  Settings,
  BarChart3,
  FileText,
  Zap,
  Brain,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: AssistantAction[]
  metadata?: {
    confidence?: number
    sources?: string[]
    executionTime?: number
  }
}

interface AssistantAction {
  id: string
  label: string
  description: string
  action: () => void
  icon: React.ReactNode
  variant?: "default" | "destructive" | "outline"
}

interface WebsiteData {
  users: {
    total: number
    active: number
    newToday: number
    topCountries: string[]
  }
  signals: {
    total: number
    active: number
    performance: number
    winRate: number
  }
  content: {
    pages: number
    blogPosts: number
    mediaFiles: number
  }
  system: {
    uptime: string
    performance: number
    errors: number
  }
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !websiteData) {
      crawlWebsite()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const crawlWebsite = async () => {
    setIsAnalyzing(true)
    try {
      // Simulate website crawling and data collection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockData: WebsiteData = {
        users: {
          total: 12847,
          active: 3421,
          newToday: 156,
          topCountries: ["United States", "United Kingdom", "Canada", "Australia", "Germany"],
        },
        signals: {
          total: 1234,
          active: 89,
          performance: 12.5,
          winRate: 68.2,
        },
        content: {
          pages: 47,
          blogPosts: 23,
          mediaFiles: 156,
        },
        system: {
          uptime: "99.9%",
          performance: 85,
          errors: 3,
        },
      }

      setWebsiteData(mockData)

      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `🚀 **Website Analysis Complete!**

I've successfully crawled your Nexural Trading Platform and gathered comprehensive data:

📊 **Quick Overview:**
• **${mockData.users.total.toLocaleString()}** total users (${mockData.users.active.toLocaleString()} active)
• **${mockData.signals.total}** trading signals with **${mockData.signals.winRate}%** win rate
• **${mockData.content.pages}** pages and **${mockData.content.blogPosts}** blog posts
• System uptime: **${mockData.system.uptime}**

I'm ready to help you manage your platform! Ask me anything about:
• User management and analytics
• Trading signals and performance
• Content optimization
• System monitoring
• SEO and marketing insights
• Security recommendations

What would you like to know or improve?`,
        timestamp: new Date(),
        actions: [
          {
            id: "user-analytics",
            label: "User Analytics",
            description: "Deep dive into user behavior and growth",
            icon: <Users className="w-4 h-4" />,
            action: () => handleQuickAction("Show me detailed user analytics and growth trends"),
          },
          {
            id: "signal-performance",
            label: "Signal Performance",
            description: "Analyze trading signal effectiveness",
            icon: <Signal className="w-4 h-4" />,
            action: () => handleQuickAction("Analyze our trading signal performance and suggest improvements"),
          },
          {
            id: "system-health",
            label: "System Health",
            description: "Check system performance and issues",
            icon: <BarChart3 className="w-4 h-4" />,
            action: () => handleQuickAction("Give me a system health report and optimization recommendations"),
          },
        ],
      }

      setMessages([welcomeMessage])
    } catch (error) {
      toast.error("Failed to analyze website")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt)
    handleSendMessage(prompt)
  }

  const handleSendMessage = async (customMessage?: string) => {
    const messageContent = customMessage || inputValue.trim()
    if (!messageContent) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const response = await generateAIResponse(messageContent, websiteData)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        actions: response.actions,
        metadata: {
          confidence: response.confidence,
          sources: response.sources,
          executionTime: response.executionTime,
        },
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast.error("Failed to get AI response")
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = async (prompt: string, data: WebsiteData | null) => {
    // Simulate AI analysis based on prompt and website data
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes("user") && lowerPrompt.includes("analytic")) {
      return {
        content: `📈 **User Analytics Deep Dive**

**Growth Metrics:**
• Total Users: **${data?.users.total.toLocaleString()}** (+12% this month)
• Active Users: **${data?.users.active.toLocaleString()}** (26.6% engagement rate)
• New Users Today: **${data?.users.newToday}** (trending up 8%)

**Geographic Distribution:**
${data?.users.topCountries.map((country, i) => `${i + 1}. ${country}`).join("\n")}

**Key Insights:**
• User retention rate is **73%** (above industry average)
• Peak activity hours: 9-11 AM and 2-4 PM EST
• Mobile users account for **68%** of traffic
• Premium conversion rate: **12.3%**

**Recommendations:**
1. **Target Growth**: Focus marketing on Germany and France for expansion
2. **Engagement**: Implement push notifications for inactive users
3. **Conversion**: A/B test premium features showcase`,
        actions: [
          {
            id: "export-analytics",
            label: "Export Report",
            description: "Download detailed analytics report",
            icon: <FileText className="w-4 h-4" />,
            action: () => toast.success("Analytics report exported!"),
          },
          {
            id: "user-segments",
            label: "User Segments",
            description: "Create targeted user segments",
            icon: <Users className="w-4 h-4" />,
            action: () => toast.success("User segmentation tool opened!"),
          },
        ],
        confidence: 95,
        sources: ["User Database", "Analytics API", "Engagement Metrics"],
        executionTime: 1.2,
      }
    }

    if (lowerPrompt.includes("signal") && lowerPrompt.includes("performance")) {
      return {
        content: `🎯 **Trading Signal Performance Analysis**

**Overall Performance:**
• Total Signals: **${data?.signals.total}**
• Active Signals: **${data?.signals.active}**
• Average Performance: **+${data?.signals.performance}%**
• Win Rate: **${data?.signals.winRate}%** (Excellent!)

**Top Performing Categories:**
1. **Crypto Signals**: 74% win rate, +15.2% avg return
2. **Forex Signals**: 68% win rate, +11.8% avg return  
3. **Stock Signals**: 65% win rate, +9.4% avg return

**Recent Trends:**
• BTC/USD signals performing exceptionally (+22% this week)
• EUR/USD signals showing consistency (71% win rate)
• Risk management has improved by 18%

**Optimization Opportunities:**
1. **AI Enhancement**: Implement ML model for better entry timing
2. **Risk Management**: Add dynamic stop-loss adjustments
3. **User Education**: Create signal interpretation guides`,
        actions: [
          {
            id: "optimize-signals",
            label: "Optimize Signals",
            description: "Run AI optimization on signal algorithms",
            icon: <Zap className="w-4 h-4" />,
            action: () => toast.success("Signal optimization started!"),
          },
          {
            id: "performance-report",
            label: "Performance Report",
            description: "Generate detailed performance report",
            icon: <BarChart3 className="w-4 h-4" />,
            action: () => toast.success("Performance report generated!"),
          },
        ],
        confidence: 92,
        sources: ["Signal Database", "Performance Metrics", "User Feedback"],
        executionTime: 1.8,
      }
    }

    if (lowerPrompt.includes("system") && lowerPrompt.includes("health")) {
      return {
        content: `🔧 **System Health Report**

**Current Status:** 🟢 **Excellent**
• Uptime: **${data?.system.uptime}** (Last 30 days)
• Performance Score: **${data?.system.performance}/100**
• Active Errors: **${data?.system.errors}** (Low priority)

**Resource Utilization:**
• CPU Usage: **45%** (Normal)
• Memory Usage: **68%** (Optimal)
• Database Performance: **92%** (Excellent)
• API Response Time: **120ms** (Fast)

**Recent Issues Resolved:**
• Fixed memory leak in signal processing (2 days ago)
• Optimized database queries (+15% performance)
• Updated SSL certificates (auto-renewal active)

**Recommendations:**
1. **Scaling**: Consider adding 2 more server instances for peak hours
2. **Monitoring**: Implement predictive alerts for resource usage
3. **Backup**: Schedule weekly full system backups
4. **Security**: Update to latest security patches (3 pending)`,
        actions: [
          {
            id: "apply-updates",
            label: "Apply Updates",
            description: "Install pending security updates",
            icon: <Settings className="w-4 h-4" />,
            action: () => toast.success("Security updates scheduled!"),
          },
          {
            id: "scale-system",
            label: "Auto-Scale",
            description: "Enable automatic scaling",
            icon: <Zap className="w-4 h-4" />,
            action: () => toast.success("Auto-scaling enabled!"),
          },
        ],
        confidence: 98,
        sources: ["System Logs", "Performance Metrics", "Error Reports"],
        executionTime: 0.9,
      }
    }

    if (lowerPrompt.includes("seo") || lowerPrompt.includes("marketing")) {
      return {
        content: `🚀 **SEO & Marketing Analysis**

**Current SEO Performance:**
• Organic Traffic: **+34%** (Last 3 months)
• Average Position: **#12** (Improving)
• Click-Through Rate: **3.2%** (Above average)
• Core Web Vitals: **Good** (All metrics pass)

**Top Performing Keywords:**
1. "AI trading signals" - Position #8
2. "Automated trading platform" - Position #12
3. "Crypto trading bot" - Position #15

**Content Opportunities:**
• **47 pages** indexed, **23 blog posts** published
• Missing content for "forex trading strategies"
• Opportunity: "DeFi trading" keyword gap

**Marketing Recommendations:**
1. **Content**: Create "Ultimate Trading Guide" series
2. **Social**: Increase LinkedIn presence (B2B focus)
3. **Email**: Implement drip campaigns for trial users
4. **Partnerships**: Collaborate with trading influencers`,
        actions: [
          {
            id: "content-calendar",
            label: "Content Calendar",
            description: "Generate 3-month content plan",
            icon: <FileText className="w-4 h-4" />,
            action: () => toast.success("Content calendar created!"),
          },
          {
            id: "seo-audit",
            label: "SEO Audit",
            description: "Run comprehensive SEO analysis",
            icon: <Search className="w-4 h-4" />,
            action: () => toast.success("SEO audit initiated!"),
          },
        ],
        confidence: 88,
        sources: ["Google Analytics", "Search Console", "SEO Tools"],
        executionTime: 2.1,
      }
    }

    // Default response for general queries
    return {
      content: `🤖 **AI Analysis Complete**

I've analyzed your query and here's what I found based on your Nexural Trading Platform data:

**Current Platform Status:**
• **${data?.users.total.toLocaleString()}** users actively using the platform
• **${data?.signals.total}** trading signals with strong performance
• System running at **${data?.system.performance}%** efficiency

**Specific Insights:**
Based on your question, I recommend focusing on:
1. **User Experience**: Continue optimizing the trading interface
2. **Performance**: Your current metrics are strong
3. **Growth**: Consider expanding to new markets

**Next Steps:**
Would you like me to dive deeper into any specific area? I can help with:
• Detailed analytics and reporting
• System optimization recommendations  
• User engagement strategies
• Content and SEO improvements
• Security and compliance checks

Just ask me anything specific about your platform!`,
      actions: [
        {
          id: "detailed-analysis",
          label: "Detailed Analysis",
          description: "Get comprehensive platform analysis",
          icon: <Brain className="w-4 h-4" />,
          action: () => handleQuickAction("Give me a comprehensive analysis of my entire platform"),
        },
      ],
      confidence: 85,
      sources: ["Platform Database", "Analytics", "System Metrics"],
      executionTime: 1.0,
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/80 hover:to-blue-600 shadow-lg shadow-primary/25"
      >
        <Bot className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 z-50 bg-gray-900/95 backdrop-blur-xl border-primary/30 transition-all duration-300 ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      <CardHeader className="p-4 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-black" />
            </div>
            <div>
              <CardTitle className="text-white text-sm">AI Assistant</CardTitle>
              {websiteData && (
                <p className="text-xs text-gray-400">{isAnalyzing ? "Analyzing website..." : "Ready to help"}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 p-0 text-gray-400 hover:text-white"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          {isAnalyzing ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-6 h-6 text-black animate-spin" />
                </div>
                <p className="text-white font-medium">Analyzing Your Website</p>
                <p className="text-gray-400 text-sm">Crawling pages, analyzing data...</p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === "user"
                            ? "bg-primary text-black"
                            : "bg-gray-800/50 text-white border border-primary/20"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                        {message.actions && message.actions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.actions.map((action) => (
                              <Button
                                key={action.id}
                                variant="outline"
                                size="sm"
                                onClick={action.action}
                                className="w-full justify-start text-xs border-primary/30 hover:bg-primary/10 bg-transparent"
                              >
                                {action.icon}
                                <span className="ml-2">{action.label}</span>
                              </Button>
                            ))}
                          </div>
                        )}

                        {message.metadata && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                            <Badge variant="outline" className="text-xs border-primary/30">
                              {message.metadata.confidence}% confident
                            </Badge>
                            <span>•</span>
                            <span>{message.metadata.executionTime}s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-primary/20">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-gray-400">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="p-4 border-t border-primary/20">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Ask me anything about your platform..."
                    className="bg-gray-800/50 border-primary/30 text-white placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/80 hover:to-blue-600 text-black"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickAction("What are my top performing pages?")}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Top Pages
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickAction("Show me security recommendations")}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Security
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}
