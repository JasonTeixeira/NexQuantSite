"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

const RiskListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="relative py-4 pl-8 border-b border-primary/10 before:content-['⚠️'] before:absolute before:left-0 before:top-4">
    {children}
  </li>
)

const TermsListItem = ({ number, children }: { number: number; children: React.ReactNode }) => (
  <li className="relative mb-6 pl-12">
    <span className="absolute left-0 text-xl font-bold text-primary">{number}.</span>
    {children}
  </li>
)

export default function LegalPageClient() {
  const [isChecked, setIsChecked] = useState(false)
  const [signature, setSignature] = useState("")
  const [hasReadAll, setHasReadAll] = useState(false)
  const [acknowledgedRisks, setAcknowledgedRisks] = useState(false)
  const [acceptedNoRefunds, setAcceptedNoRefunds] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const greenOrb = document.querySelector(".glow-orb.green") as HTMLElement
      const blueOrb = document.querySelector(".glow-orb.blue") as HTMLElement
      if (!greenOrb || !blueOrb) return

      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight

      greenOrb.style.transform = `translate(${x * 50}px, ${y * 50}px)`
      blueOrb.style.transform = `translate(${-x * 50}px, ${-y * 50}px)`
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    const isNowChecked = !!checked
    setIsChecked(isNowChecked)

    if (isNowChecked) {
      const now = new Date()
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setSignature(`
        Electronic Signature Captured:
        Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}
        Timezone: ${timezone}
        Agreement Version: 2.0
      `)
    } else {
      setSignature("")
    }
  }

  return (
    <>
      <div className="grid-bg"></div>
      <div className="glow-orb green"></div>
      <div className="glow-orb blue"></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <header className="text-center mb-16 pt-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-white">
            Terms of Service & Risk Disclosure
          </h1>
          <p className="text-lg text-gray-400">Please review our complete terms and conditions carefully</p>
        </header>

        <div className="p-8 mb-12 bg-gray-900/50 border border-gray-700 rounded-xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <h2 className="text-xl font-semibold text-white">Important Risk Disclosure</h2>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-center text-gray-300 mb-4">
            Trading futures and forex involves substantial risk of loss and is not suitable for all investors.
          </p>
          <div className="space-y-2 text-sm text-gray-400 max-w-3xl mx-auto">
            <p>• We are an execution layer platform only and do not hold or manage client funds</p>
            <p>• Your funds remain with your chosen broker at all times</p>
            <p>• We are not registered investment advisors or financial institutions</p>
            <p>• All trading decisions are your sole responsibility</p>
            <p>• Past performance is not indicative of future results</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 0 - Platform Overview */}
          <section className="bg-gray-900/30 border border-gray-700 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Platform Overview
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                <strong className="text-white">Execution Layer Software:</strong> NEXURAL is an execution layer platform that provides 
                software tools for trading. We do not hold, manage, or have access to client funds. Your money remains with your 
                chosen broker at all times.
              </p>
              <p className="leading-relaxed">
                <strong className="text-white">Educational Purpose:</strong> This platform provides educational tools and software only. 
                We are not a broker, bank, or financial institution. We do not provide investment advice or recommendations.
              </p>
            </div>
          </section>

          {/* Section 1 */}
          <section className="relative overflow-hidden bg-white/5 border border-primary/20 rounded-xl p-10 animate-slide">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wide mb-6">
              1. DEFINITION OF SERVICES - EDUCATION & TOOLS ONLY
            </h2>
            <div className="space-y-6 text-white/80 leading-loose">
              <p>
                <strong>NEXURAL PROVIDES EDUCATIONAL TOOLS, SOFTWARE, AND INFORMATION ONLY.</strong> We are NOT:
              </p>
              <ul className="list-none space-y-2">
                <RiskListItem>Investment advisors or financial advisors</RiskListItem>
                <RiskListItem>Broker-dealers or securities professionals</RiskListItem>
                <RiskListItem>Fiduciaries or money managers</RiskListItem>
                <RiskListItem>Registered with SEC, FINRA, CFTC, or any regulatory body</RiskListItem>
                <RiskListItem>Responsible for your trading decisions or losses</RiskListItem>
                <RiskListItem>Guaranteeing any software, indicator, or system will be profitable</RiskListItem>
              </ul>
              <div className="text-center p-6 my-8 bg-red-900/50 border-2 border-red-500 rounded-lg">
                <p className="font-black text-red-400 text-lg uppercase">
                  WE ONLY PROVIDE EDUCATIONAL CONTENT, SOFTWARE TOOLS & SYSTEMS
                  <br />
                  ALL TRADING DECISIONS AND RISKS ARE 100% YOURS
                  <br />
                  OUR TOOLS ARE FOR EDUCATIONAL USE ONLY
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="relative overflow-hidden bg-white/5 border border-primary/20 rounded-xl p-10 animate-slide">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wide mb-6">
              2. SOFTWARE, INDICATORS & AUTOMATION RISKS
            </h2>
            <div className="space-y-6 text-white/80 leading-loose">
              <div className="text-center p-8 my-8 bg-gradient-to-br from-red-600/20 to-red-700/10 border-2 border-red-500 rounded-lg">
                <h3 className="text-2xl font-bold text-red-400 uppercase mb-2">⚠️ CRITICAL SOFTWARE WARNINGS ⚠️</h3>
                <p className="font-semibold text-white/90">
                  <strong>ALL SOFTWARE, INDICATORS, AND SYSTEMS CAN AND WILL FAIL</strong>
                </p>
              </div>
              <p>
                <strong>BY USING OUR SOFTWARE, INDICATORS, OR AUTOMATED SYSTEMS, YOU ACCEPT:</strong>
              </p>
              <ol className="list-none space-y-4">
                <TermsListItem number={1}>
                  <strong>NO PERFORMANCE WARRANTIES:</strong> Our indicators, systems, and automation tools may contain
                  bugs, are NOT guaranteed to be profitable, and may fail catastrophically. They are educational tools
                  only.
                </TermsListItem>
                <TermsListItem number={2}>
                  <strong>BACKTESTING DECEPTION:</strong> All historical/backtested results are HYPOTHETICAL, created
                  with hindsight, and WILL NOT match real trading results. Real results will be SIGNIFICANTLY WORSE.
                </TermsListItem>
                <TermsListItem number={3}>
                  <strong>AUTOMATION CATASTROPHE RISKS:</strong> Automated systems can execute unintended trades, fail
                  to close positions, and lose your entire account. CONSTANT human supervision is required.
                </TermsListItem>
                <TermsListItem number={4}>
                  <strong>TECHNICAL FAILURE ACCEPTANCE:</strong> You accept that software, internet, and hardware WILL
                  fail at the worst possible times. We are NOT liable for ANY technical failures.
                </TermsListItem>
              </ol>
              <div className="text-center p-6 my-8 bg-red-900/50 border-2 border-red-500 rounded-lg">
                <p className="font-black text-red-400 text-lg uppercase">
                  YOU MUST MONITOR ALL AUTOMATED TRADES CONSTANTLY
                  <br />
                  NEVER RELY SOLELY ON OUR SOFTWARE OR SIGNALS
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="relative overflow-hidden bg-white/5 border border-primary/20 rounded-xl p-10 animate-slide">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wide mb-6">
              3. COMPLETE FINANCIAL RISK DISCLOSURE
            </h2>
            <div className="space-y-6 text-white/80 leading-loose">
              <div className="text-center p-6 my-8 bg-red-900/50 border-2 border-red-500 rounded-lg">
                <p className="font-black text-red-400 text-lg uppercase">
                  YOU WILL LIKELY LOSE ALL YOUR MONEY
                  <br />
                  95%+ OF TRADERS LOSE EVERYTHING
                  <br />
                  THIS WILL PROBABLY HAPPEN TO YOU
                </p>
              </div>
              <p>
                <strong>BY USING OUR SERVICES, YOU ACKNOWLEDGE AND ACCEPT:</strong>
              </p>
              <ol className="list-none space-y-4">
                <TermsListItem number={1}>
                  <strong>TOTAL LOSS GUARANTEE:</strong> You WILL likely lose 100% of your capital. This is not a risk -
                  it is the expected outcome.
                </TermsListItem>
                <TermsListItem number={2}>
                  <strong>NO SUCCESS GUARANTEES:</strong> We guarantee NOTHING. Most users lose all their money. Past
                  performance means nothing.
                </TermsListItem>
                <TermsListItem number={3}>
                  <strong>YOUR SOLE RESPONSIBILITY:</strong> Every loss, every failed trade, every technical problem,
                  every bad decision - 100% YOUR responsibility, not ours.
                </TermsListItem>
                <TermsListItem number={4}>
                  <strong>LEVERAGE DESTRUCTION:</strong> Using leverage can result in losses exceeding your entire
                  account and financial ruin.
                </TermsListItem>
                <TermsListItem number={5}>
                  <strong>PSYCHOLOGICAL DESTRUCTION:</strong> Trading often causes addiction, depression, anxiety, and
                  relationship destruction.
                </TermsListItem>
              </ol>
            </div>
          </section>

          {/* Section 4 */}
          <section className="relative overflow-hidden bg-white/5 border border-primary/20 rounded-xl p-10 animate-slide">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wide mb-6">
              4. SOFTWARE LICENSE & INTELLECTUAL PROPERTY
            </h2>
            <div className="space-y-6 text-white/80 leading-loose">
              <p>
                <strong>ALL SOFTWARE PROVIDED "AS-IS" WITH NO WARRANTIES.</strong> You assume ALL risks of using our
                software.
              </p>
              <p>
                <strong>INTELLECTUAL PROPERTY - WE OWN EVERYTHING.</strong> All systems, code, and content are our
                property. You receive a LIMITED LICENSE for personal, educational use ONLY. NO redistribution, copying,
                or reverse engineering. Violation = immediate termination + legal action.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="relative overflow-hidden bg-white/5 border border-primary/20 rounded-xl p-10 animate-slide">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wide mb-6">
              5. PAYMENT TERMS - ABSOLUTELY NO REFUNDS EVER
            </h2>
            <div className="space-y-6 text-white/80 leading-loose">
              <div className="text-center p-6 my-8 bg-red-900/50 border-2 border-red-500 rounded-lg">
                <p className="font-black text-red-400 text-lg uppercase">
                  ALL SALES ARE FINAL - NO REFUNDS FOR ANY REASON
                  <br />
                  EVEN IF SOFTWARE FAILS OR YOU LOSE MONEY
                  <br />
                  NO EXCEPTIONS - NO NEGOTIATIONS
                </p>
              </div>
              <p>
                <strong>BY PURCHASING, YOU AGREE:</strong> NO REFUNDS for any reason. CHARGEBACKS = FRAUD and will be
                prosecuted. Subscriptions auto-renew until YOU cancel. It is your responsibility to cancel before
                renewal.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="relative overflow-hidden bg-white/5 border border-primary/20 rounded-xl p-10 animate-slide">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wide mb-6">
              6. SUPPORT LIMITATIONS & DISCLAIMERS
            </h2>
            <div className="space-y-6 text-white/80 leading-loose">
              <p>
                <strong>SUPPORT IS LIMITED TO TECHNICAL ISSUES ONLY.</strong> We DO NOT provide trading advice, suggest
                settings, or help with trade decisions. All implementation decisions are yours alone.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="relative overflow-hidden bg-white/5 border border-primary/20 rounded-xl p-10 animate-slide">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wide mb-6">
              7. COMPREHENSIVE LEGAL PROTECTION TERMS
            </h2>
            <div className="space-y-6 text-white/80 leading-loose">
              <ol className="list-none space-y-4">
                <TermsListItem number={1}>
                  <strong>COMPLETE LIABILITY WAIVER:</strong> You waive ALL claims against Nexural Trading for ANY
                  losses or damages.
                </TermsListItem>
                <TermsListItem number={2}>
                  <strong>INDEMNIFICATION:</strong> You will defend and indemnify Nexural Trading from ANY claims
                  arising from your use of our services.
                </TermsListItem>
                <TermsListItem number={3}>
                  <strong>ARBITRATION REQUIREMENT:</strong> Any dispute will be resolved through BINDING ARBITRATION.
                  You waive ALL rights to jury trial or court proceedings.
                </TermsListItem>
                <TermsListItem number={4}>
                  <strong>CLASS ACTION WAIVER:</strong> You cannot participate in class action lawsuits.
                </TermsListItem>
                <TermsListItem number={5}>
                  <strong>LIMITATION OF LIABILITY:</strong> Maximum liability cannot exceed amount paid for service.
                </TermsListItem>
              </ol>
            </div>
          </section>

          {/* Section 8 & 9 */}
          <section className="relative overflow-hidden bg-white/5 border border-primary/20 rounded-xl p-10 animate-slide">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wide mb-6">
              8 & 9. RESULTS & REGULATORY DISCLAIMERS
            </h2>
            <div className="space-y-6 text-white/80 leading-loose">
              <div className="text-center p-6 my-8 bg-red-900/50 border-2 border-red-500 rounded-lg">
                <p className="font-black text-red-400 text-lg uppercase">
                  ANY INCOME OR PROFIT EXAMPLES ARE NOT TYPICAL
                  <br />
                  MOST USERS MAKE $0 OR LOSE MONEY
                </p>
              </div>
              <p>
                <strong>U.S. GOVERNMENT REQUIRED DISCLAIMER (CFTC RULE 4.41):</strong> HYPOTHETICAL OR SIMULATED
                PERFORMANCE RESULTS HAVE CERTAIN LIMITATIONS. UNLIKE AN ACTUAL PERFORMANCE RECORD, SIMULATED RESULTS DO
                NOT REPRESENT ACTUAL TRADING. NO REPRESENTATION IS BEING MADE THAT ANY ACCOUNT WILL OR IS LIKELY TO
                ACHIEVE PROFIT OR LOSSES SIMILAR TO THOSE SHOWN.
              </p>
            </div>
          </section>

          {/* Final Acknowledgment */}
          <section className="text-center p-10 my-12 bg-gradient-to-br from-primary/10 to-cyan-400/10 border-2 border-primary/30 rounded-xl">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wide mb-6">
              FINAL ACKNOWLEDGMENT & ELECTRONIC SIGNATURE
            </h2>
            <div className="text-left max-w-3xl mx-auto space-y-2 text-white/90 mb-8">
              <p>
                <strong>BY CLICKING BELOW, YOU ACKNOWLEDGE THAT:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>You have read and understood EVERY word of this agreement.</li>
                <li>You accept that trading will likely result in TOTAL LOSS of your money.</li>
                <li>You accept our software/systems CAN AND WILL FAIL.</li>
                <li>You accept 100% RESPONSIBILITY for all trading decisions and losses.</li>
                <li>You understand there are ABSOLUTELY NO REFUNDS.</li>
                <li>You WAIVE ALL CLAIMS against Nexural Trading for any losses.</li>
                <li>You agree to BINDING ARBITRATION.</li>
                <li>This is a LEGALLY BINDING CONTRACT.</li>
              </ul>
            </div>
            <div className="text-center p-6 my-8 bg-red-900/50 border-2 border-red-500 rounded-lg">
              <p className="font-black text-red-400 text-lg uppercase">
                THIS IS A LEGAL CONTRACT THAT WAIVES IMPORTANT RIGHTS
                <br />
                DO NOT PROCEED IF YOU DON'T ACCEPT 100% RESPONSIBILITY
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 my-8">
              <Checkbox
                id="acknowledge"
                onCheckedChange={handleCheckboxChange}
                className="w-6 h-6 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-black"
              />
              <label htmlFor="acknowledge" className="text-lg font-semibold text-white/90 cursor-pointer">
                I ACCEPT ALL TERMS, ASSUME ALL RISKS, AND WAIVE ALL CLAIMS
              </label>
            </div>
            {signature && (
              <div className="p-4 mt-4 bg-black/50 rounded-lg font-mono text-primary/80 text-sm whitespace-pre-wrap">
                {signature}
              </div>
            )}
            <Button
              size="lg"
              className={cn(
                "mt-8 text-lg font-bold uppercase tracking-wider px-12 py-8 transition-all duration-300",
                !isChecked && "opacity-50 cursor-not-allowed",
              )}
              disabled={!isChecked}
            >
              I Accept All Risks and Terms
            </Button>
          </section>
        </div>
      </div>
    </>
  )
}
