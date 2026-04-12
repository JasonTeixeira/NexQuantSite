"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, MessageCircle, TrendingUp, Bell, BookOpen, Award, Star, CheckCircle, ArrowRight, Zap, Shield, Globe, Heart, Trophy, Target, Rocket, Crown, Gift } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function JoinFreePageClient() {
  const [memberCount, setMemberCount] = useState(12847)
  const [activeUsers, setActiveUsers] = useState(1247)
  const [messagesCount, setMessagesCount] = useState(847291)

  // Animate counters
  useEffect(() => {
    const interval = setInterval(() => {
      setMemberCount(prev => prev + Math.floor(Math.random() * 3))
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2)
      setMessagesCount(prev => prev + Math.floor(Math.random() * 10))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const benefits = [
    {
      icon: MessageCircle,
      title: "Real-Time Trading Discussions",
      description: "Join thousands of active traders sharing insights, strategies, and market analysis 24/7",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Bell,
      title: "Free Signal Alerts",
      description: "Get notified of high-probability trading opportunities from our community experts",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      description: "Access free trading guides, tutorials, and educational content for all skill levels",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: TrendingUp,
      title: "Market Analysis",
      description: "Daily market breakdowns, technical analysis, and trend identification from pros",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Networking Opportunities",
      description: "Connect with like-minded traders, form partnerships, and learn from experienced professionals",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Award,
      title: "Trading Competitions",
      description: "Participate in regular trading contests with prizes and recognition for top performers",
      color: "from-indigo-500 to-blue-500"
    }
  ]

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Day Trader",
      avatar: "/placeholder.svg?height=60&width=60&text=AC",
      content: "The Discord community has been invaluable for my trading journey. The real-time discussions and signal alerts have helped me improve my win rate significantly.",
      rating: 5,
      profit: "+$12,400"
    },
    {
      name: "Sarah Martinez",
      role: "Swing Trader",
      avatar: "/placeholder.svg?height=60&width=60&text=SM",
      content: "Amazing community! The educational resources are top-notch and the market analysis helps me make better trading decisions every day.",
      rating: 5,
      profit: "+$8,750"
    },
    {
      name: "Mike Johnson",
      role: "Options Trader",
      avatar: "/placeholder.svg?height=60&width=60&text=MJ",
      content: "I've learned more in 3 months here than in years of trading alone. The community support and shared knowledge is incredible.",
      rating: 5,
      profit: "+$15,200"
    }
  ]

  const features = [
    { icon: Zap, title: "Instant Access", desc: "Join immediately, no waiting period" },
    { icon: Shield, title: "Safe Environment", desc: "Moderated channels, spam-free discussions" },
    { icon: Globe, title: "Global Community", desc: "Traders from 50+ countries worldwide" },
    { icon: Heart, title: "Supportive Culture", desc: "Helpful community that celebrates wins together" }
  ]

  const channels = [
    { name: "📈 general-trading", members: "2,847 members", description: "Main trading discussion and market talk" },
    { name: "🚨 free-signals", members: "3,124 members", description: "Community-shared trading signals and alerts" },
    { name: "📚 education", members: "1,956 members", description: "Learning resources and trading tutorials" },
    { name: "💬 chat", members: "4,231 members", description: "General chat and community discussions" },
    { name: "🎯 analysis", members: "2,103 members", description: "Technical and fundamental analysis sharing" },
    { name: "🏆 wins-losses", members: "1,847 members", description: "Share your trading results and learn from others" }
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-black to-blue-500/10" />
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 pt-20"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-8"
          >
            <Crown className="w-5 h-5 text-green-500" />
            <span className="text-green-500 font-semibold">100% FREE FOREVER</span>
            <Gift className="w-5 h-5 text-green-500" />
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-transparent">
            JOIN THE NEXURAL
            <br />
            DISCORD COMMUNITY
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Connect with <span className="text-green-500 font-bold">{memberCount.toLocaleString()}+</span> active traders, 
            get free signals, and accelerate your trading journey in our thriving Discord community.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold text-xl px-12 py-6 rounded-xl shadow-2xl shadow-green-500/25"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Join Discord Community
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
          >
            <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-500">{memberCount.toLocaleString()}</div>
                <div className="text-gray-400">Total Members</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-500">{activeUsers.toLocaleString()}</div>
                <div className="text-gray-400">Online Now</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-500">{messagesCount.toLocaleString()}</div>
                <div className="text-gray-400">Messages Sent</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            What You Get <span className="text-green-500">Absolutely FREE</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Join thousands of successful traders and get access to premium features without paying a dime
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${benefit.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Discord Channels Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Explore Our <span className="text-green-500">Active Channels</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Get a sneak peek at our organized Discord server with dedicated channels for every trading need
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {channels.map((channel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-green-400 group-hover:text-green-300 transition-colors">
                        {channel.name}
                      </h3>
                      <span className="text-sm text-gray-500">{channel.members}</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {channel.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Success Stories from Our <span className="text-green-500">Community</span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Real results from real traders who started their journey in our Discord community
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.avatar || "/placeholder.svg"} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                      </div>
                      <div className="ml-auto">
                        <div className="text-green-500 font-bold text-lg">{testimonial.profit}</div>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm text-center p-6 hover:bg-white/10 transition-all duration-300">
                  <feature.icon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-12 mb-20"
        >
          <Trophy className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Join <span className="text-green-500">{memberCount.toLocaleString()}+</span> Successful Traders?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Don't trade alone. Join our supportive community where beginners become profitable traders 
            and experienced traders share their winning strategies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>Instant access</span>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>Free forever</span>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-black font-bold text-2xl px-16 py-8 rounded-xl shadow-2xl shadow-green-500/25"
            >
              <Rocket className="w-8 h-8 mr-4" />
              JOIN DISCORD NOW
              <ArrowRight className="w-8 h-8 ml-4" />
            </Button>
          </motion.div>

          <p className="text-sm text-gray-500 mt-6">
            Join {Math.floor(Math.random() * 50) + 20} traders who joined in the last hour
          </p>
        </motion.div>
      </div>
    </div>
  )
}
