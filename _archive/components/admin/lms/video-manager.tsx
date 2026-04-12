"use client"

import React, { useState, useEffect, useMemo, useRef } from 'react'
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
  Video,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Eye,
  Download,
  Share2,
  Edit3,
  Trash2,
  Copy,
  MoreVertical,
  Clock,
  FileVideo,
  Image,
  Subtitles,
  Mic,
  Camera,
  Film,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Zap,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  PlayCircle,
  Search,
  Filter,
  SortDesc,
  Grid3X3,
  List,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Layers,
  Database,
  Globe,
  Lock,
  Unlock,
  Star,
  Heart,
  MessageSquare,
  Target,
  Calendar,
  CloudUpload,
  HardDrive,
  Wifi,
  WifiOff
} from "lucide-react"
import { toast } from "sonner"
import { VideoContent } from "@/lib/lms/models"

interface VideoFile {
  id: string
  title: string
  description: string
  filename: string
  originalName: string
  duration: number
  size: number
  format: string
  resolution: string
  fps: number
  bitrate: number
  
  // Processing Status
  status: 'uploading' | 'processing' | 'ready' | 'error' | 'archived'
  uploadProgress: number
  processingProgress: number
  
  // Versions/Quality
  versions: {
    quality: '360p' | '720p' | '1080p' | '4k'
    url: string
    size: number
    bitrate: number
    status: 'processing' | 'ready' | 'error'
  }[]
  
  // Metadata
  thumbnail: string
  poster: string
  hasAudio: boolean
  hasSubtitles: boolean
  subtitles: {
    language: string
    label: string
    url: string
    isDefault: boolean
  }[]
  
  // Analytics
  views: number
  totalWatchTime: number
  averageWatchTime: number
  completionRate: number
  engagement: number
  
  // Settings
  isPublic: boolean
  allowDownload: boolean
  allowEmbedding: boolean
  requireAuth: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
  lastViewed: string
}

const QUALITY_OPTIONS = [
  { value: '360p', label: '360p - Mobile', size: '~50MB/hour', bitrate: '500 kbps' },
  { value: '720p', label: '720p - HD', size: '~150MB/hour', bitrate: '1.5 Mbps' },
  { value: '1080p', label: '1080p - Full HD', size: '~300MB/hour', bitrate: '3 Mbps' },
  { value: '4k', label: '4K - Ultra HD', size: '~1GB/hour', bitrate: '8 Mbps' }
]

const VIDEO_CATEGORIES = [
  'Lessons',
  'Tutorials',
  'Demos',
  'Presentations',
  'Webinars',
  'Interviews',
  'Case Studies',
  'Promos'
]

