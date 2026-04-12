"use client"

import { AlertTriangle, Shield, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function MaximumLegalProtection() {
  return (
    <div className="relative">
      {/* CRITICAL WARNING BANNER - IMPOSSIBLE TO MISS */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-900 border-b-4 border-red-500 p-3 animate-pulse">
        <div className="container mx-auto text-center">
          <p className="text-white font-black text-sm md:text-base flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            EXTREME RISK WARNING: THIS IS NOT INVESTMENT ADVICE - YOU WILL LOSE YOUR MONEY - WE ARE NOT RESPONSIBLE
            <AlertTriangle className="h-5 w-5" />
          </p>
        </div>
      </div>

      {/* MASSIVE DISCLAIMER SECTION */}
      <div className="bg-black border-4 border-red-600 rounded-xl p-8 my-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-red-500 mb-4 animate-pulse">
            ⚠️ ULTIMATE LEGAL DISCLAIMER ⚠️
          </h1>
          <p className="text-2xl font-bold text-red-400">
            READ EVERY WORD - THIS IS A BINDING LEGAL CONTRACT
          </p>
        </div>

        {/* Section 1: WE ARE NOT A FINANCIAL INSTITUTION */}
        <section className="mb-12 p-6 bg-red-950/50 border-2 border-red-500 rounded-xl">
          <h2 className="text-3xl font-black text-red-400 mb-6 text-center">
            🚫 WE ARE NOT A FINANCIAL INSTITUTION 🚫
          </h2>
          <div className="space-y-4 text-white">
            <p className="text-xl font-bold text-center bg-black/80 p-4 rounded-lg">
              NEXURAL IS ONLY AN EXECUTION LAYER SOFTWARE APPLICATION
            </p>
            <ul className="space-y-3 text-lg">
              <li className="flex items-start gap-2">
                <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                <span><strong>WE DO NOT:</strong> Hold, handle, touch, manage, or have ANY access to your money</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                <span><strong>WE DO NOT:</strong> Provide investment advice, recommendations, or financial guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                <span><strong>WE DO NOT:</strong> Act as a broker, dealer, advisor, or any regulated entity</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                <span><strong>WE ARE NOT:</strong> Registered with SEC, FINRA, CFTC, NFA, or ANY regulatory body</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                <span><strong>WE ARE NOT:</strong> Licensed, certified, or authorized to provide ANY financial services</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                <span><strong>WE ARE NOT:</strong> Responsible for ANY trading decisions, losses, or outcomes</span>
              </li>
            </ul>
            <div className="bg-black p-6 rounded-xl border-4 border-red-600 mt-6">
              <p className="text-2xl font-black text-red-400 text-center">
                WE ARE JUST SOFTWARE - LIKE A CALCULATOR OR SPREADSHEET
                <br />
                YOU PUSH THE BUTTONS - YOU TAKE THE RISKS - YOU OWN THE RESULTS
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: EXECUTION LAYER ONLY */}
        <section className="mb-12 p-6 bg-red-950/50 border-2 border-red-500 rounded-xl">
          <h2 className="text-3xl font-black text-red-400 mb-6 text-center">
            ⚙️ EXECUTION LAYER SOFTWARE ONLY ⚙️
          </h2>
          <div className="space-y-4 text-white">
            <div className="bg-gradient-to-r from-red-900 to-red-800 p-6 rounded-xl">
              <p className="text-xl font-bold mb-4">WHAT WE ACTUALLY ARE:</p>
              <ul className="space-y-2">
                <li>• A software interface that connects to YOUR broker</li>
                <li>• A tool that sends YOUR orders to YOUR account</li>
                <li>• An educational platform showing market data</li>
                <li>• A calculator for risk/reward scenarios</li>
                <li>• A visualization tool for market information</li>
              </ul>
            </div>
            <div className="bg-black/80 p-6 rounded-xl border-2 border-yellow-500">
              <p className="text-xl font-black text-yellow-400 text-center">
                ⚡ YOUR BROKER HOLDS YOUR MONEY - NOT US ⚡
                <br />
                <span className="text-lg text-white">
                  We NEVER touch, see, or have access to your funds
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: YOU ARE 100% RESPONSIBLE */}
        <section className="mb-12 p-6 bg-red-950/50 border-2 border-red-500 rounded-xl">
          <h2 className="text-3xl font-black text-red-400 mb-6 text-center">
            👤 YOU ARE 100% RESPONSIBLE FOR EVERYTHING 👤
          </h2>
          <div className="space-y-4 text-white">
            <div className="bg-gradient-to-r from-orange-900 to-red-900 p-6 rounded-xl">
              <p className="text-2xl font-black text-center mb-4">BY USING OUR SOFTWARE, YOU ACCEPT:</p>
              <ul className="space-y-3 text-lg">
                <li>✓ YOU make all trading decisions</li>
                <li>✓ YOU are responsible for all losses</li>
                <li>✓ YOU understand the risks</li>
                <li>✓ YOU have the knowledge to trade</li>
                <li>✓ YOU accept software can fail</li>
                <li>✓ YOU monitor all positions</li>
                <li>✓ YOU manage your own risk</li>
                <li>✓ YOU cannot blame us for ANYTHING</li>
              </ul>
            </div>
            <div className="bg-black p-6 rounded-xl border-4 border-orange-600">
              <p className="text-2xl font-black text-orange-400 text-center">
                IF YOU LOSE MONEY = YOUR FAULT
                <br />
                IF SOFTWARE FAILS = YOUR RESPONSIBILITY
                <br />
                IF MARKETS CRASH = YOUR PROBLEM
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: REGULATORY COMPLIANCE */}
        <section className="mb-12 p-6 bg-red-950/50 border-2 border-red-500 rounded-xl">
          <h2 className="text-3xl font-black text-red-400 mb-6 text-center">
            📜 REGULATORY & LEGAL DISCLAIMERS 📜
          </h2>
          <div className="space-y-6 text-white">
            {/* SEC Disclaimer */}
            <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-blue-500">
              <p className="font-bold text-blue-400 mb-2">SEC DISCLAIMER:</p>
              <p className="text-sm">
                This software is not registered with the Securities and Exchange Commission. We are not investment advisors, broker-dealers, or any regulated entity under the Securities Act of 1933, Securities Exchange Act of 1934, or Investment Advisers Act of 1940. No content should be construed as investment advice.
              </p>
            </div>

            {/* CFTC Disclaimer */}
            <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-green-500">
              <p className="font-bold text-green-400 mb-2">CFTC RULE 4.41 DISCLAIMER:</p>
              <p className="text-sm">
                HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE CERTAIN LIMITATIONS. UNLIKE AN ACTUAL PERFORMANCE RECORD, SIMULATED RESULTS DO NOT REPRESENT ACTUAL TRADING. ALSO, SINCE THE TRADES HAVE NOT BEEN EXECUTED, THE RESULTS MAY HAVE UNDER-OR-OVER COMPENSATED FOR THE IMPACT, IF ANY, OF CERTAIN MARKET FACTORS, SUCH AS LACK OF LIQUIDITY. SIMULATED TRADING PROGRAMS IN GENERAL ARE ALSO SUBJECT TO THE FACT THAT THEY ARE DESIGNED WITH THE BENEFIT OF HINDSIGHT. NO REPRESENTATION IS BEING MADE THAT ANY ACCOUNT WILL OR IS LIKELY TO ACHIEVE PROFIT OR LOSSES SIMILAR TO THOSE SHOWN.
              </p>
            </div>

            {/* NFA Disclaimer */}
            <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-purple-500">
              <p className="font-bold text-purple-400 mb-2">NFA DISCLAIMER:</p>
              <p className="text-sm">
                We are not members of the National Futures Association. Trading futures and forex involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results.
              </p>
            </div>

            {/* FINRA Disclaimer */}
            <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-yellow-500">
              <p className="font-bold text-yellow-400 mb-2">FINRA DISCLAIMER:</p>
              <p className="text-sm">
                We are not FINRA members or associated persons. This is not a solicitation or recommendation to buy or sell any securities. All information is for educational purposes only.
              </p>
            </div>

            {/* International Disclaimers */}
            <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-red-500">
              <p className="font-bold text-red-400 mb-2">INTERNATIONAL REGULATORY DISCLAIMERS:</p>
              <p className="text-sm mb-2">
                <strong>EU/MiFID II:</strong> Not authorized by any EU regulatory authority. May not be suitable for retail clients under MiFID II.
              </p>
              <p className="text-sm mb-2">
                <strong>UK/FCA:</strong> Not regulated by the Financial Conduct Authority. UK residents trade at their own risk.
              </p>
              <p className="text-sm mb-2">
                <strong>CANADA:</strong> Not registered with any Canadian provincial securities commission.
              </p>
              <p className="text-sm">
                <strong>AUSTRALIA/ASIC:</strong> Not authorized by the Australian Securities and Investments Commission.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: COMPREHENSIVE LIABILITY WAIVER */}
        <section className="mb-12 p-6 bg-red-950/50 border-2 border-red-500 rounded-xl">
          <h2 className="text-3xl font-black text-red-400 mb-6 text-center">
            🛡️ COMPLETE LIABILITY WAIVER & INDEMNIFICATION 🛡️
          </h2>
          <div className="space-y-4 text-white">
            <div className="bg-black/90 p-6 rounded-xl border-2 border-red-600">
              <p className="text-xl font-bold mb-4">YOU HEREBY WAIVE, RELEASE, AND DISCHARGE:</p>
              <ul className="space-y-2">
                <li>• ALL claims for losses, damages, or injuries</li>
                <li>• ALL claims for software failures or errors</li>
                <li>• ALL claims for incorrect data or calculations</li>
                <li>• ALL claims for trading losses of any kind</li>
                <li>• ALL claims for emotional or psychological damage</li>
                <li>• ALL claims for lost profits or opportunities</li>
                <li>• ALL claims for consequential or incidental damages</li>
                <li>• ALL rights to sue in any jurisdiction</li>
                <li>• ALL rights to class action participation</li>
                <li>• ALL rights to jury trials</li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-red-900 to-orange-900 p-6 rounded-xl">
              <p className="text-xl font-black text-center">
                YOU AGREE TO INDEMNIFY, DEFEND, AND HOLD HARMLESS
                <br />
                NEXURAL AND ALL AFFILIATES FROM ANY AND ALL CLAIMS
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: ARBITRATION & JURISDICTION */}
        <section className="mb-12 p-6 bg-red-950/50 border-2 border-red-500 rounded-xl">
          <h2 className="text-3xl font-black text-red-400 mb-6 text-center">
            ⚖️ MANDATORY BINDING ARBITRATION ⚖️
          </h2>
          <div className="space-y-4 text-white">
            <div className="bg-gray-900 p-6 rounded-xl">
              <p className="text-lg mb-4"><strong>ARBITRATION AGREEMENT:</strong></p>
              <ul className="space-y-2">
                <li>• All disputes resolved through BINDING ARBITRATION</li>
                <li>• Arbitration under AAA Commercial Rules</li>
                <li>• Arbitration location: Delaware, USA</li>
                <li>• Governing Law: Delaware State Law</li>
                <li>• Each party bears own legal costs</li>
                <li>• NO CLASS ACTIONS permitted</li>
                <li>• NO JURY TRIALS permitted</li>
                <li>• Arbitration decision is FINAL</li>
              </ul>
            </div>
            <div className="bg-black p-4 rounded-xl border-2 border-yellow-500">
              <p className="text-center font-bold text-yellow-400">
                BY USING THIS SOFTWARE, YOU WAIVE YOUR RIGHT TO SUE IN COURT
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: NO WARRANTIES */}
        <section className="mb-12 p-6 bg-red-950/50 border-2 border-red-500 rounded-xl">
          <h2 className="text-3xl font-black text-red-400 mb-6 text-center">
            ❌ ABSOLUTELY NO WARRANTIES ❌
          </h2>
          <div className="bg-black/90 p-6 rounded-xl border-4 border-red-600">
            <p className="text-2xl font-black text-red-400 text-center mb-4">
              SOFTWARE PROVIDED "AS IS" WITH NO WARRANTIES
            </p>
            <p className="text-lg text-center">
              NO WARRANTY OF MERCHANTABILITY
              <br />
              NO WARRANTY OF FITNESS FOR PURPOSE
              <br />
              NO WARRANTY OF ACCURACY
              <br />
              NO WARRANTY OF RELIABILITY
              <br />
              NO WARRANTY AGAINST LOSSES
              <br />
              NO WARRANTY OF PROFITABILITY
            </p>
          </div>
        </section>

        {/* Final Ultimate Warning */}
        <div className="mt-12 p-8 bg-gradient-to-r from-red-900 via-orange-900 to-red-900 rounded-xl border-4 border-red-500">
          <h2 className="text-4xl font-black text-white text-center mb-6 animate-pulse">
            🚨 FINAL ULTIMATE WARNING 🚨
          </h2>
          <div className="space-y-4 text-white text-center">
            <p className="text-2xl font-bold">
              YOU WILL LOSE MONEY
            </p>
            <p className="text-xl">
              95% OF ALL TRADERS LOSE EVERYTHING
            </p>
            <p className="text-xl">
              OUR SOFTWARE WILL NOT MAKE YOU PROFITABLE
            </p>
            <p className="text-xl">
              WE ARE NOT RESPONSIBLE FOR YOUR LOSSES
            </p>
            <p className="text-xl">
              YOU CANNOT SUE US FOR ANY REASON
            </p>
            <p className="text-2xl font-black text-yellow-400 mt-6">
              IF YOU DON'T ACCEPT 100% RESPONSIBILITY
              <br />
              DO NOT USE THIS SOFTWARE
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
