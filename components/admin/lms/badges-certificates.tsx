"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Award,
  Trophy,
  Crown,
  Star,
  Sparkles,
  Shield,
  Target,
  Zap,
  Flame,
  Diamond,
  Medal,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Save,
  Eye,
  Settings,
  Users,
  Calendar,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Image,
  Palette,
  Type,
  Layout,
  FileImage,
  FileText,
  Link2,
  Globe,
  Lock,
  Unlock,
  Brain,
  Layers,
  Cpu,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Hash,
  Tag
} from "lucide-react"
import { toast } from "sonner"
import { Badge as BadgeModel, Certificate } from "@/lib/lms/models"

interface BadgeTemplate {
  id: string
  name: string
  description: string
  icon: string
  color: string
  backgroundColor: string
  category: 'completion' | 'streak' | 'performance' | 'engagement' | 'special' | 'milestone'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  points: number
  
  // Criteria for awarding
  criteria: {
    type: 'course_completion' | 'quiz_score' | 'streak_days' | 'time_spent' | 'custom'
    value: number
    courses?: string[]
    operator: 'gte' | 'lte' | 'eq'
    description: string
  }
  
  // Design & Display
  design: {
    shape: 'circle' | 'hexagon' | 'star' | 'shield' | 'diamond'
    border: boolean
    shadow: boolean
    animation: 'none' | 'pulse' | 'glow' | 'bounce'
  }
  
  // Metadata
  isActive: boolean
  isVisible: boolean
  earnedCount: number
  createdAt: string
  updatedAt: string
}

interface CertificateTemplate {
  id: string
  name: string
  title: string
  description: string
  courseName?: string
  courseId?: string
  
  // Design
  template: 'classic' | 'modern' | 'elegant' | 'professional' | 'creative'
  orientation: 'landscape' | 'portrait'
  colorScheme: 'blue' | 'green' | 'purple' | 'gold' | 'red' | 'custom'
  
  // Content
  includeQRCode: boolean
  includeGrades: boolean
  includeSkills: string[]
  customText?: string
  
  // Verification
  verificationEnabled: boolean
  expirationEnabled: boolean
  expirationMonths?: number
  
  // Stats
  issuedCount: number
  isActive: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

const BADGE_CATEGORIES = [
  { value: 'completion', label: '🎯 Completion', color: 'text-blue-400' },
  { value: 'streak', label: '🔥 Streak', color: 'text-orange-400' },
  { value: 'performance', label: '⭐ Performance', color: 'text-yellow-400' },
  { value: 'engagement', label: '💪 Engagement', color: 'text-green-400' },
  { value: 'milestone', label: '🏆 Milestone', color: 'text-purple-400' },
  { value: 'special', label: '✨ Special', color: 'text-pink-400' }
]

const BADGE_RARITIES = [
  { value: 'common', label: 'Common', color: 'text-gray-400', bg: 'bg-gray-600' },
  { value: 'uncommon', label: 'Uncommon', color: 'text-green-400', bg: 'bg-green-600' },
  { value: 'rare', label: 'Rare', color: 'text-blue-400', bg: 'bg-blue-600' },
  { value: 'epic', label: 'Epic', color: 'text-purple-400', bg: 'bg-purple-600' },
  { value: 'legendary', label: 'Legendary', color: 'text-yellow-400', bg: 'bg-yellow-600' }
]

const MOCK_BADGES: BadgeTemplate[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first trading course',
    icon: 'trophy',
    color: '#10B981',
    backgroundColor: '#065F46',
    category: 'completion',
    rarity: 'common',
    points: 10,
    criteria: {
      type: 'course_completion',
      value: 1,
      operator: 'gte',
      description: 'Complete at least 1 course'
    },
    design: {
      shape: 'circle',
      border: true,
      shadow: true,
      animation: 'none'
    },
    isActive: true,
    isVisible: true,
    earnedCount: 1247,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Quiz Master',
    description: 'Score 90% or higher on 5 quizzes',
    icon: 'star',
    color: '#F59E0B',
    backgroundColor: '#92400E',
    category: 'performance',
    rarity: 'rare',
    points: 50,
    criteria: {
      type: 'quiz_score',
      value: 90,
      operator: 'gte',
      description: 'Score 90% or higher on 5 quizzes'
    },
    design: {
      shape: 'star',
      border: true,
      shadow: true,
      animation: 'glow'
    },
    isActive: true,
    isVisible: true,
    earnedCount: 342,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '3',
    name: 'Streak Legend',
    description: 'Maintain a 30-day learning streak',
    icon: 'flame',
    color: '#EF4444',
    backgroundColor: '#991B1B',
    category: 'streak',
    rarity: 'legendary',
    points: 100,
    criteria: {
      type: 'streak_days',
      value: 30,
      operator: 'gte',
      description: 'Maintain a 30-day learning streak'
    },
    design: {
      shape: 'hexagon',
      border: true,
      shadow: true,
      animation: 'pulse'
    },
    isActive: true,
    isVisible: true,
    earnedCount: 23,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  }
]

