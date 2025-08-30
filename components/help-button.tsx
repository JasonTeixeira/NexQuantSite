"use client"

import { useState } from "react"
import { HelpCircle, X, BookOpen, Video, MessageCircle, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import HelpSystem from "./help-system"

interface HelpButtonProps {
  className?: string
  variant?: 'floating' | 'inline'
  context?: string
}

const contextualHelp = {
  'strategy-lab': {
    title: 'Strategy Lab Help',
    items: [
      { title: 'Getting Started with Strategy Lab', type: 'guide', duration: '5 min' },
      { title: 'Building Your First Strategy', type: 'video', duration: '15 min' },
      { title: 'Understanding Ingredients', type: 'article', duration: '8 min' }
    ]
  },
  'dashboard': {
    title: 'Dashboard Help',
    items: [
      { title: 'Reading Your Dashboard', type: 'guide', duration: '3 min' },
      { title: 'Performance Metrics Explained', type: 'article', duration: '10 min' },
      { title: 'Setting Up Alerts', type: 'tutorial', duration: '7 min' }
    ]
  },
  'trading': {
    title: 'Trading Help',
    items: [
      { title: 'Placing Your First Trade', type: 'guide', duration: '5 min' },
      { title: 'Risk Management Basics', type: 'video', duration: '20 min' },
      { title: 'Order Types Explained', type: 'article', duration: '12 min' }
    ]
  }
}

export default function HelpButton({ className = "", variant = 'floating', context }: HelpButtonProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [showQuickHelp, setShowQuickHelp] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video
      case 'guide': return BookOpen
      case 'article': return BookOpen
      case 'tutorial': return Video
      default: return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'guide': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      case 'article': return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'tutorial': return 'text-purple-400 bg-purple-400/10 border-purple-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const contextHelp = context ? contextualHelp[context as keyof typeof contextualHelp] : null

  if (variant === 'floating') {
    return (
      <>
        {/* Floating Help Button */}
        <div className={`fixed bottom-6 left-6 z-40 ${className}`}>
          <div className="relative">
            {/* Quick Help Popup */}
            <AnimatePresence>
              {showQuickHelp && contextHelp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-16 left-0 w-80 z-50"
                >
                  <Card className="bg-gray-900 border-primary/30 shadow-2xl shadow-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-primary" />
                          {contextHelp.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQuickHelp(false)}
                          className="text-white/60 hover:text-white h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        {contextHelp.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="w-8 h-8 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              {(() => {
                                const IconComponent = getTypeIcon(item.type)
                                return <IconComponent className="w-4 h-4 text-primary" />
                              })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                                  {item.type}
                                </Badge>
                                <span className="text-xs text-white/50">{item.duration}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => {
                          setShowQuickHelp(false)
                          setIsHelpOpen(true)
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-black font-medium text-sm"
                      >
                        View All Help Topics
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Help Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => {
                  if (contextHelp) {
                    setShowQuickHelp(!showQuickHelp)
                  } else {
                    setIsHelpOpen(true)
                  }
                }}
                className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/30 p-0"
              >
                <HelpCircle className="w-6 h-6" />
              </Button>
            </motion.div>

            {/* Pulse animation for attention */}
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 pointer-events-none" />
          </div>
        </div>

        {/* Help System Modal */}
        <HelpSystem isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

        {/* Overlay for quick help */}
        {showQuickHelp && (
          <div 
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setShowQuickHelp(false)}
          />
        )}
      </>
    )
  }

  // Inline variant
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsHelpOpen(true)}
        className={`border-primary/30 text-primary hover:bg-primary/10 ${className}`}
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Help
      </Button>

      <HelpSystem isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  )
}
