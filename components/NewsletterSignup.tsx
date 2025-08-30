'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Send, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface NewsletterFormData {
  email: string
  name: string
  interests?: string[]
}

export default function NewsletterSignup() {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: '',
    name: '',
    interests: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const interestOptions = [
    'AI Trading Signals',
    'Market Analysis',
    'Risk Management',
    'Cryptocurrency',
    'Forex Trading',
    'Stock Trading',
    'Technical Analysis',
    'Platform Updates'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('Name is required')
      return false
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Valid email is required')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    
    if (!validateForm()) {
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          source: 'website',
          interests: formData.interests
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        setFormData({ email: '', name: '', interests: [] })
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Nexural Insights Newsletter
        </CardTitle>
        <CardDescription>
          Get weekly AI-powered trading intelligence delivered to your inbox. Join 10,000+ traders.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-3">
              What interests you most? (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  disabled={isSubmitting}
                  className={`
                    text-sm px-3 py-2 rounded-md border transition-all
                    ${formData.interests?.includes(interest)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              What you'll receive:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Weekly market analysis from our AI system</li>
              <li>• Exclusive trading strategies and tips</li>
              <li>• Platform updates and new feature announcements</li>
              <li>• Educational content to improve your trading</li>
            </ul>
          </div>
          
          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{errorMessage}</span>
            </div>
          )}
          
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700 text-sm">
                🎉 Welcome to Nexural Insights! Check your email for confirmation. 
                Your first newsletter arrives this Friday.
              </span>
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Subscribing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Subscribe to Nexural Insights
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            We respect your privacy. No spam, unsubscribe anytime. 
            <a href="/privacy" className="text-blue-500 hover:underline ml-1">Privacy Policy</a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

