"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Shield, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Heart,
  Scale,
  BookOpen,
  Mail,
  Phone,
  ExternalLink,
  ArrowRight,
  Info
} from "lucide-react"

export default function CommunityGuidelinesClient() {
  const guidelines = [
    {
      id: 'respectful-communication',
      title: 'Respectful Communication',
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'from-blue-900/20 to-blue-800/20',
      borderColor: 'border-blue-700',
      description: 'Maintain professional and respectful communication at all times',
      rules: [
        'Use professional language in all communications',
        'Respect different trading strategies and opinions',
        'No personal attacks, harassment, or discriminatory language',
        'Constructive criticism is welcome, but be respectful',
        'Keep discussions relevant to trading and finance'
      ],
      examples: {
        good: [
          'I respectfully disagree with that analysis because...',
          'Thanks for sharing your strategy, here\'s my perspective...',
          'Could you explain your reasoning for that trade?'
        ],
        bad: [
          'That\'s a stupid trade idea',
          'You don\'t know what you\'re talking about',
          'Only idiots would buy that stock'
        ]
      }
    },
    {
      id: 'accurate-information',
      title: 'Accurate Information Sharing',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'from-green-900/20 to-green-800/20',
      borderColor: 'border-green-700',
      description: 'Share only accurate, verified information and clearly mark opinions',
      rules: [
        'Verify information before sharing market data or news',
        'Clearly distinguish between facts and personal opinions',
        'Cite sources when sharing research or analysis',
        'No spreading of false or misleading information',
        'Correct mistakes promptly when identified'
      ],
      examples: {
        good: [
          'According to [source], the earnings report shows...',
          'In my opinion, this technical pattern suggests...',
          'I was wrong about that prediction, here\'s the updated analysis...'
        ],
        bad: [
          'I heard from someone that this stock will definitely...',
          'This is guaranteed to make you rich',
          'Trust me, this insider information says...'
        ]
      }
    },
    {
      id: 'no-financial-advice',
      title: 'No Unlicensed Financial Advice',
      icon: Scale,
      color: 'text-amber-400',
      bgColor: 'from-amber-900/20 to-amber-800/20',
      borderColor: 'border-amber-700',
      description: 'Educational content only - no personalized financial advice',
      rules: [
        'Share educational content and analysis, not advice',
        'Always include appropriate disclaimers',
        'No recommendations for specific personal financial decisions',
        'Encourage users to do their own research',
        'Direct users to licensed professionals for personal advice'
      ],
      examples: {
        good: [
          'Here\'s my analysis of this stock for educational purposes...',
          'This strategy worked for me, but do your own research',
          'Consider consulting a financial advisor for your situation'
        ],
        bad: [
          'You should definitely buy this stock',
          'Sell everything and put it all in crypto',
          'This is exactly what you need for your portfolio'
        ]
      }
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'from-purple-900/20 to-purple-800/20',
      borderColor: 'border-purple-700',
      description: 'Protect your privacy and respect others\' confidential information',
      rules: [
        'Never share personal account information or passwords',
        'Don\'t request others\' private trading data',
        'Protect your API keys and trading credentials',
        'No sharing of non-public or confidential information',
        'Report suspected security issues immediately'
      ],
      examples: {
        good: [
          'I can share my general strategy without specifics',
          'Here\'s a screenshot with sensitive data redacted',
          'I noticed a potential security issue and reported it'
        ],
        bad: [
          'Here\'s my account balance and positions',
          'Can someone check my API key? Here it is...',
          'I got this insider information from my friend at...'
        ]
      }
    },
    {
      id: 'content-quality',
      title: 'Quality Content Standards',
      icon: BookOpen,
      color: 'text-cyan-400',
      bgColor: 'from-cyan-900/20 to-cyan-800/20',
      borderColor: 'border-cyan-700',
      description: 'Maintain high-quality, valuable content for the community',
      rules: [
        'Post substantive, well-researched content',
        'Use clear, professional formatting',
        'Stay on-topic and relevant to trading',
        'No spam, self-promotion, or repetitive posts',
        'Include charts, data, or analysis to support points'
      ],
      examples: {
        good: [
          'Here\'s my technical analysis with supporting charts...',
          'I researched this sector and found these trends...',
          'Based on historical data, this pattern suggests...'
        ],
        bad: [
          'To the moon! 🚀🚀🚀',
          'Buy my trading course for $99',
          'Same generic post copy/pasted everywhere'
        ]
      }
    }
  ]

  const violations = [
    {
      severity: 'Minor',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-700',
      consequences: ['Warning message', 'Content removal', 'Temporary comment restriction'],
      examples: ['Off-topic posts', 'Minor spam', 'Unclear disclaimers']
    },
    {
      severity: 'Moderate',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-700',
      consequences: ['Account warning', 'Temporary restrictions', '24-48 hour suspension'],
      examples: ['Misleading information', 'Unlicensed advice', 'Inappropriate language']
    },
    {
      severity: 'Severe',
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-700',
      consequences: ['Account suspension', '7-30 day ban', 'Loss of privileges'],
      examples: ['Harassment', 'Market manipulation', 'Sharing personal info']
    },
    {
      severity: 'Critical',
      color: 'text-red-600',
      bgColor: 'bg-red-900/40',
      borderColor: 'border-red-600',
      consequences: ['Permanent ban', 'Legal action', 'Account termination'],
      examples: ['Fraud', 'Illegal activities', 'Serious security breaches']
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-cyan-600">Community Standards</Badge>
          <h1 className="text-4xl font-bold mb-4">Community Guidelines</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our community guidelines ensure a safe, respectful, and productive environment for all traders. 
            Please read and follow these standards to maintain our high-quality trading community.
          </p>
        </div>

        {/* Key Principles */}
        <Card className="mb-12 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-cyan-400" />
              Core Principles
            </CardTitle>
            <CardDescription>
              The foundation of our trading community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Respect</h3>
                <p className="text-gray-400 text-sm">
                  Treat all community members with dignity and professionalism
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Integrity</h3>
                <p className="text-gray-400 text-sm">
                  Share accurate information and maintain transparency in all communications
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Education</h3>
                <p className="text-gray-400 text-sm">
                  Focus on learning, sharing knowledge, and helping others grow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Guidelines */}
        <div className="space-y-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Detailed Guidelines</h2>
          
          {guidelines.map((guideline, index) => (
            <Card key={guideline.id} className={`bg-gradient-to-r ${guideline.bgColor} ${guideline.borderColor}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <guideline.icon className={`w-6 h-6 ${guideline.color}`} />
                  {index + 1}. {guideline.title}
                </CardTitle>
                <CardDescription>{guideline.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Rules & Expectations:</h4>
                    <ul className="space-y-2">
                      {guideline.rules.map((rule, ruleIndex) => (
                        <li key={ruleIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                      <h5 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Good Examples
                      </h5>
                      <ul className="space-y-2">
                        {guideline.examples.good.map((example, exampleIndex) => (
                          <li key={exampleIndex} className="text-sm text-gray-300 italic">
                            "{example}"
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                      <h5 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Avoid These
                      </h5>
                      <ul className="space-y-2">
                        {guideline.examples.bad.map((example, exampleIndex) => (
                          <li key={exampleIndex} className="text-sm text-gray-300 italic">
                            "{example}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Consequences & Enforcement */}
        <Card className="mb-12 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-400" />
              Consequences & Enforcement
            </CardTitle>
            <CardDescription>
              How we handle guideline violations to maintain community standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {violations.map((violation, index) => (
                <div key={index} className={`p-4 rounded-lg ${violation.bgColor} border ${violation.borderColor}`}>
                  <h4 className={`font-semibold ${violation.color} mb-2`}>{violation.severity} Violation</h4>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold mb-2">Examples:</h5>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {violation.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex}>• {example}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold mb-2">Consequences:</h5>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {violation.consequences.map((consequence, consequenceIndex) => (
                        <li key={consequenceIndex}>• {consequence}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">Fair Enforcement Process</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• All reports are reviewed by our moderation team</li>
                    <li>• Context and intent are considered in all decisions</li>
                    <li>• Users can appeal decisions through our support system</li>
                    <li>• Repeat violations result in escalated consequences</li>
                    <li>• Serious violations may result in immediate action</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting & Support */}
        <Card className="mb-12 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-6 h-6 text-red-400" />
              Reporting Violations
            </CardTitle>
            <CardDescription>
              How to report guideline violations and get help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Reporting Methods</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Flag className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-semibold">In-App Reporting</div>
                      <div className="text-sm text-gray-400">Use the report button on posts and comments</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-semibold">Email Support</div>
                      <div className="text-sm text-gray-400">moderation@nexural.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-semibold">Live Chat</div>
                      <div className="text-sm text-gray-400">Available 24/7 for urgent issues</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">What to Include</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Specific link or location of the violation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Which guideline was violated</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Screenshots or evidence if applicable</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Brief description of the issue</span>
                  </li>
                </ul>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <h5 className="font-semibold text-blue-400 mb-2">Response Time</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Critical issues: Within 1 hour</li>
                    <li>• Serious violations: Within 4 hours</li>
                    <li>• Standard reports: Within 24 hours</li>
                    <li>• Minor issues: Within 48 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Appeals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                Appeals Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  If you believe a moderation action was taken in error, you can appeal the decision:
                </p>
                <ol className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Submit an appeal within 7 days of the action</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Provide additional context or clarification</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Our review team will investigate within 48 hours</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span>Receive a detailed response with the final decision</span>
                  </li>
                </ol>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  Submit Appeal
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                Questions & Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Have questions about our community guidelines or need clarification?
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full border-gray-600 justify-between">
                    <span>Visit Help Center</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full border-gray-600 justify-between">
                    <span>Contact Support</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full border-gray-600 justify-between">
                    <span>Community Forum</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400 text-center">
                    For urgent safety concerns, contact us immediately at <br />
                    <span className="text-red-400">emergency@nexural.com</span> or call <span className="text-red-400">(555) 123-HELP</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final CTA */}
        <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-700">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Thank You for Helping Us Build a Better Community</h2>
            <p className="text-gray-400 mb-6">
              By following these guidelines, you're contributing to a safe, respectful, and productive trading environment for everyone.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                Join the Community
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-gray-600">
                Read Terms of Service
              </Button>
            </div>
            <div className="mt-6 text-xs text-gray-500">
              Last updated: January 15, 2024 • These guidelines are subject to change with notice
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


