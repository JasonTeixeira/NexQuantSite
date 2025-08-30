"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Shield, 
  Target, 
  TrendingUp, 
  Star,
  Camera,
  Smartphone,
  Mail,
  Globe,
  DollarSign,
  BarChart3,
  Zap,
  Brain,
  Award,
  Play,
  Book,
  Settings,
  Rocket
} from "lucide-react"
import { useRouter } from 'next/navigation'

interface OnboardingData {
  // Personal Info
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  avatar?: string
  
  // Verification
  emailVerified: boolean
  phoneVerified: boolean
  
  // Experience & Goals
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  tradingGoals: string[]
  riskTolerance: 'low' | 'medium' | 'high'
  investmentAmount: string
  timeHorizon: 'short' | 'medium' | 'long'
  
  // Preferences
  preferredMarkets: string[]
  tradingStyle: 'conservative' | 'moderate' | 'aggressive'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  
  // Features Interest
  interestedFeatures: string[]
  wantsDemoAccount: boolean
  needsEducation: boolean
}

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Rocket },
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'verification', title: 'Verification', icon: Shield },
  { id: 'experience', title: 'Experience', icon: Target },
  { id: 'preferences', title: 'Preferences', icon: Settings },
  { id: 'features', title: 'Features', icon: Star },
  { id: 'complete', title: 'Complete', icon: CheckCircle }
]

const tradingGoals = [
  { id: 'passive-income', label: 'Generate Passive Income', icon: DollarSign },
  { id: 'wealth-building', label: 'Long-term Wealth Building', icon: TrendingUp },
  { id: 'portfolio-diversification', label: 'Portfolio Diversification', icon: BarChart3 },
  { id: 'learn-trading', label: 'Learn Trading Skills', icon: Book },
  { id: 'automated-trading', label: 'Automated Trading', icon: Zap },
  { id: 'risk-management', label: 'Risk Management', icon: Shield }
]

const markets = [
  { id: 'stocks', label: 'Stocks', desc: 'Individual company shares' },
  { id: 'forex', label: 'Forex', desc: 'Currency pairs' },
  { id: 'crypto', label: 'Cryptocurrency', desc: 'Digital assets' },
  { id: 'commodities', label: 'Commodities', desc: 'Gold, oil, etc.' },
  { id: 'indices', label: 'Indices', desc: 'Market baskets' },
  { id: 'options', label: 'Options', desc: 'Derivatives trading' }
]

const features = [
  { id: 'ai-signals', label: 'AI Trading Signals', desc: 'Smart market insights' },
  { id: 'auto-trading', label: 'Automated Trading', desc: 'Set and forget bots' },
  { id: 'backtesting', label: 'Strategy Backtesting', desc: 'Test before you trade' },
  { id: 'portfolio-analytics', label: 'Portfolio Analytics', desc: 'Deep performance insights' },
  { id: 'community', label: 'Trading Community', desc: 'Connect with traders' },
  { id: 'education', label: 'Learning Resources', desc: 'Educational content' }
]

