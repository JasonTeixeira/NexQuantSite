"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  Send,
  Loader2,
  Settings,
  Database,
  Globe,
  Shield,
  Zap,
  Brain,
  Search,
  AlertTriangle,
  TrendingUp,
  Eye,
  Smartphone,
  Code,
  Server,
  Wifi,
  Download,
  Sparkles,
  Target,
  Crown,
} from "lucide-react"
import { toast } from "sonner"

interface AIMessage {
  id: string
  type: "user" | "ai" | "system"
  content: string
  timestamp: Date
  actions?: AIAction[]
  metadata?: {
    confidence?: number
    sources?: string[]
    executionTime?: number
    category?: string
    priority?: "low" | "medium" | "high" | "critical"
  }
}

interface AIAction {
  id: string
  label: string
  description: string
  action: () => void
  icon: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary"
  loading?: boolean
}

interface SystemAnalysis {
  overallHealth: number
  categories: {
    performance: number
    security: number
    userExperience: number
    content: number
    seo: number
    accessibility: number
    mobile: number
    analytics: number
  }
  criticalIssues: string[]
  recommendations: string[]
  lastAnalyzed: Date
}

interface CrawlProgress {
  isActive: boolean
  currentUrl: string
  pagesAnalyzed: number
  totalPages: number
  errors: number
  startTime: Date | null
}

interface APIConfiguration {
  openai: { key: string; model: string; enabled: boolean }
  anthropic: { key: string; model: string; enabled: boolean }
  gemini: { key: string; model: string; enabled: boolean }
  cohere: { key: string; model: string; enabled: boolean }
}

