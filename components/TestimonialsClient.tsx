"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Star, 
  Quote, 
  TrendingUp, 
  Shield, 
  Users, 
  Award,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Filter,
  Calendar,
  MapPin,
  Briefcase,
  Globe
} from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Professional Day Trader",
    company: "Independent Trader",
    location: "New York, USA",
    avatar: "/testimonials/sarah.jpg",
    rating: 5,
    category: "Professional",
    date: "January 2024",
    text: "Nexural Trading completely transformed my trading approach. The AI signals are incredibly accurate, and I've seen a 340% improvement in my win rate. The backtesting suite helped me refine strategies that consistently outperform the market.",
    metrics: {
      improvement: "340% win rate increase",
      timeframe: "6 months",
      plan: "Pro"
    },
    featured: true
  },
  {
    id: 2,
    name: "Marcus Chen",
    role: "Quantitative Analyst",
    company: "Hedge Fund Manager",
    location: "Singapore",
    avatar: "/testimonials/marcus.jpg",
    rating: 5,
    category: "Professional",
    date: "December 2023",
    text: "As someone who's built trading algorithms for years, I'm impressed by Nexural's sophistication. The API integration was seamless, and our fund has integrated their signals into our core strategy. Results speak for themselves - 23% alpha generation.",
    metrics: {
      improvement: "23% alpha generation",
      timeframe: "12 months",
      plan: "Enterprise"
    },
    featured: true
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Portfolio Manager",
    company: "Investment Firm",
    location: "London, UK",
    avatar: "/testimonials/emma.jpg",
    rating: 5,
    category: "Institutional",
    date: "November 2023",
    text: "The risk management tools are exceptional. We've reduced our maximum drawdown by 45% while maintaining strong returns. The compliance features make it perfect for institutional use.",
    metrics: {
      improvement: "45% reduced drawdown",
      timeframe: "8 months",
      plan: "Enterprise"
    },
    featured: true
  },
  {
    id: 4,
    name: "David Kim",
    role: "Retail Trader",
    company: "Part-time Trader",
    location: "Toronto, Canada",
    avatar: "/testimonials/david.jpg",
    rating: 5,
    category: "Retail",
    date: "January 2024",
    text: "I started as a complete beginner, and Nexural's educational resources and automated signals helped me become profitable within 3 months. The community is incredibly supportive.",
    metrics: {
      improvement: "Profitable in 3 months",
      timeframe: "6 months",
      plan: "Pro"
    }
  },
  {
    id: 5,
    name: "Lisa Thompson",
    role: "Financial Advisor",
    company: "Wealth Management",
    location: "Sydney, Australia",
    avatar: "/testimonials/lisa.jpg",
    rating: 5,
    category: "Advisory",
    date: "October 2023",
    text: "Our clients love the transparency and performance. We've integrated Nexural's strategies into our managed portfolios, delivering consistent 18% annual returns with lower volatility.",
    metrics: {
      improvement: "18% annual returns",
      timeframe: "14 months",
      plan: "Enterprise"
    }
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Software Engineer",
    company: "Tech Startup",
    location: "San Francisco, USA",
    avatar: "/testimonials/james.jpg",
    rating: 5,
    category: "Technical",
    date: "December 2023",
    text: "The API is beautifully designed and well-documented. I built a custom trading bot in just 2 days. The webhook system keeps everything real-time and responsive.",
    metrics: {
      improvement: "Custom bot in 2 days",
      timeframe: "4 months",
      plan: "Pro"
    }
  },
  {
    id: 7,
    name: "Maria Santos",
    role: "Investment Banker",
    company: "Global Bank",
    location: "Madrid, Spain",
    avatar: "/testimonials/maria.jpg",
    rating: 5,
    category: "Banking",
    date: "September 2023",
    text: "Nexural's institutional features are outstanding. The compliance reporting, audit trails, and multi-user management make it perfect for our trading desk operations.",
    metrics: {
      improvement: "Full compliance integration",
      timeframe: "10 months",
      plan: "Enterprise"
    }
  },
  {
    id: 8,
    name: "Robert Chang",
    role: "Crypto Trader",
    company: "Digital Asset Fund",
    location: "Hong Kong",
    avatar: "/testimonials/robert.jpg",
    rating: 5,
    category: "Crypto",
    date: "January 2024",
    text: "The cryptocurrency signals are phenomenal. In volatile crypto markets, having AI-powered insights is crucial. We've outperformed Bitcoin by 150% using their strategies.",
    metrics: {
      improvement: "150% over Bitcoin",
      timeframe: "9 months",
      plan: "Pro"
    }
  }
]

