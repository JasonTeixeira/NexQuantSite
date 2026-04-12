"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Mail } from "lucide-react"

export default function AdminLoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState("admin@nexural.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.message || "Login failed")
        return
      }

      const token: string | undefined = data?.token || data?.accessToken || data?.tokens?.accessToken

      const user = data?.user || {
        name: "Admin User",
        email,
        role: "admin",
      }

      if (!token) {
        setError("Login failed: missing token in response")
        return
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("adminToken", token)
        localStorage.setItem("adminData", JSON.stringify(user))
      }

      router.replace("/admin/dashboard")
    } catch (err: any) {
      setError(err?.message || "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Marketing copy */}
        <div className="hidden md:block">
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500" />
              <span className="font-semibold text-gray-300">NEXURAL</span>
              <span className="text-gray-600">Admin Portal</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Welcome to the
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              Command Center
            </span>
          </h1>
          <p className="mt-4 text-gray-400 max-w-xl">
            Access powerful administrative tools to manage your trading platform, monitor performance, and control user
            experiences.
          </p>
          <ul className="mt-8 space-y-3 text-gray-300">
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Real-time Analytics</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span>Performance Monitoring</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>System Health</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Instant Controls</span>
            </li>
          </ul>
        </div>

        {/* Right: Login Card */}
        <Card className="bg-gray-900/70 border-gray-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-950 border-gray-800 text-white"
                    placeholder="admin@nexural.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-950 border-gray-800 text-white"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Access Admin Panel"}
              </Button>

              <div className="mt-4 rounded-md border border-gray-800 p-3 text-sm text-gray-400">
                <div className="font-medium text-gray-300 mb-1">Demo Credentials</div>
                <div className="flex items-center justify-between">
                  <span>Email: admin@nexural.com</span>
                  <span>Password: admin123</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>Alternative: demo@nexural.com</span>
                  <span>Password: demo123</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