export default function AdminAIAssistantClient() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [systemAnalysis, setSystemAnalysis] = useState<SystemAnalysis | null>(null)
  const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({
    isActive: false,
    currentUrl: "",
    pagesAnalyzed: 0,
    totalPages: 0,
    errors: 0,
    startTime: null,
  })
  const [apiConfig, setApiConfig] = useState<APIConfiguration>({
    openai: { key: "", model: "gpt-4", enabled: true },
    anthropic: { key: "", model: "claude-3-opus", enabled: false },
    gemini: { key: "", model: "gemini-pro", enabled: false },
    cohere: { key: "", model: "command", enabled: false },
  })
  const [showApiConfig, setShowApiConfig] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<keyof APIConfiguration>("openai")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load saved API configuration
    const savedConfig = localStorage.getItem("ai-api-config")
    if (savedConfig) {
      setApiConfig(JSON.parse(savedConfig))
    }

    // Initialize with welcome message
    initializeAssistant()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const initializeAssistant = () => {
    const welcomeMessage: AIMessage = {
      id: Date.now().toString(),
      type: "ai",
      content: `🚀 **AI System Manager Initialized**

Hello! I'm your advanced AI assistant for managing the Nexural Trading Platform. I can help you:

**🔍 System Analysis & Optimization**
• Crawl and analyze your entire website
• Identify performance bottlenecks and security issues
• Provide actionable optimization recommendations
• Monitor user experience and accessibility

**📊 Business Intelligence**
• Analyze user behavior and conversion funnels  
• Track key performance indicators
• Generate comprehensive reports
• Predict trends and opportunities

**⚡ Management Automation**
• Automate routine administrative tasks
• Manage user accounts and permissions
• Content optimization and SEO improvements
• Database optimization suggestions

**🛡️ Security & Monitoring**
• Security vulnerability assessments
• Real-time system health monitoring
• Proactive issue detection and resolution
• Compliance and audit assistance

Ready to help you build a world-class platform! What would you like me to analyze first?`,
      timestamp: new Date(),
      actions: [
        {
          id: "full-system-crawl",
          label: "Full System Crawl",
          description: "Analyze entire website and generate comprehensive report",
          icon: <Globe className="w-4 h-4" />,
          action: () => startFullSystemCrawl(),
        },
        {
          id: "security-audit",
          label: "Security Audit",
          description: "Perform comprehensive security assessment",
          icon: <Shield className="w-4 h-4" />,
          action: () => handleQuickAction("Perform a comprehensive security audit of the entire system"),
        },
        {
          id: "performance-analysis",
          label: "Performance Analysis",
          description: "Analyze system performance and optimization opportunities",
          icon: <Zap className="w-4 h-4" />,
          action: () => handleQuickAction("Run a detailed performance analysis of all pages and components"),
        },
        {
          id: "user-experience-review",
          label: "UX Review",
          description: "Evaluate user experience and interface design",
          icon: <Eye className="w-4 h-4" />,
          action: () =>
            handleQuickAction("Conduct a comprehensive user experience review and provide improvement suggestions"),
        },
      ],
      metadata: {
        confidence: 100,
        category: "initialization",
        priority: "medium",
      },
    }

    setMessages([welcomeMessage])
  }

  const startFullSystemCrawl = async () => {
    setIsAnalyzing(true)
    setCrawlProgress({
      isActive: true,
      currentUrl: "",
      pagesAnalyzed: 0,
      totalPages: 0,
      errors: 0,
      startTime: new Date(),
    })

    const systemMessage: AIMessage = {
      id: Date.now().toString(),
      type: "system",
      content:
        "🔄 **Initiating Full System Crawl**\n\nStarting comprehensive analysis of your Nexural Trading Platform...",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, systemMessage])

    try {
      // Simulate crawling process
      const pages = [
        { url: "/", name: "Homepage" },
        { url: "/about", name: "About Page" },
        { url: "/pricing", name: "Pricing Page" },
        { url: "/blog", name: "Blog" },
        { url: "/dashboard", name: "User Dashboard" },
        { url: "/login", name: "Login Page" },
        { url: "/signup", name: "Signup Page" },
        { url: "/admin/dashboard", name: "Admin Dashboard" },
        { url: "/admin/users", name: "User Management" },
        { url: "/admin/analytics", name: "Analytics" },
        { url: "/trading", name: "Trading Interface" },
        { url: "/signals", name: "Trading Signals" },
        { url: "/marketplace", name: "Strategy Marketplace" },
        { url: "/learning", name: "Learning Center" },
        { url: "/support", name: "Support Center" },
      ]

      setCrawlProgress((prev) => ({ ...prev, totalPages: pages.length }))

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        setCrawlProgress((prev) => ({
          ...prev,
          currentUrl: page.url,
          pagesAnalyzed: i + 1,
        }))

        // Simulate analysis time
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Generate comprehensive analysis
      const analysis: SystemAnalysis = {
        overallHealth: 87,
        categories: {
          performance: 82,
          security: 91,
          userExperience: 85,
          content: 89,
          seo: 78,
          accessibility: 83,
          mobile: 86,
          analytics: 92,
        },
        criticalIssues: [
          "SEO meta descriptions missing on 3 pages",
          "Mobile responsiveness issues on trading interface",
          "Performance optimization needed for dashboard charts",
        ],
        recommendations: [
          "Implement lazy loading for trading charts",
          "Add SEO meta tags to all pages",
          "Optimize mobile trading interface",
          "Add performance monitoring",
          "Implement progressive web app features",
        ],
        lastAnalyzed: new Date(),
      }

      setSystemAnalysis(analysis)

      const analysisMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `✅ **System Crawl Complete!**

I've analyzed ${pages.length} pages of your Nexural Trading Platform. Here's the comprehensive report:

## 📊 **Overall System Health: ${analysis.overallHealth}/100**

### **Category Breakdown:**
• **Performance**: ${analysis.categories.performance}/100 - Good optimization, room for improvement
• **Security**: ${analysis.categories.security}/100 - Excellent security measures in place
• **User Experience**: ${analysis.categories.userExperience}/100 - Strong UX with minor enhancements needed
• **Content Quality**: ${analysis.categories.content}/100 - High-quality content across the platform
• **SEO Optimization**: ${analysis.categories.seo}/100 - Needs attention for better search visibility
• **Accessibility**: ${analysis.categories.accessibility}/100 - Good accessibility standards
• **Mobile Experience**: ${analysis.categories.mobile}/100 - Mobile-friendly with optimization opportunities
• **Analytics**: ${analysis.categories.analytics}/100 - Excellent tracking and data collection

### 🚨 **Critical Issues Found:**
${analysis.criticalIssues.map((issue) => `• ${issue}`).join("\n")}

### 💡 **Top Recommendations:**
${analysis.recommendations
  .slice(0, 3)
  .map((rec) => `• ${rec}`)
  .join("\n")}

**Next Steps:** I recommend focusing on SEO improvements and mobile optimization to reach 95+ overall health score.`,
        timestamp: new Date(),
        actions: [
          {
            id: "detailed-seo-analysis",
            label: "SEO Deep Dive",
            description: "Get detailed SEO analysis and action plan",
            icon: <Search className="w-4 h-4" />,
            action: () => handleQuickAction("Provide a detailed SEO analysis with specific optimization steps"),
          },
          {
            id: "performance-optimization",
            label: "Performance Plan",
            description: "Create performance optimization roadmap",
            icon: <Zap className="w-4 h-4" />,
            action: () => handleQuickAction("Create a detailed performance optimization plan with timeline"),
          },
          {
            id: "mobile-optimization",
            label: "Mobile Enhancement",
            description: "Mobile experience optimization strategy",
            icon: <Smartphone className="w-4 h-4" />,
            action: () => handleQuickAction("Provide mobile optimization recommendations with specific improvements"),
          },
        ],
        metadata: {
          confidence: 95,
          sources: pages.map((p) => p.name),
          executionTime: pages.length * 1.2,
          category: "analysis",
          priority: "high",
        },
      }

      setMessages((prev) => [...prev, analysisMessage])
      toast.success("System crawl completed successfully!")
    } catch (error) {
      toast.error("System crawl failed")
      console.error("Crawl error:", error)
    } finally {
      setIsAnalyzing(false)
      setCrawlProgress((prev) => ({ ...prev, isActive: false }))
    }
  }

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt)
    handleSendMessage(prompt)
  }

  const handleSendMessage = async (customMessage?: string) => {
    const messageContent = customMessage || inputValue.trim()
    if (!messageContent) return

    const userMessage: AIMessage = {
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
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const response = await generateAIResponse(messageContent)

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.content,
        timestamp: new Date(),
        actions: response.actions,
        metadata: response.metadata ? {
          ...response.metadata,
          priority: response.metadata.priority as "low" | "medium" | "high" | "critical" | undefined
        } : undefined,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      toast.error("Failed to get AI response")
      console.error("AI response error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = async (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes("seo") && lowerPrompt.includes("analysis")) {
      return {
        content: `🔍 **Comprehensive SEO Analysis**

I've performed a deep SEO audit of your Nexural Trading Platform:

## **Technical SEO (Score: 78/100)**

### **Issues Found:**
• **Missing Meta Descriptions**: 3 pages lack optimized meta descriptions
• **Title Tag Optimization**: 5 pages have non-optimized title tags
• **Header Structure**: H1-H6 hierarchy needs improvement on trading pages
• **Internal Linking**: Opportunity to improve internal link structure

### **Content SEO (Score: 85/100)**

### **Strong Points:**
• High-quality, original content across all pages
• Good keyword density and natural language
• Regular blog updates with trading insights
• Strong topical authority in trading/finance

### **Improvement Areas:**
• Add more long-tail keyword targeting
• Optimize for featured snippets
• Improve content freshness signals

## **🎯 Action Plan:**

### **Week 1-2: Quick Wins**
1. Add meta descriptions to all pages
2. Optimize title tags with target keywords
3. Fix header hierarchy issues
4. Implement schema markup for trading signals

### **Week 3-4: Content Optimization**
1. Create pillar content for main trading topics
2. Optimize existing pages for featured snippets
3. Improve internal linking strategy
4. Add FAQ sections to key pages

### **Month 2: Advanced SEO**
1. Build topic clusters around trading themes
2. Implement dynamic SEO for user-generated content
3. Add local SEO for geographic trading markets
4. Create comprehensive trading glossary

**Expected Results**: 15-25% increase in organic traffic within 3 months`,
        actions: [
          {
            id: "implement-seo-fixes",
            label: "Auto-Fix SEO Issues",
            description: "Automatically implement basic SEO improvements",
            icon: <Zap className="w-4 h-4" />,
            action: () => toast.success("SEO improvements implemented!"),
          },
          {
            id: "generate-meta-tags",
            label: "Generate Meta Tags",
            description: "Create optimized meta tags for all pages",
            icon: <Code className="w-4 h-4" />,
            action: () => toast.success("Meta tags generated!"),
          },
        ],
        metadata: {
          confidence: 92,
          sources: ["Google Search Console", "Technical Audit", "Content Analysis"],
          executionTime: 3.2,
          category: "seo",
          priority: "high",
        },
      }
    }

    if (lowerPrompt.includes("performance") && lowerPrompt.includes("optimization")) {
      return {
        content: `⚡ **Performance Optimization Analysis**

## **Current Performance Metrics**

### **Core Web Vitals:**
• **Largest Contentful Paint (LCP)**: 2.8s (Needs Improvement)
• **First Input Delay (FID)**: 85ms (Good)
• **Cumulative Layout Shift (CLS)**: 0.12 (Needs Improvement)

### **Page Load Analysis:**
• **Homepage**: 3.2s load time (Target: <2s)
• **Dashboard**: 4.1s load time (Critical)
• **Trading Interface**: 5.3s load time (Critical)

## **🎯 Optimization Strategy**

### **Phase 1: Critical Fixes (Week 1-2)**
1. **Image Optimization**
   - Implement WebP format for all images
   - Add lazy loading to trading charts
   - Compress and resize images automatically

2. **JavaScript Optimization**
   - Code splitting for dashboard components
   - Remove unused JavaScript (estimated 40% reduction)
   - Implement dynamic imports for trading widgets

3. **Database Optimization**
   - Add database indexes for frequently queried data
   - Implement query caching for trading signals
   - Optimize real-time data fetching

### **Phase 2: Advanced Optimization (Week 3-4)**
1. **Caching Strategy**
   - Implement Redis for session data
   - Add CDN for static assets
   - Enable browser caching with proper headers

2. **Server-Side Rendering**
   - Implement SSR for critical pages
   - Add preloading for user dashboards
   - Optimize API response times

### **Phase 3: Monitoring & Maintenance (Ongoing)**
1. **Performance Monitoring**
   - Real-time performance tracking
   - Automated alerts for performance degradation
   - Regular performance audits

**Expected Results**: 60-80% improvement in load times, 95+ Lighthouse scores`,
        actions: [
          {
            id: "optimize-images",
            label: "Optimize Images",
            description: "Automatically optimize all images",
            icon: <Download className="w-4 h-4" />,
            action: () => toast.success("Image optimization started!"),
          },
          {
            id: "enable-caching",
            label: "Enable Caching",
            description: "Configure advanced caching strategies",
            icon: <Server className="w-4 h-4" />,
            action: () => toast.success("Caching enabled!"),
          },
        ],
        metadata: {
          confidence: 94,
          sources: ["Lighthouse Audit", "WebPageTest", "Performance API"],
          executionTime: 2.8,
          category: "performance",
          priority: "critical",
        },
      }
    }

    if (lowerPrompt.includes("security") && lowerPrompt.includes("audit")) {
      return {
        content: `🛡️ **Comprehensive Security Audit**

## **Security Assessment Score: 91/100**

### **✅ Strong Security Measures:**
• **HTTPS Implementation**: Perfect SSL/TLS configuration
• **Authentication**: Multi-factor authentication enabled
• **Data Encryption**: End-to-end encryption for sensitive data
• **Access Controls**: Role-based permissions properly implemented
• **Session Management**: Secure session handling with proper timeouts

### **🔍 Areas for Improvement:**

#### **Medium Priority Issues:**
1. **Content Security Policy**: Strengthen CSP headers
2. **API Rate Limiting**: Implement more granular rate limiting
3. **Input Validation**: Enhanced client-side validation needed
4. **Audit Logging**: Expand audit trail coverage

#### **Recommendations:**

### **Immediate Actions (This Week):**
1. **Update Security Headers**
   - Implement stricter Content-Security-Policy
   - Add X-Frame-Options: DENY
   - Enable HTTP Strict Transport Security (HSTS)

2. **API Security Enhancement**
   - Implement JWT token rotation
   - Add API endpoint monitoring
   - Strengthen input sanitization

### **Short-term (Next Month):**
1. **Advanced Monitoring**
   - Implement intrusion detection system
   - Add real-time security alerts
   - Enhanced login attempt monitoring

2. **Compliance & Standards**
   - SOC 2 Type II preparation
   - GDPR compliance review
   - PCI DSS assessment for payment data

### **Long-term (Next Quarter):**
1. **Security Automation**
   - Automated vulnerability scanning
   - Security testing in CI/CD pipeline
   - Penetration testing schedule

**Overall Assessment**: Your security posture is excellent with minor improvements needed for enterprise-grade security.`,
        actions: [
          {
            id: "update-security-headers",
            label: "Fix Security Headers",
            description: "Update and strengthen all security headers",
            icon: <Shield className="w-4 h-4" />,
            action: () => toast.success("Security headers updated!"),
          },
          {
            id: "security-scan",
            label: "Run Security Scan",
            description: "Perform automated vulnerability scan",
            icon: <Search className="w-4 h-4" />,
            action: () => toast.success("Security scan initiated!"),
          },
        ],
        metadata: {
          confidence: 96,
          sources: ["Security Audit", "Penetration Test", "Compliance Check"],
          executionTime: 1.8,
          category: "security",
          priority: "medium",
        },
      }
    }

    if (lowerPrompt.includes("mobile") && lowerPrompt.includes("optimization")) {
      return {
        content: `📱 **Mobile Optimization Analysis**

## **Current Mobile Score: 86/100**

### **Mobile Performance Metrics:**
• **Mobile Page Speed**: 3.8s (Target: <3s)
• **Touch Target Size**: 92% compliant
• **Viewport Configuration**: Properly configured
• **Mobile Usability**: Good with room for improvement

### **🎯 Mobile Enhancement Strategy**

#### **Critical Issues to Address:**

1. **Trading Interface Mobile Experience**
   - Charts are difficult to interact with on mobile
   - Button spacing needs improvement for touch targets
   - Horizontal scrolling issues on data tables

2. **Dashboard Mobile Layout**
   - Information density too high on small screens
   - Need collapsible sections for better navigation
   - Performance metrics hard to read on mobile

### **📋 Optimization Plan:**

#### **Phase 1: Core Mobile Fixes (Week 1)**
1. **Touch Interface Improvements**
   - Increase button sizes to minimum 44px
   - Add proper touch feedback animations
   - Implement swipe gestures for chart navigation

2. **Layout Optimizations**
   - Implement progressive disclosure for complex data
   - Add mobile-first navigation patterns
   - Optimize typography for mobile reading

#### **Phase 2: Advanced Mobile Features (Week 2-3)**
1. **Mobile-Specific Features**
   - Add pull-to-refresh functionality
   - Implement offline trading data viewing
   - Add mobile push notifications for signals

2. **Performance Enhancements**
   - Reduce mobile JavaScript bundle size
   - Implement mobile-specific image sizes
   - Add service worker for better caching

#### **Phase 3: Mobile Excellence (Week 4)**
1. **Progressive Web App Features**
   - Add to home screen functionality
   - Implement background sync for trading data
   - Add mobile-specific animations and transitions

2. **Testing & Optimization**
   - Comprehensive mobile device testing
   - Performance optimization for low-end devices
   - Accessibility improvements for mobile screen readers

**Expected Outcome**: 95+ mobile score, 40% improvement in mobile user engagement`,
        actions: [
          {
            id: "fix-mobile-ui",
            label: "Fix Mobile Interface",
            description: "Implement mobile UI improvements",
            icon: <Smartphone className="w-4 h-4" />,
            action: () => toast.success("Mobile UI improvements applied!"),
          },
          {
            id: "mobile-pwa",
            label: "Enable PWA Features",
            description: "Add Progressive Web App capabilities",
            icon: <Download className="w-4 h-4" />,
            action: () => toast.success("PWA features enabled!"),
          },
        ],
        metadata: {
          confidence: 89,
          sources: ["Mobile Audit", "Device Testing", "User Analytics"],
          executionTime: 2.1,
          category: "mobile",
          priority: "high",
        },
      }
    }

    // Default comprehensive response
    return {
      content: `🤖 **AI Analysis Complete**

I've analyzed your query and here's what I can help you with:

## **Available System Management Capabilities:**

### **🔍 Deep Analysis**
• Full website crawling and performance analysis
• Security vulnerability assessments
• User experience and accessibility audits
• SEO and content optimization reviews

### **📊 Business Intelligence**
• User behavior analysis and conversion optimization
• Performance tracking and KPI monitoring
• Competitive analysis and market insights
• Revenue optimization strategies

### **⚡ Automation & Optimization**
• Automated task scheduling and management
• Database optimization and query improvements
• Content management and SEO automation
• System monitoring and alert management

### **🛠️ Technical Management**
• Server performance monitoring and optimization
• API management and rate limiting
• Security hardening and compliance checking
• Backup and disaster recovery planning

**What specific area would you like me to focus on?** I can provide detailed analysis and actionable recommendations for any aspect of your Nexural Trading Platform.`,
      actions: [
        {
          id: "business-analysis",
          label: "Business Analysis",
          description: "Comprehensive business performance review",
          icon: <TrendingUp className="w-4 h-4" />,
          action: () =>
            handleQuickAction(
              "Provide a comprehensive business analysis with growth opportunities and optimization strategies",
            ),
        },
        {
          id: "technical-audit",
          label: "Technical Audit",
          description: "Deep technical system assessment",
          icon: <Server className="w-4 h-4" />,
          action: () =>
            handleQuickAction(
              "Perform a comprehensive technical audit including database, API, and infrastructure analysis",
            ),
        },
      ],
      metadata: {
        confidence: 90,
        category: "general",
        priority: "medium",
      },
    }
  }

  const saveApiConfiguration = () => {
    localStorage.setItem("ai-api-config", JSON.stringify(apiConfig))
    toast.success("API configuration saved!")
    setShowApiConfig(false)
  }

  const testApiConnection = async (provider: keyof APIConfiguration) => {
    toast.info(`Testing ${provider} connection...`)
    // Simulate API test
    await new Promise((resolve) => setTimeout(resolve, 2000))
    toast.success(`${provider} connection successful!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white font-display flex items-center gap-3">
              <Bot className="w-10 h-10 text-primary" />
              AI System Manager
            </h1>
            <p className="text-gray-300 mt-2">Advanced AI-powered system management and optimization</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowApiConfig(true)} variant="outline" className="border-primary/30">
              <Settings className="w-4 h-4 mr-2" />
              API Configuration
            </Button>
            <Button onClick={startFullSystemCrawl} disabled={isAnalyzing} className="bg-primary hover:bg-primary/80">
              <Globe className={`w-4 h-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analyzing..." : "System Crawl"}
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        {systemAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Overall Health</p>
                    <p className="text-3xl font-bold">{systemAnalysis.overallHealth}</p>
                  </div>
                  <Crown className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Performance</p>
                    <p className="text-3xl font-bold">{systemAnalysis.categories.performance}</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Security</p>
                    <p className="text-3xl font-bold">{systemAnalysis.categories.security}</p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Critical Issues</p>
                    <p className="text-3xl font-bold">{systemAnalysis.criticalIssues.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Crawl Progress */}
        {crawlProgress.isActive && (
          <Card className="bg-gray-800/50 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">System Crawl in Progress</h3>
                    <p className="text-gray-400">Currently analyzing: {crawlProgress.currentUrl}</p>
                  </div>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {crawlProgress.pagesAnalyzed}/{crawlProgress.totalPages} pages
                </Badge>
              </div>
              <Progress value={(crawlProgress.pagesAnalyzed / crawlProgress.totalPages) * 100} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Main Chat Interface */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader className="border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-black" />
                </div>
                <div>
                  <CardTitle className="text-white">AI System Manager</CardTitle>
                  <CardDescription className="text-gray-400">
                    Intelligent system analysis and management assistant
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  Online
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-96 p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.type === "user"
                          ? "bg-primary text-black"
                          : message.type === "system"
                            ? "bg-blue-900/30 text-blue-200 border border-blue-500/30"
                            : "bg-gray-700/50 text-white border border-primary/20"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {message.actions.map((action) => (
                            <Button
                              key={action.id}
                              variant="outline"
                              size="sm"
                              onClick={action.action}
                              disabled={action.loading}
                              className="justify-start text-xs border-primary/30 hover:bg-primary/10 bg-transparent"
                            >
                              {action.loading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : action.icon}
                              <span className="ml-2">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      {message.metadata && (
                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                          <Badge variant="outline" className="text-xs border-primary/30">
                            {message.metadata.confidence}% confident
                          </Badge>
                          {message.metadata.executionTime && (
                            <>
                              <span>•</span>
                              <span>{message.metadata.executionTime}s</span>
                            </>
                          )}
                          {message.metadata.priority && (
                            <>
                              <span>•</span>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  message.metadata.priority === "critical"
                                    ? "border-red-500/30 text-red-400"
                                    : message.metadata.priority === "high"
                                      ? "border-orange-500/30 text-orange-400"
                                      : "border-primary/30"
                                }`}
                              >
                                {message.metadata.priority}
                              </Badge>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm text-gray-300">AI is analyzing your system...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-6 border-t border-gray-700/50">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask me anything about your system management..."
                  className="bg-gray-700/50 border-primary/30 text-white placeholder:text-gray-400"
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

              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction("Analyze user engagement and conversion rates")}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  User Analytics
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction("Review database performance and optimization opportunities")}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  <Database className="w-3 h-3 mr-1" />
                  Database Health
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleQuickAction("Check for security vulnerabilities and provide hardening recommendations")
                  }
                  className="text-xs text-gray-400 hover:text-white"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Security Check
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction("Provide content optimization and SEO improvement strategies")}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  <Target className="w-3 h-3 mr-1" />
                  Content Strategy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration Dialog */}
        <Dialog open={showApiConfig} onOpenChange={setShowApiConfig}>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                AI API Configuration
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure your AI provider API keys for enhanced system management capabilities
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={selectedProvider}
              onValueChange={(value) => setSelectedProvider(value as keyof APIConfiguration)}
            >
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger value="openai">OpenAI</TabsTrigger>
                <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
                <TabsTrigger value="gemini">Gemini</TabsTrigger>
                <TabsTrigger value="cohere">Cohere</TabsTrigger>
              </TabsList>

              {Object.entries(apiConfig).map(([provider, config]) => (
                <TabsContent key={provider} value={provider} className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-white font-medium">
                      {provider.charAt(0).toUpperCase() + provider.slice(1)} Configuration
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) =>
                          setApiConfig((prev) => ({
                            ...prev,
                            [provider]: { ...prev[provider as keyof APIConfiguration], enabled },
                          }))
                        }
                      />
                      <Label className="text-gray-400">Enabled</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">API Key</Label>
                      <Input
                        type="password"
                        value={config.key}
                        onChange={(e) =>
                          setApiConfig((prev) => ({
                            ...prev,
                            [provider]: { ...prev[provider as keyof APIConfiguration], key: e.target.value },
                          }))
                        }
                        placeholder={`Enter your ${provider} API key`}
                        className="bg-gray-800 border-gray-600 text-white mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">Model</Label>
                      <Select
                        value={config.model}
                        onValueChange={(model) =>
                          setApiConfig((prev) => ({
                            ...prev,
                            [provider]: { ...prev[provider as keyof APIConfiguration], model },
                          }))
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {provider === "openai" && (
                            <>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            </>
                          )}
                          {provider === "anthropic" && (
                            <>
                              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                              <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                            </>
                          )}
                          {provider === "gemini" && (
                            <>
                              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                              <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                            </>
                          )}
                          {provider === "cohere" && (
                            <>
                              <SelectItem value="command">Command</SelectItem>
                              <SelectItem value="command-light">Command Light</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => testApiConnection(provider as keyof APIConfiguration)}
                        variant="outline"
                        size="sm"
                        disabled={!config.key}
                        className="border-primary/30"
                      >
                        <Wifi className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApiConfig(false)}>
                Cancel
              </Button>
              <Button onClick={saveApiConfiguration} className="bg-primary hover:bg-primary/80">
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
