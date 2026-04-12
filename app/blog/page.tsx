import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { FileText, TrendingUp, Calendar, User, Clock, ArrowRight, BookOpen, MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Trading Blog - Market Insights & Analysis | Nexural",
  description: "Expert trading insights, market analysis, strategy guides, and the latest updates from the Nexural team.",
}

const blogPosts = [
  {
    title: "Machine Learning in High-Frequency Trading: A Complete Guide",
    excerpt: "Explore how machine learning algorithms are revolutionizing HFT strategies and improving execution quality.",
    author: "Dr. Sarah Chen",
    date: "Dec 28, 2024",
    readTime: "12 min read",
    category: "AI & ML",
    featured: true
  },
  {
    title: "Risk Management Strategies for Algorithmic Trading",
    excerpt: "Learn essential risk management techniques to protect your capital while trading algorithmically.",
    author: "Michael Rodriguez",
    date: "Dec 26, 2024",
    readTime: "8 min read",
    category: "Risk Management"
  },
  {
    title: "Building Your First Trading Bot: Step-by-Step Tutorial",
    excerpt: "A comprehensive guide to creating, testing, and deploying your first automated trading bot.",
    author: "Alex Thompson",
    date: "Dec 24, 2024",
    readTime: "15 min read",
    category: "Tutorials"
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
              <FileText className="w-4 h-4 mr-2" />
              Insights & Analysis
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Trading Blog
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Expert insights, market analysis, and trading strategies from our team of 
              quantitative analysts and professional traders.
            </p>
          </div>

          {/* Blog Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Articles</p>
                  <p className="text-2xl font-bold text-white">524</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Categories</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-400" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Contributors</p>
                  <p className="text-2xl font-bold text-white">48</p>
                </div>
                <User className="w-8 h-8 text-purple-400" />
              </div>
            </Card>
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Weekly Readers</p>
                  <p className="text-2xl font-bold text-white">25K+</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </Card>
          </div>

          {/* Featured Post */}
          {blogPosts.filter(p => p.featured).map((post, idx) => (
            <Card key={idx} className="bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/30 p-8 mb-12">
              <Badge className="mb-3 bg-yellow-500/20 text-yellow-400 border-yellow-400/30">Featured</Badge>
              <h2 className="text-3xl font-bold mb-3">{post.title}</h2>
              <p className="text-gray-300 text-lg mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {post.author}</span>
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {post.date}</span>
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {post.readTime}</span>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  Read Article <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}

          {/* Recent Posts */}
          <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {blogPosts.filter(p => !p.featured).map((post, idx) => (
              <Card key={idx} className="bg-gray-900/50 border-gray-800 p-6 hover:border-primary/50 transition">
                <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">{post.category}</Badge>
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-gray-400 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated with Market Insights</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and never miss important market updates, 
              trading strategies, and educational content.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <MessageSquare className="w-5 h-5 mr-2" />
                Subscribe to Newsletter
              </Button>
              <Button size="lg" variant="outline">
                View All Articles
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
