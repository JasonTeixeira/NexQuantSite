"use client"

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Rocket,
  BarChart3,
  Settings,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Target,
  Zap,
  Brain,
  ChevronRight,
  Sparkles,
  Play,
  Users,
  Award
} from 'lucide-react'

interface WelcomeProps {
  onNavigate: (tab: string, subTab?: string) => void
  onStartTour: () => void
}

const NexusWelcomeAssistant: React.FC<WelcomeProps> = ({ onNavigate, onStartTour }) => {
  const [currentGreeting, setCurrentGreeting] = useState(0)
  const [showPersonalization, setShowPersonalization] = useState(false)

  const greetings = [
    "Hello! I'm Nexus, your AI Testing Assistant 🤖",
    "Ready to build world-class trading strategies? 🚀",
    "Let's turn your ideas into profitable algorithms! 💡"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const quickStartOptions = [
    {
      id: 'test-new',
      title: 'Test New Strategy',
      description: 'Build and backtest a completely new trading strategy',
      icon: Rocket,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      action: () => onNavigate('strategy-lab')
    },
    {
      id: 'analyze-existing',
      title: 'Analyze Existing Strategy',
      description: 'Import and analyze your current trading algorithms',
      icon: BarChart3,
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      action: () => onNavigate('intelligence-center')
    },
    {
      id: 'optimize-performance',
      title: 'Optimize Performance',
      description: 'Fine-tune parameters for maximum profitability',
      icon: Settings,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      action: () => onNavigate('strategy-lab')
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Analyze market conditions and find opportunities',
      icon: TrendingUp,
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      action: () => onNavigate('intelligence-center')
    }
  ]

  const learningPaths = [
    {
      title: 'Beginner: First Strategy',
      description: 'Learn to build your first profitable algorithm',
      duration: '15 min',
      difficulty: 'Easy',
      icon: Play
    },
    {
      title: 'Intermediate: Risk Management',
      description: 'Master position sizing and risk controls',
      duration: '25 min',
      difficulty: 'Medium',
      icon: Target
    },
    {
      title: 'Advanced: ML Integration',
      description: 'Incorporate machine learning into your strategies',
      duration: '45 min',
      difficulty: 'Hard',
      icon: Brain
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1320] to-[#1a1a25] p-6">
      {/* Animated Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="relative">
            <Bot className="w-12 h-12 text-[#00bbff] animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {greetings[currentGreeting]}
            </h1>
            <p className="text-lg text-[#a0a0b8] max-w-2xl">
              Welcome to the world's most advanced strategy testing engine. I'm here to guide you through 
              building, testing, and optimizing your trading strategies. What would you like to accomplish today?
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Actions */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#00bbff]" />
          <h2 className="text-2xl font-bold text-white">Quick Start</h2>
          <Badge className="bg-[#00bbff]/20 text-[#00bbff] border-[#00bbff]/30">
            Choose Your Path
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStartOptions.map((option) => (
            <Card 
              key={option.id}
              className="bg-[#1a1a25] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-all cursor-pointer group hover:scale-105"
              onClick={option.action}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <option.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-white text-lg">{option.title}</CardTitle>
                <CardDescription className="text-[#a0a0b8]">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-[#00bbff] text-sm group-hover:translate-x-1 transition-transform">
                  Get Started <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Learning Paths */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Learning Paths</h2>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Guided Tutorials
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {learningPaths.map((path, index) => (
            <Card key={index} className="bg-[#1a1a25] border-[#2a2a3e] hover:border-green-500/50 transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <path.icon className="w-8 h-8 text-green-400" />
                  <Badge className={`text-xs ${
                    path.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    path.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {path.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg">{path.title}</CardTitle>
                <CardDescription className="text-[#a0a0b8]">
                  {path.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#a0a0b8]">{path.duration}</span>
                  <Button size="sm" className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
                    Start Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Platform Tour & Help */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Tour */}
          <Card className="bg-gradient-to-r from-[#00bbff]/10 to-[#00bbff]/5 border-[#00bbff]/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-[#00bbff]" />
                <div>
                  <CardTitle className="text-white">Take a Platform Tour</CardTitle>
                  <CardDescription className="text-[#a0a0b8]">
                    Get a guided walkthrough of all features and capabilities
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onStartTour}
                className="w-full bg-[#00bbff] text-white hover:bg-[#0099cc]"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Interactive Tour
              </Button>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-purple-400" />
                <div>
                  <CardTitle className="text-white">AI Suggestions</CardTitle>
                  <CardDescription className="text-[#a0a0b8]">
                    Get personalized recommendations based on market conditions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                onClick={() => onNavigate('ai-command-center', 'strategy-analysis')}
              >
                <Brain className="w-4 h-4 mr-2" />
                Get AI Insights
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  )
}

export default NexusWelcomeAssistant
