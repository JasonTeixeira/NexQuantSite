"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Maximize2, 
  Minimize2, 
  X, 
  Minus,
  Terminal as TerminalIcon,
  Sparkles,
  Settings,
  RefreshCw
} from "lucide-react"

interface TerminalLine {
  text: string
  kind: "output" | "error" | "success" | "info" | "cmd"
}

const kindToClass = {
  output: "text-[#e0e0e0]",
  error: "text-[#ff6b6b]",
  success: "text-[#00ff88]",
  info: "text-[#8ab4f8]",
  cmd: "text-[#fffa65]",
}

export default function EnhancedTerminal() {
  const [input, setInput] = useState("")
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>("")
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 800, height: 500 })
  const terminalRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: "🚀 Nexus AI Terminal v3.0 - Enhanced Edition", kind: "success" },
    { text: "✨ Features: Drag, Resize, Maximize, Full Scrolling", kind: "info" },
    { text: "Type 'help' for available commands", kind: "info" },
  ])

  const push = (...newLines: TerminalLine[]) => {
    setLines((prev) => [...prev, ...newLines])
    // Auto-scroll to bottom
    setTimeout(() => {
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight
      }
    }, 10)
  }

  const handleCommand = (raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return

    push({ text: `nexus@ai:~$ ${cmd}`, kind: "cmd" })

    const lower = cmd.toLowerCase()
    if (lower === "clear") {
      setLines([
        { text: "🚀 Nexus AI Terminal v3.0 - Enhanced Edition", kind: "success" },
        { text: "✨ Features: Drag, Resize, Maximize, Full Scrolling", kind: "info" },
        { text: "Type 'help' for available commands", kind: "info" },
      ])
      setInput("")
      return
    }

    switch (true) {
      case lower === "help":
        push(
          { text: "🚀 Nexus Quant Terminal Commands:", kind: "info" },
          { text: "  help           Show this help", kind: "info" },
          { text: "  status         Platform status & metrics", kind: "info" },
          { text: "  portfolio      Show portfolio summary", kind: "info" },
          { text: "  positions      List active positions", kind: "info" },
          { text: "  orders         Show recent orders", kind: "info" },
          { text: "  pnl            Show P&L breakdown", kind: "info" },
          { text: "  risk           Risk metrics summary", kind: "info" },
          { text: "  strategies     List active strategies", kind: "info" },
          { text: "  alerts         Show active alerts", kind: "info" },
          { text: "  performance    Performance metrics", kind: "info" },
          { text: "  test           Run system diagnostics", kind: "info" },
          { text: "  optimize       Run portfolio optimization", kind: "info" },
          { text: "  backtest       Run strategy backtest", kind: "info" },
          { text: "  ml             Machine learning status", kind: "info" },
          { text: "  data           Data source status", kind: "info" },
          { text: "  echo <msg>     Print a message", kind: "info" },
          { text: "  clear          Clear the terminal", kind: "info" },
        )
        break
      
      case lower.startsWith("echo "):
        push({ text: cmd.slice(5), kind: "success" })
        break
      
      case lower === "status":
        push(
          { text: "📊 System Status: OPERATIONAL", kind: "success" },
          { text: "🔄 Trading Engine: ACTIVE", kind: "success" },
          { text: "📈 Market Data: CONNECTED", kind: "success" },
          { text: "🧠 AI Assistant: READY", kind: "success" },
          { text: "⚡ Latency: 12ms", kind: "info" },
          { text: "💾 Memory Usage: 2.1GB / 8GB", kind: "info" },
          { text: "🌐 Network: 847 Mbps", kind: "info" },
        )
        break
      
      case lower === "portfolio":
        push(
          { text: "📈 Portfolio Overview:", kind: "info" },
          { text: "💰 Total Value: $2,847,392.18 (+2.34%)", kind: "success" },
          { text: "💵 Cash: $284,739.22 (10.0%)", kind: "info" },
          { text: "📊 Positions: 47 active", kind: "info" },
          { text: "📈 Day P&L: +$66,742.18 (+2.40%)", kind: "success" },
          { text: "⚖️ Leverage: 1.2x", kind: "info" },
          { text: "🎯 Sharpe Ratio: 2.34", kind: "success" },
        )
        break
      
      case lower === "positions":
        push(
          { text: "📊 Active Positions:", kind: "info" },
          { text: "AAPL: 500 shares @ $185.42 (+$2,340 +1.28%)", kind: "success" },
          { text: "MSFT: 300 shares @ $378.91 (+$1,890 +1.67%)", kind: "success" },
          { text: "TSLA: 150 shares @ $242.68 (-$890 -2.45%)", kind: "error" },
          { text: "SPY: 1000 shares @ $445.23 (+$4,520 +1.03%)", kind: "success" },
          { text: "QQQ: 200 shares @ $385.75 (+$1,240 +0.81%)", kind: "success" },
          { text: "NVDA: 100 shares @ $875.00 (+$3,450 +4.11%)", kind: "success" },
        )
        break
      
      case lower === "orders":
        push(
          { text: "📋 Recent Orders:", kind: "info" },
          { text: "✅ BUY NVDA 100 @ $875.00 (FILLED)", kind: "success" },
          { text: "⏳ BUY AMZN 200 @ $155.50 (PENDING)", kind: "info" },
          { text: "✅ SELL TSLA 50 @ $245.00 (FILLED)", kind: "success" },
          { text: "⏳ BUY QQQ 500 @ $385.75 (PARTIAL: 200/500)", kind: "info" },
          { text: "❌ SELL AAPL 100 @ $190.00 (REJECTED: Price too high)", kind: "error" },
        )
        break
      
      case lower === "pnl":
        push(
          { text: "💰 P&L Summary:", kind: "info" },
          { text: "📅 Today: +$66,742.18 (+2.40%)", kind: "success" },
          { text: "📅 Week: +$124,891.45 (+4.58%)", kind: "success" },
          { text: "📅 Month: +$287,439.82 (+11.23%)", kind: "success" },
          { text: "📅 Quarter: +$456,789.12 (+19.87%)", kind: "success" },
          { text: "📅 YTD: +$1,247,392.18 (+77.84%)", kind: "success" },
          { text: "🏆 Best Day: +$89,234.56 (Dec 15)", kind: "info" },
          { text: "📉 Worst Day: -$23,456.78 (Nov 8)", kind: "error" },
        )
        break
      
      case lower === "risk":
        push(
          { text: "⚠️ Risk Metrics:", kind: "info" },
          { text: "📊 Portfolio VaR (95%): -$45,892.18", kind: "info" },
          { text: "📉 Max Drawdown: -8.42%", kind: "info" },
          { text: "📈 Sharpe Ratio: 2.34", kind: "success" },
          { text: "⚖️ Beta: 1.12", kind: "info" },
          { text: "📊 Volatility: 12.34%", kind: "info" },
          { text: "🎯 Sortino Ratio: 3.21", kind: "success" },
          { text: "⚡ Calmar Ratio: 0.89", kind: "info" },
        )
        break
      
      case lower === "strategies":
        push(
          { text: "🧠 Active Strategies:", kind: "info" },
          { text: "• 🚀 Momentum Alpha: RUNNING (+12.4% | 47 trades)", kind: "success" },
          { text: "• 📊 Mean Reversion: RUNNING (+8.7% | 23 trades)", kind: "success" },
          { text: "• 🔄 Pairs Trading: PAUSED (0.0% | 0 trades)", kind: "info" },
          { text: "• 🤖 ML Predictor: RUNNING (+15.2% | 89 trades)", kind: "success" },
          { text: "• ⚖️ Risk Parity: RUNNING (+6.8% | 12 trades)", kind: "success" },
          { text: "• 📈 Trend Following: RUNNING (+9.3% | 34 trades)", kind: "success" },
        )
        break
      
      case lower === "alerts":
        push(
          { text: "🔔 System Alerts:", kind: "info" },
          { text: "🚨 HIGH: Volatility spike detected in TSLA (+45%)", kind: "error" },
          { text: "✅ INFO: New trade signal generated: BUY NVDA", kind: "success" },
          { text: "⚠️ WARN: Risk limit approaching for crypto positions", kind: "info" },
          { text: "📊 INFO: Portfolio rebalance recommended", kind: "info" },
          { text: "🎯 INFO: ML model accuracy: 87.3% (above threshold)", kind: "success" },
        )
        break
      
      case lower === "performance":
        push(
          { text: "📈 Performance Metrics:", kind: "info" },
          { text: "🏆 Total Return: +77.84% YTD", kind: "success" },
          { text: "📊 Annualized Return: +45.67%", kind: "success" },
          { text: "📉 Volatility: 12.34%", kind: "info" },
          { text: "📊 Max Drawdown: -8.42%", kind: "info" },
          { text: "🎯 Win Rate: 68.4%", kind: "success" },
          { text: "⚖️ Profit Factor: 2.34", kind: "success" },
          { text: "📈 Alpha: +12.45%", kind: "success" },
          { text: "📊 Information Ratio: 1.89", kind: "success" },
        )
        break
      
      case lower === "test":
        push(
          { text: "🧪 Running System Diagnostics...", kind: "info" },
        )
        setTimeout(() => {
          push(
            { text: "✅ Market Data Feed: OK", kind: "success" },
            { text: "✅ Trading Engine: OK", kind: "success" },
            { text: "✅ Risk Management: OK", kind: "success" },
            { text: "✅ ML Models: OK", kind: "success" },
            { text: "✅ Database Connection: OK", kind: "success" },
            { text: "⚠️ Backup System: WARN (Last backup: 2h ago)", kind: "info" },
            { text: "🏆 All critical systems operational!", kind: "success" },
          )
        }, 1500)
        break
      
      case lower === "optimize":
        push(
          { text: "🎯 Running Portfolio Optimization...", kind: "info" },
        )
        setTimeout(() => {
          push(
            { text: "📊 Current Sharpe Ratio: 2.34", kind: "info" },
            { text: "🎯 Optimized Sharpe Ratio: 2.67 (+14.1%)", kind: "success" },
            { text: "📈 Expected Return: +18.9% → +21.3%", kind: "success" },
            { text: "📉 Risk Reduction: -2.1%", kind: "success" },
            { text: "💡 Recommendation: Increase NVDA by 3.2%", kind: "info" },
            { text: "✨ Optimization complete!", kind: "success" },
          )
        }, 2000)
        break
      
      case lower === "backtest":
        push(
          { text: "📊 Running Strategy Backtest...", kind: "info" },
        )
        setTimeout(() => {
          push(
            { text: "📅 Period: 2023-01-01 to 2024-12-31", kind: "info" },
            { text: "💰 Initial Capital: $1,000,000", kind: "info" },
            { text: "📈 Final Value: $1,778,400 (+77.84%)", kind: "success" },
            { text: "📊 Max Drawdown: -8.42%", kind: "info" },
            { text: "🎯 Sharpe Ratio: 2.34", kind: "success" },
            { text: "📈 Win Rate: 68.4%", kind: "success" },
            { text: "🏆 Backtest complete!", kind: "success" },
          )
        }, 2500)
        break
      
      case lower === "ml":
        push(
          { text: "🤖 Machine Learning Status:", kind: "info" },
          { text: "📊 LSTM Price Predictor: 87.3% accuracy", kind: "success" },
          { text: "🧠 Sentiment Analyzer: 92.6% accuracy", kind: "success" },
          { text: "⚖️ Risk Model: 84.1% accuracy", kind: "success" },
          { text: "🎯 Alpha Generator: 89.7% accuracy", kind: "success" },
          { text: "🔄 Last Training: 2 hours ago", kind: "info" },
          { text: "📈 Model Performance: EXCELLENT", kind: "success" },
        )
        break
      
      case lower === "data":
        push(
          { text: "📡 Data Source Status:", kind: "info" },
          { text: "📊 Bloomberg: CONNECTED (12ms latency)", kind: "success" },
          { text: "📈 Yahoo Finance: CONNECTED (8ms latency)", kind: "success" },
          { text: "🌐 Alpha Vantage: CONNECTED (15ms latency)", kind: "success" },
          { text: "📰 News Feed: CONNECTED (45ms latency)", kind: "success" },
          { text: "🐦 Social Sentiment: CONNECTED (23ms latency)", kind: "success" },
          { text: "🛰️ Satellite Data: CONNECTED (67ms latency)", kind: "success" },
          { text: "✨ All data sources operational!", kind: "success" },
        )
        break
      
      default:
        push({ text: `❌ Unknown command: '${cmd}'. Type 'help' for available commands.`, kind: "error" })
    }

    setInput("")
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized || isMinimized) return
    
    setIsDragging(true)
    const rect = terminalRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    if (isMaximized || isMinimized) return
    
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = size.width
    const startHeight = size.height
    const startPosX = position.x
    const startPosY = position.y

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY
      
      let newWidth = startWidth
      let newHeight = startHeight
      let newPosX = startPosX
      let newPosY = startPosY

      // Handle different resize directions
      if (direction.includes('right')) {
        newWidth = Math.max(400, startWidth + deltaX)
      }
      if (direction.includes('left')) {
        newWidth = Math.max(400, startWidth - deltaX)
        newPosX = startPosX + deltaX
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(300, startHeight + deltaY)
      }
      if (direction.includes('top')) {
        newHeight = Math.max(300, startHeight - deltaY)
        newPosY = startPosY + deltaY
      }

      // Apply constraints
      newWidth = Math.min(Math.max(newWidth, 400), window.innerWidth - 100)
      newHeight = Math.min(Math.max(newHeight, 300), window.innerHeight - 100)

      setSize({ width: newWidth, height: newHeight })
      setPosition({ x: newPosX, y: newPosY })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeDirection("")
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
    setIsMinimized(false)
    if (!isMaximized) {
      setPosition({ x: 0, y: 0 })
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
    setIsMaximized(false)
  }

  const closeTerminal = () => {
    console.log('Terminal close requested')
    // You can implement actual close logic here
  }

  // Auto-focus input when terminal is clicked
  const handleTerminalClick = () => {
    if (inputRef.current && !isMinimized) {
      inputRef.current.focus()
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault()
        setLines([
          { text: "🚀 Nexus AI Terminal v3.0 - Enhanced Edition", kind: "success" },
          { text: "✨ Features: Drag, Resize, Maximize, Full Scrolling", kind: "info" },
          { text: "Type 'help' for available commands", kind: "info" },
        ])
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={toggleMinimize}
          className="bg-[#0f1320] border border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#1a1a25] hover:text-white transition-all"
        >
          <TerminalIcon className="w-4 h-4 mr-2" />
          Nexus Terminal
        </Button>
      </div>
    )
  }

  return (
    <div 
      ref={terminalRef}
      className={`rounded-lg border border-[#2a2a3e] bg-gradient-to-b from-[#0d0f16] to-[#090a10] transition-all duration-300 shadow-2xl ${
        isMaximized 
          ? 'fixed inset-4 z-50 h-auto' 
          : 'h-80 overflow-hidden'
      } ${isDragging ? 'cursor-grabbing shadow-xl' : ''}`}
      style={!isMaximized ? { 
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: position.x !== 0 || position.y !== 0 ? 'relative' : 'static'
      } : {}}
      onClick={handleTerminalClick}
    >
      {/* Top bar - Draggable */}
      <div 
        className={`h-10 px-4 flex items-center gap-3 border-b border-[#2a2a3e] bg-[#0f1320] select-none ${
          !isMaximized ? 'cursor-move' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex gap-2">
          <button 
            className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              closeTerminal()
            }}
            title="Close"
          />
          <button 
            className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-300 cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              toggleMinimize()
            }}
            title="Minimize"
          />
          <button 
            className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              toggleMaximize()
            }}
            title="Maximize"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-1">
          <TerminalIcon className="w-4 h-4 text-[#00ff88]" />
          <span className="text-sm text-[#a0a0b8] font-medium">Nexus AI Terminal v3.0</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              push({ text: "🔄 Terminal refreshed", kind: "success" })
            }}
            className="h-6 px-2 text-xs text-[#606078] hover:text-[#a0a0b8] hover:bg-[#2a2a3e] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              toggleMaximize()
            }}
            className="h-6 px-2 text-xs text-[#606078] hover:text-[#a0a0b8] hover:bg-[#2a2a3e] transition-colors"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
          
          <span className="text-xs text-[#606078]">
            {!isMaximized && "Drag to move"}
          </span>
        </div>
      </div>

      {/* Output */}
      <div 
        ref={outputRef}
        className={`px-4 py-3 overflow-y-auto font-mono text-sm custom-scrollbar ${
          isMaximized ? 'h-[calc(100vh-8rem)]' : 'h-[calc(100%-5rem)]'
        }`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2a3e #15151f'
        }}
      >
        {lines.map((l, i) => (
          <div key={i} className={`${kindToClass[l.kind]} leading-relaxed py-0.5`}>
            {l.text}
          </div>
        ))}
      </div>

      {/* Prompt */}
      <div className="h-12 px-4 flex items-center gap-3 border-t border-[#2a2a3e] bg-[#0f1320]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00bbff]" />
          <span className="text-[#8ab4f8] font-mono text-sm">nexus@ai</span>
          <span className="text-[#a0a0b8]">$</span>
        </div>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCommand(input)
          }}
          className="flex-1 bg-transparent outline-none text-white placeholder:text-[#6b7280] focus:ring-0 font-mono"
          placeholder="Type a command... (help, status, portfolio, test)"
          autoFocus
        />
      </div>
    </div>
  )
}