const stats = [
  { label: "Active Traders", value: "25,000+", icon: Users },
  { label: "Average Win Rate", value: "73.2%", icon: Target },
  { label: "Total Volume", value: "$2.8B", icon: BarChart3 },
  { label: "Customer Satisfaction", value: "4.9/5", icon: Star }
]

const categories = ["All", "Professional", "Institutional", "Retail", "Advisory", "Technical", "Banking", "Crypto"]

export default function TestimonialsClient() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showAll, setShowAll] = useState(false)

  const filteredTestimonials = testimonials.filter(testimonial => 
    selectedCategory === "All" || testimonial.category === selectedCategory
  )

  const displayedTestimonials = showAll ? filteredTestimonials : filteredTestimonials.slice(0, 6)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-cyan-600">Customer Success Stories</Badge>
          <h1 className="text-5xl font-bold mb-6">
            Trusted by <span className="text-cyan-400">Thousands</span> of Traders
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See how our AI-powered trading platform is helping traders, institutions, and financial professionals 
            achieve exceptional results and transform their trading performance.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700 text-center">
              <CardContent className="p-6">
                <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold">Customer Testimonials</h2>
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-gray-900 border-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.filter(t => t.featured).map((testimonial) => (
            <Card key={testimonial.id} className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 border-cyan-700/50 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-amber-600">Featured</Badge>
              </div>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                    <p className="text-cyan-400 text-sm">{testimonial.role}</p>
                    <p className="text-gray-400 text-xs">{testimonial.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500 text-xs">{testimonial.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-current' : 'text-gray-600'}`} />
                  ))}
                  <span className="text-gray-400 text-sm ml-2">{testimonial.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-1 w-6 h-6 text-cyan-400/30" />
                  <p className="text-gray-300 italic pl-6">{testimonial.text}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Improvement</span>
                    <span className="font-semibold text-green-400">{testimonial.metrics.improvement}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Timeframe</span>
                    <span className="font-semibold">{testimonial.metrics.timeframe}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Plan</span>
                    <Badge className="bg-cyan-600">{testimonial.metrics.plan}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {displayedTestimonials.filter(t => !t.featured).map((testimonial) => (
            <Card key={testimonial.id} className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-cyan-400 text-sm">{testimonial.role}</p>
                    <p className="text-gray-400 text-xs">{testimonial.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500 text-xs">{testimonial.location}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-current' : 'text-gray-600'}`} />
                  ))}
                  <span className="text-gray-400 text-sm ml-2">{testimonial.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Quote className="absolute -top-2 -left-1 w-5 h-5 text-cyan-400/30" />
                  <p className="text-gray-300 pl-4">{testimonial.text}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400 font-semibold">{testimonial.metrics.improvement}</span>
                  <span className="text-gray-400">{testimonial.metrics.timeframe}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {!showAll && filteredTestimonials.length > 6 && (
          <div className="text-center mb-16">
            <Button 
              onClick={() => setShowAll(true)} 
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              View All Testimonials
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Success Metrics */}
        <Card className="bg-gradient-to-r from-green-900/20 to-cyan-900/20 border-cyan-700 mb-16">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Proven Results Across All Markets</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our customers consistently outperform traditional trading methods with AI-powered insights and automation
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">73.2%</div>
                <div className="text-gray-400">Average Win Rate</div>
                <div className="text-sm text-gray-500 mt-1">Across all customer portfolios</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-2">-35%</div>
                <div className="text-gray-400">Reduced Drawdown</div>
                <div className="text-sm text-gray-500 mt-1">Better risk management</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-400 mb-2">3 months</div>
                <div className="text-gray-400">Average to Profitability</div>
                <div className="text-sm text-gray-500 mt-1">For new traders</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-700">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Join Our Success Stories?</h2>
              <p className="text-xl text-gray-400 mb-6">
                Start your journey to consistent trading profits with our AI-powered platform
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-gray-600">
                  Schedule Demo
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Cancel anytime
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


