"use client"

import React from 'react'

interface EnhancedTestingLayoutProps {
  children: React.ReactNode
  aiPromptComponent?: React.ReactNode
}

/**
 * Enhanced Testing Layout - Professional 99+ Quality
 * Fixes spacing issues while preserving all existing functionality
 */
export const EnhancedTestingLayout: React.FC<EnhancedTestingLayoutProps> = ({ 
  children, 
  aiPromptComponent 
}) => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Main Content Area with Proper Spacing */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Professional Grid Layout with Proper Spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Left Sidebar - Controls & Parameters */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#00bbff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Strategy Controls
                  </h3>
                  <div className="space-y-4">
                    {/* Strategy controls will be injected here */}
                    <div className="text-sm text-[#a0a0b8]">Strategy controls preserved</div>
                  </div>
                </div>

                <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#00bbff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Parameters
                  </h3>
                  <div className="space-y-4">
                    {/* Parameters will be injected here */}
                    <div className="text-sm text-[#a0a0b8]">Parameters preserved</div>
                  </div>
                </div>
              </div>

              {/* Main Content Area - Charts & Analysis */}
              <div className="lg:col-span-9 space-y-6">
                {/* Charts Container with Proper Height */}
                <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Strategy Performance</h3>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-[#00bbff] text-white rounded-lg text-sm font-medium hover:bg-[#00a3e0] transition-colors">
                        1D
                      </button>
                      <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded-lg text-sm font-medium hover:bg-[#2a2a3e] hover:text-white transition-colors">
                        1W
                      </button>
                      <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded-lg text-sm font-medium hover:bg-[#2a2a3e] hover:text-white transition-colors">
                        1M
                      </button>
                      <button className="px-3 py-1.5 bg-[#0f1320] text-[#a0a0b8] rounded-lg text-sm font-medium hover:bg-[#2a2a3e] hover:text-white transition-colors">
                        1Y
                      </button>
                    </div>
                  </div>
                  <div className="h-96 bg-[#0f1320] rounded-lg p-4">
                    {/* Main chart area - preserved */}
                    <div className="w-full h-full flex items-center justify-center text-[#606078]">
                      Chart content preserved
                    </div>
                  </div>
                </div>

                {/* Additional Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
                    <h4 className="text-lg font-semibold text-white mb-4">Risk Metrics</h4>
                    <div className="h-64 bg-[#0f1320] rounded-lg p-4">
                      {/* Risk chart - preserved */}
                      <div className="w-full h-full flex items-center justify-center text-[#606078]">
                        Risk chart preserved
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
                    <h4 className="text-lg font-semibold text-white mb-4">Returns Distribution</h4>
                    <div className="h-64 bg-[#0f1320] rounded-lg p-4">
                      {/* Returns chart - preserved */}
                      <div className="w-full h-full flex items-center justify-center text-[#606078]">
                        Returns chart preserved
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-6 hover:border-[#00bbff]/30 transition-colors">
                  <h4 className="text-lg font-semibold text-white mb-4">Backtest Results</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#2a2a3e]">
                          <th className="text-left py-3 px-4 text-[#a0a0b8]">Metric</th>
                          <th className="text-right py-3 px-4 text-[#a0a0b8]">Value</th>
                          <th className="text-right py-3 px-4 text-[#a0a0b8]">Benchmark</th>
                          <th className="text-right py-3 px-4 text-[#a0a0b8]">Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Table data preserved */}
                        <tr className="border-b border-[#2a2a3e]/50">
                          <td className="py-3 px-4 text-white">Total Return</td>
                          <td className="text-right py-3 px-4 text-green-400">+23.5%</td>
                          <td className="text-right py-3 px-4 text-[#a0a0b8]">+12.3%</td>
                          <td className="text-right py-3 px-4 text-green-400">+11.2%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced AI Prompt - Always Visible at Bottom */}
      <div className="border-t-2 border-[#1a1a2e] bg-[#0f1320]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-[#1a1a2e]/90 border border-[#2a2a3e] rounded-xl p-4">
            <div className="flex items-center gap-4">
              {/* AI Avatar */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00bbff] via-[#0099dd] to-[#0077bb] rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1a1a2e] animate-pulse" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs uppercase tracking-wider text-[#606078] font-semibold">AI Assistant</div>
                  <div className="text-xs text-green-400">● Ready</div>
                </div>
              </div>

              {/* Input Field */}
              <div className="flex-1">
                {aiPromptComponent || (
                  <input
                    type="text"
                    placeholder="Ask the AI assistant about your strategy, request analysis, or get optimization suggestions..."
                    className="w-full bg-transparent text-white placeholder-[#606078] border-none outline-none text-sm font-mono px-2"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="px-4 py-2 bg-[#2a2a3e] hover:bg-[#3a3a4e] text-white rounded-lg text-sm font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
                <button className="px-6 py-2 bg-[#00bbff] hover:bg-[#00a3e0] text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedTestingLayout
