"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  Phone, 
  Mail,
  Clock,
  TrendingUp,
  Settings,
  CreditCard,
  Shield,
  AlertCircle,
  Play,
  Brain,
  Code,
  Users,
  Star,
  ArrowRight,
  ExternalLink,
  Download,
  Video,
  FileText,
  Zap,
  ChevronRight,
  Lightbulb,
  Target,
  Award,
  HelpCircle,
  MessageSquare,
  Headphones,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { useAuth } from "@/lib/auth/auth-context"
import { 
  HELP_CATEGORIES, 
  FAQ_ITEMS, 
  searchKnowledgeBase, 
  getPopularArticles, 
  getRecentArticles,
  getHelpCenterStats,
  SearchResult
} from "@/lib/help-center/knowledge-base"

const iconMap: Record<string, any> = {
  Play,
  TrendingUp,
  Settings,
  Brain,
  Code,
  CreditCard,
  Shield,
  AlertCircle
}

export default function HelpCenterClient() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const userAccessLevel = user ? (user.role === 'admin' ? 'admin' : user.subscription === 'free' ? 'user' : 'premium') : 'public'
  const stats = getHelpCenterStats()
  const popularArticles = getPopularArticles(5, userAccessLevel)
  const recentArticles = getRecentArticles(3, userAccessLevel)

  // Handle search with debounce
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true)
      const timeoutId = setTimeout(() => {
        const results = searchKnowledgeBase(searchQuery, userAccessLevel)
        setSearchResults(results)
        setShowSearchResults(true)
        setIsSearching(false)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } else {
      setShowSearchResults(false)
      setSearchResults([])
    }
  }, [searchQuery, userAccessLevel])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length > 2) {
      const results = searchKnowledgeBase(searchQuery, userAccessLevel)
      setSearchResults(results)
      setShowSearchResults(true)
    }
  }

  const supportChannels = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      availability: "24/7",
      responseTime: "< 2 min",
      action: "Start Chat",
      color: "green",
      available: true
    },
    {
      title: "Email Support", 
      description: "Send us a detailed message",
      icon: Mail,
      availability: "24/7",
      responseTime: "< 4 hours",
      action: "Send Email",
      color: "blue",
      available: true
    },
    {
      title: "Video Call",
      description: "Schedule a screen share session",
      icon: Video,
      availability: "Mon-Fri 9AM-6PM",
      responseTime: "Same day",
      action: "Schedule Call",
      color: "purple", 
      available: user?.subscription !== 'free'
    },
    {
      title: "Priority Support",
      description: "Premium support line",
      icon: Phone,
      availability: "24/7",
      responseTime: "Immediate",
      action: "Call Now",
      color: "yellow",
      available: user?.subscription === 'pro' || user?.subscription === 'enterprise'
    }
  ]

  const quickActions = [
    { title: "Create Support Ticket", icon: MessageSquare, href: "/help/contact" },
    { title: "Check Service Status", icon: Globe, href: "/status" },
    { title: "Download Platform", icon: Download, href: "/download" },
    { title: "API Documentation", icon: Code, href: "/help/api" },
    { title: "Video Tutorials", icon: Video, href: "/help/tutorials" },
    { title: "Community Forum", icon: Users, href: "/community" }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900/50 via-black to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-5xl font-bold text-white">Help Center</h1>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Find answers to your questions, browse our comprehensive knowledge base, 
              or get personalized support from our expert team.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for help articles, FAQs, or topics..."
                    className="w-full pl-12 pr-4 py-4 text-lg bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-primary rounded-xl"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </form>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                >
                  {searchResults.slice(0, 8).map((result) => (
                    <Link
                      key={result.id}
                      href={result.url}
                      className="block p-4 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          result.type === 'article' ? 'bg-blue-500/20 text-blue-400' :
                          result.type === 'faq' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {result.type === 'article' ? <FileText className="w-4 h-4" /> :
                           result.type === 'faq' ? <HelpCircle className="w-4 h-4" /> :
                           <BookOpen className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{result.title}</h4>
                          <p className="text-gray-400 text-sm line-clamp-2">{result.excerpt}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {result.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              {result.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {searchResults.length > 8 && (
                    <div className="p-4 text-center border-t border-gray-800">
                      <Link 
                        href={`/help/search?q=${encodeURIComponent(searchQuery)}`}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        View all {searchResults.length} results →
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{stats.totalArticles} Articles</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>{stats.totalFAQs} FAQs</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{stats.avgRating}/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Avg 2min response</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-center text-white mb-8">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, index) => (
                <Link key={action.title} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="group"
                  >
                    <Card className="h-full bg-gray-900/50 border-gray-700 hover:border-primary/50 transition-all duration-300 group-hover:bg-gray-800/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors">
                          <action.icon className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm text-white group-hover:text-primary transition-colors">
                          {action.title}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Help Categories */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Browse by Category</h2>
                  <Link href="/help/categories" className="text-primary hover:text-primary/80 flex items-center gap-2">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {HELP_CATEGORIES.slice(0, 6).map((category, index) => {
                    const Icon = iconMap[category.icon] || BookOpen
                    return (
                      <Link key={category.id} href={`/help/category/${category.slug}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          className="group"
                        >
                          <Card className="h-full bg-gray-900/50 border-gray-700 hover:border-primary/50 transition-all duration-300 group-hover:bg-gray-800/50">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full bg-${category.color}-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-${category.color}-500/30 transition-colors`}>
                                  <Icon className={`w-6 h-6 text-${category.color}-400`} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                                    {category.name}
                                  </h3>
                                  <p className="text-gray-400 mb-4 leading-relaxed">
                                    {category.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                                      {category.articleCount} articles
                                    </Badge>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Support Channels */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Headphones className="w-5 h-5" />
                      Get Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {supportChannels.map((channel, index) => (
                      <div 
                        key={channel.title} 
                        className={`p-4 rounded-lg border transition-all ${
                          channel.available 
                            ? 'border-gray-700 hover:border-primary/50 cursor-pointer' 
                            : 'border-gray-800 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            channel.available 
                              ? `bg-${channel.color}-500/20 text-${channel.color}-400`
                              : 'bg-gray-700 text-gray-500'
                          }`}>
                            <channel.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">{channel.title}</h4>
                            <p className="text-gray-400 text-sm mb-2">{channel.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">{channel.availability}</span>
                              <span className="text-gray-500">{channel.responseTime}</span>
                            </div>
                            {channel.available ? (
                              <Button 
                                size="sm" 
                                className="mt-3 w-full bg-primary text-black hover:bg-primary/90"
                              >
                                {channel.action}
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled
                                className="mt-3 w-full border-gray-600 text-gray-500"
                              >
                                {user ? 'Upgrade Required' : 'Sign In Required'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Popular Articles */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Popular Articles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {popularArticles.map((article, index) => (
                      <Link 
                        key={article.id} 
                        href={`/help/article/${article.slug}`}
                        className="block p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                            index === 1 ? 'bg-gray-400/20 text-gray-400' :
                            index === 2 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-600/20 text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="text-white text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 mb-1">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{article.views.toLocaleString()} views</span>
                              <span>•</span>
                              <span>{article.readTime} min read</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Updates */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Recent Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentArticles.map((article) => (
                      <Link 
                        key={article.id} 
                        href={`/help/article/${article.slug}`}
                        className="block p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                      >
                        <h4 className="text-white text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 mb-1">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Updated {new Date(article.updatedAt).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Quick answers to the most common questions about Nexural Trading platform
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FAQ_ITEMS.slice(0, 6).map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <Card className="h-full bg-gray-900/50 border-gray-700 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-400 leading-relaxed line-clamp-3">
                        {faq.answer}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{faq.views.toLocaleString()} views</span>
                          <span>•</span>
                          <span>{faq.helpful} helpful</span>
                        </div>
                        <Link 
                          href={`/help/faq/${faq.id}`}
                          className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                        >
                          Read more <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/help/faq">
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  View All FAQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20 max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Can't find what you're looking for? Our expert support team is here to help you 
                  succeed with personalized assistance tailored to your needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/help/contact">
                    <Button className="bg-primary text-black hover:bg-primary/90 px-8">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/community">
                    <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 px-8">
                      <Users className="w-4 h-4 mr-2" />
                      Join Community
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}


