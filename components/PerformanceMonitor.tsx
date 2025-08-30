"use client"

import { useEffect, useState } from "react"
import { usePerformanceAnalytics } from "@/lib/performance-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function PerformanceMonitor() {
  const { getReport } = usePerformanceAnalytics()
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    const updateReport = () => {
      setReport(getReport())
    }

    updateReport()
    const interval = setInterval(updateReport, 5000)
    return () => clearInterval(interval)
  }, [getReport])

  if (!report || process.env.NODE_ENV !== "development") {
    return null
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "bg-green-500"
      case "needs-improvement":
        return "bg-yellow-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-black/90 backdrop-blur border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-white">Performance Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Overall Score</span>
          <div className="flex items-center gap-2">
            <Progress value={report.score} className="w-16 h-2" />
            <span className="text-xs text-white">{report.score}</span>
          </div>
        </div>

        {Object.entries(report.webVitals).map(([metric, value]: [string, any]) => (
          <div key={metric} className="flex items-center justify-between">
            <span className="text-xs text-gray-300">{metric}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white">{Math.round(value)}ms</span>
              <Badge className={`h-4 w-4 p-0 ${getRatingColor("good")}`} />
            </div>
          </div>
        ))}

        {report.recommendations.length > 0 && (
          <div className="pt-2 border-t border-gray-700">
            <span className="text-xs text-gray-300">Recommendations:</span>
            <ul className="text-xs text-gray-400 mt-1 space-y-1">
              {report.recommendations.slice(0, 2).map((rec: string, i: number) => (
                <li key={i}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