const MOCK_CERTIFICATES: CertificateTemplate[] = [
  {
    id: '1',
    name: 'Trading Fundamentals Certificate',
    title: 'Certificate of Completion',
    description: 'Awarded for successfully completing the Trading Fundamentals course',
    courseName: 'Trading Fundamentals',
    courseId: 'course-1',
    template: 'professional',
    orientation: 'landscape',
    colorScheme: 'blue',
    includeQRCode: true,
    includeGrades: true,
    includeSkills: ['Technical Analysis', 'Risk Management', 'Market Psychology'],
    verificationEnabled: true,
    expirationEnabled: false,
    issuedCount: 1456,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Advanced Options Master',
    title: 'Advanced Options Trading Specialist',
    description: 'Professional certification in advanced options trading strategies',
    courseName: 'Advanced Options Trading',
    courseId: 'course-2',
    template: 'elegant',
    orientation: 'portrait',
    colorScheme: 'gold',
    includeQRCode: true,
    includeGrades: true,
    includeSkills: ['Options Strategies', 'Greeks Analysis', 'Volatility Trading'],
    verificationEnabled: true,
    expirationEnabled: true,
    expirationMonths: 24,
    issuedCount: 234,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  }
]

export default function BadgesCertificatesManager() {
  const [badges, setBadges] = useState<BadgeTemplate[]>(MOCK_BADGES)
  const [certificates, setCertificates] = useState<CertificateTemplate[]>(MOCK_CERTIFICATES)
  const [activeTab, setActiveTab] = useState('badges')
  const [selectedBadge, setSelectedBadge] = useState<BadgeTemplate | null>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateTemplate | null>(null)
  const [showBadgeEditor, setShowBadgeEditor] = useState(false)
  const [showCertificateEditor, setShowCertificateEditor] = useState(false)
  
  // Filters
  const [badgeSearchQuery, setBadgeSearchQuery] = useState('')
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState('all')
  const [badgeRarityFilter, setBadgeRarityFilter] = useState('all')
  const [certificateSearchQuery, setCertificateSearchQuery] = useState('')

  // Badge Editor State
  const [badgeForm, setBadgeForm] = useState<Partial<BadgeTemplate>>({
    name: '',
    description: '',
    category: 'completion',
    rarity: 'common',
    points: 10,
    color: '#10B981',
    backgroundColor: '#065F46',
    design: {
      shape: 'circle',
      border: true,
      shadow: true,
      animation: 'none'
    },
    criteria: {
      type: 'course_completion',
      value: 1,
      operator: 'gte',
      description: ''
    },
    isActive: true,
    isVisible: true
  })

  // Certificate Editor State
  const [certificateForm, setCertificateForm] = useState<Partial<CertificateTemplate>>({
    name: '',
    title: '',
    description: '',
    template: 'professional',
    orientation: 'landscape',
    colorScheme: 'blue',
    includeQRCode: true,
    includeGrades: true,
    includeSkills: [],
    verificationEnabled: true,
    expirationEnabled: false,
    isActive: true
  })

  // ===== COMPUTED VALUES =====
  const filteredBadges = useMemo(() => {
    let filtered = badges

    if (badgeSearchQuery) {
      filtered = filtered.filter(badge => 
        badge.name.toLowerCase().includes(badgeSearchQuery.toLowerCase()) ||
        badge.description.toLowerCase().includes(badgeSearchQuery.toLowerCase())
      )
    }

    if (badgeCategoryFilter !== 'all') {
      filtered = filtered.filter(badge => badge.category === badgeCategoryFilter)
    }

    if (badgeRarityFilter !== 'all') {
      filtered = filtered.filter(badge => badge.rarity === badgeRarityFilter)
    }

    return filtered
  }, [badges, badgeSearchQuery, badgeCategoryFilter, badgeRarityFilter])

  const filteredCertificates = useMemo(() => {
    let filtered = certificates

    if (certificateSearchQuery) {
      filtered = filtered.filter(cert => 
        cert.name.toLowerCase().includes(certificateSearchQuery.toLowerCase()) ||
        cert.description.toLowerCase().includes(certificateSearchQuery.toLowerCase())
      )
    }

    return filtered
  }, [certificates, certificateSearchQuery])

  const badgeStats = useMemo(() => {
    return {
      total: badges.length,
      active: badges.filter(b => b.isActive).length,
      totalEarned: badges.reduce((sum, b) => sum + b.earnedCount, 0),
      byRarity: Object.fromEntries(
        BADGE_RARITIES.map(rarity => [
          rarity.value,
          badges.filter(b => b.rarity === rarity.value).length
        ])
      )
    }
  }, [badges])

  const certificateStats = useMemo(() => {
    return {
      total: certificates.length,
      active: certificates.filter(c => c.isActive).length,
      totalIssued: certificates.reduce((sum, c) => sum + c.issuedCount, 0)
    }
  }, [certificates])

  // ===== EVENT HANDLERS =====
  
  const createBadge = () => {
    const newBadge: BadgeTemplate = {
      ...badgeForm,
      id: `badge-${Date.now()}`,
      earnedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as BadgeTemplate

    setBadges(prev => [newBadge, ...prev])
    setShowBadgeEditor(false)
    setBadgeForm({
      name: '',
      description: '',
      category: 'completion',
      rarity: 'common',
      points: 10,
      color: '#10B981',
      backgroundColor: '#065F46',
      design: {
        shape: 'circle',
        border: true,
        shadow: true,
        animation: 'none'
      },
      criteria: {
        type: 'course_completion',
        value: 1,
        operator: 'gte',
        description: ''
      },
      isActive: true,
      isVisible: true
    })
    toast.success("Badge created successfully!")
  }

  const createCertificate = () => {
    const newCertificate: CertificateTemplate = {
      ...certificateForm,
      id: `cert-${Date.now()}`,
      issuedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as CertificateTemplate

    setCertificates(prev => [newCertificate, ...prev])
    setShowCertificateEditor(false)
    setCertificateForm({
      name: '',
      title: '',
      description: '',
      template: 'professional',
      orientation: 'landscape',
      colorScheme: 'blue',
      includeQRCode: true,
      includeGrades: true,
      includeSkills: [],
      verificationEnabled: true,
      expirationEnabled: false,
      isActive: true
    })
    toast.success("Certificate template created successfully!")
  }

  const duplicateBadge = (badge: BadgeTemplate) => {
    const duplicated: BadgeTemplate = {
      ...badge,
      id: `badge-${Date.now()}`,
      name: `${badge.name} (Copy)`,
      earnedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setBadges(prev => [duplicated, ...prev])
    toast.success("Badge duplicated successfully!")
  }

  const deleteBadge = (badgeId: string) => {
    setBadges(prev => prev.filter(b => b.id !== badgeId))
    toast.success("Badge deleted successfully!")
  }

  const duplicateCertificate = (certificate: CertificateTemplate) => {
    const duplicated: CertificateTemplate = {
      ...certificate,
      id: `cert-${Date.now()}`,
      name: `${certificate.name} (Copy)`,
      issuedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setCertificates(prev => [duplicated, ...prev])
    toast.success("Certificate template duplicated successfully!")
  }

  const deleteCertificate = (certificateId: string) => {
    setCertificates(prev => prev.filter(c => c.id !== certificateId))
    toast.success("Certificate template deleted successfully!")
  }

  const getBadgeIcon = (iconName: string) => {
    const icons = {
      trophy: Trophy,
      star: Star,
      flame: Flame,
      shield: Shield,
      crown: Crown,
      medal: Medal,
      diamond: Diamond,
      target: Target,
      zap: Zap,
      sparkles: Sparkles
    }
    return icons[iconName as keyof typeof icons] || Trophy
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Award className="w-8 h-8 mr-3 text-yellow-400" />
            Badges & Certificates
          </h1>
          <p className="text-gray-400">
            Create and manage gamification rewards, badges, and professional certificates
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setShowCertificateEditor(true)}
            variant="outline" 
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Create Certificate
          </Button>
          <Button 
            onClick={() => setShowBadgeEditor(true)}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Badge
          </Button>
        </div>
      </div>

      {/* ===== OVERVIEW STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{badgeStats.total}</div>
              <div className="text-yellow-300 text-sm">Total Badges</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{certificateStats.total}</div>
              <div className="text-blue-300 text-sm">Certificates</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{badgeStats.totalEarned.toLocaleString()}</div>
              <div className="text-green-300 text-sm">Badges Earned</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{certificateStats.totalIssued.toLocaleString()}</div>
              <div className="text-purple-300 text-sm">Issued Certs</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{badgeStats.byRarity.legendary || 0}</div>
              <div className="text-orange-300 text-sm">Legendary</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-700/50">
          <CardContent className="p-4">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{badgeStats.active}</div>
              <div className="text-pink-300 text-sm">Active Items</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== MAIN TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800">
          <TabsTrigger value="badges" className="data-[state=active]:bg-yellow-600">
            🏆 Badges
          </TabsTrigger>
          <TabsTrigger value="certificates" className="data-[state=active]:bg-yellow-600">
            📜 Certificates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-yellow-600">
            📊 Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-yellow-600">
            ⚙️ Settings
          </TabsTrigger>
        </TabsList>

        {/* ===== BADGES TAB ===== */}
        <TabsContent value="badges" className="space-y-6">
          {/* Badge Filters */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search badges..."
                      value={badgeSearchQuery}
                      onChange={(e) => setBadgeSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white w-64"
                    />
                  </div>

                  <Select value={badgeCategoryFilter} onValueChange={setBadgeCategoryFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Categories</SelectItem>
                      {BADGE_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={badgeRarityFilter} onValueChange={setBadgeRarityFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                      <SelectValue placeholder="Rarity" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Rarities</SelectItem>
                      {BADGE_RARITIES.map(rarity => (
                        <SelectItem key={rarity.value} value={rarity.value}>
                          <span className={rarity.color}>{rarity.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => setShowBadgeEditor(true)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Badge
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Badge Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredBadges.map((badge, index) => {
                const IconComponent = getBadgeIcon(badge.icon)
                const rarityConfig = BADGE_RARITIES.find(r => r.value === badge.rarity)
                const categoryConfig = BADGE_CATEGORIES.find(c => c.value === badge.category)

                return (
                  <motion.div
                    key={badge.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <Card className="bg-gray-900 border-gray-800 hover:border-yellow-600 transition-all duration-200 h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className={`w-12 h-12 rounded-full flex items-center justify-center relative`}
                              style={{ 
                                backgroundColor: badge.backgroundColor,
                                borderColor: badge.color,
                                borderWidth: badge.design.border ? '2px' : '0'
                              }}
                            >
                              <IconComponent 
                                className="w-6 h-6" 
                                style={{ color: badge.color }}
                              />
                              {badge.design.animation === 'glow' && (
                                <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400/20" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-white font-semibold group-hover:text-yellow-400 transition-colors">
                                {badge.name}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={rarityConfig?.bg || 'bg-gray-600'}>
                                  {rarityConfig?.label}
                                </Badge>
                                <Badge className={`${categoryConfig?.color} bg-gray-700 border-0`}>
                                  {categoryConfig?.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="outline">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => duplicateBadge(badge)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-400"
                              onClick={() => deleteBadge(badge.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <p className="text-gray-400 text-sm line-clamp-2">{badge.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Points</span>
                              <Badge className="bg-purple-600">{badge.points}</Badge>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Earned</span>
                              <Badge className="bg-green-600">{badge.earnedCount.toLocaleString()}</Badge>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400 text-sm">Status</span>
                              <Badge className={badge.isActive ? 'bg-green-600' : 'bg-red-600'}>
                                {badge.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-700">
                            <p className="text-gray-500 text-xs">
                              Criteria: {badge.criteria.description || `${badge.criteria.type} ${badge.criteria.operator} ${badge.criteria.value}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* ===== CERTIFICATES TAB ===== */}
        <TabsContent value="certificates" className="space-y-6">
          {/* Certificate Filters */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search certificates..."
                    value={certificateSearchQuery}
                    onChange={(e) => setCertificateSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white w-64"
                  />
                </div>

                <Button 
                  onClick={() => setShowCertificateEditor(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Certificate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCertificates.map((certificate, index) => (
                <motion.div
                  key={certificate.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Card className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-all duration-200 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors truncate">
                            {certificate.name}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">{certificate.courseName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="bg-blue-600 text-xs">{certificate.template}</Badge>
                            <Badge className="bg-purple-600 text-xs">{certificate.orientation}</Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          <Button size="sm" variant="outline">
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => duplicateCertificate(certificate)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-400"
                            onClick={() => deleteCertificate(certificate.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Certificate Preview */}
                        <div className="aspect-[4/3] bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-gray-700 flex items-center justify-center">
                          <div className="text-center">
                            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                            <div className="text-white font-semibold text-sm">{certificate.title}</div>
                            <div className="text-gray-400 text-xs">{certificate.colorScheme} theme</div>
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm line-clamp-2">{certificate.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Issued</span>
                            <Badge className="bg-green-600">{certificate.issuedCount.toLocaleString()}</Badge>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">QR Code</span>
                            <Badge className={certificate.includeQRCode ? 'bg-blue-600' : 'bg-gray-600'}>
                              {certificate.includeQRCode ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Expires</span>
                            <Badge className={certificate.expirationEnabled ? 'bg-orange-600' : 'bg-green-600'}>
                              {certificate.expirationEnabled ? `${certificate.expirationMonths}mo` : 'Never'}
                            </Badge>
                          </div>
                        </div>

                        {certificate.includeSkills && certificate.includeSkills.length > 0 && (
                          <div className="pt-2 border-t border-gray-700">
                            <div className="text-gray-400 text-xs mb-1">Skills:</div>
                            <div className="flex flex-wrap gap-1">
                              {certificate.includeSkills.slice(0, 3).map((skill, i) => (
                                <Badge key={i} className="bg-gray-700 text-xs">{skill}</Badge>
                              ))}
                              {certificate.includeSkills.length > 3 && (
                                <Badge className="bg-gray-700 text-xs">+{certificate.includeSkills.length - 3}</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* ===== ANALYTICS TAB ===== */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Badge Distribution</p>
                    <p className="text-2xl font-bold text-white">{badgeStats.totalEarned.toLocaleString()}</p>
                    <p className="text-green-400 text-sm">Total earned</p>
                  </div>
                  <Award className="w-12 h-12 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Certificate Success</p>
                    <p className="text-2xl font-bold text-white">94.7%</p>
                    <p className="text-blue-400 text-sm">Completion rate</p>
                  </div>
                  <Trophy className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Engagement Boost</p>
                    <p className="text-2xl font-bold text-white">+127%</p>
                    <p className="text-purple-400 text-sm">Course completion</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Verification Rate</p>
                    <p className="text-2xl font-bold text-white">98.9%</p>
                    <p className="text-green-400 text-sm">Certificate validity</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Gamification Impact Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <PieChart className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics Dashboard</h3>
                  <p>Comprehensive insights into badge effectiveness, certificate impact, and gamification ROI</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SETTINGS TAB ===== */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Badge Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-Award Badges</Label>
                    <p className="text-gray-400 text-sm">Automatically award badges when criteria are met</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Public Badge Display</Label>
                    <p className="text-gray-400 text-sm">Show badges on public student profiles</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Badge Notifications</Label>
                    <p className="text-gray-400 text-sm">Send notifications when badges are earned</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Certificate Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Digital Signatures</Label>
                    <p className="text-gray-400 text-sm">Include digital signatures on certificates</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Blockchain Verification</Label>
                    <p className="text-gray-400 text-sm">Store certificate hashes on blockchain</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-Generate PDFs</Label>
                    <p className="text-gray-400 text-sm">Automatically generate PDF certificates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== BADGE EDITOR MODAL ===== */}
      {showBadgeEditor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowBadgeEditor(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Create New Badge</h2>
              <p className="text-gray-400">Design a custom achievement badge for your students</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Badge Name *</Label>
                    <Input
                      value={badgeForm.name}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter badge name..."
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Description *</Label>
                    <Textarea
                      value={badgeForm.description}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this badge represents..."
                      rows={3}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Category</Label>
                      <Select
                        value={badgeForm.category}
                        onValueChange={(value) => setBadgeForm(prev => ({ ...prev, category: value as any }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {BADGE_CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white">Rarity</Label>
                      <Select
                        value={badgeForm.rarity}
                        onValueChange={(value) => setBadgeForm(prev => ({ ...prev, rarity: value as any }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {BADGE_RARITIES.map(rarity => (
                            <SelectItem key={rarity.value} value={rarity.value}>
                              <span className={rarity.color}>{rarity.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Points: {badgeForm.points}</Label>
                    <div className="mt-2">
                      <Input
                        type="range"
                        min="1"
                        max="200"
                        value={badgeForm.points}
                        onChange={(e) => setBadgeForm(prev => ({ ...prev, points: Number(e.target.value) }))}
                        className="bg-gray-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Badge Preview</Label>
                    <div className="mt-2 p-8 bg-gray-800 rounded-lg flex items-center justify-center">
                      <div 
                        className={`w-24 h-24 rounded-full flex items-center justify-center relative`}
                        style={{ 
                          backgroundColor: badgeForm.backgroundColor,
                          borderColor: badgeForm.color,
                          borderWidth: badgeForm.design?.border ? '3px' : '0'
                        }}
                      >
                        <Trophy className="w-12 h-12" style={{ color: badgeForm.color }} />
                        {badgeForm.design?.shadow && (
                          <div className="absolute inset-0 rounded-full shadow-2xl" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-white">Badge Color</Label>
                      <Input
                        type="color"
                        value={badgeForm.color}
                        onChange={(e) => setBadgeForm(prev => ({ ...prev, color: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white mt-1 h-10"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Background Color</Label>
                      <Input
                        type="color"
                        value={badgeForm.backgroundColor}
                        onChange={(e) => setBadgeForm(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white mt-1 h-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={badgeForm.design?.border}
                          onCheckedChange={(checked) => setBadgeForm(prev => ({ 
                            ...prev, 
                            design: { ...prev.design!, border: checked }
                          }))}
                        />
                        <Label className="text-white text-sm">Border</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={badgeForm.design?.shadow}
                          onCheckedChange={(checked) => setBadgeForm(prev => ({ 
                            ...prev, 
                            design: { ...prev.design!, shadow: checked }
                          }))}
                        />
                        <Label className="text-white text-sm">Shadow</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h3 className="text-white font-semibold mb-4">Award Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Criteria Type</Label>
                    <Select
                      value={badgeForm.criteria?.type}
                      onValueChange={(value) => setBadgeForm(prev => ({ 
                        ...prev, 
                        criteria: { ...prev.criteria!, type: value as any }
                      }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="course_completion">Course Completion</SelectItem>
                        <SelectItem value="quiz_score">Quiz Score</SelectItem>
                        <SelectItem value="streak_days">Streak Days</SelectItem>
                        <SelectItem value="time_spent">Time Spent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Value</Label>
                    <Input
                      type="number"
                      value={badgeForm.criteria?.value}
                      onChange={(e) => setBadgeForm(prev => ({ 
                        ...prev, 
                        criteria: { ...prev.criteria!, value: Number(e.target.value) }
                      }))}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Operator</Label>
                    <Select
                      value={badgeForm.criteria?.operator}
                      onValueChange={(value) => setBadgeForm(prev => ({ 
                        ...prev, 
                        criteria: { ...prev.criteria!, operator: value as any }
                      }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="gte">Greater than or equal</SelectItem>
                        <SelectItem value="lte">Less than or equal</SelectItem>
                        <SelectItem value="eq">Equal to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-white">Criteria Description</Label>
                  <Input
                    value={badgeForm.criteria?.description}
                    onChange={(e) => setBadgeForm(prev => ({ 
                      ...prev, 
                      criteria: { ...prev.criteria!, description: e.target.value }
                    }))}
                    placeholder="Describe the criteria for earning this badge..."
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowBadgeEditor(false)}
                className="bg-gray-800 border-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={createBadge}
                className="bg-yellow-600 hover:bg-yellow-700"
                disabled={!badgeForm.name || !badgeForm.description}
              >
                <Save className="w-4 h-4 mr-2" />
                Create Badge
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

