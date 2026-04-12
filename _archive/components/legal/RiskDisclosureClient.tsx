"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  AlertTriangle, 
  TrendingDown, 
  Calculator, 
  Shield, 
  Users, 
  Zap,
  Settings,
  DollarSign,
  BarChart3,
  Brain,
  Clock,
  Globe,
  XCircle,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

const TableOfContents = ({ activeSection, onSectionClick }: { 
  activeSection: string, 
  onSectionClick: (section: string) => void 
}) => {
  const sections = [
    { id: "overview", title: "1. Risk Overview", icon: AlertTriangle },
    { id: "trading-risks", title: "2. Trading & Market Risks", icon: TrendingDown },
    { id: "platform-risks", title: "3. Platform & Technology Risks", icon: Settings },
    { id: "software-limitations", title: "4. Software Limitations", icon: XCircle },
    { id: "user-responsibility", title: "5. User Responsibility", icon: Users },
    { id: "financial-disclaimers", title: "6. Financial Disclaimers", icon: DollarSign },
    { id: "regulatory-warnings", title: "7. Regulatory Warnings", icon: Shield },
    { id: "ai-automation-risks", title: "8. AI & Automation Risks", icon: Brain },
    { id: "data-risks", title: "9. Data & Information Risks", icon: BarChart3 },
    { id: "business-risks", title: "10. Business & Operational Risks", icon: Globe },
    { id: "acknowledgment", title: "11. Risk Acknowledgment", icon: CheckCircle2 },
  ]

  return (
    <Card className="bg-gray-900/50 border-red-500/20 backdrop-blur-sm sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Risk Disclosure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sections.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionClick(id)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-start gap-3 ${
              activeSection === id 
                ? "bg-red-500/20 border-red-500/50 text-red-400 border" 
                : "hover:bg-gray-800/50 text-gray-300 hover:text-red-400"
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
  onInView,
  riskLevel = "high"
}: { 
  id: string
  title: string
  icon: any
  children: React.ReactNode
  isActive: boolean
  onInView: (id: string) => void
  riskLevel?: "low" | "medium" | "high" | "critical"
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

  const riskColors = {
    low: "border-yellow-500/30",
    medium: "border-orange-500/30", 
    high: "border-red-500/30",
    critical: "border-red-600/50"
  }

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className={`bg-gray-900/30 hover:border-red-500/30 transition-all duration-500 overflow-hidden ${riskColors[riskLevel]} ${
        isActive ? "ring-2 ring-red-500/50" : ""
      }`}>
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-red-500" />
            </div>
            {title}
            <Badge variant="outline" className={`
              ${riskLevel === "critical" ? "border-red-600 text-red-400" : ""}
              ${riskLevel === "high" ? "border-red-500 text-red-400" : ""}
              ${riskLevel === "medium" ? "border-orange-500 text-orange-400" : ""}
              ${riskLevel === "low" ? "border-yellow-500 text-yellow-400" : ""}
            `}>
              {riskLevel.toUpperCase()} RISK
            </Badge>
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
    <div className="pl-4 border-l-2 border-red-500/30 space-y-3">
      {children}
    </div>
  </div>
)

const RiskWarningBox = ({ type = "critical", title, children }: { type?: "warning" | "critical" | "info", title: string, children: React.ReactNode }) => {
  const styles = {
    critical: "bg-red-900/30 border-red-500 text-red-100",
    warning: "bg-orange-900/30 border-orange-500 text-orange-100",
    info: "bg-blue-900/30 border-blue-500 text-blue-100"
  }

  const icons = {
    critical: <AlertTriangle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Shield className="w-5 h-5" />
  }

  return (
    <div className={`p-6 rounded-lg border-2 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <h5 className="font-bold text-lg mb-2">{title}</h5>
          <div className="space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const RiskList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2">
    {items.map((item, index) => (
      <li key={index} className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

export default function RiskDisclosureClient() {
  const [activeSection, setActiveSection] = useState("overview")
  const [acknowledgments, setAcknowledgments] = useState({
    tradingRisks: false,
    platformLimitations: false,
    userResponsibility: false,
    noGuarantees: false,
    totalRiskAcceptance: false
  })

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleSectionInView = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const allAcknowledged = Object.values(acknowledgments).every(Boolean)

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Critical Warning Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-900/90 border-b-2 border-red-500 p-2 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <p className="text-white font-bold text-sm flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            CRITICAL RISK WARNING: TRADING INVOLVES SUBSTANTIAL RISK OF LOSS - READ ALL DISCLOSURES
            <AlertTriangle className="h-4 w-4" />
          </p>
        </div>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-red-900/5 via-transparent to-orange-900/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
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
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                MANDATORY DISCLOSURE
              </Badge>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                FINANCIAL RISKS
              </Badge>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                TECHNOLOGY RISKS
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Risk Disclosure
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Important information about trading risks, platform limitations, and your responsibilities 
              when using Nexural Trading Platform's educational software and tools
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
              <span>Last Updated: January 2024</span>
              <span>•</span>
              <span>Version 4.2</span>
              <span>•</span>
              <span>Regulatory Compliant</span>
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
              title="Risk Overview" 
              icon={AlertTriangle}
              isActive={activeSection === "overview"}
              onInView={handleSectionInView}
              riskLevel="critical"
            >
              <RiskWarningBox type="critical" title="CRITICAL UNDERSTANDING REQUIRED">
                <p className="font-bold text-lg">
                  TRADING AND USING TRADING SOFTWARE INVOLVES SUBSTANTIAL RISK OF FINANCIAL LOSS
                </p>
                <p>
                  Before using Nexural Trading Platform, you must understand and accept that trading 
                  financial instruments carries significant risks that could result in the loss of all 
                  or part of your investment capital.
                </p>
              </RiskWarningBox>
              
              <SubSection title="Our Role and Limitations">
                <p>
                  Nexural Trading Platform provides educational software, tools, and information only. We are:
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-red-500">
                  <p className="font-semibold text-red-400 mb-2">NOT:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Investment advisors or financial advisors</li>
                    <li>Broker-dealers or financial institutions</li>
                    <li>Responsible for your trading decisions or outcomes</li>
                    <li>Guaranteeing any profits or returns</li>
                    <li>Registered with financial regulatory bodies</li>
                  </ul>
                </div>
              </SubSection>

              <SubSection title="Execution Layer Platform">
                <RiskWarningBox type="info" title="Platform Clarification">
                  <p>
                    We are an "execution layer" platform that provides software tools. We do not:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Hold, manage, or have access to your funds</li>
                    <li>Execute trades on your behalf</li>
                    <li>Provide custody services</li>
                    <li>Act as a broker or financial intermediary</li>
                  </ul>
                  <p className="mt-3">
                    Your money remains with your chosen broker at all times.
                  </p>
                </RiskWarningBox>
              </SubSection>
            </Section>

            {/* Section 2: Trading & Market Risks */}
            <Section 
              id="trading-risks" 
              title="Trading & Market Risks" 
              icon={TrendingDown}
              isActive={activeSection === "trading-risks"}
              onInView={handleSectionInView}
              riskLevel="critical"
            >
              <RiskWarningBox type="critical" title="SUBSTANTIAL RISK OF LOSS">
                <p className="font-bold">
                  TRADING FINANCIAL INSTRUMENTS CAN RESULT IN TOTAL LOSS OF CAPITAL
                </p>
                <p>
                  Past performance is not indicative of future results. No trading strategy or system 
                  can guarantee profits or prevent losses.
                </p>
              </RiskWarningBox>

              <SubSection title="Market Risk Factors">
                <RiskList items={[
                  "Market volatility can cause rapid and substantial losses",
                  "Economic events and news can dramatically affect prices",
                  "Liquidity issues may prevent you from exiting positions",
                  "Gaps in pricing can result in larger losses than anticipated",
                  "Currency fluctuations affect international positions",
                  "Interest rate changes impact various financial instruments",
                  "Political events and regulatory changes create uncertainty",
                  "Market manipulation and insider trading affect fair pricing"
                ]} />
              </SubSection>

              <SubSection title="Specific Trading Risks">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                    <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Options Trading
                    </h5>
                    <ul className="text-sm space-y-1">
                      <li>• Options can expire worthless (100% loss)</li>
                      <li>• Time decay reduces option value daily</li>
                      <li>• Implied volatility changes affect pricing</li>
                      <li>• Complex strategies multiply risks</li>
                    </ul>
                  </div>

                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                    <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Futures Trading
                    </h5>
                    <ul className="text-sm space-y-1">
                      <li>• High leverage magnifies losses</li>
                      <li>• Margin calls can force position closure</li>
                      <li>• Unlimited loss potential</li>
                      <li>• Contract expiration and rollover risks</li>
                    </ul>
                  </div>

                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                    <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Forex Trading
                    </h5>
                    <ul className="text-sm space-y-1">
                      <li>• Extreme leverage (up to 500:1)</li>
                      <li>• 24-hour market creates overnight risk</li>
                      <li>• Central bank interventions</li>
                      <li>• Geopolitical events cause volatility</li>
                    </ul>
                  </div>

                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                    <h5 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Cryptocurrency
                    </h5>
                    <ul className="text-sm space-y-1">
                      <li>• Extreme price volatility</li>
                      <li>• Regulatory uncertainty</li>
                      <li>• Technology and security risks</li>
                      <li>• Market manipulation concerns</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Leverage Risks">
                <RiskWarningBox type="critical" title="LEVERAGE AMPLIFIES LOSSES">
                  <p className="font-bold">
                    Leverage can magnify both gains and losses exponentially.
                  </p>
                  <p>
                    A 2% adverse move in a 50:1 leveraged position results in a 100% loss of capital. 
                    Many retail traders lose money due to excessive leverage usage.
                  </p>
                  <div className="mt-3 p-3 bg-red-800/30 rounded">
                    <p className="text-sm font-semibold">Example: $1,000 account with 100:1 leverage</p>
                    <p className="text-sm">Position size: $100,000 | 1% adverse move = Total loss</p>
                  </div>
                </RiskWarningBox>
              </SubSection>
            </Section>

            {/* Section 3: Platform & Technology Risks */}
            <Section 
              id="platform-risks" 
              title="Platform & Technology Risks" 
              icon={Settings}
              isActive={activeSection === "platform-risks"}
              onInView={handleSectionInView}
              riskLevel="high"
            >
              <SubSection title="System Availability Risks">
                <RiskList items={[
                  "Platform downtime may prevent you from managing positions",
                  "Internet connectivity issues can cause execution delays",
                  "Server maintenance may temporarily limit access",
                  "Third-party service outages affect platform functionality",
                  "Mobile app crashes could prevent critical actions",
                  "Browser compatibility issues may cause display problems",
                  "Software updates might temporarily disrupt services"
                ]} />
              </SubSection>

              <SubSection title="Data Feed and Pricing Risks">
                <RiskWarningBox type="warning" title="DATA ACCURACY DISCLAIMER">
                  <p>
                    Market data and pricing information may be delayed, inaccurate, or incomplete. 
                    We rely on third-party data providers and cannot guarantee data accuracy.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Real-time data may have delays of 15+ minutes</li>
                    <li>Price discrepancies between providers are common</li>
                    <li>Historical data may contain errors or gaps</li>
                    <li>News and fundamental data may be outdated</li>
                  </ul>
                </RiskWarningBox>
              </SubSection>

              <SubSection title="Technology Infrastructure Risks">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-orange-400 mb-2">Cloud Service Risks</h5>
                    <ul className="text-sm space-y-1">
                      <li>• AWS/cloud provider outages</li>
                      <li>• Data center failures</li>
                      <li>• Network routing issues</li>
                      <li>• Geographic service disruptions</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-orange-400 mb-2">Security Risks</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Cybersecurity attacks</li>
                      <li>• Data breaches</li>
                      <li>• Unauthorized access attempts</li>
                      <li>• Malware and viruses</li>
                    </ul>
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* Section 4: Software Limitations */}
            <Section 
              id="software-limitations" 
              title="Software Limitations" 
              icon={XCircle}
              isActive={activeSection === "software-limitations"}
              onInView={handleSectionInView}
              riskLevel="high"
            >
              <RiskWarningBox type="critical" title="NO SOFTWARE GUARANTEES">
                <p className="font-bold">
                  OUR SOFTWARE AND TOOLS PROVIDE NO GUARANTEES OF ACCURACY, PROFITABILITY, OR RELIABILITY
                </p>
                <p>
                  All software contains bugs, limitations, and potential errors that could affect performance.
                </p>
              </RiskWarningBox>

              <SubSection title="Backtesting and Historical Analysis Limitations">
                <RiskList items={[
                  "Past performance does not guarantee future results",
                  "Backtesting assumes perfect execution (unrealistic)",
                  "Historical data may contain survivorship bias",
                  "Market conditions change and strategies may become obsolete",
                  "Slippage and transaction costs are often underestimated",
                  "Optimization can lead to curve-fitting and false confidence",
                  "Out-of-sample testing may not reflect real market conditions"
                ]} />
              </SubSection>

              <SubSection title="Indicator and Signal Limitations">
                <div className="space-y-4">
                  <RiskWarningBox type="warning" title="INDICATOR RELIABILITY">
                    <p>
                      Technical indicators are mathematical calculations based on price and volume data. 
                      They are not predictive and can generate false signals.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>Lagging indicators show what already happened</li>
                      <li>Leading indicators often produce false signals</li>
                      <li>Conflicting indicators create analysis paralysis</li>
                      <li>Market regimes can invalidate indicator effectiveness</li>
                    </ul>
                  </RiskWarningBox>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-yellow-400 mb-2">Common Indicator Issues</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Moving averages lag price action</li>
                      <li>• RSI and oscillators give false reversals</li>
                      <li>• Support/resistance levels are subjective</li>
                      <li>• Pattern recognition has low reliability</li>
                      <li>• Volume indicators can be misleading</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Algorithm and Model Risks">
                <p>
                  Our algorithms and models are based on historical data and mathematical assumptions 
                  that may not hold true in future market conditions.
                </p>
                <RiskList items={[
                  "Models may fail during market stress or regime changes",
                  "Algorithm updates could change performance characteristics", 
                  "Statistical relationships can break down unexpectedly",
                  "Overfitting to historical data reduces future effectiveness",
                  "Black swan events are not captured in models",
                  "Market microstructure changes affect algorithm performance"
                ]} />
              </SubSection>
            </Section>

            {/* Section 5: User Responsibility */}
            <Section 
              id="user-responsibility" 
              title="User Responsibility" 
              icon={Users}
              isActive={activeSection === "user-responsibility"}
              onInView={handleSectionInView}
              riskLevel="critical"
            >
              <RiskWarningBox type="critical" title="YOU ARE 100% RESPONSIBLE">
                <p className="font-bold text-lg">
                  ALL TRADING DECISIONS AND THEIR CONSEQUENCES ARE ENTIRELY YOUR RESPONSIBILITY
                </p>
                <p>
                  We provide tools and educational content only. You must make all trading decisions 
                  independently and accept full responsibility for outcomes.
                </p>
              </RiskWarningBox>

              <SubSection title="Due Diligence Requirements">
                <p>
                  Before using our platform or making any trading decisions, you must:
                </p>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Conduct your own research and analysis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Understand the risks of financial instruments you trade</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Verify all information from independent sources</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Consider your financial situation and risk tolerance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Consult with qualified financial professionals if needed</span>
                    </li>
                  </ul>
                </div>
              </SubSection>

              <SubSection title="Risk Management is Your Responsibility">
                <RiskList items={[
                  "Set appropriate position sizes based on your risk tolerance",
                  "Use stop-loss orders to limit potential losses",
                  "Diversify your portfolio across different assets and strategies",
                  "Never risk more than you can afford to lose completely",
                  "Regularly monitor and adjust your positions",
                  "Keep detailed records of all trading activities",
                  "Stay informed about market conditions and news",
                  "Continuously educate yourself about trading and risk management"
                ]} />
              </SubSection>

              <SubSection title="Capital Requirements and Suitability">
                <RiskWarningBox type="warning" title="TRADING SUITABILITY">
                  <p>
                    Trading is not suitable for everyone. You should only trade with risk capital - 
                    money you can afford to lose completely without affecting your lifestyle.
                  </p>
                  <div className="mt-3 p-3 bg-orange-800/30 rounded">
                    <p className="text-sm font-semibold">Consider these factors:</p>
                    <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                      <li>Your financial objectives and experience</li>
                      <li>Your risk tolerance and emotional stability</li>
                      <li>Available capital and liquidity needs</li>
                      <li>Time commitment required for active trading</li>
                    </ul>
                  </div>
                </RiskWarningBox>
              </SubSection>
            </Section>

            {/* Section 6: Financial Disclaimers */}
            <Section 
              id="financial-disclaimers" 
              title="Financial Disclaimers" 
              icon={DollarSign}
              isActive={activeSection === "financial-disclaimers"}
              onInView={handleSectionInView}
              riskLevel="critical"
            >
              <RiskWarningBox type="critical" title="NOT FINANCIAL ADVICE">
                <p className="font-bold text-lg">
                  NOTHING ON OUR PLATFORM CONSTITUTES FINANCIAL, INVESTMENT, OR TRADING ADVICE
                </p>
                <p>
                  All content, tools, and information are provided for educational purposes only. 
                  Any trading ideas or strategies shared are examples, not recommendations.
                </p>
              </RiskWarningBox>

              <SubSection title="Performance Disclaimers">
                <div className="space-y-4">
                  <RiskWarningBox type="warning" title="HYPOTHETICAL PERFORMANCE">
                    <p>
                      Hypothetical or backtested performance results have inherent limitations:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>No actual trading was performed</li>
                      <li>Results may not reflect actual trading costs</li>
                      <li>Perfect market timing is assumed</li>
                      <li>Market impact and slippage are often ignored</li>
                      <li>Survivorship bias may skew results</li>
                    </ul>
                  </RiskWarningBox>

                  <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-red-500">
                    <h5 className="font-semibold text-red-400 mb-2">Performance Warnings</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Past performance is not indicative of future results</li>
                      <li>• Individual results will vary significantly</li>
                      <li>• Market conditions constantly change</li>
                      <li>• Strategy performance deteriorates over time</li>
                      <li>• Risk-adjusted returns may be poor</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Regulatory Disclaimers">
                <p>
                  We are not registered as investment advisers, broker-dealers, or in any other capacity 
                  with any securities regulator. We do not provide:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-red-900/20 p-3 rounded border border-red-500/30">
                    <h5 className="font-semibold text-red-400 text-sm mb-2">NOT PROVIDED:</h5>
                    <ul className="text-xs space-y-1">
                      <li>• Investment advice or recommendations</li>
                      <li>• Portfolio management services</li>
                      <li>• Fiduciary duties or obligations</li>
                      <li>• Regulated financial services</li>
                      <li>• Suitability determinations</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                    <h5 className="font-semibold text-blue-400 text-sm mb-2">WE ONLY PROVIDE:</h5>
                    <ul className="text-xs space-y-1">
                      <li>• Educational software and tools</li>
                      <li>• General market information</li>
                      <li>• Historical data analysis</li>
                      <li>• Technical analysis examples</li>
                      <li>• Educational content and tutorials</li>
                    </ul>
                  </div>
                </div>
              </SubSection>
            </Section>

            {/* Section 7: Regulatory Warnings */}
            <Section 
              id="regulatory-warnings" 
              title="Regulatory Warnings" 
              icon={Shield}
              isActive={activeSection === "regulatory-warnings"}
              onInView={handleSectionInView}
              riskLevel="high"
            >
              <SubSection title="Jurisdictional Compliance">
                <p>
                  Financial regulations vary by jurisdiction. It is your responsibility to ensure 
                  compliance with all applicable laws in your location.
                </p>
                <RiskWarningBox type="info" title="REGULATORY CONSIDERATIONS">
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Some trading strategies may be restricted in certain jurisdictions</li>
                    <li>Tax implications vary by country and trading activity</li>
                    <li>Reporting requirements may apply to your trading gains/losses</li>
                    <li>Professional licensing may be required for certain activities</li>
                  </ul>
                </RiskWarningBox>
              </SubSection>

              <SubSection title="Regulatory Body Warnings">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-orange-400 mb-2">US Regulators</h5>
                    <ul className="text-sm space-y-1">
                      <li>• SEC: Securities regulations</li>
                      <li>• FINRA: Broker-dealer oversight</li>
                      <li>• CFTC: Commodities and derivatives</li>
                      <li>• NFA: Futures industry regulation</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h5 className="font-semibold text-orange-400 mb-2">International</h5>
                    <ul className="text-sm space-y-1">
                      <li>• FCA (UK): Financial conduct authority</li>
                      <li>• ESMA (EU): Securities market authority</li>
                      <li>• ASIC (AU): Investment and securities</li>
                      <li>• FSA (JP): Financial services agency</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Pattern Day Trading Rules">
                <RiskWarningBox type="warning" title="PDT RULE COMPLIANCE">
                  <p>
                    US residents with accounts under $25,000 are subject to Pattern Day Trading rules 
                    that limit day trading activities.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Maximum of 3 day trades per 5-business-day period</li>
                    <li>Account restrictions if rules are violated</li>
                    <li>Margin requirements may apply</li>
                    <li>Different rules for cash vs. margin accounts</li>
                  </ul>
                </RiskWarningBox>
              </SubSection>
            </Section>

            {/* Section 8: AI & Automation Risks */}
            <Section 
              id="ai-automation-risks" 
              title="AI & Automation Risks" 
              icon={Brain}
              isActive={activeSection === "ai-automation-risks"}
              onInView={handleSectionInView}
              riskLevel="high"
            >
              <RiskWarningBox type="critical" title="ARTIFICIAL INTELLIGENCE LIMITATIONS">
                <p className="font-bold">
                  AI AND MACHINE LEARNING SYSTEMS HAVE SIGNIFICANT LIMITATIONS AND BIASES
                </p>
                <p>
                  AI-powered features may produce inaccurate, biased, or unreliable results that 
                  could lead to poor trading decisions.
                </p>
              </RiskWarningBox>

              <SubSection title="Machine Learning Model Risks">
                <RiskList items={[
                  "Models are trained on historical data that may not represent future conditions",
                  "Overfitting to training data reduces real-world performance",
                  "Models may exhibit unexpected behavior in new market regimes",
                  "Bias in training data leads to biased predictions",
                  "Black box models provide no explanation for their decisions",
                  "Model degradation occurs over time without retraining",
                  "Adversarial examples can fool AI systems",
                  "Correlation vs. causation confusion in model predictions"
                ]} />
              </SubSection>

              <SubSection title="Automated Trading System Risks">
                <div className="space-y-4">
                  <RiskWarningBox type="warning" title="AUTOMATION HAZARDS">
                    <p>
                      Automated trading systems can amplify losses through rapid, uncontrolled execution:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>System malfunctions can cause massive losses in minutes</li>
                      <li>Programming errors may execute unintended trades</li>
                      <li>Network delays can cause timing issues</li>
                      <li>Position sizing errors can risk entire accounts</li>
                    </ul>
                  </RiskWarningBox>

                  <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-500/30">
                    <h5 className="font-semibold text-orange-400 mb-2">Automation Safety Requirements</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Always implement maximum loss limits</li>
                      <li>• Test thoroughly in demo environments</li>
                      <li>• Monitor automated systems continuously</li>
                      <li>• Have manual override capabilities</li>
                      <li>• Keep detailed logs of all automated actions</li>
                      <li>• Review and update algorithms regularly</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Algorithm Bias and Fairness">
                <p>
                  AI systems may perpetuate or amplify existing market biases and may not perform 
                  equally well across different market conditions, asset classes, or time periods.
                </p>
              </SubSection>
            </Section>

            {/* Section 9: Data & Information Risks */}
            <Section 
              id="data-risks" 
              title="Data & Information Risks" 
              icon={BarChart3}
              isActive={activeSection === "data-risks"}
              onInView={handleSectionInView}
              riskLevel="medium"
            >
              <SubSection title="Data Quality and Accuracy">
                <RiskWarningBox type="warning" title="DATA RELIABILITY DISCLAIMER">
                  <p>
                    We source data from multiple third-party providers. Data quality can vary and 
                    may contain errors, omissions, or delays.
                  </p>
                </RiskWarningBox>
                
                <RiskList items={[
                  "Real-time data feeds may have delays up to 20 minutes",
                  "Historical data may contain gaps, errors, or revisions",
                  "Corporate actions may not be reflected immediately",
                  "Dividend adjustments might be incorrect or delayed",
                  "Economic data releases may be revised after publication",
                  "News sentiment analysis has inherent subjectivity",
                  "Alternative data sources vary in reliability and timeliness"
                ]} />
              </SubSection>

              <SubSection title="Information Overload and Analysis Paralysis">
                <p>
                  Our platform provides access to vast amounts of market data and information. 
                  Too much information can lead to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Decision paralysis from conflicting signals</li>
                  <li>Over-analysis leading to missed opportunities</li>
                  <li>False confidence from complex indicators</li>
                  <li>Neglecting fundamental risk management principles</li>
                </ul>
              </SubSection>

              <SubSection title="News and Social Media Risks">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h5 className="font-semibold text-yellow-400 mb-2">Information Risks</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Fake news and market manipulation</li>
                    <li>• Social media sentiment can be artificially inflated</li>
                    <li>• News latency affects trading decisions</li>
                    <li>• Information asymmetry disadvantages retail traders</li>
                    <li>• Insider information may drive price movements</li>
                  </ul>
                </div>
              </SubSection>
            </Section>

            {/* Section 10: Business & Operational Risks */}
            <Section 
              id="business-risks" 
              title="Business & Operational Risks" 
              icon={Globe}
              isActive={activeSection === "business-risks"}
              onInView={handleSectionInView}
              riskLevel="medium"
            >
              <SubSection title="Platform Business Risks">
                <RiskWarningBox type="info" title="SERVICE CONTINUITY">
                  <p>
                    Our business operations face various risks that could affect service availability:
                  </p>
                </RiskWarningBox>
                
                <RiskList items={[
                  "Business model changes may affect feature availability",
                  "Financial difficulties could impact service quality",
                  "Regulatory changes might force service modifications",
                  "Competitive pressures may lead to strategic pivots",
                  "Key personnel departures could affect product development",
                  "Technology obsolescence requires constant updates",
                  "Legal challenges could restrict certain features"
                ]} />
              </SubSection>

              <SubSection title="Third-Party Dependencies">
                <p>
                  Our platform relies on numerous third-party services, creating operational dependencies:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h5 className="font-semibold text-blue-400 text-sm mb-2">Data Providers</h5>
                    <ul className="text-xs space-y-1">
                      <li>• Market data feed interruptions</li>
                      <li>• Pricing disagreements and disputes</li>
                      <li>• Quality degradation over time</li>
                      <li>• Coverage limitations for certain assets</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h5 className="font-semibold text-blue-400 text-sm mb-2">Technology Partners</h5>
                    <ul className="text-xs space-y-1">
                      <li>• Cloud service provider outages</li>
                      <li>• Payment processor limitations</li>
                      <li>• Security service dependencies</li>
                      <li>• API rate limiting and restrictions</li>
                    </ul>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Regulatory and Compliance Risks">
                <p>
                  Changing regulations could require modifications to our platform or services, 
                  potentially affecting your access to certain features or data.
                </p>
              </SubSection>
            </Section>

            {/* Section 11: Risk Acknowledgment */}
            <Section 
              id="acknowledgment" 
              title="Risk Acknowledgment" 
              icon={CheckCircle2}
              isActive={activeSection === "acknowledgment"}
              onInView={handleSectionInView}
              riskLevel="critical"
            >
              <RiskWarningBox type="critical" title="MANDATORY ACKNOWLEDGMENT">
                <p className="font-bold text-lg mb-3">
                  YOU MUST ACKNOWLEDGE AND ACCEPT ALL RISKS BEFORE USING OUR PLATFORM
                </p>
                <p>
                  By checking the boxes below, you confirm that you have read, understood, and 
                  accept all risks outlined in this disclosure.
                </p>
              </RiskWarningBox>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-red-500/30">
                  <Checkbox
                    id="trading-risks"
                    checked={acknowledgments.tradingRisks}
                    onCheckedChange={(checked) => 
                      setAcknowledgments(prev => ({ ...prev, tradingRisks: !!checked }))
                    }
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="trading-risks" className="text-white font-medium cursor-pointer">
                      Trading and Market Risks
                    </label>
                    <p className="text-sm text-gray-400 mt-1">
                      I understand that trading involves substantial risk of loss and that I could lose 
                      all of my invested capital.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-red-500/30">
                  <Checkbox
                    id="platform-limitations"
                    checked={acknowledgments.platformLimitations}
                    onCheckedChange={(checked) => 
                      setAcknowledgments(prev => ({ ...prev, platformLimitations: !!checked }))
                    }
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="platform-limitations" className="text-white font-medium cursor-pointer">
                      Platform and Software Limitations
                    </label>
                    <p className="text-sm text-gray-400 mt-1">
                      I understand that our software has limitations, may contain errors, and provides 
                      no guarantees of accuracy or profitability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-red-500/30">
                  <Checkbox
                    id="user-responsibility"
                    checked={acknowledgments.userResponsibility}
                    onCheckedChange={(checked) => 
                      setAcknowledgments(prev => ({ ...prev, userResponsibility: !!checked }))
                    }
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="user-responsibility" className="text-white font-medium cursor-pointer">
                      Full Personal Responsibility
                    </label>
                    <p className="text-sm text-gray-400 mt-1">
                      I acknowledge that all trading decisions are my responsibility and that I will conduct 
                      my own due diligence before making any trading decisions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-red-500/30">
                  <Checkbox
                    id="no-guarantees"
                    checked={acknowledgments.noGuarantees}
                    onCheckedChange={(checked) => 
                      setAcknowledgments(prev => ({ ...prev, noGuarantees: !!checked }))
                    }
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="no-guarantees" className="text-white font-medium cursor-pointer">
                      No Guarantees or Warranties
                    </label>
                    <p className="text-sm text-gray-400 mt-1">
                      I understand that Nexural Trading Platform provides no guarantees, warranties, or 
                      promises regarding profitability or investment returns.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-red-900/30 rounded-lg border-2 border-red-500">
                  <Checkbox
                    id="total-risk-acceptance"
                    checked={acknowledgments.totalRiskAcceptance}
                    onCheckedChange={(checked) => 
                      setAcknowledgments(prev => ({ ...prev, totalRiskAcceptance: !!checked }))
                    }
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="total-risk-acceptance" className="text-white font-bold cursor-pointer">
                      Complete Risk Acceptance
                    </label>
                    <p className="text-sm text-red-200 mt-1 font-medium">
                      I HAVE READ AND UNDERSTOOD ALL RISKS OUTLINED IN THIS DISCLOSURE AND ACCEPT 
                      COMPLETE RESPONSIBILITY FOR ALL CONSEQUENCES OF USING THIS PLATFORM.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  disabled={!allAcknowledged}
                  className={`px-12 py-4 text-lg font-bold ${
                    allAcknowledged 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {allAcknowledged 
                    ? "I Accept All Risks and Responsibilities" 
                    : "Please Acknowledge All Risk Categories Above"
                  }
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  This acknowledgment will be recorded with your account and IP address
                </p>
              </div>
            </Section>

            {/* Footer Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 text-center"
            >
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-8">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Questions About These Risks?
                  </h3>
                  <p className="text-gray-300 mb-6">
                    If you have any questions about the risks outlined in this disclosure, 
                    please consult with a qualified financial professional before proceeding.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-red-600 text-white hover:bg-red-700">
                      Contact Risk Management
                    </Button>
                    <Link href="/legal">
                      <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
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