const MOCK_VIDEOS: VideoFile[] = [
  {
    id: 'vid1',
    title: 'Introduction to Technical Analysis',
    description: 'Learn the fundamentals of technical analysis and chart patterns',
    filename: 'tech-analysis-intro.mp4',
    originalName: 'Technical Analysis Introduction.mp4',
    duration: 1845, // 30:45
    size: 892000000, // ~850MB
    format: 'MP4',
    resolution: '1920x1080',
    fps: 30,
    bitrate: 4000,
    
    status: 'ready',
    uploadProgress: 100,
    processingProgress: 100,
    
    versions: [
      { quality: '360p', url: '/videos/tech-analysis-360p.mp4', size: 120000000, bitrate: 500, status: 'ready' },
      { quality: '720p', url: '/videos/tech-analysis-720p.mp4', size: 280000000, bitrate: 1500, status: 'ready' },
      { quality: '1080p', url: '/videos/tech-analysis-1080p.mp4', size: 560000000, bitrate: 3000, status: 'ready' }
    ],
    
    thumbnail: '/api/placeholder/320/180',
    poster: '/api/placeholder/1920/1080',
    hasAudio: true,
    hasSubtitles: true,
    subtitles: [
      { language: 'en', label: 'English', url: '/subtitles/tech-analysis-en.vtt', isDefault: true },
      { language: 'es', label: 'Spanish', url: '/subtitles/tech-analysis-es.vtt', isDefault: false }
    ],
    
    views: 15420,
    totalWatchTime: 12650, // minutes
    averageWatchTime: 24.5, // minutes
    completionRate: 78.5,
    engagement: 85.2,
    
    isPublic: true,
    allowDownload: false,
    allowEmbedding: true,
    requireAuth: true,
    
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T12:45:00Z',
    lastViewed: '2024-01-20T09:15:00Z'
  },
  {
    id: 'vid2',
    title: 'Risk Management Strategies',
    description: 'Master the art of protecting your trading capital',
    filename: 'risk-management.mp4',
    originalName: 'Risk Management Advanced.mp4',
    duration: 2280, // 38:00
    size: 1100000000, // ~1.1GB
    format: 'MP4',
    resolution: '1920x1080',
    fps: 30,
    bitrate: 4000,
    
    status: 'processing',
    uploadProgress: 100,
    processingProgress: 65,
    
    versions: [
      { quality: '360p', url: '/videos/risk-mgmt-360p.mp4', size: 150000000, bitrate: 500, status: 'ready' },
      { quality: '720p', url: '/videos/risk-mgmt-720p.mp4', size: 340000000, bitrate: 1500, status: 'processing' },
      { quality: '1080p', url: '/videos/risk-mgmt-1080p.mp4', size: 680000000, bitrate: 3000, status: 'processing' }
    ],
    
    thumbnail: '/api/placeholder/320/180',
    poster: '/api/placeholder/1920/1080',
    hasAudio: true,
    hasSubtitles: false,
    subtitles: [],
    
    views: 8750,
    totalWatchTime: 8900,
    averageWatchTime: 29.2,
    completionRate: 82.1,
    engagement: 88.7,
    
    isPublic: true,
    allowDownload: true,
    allowEmbedding: false,
    requireAuth: true,
    
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-18T16:35:00Z',
    lastViewed: '2024-01-20T11:30:00Z'
  }
]

interface VideoManagerProps {
  onVideoSelect?: (video: VideoFile) => void
}

