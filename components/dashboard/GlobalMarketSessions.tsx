"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Clock, TrendingUp } from 'lucide-react'

interface MarketSession {
  name: string
  timezone: string
  openTime: string
  closeTime: string
  status: 'open' | 'closed' | 'pre-market' | 'after-hours'
  nextChange: string
  volume: string
}

export default function GlobalMarketSessions() {
  const [sessions, setSessions] = useState<MarketSession[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const updateSessions = () => {
      const now = new Date()
      setCurrentTime(now)

      // Get current time in different timezones
      const nyTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}))
      const londonTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"})) 
      const tokyoTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}))
      const sydneyTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Sydney"}))

      const getMarketStatus = (openHour: number, closeHour: number, currentTime: Date) => {
        const hour = currentTime.getHours()
        const day = currentTime.getDay() // 0 = Sunday, 6 = Saturday
        
        // Weekend check
        if (day === 0 || day === 6) return 'closed'
        
        if (hour >= openHour && hour < closeHour) return 'open'
        if (hour >= (openHour - 2) && hour < openHour) return 'pre-market'
        if (hour >= closeHour && hour < (closeHour + 2)) return 'after-hours'
        return 'closed'
      }

      const getNextChange = (openHour: number, closeHour: number, currentTime: Date) => {
        const hour = currentTime.getHours()
        const day = currentTime.getDay()
        
        if (day === 0 || day === 6) return "Opens Monday 9:30 AM"
        
        if (hour < openHour) {
          const hoursUntil = openHour - hour
          return `Opens in ${hoursUntil}h ${60 - currentTime.getMinutes()}m`
        } else if (hour < closeHour) {
          const hoursUntil = closeHour - hour
          return `Closes in ${hoursUntil}h ${60 - currentTime.getMinutes()}m`
        } else {
          return "Opens tomorrow 9:30 AM"
        }
      }

      setSessions([
        {
          name: "NYSE",
          timezone: "EST",
          openTime: "9:30 AM",
          closeTime: "4:00 PM",
          status: getMarketStatus(9, 16, nyTime),
          nextChange: getNextChange(9, 16, nyTime),
          volume: "$418.2B"
        },
        {
          name: "LSE",
          timezone: "GMT",
          openTime: "8:00 AM", 
          closeTime: "4:30 PM",
          status: getMarketStatus(8, 16, londonTime),
          nextChange: getNextChange(8, 16, londonTime),
          volume: "£67.8B"
        },
        {
          name: "TSE",
          timezone: "JST",
          openTime: "9:00 AM",
          closeTime: "3:00 PM", 
          status: getMarketStatus(9, 15, tokyoTime),
          nextChange: getNextChange(9, 15, tokyoTime),
          volume: "¥2.1T"
        },
        {
          name: "ASX",
          timezone: "AEDT",
          openTime: "10:00 AM",
          closeTime: "4:00 PM",
          status: getMarketStatus(10, 16, sydneyTime),
          nextChange: getNextChange(10, 16, sydneyTime),
          volume: "A$4.8B"
        }
      ])
    }

    updateSessions()
    const interval = setInterval(updateSessions, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400 border-green-400/30'
      case 'pre-market': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
      case 'after-hours': return 'bg-blue-500/20 text-blue-400 border-blue-400/30'
      case 'closed': return 'bg-red-500/20 text-red-400 border-red-400/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return '🟢'
      case 'pre-market': return '🟡'
      case 'after-hours': return '🔵'
      case 'closed': return '🔴'
      default: return '⚫'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-black/40 backdrop-blur-sm border border-primary/20 shadow-2xl hover:shadow-primary/10 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Global Markets
            <Badge className="ml-auto bg-primary/20 text-primary text-xs animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.name}
                className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(session.status)}</span>
                    <h3 className="font-semibold text-white">{session.name}</h3>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                    {session.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Hours:</span>
                    <span className="text-gray-300">{session.openTime} - {session.closeTime} {session.timezone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span className="text-primary font-medium">{session.volume}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700/50">
                    <p className="text-xs text-cyan-400 font-medium">{session.nextChange}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Forex Notice */}
          <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">💱</span>
              <span className="text-white font-medium">FOREX:</span>
              <span className="text-green-400">24/7 Trading Active</span>
              <div className="ml-auto text-xs text-gray-400">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
