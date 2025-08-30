"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Sparkles, 
  Bug, 
  Wrench, 
  Shield, 
  Zap,
  Plus,
  ArrowUp,
  ArrowDown,
  Search,
  Calendar,
  Tag,
  ExternalLink,
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  Clock,
  Users,
  BarChart3,
  Smartphone,
  Globe,
  Database,
  Filter
} from "lucide-react"

interface ChangelogEntry {
  id: string
  version: string
  date: string
  title: string
  summary: string
  type: 'major' | 'minor' | 'patch'
  categories: Array<{
    type: 'new' | 'improved' | 'fixed' | 'security' | 'deprecated' | 'removed'
    items: Array<{
      title: string
      description: string
      impact?: 'low' | 'medium' | 'high'
      userTypes?: string[]
      link?: string
    }>
  }>
  stats?: {
    commits: number
    contributors: number
    filesChanged: number
    linesAdded: number
    linesRemoved: number
  }
  migration?: {
    required: boolean
    description: string
    link: string
  }
}

const mockChangelog: ChangelogEntry[] = [
  {
    id: 'v2.1.0',
    version: '2.1.0',
    date: '2024-01-15',
    title: 'Enhanced AI Signals & Portfolio Analytics',
    summary: 'Major update introducing advanced AI signal processing, comprehensive portfolio analytics, and improved mobile experience.',
    type: 'minor',
    categories: [
      {
        type: 'new',
        items: [
          {
            title: 'Advanced AI Signal Processing',
            description: 'Introduced machine learning models with 87% accuracy improvement for signal generation',
            impact: 'high',
            userTypes: ['Pro', 'Enterprise']
          },
          {
            title: 'Portfolio Risk Analytics',
            description: 'Comprehensive risk assessment tools with Monte Carlo simulations and stress testing',
            impact: 'high',
            userTypes: ['Pro', 'Enterprise']
          },
          {
            title: 'Mobile PWA Support',
            description: 'Progressive Web App capabilities with offline functionality and push notifications',
            impact: 'medium',
            userTypes: ['All']
          }
        ]
      },
      {
        type: 'improved',
        items: [
          {
            title: 'Backtesting Performance',
            description: 'Optimized backtesting engine resulting in 3x faster processing times',
            impact: 'medium',
            userTypes: ['Pro', 'Enterprise']
          },
          {
            title: 'User Interface Polish',
            description: 'Enhanced visual design with improved accessibility and mobile responsiveness',
            impact: 'low',
            userTypes: ['All']
          }
        ]
      },
      {
        type: 'fixed',
        items: [
          {
            title: 'Chart Loading Issues',
            description: 'Resolved intermittent chart loading failures on high-traffic periods',
            impact: 'medium',
            userTypes: ['All']
          },
          {
            title: 'API Rate Limiting',
            description: 'Fixed rate limiting edge cases that affected Enterprise customers',
            impact: 'low',
            userTypes: ['Enterprise']
          }
        ]
      }
    ],
    stats: {
      commits: 127,
      contributors: 8,
      filesChanged: 89,
      linesAdded: 3247,
      linesRemoved: 891
    }
  },
  {
    id: 'v2.0.5',
    version: '2.0.5',
    date: '2024-01-08',
    title: 'Security & Performance Updates',
    summary: 'Critical security patches and performance optimizations.',
    type: 'patch',
    categories: [
      {
        type: 'security',
        items: [
          {
            title: 'Authentication Security Patch',
            description: 'Enhanced JWT token validation and session management security',
            impact: 'high',
            userTypes: ['All']
          },
          {
            title: 'API Security Hardening',
            description: 'Implemented additional rate limiting and input validation measures',
            impact: 'medium',
            userTypes: ['All']
          }
        ]
      },
      {
        type: 'improved',
        items: [
          {
            title: 'Database Query Optimization',
            description: 'Optimized database queries resulting in 25% faster page load times',
            impact: 'medium',
            userTypes: ['All']
          }
        ]
      },
      {
        type: 'fixed',
        items: [
          {
            title: 'Memory Leak Resolution',
            description: 'Fixed memory leaks in real-time data processing components',
            impact: 'low',
            userTypes: ['All']
          }
        ]
      }
    ],
    stats: {
      commits: 23,
      contributors: 4,
      filesChanged: 18,
      linesAdded: 342,
      linesRemoved: 156
    }
  },
  {
    id: 'v2.0.0',
    version: '2.0.0',
    date: '2024-01-01',
    title: 'Platform Redesign & New Architecture',
    summary: 'Complete platform redesign with modern architecture, enhanced performance, and new features.',
    type: 'major',
    categories: [
      {
        type: 'new',
        items: [
          {
            title: 'Complete UI/UX Redesign',
            description: 'Modern, responsive design with improved user experience and accessibility',
            impact: 'high',
            userTypes: ['All']
          },
          {
            title: 'Advanced Backtesting Engine',
            description: 'New backtesting system with support for complex strategies and multiple assets',
            impact: 'high',
            userTypes: ['Pro', 'Enterprise']
          },
          {
            title: 'Real-time Collaboration',
            description: 'Share strategies and collaborate with team members in real-time',
            impact: 'medium',
            userTypes: ['Enterprise']
          }
        ]
      },
      {
        type: 'improved',
        items: [
          {
            title: 'Performance Optimization',
            description: 'Complete architecture overhaul resulting in 10x performance improvements',
            impact: 'high',
            userTypes: ['All']
          }
        ]
      },
      {
        type: 'deprecated',
        items: [
          {
            title: 'Legacy API v1',
            description: 'API v1 is deprecated and will be removed in v3.0.0. Please migrate to v2',
            impact: 'medium',
            userTypes: ['Developers'],
            link: '/api-docs/migration'
          }
        ]
      }
    ],
    stats: {
      commits: 892,
      contributors: 12,
      filesChanged: 567,
      linesAdded: 48932,
      linesRemoved: 23847
    },
    migration: {
      required: true,
      description: 'Some breaking changes require migration for API users',
      link: '/docs/migration-v2'
    }
  }
]

