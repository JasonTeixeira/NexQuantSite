"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  TestTube, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  BarChart3, 
  Zap,
  BookOpen,
  History,
  Plus
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  getUserTestingData,
  formatROI,
  getROIBadgeVariant,
  type UserTestingData
} from "@/lib/testing-engine-config"

export default function TestingEngineWidget() {
  const [testingData, setTestingData] = useState<UserTestingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLaunching, setIsLaunching] = useState(false)

  useEffect(() => {
    loadTestingData()
  }, [])

  const loadTestingData = async () => {
    try {
      const data = await getUserTestingData()
      setTestingData(data)
    } catch (error) {
      console.error('Failed to load testing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLaunchEngine = () => {
    setIsLaunching(true)
    // Redirect to integrated strategy testing engine
    window.location.href = '/testing-engine'
    setTimeout(() => setIsLaunching(false), 500)
  }

  if (loading) {
    return (
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!testingData) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent hover:border-emerald-500/40 transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-semibold">Testing Engine</h3>
              {testingData.isReturningUser && (
                <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-300">
                  PRO
                </Badge>
              )}
            </div>
            <Badge 
              variant={testingData.credits > 0 ? "default" : "secondary"} 
              className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            >
              {testingData.credits} Credits
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div 
              className="text-center p-3 bg-gray-800/50 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-emerald-400">
                {testingData.testsRun}
              </div>
              <div className="text-xs text-gray-500">Tests Run</div>
            </motion.div>
            <motion.div 
              className="text-center p-3 bg-gray-800/50 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-green-400">
                {testingData.winRate}%
              </div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </motion.div>
            <motion.div 
              className="text-center p-3 bg-gray-800/50 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className={`text-2xl font-bold ${testingData.avgRoi >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatROI(testingData.avgRoi)}
              </div>
              <div className="text-xs text-gray-500">Avg ROI</div>
            </motion.div>
          </div>

          {/* Last Test Info */}
          {testingData.lastTest && (
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Test
                </span>
                <span className="text-xs text-gray-500">{testingData.lastTest.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {testingData.lastTest.name}
                </span>
                <Badge variant={getROIBadgeVariant(testingData.lastTest.roi)}>
                  {formatROI(testingData.lastTest.roi)}
                </Badge>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              onClick={handleLaunchEngine}
              disabled={isLaunching || testingData.credits === 0}
            >
              {isLaunching ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-pulse" />
                  Launching...
                </>
              ) : testingData.credits === 0 ? (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Get Credits
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Launch Engine
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="border-gray-700 hover:bg-gray-800"
              onClick={() => window.open('/backtesting#tutorial', '_blank')}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>

          {/* Recent Tests */}
          {testingData.recentTests.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Recent Tests</span>
                <Link href="/dashboard/testing-history">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All
                    <History className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-1">
                {testingData.recentTests.slice(0, 3).map((test) => (
                  <motion.div 
                    key={test.id}
                    className="flex justify-between items-center p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                    whileHover={{ x: 4 }}
                    onClick={() => window.location.href = '/testing-engine?strategy=' + encodeURIComponent(test.strategy)}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-3 w-3 text-gray-500" />
                      <span className="text-sm text-gray-300">{test.strategy}</span>
                      <span className="text-xs text-gray-500">{test.symbol}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getROIBadgeVariant(test.roi)}
                        className="text-xs"
                      >
                        {test.roi >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {formatROI(test.roi)}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Get More Credits CTA */}
          {testingData.credits <= 2 && (
            <div className="p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-400 font-medium">
                    Running low on credits!
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Get more to continue testing
                  </p>
                </div>
                <Link href="/backtesting#pricing">
                  <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                    Buy Credits
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
