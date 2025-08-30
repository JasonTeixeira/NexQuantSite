"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, BarChart3, Bot, TrendingUp, BookOpen, Users, ShoppingCart, Trophy, Zap, FileText, Server, User, LogOut, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Bots", href: "/bots", icon: Bot },
  { name: "Indicators", href: "/indicators", icon: TrendingUp },
  { name: "Learning", href: "/learning", icon: BookOpen },
  { name: "Blog", href: "/blog", icon: FileText },
  { name: "Community", href: "/community", icon: Users },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Pricing", href: "/pricing", icon: Zap },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  
  useEffect(() => {
    // Prefer localStorage signal; cookies may be HttpOnly (not visible)
    const checkAuth = () => {
      try {
        const userInfo = localStorage.getItem('user')
        if (userInfo) {
          setIsLoggedIn(true)
          try {
            const user = JSON.parse(userInfo)
            setUserEmail(user.email || 'user@nexural.com')
          } catch {
            setUserEmail('user@nexural.com')
          }
          return
        }
      } catch {}
      setIsLoggedIn(false)
    }
    
    checkAuth()
  }, [pathname])
  
  const handleLogout = async () => {
    // Clear cookies
    document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    
    // Clear localStorage
    localStorage.removeItem('user')
    
    // Redirect to home
    router.push('/')
    router.refresh()
  }
  
  // Don't render navigation on admin routes
  if (pathname?.startsWith('/admin')) {
    return null
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/30 bg-black/98 backdrop-blur-xl supports-[backdrop-filter]:bg-black/95">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between gap-8">
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-green-500/20 to-green-600/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>

              {/* Main logo container */}
              <div className="relative h-10 w-10 bg-black rounded-xl flex items-center justify-center shadow-xl border border-green-400/30 group-hover:border-green-400/60 transition-all duration-300">
                {/* NEXURAL logo icon */}
                <svg className="w-8 h-8" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="glow" cx="50%" cy="50%">
                      <stop offset="0%" style={{ stopColor: "#00ff41", stopOpacity: 0.5 }} />
                      <stop offset="40%" style={{ stopColor: "#00ff41", stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: "#00ff41", stopOpacity: 0 }} />
                    </radialGradient>
                    <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <circle cx="150" cy="150" r="90" fill="url(#glow)" />
                  <circle cx="150" cy="150" r="85" stroke="#00ff41" strokeWidth="1" fill="none" opacity="0.5" />
                  <circle cx="150" cy="150" r="70" stroke="#00ff41" strokeWidth="0.5" fill="none" opacity="0.3" />
                  <circle cx="150" cy="150" r="55" stroke="#00ff41" strokeWidth="0.5" fill="none" opacity="0.2" />

                  <g filter="url(#glow-filter)">
                    <rect x="125" y="145" width="6" height="15" fill="#00ff41" />
                    <rect x="134" y="135" width="6" height="25" fill="#00ff41" />
                    <rect x="143" y="125" width="6" height="35" fill="#00ff41" />
                    <rect x="152" y="120" width="6" height="40" fill="#00ff41" />
                    <rect x="161" y="130" width="6" height="30" fill="#00ff41" />
                    <rect x="170" y="140" width="6" height="20" fill="#00ff41" />
                  </g>

                  <circle cx="100" cy="100" r="2" fill="#00ff41" opacity="0.6" />
                  <circle cx="200" cy="100" r="2" fill="#00ff41" opacity="0.6" />
                  <circle cx="200" cy="200" r="2" fill="#00ff41" opacity="0.6" />
                  <circle cx="100" cy="200" r="2" fill="#00ff41" opacity="0.6" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-xl text-white tracking-tight leading-none group-hover:text-green-400 transition-colors duration-300">
                Nexural
              </span>
              <span className="text-xs text-gray-400 font-medium tracking-wider uppercase leading-none">Trading</span>
            </div>
          </Link>

          {/* Desktop Navigation - Single professional row */}
          <div className="hidden lg:flex items-center space-x-2 ml-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="default"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 border
                      ${
                        item.name === "Dashboard"
                          ? isActive(item.href)
                            ? "bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white shadow-lg border-orange-400/60 shadow-orange-500/30"
                            : "text-orange-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 border-orange-400/30 hover:border-orange-400/60 shadow-sm hover:shadow-orange-500/20"
                          : isActive(item.href)
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg border-cyan-400/50 shadow-cyan-500/25"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50 border-transparent hover:border-gray-700/50"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Medium screens - Horizontal scroll */}
          <div className="hidden md:flex lg:hidden items-center space-x-2 overflow-x-auto max-w-md ml-6">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`
                      flex items-center space-x-1 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-300 border
                      ${
                        item.name === "Dashboard"
                          ? isActive(item.href)
                            ? "bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white border-orange-400/60"
                            : "text-orange-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 border-orange-400/30 hover:border-orange-400/60"
                          : isActive(item.href)
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400/50"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/50 border-transparent hover:border-gray-700/50"
                      }
                    `}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-700/50"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm">{userEmail.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-gray-800">
                  <DropdownMenuLabel className="text-gray-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer text-red-400 hover:text-red-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-gray-800/50 px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-700/50"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 border border-cyan-400/30 hover:border-cyan-400/50 shadow-cyan-500/25">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50 transition-all duration-300"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-black/98 border-gray-800/50 backdrop-blur-xl">
              <div className="flex flex-col space-y-2 mt-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className={`
                          w-full justify-start space-x-3 px-4 py-3 rounded-lg transition-all duration-300 border
                          ${
                            item.name === "Dashboard"
                              ? isActive(item.href)
                                ? "bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white border-orange-400/60"
                                : "text-orange-300 hover:text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 border-orange-400/30 hover:border-orange-400/60"
                              : isActive(item.href)
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400/50"
                              : "text-gray-300 hover:text-white hover:bg-gray-800/50 border-transparent hover:border-gray-700/50"
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.name}</span>
                      </Button>
                    </Link>
                  )
                })}
                <div className="pt-4 mt-4 border-t border-gray-800/50 space-y-2">
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-400">
                        Logged in as: <span className="text-white">{userEmail}</span>
                      </div>
                      <Link href="/settings" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50 transition-all duration-300"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-transparent hover:border-red-700/50 transition-all duration-300"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50 transition-all duration-300"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300">
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
