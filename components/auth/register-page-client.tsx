'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, ArrowLeft, Mail, User, Shield, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPageClient() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    experience: '',
    tradingGoals: '',
    riskTolerance: '',
    agreeTerms: false,
    agreeMarketing: false
  })

  const progress = (step / 4) * 100

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] bg-clip-text text-transparent mb-4">
            Join NEXURAL Trading
          </h1>
          <p className="text-gray-400">Create your account in just a few steps</p>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span className={step >= 1 ? 'text-[#B8FF00]' : ''}>Account</span>
            <span className={step >= 2 ? 'text-[#B8FF00]' : ''}>Personal</span>
            <span className={step >= 3 ? 'text-[#B8FF00]' : ''}>Trading</span>
            <span className={step >= 4 ? 'text-[#B8FF00]' : ''}>Verify</span>
          </div>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Mail className="w-12 h-12 text-[#B8FF00] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Account Information</h2>
                  <p className="text-gray-400">Set up your login credentials</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="w-12 h-12 text-[#B8FF00] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Personal Details</h2>
                  <p className="text-gray-400">Tell us about yourself</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="sg">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CreditCard className="w-12 h-12 text-[#B8FF00] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Trading Profile</h2>
                  <p className="text-gray-400">Help us customize your experience</p>
                </div>
                
                <div>
                  <Label htmlFor="experience">Trading Experience</Label>
                  <Select value={formData.experience} onValueChange={(value) => setFormData({...formData, experience: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                      <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tradingGoals">Primary Trading Goals</Label>
                  <Select value={formData.tradingGoals} onValueChange={(value) => setFormData({...formData, tradingGoals: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="What are your main goals?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Generate Regular Income</SelectItem>
                      <SelectItem value="growth">Long-term Wealth Growth</SelectItem>
                      <SelectItem value="learning">Learn Quantitative Trading</SelectItem>
                      <SelectItem value="diversification">Portfolio Diversification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select value={formData.riskTolerance} onValueChange={(value) => setFormData({...formData, riskTolerance: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="How much risk are you comfortable with?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="very-aggressive">Very Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Shield className="w-12 h-12 text-[#B8FF00] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">Almost Done!</h2>
                  <p className="text-gray-400">Review and confirm your registration</p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
                  <p><span className="text-gray-400">Email:</span> {formData.email}</p>
                  <p><span className="text-gray-400">Name:</span> {formData.firstName} {formData.lastName}</p>
                  <p><span className="text-gray-400">Country:</span> {formData.country}</p>
                  <p><span className="text-gray-400">Experience:</span> {formData.experience}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the <Link href="/legal" className="text-[#B8FF00] hover:underline">Terms of Service</Link> and <Link href="/legal" className="text-[#B8FF00] hover:underline">Privacy Policy</Link>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="marketing" 
                      checked={formData.agreeMarketing}
                      onCheckedChange={(checked) => setFormData({...formData, agreeMarketing: checked as boolean})}
                    />
                    <Label htmlFor="marketing" className="text-sm">
                      I want to receive trading insights and platform updates
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={prevStep} className="border-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {step < 4 ? (
                <Button onClick={nextStep} className="ml-auto bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  className="ml-auto bg-gradient-to-r from-[#B8FF00] to-[#00D4FF] text-black"
                  disabled={!formData.agreeTerms}
                >
                  Create Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-[#B8FF00] hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
