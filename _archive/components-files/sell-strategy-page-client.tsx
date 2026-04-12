"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Upload, DollarSign, TrendingUp, Users, Award, Shield, Code, Image, FileText, BarChart3, CheckCircle, AlertCircle, Info, Star, Crown, Zap } from 'lucide-react'

const categories = [
  "Cryptocurrency", "Stocks", "Forex", "Options", "Futures", "Commodities", "ETFs"
]

const complexityLevels = [
  { value: "beginner", label: "Beginner", description: "Simple strategies, easy to understand" },
  { value: "intermediate", label: "Intermediate", description: "Moderate complexity, some experience needed" },
  { value: "advanced", label: "Advanced", description: "Complex strategies, significant experience required" },
  { value: "expert", label: "Expert", description: "Highly sophisticated, professional level" }
]

const timeframes = [
  "1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"
]

export default function SellStrategyPageClient() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    complexity: "",
    timeframe: "",
    price: "",
    tags: "",
    minCapital: "",
    backtestPeriod: "",
    winRate: "",
    sharpeRatio: "",
    maxDrawdown: "",
    totalReturn: "",
    profitFactor: "",
    avgTrade: "",
    includeCode: false,
    includeLiveResults: false,
    allowQuestions: true,
    offerSupport: false
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
              Sell Your Strategy
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Turn your trading expertise into income. Join thousands of successful strategy creators earning on NEXURAL.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Earn 70% Revenue</h3>
              <p className="text-sm text-gray-400">Keep 70% of every sale, we handle payments and delivery</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Global Audience</h3>
              <p className="text-sm text-gray-400">Reach 50,000+ active traders worldwide</p>
            </div>
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Full Protection</h3>
              <p className="text-sm text-gray-400">Your intellectual property is protected</p>
            </div>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-800" />
          
          <div className="flex justify-between mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`flex items-center ${step <= currentStep ? 'text-primary' : 'text-gray-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step <= currentStep ? 'border-primary bg-primary/20' : 'border-gray-600'
                }`}>
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step}</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Performance"}
                  {step === 3 && "Pricing & Files"}
                  {step === 4 && "Review & Submit"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form steps */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
                  <p className="text-gray-400 mb-6">Tell us about your trading strategy</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title" className="text-white">Strategy Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., BTC Momentum Master Pro"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-white">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your strategy, its approach, and what makes it unique..."
                      rows={4}
                      className="mt-2 bg-gray-800 border-gray-700 text-white resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="complexity" className="text-white">Complexity Level *</Label>
                    <Select value={formData.complexity} onValueChange={(value) => handleInputChange('complexity', value)}>
                      <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {complexityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <div className="font-medium">{level.label}</div>
                              <div className="text-xs text-gray-400">{level.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeframe" className="text-white">Primary Timeframe *</Label>
                    <Select value={formData.timeframe} onValueChange={(value) => handleInputChange('timeframe', value)}>
                      <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {timeframes.map((tf) => (
                          <SelectItem key={tf} value={tf}>
                            {tf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="minCapital" className="text-white">Minimum Capital Required</Label>
                    <Input
                      id="minCapital"
                      value={formData.minCapital}
                      onChange={(e) => handleInputChange('minCapital', e.target.value)}
                      placeholder="e.g., 10000"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="tags" className="text-white">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g., Bitcoin, Momentum, High-Frequency, Scalping"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Performance Metrics */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Performance Metrics</h2>
                  <p className="text-gray-400 mb-6">Provide your strategy's backtesting results</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-400 mb-1">Performance Data</h4>
                      <p className="text-sm text-blue-300">
                        Accurate performance metrics increase buyer confidence and sales. 
                        All data will be verified before listing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="backtestPeriod" className="text-white">Backtest Period *</Label>
                    <Input
                      id="backtestPeriod"
                      value={formData.backtestPeriod}
                      onChange={(e) => handleInputChange('backtestPeriod', e.target.value)}
                      placeholder="e.g., 2 years, 18 months"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="winRate" className="text-white">Win Rate (%) *</Label>
                    <Input
                      id="winRate"
                      value={formData.winRate}
                      onChange={(e) => handleInputChange('winRate', e.target.value)}
                      placeholder="e.g., 73.2"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalReturn" className="text-white">Total Return (%) *</Label>
                    <Input
                      id="totalReturn"
                      value={formData.totalReturn}
                      onChange={(e) => handleInputChange('totalReturn', e.target.value)}
                      placeholder="e.g., 284.7"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxDrawdown" className="text-white">Max Drawdown (%) *</Label>
                    <Input
                      id="maxDrawdown"
                      value={formData.maxDrawdown}
                      onChange={(e) => handleInputChange('maxDrawdown', e.target.value)}
                      placeholder="e.g., -8.5"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sharpeRatio" className="text-white">Sharpe Ratio</Label>
                    <Input
                      id="sharpeRatio"
                      value={formData.sharpeRatio}
                      onChange={(e) => handleInputChange('sharpeRatio', e.target.value)}
                      placeholder="e.g., 2.4"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profitFactor" className="text-white">Profit Factor</Label>
                    <Input
                      id="profitFactor"
                      value={formData.profitFactor}
                      onChange={(e) => handleInputChange('profitFactor', e.target.value)}
                      placeholder="e.g., 1.85"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="avgTrade" className="text-white">Average Trade Return (%)</Label>
                    <Input
                      id="avgTrade"
                      value={formData.avgTrade}
                      onChange={(e) => handleInputChange('avgTrade', e.target.value)}
                      placeholder="e.g., 2.3"
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Performance preview */}
                <div className="bg-gray-800/30 rounded-lg p-6 mt-6">
                  <h4 className="font-semibold text-white mb-4">Performance Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {formData.winRate || '--'}%
                      </div>
                      <div className="text-xs text-gray-500">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        +{formData.totalReturn || '--'}%
                      </div>
                      <div className="text-xs text-gray-500">Total Return</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">
                        {formData.maxDrawdown || '--'}%
                      </div>
                      <div className="text-xs text-gray-500">Max Drawdown</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {formData.sharpeRatio || '--'}
                      </div>
                      <div className="text-xs text-gray-500">Sharpe Ratio</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Pricing & Files */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Pricing & Files</h2>
                  <p className="text-gray-400 mb-6">Set your price and upload strategy files</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price" className="text-white">Strategy Price (USD) *</Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="price"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="299"
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      You'll earn 70% (${formData.price ? Math.round(parseFloat(formData.price) * 0.7) : 0})
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-white">What's Included</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Include Source Code</Label>
                        <p className="text-xs text-gray-500">Share your strategy's code</p>
                      </div>
                      <Switch
                        checked={formData.includeCode}
                        onCheckedChange={(checked) => handleInputChange('includeCode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Live Trading Results</Label>
                        <p className="text-xs text-gray-500">Include live performance data</p>
                      </div>
                      <Switch
                        checked={formData.includeLiveResults}
                        onCheckedChange={(checked) => handleInputChange('includeLiveResults', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Allow Questions</Label>
                        <p className="text-xs text-gray-500">Buyers can ask questions</p>
                      </div>
                      <Switch
                        checked={formData.allowQuestions}
                        onCheckedChange={(checked) => handleInputChange('allowQuestions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Offer Support</Label>
                        <p className="text-xs text-gray-500">Provide setup assistance</p>
                      </div>
                      <Switch
                        checked={formData.offerSupport}
                        onCheckedChange={(checked) => handleInputChange('offerSupport', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* File uploads */}
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Upload Files</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Code className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white mb-1">Strategy Code</p>
                      <p className="text-xs text-gray-500">Upload your strategy files</p>
                      <Button variant="outline" size="sm" className="mt-3 border-gray-600 text-gray-300">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white mb-1">Charts & Images</p>
                      <p className="text-xs text-gray-500">Performance charts, screenshots</p>
                      <Button variant="outline" size="sm" className="mt-3 border-gray-600 text-gray-300">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Images
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white mb-1">Documentation</p>
                      <p className="text-xs text-gray-500">Setup guide, manual</p>
                      <Button variant="outline" size="sm" className="mt-3 border-gray-600 text-gray-300">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Pricing suggestions */}
                <div className="bg-gray-800/30 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Pricing Suggestions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                      <Badge className="bg-green-500/20 text-green-400 mb-2">Beginner</Badge>
                      <div className="text-lg font-bold text-white">$49 - $149</div>
                      <p className="text-xs text-gray-500">Simple strategies</p>
                    </div>
                    <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                      <Badge className="bg-yellow-500/20 text-yellow-400 mb-2">Intermediate</Badge>
                      <div className="text-lg font-bold text-white">$149 - $299</div>
                      <p className="text-xs text-gray-500">Moderate complexity</p>
                    </div>
                    <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                      <Badge className="bg-red-500/20 text-red-400 mb-2">Advanced/Expert</Badge>
                      <div className="text-lg font-bold text-white">$299 - $999</div>
                      <p className="text-xs text-gray-500">Professional level</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Review & Submit</h2>
                  <p className="text-gray-400 mb-6">Review your strategy listing before submission</p>
                </div>

                {/* Strategy preview */}
                <div className="bg-gray-800/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">{formData.title || "Strategy Title"}</h3>
                  <p className="text-gray-300 mb-4">{formData.description || "Strategy description will appear here..."}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className="bg-primary/20 text-primary">{formData.category || "Category"}</Badge>
                    <Badge className={`${
                      formData.complexity === 'expert' ? 'bg-red-500/20 text-red-400' :
                      formData.complexity === 'advanced' ? 'bg-orange-500/20 text-orange-400' :
                      formData.complexity === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {formData.complexity || "Complexity"}
                    </Badge>
                    <span className="text-gray-400">Timeframe: {formData.timeframe || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{formData.winRate || '--'}%</div>
                      <div className="text-xs text-gray-500">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">+{formData.totalReturn || '--'}%</div>
                      <div className="text-xs text-gray-500">Total Return</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">{formData.maxDrawdown || '--'}%</div>
                      <div className="text-xs text-gray-500">Max Drawdown</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{formData.sharpeRatio || '--'}</div>
                      <div className="text-xs text-gray-500">Sharpe Ratio</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      ${formData.price || '0'}
                    </div>
                    <div className="text-sm text-gray-400">
                      You earn: ${formData.price ? Math.round(parseFloat(formData.price) * 0.7) : 0} (70%)
                    </div>
                  </div>
                </div>

                {/* Submission checklist */}
                <div className="bg-gray-800/30 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-4">Submission Checklist</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">Strategy information completed</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">Performance metrics provided</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">Pricing configured</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Files uploaded (optional)</span>
                    </div>
                  </div>
                </div>

                {/* Terms and conditions */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-400 mb-2">Review Process</h4>
                      <p className="text-sm text-blue-300 mb-3">
                        Your strategy will be reviewed within 24-48 hours. We verify performance claims 
                        and ensure quality standards before listing.
                      </p>
                      <ul className="text-sm text-blue-300 space-y-1">
                        <li>• Performance data verification</li>
                        <li>• Code quality review (if included)</li>
                        <li>• Documentation completeness</li>
                        <li>• Compliance with marketplace guidelines</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-800">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-gray-700 text-gray-300 disabled:opacity-50"
              >
                Previous
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" className="border-gray-700 text-gray-300">
                  Save Draft
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    className="bg-primary hover:bg-primary/90 text-black font-semibold"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button className="bg-primary hover:bg-primary/90 text-black font-semibold">
                    <Upload className="w-4 h-4 mr-2" />
                    Submit for Review
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Alex Chen", earnings: "$12,400", strategies: 8, avatar: "AC" },
              { name: "Sarah Johnson", earnings: "$8,900", strategies: 5, avatar: "SJ" },
              { name: "Mike Rodriguez", earnings: "$15,600", strategies: 12, avatar: "MR" }
            ].map((creator, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-green-400 rounded-full flex items-center justify-center text-black font-bold text-lg mx-auto mb-4">
                    {creator.avatar}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{creator.name}</h3>
                  <div className="text-2xl font-bold text-primary mb-1">{creator.earnings}</div>
                  <p className="text-sm text-gray-400">earned from {creator.strategies} strategies</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
