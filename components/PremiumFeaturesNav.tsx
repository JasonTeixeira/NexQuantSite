"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, TestTube, Lock, Crown, Zap, ChevronDown, Rocket, BookOpen, History, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  getUserSubscription, 
  hasAutomationAccess, 
  hasTestingEngineAccess,
  getTestingCredits,
  type UserSubscription 
} from "@/lib/subscription-utils"
import { getUserTestingData, launchTestingEngine, type UserTestingData } from "@/lib/testing-engine-config"

export default function PremiumFeaturesNav() {
  const pathname = usePathname()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [testingData, setTestingData] = useState<UserTestingData | null>(null)
  
  // Load user subscription and testing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userSub, testData] = await Promise.all([
          getUserSubscription(),
          getUserTestingData()
        ])
        setSubscription(userSub)
        setTestingData(testData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Don't render on admin routes or auth pages
  if (pathname?.startsWith('/admin') || 
      pathname?.includes('/login') || 
      pathname?.includes('/signup') ||
      pathname?.includes('/register')) {
    return null
  }

  // Show loading state instead of null
  if (loading) {
    return (
      <div className="sticky top-16 z-40 border-b border-gray-800/40 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center space-x-4 animate-pulse">
              <div className="h-8 w-32 bg-gray-700 rounded"></div>
              <div className="h-6 w-px bg-gray-600/50"></div>
              <div className="h-8 w-36 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isActive = (href: string) => pathname === href
  const hasAutomation = hasAutomationAccess(subscription)
  const hasTestingAccess = hasTestingEngineAccess(subscription)
  const testingCredits = getTestingCredits(subscription)

  const handleOptionsFlowClick = (e: React.MouseEvent) => {
    if (!hasAutomation) {
      e.preventDefault()
      setShowUpgradeModal(true)
    }
  }

  const handleTestingEngineClick = (e: React.MouseEvent) => {
    if (!hasTestingAccess) {
      e.preventDefault()
      setShowUpgradeModal(true)
    }
  }

  return (
    <>
      {/* Premium Features Navigation - Sticky Row 2 */}
      <motion.div 
        className="sticky top-16 z-40 border-b border-gray-800/40 bg-gradient-to-r from-gray-900/80 via-black/90 to-gray-900/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-3 space-x-4">
            
            {/* Options Flow Button */}
            <div className="relative">
              <Link 
                href="/options-flow" 
                onClick={handleOptionsFlowClick}
                className={hasAutomation ? "" : "cursor-pointer"}
              >
                <Button
                  variant="ghost"
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 border
                    ${
                      isActive("/options-flow")
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border-purple-400/60 shadow-purple-500/30"
                        : hasAutomation
                        ? "text-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 border-purple-400/30 hover:border-purple-400/60"
                        : "text-gray-500 hover:text-gray-400 border-gray-600/30 cursor-not-allowed"
                    }
                  `}
                  disabled={!hasAutomation}
                >
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Options Flow</span>
                  {!hasAutomation && (
                    <Lock className="h-3 w-3 text-yellow-500" />
                  )}
                </Button>
              </Link>
              
              {/* Subscription Badge */}
              {!hasAutomation && (
                <Badge 
                  variant="outline" 
                  className="absolute -top-1 -right-1 text-xs bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 text-black font-bold"
                >
                  <Crown className="h-2 w-2 mr-1" />
                  PRO
                </Badge>
              )}
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-600/50"></div>

            {/* Testing Engine Smart Dropdown */}
            <div className="relative">
              {testingData && testingData.isReturningUser && hasTestingAccess ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 border
                        ${
                          isActive("/backtesting")
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg border-emerald-400/60 shadow-emerald-500/30"
                            : "text-emerald-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-teal-600/20 border-emerald-400/30 hover:border-emerald-400/60"
                        }
                      `}
                    >
                      <TestTube className="h-4 w-4" />
                      <span className="text-sm font-medium">Testing Engine</span>
                      {testingCredits > 0 && (
                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
                          {testingCredits}
                        </Badge>
                      )}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
                    <DropdownMenuItem asChild>
                      <Link href="/testing-engine" className="cursor-pointer hover:bg-gray-800">
                        <Rocket className="mr-2 h-4 w-4 text-emerald-400" />
                        <span>Launch Engine</span>
                        <span className="ml-auto text-xs text-gray-500">⌘T</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard#testing" className="cursor-pointer hover:bg-gray-800">
                        <History className="mr-2 h-4 w-4 text-blue-400" />
                        <span>Test History</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/backtesting/learn" className="cursor-pointer hover:bg-gray-800">
                        <BookOpen className="mr-2 h-4 w-4 text-purple-400" />
                        <span>Learn Strategies</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem asChild>
                      <Link href="/backtesting#pricing" className="cursor-pointer hover:bg-gray-800">
                        <Plus className="mr-2 h-4 w-4 text-yellow-400" />
                        <span>Get More Credits</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {testingCredits} left
                        </Badge>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link 
                  href="/backtesting" 
                  onClick={handleTestingEngineClick}
                  className={hasTestingAccess ? "" : "cursor-pointer"}
                >
                  <Button
                    variant="ghost"
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 border
                      ${
                        isActive("/backtesting")
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg border-emerald-400/60 shadow-emerald-500/30"
                          : hasTestingAccess
                          ? "text-emerald-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-teal-600/20 border-emerald-400/30 hover:border-emerald-400/60"
                          : "text-gray-500 hover:text-gray-400 border-gray-600/30"
                      }
                    `}
                  >
                    <TestTube className="h-4 w-4" />
                    <span className="text-sm font-medium">Testing Engine</span>
                    {testingCredits > 0 && (
                      <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
                        {testingCredits} Credits
                      </Badge>
                    )}
                    {!hasTestingAccess && (
                      <Zap className="h-3 w-3 text-blue-400" />
                    )}
                  </Button>
                </Link>
              )}
            </div>

            {/* Feature Descriptions - Only show on larger screens */}
            <div className="hidden lg:flex items-center space-x-6 text-xs text-gray-400 ml-8">
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3 text-purple-400" />
                <span>Live options flow & scanner</span>
                <Badge variant="outline" className="text-xs border-purple-400/30 text-purple-300">
                  Subscription
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <TestTube className="h-3 w-3 text-emerald-400" />
                <span>Professional strategy testing</span>
                <Badge variant="outline" className="text-xs border-emerald-400/30 text-emerald-300">
                  Pay-per-use
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upgrade Modal - Simple implementation */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div 
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center space-y-4">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto" />
              <h3 className="text-xl font-bold text-white">Premium Feature</h3>
              <p className="text-gray-300">
                {hasAutomation 
                  ? "You need testing credits to use the Testing Engine"
                  : "Options Flow requires an Automation subscription"
                }
              </p>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowUpgradeModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setShowUpgradeModal(false)
                    // Redirect to pricing or credits purchase
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600"
                >
                  {hasAutomation ? "Buy Credits" : "Upgrade"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
