"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image" 
import { motion } from "framer-motion"
import {
  User,
  MapPin,
  Calendar,
  Star,
  Eye,
  Users,
  FileText,
  Award,
  ExternalLink,
  Twitter,
  Linkedin,
  Globe,
  TrendingUp,
  Clock,
  ArrowLeft,
  Share2,
  Mail,
  MessageCircle,
  Heart,
  Bookmark
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface AuthorProfile {
  name: string
  displayName: string
  avatar: string
  expertise: string
  bio: string
  credentials: string[]
  socialLinks: {
    twitter?: string
    linkedin?: string
    website?: string
  }
  stats: {
    articles: number
    followers: number
    totalViews: number
    averageRating: number
  }
  recentArticles: Array<{
    title: string
    slug: string
    publishedAt: string
    views: number
    excerpt: string
  }>
}

interface AuthorProfileClientProps {
  author: AuthorProfile
}

export default function AuthorProfileClient({ author }: AuthorProfileClientProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    })
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/blog">
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </motion.div>

        {/* Author Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col items-center lg:items-start flex-shrink-0">
                  <Avatar className="w-32 h-32 mb-4 ring-4 ring-primary/20">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback className="bg-gray-700 text-white text-3xl font-bold">
                      {author.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h1 className="text-3xl font-bold text-white text-center lg:text-left mb-2">
                    {author.displayName}
                  </h1>
                  
                  <Badge className="bg-primary/20 text-primary border-primary/50 mb-4">
                    <Award className="w-4 h-4 mr-2" />
                    {author.expertise} Expert
                  </Badge>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-6 ${
                        isFollowing 
                          ? "bg-gray-700 text-white hover:bg-gray-600" 
                          : "bg-primary text-black hover:bg-primary/90"
                      }`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline" className="border-gray-700 text-gray-400 hover:text-white">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="border-gray-700 text-gray-400 hover:text-white">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Bio & Details */}
                <div className="flex-1">
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {author.bio}
                  </p>

                  {/* Credentials */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Credentials & Experience
                    </h3>
                    <ul className="space-y-2">
                      {author.credentials.map((credential, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-400">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {credential}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Social Links */}
                  {(author.socialLinks.twitter || author.socialLinks.linkedin || author.socialLinks.website) && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3">Connect</h3>
                      <div className="flex gap-3">
                        {author.socialLinks.twitter && (
                          <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-primary">
                            <Twitter className="w-4 h-4 mr-2" />
                            Twitter
                          </Button>
                        )}
                        {author.socialLinks.linkedin && (
                          <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-primary">
                            <Linkedin className="w-4 h-4 mr-2" />
                            LinkedIn
                          </Button>
                        )}
                        {author.socialLinks.website && (
                          <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-primary">
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats Panel */}
                <div className="lg:w-64 flex-shrink-0">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {author.stats.articles}
                        </div>
                        <div className="text-sm text-gray-400">Articles</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {formatNumber(author.stats.followers)}
                        </div>
                        <div className="text-sm text-gray-400">Followers</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {formatNumber(author.stats.totalViews)}
                        </div>
                        <div className="text-sm text-gray-400">Total Views</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800/50 border-gray-700/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-400 mb-1 flex items-center justify-center gap-1">
                          <Star className="w-5 h-5 fill-current" />
                          {author.stats.averageRating}
                        </div>
                        <div className="text-sm text-gray-400">Avg Rating</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Recent Articles
            </h2>
            <Badge variant="outline" className="border-primary/50 text-primary">
              {author.recentArticles.length} articles
            </Badge>
          </div>

          <div className="grid gap-6">
            {author.recentArticles.map((article, index) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-primary/10 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link href={`/blog/${article.slug}`}>
                          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                        </Link>
                        <p className="text-gray-400 leading-relaxed line-clamp-3 mb-4">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {formatNumber(article.views)} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.floor(Math.random() * 5) + 4} min read
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-primary">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-primary">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Link href={`/blog/${article.slug}`}>
                          <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                            Read Article
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View All Articles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <Link href={`/blog?author=${author.name}`}>
              <Button className="bg-primary text-black hover:bg-primary/90 px-8">
                <FileText className="w-4 h-4 mr-2" />
                View All {author.stats.articles} Articles
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}


