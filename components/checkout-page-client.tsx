"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Check, CreditCard, Shield, Lock, Star, ArrowRight, ArrowLeft, CheckCircle, Users, Zap, TrendingUp, Bot, BarChart3, Globe, Phone, Mail, MapPin } from 'lucide-react'

interface PlanFeature {
  name: string
  included: boolean
  highlight?: boolean
}

interface Plan {
  id: string
  name: string
  price: number
  yearlyPrice: number
  description: string
  features: PlanFeature[]
  popular?: boolean
  color: string
  icon: React.ElementType
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free Community",
    price: 0,
    yearlyPrice: 0,
    description: "Perfect for getting started with algorithmic trading",
    color: "from-gray-600 to-gray-800",
    icon: Users,
    features: [
      { name: "Discord Community Access", included: true, highlight: true },
      { name: "Basic Educational Content", included: true },
      { name: "Paper Trading Simulator", included: true },
      { name: "Basic Market Data", included: true },
      { name: "Community Forums", included: true },
      { name: "Live Trading Signals", included: false },
      { name: "Advanced Analytics", included: false },
      { name: "Custom Bot Development", included: false },
      { name: "Priority Support", included: false },
    ]
  },
  {
    id: "pro",
    name: "Pro Signals",
    price: 55,
    yearlyPrice: 45,
    description: "Advanced signals and analytics for serious traders",
    popular: true,
    color: "from-primary to-green-400",
    icon: TrendingUp,
    features: [
      { name: "Everything in Free", included: true },
      { name: "Live Trading Signals", included: true, highlight: true },
      { name: "Advanced Technical Analysis", included: true, highlight: true },
      { name: "Real-time Market Data", included: true },
      { name: "Performance Analytics", included: true },
      { name: "Risk Management Tools", included: true },
      { name: "Mobile App Access", included: true },
      { name: "Email & SMS Alerts", included: true },
      { name: "Custom Bot Development", included: false },
      { name: "White-label Solutions", included: false },
    ]
  },
  {
    id: "automation",
    name: "Full Automation",
    price: 300,
    yearlyPrice: 250,
    description: "Complete automation suite for professional traders",
    color: "from-purple-600 to-blue-600",
    icon: Bot,
    features: [
      { name: "Everything in Pro", included: true },
      { name: "Custom Bot Development", included: true, highlight: true },
      { name: "Automated Trading Execution", included: true, highlight: true },
      { name: "Advanced Backtesting", included: true, highlight: true },
      { name: "Portfolio Management", included: true },
      { name: "API Access", included: true },
      { name: "White-label Solutions", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "Custom Integrations", included: true },
      { name: "Priority Support (24/7)", included: true },
    ]
  }
]

