"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Plus, MessageSquare, Heart, Share2, TrendingUp, TrendingDown,
  BarChart3, Target, Zap, Users, CheckCircle, Send, ImageIcon,
  Code, PlayCircle, Trophy, Medal, Crown, Star, Flame,
  Eye, Camera, Upload, LineChart, PieChart, Activity,
  MonitorSpeaker, Headphones, Mic, Video, ChartBar,
  FileCode, BookOpen, Lightbulb, Timer, Calendar, Globe
} from "lucide-react"
import { toast } from "sonner"

interface EnhancedCommunityHubProps {
  className?: string
}

export default function EnhancedCommunityHub({ className }: EnhancedCommunityHubProps) {
  const [activeTab, setActiveTab] = useState("feed")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false)
  const [codeEditorContent, setCodeEditorContent] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("pine")

  // Enhanced post creation state
  const [newPost, setNewPost] = useState({
    type: 'insight' as const,
    title: '',
    content: '',
    tags: '',
    hasChart: false,
    hasCode: false,
    hasVideo: false,
    isEducational: false,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    expectedDuration: '',
    tradingData: {
      symbol: '',
      action: 'buy' as const,
      entryPrice: '',
      targetPrice: '',
      stopLoss: '',
      timeframe: '',
      analysis: '',
      confidence: 70,
      riskReward: ''
    },
    media: {
      charts: [] as File[],
      videos: [] as File[],
      images: [] as File[]
    },
    code: {
      language: 'pine' as 'pine' | 'python' | 'javascript' | 'mql4' | 'mql5',
      content: '',
      description: ''
    }
  })

  // Chart upload handler
  const handleChartUpload = (files: FileList | null) => {
    if (files) {
      const chartFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/') && file.size < 10 * 1024 * 1024 // 10MB limit
      )
      setNewPost(prev => ({
        ...prev,
        hasChart: chartFiles.length > 0,
        media: {
          ...prev.media,
          charts: [...prev.media.charts, ...chartFiles]
        }
      }))
    }
  }

  // Code sharing component with syntax highlighting
  const CodeEditor = ({ value, onChange, language }: { 
    value: string, 
    onChange: (value: string) => void,
    language: string 
  }) => {
    return (
      <div className="border border-gray-600 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">
              {language === 'pine' ? 'Pine Script' : 
               language === 'python' ? 'Python' :
               language === 'javascript' ? 'JavaScript' :
               language === 'mql4' ? 'MQL4' :
               language === 'mql5' ? 'MQL5' : 'Code'}
            </span>
          </div>
          <Button size="sm" variant="ghost" className="text-xs">
            <PlayCircle className="w-3 h-3 mr-1" />
            Test Code
          </Button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-64 bg-gray-900 text-green-400 font-mono text-sm p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`// ${language === 'pine' ? 'Pine Script example' :
                              language === 'python' ? 'Python trading algorithm' :
                              'Your trading code here'}
${language === 'pine' ? 
`//@version=5
strategy("My Strategy", overlay=true)

// Strategy logic here
longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))
if longCondition
    strategy.entry("My Long Entry Id", strategy.long)` :
language === 'python' ?
`import pandas as pd
import numpy as np
from backtesting import Backtest, Strategy

