"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell,
  BellRing,
  Check,
  X,
  Filter,
  MoreHorizontal,
  ExternalLink,
  MessageSquare,
  Heart,
  Users,
  UserPlus,
  Star,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Eye,
  Bookmark,
  Gift,
  Calendar,
  Zap,
  CheckCircle,
  Loader2,
  RefreshCw,
  Settings,
  Archive
} from "lucide-react"
import { toast } from "sonner"
import Link from 'next/link'

// Import our notifications hook
import { useNotifications } from '@/lib/hooks/use-community'
import type { Notification } from '@/lib/api/community-client'

interface NotificationsCenterProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

export default function NotificationsCenter({ 
  className, 
  isOpen = true, 
  onClose 
}: NotificationsCenterProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  
  // API Hook
  const {
    data: notifications,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    markAllAsRead,
    unreadCount
  } = useNotifications({
    type: activeFilter !== 'all' ? activeFilter : undefined,
    priority: selectedPriority !== 'all' ? selectedPriority : undefined
  })

  // Get notification icon and colors
  const getNotificationStyle = (notification: Notification) => {
    switch (notification.type) {
      case 'mention':
        return {
          icon: MessageSquare,
          iconColor: 'text-blue-400',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-800'
        }
      case 'reaction':
        return {
          icon: Heart,
          iconColor: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-800'
        }
      case 'follow':
        return {
          icon: UserPlus,
          iconColor: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-800'
        }
      case 'comment':
        return {
          icon: MessageSquare,
          iconColor: 'text-purple-400',
          bgColor: 'bg-purple-900/20',
          borderColor: 'border-purple-800'
        }
      case 'achievement':
        return {
          icon: Trophy,
          iconColor: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-800'
        }
      case 'system':
        return {
          icon: Bell,
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-800'
        }
      case 'moderation':
        return {
          icon: AlertTriangle,
          iconColor: 'text-orange-400',
          bgColor: 'bg-orange-900/20',
          borderColor: 'border-orange-800'
        }
      case 'post_performance':
        return {
          icon: TrendingUp,
          iconColor: 'text-cyan-400',
          bgColor: 'bg-cyan-900/20',
          borderColor: 'border-cyan-800'
        }
      default:
        return {
          icon: Bell,
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-800'
        }
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>
      case 'medium':
        return <Badge variant="default" className="text-xs">Medium</Badge>
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low</Badge>
      default:
        return null
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return date.toLocaleDateString()
  }

  // Notification card component
  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const style = getNotificationStyle(notification)
    const Icon = style.icon
    const isUnread = !notification.isRead

    const handleNotificationClick = () => {
      if (notification.actionUrl) {
        // In a real app, this would mark the notification as read
        window.open(notification.actionUrl, '_blank')
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className={`relative ${isUnread ? 'bg-gray-800/50' : 'bg-gray-900/30'} border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer`}
        onClick={handleNotificationClick}
      >
        {/* Unread indicator */}
        {isUnread && (
          <div className="absolute top-4 left-2 w-2 h-2 bg-blue-500 rounded-full" />
        )}

        <div className="flex items-start gap-4 ml-3">
          {/* Icon */}
          <div className={`p-2 rounded-full ${style.bgColor} ${style.borderColor} border`}>
            <Icon className={`w-4 h-4 ${style.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${isUnread ? 'text-white' : 'text-gray-300'} mb-1`}>
                  {notification.title}
                </h4>
                <p className={`text-sm ${isUnread ? 'text-gray-300' : 'text-gray-400'} mb-2`}>
                  {notification.message}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatTimeAgo(notification.createdAt)}</span>
                  {getPriorityBadge(notification.priority)}
                  {notification.category && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {notification.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {notification.actionUrl && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Rich notification data */}
            {notification.data && renderNotificationData(notification)}
          </div>
        </div>
      </motion.div>
    )
  }

  // Render specific notification data based on type
  const renderNotificationData = (notification: Notification) => {
    const { data, type } = notification

    switch (type) {
      case 'follow':
        if (data.followerStats) {
          return (
            <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Followers: {data.followerStats.followers}</span>
                <span>Posts: {data.followerStats.posts}</span>
                <span>Reputation: {data.followerStats.reputation}</span>
              </div>
            </div>
          )
        }
        break

      case 'reaction':
        if (data.reactions) {
          return (
            <div className="mt-3 flex items-center gap-2">
              {data.reactions.map((reaction: any, index: number) => (
                <div key={index} className="flex items-center gap-1 text-xs bg-gray-800/50 px-2 py-1 rounded">
                  <span>{getReactionEmoji(reaction.type)}</span>
                  <span>{reaction.count}</span>
                </div>
              ))}
            </div>
          )
        }
        break

      case 'achievement':
        if (data.requirement) {
          return (
            <div className="mt-3 p-3 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg border border-yellow-800/50">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-2xl">{data.achievementIcon}</span>
                <div>
                  <p className="text-yellow-400 font-semibold">{data.achievementName}</p>
                  <p className="text-xs text-gray-400">{data.achievementDescription}</p>
                </div>
              </div>
            </div>
          )
        }
        break

      case 'post_performance':
        if (data.currentViews || data.currentReactions) {
          return (
            <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {data.currentViews} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {data.currentReactions} reactions
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {data.currentComments} comments
                </span>
              </div>
            </div>
          )
        }
        break
    }

    return null
  }

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case 'like': return '👍'
      case 'love': return '❤️'
      case 'genius': return '🧠'
      case 'fire': return '🔥'
      case 'bullish': return '🚀'
      case 'bearish': return '📉'
      default: return '👍'
    }
  }

  const content = (
    <div className={`bg-gray-950 text-white ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </div>
                )}
              </div>
              <h1 className="text-xl font-bold">Notifications</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark All Read
                </Button>
              )}

              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>

              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full lg:flex-1">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-gray-800">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="mention">Mentions</TabsTrigger>
                <TabsTrigger value="reaction">Reactions</TabsTrigger>
                <TabsTrigger value="follow">Follows</TabsTrigger>
                <TabsTrigger value="comment">Comments</TabsTrigger>
                <TabsTrigger value="achievement">Achievements</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full lg:w-32 bg-gray-800 border-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading State */}
        {loading && notifications.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading notifications...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-red-400 font-semibold mb-2">Error Loading Notifications</h3>
              <p className="text-red-300 mb-4">{error}</p>
              <Button onClick={() => refetch()} variant="outline" className="border-red-600">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </AnimatePresence>
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="text-center py-6">
            <Button 
              onClick={loadMore} 
              disabled={loading} 
              variant="outline"
              className="border-gray-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && !error && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
            <p className="text-gray-400 mb-6">
              {activeFilter !== 'all' 
                ? `No ${activeFilter} notifications found`
                : "You're all caught up! Notifications will appear here when you have new activity."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // Render as dialog or full page
  if (isOpen && onClose) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-4xl h-[80vh]">
          <div className="h-full overflow-hidden">
            <ScrollArea className="h-full">
              {content}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return content
}

// Export notification bell trigger component
export function NotificationsBell({ onClick }: { onClick?: () => void }) {
  const { unreadCount } = useNotifications()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative"
      onClick={onClick}
    >
      {unreadCount > 0 ? (
        <BellRing className="w-5 h-5 text-yellow-500" />
      ) : (
        <Bell className="w-5 h-5" />
      )}
      
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      )}
    </Button>
  )
}