const categoryConfig = {
  new: { 
    icon: Plus, 
    color: 'text-green-400', 
    bgColor: 'bg-green-900/20', 
    borderColor: 'border-green-700',
    label: 'New Features'
  },
  improved: { 
    icon: ArrowUp, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900/20', 
    borderColor: 'border-blue-700',
    label: 'Improvements'
  },
  fixed: { 
    icon: Bug, 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-900/20', 
    borderColor: 'border-purple-700',
    label: 'Bug Fixes'
  },
  security: { 
    icon: Shield, 
    color: 'text-red-400', 
    bgColor: 'bg-red-900/20', 
    borderColor: 'border-red-700',
    label: 'Security'
  },
  deprecated: { 
    icon: AlertTriangle, 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-900/20', 
    borderColor: 'border-amber-700',
    label: 'Deprecated'
  },
  removed: { 
    icon: Trash2, 
    color: 'text-red-400', 
    bgColor: 'bg-red-900/20', 
    borderColor: 'border-red-700',
    label: 'Removed'
  }
}

const getVersionColor = (type: string) => {
  switch (type) {
    case 'major': return 'bg-red-600'
    case 'minor': return 'bg-blue-600'
    case 'patch': return 'bg-green-600'
    default: return 'bg-gray-600'
  }
}

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'text-red-400'
    case 'medium': return 'text-amber-400'
    case 'low': return 'text-green-400'
    default: return 'text-gray-400'
  }
}

