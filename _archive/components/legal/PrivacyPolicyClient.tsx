"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  Lock, 
  Users, 
  Globe, 
  Database,
  Settings,
  Mail,
  Cookie,
  UserCheck,
  AlertCircle,
  Download,
  Trash2,
  Edit3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

const TableOfContents = ({ activeSection, onSectionClick }: { 
  activeSection: string, 
  onSectionClick: (section: string) => void 
}) => {
  const sections = [
    { id: "overview", title: "1. Overview", icon: Eye },
    { id: "collection", title: "2. Information We Collect", icon: Database },
    { id: "usage", title: "3. How We Use Information", icon: Settings },
    { id: "sharing", title: "4. Information Sharing", icon: Users },
    { id: "cookies", title: "5. Cookies & Tracking", icon: Cookie },
    { id: "security", title: "6. Data Security", icon: Lock },
    { id: "rights", title: "7. Your Privacy Rights", icon: UserCheck },
    { id: "retention", title: "8. Data Retention", icon: Database },
    { id: "international", title: "9. International Transfers", icon: Globe },
    { id: "children", title: "10. Children's Privacy", icon: Shield },
    { id: "updates", title: "11. Policy Updates", icon: Edit3 },
    { id: "contact", title: "12. Contact Information", icon: Mail },
  ]

  return (
    <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Privacy Policy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sections.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionClick(id)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-start gap-3 ${
              activeSection === id 
                ? "bg-primary/20 border-primary/50 text-primary border" 
                : "hover:bg-gray-800/50 text-gray-300 hover:text-primary"
            }`}
          >
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm font-medium leading-tight">{title}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

const Section = ({ 
  id, 
  title, 
  icon: Icon, 
  children,
  isActive,
  onInView
}: { 
  id: string
  title: string
  icon: any
  children: React.ReactNode
  isActive: boolean
  onInView: (id: string) => void
}) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onInView(id)
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )

    const element = document.getElementById(id)
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [id, onInView])

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className={`bg-gray-900/30 border-primary/10 hover:border-primary/30 transition-all duration-500 overflow-hidden ${
        isActive ? "ring-2 ring-primary/50" : ""
      }`}>
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-300 leading-relaxed">
          {children}
        </CardContent>
      </Card>
    </motion.section>
  )
}

const SubSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-3">
    <h4 className="text-lg font-semibold text-white">{title}</h4>
    <div className="pl-4 border-l-2 border-primary/30 space-y-3">
      {children}
    </div>
  </div>
)

const HighlightBox = ({ type = "info", children }: { type?: "warning" | "info" | "success" | "gdpr", children: React.ReactNode }) => {
  const styles = {
    warning: "bg-red-900/20 border-red-500/50 text-red-100",
    info: "bg-blue-900/20 border-blue-500/50 text-blue-100", 
    success: "bg-green-900/20 border-green-500/50 text-green-100",
    gdpr: "bg-purple-900/20 border-purple-500/50 text-purple-100"
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${styles[type]}`}>
      {children}
    </div>
  )
}

const PrivacyControlPanel = () => {
  const [cookies, setCookies] = useState(true)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)
  const [personalization, setPersonalization] = useState(true)

  return (
    <Card className="bg-gray-800/50 border-primary/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Privacy Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Essential Cookies</p>
            <p className="text-sm text-gray-400">Required for platform functionality</p>
          </div>
          <Switch checked={true} disabled />
        </div>
        <Separator className="bg-gray-700" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Analytics Cookies</p>
            <p className="text-sm text-gray-400">Help us improve our platform</p>
          </div>
          <Switch checked={analytics} onCheckedChange={setAnalytics} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Marketing Cookies</p>
            <p className="text-sm text-gray-400">Personalized content and ads</p>
          </div>
          <Switch checked={marketing} onCheckedChange={setMarketing} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Personalization</p>
            <p className="text-sm text-gray-400">Customize your experience</p>
          </div>
          <Switch checked={personalization} onCheckedChange={setPersonalization} />
        </div>
        <Button className="w-full bg-primary text-black hover:bg-primary/90 mt-4">
          Save Privacy Preferences
        </Button>
      </CardContent>
    </Card>
  )
}

