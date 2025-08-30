"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp, Activity } from 'lucide-react'

const sessionData = [
  {
    id: 1,
    timestamp: "2024-08-24 15:30:00",
    action: "Portfolio Analysis",
    result: "+2.3% return analyzed",
    type: "analysis"
  },
  {
    id: 2,
    timestamp: "2024-08-24 14:45:00", 
    action: "Strategy Backtest",
    result: "Mean reversion strategy tested",
    type: "backtest"
  },
  {
    id: 3,
    timestamp: "2024-08-24 13:20:00",
    action: "Risk Assessment",
    result: "VaR calculation completed",
    type: "risk"
  }
]

export default function SessionHistory() {
  return (
    <div className="p-6 space-y-4">
      <Card className="bg-[#0f1320] border-[#2a2a3e]">
        <CardHeader>
          <CardTitle className="text-[#00bbff] flex items-center gap-2">
            <Clock className="w-5 h-5" />
            📚 Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessionData.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-[#1a1a25] rounded-lg border border-[#2a2a3e]">
                <div className="flex items-center gap-3">
                  {session.type === 'analysis' && <TrendingUp className="w-4 h-4 text-blue-400" />}
                  {session.type === 'backtest' && <Activity className="w-4 h-4 text-green-400" />}
                  {session.type === 'risk' && <Activity className="w-4 h-4 text-red-400" />}
                  <div>
                    <div className="text-white font-medium">{session.action}</div>
                    <div className="text-[#a0a0b8] text-sm">{session.result}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#a0a0b8] text-sm">{session.timestamp}</div>
                  <Badge variant="outline" className="mt-1">
                    {session.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}