export default function ChangelogClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVersion, setSelectedVersion] = useState('all')

  const filteredChangelog = mockChangelog.filter(entry => {
    const matchesSearch = searchQuery === '' || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.version.includes(searchQuery)
    
    const matchesCategory = selectedCategory === 'all' || 
      entry.categories.some(cat => cat.type === selectedCategory)
    
    const matchesVersion = selectedVersion === 'all' || entry.type === selectedVersion
    
    return matchesSearch && matchesCategory && matchesVersion
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-cyan-600">Platform Updates</Badge>
          <h1 className="text-4xl font-bold mb-4">
            Platform <span className="text-cyan-400">Changelog</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay up to date with all the latest features, improvements, and fixes to the Nexural Trading platform. 
            We're constantly evolving to serve you better.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-cyan-400">2.1.0</div>
              <div className="text-sm text-gray-400">Latest Version</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">24</div>
              <div className="text-sm text-gray-400">New Features</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">47</div>
              <div className="text-sm text-gray-400">Improvements</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800 text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400">33</div>
              <div className="text-sm text-gray-400">Bug Fixes</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search updates by version, feature, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="new">New Features</SelectItem>
                  <SelectItem value="improved">Improvements</SelectItem>
                  <SelectItem value="fixed">Bug Fixes</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <Tag className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Versions</SelectItem>
                  <SelectItem value="major">Major Releases</SelectItem>
                  <SelectItem value="minor">Minor Updates</SelectItem>
                  <SelectItem value="patch">Patches</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Changelog Entries */}
        <div className="space-y-8">
          {filteredChangelog.map((entry, index) => (
            <Card key={entry.id} className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Badge className={`${getVersionColor(entry.type)} text-white font-semibold px-3 py-1`}>
                      v{entry.version}
                    </Badge>
                    <div>
                      <CardTitle className="text-xl">{entry.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(entry.date)}</span>
                        </div>
                        {entry.stats && (
                          <>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">{entry.stats.contributors} contributors</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <BarChart3 className="w-4 h-4" />
                              <span className="text-sm">{entry.stats.commits} commits</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index === 0 && (
                    <Badge className="bg-amber-600">Latest</Badge>
                  )}
                </div>
                <CardDescription className="text-base">{entry.summary}</CardDescription>
              </CardHeader>
              
              <CardContent>
                {entry.migration?.required && (
                  <div className="mb-6 p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-400 mb-2">Migration Required</h4>
                        <p className="text-sm text-gray-300 mb-3">{entry.migration.description}</p>
                        <Button size="sm" variant="outline" className="border-amber-600 text-amber-400">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Migration Guide
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {entry.categories.map((category, categoryIndex) => {
                    const config = categoryConfig[category.type]
                    return (
                      <div key={categoryIndex} className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                        <h4 className={`font-semibold ${config.color} mb-4 flex items-center gap-2`}>
                          <config.icon className="w-5 h-5" />
                          {config.label} ({category.items.length})
                        </h4>
                        
                        <div className="space-y-3">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="pl-4 border-l-2 border-gray-600">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-white mb-1">{item.title}</h5>
                                  <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                                  
                                  <div className="flex items-center gap-4">
                                    {item.impact && (
                                      <Badge variant="outline" className={`text-xs ${getImpactColor(item.impact)} border-current`}>
                                        {item.impact} impact
                                      </Badge>
                                    )}
                                    {item.userTypes && (
                                      <div className="flex items-center gap-1">
                                        {item.userTypes.map((userType, userTypeIndex) => (
                                          <Badge key={userTypeIndex} variant="secondary" className="text-xs">
                                            {userType}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    {item.link && (
                                      <Button size="sm" variant="outline" className="text-xs h-6">
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Learn More
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {entry.stats && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-cyan-400">{entry.stats.commits}</div>
                        <div className="text-xs text-gray-400">Commits</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">{entry.stats.contributors}</div>
                        <div className="text-xs text-gray-400">Contributors</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">{entry.stats.filesChanged}</div>
                        <div className="text-xs text-gray-400">Files Changed</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-emerald-400">+{entry.stats.linesAdded.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Lines Added</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-400">-{entry.stats.linesRemoved.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Lines Removed</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription CTA */}
        <Card className="mt-12 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-700">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated with Platform Changes</h2>
            <p className="text-gray-400 mb-6">
              Get notified about important updates, new features, and breaking changes via email
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                placeholder="Enter your email..."
                className="bg-gray-800 border-gray-700"
              />
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                Subscribe to Updates
              </Button>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              You can also follow our updates on our <a href="/status" className="text-cyan-400 hover:underline">status page</a> or <a href="/api-docs" className="text-cyan-400 hover:underline">API documentation</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


