"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"
import { User, Shield, LogOut, Clock } from "lucide-react"
import { useState } from "react"

export const AuthStatus: React.FC = () => {
  const { user, isAuthenticated, logout, hasPermission } = useAuth()
  const [sessionTimeLeft, setSessionTimeLeft] = useState(3600) // 1 hour in seconds
  const [securityEvents] = useState([
    { time: "14:32", event: "Login successful", ip: "192.168.1.100" },
    { time: "14:15", event: "Password changed", ip: "192.168.1.100" },
    { time: "13:45", event: "2FA enabled", ip: "192.168.1.100" },
  ])
  const [twoFactorEnabled] = useState(true)

  if (!isAuthenticated || !user) {
    return null
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "trader":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "analyst":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#00bbff] flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#00bbff]/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-[#00bbff]" />
              </div>
              <div>
                <div className="text-white font-medium">{user.name}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
              </div>
            </div>
            <Badge className={getRoleBadgeColor(user.role)}>{user.role.toUpperCase()}</Badge>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-400">Permissions:</div>
            <div className="flex flex-wrap gap-2">
              {user.permissions.includes("all") ? (
                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                  ALL PERMISSIONS
                </Badge>
              ) : (
                user.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs border-[#00bbff]/30 text-[#00bbff]">
                    {permission.replace("_", " ").toUpperCase()}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2a2a3a]">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              Session Active
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#00bbff] flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Two-Factor Authentication</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${twoFactorEnabled ? "bg-green-400" : "bg-red-400"}`} />
                <span className={`text-sm ${twoFactorEnabled ? "text-green-400" : "text-red-400"}`}>
                  {twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Session Timeout</div>
              <div className="text-sm text-white font-mono">
                {Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-400">Security Level</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#2a2a3a] rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: "85%" }} />
              </div>
              <span className="text-sm text-green-400">High (85%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#00bbff]">Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {securityEvents.map((event, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#2a2a3a] last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 font-mono">{event.time}</div>
                  <div className="text-sm text-white">{event.event}</div>
                </div>
                <div className="text-xs text-gray-400 font-mono">{event.ip}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#15151f] border-[#2a2a3a]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#00bbff]">Advanced Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { module: "Trading", level: "Full Access", color: "text-green-400" },
              { module: "Risk Management", level: "Read/Write", color: "text-green-400" },
              { module: "Compliance", level: "Read Only", color: "text-yellow-400" },
              { module: "User Management", level: "No Access", color: "text-red-400" },
              { module: "System Config", level: "No Access", color: "text-red-400" },
              { module: "Audit Logs", level: "Read Only", color: "text-yellow-400" },
            ].map((perm, i) => (
              <div key={i} className="space-y-1">
                <div className="text-xs text-gray-400">{perm.module}</div>
                <div className={`text-sm ${perm.color}`}>{perm.level}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
