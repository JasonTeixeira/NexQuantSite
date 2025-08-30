"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { 
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Package,
  Receipt,
  Settings,
  ExternalLink,
  Shield,
  Zap,
  Users,
  BarChart3,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Copy,
  Mail,
  Phone,
  Globe,
  AlertCircle
} from "lucide-react"
import { 
  SUBSCRIPTION_PLANS, 
  mockSubscriptions,
  mockInvoices,
  mockPaymentMethods
} from "@/lib/billing/billing-utils"

// Mock user billing data
const mockUserBillingData = {
  subscription: {
    id: 'sub_001',
    planId: 'pro',
    status: 'active',
    currentPeriodStart: '2024-01-15T00:00:00Z',
    currentPeriodEnd: '2024-02-15T00:00:00Z',
    billingCycle: 'monthly',
    nextBillingAmount: 10692, // $106.92 in cents
    trialEndsAt: null,
    cancelAt: null
  },
  usage: {
    tradingSignals: { used: 847, limit: 'unlimited' },
    backtests: { used: 23, limit: 'unlimited' },
    portfolios: { used: 3, limit: 5 },
    apiCalls: { used: 2847, limit: 10000 }
  },
  billingHistory: [
    {
      id: 'inv_001',
      date: '2024-01-15',
      amount: 10692,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: 'inv_002',
      date: '2023-12-15',
      amount: 10692,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: 'inv_003',
      date: '2023-11-15',
      amount: 10692,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    }
  ]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-green-400 bg-green-900/20 border-green-700'
    case 'trial': return 'text-blue-400 bg-blue-900/20 border-blue-700'
    case 'past_due': return 'text-amber-400 bg-amber-900/20 border-amber-700'
    case 'cancelled': return 'text-gray-400 bg-gray-900/20 border-gray-700'
    case 'paid': return 'text-green-400 bg-green-900/20 border-green-700'
    case 'pending': return 'text-amber-400 bg-amber-900/20 border-amber-700'
    case 'failed': return 'text-red-400 bg-red-900/20 border-red-700'
    default: return 'text-gray-400 bg-gray-900/20 border-gray-700'
  }
}

const getPlanColor = (planId: string) => {
  switch (planId) {
    case 'free': return '#6B7280'
    case 'pro': return '#10B981'
    case 'enterprise': return '#3B82F6'
    default: return '#8B5CF6'
  }
}

