"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Github, Twitter, Linkedin, Mail, MapPin, Phone, Gift, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import EmailCaptureForm from "@/components/newsletter/EmailCaptureForm"

// Client-side floating elements to avoid hydration mismatch
function FloatingElements() {
  const [elements, setElements] = useState<Array<{
    left: number
    top: number
    duration: number
    delay: number
  }>>([])

  useEffect(() => {
    // Generate random positions only on client side
    const newElements = Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }))
    setElements(newElements)
  }, [])

  return (
    <>
      {elements.map((element, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/10 rounded-full"
          style={{
            left: `${element.left}%`,
            top: `${element.top}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: element.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: element.delay,
          }}
        />
      ))}
    </>
  )
}

export default function Footer() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()
  
  // Don't render footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null
  }

  const footerLinks = {
    platform: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Trading Bots", href: "/bots" },
      { name: "Indicators", href: "/indicators" },
      { name: "Strategy Lab", href: "/strategy-lab" },
      { name: "Risk Calculator", href: "/risk-calculator" },
      { name: "Backtesting", href: "/backtesting" },
      { name: "My Referrals", href: "/referrals" },
    ],
    resources: [
      { name: "Blog", href: "/blog" },
      { name: "Training", href: "/training" },
      { name: "Glossary", href: "/glossary" },
      { name: "Q&A", href: "/qa" },
      { name: "About", href: "/about" },
      { name: "Pricing", href: "/pricing" },
      { name: "Community Guidelines", href: "/community-guidelines" },
      { name: "Changelog", href: "/changelog" },
      { name: "System Status", href: "/status" },
    ],
    legal: [
      { name: "Terms of Service", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Risk Disclosure", href: "/risk" },
      { name: "Legal Hub", href: "/legal" },
    ],
    community: [
      { name: "Trading Community", href: "/community" },
      { name: "Member Directory", href: "/members" },
      { name: "Leaderboards", href: "/leaderboards" },
      { name: "Referral Champions", href: "/referral-leaderboard" },
      { name: "Achievements", href: "/achievements" },
      { name: "Social Feed", href: "/community" },
    ],
    company: [
      { name: "Investors", href: "/investors" },
      { name: "Careers", href: "/jobs" },
      { name: "Contact", href: "/contact" },
      { name: "Press Kit", href: "/about#press" },
      { name: "Partners", href: "/about#partners" },
    ],
  }

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/nexural", icon: Twitter },
    { name: "LinkedIn", href: "https://linkedin.com/company/nexural", icon: Linkedin },
    { name: "GitHub", href: "https://github.com/nexural", icon: Github },
    { name: "Email", href: "mailto:contact@nexural.com", icon: Mail },
  ]

  return (
    <footer className="relative bg-black border-t border-primary/20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(0,255,102,0.03)_0%,transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        {/* Referral Program CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 border border-primary/20 rounded-2xl backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-6 py-2 mb-6">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">Referral Program</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
              Earn While You Share
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Join our exclusive referral program and earn up to <span className="text-primary font-bold">35% commission </span> 
              for every successful referral. Start building your passive income today!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/referrals">
                <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-semibold">
                  <Users className="w-5 h-5 mr-2" />
                  Start Referring Now
                </Button>
              </Link>
              <Link href="/referrals#tiers">
                <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                  <DollarSign className="w-5 h-5 mr-2" />
                  View Commission Rates
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-primary mb-2">35%</div>
                <div className="text-gray-300">Max Commission Rate</div>
              </div>
              <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-400 mb-2">$2.5M+</div>
                <div className="text-gray-300">Paid to Affiliates</div>
              </div>
              <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-blue-400 mb-2">5,000+</div>
                <div className="text-gray-300">Active Referrers</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="font-display text-3xl font-bold text-primary">NEXURAL</div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Advanced quantitative trading platform powered by artificial intelligence. Democratizing
                institutional-grade trading strategies for retail traders worldwide.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>New York, NY • London, UK</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>contact@nexural.com</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Platform Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-display text-lg font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm font-display"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm font-display"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Community Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-display text-lg font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm font-display"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-display text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm font-display"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-display text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-sm font-display"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {/* Add Referrals link */}
              <li>
                <Link
                  href="/referral-program"
                  className="text-primary hover:text-primary/80 transition-colors text-sm font-display font-semibold"
                >
                  🎁 Referral Program
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Social Links & Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="border-t border-primary/20 pt-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <span className="text-gray-400 text-sm font-display">Follow us:</span>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/5 border border-primary/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="min-w-0 flex-1 max-w-md">
              <span className="text-gray-400 text-sm font-display block mb-3 md:inline md:mr-4 md:mb-0">Stay updated:</span>
              <EmailCaptureForm
                variant="footer"
                source="footer"
                placeholder="Your email"
                buttonText="Subscribe"
                showBenefits={false}
                showSocialProof={false}
                className="max-w-none bg-transparent border-0 p-0"
              />
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="border-t border-primary/20 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm font-display">© {currentYear} NEXURAL. All rights reserved.</div>
            <div className="flex items-center gap-6 text-xs text-gray-500 font-display">
              <span>🔒 SSL Secured</span>
              <span>⚡ 99.9% Uptime</span>
              <span>🛡️ SOC 2 Compliant</span>
            </div>
          </div>
        </motion.div>

        {/* Professional Risk Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-5 bg-gray-900/50 border border-gray-700 rounded-lg"
        >
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Risk Disclosure</h3>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Trading Risk:</strong> Trading futures and forex involves substantial risk of loss 
              and is not suitable for all investors. Past performance is not indicative of future results. The high degree of 
              leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your 
              investment objectives, level of experience, and risk appetite.
            </p>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Service Notice:</strong> NEXURAL provides execution layer software and educational 
              tools only. We do not hold or manage client funds. Your funds remain with your chosen broker. We are not registered 
              investment advisors and do not provide investment advice. All trading decisions are your sole responsibility.
            </p>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Regulatory Disclosure:</strong> We are not registered with the SEC, FINRA, CFTC, NFA, 
              or any other financial regulatory authority. This platform is for educational purposes only and does not constitute 
              investment advice or recommendations.
            </p>
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">© {currentYear} NEXURAL. All rights reserved.</span>
              <Link href="/legal">
                <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                  View Full Terms →
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <FloatingElements />
    </footer>
  )
}
