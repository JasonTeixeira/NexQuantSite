"use client"

import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, Zap, Globe, Headphones, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const departmentInfo = {
  technical: {
    name: 'Technical Support',
    description: 'Platform issues, trading problems, account access',
    responseTime: '< 2 hours',
    availability: '24/7',
    icon: Headphones,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-700'
  },
  sales: {
    name: 'Sales & Partnerships',
    description: 'New accounts, enterprise solutions, partnerships',
    responseTime: '< 4 hours',
    availability: 'Business hours',
    icon: Users,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-700'
  },
  general: {
    name: 'General Inquiries',
    description: 'Questions about our platform and services',
    responseTime: '< 24 hours',
    availability: 'Business hours',
    icon: MessageSquare,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-700'
  },
  billing: {
    name: 'Billing & Accounts',
    description: 'Subscription issues, billing questions, refunds',
    responseTime: '< 6 hours',
    availability: 'Business hours',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-700'
  },
  urgent: {
    name: 'Urgent Issues',
    description: 'Critical platform issues, security concerns',
    responseTime: '< 30 minutes',
    availability: '24/7',
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-700'
  },
  media: {
    name: 'Media & Press',
    description: 'Press inquiries, media requests, PR',
    responseTime: '< 12 hours',
    availability: 'Business hours',
    icon: Globe,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/20',
    borderColor: 'border-cyan-700'
  }
}

export default function EnhancedContactClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errors, setErrors] = useState<FormErrors>({})
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    priority: "normal",
    department: "",
    phone: "",
    timezone: "",
    preferredContact: "email"
  })

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        break
      case "email":
        if (!value.trim()) return "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email"
        break
      case "subject":
        if (!value.trim()) return "Subject is required"
        if (value.trim().length < 5) return "Subject must be at least 5 characters"
        break
      case "message":
        if (!value.trim()) return "Message is required"
        if (value.trim().length < 20) return "Message must be at least 20 characters"
        break
    }
    return undefined
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'department') {
      setSelectedDepartment(value)
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    const error = validateField(name, value)
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    newErrors.name = validateField("name", formData.name)
    newErrors.email = validateField("email", formData.email)
    newErrors.subject = validateField("subject", formData.subject)
    newErrors.message = validateField("message", formData.message)

    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key as keyof FormErrors]) {
        delete newErrors[key as keyof FormErrors]
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSubmitStatus("success")

      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
        priority: "normal",
        department: "",
        phone: "",
        timezone: "",
        preferredContact: "email"
      })
      setSelectedDepartment('')
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentDepartmentInfo = () => {
    return departmentInfo[selectedDepartment as keyof typeof departmentInfo] || null
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-purple-400">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions? Need support? Our expert team is here to help you succeed with algorithmic trading.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Form */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  {submitStatus === "success" ? (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                      <p className="text-gray-400 mb-6">
                        Thank you for contacting us. We'll get back to you within {getCurrentDepartmentInfo()?.responseTime || '24 hours'}.
                      </p>
                      <Button onClick={() => setSubmitStatus("idle")}>
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Department Selection */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(departmentInfo).map(([key, dept]) => (
                          <motion.button
                            key={key}
                            type="button"
                            onClick={() => handleInputChange('department', key)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                              selectedDepartment === key 
                                ? `${dept.borderColor} ${dept.bgColor}` 
                                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <dept.icon className={`w-6 h-6 mb-2 ${selectedDepartment === key ? dept.color : 'text-gray-400'}`} />
                            <div className="text-sm font-medium mb-1">{dept.name}</div>
                            <div className="text-xs text-gray-400">{dept.responseTime}</div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Selected Department Info */}
                      {getCurrentDepartmentInfo() && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={`p-4 rounded-lg ${getCurrentDepartmentInfo()!.bgColor} ${getCurrentDepartmentInfo()!.borderColor} border`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {React.createElement(getCurrentDepartmentInfo()!.icon, { 
                              className: `w-5 h-5 ${getCurrentDepartmentInfo()!.color}` 
                            })}
                            <h4 className="font-medium">{getCurrentDepartmentInfo()!.name}</h4>
                          </div>
                          <p className="text-sm text-gray-300">{getCurrentDepartmentInfo()!.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-400">
                            <span>Response: {getCurrentDepartmentInfo()!.responseTime}</span>
                            <span>Available: {getCurrentDepartmentInfo()!.availability}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Form Fields */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`bg-gray-800 border-gray-600 ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Your full name"
                          />
                          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`bg-gray-800 border-gray-600 ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="your.email@example.com"
                          />
                          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                          id="company"
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="bg-gray-800 border-gray-600"
                          placeholder="Your company name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          type="text"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          className={`bg-gray-800 border-gray-600 ${errors.subject ? 'border-red-500' : ''}`}
                          placeholder="Brief description of your inquiry"
                        />
                        {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low Priority</SelectItem>
                              <SelectItem value="normal">Normal Priority</SelectItem>
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                          <Select value={formData.preferredContact} onValueChange={(value) => handleInputChange('preferredContact', value)}>
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="either">Either</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          className={`bg-gray-800 border-gray-600 min-h-[120px] ${errors.message ? 'border-red-500' : ''}`}
                          placeholder="Please provide as much detail as possible about your inquiry..."
                        />
                        {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>

                      {submitStatus === "error" && (
                        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
                          <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400">Failed to send message. Please try again.</p>
                        </div>
                      )}
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information & Options */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Direct Contact */}
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Direct Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-400">support@nexural.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Phone className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-gray-400">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-gray-400">
                        123 Trading St.<br />
                        Financial District, NY 10004
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Clock className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-gray-400">
                        Mon-Fri: 9:00 AM - 6:00 PM EST<br />
                        Weekend: Emergency support only
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Options */}
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Other Support Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Live Chat
                    <Badge className="ml-auto bg-green-500">Online</Badge>
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Community Forum
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Knowledge Base
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Support Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">&lt; 2hrs</div>
                    <div className="text-sm text-gray-400">Avg Response</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">98%</div>
                    <div className="text-sm text-gray-400">Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">24/7</div>
                    <div className="text-sm text-gray-400">Urgent Support</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">50K+</div>
                    <div className="text-sm text-gray-400">Users Helped</div>
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