export default function PrivacyPolicyClient() {
  const [activeSection, setActiveSection] = useState("overview")

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleSectionInView = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/legal">
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800/50 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Legal Hub
            </Button>
          </Link>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                GDPR Compliant
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                CCPA Compliant
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                Privacy by Design
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive privacy practices protecting your personal information and data rights 
              in compliance with global privacy regulations
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
              <span>Last Updated: January 2024</span>
              <span>•</span>
              <span>Version 3.0</span>
              <span>•</span>
              <span>GDPR & CCPA Compliant</span>
            </div>
          </div>
        </motion.div>

        {/* Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents Sidebar */}
          <div className="lg:col-span-1">
            <TableOfContents 
              activeSection={activeSection} 
              onSectionClick={scrollToSection}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Section 1: Overview */}
            <Section 
              id="overview" 
              title="Privacy Overview" 
              icon={Eye}
              isActive={activeSection === "overview"}
              onInView={handleSectionInView}
            >
              <HighlightBox type="gdpr">
                <p className="font-semibold text-lg mb-3">
                  Your Privacy is Our Priority
                </p>
                <p>
                  Nexural Trading Platform is committed to protecting your privacy and ensuring transparent 
                  data practices. This Privacy Policy explains how we collect, use, share, and protect your 
                  personal information in compliance with GDPR, CCPA, and other applicable privacy laws.
                </p>
              </HighlightBox>
              
              <SubSection title="Our Privacy Principles">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Transparency:</strong> Clear communication about data practices</li>
                  <li><strong>Control:</strong> You decide how your data is used</li>
                  <li><strong>Security:</strong> Industry-leading protection measures</li>
                  <li><strong>Minimal Collection:</strong> Only collect data necessary for our services</li>
                  <li><strong>Purpose Limitation:</strong> Use data only for stated purposes</li>
                  <li><strong>Retention Limits:</strong> Delete data when no longer needed</li>
                </ul>
              </SubSection>

              <SubSection title="Legal Bases for Processing">
                <HighlightBox type="info">
                  <p className="font-semibold mb-2">We process your data based on:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Consent:</strong> When you explicitly agree to data processing</li>
                    <li><strong>Contract:</strong> To provide services you've requested</li>
                    <li><strong>Legitimate Interest:</strong> For platform security and improvements</li>
                    <li><strong>Legal Compliance:</strong> To meet regulatory requirements</li>
                  </ul>
                </HighlightBox>
              </SubSection>

              <SubSection title="Scope and Application">
                <p>
                  This policy applies to all personal information collected through our platform, mobile apps, 
                  websites, and related services. It covers all users regardless of location, with additional 
                  protections for EU and California residents.
                </p>
              </SubSection>
            </Section>

            {/* Section 2: Information Collection */}
            <Section 
              id="collection" 
              title="Information We Collect" 
              icon={Database}
              isActive={activeSection === "collection"}
              onInView={handleSectionInView}
            >
              <SubSection title="Information You Provide Directly">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2">Account Information</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Name, email address, username</li>
                      <li>Password (encrypted and hashed)</li>
                      <li>Profile information and preferences</li>
                      <li>Two-factor authentication settings</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2">Trading & Educational Data</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Trading strategies and backtesting results</li>
                      <li>Platform usage patterns and preferences</li>
                      <li>Educational progress and achievements</li>
                      <li>Custom indicators and tool configurations</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2">Communication Data</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Support tickets and correspondence</li>
                      <li>Community forum posts and comments</li>
                      <li>Feedback and survey responses</li>
                      <li>Newsletter and marketing preferences</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Automatically Collected Information">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2">Technical Information</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>IP address and geolocation (country/region)</li>
                      <li>Device type, browser, and operating system</li>
                      <li>Screen resolution and display preferences</li>
                      <li>Session duration and page interactions</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2">Usage Analytics</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Feature usage and click patterns</li>
                      <li>Time spent on different sections</li>
                      <li>Error logs and performance metrics</li>
                      <li>Platform optimization data</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Third-Party Information">
                <HighlightBox type="info">
                  <p>
                    We may receive information from integrated services (broker APIs, data providers) 
                    only when you explicitly connect these services to your account. We do not purchase 
                    personal data from third-party brokers.
                  </p>
                </HighlightBox>
              </SubSection>
            </Section>

            {/* Section 3: How We Use Information */}
            <Section 
              id="usage" 
              title="How We Use Your Information" 
              icon={Settings}
              isActive={activeSection === "usage"}
              onInView={handleSectionInView}
            >
              <SubSection title="Primary Use Cases">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      Account Management
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Create and maintain your account</li>
                      <li>Authenticate and secure access</li>
                      <li>Process subscription payments</li>
                      <li>Provide customer support</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Service Delivery
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Provide trading tools and software</li>
                      <li>Deliver educational content</li>
                      <li>Enable platform features</li>
                      <li>Sync data across devices</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security & Safety
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Detect and prevent fraud</li>
                      <li>Monitor for security threats</li>
                      <li>Enforce terms of service</li>
                      <li>Maintain platform integrity</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Analytics & Improvement
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Analyze platform performance</li>
                      <li>Understand user preferences</li>
                      <li>Develop new features</li>
                      <li>Optimize user experience</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Marketing Communications">
                <HighlightBox type="info">
                  <p className="font-semibold mb-2">We may use your information for marketing only if:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>You have explicitly consented to marketing communications</li>
                    <li>You have not opted out of marketing messages</li>
                    <li>The communication relates to services you already use</li>
                    <li>We have a legitimate interest (with easy opt-out options)</li>
                  </ul>
                </HighlightBox>
              </SubSection>

              <SubSection title="Data Processing Purposes">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3 font-semibold text-primary">Purpose</th>
                        <th className="text-left p-3 font-semibold text-primary">Legal Basis</th>
                        <th className="text-left p-3 font-semibold text-primary">Retention</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Account Management</td>
                        <td className="p-3">Contract Performance</td>
                        <td className="p-3">Account lifetime + 3 years</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Security Monitoring</td>
                        <td className="p-3">Legitimate Interest</td>
                        <td className="p-3">90 days</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Marketing Communications</td>
                        <td className="p-3">Consent</td>
                        <td className="p-3">Until consent withdrawn</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Analytics</td>
                        <td className="p-3">Legitimate Interest</td>
                        <td className="p-3">26 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SubSection>
            </Section>

            {/* Section 4: Information Sharing */}
            <Section 
              id="sharing" 
              title="Information Sharing and Disclosure" 
              icon={Users}
              isActive={activeSection === "sharing"}
              onInView={handleSectionInView}
            >
              <HighlightBox type="success">
                <p className="font-semibold text-lg mb-2">
                  We Do Not Sell Your Personal Information
                </p>
                <p>
                  Nexural Trading Platform does not sell, rent, or trade your personal information to third parties 
                  for monetary consideration. We only share data in limited circumstances outlined below.
                </p>
              </HighlightBox>

              <SubSection title="Limited Sharing Scenarios">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h5 className="font-semibold text-blue-400 mb-2">Service Providers</h5>
                    <p className="text-sm">
                      We share data with trusted vendors who help us operate our platform (cloud hosting, 
                      payment processing, customer support) under strict data protection agreements.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <h5 className="font-semibold text-yellow-400 mb-2">Legal Requirements</h5>
                    <p className="text-sm">
                      We may disclose information when required by law, court order, or to protect our rights 
                      and the safety of our users and the public.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-green-500">
                    <h5 className="font-semibold text-green-400 mb-2">Business Transfers</h5>
                    <p className="text-sm">
                      In the event of a merger, acquisition, or sale of assets, user information may be 
                      transferred as part of the transaction with continued privacy protection.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h5 className="font-semibold text-purple-400 mb-2">With Your Consent</h5>
                    <p className="text-sm">
                      We may share information with third parties when you explicitly consent to such sharing, 
                      such as integrating with broker APIs you authorize.
                    </p>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Anonymous and Aggregated Data">
                <p>
                  We may share anonymous, aggregated, or de-identified information that cannot be used to 
                  identify you personally. This helps us improve our services and contribute to industry research.
                </p>
              </SubSection>
            </Section>

            {/* Section 5: Cookies & Tracking */}
            <Section 
              id="cookies" 
              title="Cookies and Tracking Technologies" 
              icon={Cookie}
              isActive={activeSection === "cookies"}
              onInView={handleSectionInView}
            >
              <SubSection title="Types of Cookies We Use">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2">Essential Cookies</h5>
                    <p className="text-sm mb-2">Required for platform functionality</p>
                    <ul className="list-disc list-inside space-y-1 text-xs ml-4">
                      <li>Authentication and session management</li>
                      <li>Security and fraud prevention</li>
                      <li>User preferences and settings</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2">Analytics Cookies</h5>
                    <p className="text-sm mb-2">Help us understand platform usage</p>
                    <ul className="list-disc list-inside space-y-1 text-xs ml-4">
                      <li>Google Analytics (anonymized)</li>
                      <li>Platform performance metrics</li>
                      <li>Feature usage statistics</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2">Functional Cookies</h5>
                    <p className="text-sm mb-2">Enable enhanced features</p>
                    <ul className="list-disc list-inside space-y-1 text-xs ml-4">
                      <li>Language and region preferences</li>
                      <li>Personalization settings</li>
                      <li>Saved configurations</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-primary mb-2">Marketing Cookies</h5>
                    <p className="text-sm mb-2">For relevant content (optional)</p>
                    <ul className="list-disc list-inside space-y-1 text-xs ml-4">
                      <li>Interest-based content</li>
                      <li>Campaign effectiveness</li>
                      <li>Cross-platform tracking (if consented)</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Cookie Management">
                <PrivacyControlPanel />
              </SubSection>

              <SubSection title="Third-Party Tracking">
                <HighlightBox type="info">
                  <p className="font-semibold mb-2">We use these third-party services:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Google Analytics:</strong> Website analytics (IP anonymized)</li>
                    <li><strong>Stripe:</strong> Payment processing (minimal data sharing)</li>
                    <li><strong>SendGrid:</strong> Email delivery (encrypted communications)</li>
                    <li><strong>Cloudflare:</strong> Security and performance (edge caching)</li>
                  </ul>
                </HighlightBox>
              </SubSection>
            </Section>

            {/* Section 6: Data Security */}
            <Section 
              id="security" 
              title="Data Security and Protection" 
              icon={Lock}
              isActive={activeSection === "security"}
              onInView={handleSectionInView}
            >
              <SubSection title="Security Measures">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-green-500/30">
                    <h5 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Encryption
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>AES-256 encryption at rest</li>
                      <li>TLS 1.3 for data in transit</li>
                      <li>End-to-end encrypted communications</li>
                      <li>Encrypted database storage</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border border-blue-500/30">
                    <h5 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Access Controls
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Multi-factor authentication</li>
                      <li>Role-based access permissions</li>
                      <li>Regular access reviews</li>
                      <li>Principle of least privilege</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border border-purple-500/30">
                    <h5 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Monitoring
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>24/7 security monitoring</li>
                      <li>Intrusion detection systems</li>
                      <li>Automated threat response</li>
                      <li>Regular security audits</li>
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border border-orange-500/30">
                    <h5 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Staff Training
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>Privacy and security training</li>
                      <li>Data handling procedures</li>
                      <li>Incident response protocols</li>
                      <li>Background checks</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Breach Notification">
                <HighlightBox type="warning">
                  <p className="font-semibold mb-2">In the unlikely event of a data breach:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>We will notify affected users within 72 hours</li>
                    <li>Regulatory authorities will be informed as required</li>
                    <li>We will provide clear information about the incident</li>
                    <li>Immediate steps to secure data will be taken</li>
                    <li>Free identity monitoring may be provided</li>
                  </ul>
                </HighlightBox>
              </SubSection>
            </Section>

            {/* Section 7: Your Privacy Rights */}
            <Section 
              id="rights" 
              title="Your Privacy Rights" 
              icon={UserCheck}
              isActive={activeSection === "rights"}
              onInView={handleSectionInView}
            >
              <HighlightBox type="gdpr">
                <p className="font-semibold text-lg mb-3">
                  Universal Privacy Rights
                </p>
                <p>
                  Regardless of your location, you have certain rights regarding your personal information. 
                  EU residents have additional protections under GDPR, and California residents under CCPA.
                </p>
              </HighlightBox>

              <SubSection title="Core Privacy Rights">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-primary">
                    <div className="flex items-start gap-3">
                      <Download className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <h5 className="font-semibold text-white mb-1">Right to Access</h5>
                        <p className="text-sm text-gray-300">
                          Request a copy of all personal information we hold about you, including how it's used and who it's shared with.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <Edit3 className="w-5 h-5 text-blue-500 mt-1" />
                      <div>
                        <h5 className="font-semibold text-white mb-1">Right to Rectification</h5>
                        <p className="text-sm text-gray-300">
                          Correct any inaccurate or incomplete personal information we maintain about you.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-start gap-3">
                      <Trash2 className="w-5 h-5 text-red-500 mt-1" />
                      <div>
                        <h5 className="font-semibold text-white mb-1">Right to Deletion</h5>
                        <p className="text-sm text-gray-300">
                          Request deletion of your personal information, subject to legal and contractual obligations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-1" />
                      <div>
                        <h5 className="font-semibold text-white mb-1">Right to Object</h5>
                        <p className="text-sm text-gray-300">
                          Object to processing based on legitimate interests, including direct marketing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                      <Download className="w-5 h-5 text-green-500 mt-1" />
                      <div>
                        <h5 className="font-semibold text-white mb-1">Right to Data Portability</h5>
                        <p className="text-sm text-gray-300">
                          Receive your data in a structured, machine-readable format for transfer to another service.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SubSection>

              <SubSection title="How to Exercise Your Rights">
                <div className="bg-primary/10 border border-primary/30 p-6 rounded-lg">
                  <h5 className="font-semibold text-primary mb-3">Submit a Privacy Request</h5>
                  <p className="text-gray-300 mb-4">
                    To exercise any of your privacy rights, contact us using the information below. 
                    We will respond within 30 days (or sooner as required by applicable law).
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Email:</strong> privacy@nexural.com</p>
                    <p className="text-sm"><strong>Subject Line:</strong> Privacy Rights Request</p>
                    <p className="text-sm"><strong>Include:</strong> Your full name, email address, and specific request</p>
                  </div>
                  <Button className="mt-4 bg-primary text-black hover:bg-primary/90">
                    Submit Privacy Request
                  </Button>
                </div>
              </SubSection>

              <SubSection title="California Privacy Rights (CCPA)">
                <HighlightBox type="info">
                  <p className="font-semibold mb-2">California residents have additional rights including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Right to know what personal information is collected</li>
                    <li>Right to know if personal information is sold or disclosed</li>
                    <li>Right to opt-out of the sale of personal information</li>
                    <li>Right to non-discrimination for exercising privacy rights</li>
                  </ul>
                  <p className="mt-3 font-semibold">
                    Note: We do not sell personal information to third parties.
                  </p>
                </HighlightBox>
              </SubSection>
            </Section>

            {/* Section 8: Data Retention */}
            <Section 
              id="retention" 
              title="Data Retention" 
              icon={Database}
              isActive={activeSection === "retention"}
              onInView={handleSectionInView}
            >
              <SubSection title="Retention Principles">
                <p>
                  We retain personal information only as long as necessary to fulfill the purposes for which 
                  it was collected, comply with legal obligations, resolve disputes, and enforce our agreements.
                </p>
              </SubSection>

              <SubSection title="Retention Periods by Data Type">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3 font-semibold text-primary">Data Type</th>
                        <th className="text-left p-3 font-semibold text-primary">Retention Period</th>
                        <th className="text-left p-3 font-semibold text-primary">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Account Information</td>
                        <td className="p-3">Account lifetime + 3 years</td>
                        <td className="p-3">Legal obligations, tax records</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Trading Data</td>
                        <td className="p-3">Account lifetime + 7 years</td>
                        <td className="p-3">Financial regulations</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Support Communications</td>
                        <td className="p-3">3 years</td>
                        <td className="p-3">Service improvement</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Marketing Data</td>
                        <td className="p-3">Until consent withdrawn</td>
                        <td className="p-3">User consent based</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Usage Analytics</td>
                        <td className="p-3">26 months</td>
                        <td className="p-3">Google Analytics standard</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="p-3">Security Logs</td>
                        <td className="p-3">1 year</td>
                        <td className="p-3">Security monitoring</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SubSection>

              <SubSection title="Secure Deletion">
                <p>
                  When we delete personal information, we use secure deletion methods that make the data 
                  unrecoverable. Backup systems are also updated to ensure complete removal.
                </p>
              </SubSection>
            </Section>

            {/* Section 9: International Transfers */}
            <Section 
              id="international" 
              title="International Data Transfers" 
              icon={Globe}
              isActive={activeSection === "international"}
              onInView={handleSectionInView}
            >
              <SubSection title="Cross-Border Data Processing">
                <HighlightBox type="info">
                  <p className="font-semibold mb-2">
                    Our services operate globally, which may involve transferring your data across borders.
                  </p>
                  <p>
                    We ensure all international transfers comply with applicable data protection laws and 
                    implement appropriate safeguards to protect your personal information.
                  </p>
                </HighlightBox>
              </SubSection>

              <SubSection title="Transfer Safeguards">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate protection levels</li>
                  <li><strong>Standard Contractual Clauses:</strong> EU-approved contract terms with data processors</li>
                  <li><strong>Binding Corporate Rules:</strong> Internal policies ensuring consistent protection</li>
                  <li><strong>Certification Programs:</strong> Third-party validated security standards</li>
                </ul>
              </SubSection>

              <SubSection title="Data Processing Locations">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-sm mb-2">
                    Your data may be processed in the following regions:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li><strong>Primary:</strong> United States (AWS US regions)</li>
                    <li><strong>Backup:</strong> European Union (AWS EU regions)</li>
                    <li><strong>CDN:</strong> Global edge locations (Cloudflare)</li>
                    <li><strong>Support:</strong> United States and European Union</li>
                  </ul>
                </div>
              </SubSection>
            </Section>

            {/* Section 10: Children's Privacy */}
            <Section 
              id="children" 
              title="Children's Privacy Protection" 
              icon={Shield}
              isActive={activeSection === "children"}
              onInView={handleSectionInView}
            >
              <HighlightBox type="warning">
                <p className="font-semibold text-lg mb-3">
                  Age Restrictions
                </p>
                <p>
                  Our platform is not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13 without parental consent.
                </p>
              </HighlightBox>

              <SubSection title="Parental Controls">
                <p>
                  If you are a parent or guardian and believe your child has provided us with personal information, 
                  please contact us immediately. We will delete such information from our systems promptly.
                </p>
              </SubSection>

              <SubSection title="Teen Privacy (13-17 years)">
                <p>
                  Users between 13-17 years old may use our educational features under parental supervision. 
                  We encourage parents to monitor their teen's online activities and discuss internet safety.
                </p>
              </SubSection>
            </Section>

            {/* Section 11: Policy Updates */}
            <Section 
              id="updates" 
              title="Privacy Policy Updates" 
              icon={Edit3}
              isActive={activeSection === "updates"}
              onInView={handleSectionInView}
            >
              <SubSection title="Notification of Changes">
                <p>
                  We may update this Privacy Policy periodically to reflect changes in our practices, 
                  technology, legal requirements, or other factors. We will notify you of material changes through:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email notification to your registered address</li>
                  <li>Prominent notice on our platform</li>
                  <li>In-app notifications for mobile users</li>
                  <li>Updates to this page with revision dates</li>
                </ul>
              </SubSection>

              <SubSection title="Review and Acceptance">
                <HighlightBox type="info">
                  <p>
                    We encourage you to review this Privacy Policy regularly. Continued use of our platform 
                    after changes constitutes acceptance of the updated policy. If you disagree with changes, 
                    you may discontinue use and request account deletion.
                  </p>
                </HighlightBox>
              </SubSection>
            </Section>

            {/* Section 12: Contact Information */}
            <Section 
              id="contact" 
              title="Privacy Contact Information" 
              icon={Mail}
              isActive={activeSection === "contact"}
              onInView={handleSectionInView}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/10 border border-primary/30 p-6 rounded-lg">
                  <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Privacy Officer
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> privacy@nexural.com</p>
                    <p><strong>Response Time:</strong> Within 30 days</p>
                    <p><strong>Available:</strong> 24/7 for urgent matters</p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Data Protection Officer
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> dpo@nexural.com</p>
                    <p><strong>Purpose:</strong> GDPR compliance</p>
                    <p><strong>Region:</strong> EU/EEA inquiries</p>
                  </div>
                </div>
              </div>

              <SubSection title="Regulatory Contacts">
                <p className="text-sm text-gray-400 mb-4">
                  If you believe we have not addressed your privacy concerns adequately, you may contact relevant regulatory authorities:
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h5 className="font-semibold text-white mb-1">EU Residents</h5>
                    <p className="text-gray-400">Your local Data Protection Authority</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h5 className="font-semibold text-white mb-1">California Residents</h5>
                    <p className="text-gray-400">California Attorney General</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h5 className="font-semibold text-white mb-1">Other Regions</h5>
                    <p className="text-gray-400">Local privacy authorities</p>
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* Footer Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 text-center"
            >
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Privacy Questions or Concerns?
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Our privacy team is committed to protecting your personal information and ensuring 
                    compliance with all applicable privacy laws and regulations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-primary text-black hover:bg-primary/90">
                      Contact Privacy Team
                    </Button>
                    <Link href="/legal">
                      <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                        View All Legal Documents
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}


