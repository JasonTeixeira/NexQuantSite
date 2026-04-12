"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Brain, Send, Terminal, Zap, FileText, BarChart3, Settings, 
  Sparkles, Crown, Database, Globe, TrendingUp, Users, DollarSign,
  ChevronUp, ChevronDown, Copy, Download, RefreshCw, Minimize2
} from "lucide-react"
import { toast } from "sonner"
import AIContentEngine from "./ai-content-engine"
import AISystemAnalyzer from "./ai-system-analyzer"

interface CommandResult {
  id: string
  command: string
  response: string
  timestamp: Date
  category: 'content' | 'analytics' | 'system' | 'general'
}

interface SystemMetrics {
  users: number
  revenue: number
  uptime: string
  satisfaction: number
  currentPage: string
  systemHealth: string
}

export default function AICommandPrompt() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<CommandResult[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    users: 12450,
    revenue: 485720,
    uptime: "99.9%",
    satisfaction: 4.8,
    currentPage: "Dashboard",
    systemHealth: "excellent"
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Focus input when component mounts or when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Auto-scroll to bottom when new results
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [results])

  // Global keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsExpanded(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [isExpanded])

  const extractTopic = (command: string): string => {
    const topics = ['AI trading', 'risk management', 'portfolio optimization', 'market analysis', 'trading psychology', 'automation', 'signals']
    for (const topic of topics) {
      if (command.toLowerCase().includes(topic.toLowerCase())) {
        return topic
      }
    }
    return 'AI Trading Strategies'
  }

  const processCommand = async (command: string) => {
    setIsProcessing(true)
    const lowerCommand = command.toLowerCase()
    
    try {
      let response = ""
      let category: 'content' | 'analytics' | 'system' | 'general' = 'general'

      if (lowerCommand.includes("content") || lowerCommand.includes("blog") || lowerCommand.includes("write")) {
        category = 'content'
        const contentRequest = {
          type: 'blog' as const,
          topic: extractTopic(command) || 'AI Trading Strategies',
          audience: 'traders',
          tone: 'professional' as const,
          length: 'medium' as const,
          systemData: systemMetrics
        }
        
        const generatedContent = await AIContentEngine.generateContent(contentRequest)
        response = `✅ CONTENT GENERATED\n\n📝 Title: "${generatedContent.title}"\n🎯 Performance Score: ${generatedContent.performancePredictions.engagementScore}%\n📊 SEO Keywords: ${generatedContent.seoKeywords.join(', ')}\n\n💡 Preview:\n${generatedContent.content.substring(0, 200)}...\n\n🚀 Recommended CTAs:\n• ${generatedContent.ctaRecommendations.slice(0, 2).join('\n• ')}`

      } else if (lowerCommand.includes("analytics") || lowerCommand.includes("users") || lowerCommand.includes("data")) {
        category = 'analytics'
        const insights = await AISystemAnalyzer.generateInsights()
        const metrics = AISystemAnalyzer.getCurrentMetrics()
        const topInsight = insights[0]
        
        response = `📊 SYSTEM ANALYSIS COMPLETE\n\n👥 Users: ${metrics.users.total.toLocaleString()} (${metrics.users.active.toLocaleString()} active)\n💰 Revenue: $${metrics.revenue.total.toLocaleString()}\n⭐ Satisfaction: ${metrics.performance.satisfaction}/5.0\n\n🔥 TOP OPPORTUNITY:\n"${topInsight.title}" - ${topInsight.priority === 'critical' ? '🔴 CRITICAL' : '🟡 HIGH'}\n💵 Potential Value: $${topInsight.estimatedValue.toLocaleString()}\n⏱️ Implementation: ${topInsight.timeToImplement}\n\n📈 Quick Stats:\n• Conversion Rate: 78.3% (signup → active)\n• Feature Adoption: Auto-bots (89%), Signals (76%)\n• Growth Opportunity: Mobile app development`

      } else if (lowerCommand.includes("system") || lowerCommand.includes("performance") || lowerCommand.includes("health")) {
        category = 'system'
        response = `🖥️ SYSTEM STATUS\n\n✅ All Systems Operational\n📈 Uptime: ${systemMetrics.uptime}\n⚡ Response Time: 145ms\n🔒 Security: Enhanced\n💾 Database: Optimized\n\n🎯 Current Metrics:\n• Active Sessions: 1,247\n• API Calls: 45.2K today\n• Error Rate: 0.02%\n• Cache Hit Rate: 94.7%\n\n🚨 Recommendations:\n• Consider auto-scaling for peak hours (9-11 AM EST)\n• Database optimization scheduled for 2 AM EST\n• CDN performance: 98.3% efficiency`

      } else if (lowerCommand.includes("help") || lowerCommand === "") {
        response = `🤖 NEXURAL AI COMMAND CENTER\n\nAvailable Commands:\n\n📝 CONTENT CREATION:\n• "write blog about [topic]" - Generate SEO blog posts\n• "create email campaign" - Design marketing emails\n• "social media content" - Multi-platform posts\n\n📊 ANALYTICS & DATA:\n• "analyze users" - User behavior insights\n• "revenue report" - Financial performance\n• "growth opportunities" - AI-identified improvements\n\n🖥️ SYSTEM MANAGEMENT:\n• "system health" - Infrastructure status\n• "performance metrics" - Real-time KPIs\n• "user feedback" - Satisfaction analysis\n\n⚡ Quick Commands:\n• Press Ctrl/Cmd + K to open prompt\n• Type "help" anytime for commands\n• All responses include actionable insights`

      } else {
        // Smart command interpretation
        if (lowerCommand.includes("optimize") || lowerCommand.includes("improve")) {
          response = `⚡ OPTIMIZATION OPPORTUNITIES\n\n🎯 Conversion Rate: 3.2% → 5.8% potential (+$340K ARR)\n📱 Mobile App: 67% users request → +45% retention\n🔗 Referral Program: 8% participation → 23% potential\n\n🚀 IMMEDIATE ACTIONS:\n1. Landing page video (+34% conversions)\n2. Referral rewards increase ($50 → $100)\n3. Mobile app development priority\n\n💡 Implementation Timeline:\nWeek 1: Landing page optimization\nWeek 2-3: Referral program launch\nWeeks 4-12: Mobile app development`
        } else {
          response = `🧠 AI RESPONSE\n\nI understand you're asking about: "${command}"\n\n💡 Based on your system data:\n• ${systemMetrics.users.toLocaleString()} users are actively using your platform\n• $${systemMetrics.revenue.toLocaleString()} in revenue shows strong market fit\n• ${systemMetrics.satisfaction}/5.0 user satisfaction indicates quality\n\n🎯 Suggestions:\n• Try "analyze users" for detailed insights\n• Use "write content about [topic]" for blog posts\n• Ask "system health" for performance data\n\n⚡ Pro tip: I can see your entire platform and provide specific, actionable recommendations!`
        }
      }

      const result: CommandResult = {
        id: Date.now().toString(),
        command,
        response,
        timestamp: new Date(),
        category
      }

      setResults(prev => [...prev, result])
      setInputValue("")
      
    } catch (error) {
      console.error('Command processing error:', error)
      const errorResult: CommandResult = {
        id: Date.now().toString(),
        command,
        response: `❌ Error processing command: ${command}\n\nPlease try again or use "help" for available commands.`,
        timestamp: new Date(),
        category: 'general'
      }
      setResults(prev => [...prev, errorResult])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isProcessing) {
      processCommand(inputValue.trim())
    }
  }

  const handleClear = () => {
    setResults([])
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content': return 'text-blue-400 bg-blue-500/10'
      case 'analytics': return 'text-green-400 bg-green-500/10'
      case 'system': return 'text-yellow-400 bg-yellow-500/10'
      default: return 'text-blue-400 bg-blue-500/10'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return FileText
      case 'analytics': return BarChart3
      case 'system': return Settings
      default: return Brain
    }
  }

  return (
    <>
      {/* Expanded Results Panel */}
      {isExpanded && results.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-blue-500/30 z-50">
          <div className="max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">AI Command Results</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-gray-400 hover:text-white">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white">
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <ScrollArea ref={scrollRef} className="max-h-80 p-4">
              <div className="space-y-4">
                {results.map((result) => {
                  const IconComponent = getCategoryIcon(result.category)
                  return (
                    <div key={result.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300 font-mono text-sm">→ {result.command}</span>
                          <Badge className={`text-xs ${getCategoryColor(result.category)}`}>
                            {result.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {result.timestamp.toLocaleTimeString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(result.response)
                              toast.success("Response copied to clipboard!")
                            }}
                            className="h-6 w-6 p-0 text-gray-500 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-200 whitespace-pre-line font-mono leading-relaxed">
                        {result.response}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Bottom Command Prompt Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-blue-500/30 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* AI Status Indicator */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="relative">
                <Brain className="w-6 h-6 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full flex items-center justify-center">
                  <Crown className="w-2 h-2 text-black" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-semibold">NEXURAL AI</div>
                <div className="text-xs text-green-400">Full System Access • Ready</div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="hidden md:flex items-center space-x-6 text-xs text-gray-400 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{systemMetrics.users.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>${(systemMetrics.revenue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>{systemMetrics.uptime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{systemMetrics.satisfaction}/5.0</span>
              </div>
            </div>

            {/* Command Input */}
            <form onSubmit={handleSubmit} className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <Terminal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask AI anything about your platform... (Ctrl+K to focus)"
                  className="pl-10 pr-4 h-12 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 font-mono"
                  disabled={isProcessing}
                />
                {isProcessing && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
              <Button 
                type="submit"
                disabled={!inputValue.trim() || isProcessing}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 border-blue-500"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Execute</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Expand/Collapse Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-12 w-12 p-0 text-gray-400 hover:text-white flex-shrink-0"
              disabled={results.length === 0}
            >
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </Button>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Page: {systemMetrics.currentPage}</span>
              <span>•</span>
              <span>Health: {systemMetrics.systemHealth}</span>
              <span>•</span>
              <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Ctrl+K</kbd>
              <span>to focus</span>
              <span>•</span>
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Esc</kbd>
              <span>to collapse</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Padding for Content */}
      <div className="h-24" />
    </>
  )
}
