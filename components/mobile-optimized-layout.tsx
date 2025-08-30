"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Home, TrendingUp, User, Settings, Search, Bell, Heart, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

interface MobileOptimizedLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "strategies", label: "Strategies", icon: TrendingUp, href: "/strategy-lab" },
  { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
]

const quickActions = [
  { id: "search", label: "Search", icon: Search },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 3 },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Strategy Alert",
      message: "Your momentum strategy triggered a buy signal",
      time: "2m ago",
      type: "success",
    },
    { id: 2, title: "Market Update", message: "BTC broke resistance at $45,000", time: "5m ago", type: "info" },
    { id: 3, title: "Risk Warning", message: "Portfolio drawdown exceeded 5%", time: "10m ago", type: "warning" },
  ])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Mobile-specific gesture handlers
  const handleSwipeLeft = () => {
    const currentIndex = navigationItems.findIndex((item) => item.id === activeTab)
    if (currentIndex < navigationItems.length - 1) {
      setActiveTab(navigationItems[currentIndex + 1].id)
    }
  }

  const handleSwipeRight = () => {
    const currentIndex = navigationItems.findIndex((item) => item.id === activeTab)
    if (currentIndex > 0) {
      setActiveTab(navigationItems[currentIndex - 1].id)
    }
  }

  // Pull-to-refresh functionality
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    // Store initial touch position
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    // Calculate pull distance
  }

  const handleTouchEnd = () => {
    if (pullDistance > 100) {
      setIsRefreshing(true)
      // Simulate refresh
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
      }, 2000)
    } else {
      setPullDistance(0)
    }
  }

  if (!isMobile) {
    return <div className="min-h-screen bg-black text-white">{children}</div>
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Mobile Background Effects */}
      <div className="fixed inset-0 opacity-20 pointer-events-none z-[-2]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,136,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,112,219,0.1)_0%,transparent_50%)]" />
      </div>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-primary/20">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-white">Nexural</span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white p-2">
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white p-2 relative">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900 border-gray-700 w-80">
                <div className="py-4">
                  <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-3 bg-white/5 border border-primary/20 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-medium text-white text-sm">{notification.title}</h3>
                            <span className="text-xs text-white/50">{notification.time}</span>
                          </div>
                          <p className="text-sm text-white/70">{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>

            {/* Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900 border-gray-700 w-80">
                <div className="py-4">
                  {/* User Profile */}
                  <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-lg">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-primary text-black font-bold">JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">John Doe</h3>
                      <p className="text-sm text-white/60">Pro Trader</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id)
                          setIsMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          activeTab === item.id
                            ? "bg-primary/20 text-primary"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>

                  {/* Quick Settings */}
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h3 className="text-sm font-semibold text-white mb-3">Quick Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">Dark Mode</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">Push Notifications</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">Auto-refresh</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div className="absolute top-full left-0 right-0 bg-primary/10 border-b border-primary/20">
            <div className="flex items-center justify-center py-2">
              <div className="text-primary text-sm">
                {isRefreshing ? "Refreshing..." : pullDistance > 100 ? "Release to refresh" : "Pull to refresh"}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ScrollArea className="h-full">
          <div className="p-4">{children}</div>
        </ScrollArea>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sticky bottom-0 z-40 bg-black/90 backdrop-blur-md border-t border-primary/20">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                activeTab === item.id ? "text-primary" : "text-white/60 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 z-30"
        onClick={() => setShowQuickActions(!showQuickActions)}
      >
        <motion.div animate={{ rotate: showQuickActions ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <TrendingUp className="w-6 h-6 text-black" />
        </motion.div>
      </motion.button>

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-36 right-4 z-30"
          >
            <div className="flex flex-col gap-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-12 h-12 bg-gray-800 border border-primary/20 rounded-full flex items-center justify-center shadow-lg relative"
                >
                  <action.icon className="w-5 h-5 text-primary" />
                  {action.badge && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                      {action.badge}
                    </Badge>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-specific overlays */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black/20 z-20" onClick={() => setShowQuickActions(false)} />
      )}

      {/* Swipe indicators */}
      <div className="fixed bottom-1/2 left-2 transform -translate-y-1/2 z-10">
        <div className="w-1 h-12 bg-white/10 rounded-full overflow-hidden">
          <div className="w-full h-3 bg-primary rounded-full" />
        </div>
      </div>
      <div className="fixed bottom-1/2 right-2 transform -translate-y-1/2 z-10">
        <div className="w-1 h-12 bg-white/10 rounded-full overflow-hidden">
          <div className="w-full h-3 bg-primary rounded-full" />
        </div>
      </div>

      {/* Mobile-optimized cards and components */}
      <style jsx global>{`
        /* Mobile-specific styles */
        @media (max-width: 768px) {
          .mobile-card {
            @apply rounded-xl shadow-lg border border-primary/20 bg-white/5 backdrop-blur-sm;
          }
          
          .mobile-button {
            @apply min-h-[44px] px-4 rounded-lg font-medium transition-all active:scale-95;
          }
          
          .mobile-input {
            @apply min-h-[44px] px-4 rounded-lg bg-white/5 border border-primary/20 text-white placeholder:text-white/50;
          }
          
          .mobile-text {
            @apply text-base leading-relaxed;
          }
          
          .mobile-title {
            @apply text-xl font-bold mb-2;
          }
          
          .mobile-subtitle {
            @apply text-sm text-white/70 mb-4;
          }
          
          /* Touch-friendly spacing */
          .mobile-spacing {
            @apply space-y-4;
          }
          
          /* Improved readability */
          .mobile-content {
            @apply text-base leading-7;
          }
          
          /* Better contrast for mobile */
          .mobile-contrast {
            @apply bg-white/10 border border-white/20;
          }
        }
        
        /* Smooth scrolling for mobile */
        .mobile-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* Hide scrollbars on mobile */
        .mobile-scroll::-webkit-scrollbar {
          display: none;
        }
        
        /* Touch feedback */
        .mobile-touch:active {
          transform: scale(0.98);
          opacity: 0.8;
        }
        
        /* Prevent text selection on interactive elements */
        .mobile-no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  )
}
