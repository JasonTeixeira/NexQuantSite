"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  FileText,
  Zap,
  Shield,
  Monitor,
  ImageIcon,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Home,
  TrendingUp,
  Gift,
  Activity,
  Menu,
  X,
  DollarSign,
  Brain,
  Workflow,
  Scale,
  Database,
  FlaskConical,
  MessageSquare,
  Layout,
  Rocket,
  HeadphonesIcon,
  BookOpen,
  Package,
  Wallet,
  CreditCard,
  TestTube,
  GraduationCap,
  Play,
  Trophy,
  BookOpen as BookOpenIcon,
  Video,
  FileQuestion,
  UserCheck,
  Award,
  PieChart,
  Target,
  Layers,
  Upload,
  Settings2,
  CheckCircle,
  TrendingUp as TrendingUpIcon,
  Signal,
} from "lucide-react"
import AdminErrorBoundary, { AdminLoadingSpinner } from "@/components/error-boundary-admin"
import AICommandPrompt from "@/components/admin/ai-command-prompt"

const adminNavigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "💰 Cost Monitor", href: "/admin/testing-costs", icon: DollarSign },
      { name: "Personalization", href: "/admin/dashboard-personalization", icon: Layout },
      { name: "Performance Center", href: "/admin/performance-command-center", icon: Monitor },
      { name: "Security Monitor", href: "/admin/security-monitoring", icon: Shield },
    ],
  },
  {
    title: "🤖 Trading Bot Management",
    items: [
      { name: "🏠 Bot Dashboard", href: "/admin/bot-management", icon: Brain },
      { name: "⚙️ Bot Configuration", href: "/admin/bot-management?tab=configuration", icon: Settings },
      { name: "👥 User Subscriptions", href: "/admin/bot-management?tab=users", icon: Users },
      { name: "📊 Bot Analytics", href: "/admin/bot-management?tab=analytics", icon: BarChart3 },
      { name: "🚀 Deployment Center", href: "/admin/bot-management?tab=deployment", icon: Rocket },
      { name: "📡 Signal Management", href: "/admin/signals", icon: Signal },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Testing Engine", href: "/admin/testing-engine", icon: TestTube },
      { name: "A/B Testing", href: "/admin/ab-testing", icon: FlaskConical },
      { name: "Messaging System", href: "/admin/messaging-system", icon: MessageSquare },
      { name: "Workflow Management", href: "/admin/workflow-management", icon: Workflow },
      { name: "Bulk Operations", href: "/admin/bulk-operations", icon: Zap },
      { name: "Content Workflow", href: "/admin/content-workflow", icon: Workflow },
      { name: "API Management", href: "/admin/api-management", icon: Database },
      { name: "Strategy Analytics", href: "/admin/strategy-analytics", icon: TestTube },
    ],
  },
  {
    title: "Business Intelligence",
    items: [
      { name: "Business Analytics", href: "/admin/business-analytics", icon: BarChart3 },
      { name: "Revenue Dashboard", href: "/admin/revenue-analytics", icon: DollarSign },
      { name: "User Analytics", href: "/admin/user-analytics", icon: Users },
      { name: "Conversion Funnels", href: "/admin/funnel-analytics", icon: TrendingUp },
      { name: "Cohort Analysis", href: "/admin/cohort-analytics", icon: Brain },
      { name: "Referral System", href: "/admin/referral-management", icon: Gift },
    ],
  },
  {
    title: "Customer Operations",
    items: [
      { name: "Customer Support", href: "/admin/customer-support", icon: HeadphonesIcon },
      { name: "Help Center", href: "/admin/help-center", icon: BookOpen },
      { name: "System Status", href: "/admin/system-status", icon: Activity },
    ],
  },
  {
    title: "Financial Operations",
    items: [
      { name: "Billing Management", href: "/admin/billing-management", icon: CreditCard },
      { name: "Referral Management", href: "/admin/referral-management", icon: Users },
      { name: "Subscription Plans", href: "/admin/subscription-plans", icon: Package },
      { name: "Revenue Analytics", href: "/admin/revenue-dashboard", icon: DollarSign },
      { name: "Payment Processing", href: "/admin/payment-processing", icon: Wallet },
    ],
  },
  {
    title: "Content & Workflow",
    items: [
      { name: "Content Management", href: "/admin/content-management", icon: FileText },
      { name: "Blog Posts", href: "/admin/blog-management", icon: FileText },
      { name: "Pages", href: "/admin/pages", icon: FileText },
      { name: "Media Library", href: "/admin/media", icon: ImageIcon },
      { name: "Careers", href: "/admin/careers", icon: Users },
    ],
  },
  {
    title: "🎓 Learning Management System",
    items: [
      { name: "🏠 LMS Dashboard", href: "/admin/lms", icon: LayoutDashboard },
      { name: "📚 Course Builder", href: "/admin/lms/course-builder", icon: GraduationCap },
      { name: "❓ Quiz Builder", href: "/admin/lms/quiz-builder", icon: FileQuestion },
      { name: "🎬 Video Manager", href: "/admin/lms/video-manager", icon: Video },
      { name: "📊 Student Progress", href: "/admin/lms/student-progress", icon: UserCheck },
      { name: "🏆 Badges & Certificates", href: "/admin/lms/badges-certificates", icon: Award },
      { name: "📈 Learning Analytics", href: "/admin/lms/learning-analytics", icon: PieChart },
      { name: "🎯 Learning Paths", href: "/admin/lms/learning-paths", icon: Target },
      { name: "📝 Content Templates", href: "/admin/lms/content-templates", icon: Layers },
      { name: "⚡ Quick Actions", href: "/admin/lms/quick-actions", icon: Zap },
      { name: "🛡️ Discussion Moderation", href: "/admin/lms/discussion-moderation", icon: Shield },
    ],
  },
  {
    title: "User Management",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "User Onboarding", href: "/admin/user-onboarding", icon: Rocket },
      { name: "Roles & Permissions", href: "/admin/roles", icon: Shield },
      { name: "Community Management", href: "/admin/community-management", icon: MessageSquare },
      { name: "Social Management", href: "/admin/social-management", icon: Users },
      { name: "User Segmentation", href: "/admin/user-segmentation", icon: Users },
    ],
  },
  {
    title: "Security & Monitoring",
    items: [
      { name: "Security Dashboard", href: "/admin/security-dashboard", icon: Shield },
      { name: "Threat Monitoring", href: "/admin/threat-monitoring", icon: Activity },
      { name: "System Health", href: "/admin/system-health", icon: Monitor },
      { name: "Real-time Monitor", href: "/admin/realtime-monitor", icon: Zap },
      { name: "Disaster Recovery", href: "/admin/disaster-recovery", icon: Shield },
    ],
  },
  {
    title: "Technical",
    items: [
      { name: "Signals", href: "/admin/signals", icon: Zap },
      { name: "Comprehensive Testing", href: "/admin/comprehensive-testing", icon: TestTube },
    ],
  },
  {
    title: "Compliance & Legal",
    items: [
      { name: "Compliance", href: "/admin/compliance", icon: Scale },
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "Audit Log", href: "/admin/audit", icon: Activity },
    ],
  },
]

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [admin, setAdmin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("adminToken")
          const adminData = localStorage.getItem("adminData")

          if (token && adminData) {
            try {
              const parsedAdmin = JSON.parse(adminData)
              setAdmin(parsedAdmin)
            } catch (parseError) {
              console.error("Invalid admin data format:", parseError)
              localStorage.removeItem("adminToken")
              localStorage.removeItem("adminData")
              if (pathname !== "/admin/login") {
                router.push("/admin/login")
                return
              }
            }
          } else if (pathname !== "/admin/login") {
            router.push("/admin/login")
            return
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminToken")
          localStorage.removeItem("adminData")
        }
        if (pathname !== "/admin/login") {
          router.push("/admin/login")
          return
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router, pathname, mounted])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminData")
    }
    setAdmin(null)
    router.push("/admin/login")
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = []

    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i]
      const href = "/" + segments.slice(0, i + 1).join("/")
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ")

      breadcrumbs.push({ name, href, isLast: i === segments.length - 1 })
    }

    return breadcrumbs
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading admin panel...</div>
      </div>
    )
  }

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Admin Panel</h2>
              <p className="text-xs text-gray-400">Nexural Trading</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {adminNavigation.map((group) => (
            <div key={group.title} className="mb-6">
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group.title}</h3>
              <nav className="space-y-1 px-2">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-gray-800 text-white border-r-2 border-red-500"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-gray-950/50 backdrop-blur-xl border-b border-gray-800 h-16 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/admin/dashboard" className="text-gray-400 hover:text-white flex items-center">
                <Home className="w-4 h-4" />
              </Link>
              {getBreadcrumbs().map((crumb, index) => (
                <div key={crumb.href} className="flex items-center space-x-2">
                  <span className="text-gray-600">/</span>
                  {crumb.isLast ? (
                    <span className="text-white font-medium">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.href} className="text-gray-400 hover:text-white">
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Search className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                2
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-800">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold">
                      {admin.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-white">{admin.name}</div>
                    <div className="text-xs text-gray-400">{admin.role}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                <DropdownMenuLabel className="text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{admin.name}</p>
                    <p className="text-xs text-gray-400">{admin.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Link href="/" className="flex items-center">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Link href="/admin/settings" className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* AI Command Prompt - Always Available at Bottom */}
      <AICommandPrompt />
    </div>
  )
}
