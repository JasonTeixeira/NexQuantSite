"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Save,
  Globe,
  Mail,
  Shield,
  DollarSign,
  Bell,
  Zap,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  Code,
} from "lucide-react"
import { toast } from "sonner"

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  settings: Setting[]
}

interface Setting {
  key: string
  label: string
  description?: string
  type: "text" | "textarea" | "number" | "boolean" | "select" | "password" | "email" | "url"
  value: any
  options?: { label: string; value: string }[]
  required?: boolean
  validation?: (value: any) => string | null
}

export default function AdminSettingsClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [originalSettings, setOriginalSettings] = useState<Record<string, any>>({})
  const router = useRouter()

  const settingsSections: SettingsSection[] = [
    {
      id: "general",
      title: "General Settings",
      description: "Basic platform configuration",
      icon: <Globe className="w-5 h-5" />,
      settings: [
        {
          key: "siteName",
          label: "Site Name",
          description: "The name of your trading platform",
          type: "text",
          value: settings.siteName || "Nexural Trading Platform",
          required: true,
        },
        {
          key: "siteDescription",
          label: "Site Description",
          description: "Brief description for SEO and social media",
          type: "textarea",
          value: settings.siteDescription || "Advanced AI-powered trading platform with automated signals and bots",
        },
        {
          key: "siteUrl",
          label: "Site URL",
          description: "Your platform's primary URL",
          type: "url",
          value: settings.siteUrl || "https://nexuraltrading.com",
          required: true,
        },
        {
          key: "adminEmail",
          label: "Admin Email",
          description: "Primary contact email for administrative purposes",
          type: "email",
          value: settings.adminEmail || "admin@nexuraltrading.com",
          required: true,
        },
        {
          key: "timezone",
          label: "Default Timezone",
          type: "select",
          value: settings.timezone || "UTC",
          options: [
            { label: "UTC", value: "UTC" },
            { label: "EST (Eastern)", value: "America/New_York" },
            { label: "PST (Pacific)", value: "America/Los_Angeles" },
            { label: "GMT (London)", value: "Europe/London" },
            { label: "CET (Central Europe)", value: "Europe/Paris" },
            { label: "JST (Tokyo)", value: "Asia/Tokyo" },
          ],
        },
        {
          key: "maintenanceMode",
          label: "Maintenance Mode",
          description: "Enable to put the site in maintenance mode",
          type: "boolean",
          value: settings.maintenanceMode || false,
        },
        {
          key: "registrationEnabled",
          label: "User Registration",
          description: "Allow new users to register",
          type: "boolean",
          value: settings.registrationEnabled !== false,
        },
      ],
    },
    {
      id: "email",
      title: "Email Configuration",
      description: "SMTP and email settings",
      icon: <Mail className="w-5 h-5" />,
      settings: [
        {
          key: "smtpHost",
          label: "SMTP Host",
          type: "text",
          value: settings.smtpHost || "smtp.gmail.com",
          required: true,
        },
        {
          key: "smtpPort",
          label: "SMTP Port",
          type: "number",
          value: settings.smtpPort || 587,
          required: true,
        },
        {
          key: "smtpUser",
          label: "SMTP Username",
          type: "email",
          value: settings.smtpUser || "",
          required: true,
        },
        {
          key: "smtpPassword",
          label: "SMTP Password",
          type: "password",
          value: settings.smtpPassword || "",
          required: true,
        },
        {
          key: "fromEmail",
          label: "From Email",
          description: "Email address used as sender",
          type: "email",
          value: settings.fromEmail || "noreply@nexuraltrading.com",
          required: true,
        },
        {
          key: "fromName",
          label: "From Name",
          description: "Name displayed as sender",
          type: "text",
          value: settings.fromName || "Nexural Trading Platform",
          required: true,
        },
        {
          key: "emailVerificationRequired",
          label: "Email Verification Required",
          description: "Require email verification for new accounts",
          type: "boolean",
          value: settings.emailVerificationRequired !== false,
        },
      ],
    },
    {
      id: "payments",
      title: "Payment Settings",
      description: "Payment gateway configuration",
      icon: <DollarSign className="w-5 h-5" />,
      settings: [
        {
          key: "currency",
          label: "Default Currency",
          type: "select",
          value: settings.currency || "USD",
          options: [
            { label: "USD - US Dollar", value: "USD" },
            { label: "EUR - Euro", value: "EUR" },
            { label: "GBP - British Pound", value: "GBP" },
            { label: "JPY - Japanese Yen", value: "JPY" },
            { label: "CAD - Canadian Dollar", value: "CAD" },
            { label: "AUD - Australian Dollar", value: "AUD" },
          ],
        },
        {
          key: "stripeEnabled",
          label: "Enable Stripe",
          description: "Accept payments via Stripe",
          type: "boolean",
          value: settings.stripeEnabled !== false,
        },
        {
          key: "stripePublishableKey",
          label: "Stripe Publishable Key",
          type: "text",
          value: settings.stripePublishableKey || "",
        },
        {
          key: "stripeSecretKey",
          label: "Stripe Secret Key",
          type: "password",
          value: settings.stripeSecretKey || "",
        },
        {
          key: "paypalEnabled",
          label: "Enable PayPal",
          description: "Accept payments via PayPal",
          type: "boolean",
          value: settings.paypalEnabled || false,
        },
        {
          key: "paypalClientId",
          label: "PayPal Client ID",
          type: "text",
          value: settings.paypalClientId || "",
        },
        {
          key: "paypalClientSecret",
          label: "PayPal Client Secret",
          type: "password",
          value: settings.paypalClientSecret || "",
        },
        {
          key: "taxRate",
          label: "Tax Rate (%)",
          description: "Default tax rate for transactions",
          type: "number",
          value: settings.taxRate || 0,
        },
      ],
    },
    {
      id: "trading",
      title: "Trading Configuration",
      description: "Trading platform settings",
      icon: <BarChart3 className="w-5 h-5" />,
      settings: [
        {
          key: "tradingEnabled",
          label: "Trading Enabled",
          description: "Enable trading functionality",
          type: "boolean",
          value: settings.tradingEnabled !== false,
        },
        {
          key: "maxPositions",
          label: "Max Positions per User",
          description: "Maximum number of open positions per user",
          type: "number",
          value: settings.maxPositions || 10,
        },
        {
          key: "minTradeAmount",
          label: "Minimum Trade Amount",
          description: "Minimum amount for a single trade",
          type: "number",
          value: settings.minTradeAmount || 10,
        },
        {
          key: "maxTradeAmount",
          label: "Maximum Trade Amount",
          description: "Maximum amount for a single trade",
          type: "number",
          value: settings.maxTradeAmount || 10000,
        },
        {
          key: "leverageEnabled",
          label: "Leverage Trading",
          description: "Allow leverage trading",
          type: "boolean",
          value: settings.leverageEnabled || false,
        },
        {
          key: "maxLeverage",
          label: "Maximum Leverage",
          description: "Maximum leverage ratio (e.g., 100 for 100:1)",
          type: "number",
          value: settings.maxLeverage || 50,
        },
        {
          key: "autoTradingEnabled",
          label: "Auto Trading",
          description: "Enable automated trading bots",
          type: "boolean",
          value: settings.autoTradingEnabled !== false,
        },
        {
          key: "signalSubscriptionRequired",
          label: "Signal Subscription Required",
          description: "Require subscription to access trading signals",
          type: "boolean",
          value: settings.signalSubscriptionRequired !== false,
        },
      ],
    },
    {
      id: "security",
      title: "Security Settings",
      description: "Security and authentication configuration",
      icon: <Shield className="w-5 h-5" />,
      settings: [
        {
          key: "twoFactorRequired",
          label: "Force 2FA for All Users",
          description: "Require two-factor authentication for all accounts",
          type: "boolean",
          value: settings.twoFactorRequired || false,
        },
        {
          key: "sessionTimeout",
          label: "Session Timeout (minutes)",
          description: "Automatically log out inactive users",
          type: "number",
          value: settings.sessionTimeout || 60,
        },
        {
          key: "passwordMinLength",
          label: "Minimum Password Length",
          type: "number",
          value: settings.passwordMinLength || 8,
        },
        {
          key: "passwordRequireSpecial",
          label: "Require Special Characters",
          description: "Passwords must contain special characters",
          type: "boolean",
          value: settings.passwordRequireSpecial !== false,
        },
        {
          key: "loginAttempts",
          label: "Max Login Attempts",
          description: "Maximum failed login attempts before lockout",
          type: "number",
          value: settings.loginAttempts || 5,
        },
        {
          key: "lockoutDuration",
          label: "Lockout Duration (minutes)",
          description: "How long to lock accounts after failed attempts",
          type: "number",
          value: settings.lockoutDuration || 15,
        },
        {
          key: "ipWhitelistEnabled",
          label: "IP Whitelist for Admin",
          description: "Restrict admin access to specific IP addresses",
          type: "boolean",
          value: settings.ipWhitelistEnabled || false,
        },
        {
          key: "ipWhitelist",
          label: "Allowed IP Addresses",
          description: "Comma-separated list of allowed IPs",
          type: "textarea",
          value: settings.ipWhitelist || "",
        },
      ],
    },
    {
      id: "notifications",
      title: "Notification Settings",
      description: "Configure system notifications",
      icon: <Bell className="w-5 h-5" />,
      settings: [
        {
          key: "emailNotificationsEnabled",
          label: "Email Notifications",
          description: "Send email notifications to users",
          type: "boolean",
          value: settings.emailNotificationsEnabled !== false,
        },
        {
          key: "pushNotificationsEnabled",
          label: "Push Notifications",
          description: "Send browser push notifications",
          type: "boolean",
          value: settings.pushNotificationsEnabled !== false,
        },
        {
          key: "smsNotificationsEnabled",
          label: "SMS Notifications",
          description: "Send SMS notifications (requires Twilio)",
          type: "boolean",
          value: settings.smsNotificationsEnabled || false,
        },
        {
          key: "twilioAccountSid",
          label: "Twilio Account SID",
          type: "text",
          value: settings.twilioAccountSid || "",
        },
        {
          key: "twilioAuthToken",
          label: "Twilio Auth Token",
          type: "password",
          value: settings.twilioAuthToken || "",
        },
        {
          key: "twilioPhoneNumber",
          label: "Twilio Phone Number",
          type: "text",
          value: settings.twilioPhoneNumber || "",
        },
        {
          key: "notifyNewUsers",
          label: "Notify on New Users",
          description: "Send notification when new users register",
          type: "boolean",
          value: settings.notifyNewUsers !== false,
        },
        {
          key: "notifyNewOrders",
          label: "Notify on New Orders",
          description: "Send notification for new subscription orders",
          type: "boolean",
          value: settings.notifyNewOrders !== false,
        },
      ],
    },
    {
      id: "api",
      title: "API Configuration",
      description: "External API and integration settings",
      icon: <Code className="w-5 h-5" />,
      settings: [
        {
          key: "apiEnabled",
          label: "Public API Enabled",
          description: "Enable public API access",
          type: "boolean",
          value: settings.apiEnabled !== false,
        },
        {
          key: "apiRateLimit",
          label: "API Rate Limit (per minute)",
          description: "Maximum API requests per minute per user",
          type: "number",
          value: settings.apiRateLimit || 100,
        },
        {
          key: "webhooksEnabled",
          label: "Webhooks Enabled",
          description: "Enable webhook functionality",
          type: "boolean",
          value: settings.webhooksEnabled || false,
        },
        {
          key: "binanceApiKey",
          label: "Binance API Key",
          description: "For crypto trading integration",
          type: "text",
          value: settings.binanceApiKey || "",
        },
        {
          key: "binanceApiSecret",
          label: "Binance API Secret",
          type: "password",
          value: settings.binanceApiSecret || "",
        },
        {
          key: "alphaVantageApiKey",
          label: "Alpha Vantage API Key",
          description: "For stock market data",
          type: "text",
          value: settings.alphaVantageApiKey || "",
        },
        {
          key: "coinGeckoApiKey",
          label: "CoinGecko API Key",
          description: "For cryptocurrency data",
          type: "text",
          value: settings.coinGeckoApiKey || "",
        },
      ],
    },
    {
      id: "performance",
      title: "Performance & Caching",
      description: "Performance optimization settings",
      icon: <Zap className="w-5 h-5" />,
      settings: [
        {
          key: "cachingEnabled",
          label: "Enable Caching",
          description: "Enable Redis caching for better performance",
          type: "boolean",
          value: settings.cachingEnabled !== false,
        },
        {
          key: "cacheTimeout",
          label: "Cache Timeout (seconds)",
          description: "How long to cache data",
          type: "number",
          value: settings.cacheTimeout || 300,
        },
        {
          key: "compressionEnabled",
          label: "Enable Compression",
          description: "Enable gzip compression for responses",
          type: "boolean",
          value: settings.compressionEnabled !== false,
        },
        {
          key: "cdnEnabled",
          label: "CDN Enabled",
          description: "Use CDN for static assets",
          type: "boolean",
          value: settings.cdnEnabled || false,
        },
        {
          key: "cdnUrl",
          label: "CDN URL",
          description: "CDN base URL for static assets",
          type: "url",
          value: settings.cdnUrl || "",
        },
        {
          key: "databasePoolSize",
          label: "Database Pool Size",
          description: "Maximum database connections",
          type: "number",
          value: settings.databasePoolSize || 10,
        },
      ],
    },
  ]

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }
    loadSettings()
  }, [router])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with real API call
      const mockSettings = {
        siteName: "Nexural Trading Platform",
        siteDescription: "Advanced AI-powered trading platform with automated signals and bots",
        siteUrl: "https://nexuraltrading.com",
        adminEmail: "admin@nexuraltrading.com",
        timezone: "UTC",
        maintenanceMode: false,
        registrationEnabled: true,
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpUser: "",
        smtpPassword: "",
        fromEmail: "noreply@nexuraltrading.com",
        fromName: "Nexural Trading Platform",
        emailVerificationRequired: true,
        currency: "USD",
        stripeEnabled: true,
        stripePublishableKey: "",
        stripeSecretKey: "",
        paypalEnabled: false,
        paypalClientId: "",
        paypalClientSecret: "",
        taxRate: 0,
        tradingEnabled: true,
        maxPositions: 10,
        minTradeAmount: 10,
        maxTradeAmount: 10000,
        leverageEnabled: false,
        maxLeverage: 50,
        autoTradingEnabled: true,
        signalSubscriptionRequired: true,
        twoFactorRequired: false,
        sessionTimeout: 60,
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        loginAttempts: 5,
        lockoutDuration: 15,
        ipWhitelistEnabled: false,
        ipWhitelist: "",
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        smsNotificationsEnabled: false,
        twilioAccountSid: "",
        twilioAuthToken: "",
        twilioPhoneNumber: "",
        notifyNewUsers: true,
        notifyNewOrders: true,
        apiEnabled: true,
        apiRateLimit: 100,
        webhooksEnabled: false,
        binanceApiKey: "",
        binanceApiSecret: "",
        alphaVantageApiKey: "",
        coinGeckoApiKey: "",
        cachingEnabled: true,
        cacheTimeout: 300,
        compressionEnabled: true,
        cdnEnabled: false,
        cdnUrl: "",
        databasePoolSize: 10,
      }

      setSettings(mockSettings)
      setOriginalSettings(mockSettings)
    } catch (error) {
      toast.error("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setOriginalSettings(settings)
      setHasChanges(false)
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    setSettings(originalSettings)
    setHasChanges(false)
    toast.success("Settings reset to last saved state")
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "nexural-settings.json"
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Settings exported successfully")
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)
        setSettings({ ...settings, ...importedSettings })
        setHasChanges(true)
        toast.success("Settings imported successfully")
      } catch (error) {
        toast.error("Invalid settings file")
      }
    }
    reader.readAsText(file)
  }

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderSettingInput = (setting: Setting) => {
    const value = settings[setting.key] ?? setting.value

    switch (setting.type) {
      case "boolean":
        return (
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">{setting.label}</Label>
              {setting.description && <p className="text-sm text-gray-400">{setting.description}</p>}
            </div>
            <Switch checked={value} onCheckedChange={(checked) => updateSetting(setting.key, checked)} />
          </div>
        )

      case "select":
        return (
          <div className="space-y-2">
            <Label className="text-white">{setting.label}</Label>
            {setting.description && <p className="text-sm text-gray-400">{setting.description}</p>}
            <Select value={value} onValueChange={(newValue) => updateSetting(setting.key, newValue)}>
              <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-purple-500/30">
                {setting.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <Label className="text-white">{setting.label}</Label>
            {setting.description && <p className="text-sm text-gray-400">{setting.description}</p>}
            <Textarea
              value={value}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
              rows={3}
            />
          </div>
        )

      case "password":
        return (
          <div className="space-y-2">
            <Label className="text-white">{setting.label}</Label>
            {setting.description && <p className="text-sm text-gray-400">{setting.description}</p>}
            <div className="relative">
              <Input
                type={showPasswords[setting.key] ? "text" : "password"}
                value={value}
                onChange={(e) => updateSetting(setting.key, e.target.value)}
                className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => togglePasswordVisibility(setting.key)}
              >
                {showPasswords[setting.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label className="text-white">{setting.label}</Label>
            {setting.description && <p className="text-sm text-gray-400">{setting.description}</p>}
            <Input
              type={setting.type}
              value={value}
              onChange={(e) =>
                updateSetting(setting.key, setting.type === "number" ? Number(e.target.value) : e.target.value)
              }
              className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
              required={setting.required}
            />
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-black/20 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/admin/dashboard")}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
                <p className="text-gray-400">Configure platform settings and preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}

              <Button
                onClick={exportSettings}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  variant="outline"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>

              {hasChanges && (
                <Button
                  onClick={handleResetSettings}
                  variant="outline"
                  className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}

              <Button
                onClick={handleSaveSettings}
                disabled={isSaving || !hasChanges}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Settings
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-black/40 backdrop-blur-xl border-purple-500/20 grid grid-cols-4 lg:grid-cols-8 w-full">
            {settingsSections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2 text-xs">
                {section.icon}
                <span className="hidden sm:inline">{section.title.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {settingsSections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.settings.map((setting, index) => (
                    <div key={setting.key}>
                      {renderSettingInput(setting)}
                      {index < section.settings.length - 1 && <Separator className="mt-6 bg-purple-500/20" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