export default function OnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    emailVerified: false,
    phoneVerified: false,
    experienceLevel: 'beginner',
    tradingGoals: [],
    riskTolerance: 'medium',
    investmentAmount: '',
    timeHorizon: 'medium',
    preferredMarkets: [],
    tradingStyle: 'moderate',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    interestedFeatures: [],
    wantsDemoAccount: true,
    needsEducation: true
  })

  const progress = ((currentStep + 1) / steps.length) * 100

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    try {
      // Save onboarding data to API
      console.log('Completing onboarding:', onboardingData)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding failed:', error)
    }
  }

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item]
  }

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to Nexural Trading!</h2>
              <p className="text-xl text-gray-400 mb-6">
                Let's set up your account and personalize your trading experience.
              </p>
              <p className="text-gray-500">
                This quick setup will take about 3-5 minutes and help us tailor the platform to your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-gray-800 rounded-lg">
                <Brain className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">AI-Powered</h3>
                <p className="text-sm text-gray-400">Smart algorithms analyze markets for you</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Secure & Safe</h3>
                <p className="text-sm text-gray-400">Bank-level security for your data</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <Award className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Award-Winning</h3>
                <p className="text-sm text-gray-400">Trusted by thousands of traders</p>
              </div>
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
              <p className="text-gray-400">This helps us personalize your experience</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={onboardingData.avatar} />
                  <AvatarFallback className="text-xl">
                    {onboardingData.firstName[0]}{onboardingData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button size="sm" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0">
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={onboardingData.firstName}
                  onChange={(e) => updateData({ firstName: e.target.value })}
                  placeholder="Enter your first name"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={onboardingData.lastName}
                  onChange={(e) => updateData({ lastName: e.target.value })}
                  placeholder="Enter your last name"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={onboardingData.email}
                onChange={(e) => updateData({ email: e.target.value })}
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                value={onboardingData.phone}
                onChange={(e) => updateData({ phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Tell us about yourself (Optional)</Label>
              <Textarea
                id="bio"
                value={onboardingData.bio}
                onChange={(e) => updateData({ bio: e.target.value })}
                placeholder="What brings you to trading? Any experience or goals?"
                className="bg-gray-800 border-gray-700 min-h-[80px]"
              />
            </div>
          </div>
        )

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Verify your account</h2>
              <p className="text-gray-400">This helps keep your account secure</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="font-semibold">Email Verification</div>
                    <div className="text-sm text-gray-400">{onboardingData.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={onboardingData.emailVerified ? 'default' : 'secondary'}>
                    {onboardingData.emailVerified ? 'Verified' : 'Pending'}
                  </Badge>
                  {!onboardingData.emailVerified && (
                    <Button size="sm" onClick={() => updateData({ emailVerified: true })}>
                      Send Code
                    </Button>
                  )}
                </div>
              </div>

              {onboardingData.phone && (
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="font-semibold">SMS Verification</div>
                      <div className="text-sm text-gray-400">{onboardingData.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={onboardingData.phoneVerified ? 'default' : 'secondary'}>
                      {onboardingData.phoneVerified ? 'Verified' : 'Pending'}
                    </Badge>
                    {!onboardingData.phoneVerified && (
                      <Button size="sm" onClick={() => updateData({ phoneVerified: true })}>
                        Send SMS
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-1">Why verify?</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Protect your account from unauthorized access</li>
                      <li>• Enable password reset and account recovery</li>
                      <li>• Receive important security notifications</li>
                      <li>• Access all platform features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="skip-verification"
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateData({ emailVerified: false, phoneVerified: false })
                  }
                }}
              />
              <Label htmlFor="skip-verification" className="text-sm text-gray-400">
                Skip verification for now (you can complete it later)
              </Label>
            </div>
          </div>
        )

      case 'experience':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Your trading experience</h2>
              <p className="text-gray-400">Help us understand your background</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'beginner', label: 'Beginner', desc: 'New to trading' },
                    { value: 'intermediate', label: 'Intermediate', desc: '1-3 years' },
                    { value: 'advanced', label: 'Advanced', desc: '3-5 years' },
                    { value: 'expert', label: 'Expert', desc: '5+ years' }
                  ].map((level) => (
                    <Button
                      key={level.value}
                      variant={onboardingData.experienceLevel === level.value ? 'default' : 'outline'}
                      className="h-16 flex flex-col items-center justify-center"
                      onClick={() => updateData({ experienceLevel: level.value as any })}
                    >
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-xs opacity-70">{level.desc}</div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>What are your trading goals? (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tradingGoals.map((goal) => (
                    <Button
                      key={goal.id}
                      variant={onboardingData.tradingGoals.includes(goal.id) ? 'default' : 'outline'}
                      className="h-16 flex items-center justify-start gap-3"
                      onClick={() => updateData({ 
                        tradingGoals: toggleArrayItem(onboardingData.tradingGoals, goal.id)
                      })}
                    >
                      <goal.icon className="w-5 h-5" />
                      <span>{goal.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Risk Tolerance</Label>
                  <Select 
                    value={onboardingData.riskTolerance} 
                    onValueChange={(value) => updateData({ riskTolerance: value as any })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="low">Low - Conservative approach</SelectItem>
                      <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                      <SelectItem value="high">High - Aggressive approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Investment Timeline</Label>
                  <Select 
                    value={onboardingData.timeHorizon} 
                    onValueChange={(value) => updateData({ timeHorizon: value as any })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="short">Short-term (Days to weeks)</SelectItem>
                      <SelectItem value="medium">Medium-term (Months)</SelectItem>
                      <SelectItem value="long">Long-term (Years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Starting Investment Amount (Optional)</Label>
                <Select 
                  value={onboardingData.investmentAmount} 
                  onValueChange={(value) => updateData({ investmentAmount: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select amount range" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="under-1k">Under $1,000</SelectItem>
                    <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                    <SelectItem value="over-50k">Over $50,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Trading preferences</h2>
              <p className="text-gray-400">Customize your trading experience</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred Markets (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {markets.map((market) => (
                    <Button
                      key={market.id}
                      variant={onboardingData.preferredMarkets.includes(market.id) ? 'default' : 'outline'}
                      className="h-16 flex items-center justify-between p-4"
                      onClick={() => updateData({ 
                        preferredMarkets: toggleArrayItem(onboardingData.preferredMarkets, market.id)
                      })}
                    >
                      <div className="text-left">
                        <div className="font-semibold">{market.label}</div>
                        <div className="text-xs opacity-70">{market.desc}</div>
                      </div>
                      {onboardingData.preferredMarkets.includes(market.id) && (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trading Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'conservative', label: 'Conservative', desc: 'Lower risk' },
                    { value: 'moderate', label: 'Moderate', desc: 'Balanced' },
                    { value: 'aggressive', label: 'Aggressive', desc: 'Higher risk' }
                  ].map((style) => (
                    <Button
                      key={style.value}
                      variant={onboardingData.tradingStyle === style.value ? 'default' : 'outline'}
                      className="h-16 flex flex-col items-center justify-center"
                      onClick={() => updateData({ tradingStyle: style.value as any })}
                    >
                      <div className="font-semibold">{style.label}</div>
                      <div className="text-xs opacity-70">{style.desc}</div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Notification Preferences</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-400">Market updates and alerts</div>
                    </div>
                    <Checkbox
                      checked={onboardingData.notifications.email}
                      onCheckedChange={(checked) => updateData({
                        notifications: { ...onboardingData.notifications, email: !!checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-gray-400">Real-time browser alerts</div>
                    </div>
                    <Checkbox
                      checked={onboardingData.notifications.push}
                      onCheckedChange={(checked) => updateData({
                        notifications: { ...onboardingData.notifications, push: !!checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">SMS Notifications</div>
                      <div className="text-sm text-gray-400">Critical alerts only</div>
                    </div>
                    <Checkbox
                      checked={onboardingData.notifications.sms}
                      onCheckedChange={(checked) => updateData({
                        notifications: { ...onboardingData.notifications, sms: !!checked }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Choose your features</h2>
              <p className="text-gray-400">Select features you're most interested in</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Features of Interest (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {features.map((feature) => (
                    <Button
                      key={feature.id}
                      variant={onboardingData.interestedFeatures.includes(feature.id) ? 'default' : 'outline'}
                      className="h-16 flex items-center justify-between p-4"
                      onClick={() => updateData({ 
                        interestedFeatures: toggleArrayItem(onboardingData.interestedFeatures, feature.id)
                      })}
                    >
                      <div className="text-left">
                        <div className="font-semibold">{feature.label}</div>
                        <div className="text-xs opacity-70">{feature.desc}</div>
                      </div>
                      {onboardingData.interestedFeatures.includes(feature.id) && (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-400" />
                      <span className="font-semibold">Demo Account</span>
                    </div>
                    <Checkbox
                      checked={onboardingData.wantsDemoAccount}
                      onCheckedChange={(checked) => updateData({ wantsDemoAccount: !!checked })}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Practice with virtual money to learn the platform risk-free
                  </p>
                </div>

                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Book className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold">Learning Resources</span>
                    </div>
                    <Checkbox
                      checked={onboardingData.needsEducation}
                      onCheckedChange={(checked) => updateData({ needsEducation: !!checked })}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Access educational content, tutorials, and trading guides
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-700 rounded-lg p-6">
                <h3 className="font-semibold text-cyan-400 mb-2">🎉 Welcome Bonus</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Complete your setup to get started with:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• $10,000 demo account balance</li>
                  <li>• 7-day free trial of Pro features</li>
                  <li>• Access to beginner trading course</li>
                  <li>• Personal onboarding call (optional)</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">You're all set!</h2>
              <p className="text-xl text-gray-400 mb-6">
                Welcome to Nexural Trading, {onboardingData.firstName}!
              </p>
              <p className="text-gray-500">
                Your account has been configured based on your preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-gray-800 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Portfolio Value</h3>
                <p className="text-2xl font-bold text-green-400">$10,000</p>
                <p className="text-sm text-gray-400">Demo Account</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Pro Trial</h3>
                <p className="text-2xl font-bold text-amber-400">7 Days</p>
                <p className="text-sm text-gray-400">Free Access</p>
              </div>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <Button 
                className="w-full bg-cyan-600 hover:bg-cyan-700" 
                onClick={completeOnboarding}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Start Trading
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-600"
                onClick={() => router.push('/learn')}
              >
                <Book className="w-4 h-4 mr-2" />
                Take Learning Tour First
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'profile':
        return onboardingData.firstName && onboardingData.lastName && onboardingData.email
      case 'experience':
        return onboardingData.experienceLevel && onboardingData.tradingGoals.length > 0
      case 'preferences':
        return onboardingData.preferredMarkets.length > 0
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Account Setup</h1>
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center space-y-1 ${
                  index <= currentStep ? 'text-cyan-400' : 'text-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-cyan-600' : 'bg-gray-700'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8">
              {renderStep()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


