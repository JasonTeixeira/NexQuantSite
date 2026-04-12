"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  Users, 
  Globe, 
  Clock,
  Eye,
  Download,
  ExternalLink,
  CheckCircle,
  Lock,
  Scale,
  BookOpen,
  Mail,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const LegalDocumentCard = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  lastUpdated, 
  version, 
  type, 
  estimatedReadTime 
}: {
  title: string
  description: string
  icon: any
  href: string
  lastUpdated: string
  version: string
  type: "critical" | "required" | "informational"
  estimatedReadTime: string
}) => {
  const typeStyles = {
    critical: "border-red-500/30 hover:border-red-500/60 bg-red-500/5",
    required: "border-orange-500/30 hover:border-orange-500/60 bg-orange-500/5", 
    informational: "border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5"
  }

  const typeColors = {
    critical: "text-red-400 border-red-500/50",
    required: "text-orange-400 border-orange-500/50",
    informational: "text-blue-400 border-blue-500/50"
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`${typeStyles[type]} border-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <Badge variant="outline" className={typeColors[type]}>
              {type.toUpperCase()}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-white mb-2">{title}</CardTitle>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {lastUpdated}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {estimatedReadTime}
                </span>
              </div>
              <span className="bg-gray-800/50 px-2 py-1 rounded text-xs">
                v{version}
              </span>
            </div>
            <Separator className="bg-gray-700/50" />
            <div className="flex gap-2">
              <Link href={href} className="flex-1">
                <Button className="w-full bg-primary text-black hover:bg-primary/90 transition-all duration-300">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read Document
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-white">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-white">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const ComplianceStatus = () => {
  const complianceItems = [
    { 
      name: "GDPR Compliance", 
      status: "compliant", 
      description: "European data protection regulation",
      icon: Shield
    },
    { 
      name: "CCPA Compliance", 
      status: "compliant", 
      description: "California consumer privacy act",
      icon: Users  
    },
    { 
      name: "SOC 2 Type II", 
      status: "certified", 
      description: "Security and availability controls",
      icon: Lock
    },
    { 
      name: "Industry Standards", 
      status: "compliant", 
      description: "Financial services best practices",
      icon: Scale
    },
  ]

  return (
    <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Compliance Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {complianceItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{item.name}</p>
                <p className="text-gray-400 text-xs">{item.description}</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              {item.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

const LegalQuickAccess = () => {
  const quickLinks = [
    { name: "Contact Legal Team", href: "mailto:legal@nexural.com", icon: Mail },
    { name: "Report Privacy Concern", href: "mailto:privacy@nexural.com", icon: Shield },
    { name: "Terms Violation Report", href: "mailto:compliance@nexural.com", icon: AlertTriangle },
    { name: "Data Protection Officer", href: "mailto:dpo@nexural.com", icon: Users },
  ]

  return (
    <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Legal Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickLinks.map((link, index) => (
          <Link key={index} href={link.href}>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
            >
              <link.icon className="w-4 h-4 mr-3 text-primary" />
              {link.name}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

export default function LegalHubClient() {
  const legalDocuments = [
    {
      title: "Terms of Service",
      description: "Comprehensive terms governing your use of Nexural Trading Platform's educational software and services. Covers user rights, obligations, and platform usage guidelines.",
      icon: FileText,
      href: "/terms",
      lastUpdated: "January 2024",
      version: "2.1",
      type: "required" as const,
      estimatedReadTime: "15-20 min"
    },
    {
      title: "Privacy Policy", 
      description: "Detailed privacy practices protecting your personal information. GDPR and CCPA compliant data protection, user rights, and privacy controls for all users.",
      icon: Shield,
      href: "/privacy",
      lastUpdated: "January 2024", 
      version: "3.0",
      type: "required" as const,
      estimatedReadTime: "12-18 min"
    },
    {
      title: "Risk Disclosure",
      description: "Critical information about trading risks, platform limitations, and user responsibilities. Mandatory reading for all users engaging with trading-related features.",
      icon: AlertTriangle,
      href: "/risk", 
      lastUpdated: "January 2024",
      version: "4.2", 
      type: "critical" as const,
      estimatedReadTime: "20-25 min"
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,136,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              Fully Compliant
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              Regulatory Standards
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              Industry Leading
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Legal Documentation
          </h1>
          
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Comprehensive legal framework protecting your rights and ensuring transparent, 
            compliant operations. Our documentation meets the highest standards for financial 
            technology platforms worldwide.
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              99+ Protection Rating
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Global Compliance
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Legal Excellence
            </span>
          </div>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { icon: FileText, label: "Legal Documents", value: "3", description: "Comprehensive coverage" },
            { icon: Shield, label: "Privacy Protection", value: "GDPR+", description: "Maximum compliance" },
            { icon: Users, label: "User Rights", value: "12+", description: "Detailed protections" },
            { icon: Globe, label: "Jurisdictions", value: "50+", description: "Global compliance" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="bg-gray-900/30 border-primary/10 hover:border-primary/30 transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-300 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Legal Documents Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Essential Legal Documents
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our legal framework provides comprehensive protection and transparency. 
              Each document is professionally crafted to meet the highest industry standards.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {legalDocuments.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <LegalDocumentCard {...doc} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-red-900/20 via-orange-900/20 to-yellow-900/20 border-2 border-orange-500/30">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">
                    Important Legal Notice
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Before using Nexural Trading Platform, you must read and understand all legal documentation. 
                    Our platform provides educational software only and does not constitute financial advice. 
                    Trading involves substantial risk of loss.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/risk">
                      <Button className="bg-red-600 text-white hover:bg-red-700">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Read Risk Disclosure First
                      </Button>
                    </Link>
                    <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Legal Team
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            {/* Document Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Legal Framework Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="w-3 h-3 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Terms of Service</h4>
                        <p className="text-gray-400 text-sm">
                          Establishes the legal relationship between you and our platform, defining rights, 
                          responsibilities, and usage guidelines for all services.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-3 h-3 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Privacy Policy</h4>
                        <p className="text-gray-400 text-sm">
                          Comprehensive data protection practices ensuring your personal information is 
                          handled with the highest standards of privacy and security.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Risk Disclosure</h4>
                        <p className="text-gray-400 text-sm">
                          Critical information about trading risks, platform limitations, and your complete 
                          responsibility for all trading decisions and outcomes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h5 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Legal Review Recommendation
                    </h5>
                    <p className="text-blue-100 text-sm">
                      We recommend reviewing all legal documents annually or whenever significant platform 
                      changes occur. Updates are communicated via email and platform notifications.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* Compliance Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
            >
              <ComplianceStatus />
            </motion.div>

            {/* Legal Quick Access */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
            >
              <LegalQuickAccess />
            </motion.div>
          </div>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="text-center"
        >
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-12">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Legal Excellence & Transparency
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Our legal framework represents industry-leading standards for financial technology platforms. 
                  We prioritize user protection, regulatory compliance, and transparent communication 
                  in all our legal practices.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/terms">
                    <Button className="bg-primary text-black hover:bg-primary/90 px-8">
                      Start with Terms of Service
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="border-primary/50 text-primary hover:bg-primary/10 px-8"
                    onClick={() => window.open("mailto:legal@nexural.com")}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Legal Team
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}


