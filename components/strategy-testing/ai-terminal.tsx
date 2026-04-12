"use client"

import { useEffect, useRef, useState } from "react"
import { Terminal } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { WebLinksAddon } from "@xterm/addon-web-links"
import { SearchAddon } from "@xterm/addon-search"
import "@xterm/xterm/css/xterm.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, Settings, Minimize2, Maximize2 } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface AITerminalProps {
  className?: string
}

export default function AITerminal({ className }: AITerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminal = useRef<Terminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  const [aiInput, setAiInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isAiMode, setIsAiMode] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  // Trading-specific commands
  const tradingCommands = {
    portfolio: () => "Portfolio: $2.5M | P&L: +$125K (5.2%) | Positions: 15 active",
    positions: () => "AAPL: +$15K | TSLA: -$3K | SPY: +$8K | QQQ: +$12K | More...",
    pnl: () => "Today: +$2.5K | Week: +$15K | Month: +$125K | YTD: +$450K",
    risk: () => "VaR (95%): $45K | Max Drawdown: 8.5% | Sharpe: 2.1 | Beta: 0.85",
    orders: () => "Active Orders: 3 | Filled: 127 | Cancelled: 8 | Pending: 2",
    market: () => "SPY: 485.20 (+0.8%) | VIX: 14.2 (-2.1%) | 10Y: 4.25% (+0.05%)",
    alerts: () => "TSLA breach $250 | High vol detected NVDA | RSI oversold AAPL",
    backtest: () => "Running backtest... Strategy: Mean Reversion | Period: 2020-2024",
    optimize: () => "Optimizing parameters... Current Sharpe: 1.85 | Target: 2.0+",
    data: () => "Market data: ✓ | Alt data: ✓ | News feed: ✓ | Options: ✓",
    help: () => `Available commands:
portfolio - Show portfolio summary
positions - List current positions  
pnl - Show P&L breakdown
risk - Display risk metrics
orders - Show order status
market - Market overview
alerts - Active alerts
backtest - Run backtests
optimize - Parameter optimization
data - Data feed status
ai <query> - Ask AI assistant
clear - Clear terminal
help - Show this help`,
  }

  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize terminal
    terminal.current = new Terminal({
      theme: {
        background: "#15151f", // Match main UI panel background
        foreground: "#00ff88",
        cursor: "#00ff88",
        cursorAccent: "#15151f",
        selectionBackground: "#2a2a3e",
        black: "#15151f",
        red: "#ff4757",
        green: "#00ff88",
        yellow: "#fffa65",
        blue: "#00bbff", // Match main UI accent blue
        magenta: "#ff6b9d",
        cyan: "#4ecdc4",
        white: "#ffffff",
        brightBlack: "#2a2a3e",
        brightRed: "#ff6b9d",
        brightGreen: "#00ff88",
        brightYellow: "#fffa65",
        brightBlue: "#00bbff",
        brightMagenta: "#ff6b9d",
        brightCyan: "#4ecdc4",
        brightWhite: "#ffffff",
      },
      fontFamily: "JetBrains Mono, ui-monospace, monospace", // Match main UI font stack
      fontSize: 12, // Match main UI font sizing
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 1000,
      tabStopWidth: 4,
    })

    // Initialize addons
    fitAddon.current = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    const searchAddon = new SearchAddon()

    terminal.current.loadAddon(fitAddon.current)
    terminal.current.loadAddon(webLinksAddon)
    terminal.current.loadAddon(searchAddon)

    // Open terminal
    terminal.current.open(terminalRef.current)
    fitAddon.current.fit()

    terminal.current.writeln("\x1b[36m╔══════════════════════════════════════════════════════════════╗")
    terminal.current.writeln("║                    NEXUS QUANT TERMINAL                      ║")
    terminal.current.writeln("║                   AI-Powered Trading Shell                   ║")
    terminal.current.writeln("╚══════════════════════════════════════════════════════════════╝\x1b[0m")
    terminal.current.writeln("")
    terminal.current.writeln("\x1b[36mWelcome to Nexus Quant Terminal v2.1.4\x1b[0m")
    terminal.current.writeln('\x1b[33mType "help" for available commands or "ai <query>" for AI assistance\x1b[0m')
    terminal.current.writeln("")
    terminal.current.write("\x1b[32mnexus@quant:~$\x1b[0m ")

    let currentLine = ""
    let cursorPosition = 0

    // Handle user input
    terminal.current.onData((data) => {
      const code = data.charCodeAt(0)

      if (code === 13) {
        // Enter
        terminal.current?.writeln("")
        if (currentLine.trim()) {
          executeCommand(currentLine.trim())
          setCommandHistory((prev) => [...prev, currentLine.trim()])
          setHistoryIndex(-1)
        }
        currentLine = ""
        cursorPosition = 0
        terminal.current?.write("\x1b[32mnexus@quant:~$\x1b[0m ")
      } else if (code === 127) {
        // Backspace
        if (cursorPosition > 0) {
          currentLine = currentLine.slice(0, cursorPosition - 1) + currentLine.slice(cursorPosition)
          cursorPosition--
          terminal.current?.write("\b \b")
        }
      } else if (code === 27) {
        // Escape sequences (arrow keys)
        // Handle arrow keys for command history
        return
      } else if (code >= 32) {
        // Printable characters
        currentLine = currentLine.slice(0, cursorPosition) + data + currentLine.slice(cursorPosition)
        cursorPosition++
        terminal.current?.write(data)
      }
    })

    const executeCommand = async (command: string) => {
      const [cmd, ...args] = command.split(" ")
      const fullArgs = args.join(" ")

      if (cmd === "clear") {
        terminal.current?.clear()
        return
      }

      if (cmd === "ai" && fullArgs) {
        terminal.current?.writeln("\x1b[36m🤖 AI Assistant thinking...\x1b[0m")
        try {
          const { text } = await generateText({
            model: openai("gpt-4o"),
            system:
              "You are an AI assistant for a quantitative trading terminal. Provide concise, actionable responses about trading, finance, and market analysis. Keep responses under 200 words.",
            prompt: `Trading query: ${fullArgs}`,
          })
          terminal.current?.writeln(`\x1b[36m🤖 ${text}\x1b[0m`)
        } catch (error) {
          terminal.current?.writeln("\x1b[31m❌ AI service unavailable\x1b[0m")
        }
        return
      }

      if (tradingCommands[cmd as keyof typeof tradingCommands]) {
        const result = tradingCommands[cmd as keyof typeof tradingCommands]()
        terminal.current?.writeln(`\x1b[33m${result}\x1b[0m`)
      } else {
        terminal.current?.writeln(`\x1b[31mCommand not found: ${cmd}\x1b[0m`)
        terminal.current?.writeln('\x1b[33mType "help" for available commands\x1b[0m')
      }
    }

    // Handle resize
    const handleResize = () => {
      fitAddon.current?.fit()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      terminal.current?.dispose()
    }
  }, [])

  const handleAiSubmit = async () => {
    if (!aiInput.trim() || !terminal.current) return

    terminal.current?.writeln(`\x1b[32mnexus@quant:~$\x1b[0m ai ${aiInput}`)
    terminal.current?.writeln("\x1b[36m🤖 AI Assistant thinking...\x1b[0m")

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system:
          "You are an AI assistant for a quantitative trading terminal. Provide concise, actionable responses about trading, finance, and market analysis. Keep responses under 200 words.",
        prompt: `Trading query: ${aiInput}`,
      })
      terminal.current?.writeln(`\x1b[36m🤖 ${text}\x1b[0m`)
    } catch (error) {
      terminal.current?.writeln("\x1b[31m❌ AI service unavailable\x1b[0m")
    }

    terminal.current?.write("\x1b[32mnexus@quant:~$\x1b[0m ")
    setAiInput("")
  }

  return (
    <div className={`flex flex-col h-full bg-[#15151f] ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a25] border-b border-[#2a2a3e]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-[#a0a0b8]">Connected</span>
          </div>
          <div className="h-3 w-px bg-[#2a2a3e]"></div>
          <span className="text-xs font-medium text-[#a0a0b8]">Nexus Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAiMode(!isAiMode)}
            className={`h-7 px-2 text-xs hover:bg-[#2a2a3e] transition-colors ${
              isAiMode ? "bg-[#00bbff] text-white hover:bg-[#0099dd]" : "text-[#a0a0b8] hover:text-white"
            }`}
          >
            <Sparkles className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMaximized(!isMaximized)}
            className="h-7 px-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-[#2a2a3e] transition-colors"
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-[#2a2a3e] transition-colors"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {isAiMode && (
        <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a25] border-b border-[#2a2a3e]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-[#00bbff]" />
            <span className="text-xs text-[#a0a0b8]">AI Assistant</span>
          </div>
          <Input
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Ask about trading, markets, or strategies..."
            className="flex-1 h-7 text-xs bg-[#15151f] border-[#2a2a3e] text-white placeholder:text-[#606078] focus:border-[#00bbff] transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAiSubmit()
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleAiSubmit}
            className="h-7 px-3 text-xs bg-[#00bbff] hover:bg-[#0099dd] text-white transition-colors"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      )}

      <div ref={terminalRef} className="flex-1 p-3" style={{ minHeight: "300px" }} />
    </div>
  )
}
