"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Shield, CheckCircle, AlertTriangle, Brain, BarChart3, 
  FileText, Code, TrendingUp, Clock, Eye, Award,
  Star, Users, DollarSign, Target, Activity
} from "lucide-react"

interface StrategyVerificationProps {
  strategy: any
  className?: string
}

export default function EnhancedStrategyVerification({ strategy, className }: StrategyVerificationProps) {
  const [showVerificationDetails, setShowVerificationDetails] = useState(false)

  // Mock verification data
  const verificationData = {
    overall_score: 92,
    performance_verification: {
      score: 89,
      status: 'verified',
      backtest_quality: 'High',
      data_integrity: 'Verified',
      statistical_significance: 'Confirmed',
      out_of_sample_testing: 'Passed'
    },
    code_quality: {
      score: 95,
      status: 'excellent',
      security_scan: 'Clean',
      performance_optimized: true,
      documentation: 'Complete',
      best_practices: 'Followed'
    },
    author_credibility: {
      score: 88,
      verification_level: 'Professional',
      track_record: '24 months',
      success_rate: 84.2,
      community_rating: 4.8
    },
    risk_assessment: {
      score: 91,
      fraud_indicators: 'None',
      realistic_claims: 'Yes',
      transparency: 'High',
      compliance: 'Full'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (score >= 75) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <div className={className}>
      {/* Verification Summary Badge */}
      <div className="mb-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Nexural Verified Strategy</h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                Independently verified performance and code quality
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(verificationData.overall_score)}`}>
              {verificationData.overall_score}
            </div>
            <div className="text-xs text-gray-400">Verification Score</div>
          </div>
        </div>
      </div>

      {/* Quick Verification Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
          <BarChart3 className="w-4 h-4 text-green-400" />
          <div>
            <div className="text-sm font-semibold text-white">Performance</div>
            <div className="text-xs text-green-400">Verified</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
          <Code className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-sm font-semibold text-white">Code Quality</div>
            <div className="text-xs text-blue-400">Excellent</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
          <Users className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-sm font-semibold text-white">Author</div>
            <div className="text-xs text-purple-400">Professional</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
          <Shield className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-sm font-semibold text-white">Risk</div>
            <div className="text-xs text-cyan-400">Low</div>
          </div>
        </div>
      </div>

      {/* Detailed Verification Button */}
      <Button 
        variant="outline" 
        className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10"
        onClick={() => setShowVerificationDetails(true)}
      >
        <Eye className="w-4 h-4 mr-2" />
        View Detailed Verification Report
      </Button>

      {/* Detailed Verification Modal */}
      <Dialog open={showVerificationDetails} onOpenChange={setShowVerificationDetails}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-400" />
              Strategy Verification Report
            </DialogTitle>
            <DialogDescription>
              Independent verification of strategy performance, code quality, and risk assessment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Overall Verification Score</h3>
                  <div className={`text-4xl font-bold ${getScoreColor(verificationData.overall_score)}`}>
                    {verificationData.overall_score}/100
                  </div>
                </div>
                <Progress value={verificationData.overall_score} className="h-3 bg-gray-700" />
                <p className="text-sm text-gray-400 mt-2">
                  This strategy has passed all verification checks and meets our quality standards
                </p>
              </CardContent>
            </Card>

            {/* Verification Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Verification */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Performance Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Overall Score</span>
                      <div className="flex items-center gap-2">
                        <div className={`text-lg font-bold ${getScoreColor(verificationData.performance_verification.score)}`}>
                          {verificationData.performance_verification.score}
                        </div>
                        <Badge className={getScoreBadgeVariant(verificationData.performance_verification.score)}>
                          {verificationData.performance_verification.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Backtest Quality:</span>
                        <span className="text-green-400">{verificationData.performance_verification.backtest_quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data Integrity:</span>
                        <span className="text-green-400">{verificationData.performance_verification.data_integrity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Statistical Significance:</span>
                        <span className="text-green-400">{verificationData.performance_verification.statistical_significance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Out-of-Sample Testing:</span>
                        <span className="text-green-400">{verificationData.performance_verification.out_of_sample_testing}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Code Quality */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    Code Quality Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Overall Score</span>
                      <div className="flex items-center gap-2">
                        <div className={`text-lg font-bold ${getScoreColor(verificationData.code_quality.score)}`}>
                          {verificationData.code_quality.score}
                        </div>
                        <Badge className={getScoreBadgeVariant(verificationData.code_quality.score)}>
                          {verificationData.code_quality.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Security Scan:</span>
                        <span className="text-green-400">{verificationData.code_quality.security_scan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Performance Optimized:</span>
                        <span className="text-green-400">
                          {verificationData.code_quality.performance_optimized ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Documentation:</span>
                        <span className="text-green-400">{verificationData.code_quality.documentation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Best Practices:</span>
                        <span className="text-green-400">{verificationData.code_quality.best_practices}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Author Credibility */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Author Credibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Credibility Score</span>
                      <div className="flex items-center gap-2">
                        <div className={`text-lg font-bold ${getScoreColor(verificationData.author_credibility.score)}`}>
                          {verificationData.author_credibility.score}
                        </div>
                        <Badge className={getScoreBadgeVariant(verificationData.author_credibility.score)}>
                          {verificationData.author_credibility.verification_level}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Track Record:</span>
                        <span className="text-purple-400">{verificationData.author_credibility.track_record}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Success Rate:</span>
                        <span className="text-purple-400">{verificationData.author_credibility.success_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Community Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-purple-400">{verificationData.author_credibility.community_rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Risk Score</span>
                      <div className="flex items-center gap-2">
                        <div className={`text-lg font-bold ${getScoreColor(verificationData.risk_assessment.score)}`}>
                          {verificationData.risk_assessment.score}
                        </div>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          Low Risk
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fraud Indicators:</span>
                        <span className="text-cyan-400">{verificationData.risk_assessment.fraud_indicators}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Realistic Claims:</span>
                        <span className="text-cyan-400">{verificationData.risk_assessment.realistic_claims}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Transparency:</span>
                        <span className="text-cyan-400">{verificationData.risk_assessment.transparency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Compliance:</span>
                        <span className="text-cyan-400">{verificationData.risk_assessment.compliance}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verification Process */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-400" />
                  Verification Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Automated Checks</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Performance data validation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Code security scanning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Statistical significance testing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Fraud detection algorithms</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-3">Manual Review</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Expert trader review</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Code quality assessment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Documentation review</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Author background check</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-400 mb-1">Nexural Verification Guarantee</h4>
                      <p className="text-sm text-blue-300">
                        This strategy has been independently verified by our team of quantitative analysts 
                        and trading experts. We guarantee the accuracy of the performance metrics and the 
                        quality of the provided materials.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="font-semibold text-white">Performance Verified</div>
                <div className="text-xs text-green-400">Independently backtested</div>
              </div>
              
              <div className="text-center p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="font-semibold text-white">Security Checked</div>
                <div className="text-xs text-blue-400">Code safety verified</div>
              </div>
              
              <div className="text-center p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="font-semibold text-white">Author Verified</div>
                <div className="text-xs text-purple-400">Professional credentials</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