export default function CheckoutPageClient() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<string>("pro")
  const [isYearly, setIsYearly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US"
    }
  })

  useEffect(() => {
    const planFromUrl = searchParams.get("plan")
    if (planFromUrl && plans.find(p => p.id === planFromUrl)) {
      setSelectedPlan(planFromUrl)
    }
  }, [searchParams])

  const currentPlan = plans.find(p => p.id === selectedPlan) || plans[1]
  const currentPrice = isYearly ? currentPlan.yearlyPrice : currentPlan.price
  const savings = currentPlan.price > 0 ? Math.round(((currentPlan.price - currentPlan.yearlyPrice) / currentPlan.price) * 100) : 0

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("billing.")) {
      const billingField = field.split(".")[1]
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [billingField]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value)
    handleInputChange("cardNumber", formatted)
  }

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value)
    handleInputChange("expiryDate", formatted)
  }

  const handleNextStep = async () => {
    if (currentStep === 2 && selectedPlan !== "free") {
      setIsLoading(true)
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsLoading(false)
    }
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const steps = [
    { number: 1, title: "Choose Plan", description: "Select your subscription" },
    { number: 2, title: "Payment", description: "Complete your order" },
    { number: 3, title: "Success", description: "Welcome aboard!" }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,136,0.03)_0%,transparent_50%)]" />
      
      {/* Floating Particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 pt-32 md:pt-40"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-green-400 to-blue-400 bg-clip-text text-transparent">
            Complete Your Order
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of successful traders today
          </p>

          {/* Progress Steps */}
          <div className="flex justify-center items-center mt-12 space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-300 ${
                      currentStep >= step.number
                        ? "bg-primary text-black border-primary"
                        : "bg-gray-800 text-gray-400 border-gray-600"
                    }`}
                  >
                    {currentStep > step.number ? <Check className="w-6 h-6" /> : step.number}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-white">{step.title}</div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > step.number ? "bg-primary" : "bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Plan Selection */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        Choose Your Plan
                      </CardTitle>
                      <div className="flex items-center justify-between mt-6">
                        <span className="text-gray-400">Billing Cycle</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${!isYearly ? "text-primary" : "text-gray-400"}`}>Monthly</span>
                          <Switch
                            checked={isYearly}
                            onCheckedChange={setIsYearly}
                            className="data-[state=checked]:bg-primary"
                          />
                          <span className={`text-sm ${isYearly ? "text-primary" : "text-gray-400"}`}>
                            Yearly <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary">Save 17%</Badge>
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {plans.map((plan) => {
                        const PlanIcon = plan.icon
                        const planPrice = isYearly ? plan.yearlyPrice : plan.price
                        const isSelected = selectedPlan === plan.id
                        
                        return (
                          <motion.div
                            key={plan.id}
                            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                : "border-gray-700 bg-gray-800/50 hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedPlan(plan.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {plan.popular && (
                              <Badge className="absolute -top-3 left-6 bg-primary text-black font-bold">
                                Most Popular
                              </Badge>
                            )}
                            
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                                  <PlanIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                  <p className="text-gray-400 text-sm">{plan.description}</p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-2xl font-bold text-white">
                                  {planPrice === 0 ? "Free" : `$${planPrice}`}
                                  {planPrice > 0 && <span className="text-sm text-gray-400 font-normal">/month</span>}
                                </div>
                                {isYearly && plan.price > 0 && (
                                  <div className="text-sm text-gray-400 line-through">${plan.price}/month</div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              {plan.features.slice(0, 4).map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  {feature.included ? (
                                    <Check className="w-4 h-4 text-primary" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-gray-600" />
                                  )}
                                  <span className={`text-sm ${feature.included ? "text-white" : "text-gray-500"}`}>
                                    {feature.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Payment Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-6">
                    {/* Account Information */}
                    <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                          <Users className="w-6 h-6 text-primary" />
                          Account Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                              placeholder="John"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="company" className="text-gray-300">Company (Optional)</Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) => handleInputChange("company", e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                              placeholder="Your Company"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Payment Information - Only show for paid plans */}
                    {selectedPlan !== "free" && (
                      <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-primary" />
                            Payment Information
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Shield className="w-4 h-4" />
                            Your payment information is secure and encrypted
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="cardNumber" className="text-gray-300">Card Number</Label>
                            <Input
                              id="cardNumber"
                              value={formData.cardNumber}
                              onChange={(e) => handleCardNumberChange(e.target.value)}
                              className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiryDate" className="text-gray-300">Expiry Date</Label>
                              <Input
                                id="expiryDate"
                                value={formData.expiryDate}
                                onChange={(e) => handleExpiryChange(e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                                placeholder="MM/YY"
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv" className="text-gray-300">CVV</Label>
                              <Input
                                id="cvv"
                                value={formData.cvv}
                                onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                                className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                                placeholder="123"
                                maxLength={4}
                              />
                            </div>
                          </div>

                          <Separator className="bg-gray-700" />

                          <div className="space-y-4">
                            <h4 className="font-semibold text-white">Billing Address</h4>
                            <div>
                              <Label htmlFor="street" className="text-gray-300">Street Address</Label>
                              <Input
                                id="street"
                                value={formData.billingAddress.street}
                                onChange={(e) => handleInputChange("billing.street", e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                                placeholder="123 Main Street"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="city" className="text-gray-300">City</Label>
                                <Input
                                  id="city"
                                  value={formData.billingAddress.city}
                                  onChange={(e) => handleInputChange("billing.city", e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                                  placeholder="New York"
                                />
                              </div>
                              <div>
                                <Label htmlFor="state" className="text-gray-300">State</Label>
                                <Input
                                  id="state"
                                  value={formData.billingAddress.state}
                                  onChange={(e) => handleInputChange("billing.state", e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                                  placeholder="NY"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="zipCode" className="text-gray-300">ZIP Code</Label>
                                <Input
                                  id="zipCode"
                                  value={formData.billingAddress.zipCode}
                                  onChange={(e) => handleInputChange("billing.zipCode", e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                                  placeholder="10001"
                                />
                              </div>
                              <div>
                                <Label htmlFor="country" className="text-gray-300">Country</Label>
                                <Input
                                  id="country"
                                  value={formData.billingAddress.country}
                                  onChange={(e) => handleInputChange("billing.country", e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white focus:border-primary"
                                  placeholder="United States"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Success */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm text-center">
                    <CardContent className="py-12">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
                      </motion.div>
                      
                      <h2 className="text-3xl font-bold text-white mb-4">Welcome to NEXURAL!</h2>
                      <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        {selectedPlan === "free" 
                          ? "You've successfully joined our community! Check your email for next steps."
                          : "Your payment has been processed successfully. Welcome to the future of trading!"
                        }
                      </p>

                      <div className="space-y-4">
                        <Button 
                          size="lg" 
                          className="bg-primary hover:bg-primary/90 text-black font-semibold w-full max-w-sm"
                        >
                          {selectedPlan === "free" ? "Join Discord Community" : "Access Dashboard"}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        
                        {selectedPlan !== "free" && (
                          <div className="text-sm text-gray-400">
                            <p>📧 Confirmation email sent to {formData.email}</p>
                            <p>🎯 Your account will be activated within 5 minutes</p>
                            <p>💬 Join our Discord for immediate support</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep < 3 && (
              <motion.div
                className="flex justify-between mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="border-gray-600 text-gray-300 hover:border-primary hover:text-primary"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-black font-semibold min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : currentStep === 2 ? (
                    selectedPlan === "free" ? "Create Account" : "Complete Order"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Selected Plan */}
                  <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${currentPlan.color} flex items-center justify-center`}>
                      <currentPlan.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{currentPlan.name}</h3>
                      <p className="text-sm text-gray-400">{isYearly ? "Yearly" : "Monthly"} billing</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {currentPrice === 0 ? "Free" : `$${currentPrice}`}
                        {currentPrice > 0 && <span className="text-sm text-gray-400">/mo</span>}
                      </div>
                      {isYearly && currentPlan.price > 0 && (
                        <div className="text-xs text-gray-400 line-through">${currentPlan.price}/mo</div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  {currentPrice > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-300">
                        <span>Subtotal</span>
                        <span>${currentPrice}/month</span>
                      </div>
                      {isYearly && (
                        <div className="flex justify-between text-primary">
                          <span>Yearly Discount ({savings}%)</span>
                          <span>-${currentPlan.price - currentPlan.yearlyPrice}/month</span>
                        </div>
                      )}
                      <Separator className="bg-gray-700" />
                      <div className="flex justify-between text-lg font-bold text-white">
                        <span>Total</span>
                        <span>${currentPrice}/month</span>
                      </div>
                      {isYearly && (
                        <div className="text-sm text-gray-400 text-center">
                          Billed ${currentPrice * 12} annually
                        </div>
                      )}
                    </div>
                  )}

                  {/* Features List */}
                  <div>
                    <h4 className="font-semibold text-white mb-3">What's included:</h4>
                    <div className="space-y-2">
                      {currentPlan.features.filter(f => f.included).slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className={`text-sm ${feature.highlight ? "text-primary font-medium" : "text-gray-300"}`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                      {currentPlan.features.filter(f => f.included).length > 6 && (
                        <div className="text-sm text-gray-400 mt-2">
                          +{currentPlan.features.filter(f => f.included).length - 6} more features
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="space-y-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>30-day money-back guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Lock className="w-4 h-4 text-primary" />
                      <span>SSL encrypted & secure</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Instant account activation</span>
                    </div>
                  </div>

                  {/* Customer Support */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Need Help?</h4>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>support@nexural.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>24/7 Live Chat</span>
                      </div>
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-400">
                      Trusted by <span className="text-primary font-semibold">150,000+</span> traders worldwide
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