export default function UserBillingDashboard() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === mockUserBillingData.subscription.planId)
  const currentPaymentMethod = mockPaymentMethods[0]

  const handlePlanChange = async (newPlanId: string) => {
    setIsLoading(true)
    try {
      // Simulate plan change
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Plan changed to:', newPlanId)
      setShowUpgradeDialog(false)
    } catch (error) {
      console.error('Plan change failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadInvoice = (invoiceId: string) => {
    // In production, this would download the actual PDF
    console.log('Downloading invoice:', invoiceId)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
            <p className="text-gray-400">Manage your subscription, payment methods, and billing</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowUpgradeDialog(true)} className="bg-cyan-600 hover:bg-cyan-700">
              <ArrowUp className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button variant="outline" onClick={() => setShowPaymentMethodDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </div>

        {/* Current Subscription Overview */}
        <Card className="mb-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Plan Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ 
                      backgroundColor: getPlanColor(currentPlan?.id || '') + '20',
                      border: `2px solid ${getPlanColor(currentPlan?.id || '')}`
                    }}
                  >
                    <Package className="w-6 h-6" style={{ color: getPlanColor(currentPlan?.id || '') }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: getPlanColor(currentPlan?.id || '') }}>
                      {currentPlan?.name} Plan
                    </h2>
                    <p className="text-gray-400">{currentPlan?.description}</p>
                  </div>
                  <Badge className={getStatusColor(mockUserBillingData.subscription.status)}>
                    {mockUserBillingData.subscription.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Current Plan</div>
                    <div className="font-bold text-lg" style={{ color: getPlanColor(currentPlan?.id || '') }}>
                      {currentPlan?.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Billing Cycle</div>
                    <div className="font-bold text-lg capitalize">
                      {mockUserBillingData.subscription.billingCycle}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Next Billing</div>
                    <div className="font-bold text-lg">
                      {formatDate(mockUserBillingData.subscription.currentPeriodEnd)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Amount</div>
                    <div className="font-bold text-lg text-green-400">
                      {formatCurrency(mockUserBillingData.subscription.nextBillingAmount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={() => setShowUpgradeDialog(true)}>
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Change Plan
                </Button>
                <Button variant="outline" className="w-full border-gray-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Billing Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-red-600 text-red-400 hover:bg-red-900/20"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage & Limits */}
        <Card className="mb-8 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>Track your current usage against plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(mockUserBillingData.usage).map(([key, usage]) => (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <Badge variant="outline">
                      {usage.limit === 'unlimited' ? 'Unlimited' : `${usage.used}/${usage.limit}`}
                    </Badge>
                  </div>
                  
                  {usage.limit !== 'unlimited' && (
                    <div className="space-y-1">
                      <Progress 
                        value={(usage.used / (usage.limit as number)) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{usage.used} used</span>
                        <span>{(usage.limit as number) - usage.used} remaining</span>
                      </div>
                    </div>
                  )}
                  
                  {usage.limit === 'unlimited' && (
                    <div className="text-green-400 text-sm font-semibold">
                      {usage.used.toLocaleString()} used this month
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Billing Tabs */}
        <Tabs defaultValue="payment-methods" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900">
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="billing-history">Billing History</TabsTrigger>
            <TabsTrigger value="plans">Available Plans</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Payment Methods</CardTitle>
                  <Button onClick={() => setShowPaymentMethodDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
                <CardDescription>Manage your payment methods and billing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPaymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {method.details.brand} •••• {method.details.last4}
                          </div>
                          <div className="text-sm text-gray-400">
                            Expires {method.details.expMonth}/{method.details.expYear}
                          </div>
                          {method.isDefault && (
                            <Badge className="bg-green-600 mt-1">Default</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button size="sm" variant="outline">
                            Set as Default
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" disabled={method.isDefault}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing-history">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download your invoices and receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUserBillingData.billingHistory.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{invoice.description}</div>
                          <div className="text-sm text-gray-400">
                            {formatDate(invoice.date)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            {formatCurrency(invoice.amount)}
                          </div>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => downloadInvoice(invoice.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Plans Tab */}
          <TabsContent value="plans">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Choose Your Plan</h3>
                <p className="text-gray-400">Upgrade or downgrade your subscription at any time</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`bg-gray-900/50 border-gray-800 relative ${
                      plan.id === currentPlan?.id ? 'ring-2 ring-cyan-600' : ''
                    } ${plan.isPopular ? 'ring-2 ring-amber-600' : ''}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-amber-600">Most Popular</Badge>
                      </div>
                    )}
                    
                    {plan.id === currentPlan?.id && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-cyan-600">Current Plan</Badge>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-xl" style={{ color: getPlanColor(plan.id) }}>
                        {plan.name}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="pt-4">
                        <div className="text-4xl font-bold" style={{ color: getPlanColor(plan.id) }}>
                          {plan.pricing.monthly === 0 ? 'Free' : formatCurrency(plan.pricing.monthly * 100)}
                        </div>
                        <div className="text-sm text-gray-400">per month</div>
                        {plan.pricing.yearly > 0 && (
                          <div className="text-sm text-gray-400 mt-1">
                            {formatCurrency(plan.pricing.yearly * 100)} billed yearly
                            {plan.pricing.yearlyDiscount && (
                              <span className="text-green-400 ml-1">
                                (save {plan.pricing.yearlyDiscount.toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-4">
                          {plan.id === currentPlan?.id ? (
                            <Button className="w-full" disabled>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Current Plan
                            </Button>
                          ) : (
                            <Button 
                              className="w-full bg-cyan-600 hover:bg-cyan-700"
                              onClick={() => {
                                setSelectedPlan(plan.id)
                                setShowUpgradeDialog(true)
                              }}
                            >
                              {plan.pricing.monthly > (currentPlan?.pricing.monthly || 0) ? 'Upgrade' : 'Downgrade'} to {plan.name}
                            </Button>
                          )}
                        </div>

                        {plan.trialPeriod && plan.id !== currentPlan?.id && (
                          <div className="text-center text-sm text-gray-400">
                            {plan.trialPeriod}-day free trial included
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Billing Settings</CardTitle>
                <CardDescription>Configure your billing preferences and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-receipts">Email Receipts</Label>
                        <p className="text-sm text-gray-400">Send invoice receipts to your email</p>
                      </div>
                      <Switch id="email-receipts" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="payment-reminders">Payment Reminders</Label>
                        <p className="text-sm text-gray-400">Get notified before payments</p>
                      </div>
                      <Switch id="payment-reminders" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="usage-alerts">Usage Alerts</Label>
                        <p className="text-sm text-gray-400">Get notified when approaching limits</p>
                      </div>
                      <Switch id="usage-alerts" defaultChecked />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-700">
                    <h4 className="font-semibold mb-4">Billing Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input
                          id="company-name"
                          placeholder="Your company name"
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax-id">Tax ID</Label>
                        <Input
                          id="tax-id"
                          placeholder="Tax identification number"
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle>Change Subscription Plan</DialogTitle>
              <DialogDescription>
                {selectedPlan && SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan) && (
                  <>
                    You're about to change to the {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name} plan.
                    Your billing will be prorated for the remaining period.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedPlan && SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan) && (
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="font-semibold text-lg">
                    {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name} Plan
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.pricing.monthly || 0 * 100)}
                    <span className="text-sm text-gray-400">/month</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpgradeDialog(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => selectedPlan && handlePlanChange(selectedPlan)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm Change'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Subscription Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-400">Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your subscription? You'll lose access to all premium features at the end of your current billing period.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <div className="font-semibold text-red-400 mb-2">What you'll lose:</div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Unlimited trading signals</li>
                  <li>• Advanced backtesting</li>
                  <li>• Priority support</li>
                  <li>• API access</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelDialog(false)}
                  className="flex-1"
                >
                  Keep Subscription
                </Button>
                <Button 
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    // Handle cancellation
                    setShowCancelDialog(false)
                  }}
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Payment Method Dialog */}
        <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Add a new payment method to your account
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-8 text-gray-400">
              💳 Payment method form will be implemented here
              <br />
              <small>Stripe/PayPal integration for secure payments</small>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


