"use client"

import { useState, useEffect } from "react"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GlobalRiskWarning() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)

  useEffect(() => {
    // Check if user has acknowledged the warning in this session
    const acknowledged = sessionStorage.getItem("risk-warning-acknowledged")
    if (!acknowledged) {
      setIsVisible(true)
    } else {
      setHasAcknowledged(true)
    }
  }, [])

  const handleAcknowledge = () => {
    sessionStorage.setItem("risk-warning-acknowledged", "true")
    setHasAcknowledged(true)
    setIsVisible(false)
  }

  // Professional risk disclosure - no aggressive top banner
  return (
    <>

      {/* Professional Risk Disclosure Modal - First Visit */}
      {isVisible && !hasAcknowledged && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {/* Professional Header */}
              <div className="text-center mb-6">
                <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                <h1 className="text-2xl font-semibold text-white mb-2">
                  Important Risk Disclosure
                </h1>
                <p className="text-gray-400">Please review our terms before proceeding</p>
              </div>

              {/* Professional Content */}
              <div className="space-y-6">
                {/* Risk Disclosure */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
                  <h2 className="text-lg font-semibold text-white mb-3">
                    Trading Risk Disclosure
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Trading futures and forex involves substantial risk of loss and is not suitable for all investors. 
                    The high degree of leverage can work against you as well as for you. Past performance is not 
                    indicative of future results. You should carefully consider your investment objectives, level of 
                    experience, and risk appetite before deciding to trade.
                  </p>
                </div>

                {/* Service Definition */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
                  <h2 className="text-lg font-semibold text-white mb-3">
                    Nature of Our Service
                  </h2>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• We provide execution layer software only</li>
                    <li>• We do not hold or manage client funds</li>
                    <li>• Your funds remain with your chosen broker</li>
                    <li>• We are not registered investment advisors</li>
                    <li>• This platform provides educational tools only</li>
                  </ul>
                </div>

                {/* User Responsibility */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5">
                  <h2 className="text-lg font-semibold text-white mb-3">
                    Your Responsibilities
                  </h2>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• All trading decisions are your sole responsibility</li>
                    <li>• You accept all risks associated with trading</li>
                    <li>• You should only trade with risk capital</li>
                    <li>• You agree to our terms of service and policies</li>
                    <li>• You understand our refund and dispute policies</li>
                  </ul>
                </div>

                {/* Legal Notice */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <strong className="text-gray-200">Legal Notice:</strong> By using this platform, you agree to binding arbitration 
                    for dispute resolution and waive rights to jury trials and class actions. This platform provides educational 
                    software only and does not constitute investment advice. Please review our complete terms of service and 
                    privacy policy for full details.
                  </p>
                </div>

                {/* Acknowledgment Section */}
                <div className="bg-gray-800/30 rounded-lg p-6">
                  <p className="text-white font-medium text-center mb-4">
                    Please acknowledge that you have read and understood:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-300 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      Trading involves substantial risk of loss
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      We do not hold or manage your funds
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      You are responsible for all trading decisions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      This is not investment advice
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      You agree to our terms and conditions
                    </li>
                  </ul>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleAcknowledge}
                      className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-3"
                    >
                      I Understand and Accept
                    </Button>
                    <Link href="/legal" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-800/50"
                      >
                        Review Full Terms
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
