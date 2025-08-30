"use client"

import { useEffect, useState } from "react"
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useSecurity } from "./security-provider"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"

export function SecurityMonitor() {
  const { securityScore, threatLevel, isSecureConnection, enabledFeatures } = useSecurity()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show security monitor for admins or when threats detected
    const shouldShow = threatLevel !== "low" || window.location.pathname.includes("/admin")
    setIsVisible(shouldShow)
  }, [threatLevel])

  if (!isVisible) return null

  const getThreatColor = (level: string) => {
    switch (level) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "default"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 border-2 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Security Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Security Score</span>
          <span className={`font-bold ${getScoreColor(securityScore)}`}>{securityScore}/100</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Threat Level</span>
          <Badge variant={getThreatColor(threatLevel) as any}>{threatLevel.toUpperCase()}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Secure Connection</span>
          {isSecureConnection ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium">Active Protections</span>
          <div className="flex flex-wrap gap-1">
            {enabledFeatures.map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {threatLevel !== "low" && (
          <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-800">
              Enhanced security monitoring active due to elevated threat level.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
