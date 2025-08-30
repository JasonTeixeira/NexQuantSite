"use client"

import React, { useState } from 'react'
import { Send, Terminal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const EnhancedTerminal = () => {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<Array<{type: 'command' | 'ai' | 'system' | 'error', content: string}>>([
    { type: 'system', content: '🚀 Nexus AI Terminal v3.0 - Enhanced Edition' },
    { type: 'system', content: '✨ AI-Powered Trading Assistant Ready' },
    { type: 'system', content: 'Type your command or question below...' }
  ])

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const command = input.trim()
    setInput('')
    setIsProcessing(true)
    
    // Add command to output
    setTerminalOutput(prev => [...prev, { type: 'command', content: command }])
    
    // Simulate AI processing
    setTimeout(() => {
      let response = ''
      const lowerCommand = command.toLowerCase()
      
      if (lowerCommand.includes('help')) {
        response = '📋 Available Commands:\n• "analyze portfolio" - Portfolio performance analysis\n• "check risk" - Risk assessment\n• "optimize" - Portfolio optimization suggestions\n• "market outlook" - Current market analysis\n• "clear" - Clear terminal'
      } else if (lowerCommand.includes('clear')) {
        setTerminalOutput([])
        setIsProcessing(false)
        return
      } else if (lowerCommand.includes('portfolio') || lowerCommand.includes('analyze')) {
        response = '📊 Portfolio Analysis:\n• Total Return: +12.7% YTD\n• Sharpe Ratio: 1.84\n• Max Drawdown: -3.2%\n• Beta: 0.92\n\n✅ Strong performance with moderate risk'
      } else if (lowerCommand.includes('risk')) {
        response = '🛡️ Risk Analysis:\n• Portfolio VaR (95%): -2.1%\n• Expected Shortfall: -3.8%\n• Correlation to SPY: 0.78\n\n⚠️ Consider diversification in tech sector'
      } else if (lowerCommand.includes('optimize')) {
        response = '🎯 Optimization Suggestions:\n• Reduce AAPL from 8% to 5%\n• Add international exposure (15%)\n• Increase cash allocation to 8%\n\n📈 Expected improvement: +15% risk-adjusted returns'
      } else {
        response = `🤖 AI Analysis for "${command}":\n\nI understand you're asking about ${command}. I can help with portfolio analysis, risk management, optimization, and market insights.\n\nTry: "analyze my portfolio" or "help" for more commands.`
      }
      
      setTerminalOutput(prev => [...prev, { type: 'ai', content: response }])
      setIsProcessing(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-[#0f1320] border-b border-[#2a2a3e]">
        {terminalOutput.map((output, i) => (
          <div key={i} className={`mb-3 ${output.type === 'command' ? 'text-[#00bbff]' : output.type === 'ai' ? 'text-cyan-400' : output.type === 'error' ? 'text-red-400' : 'text-[#a0a0b8]'}`}>
            {output.type === 'command' && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-cyan-400">nexus@ai $</span>
                <span>{output.content}</span>
              </div>
            )}
            {output.type !== 'command' && (
              <div className="whitespace-pre-wrap">{output.content}</div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-cyan-400">
            <div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
      
      {/* AI Input - Always Visible at Bottom */}
      <div className="bg-[#0f1320] border-t border-[#2a2a3e] p-4">
        <div className="flex items-center gap-3">
          {/* AI Status Indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center">
              <Terminal className="w-3 h-3 text-white" />
            </div>
            <span className="text-cyan-400 font-mono text-sm font-semibold">nexus@ai $</span>
          </div>

          {/* Input Field */}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter command or ask AI... (e.g., 'analyze portfolio', 'check risk', 'help')"
            className="flex-1 bg-transparent border-none text-white font-mono text-sm placeholder:text-[#606078] focus:outline-none focus:ring-0"
            disabled={isProcessing}
            autoFocus
          />

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing}
            size="sm"
            className="bg-[#00bbff] hover:bg-[#0099dd] text-white border-0 h-8 w-8 p-0 flex-shrink-0"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EnhancedTerminal