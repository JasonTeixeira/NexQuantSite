"use client"

import React from 'react'
import { motion } from 'framer-motion'
import EmailCaptureForm from './EmailCaptureForm'
import { 
  Mail, 
  TrendingUp, 
  Users, 
  Award,
  Zap,
  BarChart3,
  Brain,
  Target
} from 'lucide-react'

interface NewsletterSectionProps {
  variant?: 'default' | 'minimal' | 'feature-rich' | 'testimonial'
  className?: string
  source: string
}

export default function NewsletterSection({ 
  variant = 'default',
  className = "",
  source 
}: NewsletterSectionProps) {

  const testimonials = [
    {
      text: "The weekly insights helped me increase my portfolio returns by 34% in just 3 months.",
      author: "Sarah Chen",
      role: "Quantitative Analyst",
      avatar: "SC"
    },
    {
      text: "Best trading newsletter I've ever subscribed to. The AI predictions are incredibly accurate.",
      author: "Michael Rodriguez", 
      role: "Day Trader",
      avatar: "MR"
    },
    {
      text: "Finally, institutional-grade analysis accessible to retail traders. Game changer!",
      author: "David Kim",
      role: "Portfolio Manager",
      avatar: "DK"
    }
  ]

  const features = [
    {
      icon: Brain,
      title: "AI Market Analysis",
      description: "Advanced machine learning algorithms analyze thousands of data points weekly",
      color: "from-cyan-400 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Detailed breakdown of strategy performance with risk-adjusted returns",
      color: "from-blue-400 to-cyan-400"
    },
    {
      icon: Target,
      title: "Actionable Insights",
      description: "Specific trading opportunities with entry/exit points and risk management",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Zap,
      title: "Real-time Alerts",
      description: "Immediate notifications for high-probability trading setups",
      color: "from-blue-500 to-cyan-500"
    }
  ]

  const stats = [
    { label: "Active Subscribers", value: "12,547", icon: Users },
    { label: "Average Open Rate", value: "68.4%", icon: Mail },
    { label: "Avg. Portfolio Return", value: "+23.7%", icon: TrendingUp },
    { label: "Success Stories", value: "2,400+", icon: Award }
  ]

  if (variant === 'minimal') {
    return (
      <section className={`py-6 px-4 ${className}`}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-cyan-500/20 rounded-lg p-4"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                  <Mail className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Stay Ahead of the Markets</h3>
                  <p className="text-gray-300 text-sm">Get weekly insights from our AI-powered trading algorithms</p>
                </div>
              </div>
              <EmailCaptureForm
                variant="hero"
                source={source}
                showBenefits={false}
                showSocialProof={false}
                className="w-full sm:w-auto sm:min-w-[350px]"
              />
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  if (variant === 'testimonial') {
    return (
      <section className={`py-20 px-4 bg-gradient-to-b from-gray-900 to-black ${className}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Join 12,500+ Successful Traders
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our newsletter has helped thousands of traders achieve consistent, profitable results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Testimonials */}
            <div className="space-y-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/20 rounded-xl p-6"
                >
                  <p className="text-gray-200 mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div>
              <EmailCaptureForm
                variant="sidebar"
                source={source}
                title="Get These Results Too"
                subtitle="Join successful traders getting our weekly analysis"
                buttonText="Start Winning"
                showBenefits={true}
                showSocialProof={false}
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'feature-rich') {
    return (
      <section className={`py-24 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              The Most Advanced Trading Newsletter
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Institutional-grade market analysis delivered weekly to your inbox
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-6">
                  <stat.icon className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-20 border border-white/10`}>
                  <feature.icon className={`w-6 h-6 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <EmailCaptureForm
              variant="hero"
              source={source}
              title="Ready to Transform Your Trading?"
              subtitle="Join the community of successful quantitative traders"
              buttonText="Get My Edge"
              showBenefits={true}
              showSocialProof={true}
              className="max-w-3xl mx-auto"
            />
          </motion.div>
        </div>
      </section>
    )
  }

  // Default variant
  return (
    <section className={`py-24 px-4 bg-gradient-to-b from-black via-gray-900 to-black ${className}`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 flex items-center justify-center">
              <Mail className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-cyan-400 font-mono text-sm tracking-wider">FREE NEWSLETTER</div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Never Miss a Trading Opportunity
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Get weekly insights from our AI-powered analysis, sent directly to your inbox every Sunday
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Target className="w-6 h-6 text-cyan-400" />
              What You'll Get:
            </h3>
            
            {features.slice(0, 3).map((feature, index) => (
              <motion.div 
                key={feature.title} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-6 p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-20 border border-cyan-500/20 flex-shrink-0`}>
                  <feature.icon className="w-7 h-7 text-cyan-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:sticky lg:top-8"
          >
            <EmailCaptureForm
              variant="sidebar"
              source={source}
              title="Get Your Edge"
              subtitle="Join 12,500+ successful traders"
              showBenefits={true}
              showSocialProof={true}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
