"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const WorldClassAIInsights = () => {
  return (
    <Card className="bg-[#1a1a2e] border-cyan-700/30">
      <CardHeader>
        <CardTitle className="text-cyan-400">AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300">AI insights loading...</p>
      </CardContent>
    </Card>
  )
}

export default WorldClassAIInsights
