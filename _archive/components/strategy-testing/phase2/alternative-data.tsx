"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Satellite, 
  MessageSquare, 
  TrendingUp, 
  Globe, 
  Newspaper,
  Activity,
  BarChart3,
  Zap,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  ShoppingCart,
  Plane
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  ScatterChart,
  Scatter,
  PieChart,
  Cell,
  Pie
} from "recharts"

interface DataSource {
  id: string
  name: string
  category: "sentiment" | "satellite" | "social" | "economic" | "web" | "mobile"
  status: "active" | "inactive" | "error"
  lastUpdate: string
  coverage: string
  cost: number
  quality: number
}

interface SentimentData {
  date: string
  sentiment: number
  volume: number
  bullish: number
  bearish: number
  neutral: number
}

interface NewsEvent {
  timestamp: string
  headline: string
  sentiment: number
  impact: "high" | "medium" | "low"
  source: string
  relevance: number
}

interface SocialMetrics {
  platform: string
  mentions: number
  sentiment: number
  reach: number
  engagement: number
}

interface EconomicIndicator {
  name: string
  value: number
  change: number
  impact: number
  nextRelease: string
}

export function AlternativeData() {
  const [activeDataSource, setActiveDataSource] = useState("sentiment")
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([])
  const [socialMetrics, setSocialMetrics] = useState<SocialMetrics[]>([])
  const [economicIndicators, setEconomicIndicators] = useState<EconomicIndicator[]>([])

  // Data source categories
  const [dataCategories] = useState([
    {
      id: "sentiment",
      name: "News Sentiment",
      icon: <Newspaper className="h-6 w-6" />,
      description: "Real-time news sentiment analysis",
      sources: 45,
      coverage: "Global",
      latency: "< 1 min"
    },
    {
      id: "social",
      name: "Social Media",
      icon: <MessageSquare className="h-6 w-6" />,
      description: "Social media sentiment and trends",
      sources: 12,
      coverage: "US, EU, APAC",
      latency: "< 5 min"
    },
    {
      id: "satellite",
      name: "Satellite Data",
      icon: <Satellite className="h-6 w-6" />,
      description: "Satellite imagery and geospatial data",
      sources: 8,
      coverage: "Global",
      latency: "1-3 days"
    },
    {
      id: "web",
      name: "Web Traffic",
      icon: <Globe className="h-6 w-6" />,
      description: "Website traffic and search trends",
      sources: 15,
      coverage: "Global",
      latency: "< 1 hour"
    },
    {
      id: "mobile",
      name: "Mobile Data",
      icon: <Users className="h-6 w-6" />,
      description: "App usage and location analytics",
      sources: 6,
      coverage: "US, EU",
      latency: "1-2 days"
    },
    {
      id: "economic",
      name: "Economic Data",
      icon: <BarChart3 className="h-6 w-6" />,
      description: "High-frequency economic indicators",
      sources: 25,
      coverage: "Global",
      latency: "Real-time"
    }
  ])

  // Mock data initialization
  useEffect(() => {
    const mockDataSources: DataSource[] = [
      {
        id: "refinitiv_news",
        name: "Refinitiv News Analytics",
        category: "sentiment",
        status: "active",
        lastUpdate: "2024-01-15T10:30:00Z",
        coverage: "Global",
        cost: 2500,
        quality: 0.92
      },
      {
        id: "twitter_sentiment",
        name: "Twitter Sentiment Feed",
        category: "social",
        status: "active", 
        lastUpdate: "2024-01-15T10:28:00Z",
        coverage: "US, EU",
        cost: 800,
        quality: 0.78
      },
      {
        id: "planet_satellite",
        name: "Planet Satellite Imagery",
        category: "satellite",
        status: "active",
        lastUpdate: "2024-01-14T15:00:00Z",
        coverage: "Global",
        cost: 5000,
        quality: 0.95
      },
      {
        id: "google_trends",
        name: "Google Trends API",
        category: "web",
        status: "active",
        lastUpdate: "2024-01-15T09:45:00Z",
        coverage: "Global",
        cost: 300,
        quality: 0.85
      }
    ]

    const mockSentimentData: SentimentData[] = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      mockSentimentData.push({
        date: date.toISOString().split('T')[0],
        sentiment: 0.3 + Math.random() * 0.4,
        volume: 1000 + Math.random() * 2000,
        bullish: 30 + Math.random() * 20,
        bearish: 20 + Math.random() * 15,
        neutral: 40 + Math.random() * 20
      })
    }

    const mockNewsEvents: NewsEvent[] = [
      {
        timestamp: "2024-01-15T10:30:00Z",
        headline: "Federal Reserve signals potential rate cut in Q2",
        sentiment: 0.75,
        impact: "high",
        source: "Reuters",
        relevance: 0.92
      },
      {
        timestamp: "2024-01-15T10:15:00Z",
        headline: "Tech earnings beat expectations across the board",
        sentiment: 0.82,
        impact: "medium",
        source: "Bloomberg",
        relevance: 0.88
      },
      {
        timestamp: "2024-01-15T09:45:00Z",
        headline: "Oil prices surge on supply chain disruptions",
        sentiment: -0.35,
        impact: "medium",
        source: "CNBC",
        relevance: 0.76
      },
      {
        timestamp: "2024-01-15T09:30:00Z",
        headline: "Consumer confidence reaches 6-month high",
        sentiment: 0.68,
        impact: "low",
        source: "MarketWatch",
        relevance: 0.65
      }
    ]

    const mockSocialMetrics: SocialMetrics[] = [
      { platform: "Twitter", mentions: 15420, sentiment: 0.62, reach: 2.4e6, engagement: 0.034 },
      { platform: "Reddit", mentions: 8930, sentiment: 0.45, reach: 1.8e6, engagement: 0.067 },
      { platform: "LinkedIn", mentions: 3240, sentiment: 0.78, reach: 890000, engagement: 0.089 },
      { platform: "Facebook", mentions: 5670, sentiment: 0.58, reach: 3.2e6, engagement: 0.023 },
      { platform: "YouTube", mentions: 1890, sentiment: 0.71, reach: 650000, engagement: 0.12 }
    ]

    const mockEconomicIndicators: EconomicIndicator[] = [
      { name: "GDP Growth", value: 2.8, change: 0.3, impact: 0.85, nextRelease: "2024-01-30" },
      { name: "Unemployment Rate", value: 3.7, change: -0.1, impact: 0.78, nextRelease: "2024-02-02" },
      { name: "Inflation (CPI)", value: 3.2, change: -0.2, impact: 0.92, nextRelease: "2024-01-25" },
      { name: "Consumer Confidence", value: 108.5, change: 2.3, impact: 0.65, nextRelease: "2024-01-28" },
      { name: "PMI Manufacturing", value: 52.1, change: 1.2, impact: 0.73, nextRelease: "2024-02-01" }
    ]

    setDataSources(mockDataSources)
    setSentimentData(mockSentimentData)
    setNewsEvents(mockNewsEvents)
    setSocialMetrics(mockSocialMetrics)
    setEconomicIndicators(mockEconomicIndicators)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400 border-green-500/30"
      case "inactive": return "text-gray-400 border-gray-500/30"
      case "error": return "text-red-400 border-red-500/30"
      default: return "text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4" />
      case "inactive": return <Clock className="h-4 w-4" />
      case "error": return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-400 border-red-500/30"
      case "medium": return "text-yellow-400 border-yellow-500/30"
      case "low": return "text-green-400 border-green-500/30"
      default: return "text-gray-400 border-gray-500/30"
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const COLORS = ['#00bbff', '#4ade80', '#fbbf24', '#f87171', '#a78bfa']

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Satellite className="h-8 w-8 text-[#00bbff]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Alternative Data</h1>
              <p className="text-sm text-[#a0a0b8]">Integrate alternative data sources for enhanced alpha generation</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => {
                console.log('AI Insights clicked')
                alert('Generating AI insights from alternative data sources...')
              }}
              variant="outline" 
              className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
            <Button 
              onClick={() => {
                console.log('Sync Data clicked')
                alert('Syncing all alternative data sources... This may take a few minutes.')
              }}
              className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Sync Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#1a1a2e]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Overview
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              News Sentiment
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Social Media
            </TabsTrigger>
            <TabsTrigger value="satellite" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Satellite Data
            </TabsTrigger>
            <TabsTrigger value="economic" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Economic Data
            </TabsTrigger>
            <TabsTrigger value="integration" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Integration
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Data Source Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataCategories.map((category) => (
                <Card key={category.id} className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-[#00bbff]">{category.icon}</div>
                        <CardTitle className="text-white text-lg">{category.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                        {category.sources}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#a0a0b8] mb-4">{category.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Coverage:</span>
                        <span className="text-white">{category.coverage}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Latency:</span>
                        <span className="text-green-400">{category.latency}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        console.log('Configure Sources clicked')
                        alert('Opening data source configuration panel...')
                      }}
                      className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                    >
                      Configure Sources
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Active Data Sources */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Active Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataSources.map((source) => (
                    <div key={source.id} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-[#00bbff]">
                            {source.category === "sentiment" && <Newspaper className="h-5 w-5" />}
                            {source.category === "social" && <MessageSquare className="h-5 w-5" />}
                            {source.category === "satellite" && <Satellite className="h-5 w-5" />}
                            {source.category === "web" && <Globe className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{source.name}</h4>
                            <p className="text-sm text-gray-400 capitalize">{source.category} • {source.coverage}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className={getStatusColor(source.status)}>
                            {getStatusIcon(source.status)}
                            <span className="ml-1 capitalize">{source.status}</span>
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Quality</div>
                            <div className="text-[#00bbff] font-mono">{(source.quality * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Last Update:</span>
                          <div className="text-white">{new Date(source.lastUpdate).toLocaleTimeString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Monthly Cost:</span>
                          <div className="text-white">${source.cost.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Quality Score:</span>
                          <div className="w-full bg-[#2a2a3e] rounded-full h-2 mt-1">
                            <div 
                              className="bg-[#00bbff] h-2 rounded-full" 
                              style={{ width: `${source.quality * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-6">
            {/* Sentiment Timeline */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Market Sentiment Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis yAxisId="sentiment" stroke="#888" domain={[0, 1]} />
                    <YAxis yAxisId="volume" orientation="right" stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar yAxisId="volume" dataKey="volume" fill="#00bbff" fillOpacity={0.3} />
                    <Line yAxisId="sentiment" type="monotone" dataKey="sentiment" stroke="#4ade80" strokeWidth={2} name="Sentiment" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Breakdown */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Sentiment Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Bullish', value: 45, color: '#4ade80' },
                          { name: 'Neutral', value: 35, color: '#fbbf24' },
                          { name: 'Bearish', value: 20, color: '#f87171' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Bullish', value: 45, color: '#4ade80' },
                          { name: 'Neutral', value: 35, color: '#fbbf24' },
                          { name: 'Bearish', value: 20, color: '#f87171' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent News Events */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Recent News Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {newsEvents.map((event, i) => (
                      <div key={i} className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white mb-1">{event.headline}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <span>{event.source}</span>
                              <span>•</span>
                              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className={getImpactColor(event.impact)}>
                            {event.impact}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-xs">
                              <span className="text-gray-400">Sentiment: </span>
                              <span className={event.sentiment > 0 ? "text-green-400" : "text-red-400"}>
                                {(event.sentiment * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Relevance: </span>
                              <span className="text-[#00bbff]">{(event.relevance * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            {/* Social Media Metrics */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Social Media Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialMetrics.map((metric, i) => (
                    <div key={i} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="h-5 w-5 text-[#00bbff]" />
                          <h4 className="font-semibold text-white">{metric.platform}</h4>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-mono ${metric.sentiment > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                            {(metric.sentiment * 100).toFixed(0)}% Positive
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-white font-mono">{formatNumber(metric.mentions)}</div>
                          <div className="text-gray-400">Mentions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#00bbff] font-mono">{formatNumber(metric.reach)}</div>
                          <div className="text-gray-400">Reach</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-400 font-mono">{(metric.engagement * 100).toFixed(1)}%</div>
                          <div className="text-gray-400">Engagement</div>
                        </div>
                        <div className="text-center">
                          <div className="w-full bg-[#2a2a3e] rounded-full h-2 mt-1">
                            <div 
                              className="bg-[#00bbff] h-2 rounded-full" 
                              style={{ width: `${metric.sentiment * 100}%` }}
                            />
                          </div>
                          <div className="text-gray-400">Sentiment</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Sentiment Trends */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Social Sentiment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sentimentData.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #2a2a3e",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="bullish" stackId="1" stroke="#4ade80" fill="#4ade80" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="neutral" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="bearish" stackId="1" stroke="#f87171" fill="#f87171" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Satellite Data Tab */}
          <TabsContent value="satellite" className="space-y-6">
            {/* Satellite Data Sources */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Retail Foot Traffic",
                  description: "Shopping center and retail location analysis",
                  coverage: "US, EU",
                  frequency: "Daily",
                  accuracy: 0.94
                },
                {
                  name: "Agricultural Monitoring",
                  description: "Crop health and yield estimation",
                  coverage: "Global",
                  frequency: "Weekly",
                  accuracy: 0.89
                },
                {
                  name: "Industrial Activity",
                  description: "Factory and port activity monitoring",
                  coverage: "Global",
                  frequency: "Daily",
                  accuracy: 0.91
                },
                {
                  name: "Oil Storage Levels",
                  description: "Crude oil storage tank monitoring",
                  coverage: "Global",
                  frequency: "Weekly",
                  accuracy: 0.96
                },
                {
                  name: "Construction Activity",
                  description: "Real estate development tracking",
                  coverage: "Major Cities",
                  frequency: "Monthly",
                  accuracy: 0.87
                },
                {
                  name: "Shipping Traffic",
                  description: "Maritime trade flow analysis",
                  coverage: "Global Ports",
                  frequency: "Daily",
                  accuracy: 0.93
                }
              ].map((source, i) => (
                <Card key={i} className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{source.name}</CardTitle>
                      <Satellite className="h-5 w-5 text-[#00bbff]" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#a0a0b8] mb-4">{source.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Coverage:</span>
                        <span className="text-white">{source.coverage}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Frequency:</span>
                        <span className="text-green-400">{source.frequency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Accuracy:</span>
                        <span className="text-[#00bbff]">{(source.accuracy * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        console.log(`View Data clicked for ${source.name}`)
                        alert(`Opening ${source.name} data viewer...`)
                      }}
                      className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                    >
                      View Data
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sample Satellite Insights */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Recent Satellite Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Walmart Foot Traffic Up 12% Week-over-Week",
                      description: "Satellite analysis shows increased parking lot occupancy across 500+ locations",
                      impact: "Positive for WMT earnings",
                      confidence: 0.89,
                      timestamp: "2 hours ago"
                    },
                    {
                      title: "China Steel Production Declining",
                      description: "Industrial activity monitoring shows 8% decrease in steel plant operations",
                      impact: "Negative for steel commodity prices",
                      confidence: 0.94,
                      timestamp: "4 hours ago"
                    },
                    {
                      title: "Oil Storage Levels Rising in Cushing",
                      description: "Floating roof tank analysis indicates 3.2M barrel increase",
                      impact: "Bearish for crude oil prices",
                      confidence: 0.96,
                      timestamp: "6 hours ago"
                    }
                  ].map((insight, i) => (
                    <div key={i} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                          <p className="text-sm text-[#a0a0b8] mb-2">{insight.description}</p>
                          <div className="text-xs text-gray-400">{insight.timestamp}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400 mb-1">Confidence</div>
                          <div className="text-[#00bbff] font-mono">{(insight.confidence * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Impact: </span>
                        <span className="text-white">{insight.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Economic Data Tab */}
          <TabsContent value="economic" className="space-y-6">
            {/* Economic Indicators */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">High-Frequency Economic Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {economicIndicators.map((indicator, i) => (
                    <div key={i} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <BarChart3 className="h-5 w-5 text-[#00bbff]" />
                          <div>
                            <h4 className="font-semibold text-white">{indicator.name}</h4>
                            <div className="text-sm text-gray-400">Next Release: {indicator.nextRelease}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-mono text-white">{indicator.value}%</div>
                          <div className={`text-sm font-mono ${indicator.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {indicator.change > 0 ? '+' : ''}{indicator.change}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-400">Market Impact: </span>
                          <span className="text-[#00bbff]">{(indicator.impact * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-32 bg-[#2a2a3e] rounded-full h-2">
                          <div 
                            className="bg-[#00bbff] h-2 rounded-full" 
                            style={{ width: `${indicator.impact * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Economic Calendar */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Upcoming Economic Releases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "Jan 25", time: "08:30", event: "Initial Jobless Claims", forecast: "220K", previous: "218K", impact: "medium" },
                    { date: "Jan 26", time: "10:00", event: "New Home Sales", forecast: "680K", previous: "664K", impact: "low" },
                    { date: "Jan 30", time: "08:30", event: "GDP (QoQ)", forecast: "2.8%", previous: "2.5%", impact: "high" },
                    { date: "Feb 01", time: "10:00", event: "ISM Manufacturing PMI", forecast: "52.1", previous: "50.9", impact: "high" },
                    { date: "Feb 02", time: "08:30", event: "Non-Farm Payrolls", forecast: "185K", previous: "199K", impact: "high" }
                  ].map((event, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-white">{event.date}</div>
                          <div className="text-xs text-gray-400">{event.time}</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{event.event}</div>
                          <div className="text-sm text-gray-400">
                            Forecast: {event.forecast} | Previous: {event.previous}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getImpactColor(event.impact)}>
                        {event.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            {/* Data Integration Pipeline */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Data Integration Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { stage: "Data Ingestion", status: "active", description: "Real-time data collection from 47 sources", progress: 100 },
                    { stage: "Data Cleaning", status: "active", description: "Outlier detection and data validation", progress: 98 },
                    { stage: "Feature Engineering", status: "active", description: "Creating derived features and signals", progress: 95 },
                    { stage: "Signal Generation", status: "active", description: "Converting data to trading signals", progress: 87 },
                    { stage: "Model Integration", status: "processing", description: "Feeding signals to ML models", progress: 73 }
                  ].map((stage, i) => (
                    <div key={i} className="p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${stage.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div>
                            <h4 className="font-semibold text-white">{stage.stage}</h4>
                            <p className="text-sm text-gray-400">{stage.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#00bbff] font-mono">{stage.progress}%</div>
                        </div>
                      </div>
                      <Progress value={stage.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Configuration */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">API Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Data Refresh Rate</label>
                      <Select defaultValue="1min">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="1min">1 Minute</SelectItem>
                          <SelectItem value="5min">5 Minutes</SelectItem>
                          <SelectItem value="15min">15 Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Data Quality Threshold</label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="range" 
                          min="0" 
                          max="100" 
                          defaultValue="85" 
                          className="flex-1"
                        />
                        <span className="text-white">85%</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Alert Thresholds</label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">Sentiment Change:</span>
                          <Input className="w-20 h-8 text-xs bg-[#15151f] border-[#2a2a3e]" placeholder="15%" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">Volume Spike:</span>
                          <Input className="w-20 h-8 text-xs bg-[#15151f] border-[#2a2a3e]" placeholder="200%" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Quality Monitoring */}
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white">Data Quality Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Overall Quality</div>
                        <div className="text-xl font-mono text-green-400">94.2%</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Data Completeness</div>
                        <div className="text-xl font-mono text-[#00bbff]">98.7%</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Latency (Avg)</div>
                        <div className="text-xl font-mono text-white">1.2s</div>
                      </div>
                      <div className="p-3 bg-[#15151f] rounded-lg border border-[#2a2a3e] text-center">
                        <div className="text-sm text-gray-400">Error Rate</div>
                        <div className="text-xl font-mono text-yellow-400">0.3%</div>
                      </div>
                    </div>

                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        All data sources operational
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