export default function VideoManager({ onVideoSelect }: VideoManagerProps) {
  // ===== STATE MANAGEMENT =====
  const [videos, setVideos] = useState<VideoFile[]>(MOCK_VIDEOS)
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null)
  const [activeTab, setActiveTab] = useState('library')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // ===== EVENT HANDLERS =====
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('video/')) {
        uploadVideo(file)
      } else {
        toast.error(`${file.name} is not a valid video file`)
      }
    })
  }

  const uploadVideo = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    const newVideo: VideoFile = {
      id: `vid${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      description: '',
      filename: file.name,
      originalName: file.name,
      duration: 0,
      size: file.size,
      format: file.type.split('/')[1].toUpperCase(),
      resolution: '1920x1080', // Will be detected during processing
      fps: 30,
      bitrate: 3000,
      
      status: 'uploading',
      uploadProgress: 0,
      processingProgress: 0,
      
      versions: [],
      
      thumbnail: '/api/placeholder/320/180',
      poster: '/api/placeholder/1920/1080',
      hasAudio: true,
      hasSubtitles: false,
      subtitles: [],
      
      views: 0,
      totalWatchTime: 0,
      averageWatchTime: 0,
      completionRate: 0,
      engagement: 0,
      
      isPublic: false,
      allowDownload: false,
      allowEmbedding: false,
      requireAuth: true,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastViewed: new Date().toISOString()
    }

    setVideos(prev => [newVideo, ...prev])

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(uploadInterval)
          setIsUploading(false)
          setUploadProgress(0)
          
          // Start processing
          setTimeout(() => {
            setVideos(prevVideos => 
              prevVideos.map(v => 
                v.id === newVideo.id 
                  ? { ...v, status: 'processing', uploadProgress: 100 }
                  : v
              )
            )
            simulateProcessing(newVideo.id)
          }, 1000)
          
          toast.success(`${file.name} uploaded successfully!`)
          return 100
        }
        return newProgress
      })
    }, 200)

    // Update video upload progress
    const progressInterval = setInterval(() => {
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === newVideo.id 
            ? { ...v, uploadProgress: uploadProgress }
            : v
        )
      )
    }, 100)

    setTimeout(() => clearInterval(progressInterval), 10000)
  }

  const simulateProcessing = (videoId: string) => {
    let progress = 0
    const processingInterval = setInterval(() => {
      progress += Math.random() * 5
      
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === videoId 
            ? { ...v, processingProgress: Math.min(progress, 100) }
            : v
        )
      )

      if (progress >= 100) {
        clearInterval(processingInterval)
        
        // Complete processing
        setVideos(prevVideos => 
          prevVideos.map(v => 
            v.id === videoId 
              ? { 
                  ...v, 
                  status: 'ready', 
                  processingProgress: 100,
                  versions: [
                    { quality: '360p', url: `/videos/${videoId}-360p.mp4`, size: 120000000, bitrate: 500, status: 'ready' },
                    { quality: '720p', url: `/videos/${videoId}-720p.mp4`, size: 280000000, bitrate: 1500, status: 'ready' },
                    { quality: '1080p', url: `/videos/${videoId}-1080p.mp4`, size: 560000000, bitrate: 3000, status: 'ready' }
                  ]
                }
              : v
          )
        )
        
        toast.success('Video processing completed!')
      }
    }, 300)
  }

  const deleteVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId))
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null)
    }
    toast.success('Video deleted successfully')
  }

  const duplicateVideo = (video: VideoFile) => {
    const duplicatedVideo: VideoFile = {
      ...video,
      id: `vid${Date.now()}`,
      title: `${video.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      totalWatchTime: 0
    }

    setVideos(prev => [duplicatedVideo, ...prev])
    toast.success('Video duplicated successfully')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // ===== COMPUTED VALUES =====
  const filteredVideos = useMemo(() => {
    let filtered = videos

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filterCategory !== 'all') {
      // This would filter by actual category in real implementation
      filtered = filtered.filter(video => video.status === filterCategory)
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'views':
        filtered.sort((a, b) => b.views - a.views)
        break
      case 'duration':
        filtered.sort((a, b) => b.duration - a.duration)
        break
      case 'size':
        filtered.sort((a, b) => b.size - a.size)
        break
    }

    return filtered
  }, [videos, searchQuery, filterCategory, sortBy])

  const totalStorage = useMemo(() => {
    return videos.reduce((total, video) => total + video.size, 0)
  }, [videos])

  const videoStats = useMemo(() => {
    return {
      total: videos.length,
      ready: videos.filter(v => v.status === 'ready').length,
      processing: videos.filter(v => v.status === 'processing').length,
      uploading: videos.filter(v => v.status === 'uploading').length,
      totalViews: videos.reduce((sum, v) => sum + v.views, 0),
      totalWatchTime: videos.reduce((sum, v) => sum + v.totalWatchTime, 0)
    }
  }, [videos])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Video className="w-8 h-8 mr-3 text-blue-400" />
            Video Management System
          </h1>
          <p className="text-gray-400">
            Upload, process, and manage your educational video content
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Videos'}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* ===== STATS BANNER ===== */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{videoStats.total}</p>
              <p className="text-gray-400 text-sm">Total Videos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{videoStats.ready}</p>
              <p className="text-gray-400 text-sm">Ready</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{videoStats.processing}</p>
              <p className="text-gray-400 text-sm">Processing</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{videoStats.totalViews.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">Total Views</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{Math.round(videoStats.totalWatchTime / 60)}h</p>
              <p className="text-gray-400 text-sm">Watch Time</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{formatFileSize(totalStorage)}</p>
              <p className="text-gray-400 text-sm">Storage Used</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== UPLOAD PROGRESS ===== */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Uploading videos...</span>
            <span className="text-blue-400">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </motion.div>
      )}

      {/* ===== MAIN TABS ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-900 border border-gray-800">
          <TabsTrigger value="library" className="data-[state=active]:bg-blue-600">
            📚 Library
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-blue-600">
            ⬆️ Upload
          </TabsTrigger>
          <TabsTrigger value="processing" className="data-[state=active]:bg-blue-600">
            ⚙️ Processing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600">
            📊 Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
            🔧 Settings
          </TabsTrigger>
        </TabsList>

        {/* ===== LIBRARY TAB ===== */}
        <TabsContent value="library" className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white w-64"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Videos</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="uploading">Uploading</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="duration">Longest</SelectItem>
                  <SelectItem value="size">Largest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Video Grid/List */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {filteredVideos.map(video => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group"
                >
                  <Card className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-all duration-200">
                    <div className="relative">
                      <div className="aspect-video bg-gray-800 rounded-t-lg overflow-hidden">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        
                        {/* Status Overlay */}
                        <div className="absolute top-2 left-2">
                          {video.status === 'ready' && (
                            <Badge className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ready
                            </Badge>
                          )}
                          {video.status === 'processing' && (
                            <Badge className="bg-yellow-600">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Processing {Math.round(video.processingProgress)}%
                            </Badge>
                          )}
                          {video.status === 'uploading' && (
                            <Badge className="bg-blue-600">
                              <Upload className="w-3 h-3 mr-1" />
                              Uploading {Math.round(video.uploadProgress)}%
                            </Badge>
                          )}
                          {video.status === 'error' && (
                            <Badge className="bg-red-600">
                              <XCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>

                        {/* Duration */}
                        {video.duration > 0 && (
                          <div className="absolute bottom-2 right-2">
                            <Badge className="bg-black/70 text-white">
                              {formatDuration(video.duration)}
                            </Badge>
                          </div>
                        )}

                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Button
                            size="sm"
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                            onClick={() => setSelectedVideo(video)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>

                      {/* Video Info */}
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="text-white font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
                              {video.title}
                            </h3>
                            {video.description && (
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                {video.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{video.views.toLocaleString()}</span>
                              </span>
                              <span>{formatFileSize(video.size)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              {video.isPublic ? (
                                <Globe className="w-3 h-3 text-green-400" />
                              ) : (
                                <Lock className="w-3 h-3 text-gray-400" />
                              )}
                              {video.hasSubtitles && (
                                <Subtitles className="w-3 h-3 text-blue-400" />
                              )}
                            </div>
                          </div>

                          {/* Quality Indicators */}
                          <div className="flex items-center space-x-1">
                            {video.versions.map(version => (
                              <Badge 
                                key={version.quality}
                                className={`text-xs ${
                                  version.status === 'ready' ? 'bg-green-600' : 
                                  version.status === 'processing' ? 'bg-yellow-600' : 'bg-gray-600'
                                }`}
                              >
                                {version.quality}
                              </Badge>
                            ))}
                          </div>

                          {/* Processing Progress */}
                          {video.status === 'processing' && (
                            <div className="space-y-1">
                              <Progress value={video.processingProgress} className="h-1" />
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedVideo(video)}>
                                <Play className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => duplicateVideo(video)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-400 hover:text-red-300"
                              onClick={() => deleteVideo(video.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-16">
              <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first video to get started'
                }
              </p>
              {!searchQuery && filterCategory === 'all' && (
                <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Video
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* ===== UPLOAD TAB ===== */}
        <TabsContent value="upload" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CloudUpload className="w-5 h-5 mr-2" />
                Upload Videos
              </CardTitle>
              <p className="text-gray-400">
                Drag and drop videos here or click to browse
              </p>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const files = Array.from(e.dataTransfer.files)
                  files.forEach(file => {
                    if (file.type.startsWith('video/')) {
                      uploadVideo(file)
                    }
                  })
                }}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Upload Videos</h3>
                <p className="text-gray-400 mb-4">
                  Supports MP4, MOV, AVI, WebM up to 2GB per file
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Browse Files
                </Button>
              </div>
              
              <div className="mt-6 space-y-4">
                <h4 className="text-white font-semibold">Supported Formats & Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                  <div>
                    <strong className="text-white">Video Formats:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>MP4 (H.264/H.265)</li>
                      <li>MOV (QuickTime)</li>
                      <li>AVI (DivX/Xvid)</li>
                      <li>WebM (VP8/VP9)</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-white">Processing Features:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Auto-generate multiple qualities</li>
                      <li>Thumbnail extraction</li>
                      <li>Subtitle support (.srt, .vtt)</li>
                      <li>Audio normalization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PROCESSING TAB ===== */}
        <TabsContent value="processing" className="space-y-6">
          <div className="space-y-4">
            {videos.filter(v => v.status === 'processing' || v.status === 'uploading').map(video => (
              <Card key={video.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-32 h-18 bg-gray-800 rounded overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{video.title}</h3>
                      <p className="text-gray-400 text-sm">{formatFileSize(video.size)} • {video.format}</p>
                      
                      <div className="mt-3 space-y-2">
                        {video.status === 'uploading' && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-blue-400">Uploading...</span>
                              <span className="text-gray-400">{Math.round(video.uploadProgress)}%</span>
                            </div>
                            <Progress value={video.uploadProgress} className="h-2" />
                          </div>
                        )}
                        
                        {video.status === 'processing' && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-yellow-400">Processing...</span>
                              <span className="text-gray-400">{Math.round(video.processingProgress)}%</span>
                            </div>
                            <Progress value={video.processingProgress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-400"
                        onClick={() => deleteVideo(video.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {videos.filter(v => v.status === 'processing' || v.status === 'uploading').length === 0 && (
            <div className="text-center py-16">
              <RefreshCw className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No videos processing</h3>
              <p className="text-gray-400">All videos are ready or upload some new ones</p>
            </div>
          )}
        </TabsContent>

        {/* ===== ANALYTICS TAB ===== */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-white">{videoStats.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Watch Time</p>
                    <p className="text-2xl font-bold text-white">{Math.round(videoStats.totalWatchTime / 60)}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Avg Completion</p>
                    <p className="text-2xl font-bold text-white">79%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Storage Used</p>
                    <p className="text-2xl font-bold text-white">{formatFileSize(totalStorage)}</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Video Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Detailed analytics charts will be implemented here</p>
                  <p className="text-sm">View counts, engagement metrics, and performance insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SETTINGS TAB ===== */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Video Processing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">Default Quality Settings</Label>
                  <div className="space-y-3 mt-2">
                    {QUALITY_OPTIONS.map(quality => (
                      <div key={quality.value} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{quality.label}</div>
                          <div className="text-gray-400 text-sm">{quality.size} • {quality.bitrate}</div>
                        </div>
                        <Switch defaultChecked={quality.value !== '4k'} />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Auto-generate Thumbnails</Label>
                    <p className="text-gray-400 text-sm">Extract thumbnails at multiple timestamps</p>
                    <Switch defaultChecked className="mt-2" />
                  </div>
                  
                  <div>
                    <Label className="text-white">Auto-detect Subtitles</Label>
                    <p className="text-gray-400 text-sm">Generate automatic captions using AI</p>
                    <Switch defaultChecked className="mt-2" />
                  </div>
                  
                  <div>
                    <Label className="text-white">Audio Normalization</Label>
                    <p className="text-gray-400 text-sm">Automatically adjust audio levels</p>
                    <Switch defaultChecked className="mt-2" />
                  </div>
                  
                  <div>
                    <Label className="text-white">Content Protection</Label>
                    <p className="text-gray-400 text-sm">Enable DRM and watermarking</p>
                    <Switch className="mt-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== VIDEO PREVIEW MODAL ===== */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedVideo.title}</h2>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedVideo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Play className="w-16 h-16 mx-auto mb-4" />
                    <p>Video Player Placeholder</p>
                    <p className="text-gray-400 text-sm">Actual video player will be implemented here</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-2">Video Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{formatDuration(selectedVideo.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white">{formatFileSize(selectedVideo.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resolution:</span>
                      <span className="text-white">{selectedVideo.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Format:</span>
                      <span className="text-white">{selectedVideo.format}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Views:</span>
                      <span className="text-white">{selectedVideo.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">Available Qualities</h3>
                  <div className="space-y-2">
                    {selectedVideo.versions.map(version => (
                      <div key={version.quality} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <span className="text-white">{version.quality}</span>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            version.status === 'ready' ? 'bg-green-600' : 
                            version.status === 'processing' ? 'bg-yellow-600' : 'bg-red-600'
                          }>
                            {version.status}
                          </Badge>
                          <span className="text-gray-400 text-sm">{formatFileSize(version.size)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

