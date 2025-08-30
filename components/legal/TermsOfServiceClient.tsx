"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  AlertTriangle, 
  Users, 
  Globe, 
  Gavel,
  Clock,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const TableOfContents = ({ activeSection, onSectionClick }: { 
  activeSection: string, 
  onSectionClick: (section: string) => void 
}) => {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", icon: CheckCircle },
    { id: "services", title: "2. Service Description", icon: FileText },
    { id: "eligibility", title: "3. User Eligibility", icon: Users },
    { id: "accounts", title: "4. User Accounts", icon: Shield },
    { id: "conduct", title: "5. Acceptable Use", icon: Gavel },
    { id: "intellectual", title: "6. Intellectual Property", icon: Globe },
    { id: "disclaimers", title: "7. Disclaimers & Warranties", icon: AlertTriangle },
    { id: "limitation", title: "8. Limitation of Liability", icon: Shield },
    { id: "termination", title: "9. Termination", icon: Clock },
    { id: "governing", title: "10. Governing Law", icon: Gavel },
  ]

  return (
    <Card className="bg-gray-900/50 border-primary/20 backdrop-blur-sm sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Table of Contents
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

const HighlightBox = ({ type = "warning", children }: { type?: "warning" | "info" | "success", children: React.ReactNode }) => {
  const styles = {
    warning: "bg-red-900/20 border-red-500/50 text-red-100",
    info: "bg-blue-900/20 border-blue-500/50 text-blue-100",
    success: "bg-green-900/20 border-green-500/50 text-green-100"
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${styles[type]}`}>
      {children}
    </div>
  )
}

export default function TermsOfServiceClient() {
  const [activeSection, setActiveSection] = useState("acceptance")

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
            <Badge className="bg-primary/20 text-primary border-primary/50 mb-4">
              Legal Document
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive terms governing your use of Nexural Trading Platform's educational software and services
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
              <span>Last Updated: January 2024</span>
              <span>•</span>
              <span>Version 2.1</span>
              <span>•</span>
              <span>English</span>
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
            
            {/* Section 1: Acceptance */}
            <Section 
              id="acceptance" 
              title="Acceptance of Terms" 
              icon={CheckCircle}
              isActive={activeSection === "acceptance"}
              onInView={handleSectionInView}
            >
              <HighlightBox type="warning">
                <p className="font-semibold">
                  By accessing or using Nexural Trading Platform, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, you must not use our services.
                </p>
              </HighlightBox>
              
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") 
                and Nexural Trading Platform ("Company," "we," "us," or "our") governing your access to and use of our 
                platform, services, and software.
              </p>

              <SubSection title="Binding Nature">
                <p>
                  These Terms form a contract between you and Nexural Trading Platform. By creating an account, 
                  accessing our platform, or using our services in any manner, you confirm that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You have read and understood these Terms in their entirety</li>
                  <li>You agree to be legally bound by all provisions</li>
                  <li>You have the legal capacity to enter into this agreement</li>
                  <li>You will comply with all applicable laws and regulations</li>
                </ul>
              </SubSection>

              <SubSection title="Modifications">
                <p>
                  We reserve the right to modify these Terms at any time. Material changes will be communicated 
                  through email notification and prominent platform notices. Continued use after changes constitutes 
                  acceptance of modified Terms.
                </p>
              </SubSection>
            </Section>

            {/* Section 2: Services */}
            <Section 
              id="services" 
              title="Service Description" 
              icon={FileText}
              isActive={activeSection === "services"}
              onInView={handleSectionInView}
            >
              <HighlightBox type="info">
                <p className="font-semibold">
                  Nexural Trading Platform is an EXECUTION LAYER educational software provider. 
                  We do not handle, hold, or manage any client funds.
                </p>
              </HighlightBox>

              <SubSection title="Educational Software Platform">
                <p>
                  Our platform provides educational tools, software, and resources designed to help users learn about 
                  trading concepts, strategies, and market analysis. Our services include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Educational trading software and tools</li>
                  <li>Strategy backtesting and analysis platforms</li>
                  <li>Market data visualization and charting tools</li>
                  <li>Educational content, tutorials, and resources</li>
                  <li>Community features and discussion forums</li>
                  <li>Options flow analysis and scanning tools</li>
                </ul>
              </SubSection>

              <SubSection title="What We Are NOT">
                <HighlightBox type="warning">
                  <p className="font-semibold mb-2">We explicitly are NOT:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Investment advisors or financial advisors</li>
                    <li>Broker-dealers or securities professionals</li>
                    <li>Money managers or fiduciaries</li>
                    <li>Registered with SEC, FINRA, CFTC, or regulatory bodies</li>
                    <li>Responsible for your trading decisions or outcomes</li>
                    <li>Guaranteeing profits or investment returns</li>
                  </ul>
                </HighlightBox>
              </SubSection>

              <SubSection title="Third-Party Integrations">
                <p>
                  Our platform may integrate with third-party brokers, data providers, and services. We are not responsible 
                  for the availability, accuracy, or functionality of third-party services. All interactions with third parties 
                  are subject to their respective terms and conditions.
                </p>
              </SubSection>
            </Section>

            {/* Section 3: Eligibility */}
            <Section 
              id="eligibility" 
              title="User Eligibility" 
              icon={Users}
              isActive={activeSection === "eligibility"}
              onInView={handleSectionInView}
            >
              <SubSection title="Age Requirements">
                <p>
                  You must be at least 18 years of age to use our platform. If you are between 13-17 years old, 
                  you may only use our services under the direct supervision of a parent or legal guardian who 
                  has agreed to these Terms.
                </p>
              </SubSection>

              <SubSection title="Legal Capacity">
                <p>
                  By using our platform, you represent and warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You have full legal capacity to enter into this agreement</li>
                  <li>You are not prohibited from using our services under applicable law</li>
                  <li>You have not been previously suspended or banned from our platform</li>
                  <li>All information you provide is accurate and truthful</li>
                </ul>
              </SubSection>

              <SubSection title="Prohibited Jurisdictions">
                <HighlightBox type="warning">
                  <p>
                    Our services may not be available in all jurisdictions. It is your responsibility to ensure 
                    that your use of our platform complies with all applicable local, state, national, and 
                    international laws and regulations.
                  </p>
                </HighlightBox>
              </SubSection>
            </Section>

            {/* Section 4: User Accounts */}
            <Section 
              id="accounts" 
              title="User Accounts" 
              icon={Shield}
              isActive={activeSection === "accounts"}
              onInView={handleSectionInView}
            >
              <SubSection title="Account Registration">
                <p>
                  To access certain features, you must create an account. During registration, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your login credentials confidential and secure</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </SubSection>

              <SubSection title="Account Security">
                <HighlightBox type="info">
                  <p className="font-semibold">
                    You are solely responsible for maintaining the confidentiality of your account and for all 
                    activities that occur under your account.
                  </p>
                </HighlightBox>
                <p className="mt-3">
                  We recommend using strong, unique passwords and enabling two-factor authentication where available. 
                  You agree to immediately notify us of any suspected unauthorized access or security breach.
                </p>
              </SubSection>

              <SubSection title="Account Termination">
                <p>
                  We reserve the right to terminate or suspend accounts that violate these Terms, engage in 
                  prohibited activities, or for any other reason at our sole discretion.
                </p>
              </SubSection>
            </Section>

            {/* Section 5: Acceptable Use */}
            <Section 
              id="conduct" 
              title="Acceptable Use Policy" 
              icon={Gavel}
              isActive={activeSection === "conduct"}
              onInView={handleSectionInView}
            >
              <SubSection title="Permitted Use">
                <p>
                  You may use our platform solely for lawful, educational purposes consistent with these Terms. 
                  Permitted activities include learning about trading, analyzing markets, and using our tools 
                  for educational exploration.
                </p>
              </SubSection>

              <SubSection title="Prohibited Activities">
                <HighlightBox type="warning">
                  <p className="font-semibold mb-2">You agree NOT to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Use our platform for any unlawful purpose</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt our services</li>
                    <li>Reverse engineer, decompile, or disassemble our software</li>
                    <li>Share, resell, or redistribute our content or tools</li>
                    <li>Upload malicious code, viruses, or harmful content</li>
                    <li>Impersonate any person or entity</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Use automated systems to access our platform without permission</li>
                  </ul>
                </HighlightBox>
              </SubSection>

              <SubSection title="Content Guidelines">
                <p>
                  When participating in forums or sharing content, you must ensure all content is appropriate, 
                  respectful, and complies with our community guidelines. We reserve the right to remove any 
                  content at our discretion.
                </p>
              </SubSection>
            </Section>

            {/* Section 6: Intellectual Property */}
            <Section 
              id="intellectual" 
              title="Intellectual Property Rights" 
              icon={Globe}
              isActive={activeSection === "intellectual"}
              onInView={handleSectionInView}
            >
              <SubSection title="Our Intellectual Property">
                <p>
                  All content, software, tools, designs, logos, trademarks, and other intellectual property on our 
                  platform are owned by Nexural Trading Platform or our licensors. This includes but is not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Proprietary software and algorithms</li>
                  <li>Educational content and materials</li>
                  <li>Trading tools and indicators</li>
                  <li>Platform design and user interface</li>
                  <li>Data analysis and visualization tools</li>
                </ul>
              </SubSection>

              <SubSection title="Limited License">
                <HighlightBox type="info">
                  <p>
                    We grant you a limited, non-exclusive, non-transferable license to access and use our platform 
                    for personal, educational purposes only, subject to these Terms.
                  </p>
                </HighlightBox>
              </SubSection>

              <SubSection title="User Content">
                <p>
                  By submitting content to our platform, you grant us a worldwide, royalty-free license to use, 
                  modify, and display such content in connection with our services, while retaining your ownership rights.
                </p>
              </SubSection>
            </Section>

            {/* Section 7: Disclaimers */}
            <Section 
              id="disclaimers" 
              title="Disclaimers and Warranties" 
              icon={AlertTriangle}
              isActive={activeSection === "disclaimers"}
              onInView={handleSectionInView}
            >
              <HighlightBox type="warning">
                <p className="font-black text-lg mb-3">
                  IMPORTANT: OUR PLATFORM IS PROVIDED "AS IS" WITHOUT ANY WARRANTIES
                </p>
                <p>
                  We make no warranties, express or implied, regarding the accuracy, reliability, or suitability 
                  of our platform for any particular purpose.
                </p>
              </HighlightBox>

              <SubSection title="Service Availability">
                <p>
                  We do not guarantee that our platform will be available 24/7 or free from interruptions. 
                  We may perform maintenance, updates, or modifications that temporarily affect service availability.
                </p>
              </SubSection>

              <SubSection title="Educational Nature">
                <p>
                  All content and tools are provided for educational purposes only. We do not warrant that any 
                  strategies, tools, or information will result in profits or successful trading outcomes.
                </p>
              </SubSection>

              <SubSection title="Third-Party Content">
                <p>
                  We are not responsible for the accuracy or reliability of third-party content, data, or services 
                  integrated with our platform.
                </p>
              </SubSection>
            </Section>

            {/* Section 8: Limitation of Liability */}
            <Section 
              id="limitation" 
              title="Limitation of Liability" 
              icon={Shield}
              isActive={activeSection === "limitation"}
              onInView={handleSectionInView}
            >
              <HighlightBox type="warning">
                <p className="font-black text-lg mb-3">
                  MAXIMUM LIABILITY LIMITATION
                </p>
                <p>
                  In no event shall Nexural Trading Platform be liable for any indirect, incidental, special, 
                  consequential, or punitive damages, including but not limited to loss of profits, data, or use, 
                  regardless of the theory of liability.
                </p>
              </HighlightBox>

              <SubSection title="Aggregate Liability Cap">
                <p>
                  Our total liability to you for all claims arising from or relating to these Terms or your use 
                  of our platform shall not exceed the amount you paid to us in the twelve (12) months preceding 
                  the claim, or $100, whichever is greater.
                </p>
              </SubSection>

              <SubSection title="Essential Purpose">
                <p>
                  These limitations are fundamental elements of the agreement between us. Our platform would not 
                  be provided without such limitations.
                </p>
              </SubSection>
            </Section>

            {/* Section 9: Termination */}
            <Section 
              id="termination" 
              title="Termination" 
              icon={Clock}
              isActive={activeSection === "termination"}
              onInView={handleSectionInView}
            >
              <SubSection title="Termination Rights">
                <p>
                  Either party may terminate this agreement at any time. You may stop using our platform and 
                  delete your account. We may terminate or suspend your access with or without cause.
                </p>
              </SubSection>

              <SubSection title="Effect of Termination">
                <p>
                  Upon termination:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your access to our platform will cease immediately</li>
                  <li>You must discontinue all use of our software and content</li>
                  <li>Provisions regarding liability, indemnification, and intellectual property survive</li>
                  <li>We may delete your account data in accordance with our data retention policies</li>
                </ul>
              </SubSection>

              <SubSection title="Data Retention">
                <p>
                  We may retain certain data as required by law or for legitimate business purposes, 
                  as outlined in our Privacy Policy.
                </p>
              </SubSection>
            </Section>

            {/* Section 10: Governing Law */}
            <Section 
              id="governing" 
              title="Governing Law and Dispute Resolution" 
              icon={Gavel}
              isActive={activeSection === "governing"}
              onInView={handleSectionInView}
            >
              <SubSection title="Governing Law">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                  without regard to its conflict of law provisions.
                </p>
              </SubSection>

              <SubSection title="Dispute Resolution">
                <HighlightBox type="info">
                  <p className="font-semibold mb-2">Binding Arbitration:</p>
                  <p>
                    Any disputes arising under these Terms shall be resolved through binding arbitration rather than 
                    in court, except for certain types of disputes specifically excluded by law.
                  </p>
                </HighlightBox>
              </SubSection>

              <SubSection title="Class Action Waiver">
                <HighlightBox type="warning">
                  <p className="font-semibold">
                    You waive any right to participate in class action lawsuits or class-wide arbitration against us.
                  </p>
                </HighlightBox>
              </SubSection>

              <SubSection title="Contact Information">
                <p>
                  For questions about these Terms, please contact us at:
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg mt-3">
                  <p className="font-mono text-primary">legal@nexural.com</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Please include "Terms of Service Question" in the subject line
                  </p>
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
                    Questions About These Terms?
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Our legal team is available to clarify any provisions or answer questions about your rights and obligations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-primary text-black hover:bg-primary/90">
                      Contact Legal Team
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