class MyStrategy(Strategy):
    def init(self):
        pass
    
    def next(self):
        # Strategy logic here
        pass` : ''
}`}
          spellCheck={false}
        />
      </div>
    )
  }

  // Enhanced performance tracking widget
  const PerformanceTracker = ({ userId }: { userId: string }) => {
    const mockStats = {
      totalPredictions: 147,
      correctPredictions: 102,
      accuracy: 69.4,
      avgReturn: 12.8,
      followers: 1234,
      reputation: 2847
    }

    return (
      <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Trading Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{mockStats.accuracy}%</div>
              <div className="text-xs text-gray-400">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">+{mockStats.avgReturn}%</div>
              <div className="text-xs text-gray-400">Avg Return</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{mockStats.totalPredictions}</div>
              <div className="text-xs text-gray-400">Total Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{mockStats.followers}</div>
              <div className="text-xs text-gray-400">Followers</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Community Rank</span>
              <div className="flex items-center gap-2">
                <Medal className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 font-semibold">#23</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Live streaming widget
  const LiveStreamWidget = () => {
    return (
      <Card className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MonitorSpeaker className="w-5 h-5 text-red-500" />
            Live Trading Room
            <Badge variant="outline" className="ml-auto border-red-500 text-red-400">
              🔴 LIVE - 143 viewers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Live Stream Preview</p>
              <p className="text-xs text-gray-500">Pro trader analyzing SPY options</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
              <Headphones className="w-4 h-4 mr-2" />
              Join Stream
            </Button>
            <Button size="sm" variant="outline">
              <Mic className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Strategy contest widget
  const StrategyContest = () => {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-500" />
            Monthly Strategy Contest
            <Badge variant="outline" className="ml-auto border-purple-500 text-purple-400">
              12 days left
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Prize Pool</span>
              <span className="text-lg font-bold text-green-400">$5,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Participants</span>
              <span className="text-white">847 traders</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Your Rank</span>
              <div className="flex items-center gap-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500">#7</span>
              </div>
            </div>
          </div>
          
          <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
            <Target className="w-4 h-4 mr-2" />
            Submit Strategy
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${className}`}>
      {/* Enhanced Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Trading Community Hub
              </h1>
              <p className="text-gray-400">Share charts, code, strategies & compete with traders worldwide</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Share Content
              </Button>
              
              <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                <MonitorSpeaker className="w-4 h-4 mr-2" />
                Go Live
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Widgets */}
          <div className="lg:col-span-1 space-y-6">
            <PerformanceTracker userId="current-user" />
            <LiveStreamWidget />
            <StrategyContest />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-6">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="education">Learn</TabsTrigger>
                <TabsTrigger value="live">Live</TabsTrigger>
              </TabsList>

              <TabsContent value="feed">
                <div className="space-y-6">
                  {/* Enhanced Post Creation */}
                  <Card className="bg-gray-900/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Button
                            onClick={() => setShowCreateModal(true)}
                            variant="ghost"
                            className="w-full justify-start text-gray-400 bg-gray-800 hover:bg-gray-700"
                          >
                            What's your trading insight today?
                          </Button>
                          
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="ghost" className="text-blue-400">
                              <ImageIcon className="w-4 h-4 mr-1" />
                              Chart
                            </Button>
                            <Button size="sm" variant="ghost" className="text-green-400">
                              <Code className="w-4 h-4 mr-1" />
                              Code
                            </Button>
                            <Button size="sm" variant="ghost" className="text-purple-400">
                              <BookOpen className="w-4 h-4 mr-1" />
                              Tutorial
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400">
                              <Video className="w-4 h-4 mr-1" />
                              Live
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sample Enhanced Posts */}
                  <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 border-2 border-yellow-500">
                            <AvatarFallback className="bg-yellow-900 text-yellow-300">JT</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link href="#" className="font-semibold text-white hover:text-blue-400">
                                John Trader
                              </Link>
                              <CheckCircle className="w-4 h-4 text-blue-400" />
                              <Badge variant="secondary" className="bg-yellow-900 text-yellow-300">Pro</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span>@johntrader</span>
                              <span>•</span>
                              <span>2h ago</span>
                              <span>•</span>
                              <Badge variant="outline" className="border-green-500 text-green-400">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                Trade Alert
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        TSLA Breakout Setup - $280 Target 🚀
                      </h3>

                      <p className="text-gray-300 mb-4">
                        Clean breakout above resistance at $265. Volume confirms the move. 
                        Target $280 with stop at $260. Risk/Reward: 1:3
                      </p>

                      {/* Chart Image Placeholder */}
                      <div className="bg-gray-800 rounded-lg p-6 mb-4 aspect-[4/3] flex items-center justify-center border border-gray-700">
                        <div className="text-center">
                          <ChartBar className="w-16 h-16 text-blue-400 mx-auto mb-2" />
                          <p className="text-gray-400">TSLA 4H Chart Analysis</p>
                          <p className="text-sm text-gray-500">Click to view full chart</p>
                        </div>
                      </div>

                      {/* Trading Data */}
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-gray-400">Symbol</div>
                            <Badge variant="outline" className="border-blue-500 text-blue-400">TSLA</Badge>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Entry</div>
                            <div className="text-white font-semibold">$265.50</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Target</div>
                            <div className="text-green-400 font-semibold">$280.00</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Stop Loss</div>
                            <div className="text-red-400 font-semibold">$260.00</div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Tracking */}
                      <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 text-sm font-medium">
                            📈 This trader's last 10 calls: 8 winners (80% accuracy)
                          </span>
                          <Button size="sm" variant="outline" className="border-green-500 text-green-400">
                            <Eye className="w-3 h-3 mr-1" />
                            Track
                          </Button>
                        </div>
                      </div>

                      {/* Enhanced Engagement */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="hover:text-red-500">
                            <Heart className="w-4 h-4 mr-1" />
                            247
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:text-green-500">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            89 Bullish
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:text-orange-500">
                            <Flame className="w-4 h-4 mr-1" />
                            34
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            67 Comments
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="charts">
                <div className="text-center py-12">
                  <ChartBar className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">Chart Library</h3>
                  <p className="text-gray-400 mb-6">Browse and share trading charts from the community</p>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Chart
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="code">
                <div className="text-center py-12">
                  <Code className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">Code Repository</h3>
                  <p className="text-gray-400 mb-6">Share Pine Script, Python algorithms, and trading code</p>
                  <Button>
                    <FileCode className="w-4 h-4 mr-2" />
                    Share Code
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="education">
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">Educational Content</h3>
                  <p className="text-gray-400 mb-6">Tutorials, courses, and learning materials</p>
                  <Button>
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Create Tutorial
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="live">
                <div className="text-center py-12">
                  <MonitorSpeaker className="w-16 h-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">Live Trading Rooms</h3>
                  <p className="text-gray-400 mb-6">Join live streams and real-time discussions</p>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Video className="w-4 h-4 mr-2" />
                    Start Live Stream
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Community Features */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Performers */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Sarah Chen", accuracy: "94%", returns: "+342%" },
                  { name: "Mike Ross", accuracy: "89%", returns: "+187%" },
                  { name: "Alex Kim", accuracy: "86%", returns: "+156%" }
                ].map((trader, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{trader.name}</div>
                        <div className="text-xs text-gray-400">{trader.accuracy} accuracy</div>
                      </div>
                    </div>
                    <div className="text-green-400 text-sm font-semibold">
                      {trader.returns}
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Live Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">
                      <span className="text-white font-medium">TraderJoe</span> shared a chart
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">
                      <span className="text-white font-medium">CryptoQueen</span> posted code
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">
                      <span className="text-white font-medium">AlgoMaster</span> started live stream
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Tags */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['#TSLA', '#SPY', '#Options', '#PineScript', '#Crypto', '#Earnings', '#Technical', '#Breakout']
                    .map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Create Post Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Share with the Community</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share charts, code, strategies, or educational content with traders worldwide
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Content Type Selection */}
            <div>
              <Label className="text-lg font-semibold">What are you sharing?</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {[
                  { type: 'chart', icon: ChartBar, label: 'Chart Analysis', color: 'blue' },
                  { type: 'code', icon: Code, label: 'Trading Code', color: 'green' },
                  { type: 'education', icon: BookOpen, label: 'Tutorial/Guide', color: 'purple' },
                  { type: 'trade', icon: Target, label: 'Trade Idea', color: 'orange' }
                ].map(({ type, icon: Icon, label, color }) => (
                  <Button
                    key={type}
                    type="button"
                    variant={newPost.type === type ? "default" : "outline"}
                    onClick={() => setNewPost(prev => ({ ...prev, type: type as any }))}
                    className={`h-20 flex-col gap-2 ${
                      newPost.type === type 
                        ? `bg-${color}-600 border-${color}-500 hover:bg-${color}-700` 
                        : `border-${color}-500/50 hover:bg-${color}-500/10`
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Media Upload Section */}
            <div>
              <Label className="text-lg font-semibold">Add Media</Label>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400">Upload Charts</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  <input 
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleChartUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
                  <Video className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400">Upload Video</p>
                  <p className="text-xs text-gray-500">MP4 up to 100MB</p>
                </div>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <FileCode className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400">Share Code</p>
                  <p className="text-xs text-gray-500">Pine, Python, etc.</p>
                </div>
              </div>
            </div>

            {/* Code Editor (if code type selected) */}
            {(newPost.type === 'code' || newPost.hasCode) && (
              <div>
                <Label className="text-lg font-semibold">Code Editor</Label>
                <CodeEditor 
                  value={codeEditorContent}
                  onChange={setCodeEditorContent}
                  language={selectedLanguage}
                />
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Share with Community
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
