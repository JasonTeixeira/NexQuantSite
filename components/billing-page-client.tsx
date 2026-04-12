"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, DollarSign, Download, Calendar, Settings, AlertTriangle, Check, X, TrendingUp, Users, Zap, Shield, Star, Bell, RefreshCw, ExternalLink, Plus, Edit, Trash2 } from 'lucide-react'

interface UsageData {
  apiCalls: { used: number; limit: number }
  signals: { used: number; limit: number }
  strategies: { used: number; limit: number }
  storage: { used: number; limit: number }
}

interface Plan {
  id: string
  name: string
  price: number
  interval: string
  features: string[]
  limits: {
    apiCalls: number | string
    signals: number | string
    strategies: number | string
    storage: string
  }
  popular?: boolean
}

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  email?: string
  isDefault: boolean
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
  downloadUrl: string
}

const usageData: UsageData = {
  apiCalls: { used: 7500, limit: 10000 },
  signals: { used: 247, limit: 500 },
  strategies: { used: 18, limit: 25 },
  storage: { used: 2.3, limit: 5 }
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Basic trading signals',
      'Limited API access',
      'Community support',
      '5 strategies max'
    ],
    limits: {
      apiCalls: 1000,
      signals: 50,
      strategies: 5,
      storage: '1 GB'
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 55,
    interval: 'month',
    features: [
      'Advanced trading signals',
      'Full API access',
      'Priority support',
      'Unlimited strategies',
      'Real-time data',
      'Custom indicators'
    ],
    limits: {
      apiCalls: 10000,
      signals: 500,
      strategies: 25,
      storage: '5 GB'
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited API calls',
      'Dedicated support',
      'Custom integrations',
      'Advanced analytics',
      'White-label options'
    ],
    limits: {
      apiCalls: 'Unlimited',
      signals: 'Unlimited',
      strategies: 'Unlimited',
      storage: '50 GB'
    }
  }
]

const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true
  },
  {
    id: '2',
    type: 'paypal',
    email: 'user@example.com',
    isDefault: false
  }
]

const invoices: Invoice[] = [
  {
    id: 'inv_001',
    date: '2024-01-15',
    amount: 55.00,
    status: 'paid',
    description: 'Pro Plan - January 2024',
    downloadUrl: '#'
  },
  {
    id: 'inv_002',
    date: '2023-12-15',
    amount: 55.00,
    status: 'paid',
    description: 'Pro Plan - December 2023',
    downloadUrl: '#'
  },
  {
    id: 'inv_003',
    date: '2023-11-15',
    amount: 55.00,
    status: 'paid',
    description: 'Pro Plan - November 2023',
    downloadUrl: '#'
  }
]

export default function BillingPageClient() {
  const [activeTab, setActiveTab] = useState("usage")
  const [currentPlan, setCurrentPlan] = useState("pro")
  const [billingInterval, setBillingInterval] = useState("monthly")
  const [autoRenew, setAutoRenew] = useState(true)
  const [usageAlerts, setUsageAlerts] = useState(true)

  const getCurrentPlan = () => plans.find(plan => plan.id === currentPlan)
  const currentPlanData = getCurrentPlan()

  const getUsagePercentage = (used: number, limit: number | string) => {
    if (typeof limit === 'string') return 0
    return (used / limit) * 100
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Billing & Subscription</h1>
            <p className="text-gray-400">Manage your subscription, usage, and payment methods</p>
          </div>

          {/* Current Plan Overview */}
          <Card className="bg-gradient-to-r from-primary/20 to-green-400/20 border-primary/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {currentPlanData?.name} Plan
                  </h3>
                  <p className="text-gray-300">
                    {currentPlanData?.price === 0 ? 'Free forever' : `${formatCurrency(currentPlanData?.price || 0)} per ${currentPlanData?.interval}`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Next billing</div>
                  <div className="text-lg font-semibold text-white">February 15, 2024</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-900/50 border border-gray-800">
              <TabsTrigger value="usage" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <TrendingUp className="w-4 h-4 mr-2" />
                Usage
              </TabsTrigger>
              <TabsTrigger value="plans" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Star className="w-4 h-4 mr-2" />
                Plans
              </TabsTrigger>
              <TabsTrigger value="payment" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Download className="w-4 h-4 mr-2" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-black">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Usage Tab */}
            <TabsContent value="usage" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* API Calls */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      API Calls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Used this month</span>
                        <span className="font-medium">
                          {usageData.apiCalls.used.toLocaleString()} / {usageData.apiCalls.limit.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(usageData.apiCalls.used, usageData.apiCalls.limit)}
                        className="h-2 bg-gray-800"
                      />
                      <div className="text-xs text-gray-500">
                        {Math.round(getUsagePercentage(usageData.apiCalls.used, usageData.apiCalls.limit))}% used
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trading Signals */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Used this month</span>
                        <span className="font-medium">
                          {usageData.signals.used} / {usageData.signals.limit}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(usageData.signals.used, usageData.signals.limit)}
                        className="h-2 bg-gray-800"
                      />
                      <div className="text-xs text-gray-500">
                        {Math.round(getUsagePercentage(usageData.signals.used, usageData.signals.limit))}% used
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Strategies */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      Strategies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Active strategies</span>
                        <span className="font-medium">
                          {usageData.strategies.used} / {usageData.strategies.limit}
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(usageData.strategies.used, usageData.strategies.limit)}
                        className="h-2 bg-gray-800"
                      />
                      <div className="text-xs text-gray-500">
                        {Math.round(getUsagePercentage(usageData.strategies.used, usageData.strategies.limit))}% used
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Storage */}
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                      Storage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Data stored</span>
                        <span className="font-medium">
                          {usageData.storage.used} GB / {usageData.storage.limit} GB
                        </span>
                      </div>
                      <Progress 
                        value={getUsagePercentage(usageData.storage.used, usageData.storage.limit)}
                        className="h-2 bg-gray-800"
                      />
                      <div className="text-xs text-gray-500">
                        {Math.round(getUsagePercentage(usageData.storage.used, usageData.storage.limit))}% used
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Alerts */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Usage Monitoring
                  </CardTitle>
                  <CardDescription>Get notified when you approach your usage limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Usage Alerts</div>
                      <div className="text-sm text-gray-400">Receive notifications at 80% and 95% of limits</div>
                    </div>
                    <Switch
                      checked={usageAlerts}
                      onCheckedChange={setUsageAlerts}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-6">
              {/* Billing Interval Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-900/50 rounded-lg p-1 border border-gray-800">
                  <Button
                    variant={billingInterval === "monthly" ? "default" : "ghost"}
                    onClick={() => setBillingInterval("monthly")}
                    className={billingInterval === "monthly" ? "bg-primary text-black" : "text-gray-300"}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingInterval === "yearly" ? "default" : "ghost"}
                    onClick={() => setBillingInterval("yearly")}
                    className={billingInterval === "yearly" ? "bg-primary text-black" : "text-gray-300"}
                  >
                    Yearly
                    <Badge className="ml-2 bg-green-500/20 text-green-400">Save 20%</Badge>
                  </Button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative bg-gray-900/50 border-gray-800 ${
                      plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''
                    } ${currentPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-black px-3 py-1">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold text-primary">
                        {plan.price === 0 ? 'Free' : formatCurrency(billingInterval === 'yearly' ? plan.price * 12 * 0.8 : plan.price)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {plan.price === 0 ? 'Forever' : `per ${billingInterval === 'yearly' ? 'year' : 'month'}`}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-gray-800 pt-4 space-y-2">
                        <div className="text-sm font-medium text-gray-300">Limits:</div>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div>API Calls: {plan.limits.apiCalls}</div>
                          <div>Signals: {plan.limits.signals}</div>
                          <div>Strategies: {plan.limits.strategies}</div>
                          <div>Storage: {plan.limits.storage}</div>
                        </div>
                      </div>

                      <Button 
                        className={`w-full ${
                          currentPlan === plan.id 
                            ? 'bg-gray-700 text-gray-300 cursor-not-allowed' 
                            : 'bg-primary text-black hover:bg-primary/90'
                        }`}
                        disabled={currentPlan === plan.id}
                        onClick={() => setCurrentPlan(plan.id)}
                      >
                        {currentPlan === plan.id ? 'Current Plan' : 
                         plan.price > (getCurrentPlan()?.price || 0) ? 'Upgrade' : 
                         plan.price < (getCurrentPlan()?.price || 0) ? 'Downgrade' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Plan Comparison */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Feature Comparison</CardTitle>
                  <CardDescription>Compare all features across different plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4">Feature</th>
                          {plans.map((plan) => (
                            <th key={plan.id} className="text-center py-3 px-4">{plan.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        <tr>
                          <td className="py-3 px-4 font-medium">API Calls</td>
                          {plans.map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">{plan.limits.apiCalls}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Trading Signals</td>
                          {plans.map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">{plan.limits.signals}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Active Strategies</td>
                          {plans.map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">{plan.limits.strategies}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Data Storage</td>
                          {plans.map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">{plan.limits.storage}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Real-time Data</td>
                          <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                          <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                          <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Priority Support</td>
                          <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                          <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                          <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">Custom Integrations</td>
                          <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                          <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                          <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
              {/* Payment Methods */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods and billing information</CardDescription>
                  </div>
                  <Button className="bg-primary text-black hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {method.type === 'card' ? (
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                              {method.brand?.toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                              PP
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {method.type === 'card' 
                                ? `•••• •••• •••• ${method.last4}` 
                                : method.email
                              }
                            </div>
                            <div className="text-sm text-gray-400">
                              {method.type === 'card' 
                                ? `Expires ${method.expiryMonth}/${method.expiryYear}` 
                                : 'PayPal Account'
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <Badge className="bg-primary/20 text-primary">Default</Badge>
                          )}
                          <Button variant="ghost" size="sm" className="text-gray-400">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                  <CardDescription>Update your billing information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue="Alex"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue="Chen"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        defaultValue="123 Trading Street"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        defaultValue="New York"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        defaultValue="NY"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        defaultValue="10001"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select defaultValue="us">
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="de">Germany</SelectItem>
                          <SelectItem value="fr">France</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="bg-primary text-black hover:bg-primary/90">
                    Update Billing Address
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View and download your past invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between py-4 border-b border-gray-800 last:border-b-0">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-400' :
                            invoice.status === 'pending' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`} />
                          <div>
                            <div className="font-medium">{invoice.description}</div>
                            <div className="text-sm text-gray-400">
                              {new Date(invoice.date).toLocaleDateString()} • 
                              <span className={`ml-1 capitalize ${
                                invoice.status === 'paid' ? 'text-green-400' :
                                invoice.status === 'pending' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-primary">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tax Information */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Tax Information</CardTitle>
                  <CardDescription>Manage your tax settings and documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Tax ID / VAT Number</div>
                      <div className="text-sm text-gray-400">Add your tax identification for invoices</div>
                    </div>
                    <Button variant="outline" className="border-gray-700 text-gray-300">
                      Add Tax ID
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Tax Documents</div>
                      <div className="text-sm text-gray-400">Download tax documents for the current year</div>
                    </div>
                    <Button variant="outline" className="border-gray-700 text-gray-300">
                      <Download className="w-4 h-4 mr-2" />
                      Download 1099
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Billing Preferences</CardTitle>
                  <CardDescription>Configure your billing and subscription settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-renewal</div>
                      <div className="text-sm text-gray-400">Automatically renew your subscription</div>
                    </div>
                    <Switch
                      checked={autoRenew}
                      onCheckedChange={setAutoRenew}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Usage Alerts</div>
                      <div className="text-sm text-gray-400">Get notified when approaching limits</div>
                    </div>
                    <Switch
                      checked={usageAlerts}
                      onCheckedChange={setUsageAlerts}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingEmail">Billing Email</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      defaultValue="alex.chen@example.com"
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                    <p className="text-sm text-gray-400">
                      Invoices and billing notifications will be sent to this email
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Management */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>Manage your subscription and account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="border-gray-700 text-gray-300">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Update Payment Method
                    </Button>
                    <Button variant="outline" className="border-gray-700 text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      Change Billing Date
                    </Button>
                    <Button variant="outline" className="border-gray-700 text-gray-300">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Customer Portal
                    </Button>
                    <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                      <X className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Support */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>Get support with billing and subscription issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-400">Billing Questions?</div>
                          <div className="text-sm text-gray-300 mt-1">
                            Our billing team is here to help with any questions about your subscription, 
                            invoices, or payment methods.
                          </div>
                          <Button variant="outline" className="mt-3 border-blue-500 text-blue-400 hover:bg-blue-500/10">
                            Contact Billing Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
