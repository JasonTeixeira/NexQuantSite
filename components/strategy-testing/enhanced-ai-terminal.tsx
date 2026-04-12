"use client"

import { useEffect, useRef, useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Send, 
  Sparkles, 
  Settings, 
  Minimize2, 
  Maximize2, 
  Code2, 
  TestTube2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Play,
  FileCode,
  BarChart3
} from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface TestResult {
  id: string
  name: string
  status: 'passed' | 'failed' | 'running'
  duration?: number
  coverage?: number
  error?: string
  suggestions?: string[]
}

interface CodeAnalysis {
  file: string
  issues: Array<{
    line: number
    type: 'error' | 'warning' | 'suggestion'
    message: string
    fix?: string
  }>
  complexity: number
  coverage: number
  suggestions: string[]
}

interface EnhancedAITerminalProps {
  className?: string
}

export default function EnhancedAITerminal({ className }: EnhancedAITerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminal = useRef<any>(null)
  const fitAddon = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)
  
  // AI and Command State
  const [aiInput, setAiInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isAiMode, setIsAiMode] = useState(true) // Default to AI mode like Warp
  const [isMaximized, setIsMaximized] = useState(false)
  
  // Testing and Analysis State
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysis[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentView, setCurrentView] = useState<'terminal' | 'tests' | 'analysis'>('terminal')

  // AI-powered command interpretation
  const interpretCommand = async (userInput: string) => {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: `You are an AI assistant for a quantitative trading terminal, like Warp AI for terminals. 
        
        Interpret natural language commands and convert them to executable terminal commands or actions.
        
        Examples:
        - "run tests for portfolio component" → "npm test -- --testNamePattern=portfolio"
        - "show me test coverage" → "npm run test:coverage"
        - "analyze the risk management code" → "analyze:code components/phase2/risk-management.tsx"
        - "check if the server is running" → "ps aux | grep next"
        - "install testing dependencies" → "npm install --save-dev @testing-library/react @testing-library/jest-dom"
        - "build the project" → "npm run build"
        - "what's the current git status" → "git status"
        
        Respond with just the command to execute, or if it's a complex request, break it into steps.
        For code analysis requests, use "analyze:code [filepath]" 
        For testing requests, use appropriate npm test commands.
        `,
        prompt: userInput,
      })
      return text.trim()
    } catch (error) {
      return `echo "AI interpretation failed: ${userInput}"`
    }
  }

  // Execute system commands (simulated - in real app would use child_process)
  const executeCommand = async (command: string) => {
    terminal.current?.writeln(`\x1b[36m🤖 AI interpreted: "${command}"\x1b[0m`)
    
    // Handle special AI commands
    if (command.startsWith('analyze:code')) {
      const filepath = command.split(' ')[1]
      await analyzeCode(filepath)
      return
    }
    
    if (command.includes('test')) {
      await runTests(command)
      return
    }
    
    // Simulate command execution
    terminal.current?.writeln(`\x1b[32m$ ${command}\x1b[0m`)
    
    // Mock some common command responses
    const mockResponses: Record<string, string> = {
      'git status': '✓ On branch main\n✓ Your branch is up to date\n✓ Nothing to commit, working tree clean',
      'npm run build': '✓ Build completed successfully\n✓ Output: .next/static/\n✓ Bundle size: 2.1MB',
      'ps aux | grep next': '✓ Next.js dev server running on port 3000\n✓ PID: 48446',
      'npm list': '✓ Dependencies installed\n✓ 211 packages total',
    }
    
    const response = mockResponses[command] || `✓ Command executed: ${command}`
    terminal.current?.writeln(`\x1b[33m${response}\x1b[0m`)
  }

  // AI-powered code analysis
  const analyzeCode = async (filepath: string) => {
    setIsAnalyzing(true)
    setCurrentView('analysis')
    
    // Simulate code analysis
    const mockAnalysis: CodeAnalysis = {
      file: filepath || 'components/nexus-quant-terminal.tsx',
      issues: [
        {
          line: 45,
          type: 'warning',
          message: 'Component is large (2800+ lines). Consider breaking into smaller components.',
          fix: 'Extract chart components into separate files'
        },
        {
          line: 128,
          type: 'suggestion',
          message: 'Consider memoizing expensive calculations',
          fix: 'Wrap calculation in useMemo hook'
        },
        {
          line: 256,
          type: 'error',
          message: 'Missing error boundary for chart components',
          fix: 'Add ErrorBoundary wrapper around charts'
        }
      ],
      complexity: 8.5,
      coverage: 0, // No tests yet
      suggestions: [
        'Add comprehensive test suite - currently 0% coverage',
        'Implement error boundaries for better error handling',
        'Consider using React.memo for chart components',
        'Extract data transformation logic into custom hooks'
      ]
    }
    
    setTimeout(() => {
      setCodeAnalysis([mockAnalysis])
      setIsAnalyzing(false)
      terminal.current?.writeln(`\x1b[32m✓ Code analysis complete for ${mockAnalysis.file}\x1b[0m`)
      terminal.current?.writeln(`\x1b[33m• Found ${mockAnalysis.issues.length} issues\x1b[0m`)
      terminal.current?.writeln(`\x1b[33m• Complexity score: ${mockAnalysis.complexity}/10\x1b[0m`)
      terminal.current?.writeln(`\x1b[31m• Test coverage: ${mockAnalysis.coverage}% (needs improvement!)\x1b[0m`)
    }, 2000)
  }

  // AI-assisted testing
  const runTests = async (command: string) => {
    setIsRunningTests(true)
    setCurrentView('tests')
    terminal.current?.writeln(`\x1b[36m🧪 Running tests...\x1b[0m`)
    
    // Mock test results
    const mockTests: TestResult[] = [
      {
        id: '1',
        name: 'Portfolio Component Renders',
        status: 'running',
      },
      {
        id: '2',
        name: 'Chart Data Validation',
        status: 'running',
      },
      {
        id: '3',
        name: 'Risk Calculation Logic',
        status: 'running',
      }
    ]
    
    setTestResults(mockTests)
    
    // Simulate test execution
    setTimeout(async () => {
      const completedTests = mockTests.map((test, index) => ({
        ...test,
        status: index === 2 ? 'failed' as const : 'passed' as const,
        duration: Math.floor(Math.random() * 1000) + 100,
        coverage: Math.floor(Math.random() * 40) + 60,
        error: index === 2 ? 'TypeError: Cannot read property of undefined' : undefined,
        suggestions: index === 2 ? [
          'Add null check before accessing property',
          'Initialize state with default values',
          'Add PropTypes or TypeScript validation'
        ] : []
      }))
      
      setTestResults(completedTests)
      setIsRunningTests(false)
      
      const passed = completedTests.filter(t => t.status === 'passed').length
      const failed = completedTests.filter(t => t.status === 'failed').length
      
      terminal.current?.writeln(`\x1b[32m✓ ${passed} tests passed\x1b[0m`)
      if (failed > 0) {
        terminal.current?.writeln(`\x1b[31m✗ ${failed} tests failed\x1b[0m`)
      }
      
      // AI suggestions for failed tests
      if (failed > 0) {
        const { text } = await generateText({
          model: openai("gpt-4o"),
          system: "You are a testing expert. Provide concise, actionable suggestions to fix failing tests.",
          prompt: `A test failed with: "TypeError: Cannot read property of undefined". This is in a React trading component. What are the most likely causes and fixes?`,
        })
        terminal.current?.writeln(`\x1b[36m🤖 AI Suggestion: ${text}\x1b[0m`)
      }
    }, 3000)
  }

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize terminal only on client side
  useEffect(() => {
    if (!isClient || !terminalRef.current) return

    const initTerminal = async () => {
      // Dynamically import xterm to avoid SSR issues
      const { Terminal } = await import("@xterm/xterm")
      const { FitAddon } = await import("@xterm/addon-fit")
      const { WebLinksAddon } = await import("@xterm/addon-web-links")
      const { SearchAddon } = await import("@xterm/addon-search")
      
      // CSS is imported globally in the app

      terminal.current = new Terminal({
        theme: {
          background: "#15151f",
          foreground: "#00ff88",
          cursor: "#00ff88",
          cursorAccent: "#15151f",
          selectionBackground: "#2a2a3e",
          black: "#15151f",
          red: "#ff4757",
          green: "#00ff88",
          yellow: "#fffa65",
          blue: "#00bbff",
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
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontSize: 12,
        lineHeight: 1.4,
        cursorBlink: true,
        cursorStyle: "block",
        scrollback: 1000,
        tabStopWidth: 4,
      })

      fitAddon.current = new FitAddon()
      const webLinksAddon = new WebLinksAddon()
      const searchAddon = new SearchAddon()

      terminal.current.loadAddon(fitAddon.current)
      terminal.current.loadAddon(webLinksAddon)
      terminal.current.loadAddon(searchAddon)

      terminal.current.open(terminalRef.current)
      fitAddon.current.fit()

      // Welcome message with Warp-like AI features
      terminal.current.writeln("\x1b[36m╔══════════════════════════════════════════════════════════════╗")
      terminal.current.writeln("║                  🚀 NEXUS AI TERMINAL                       ║")
      terminal.current.writeln("║              Warp-style AI Assistant Terminal               ║")
      terminal.current.writeln("╚══════════════════════════════════════════════════════════════╝\x1b[0m")
      terminal.current.writeln("")
      terminal.current.writeln("\x1b[36m🤖 AI-Powered Terminal - Just type what you want!\x1b[0m")
      terminal.current.writeln("\x1b[33mExamples:\x1b[0m")
      terminal.current.writeln("  • \"run tests for portfolio component\"")
      terminal.current.writeln("  • \"analyze the risk management code\"")  
      terminal.current.writeln("  • \"show me test coverage\"")
      terminal.current.writeln("  • \"check if the server is running\"")
      terminal.current.writeln("")
      terminal.current.write("\x1b[32m🤖 nexus-ai:~$\x1b[0m ")
    }

    initTerminal()

    return () => {
      if (terminal.current) {
        terminal.current.dispose()
      }
    }
  }, [isClient])

  const handleAiSubmit = async () => {
    if (!aiInput.trim() || !terminal.current) return

    terminal.current.writeln(`\x1b[32m🤖 nexus-ai:~$\x1b[0m ${aiInput}`)
    terminal.current.writeln("\x1b[36m🤖 AI analyzing your request...\x1b[0m")

    const command = await interpretCommand(aiInput)
    await executeCommand(command)
    
    setCommandHistory(prev => [...prev, aiInput])
    setAiInput("")
    terminal.current.write("\x1b[32m🤖 nexus-ai:~$\x1b[0m ")
  }

  return (
    <div className={`flex flex-col h-full bg-[#15151f] ${className}`}>
      {/* Header with tabs */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a25] border-b border-[#2a2a3e]">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={currentView === 'terminal' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('terminal')}
            className="h-7 px-3 text-xs"
          >
            <Code2 className="w-3 h-3 mr-1" />
            Terminal
          </Button>
          <Button
            size="sm"
            variant={currentView === 'tests' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('tests')}
            className="h-7 px-3 text-xs"
          >
            <TestTube2 className="w-3 h-3 mr-1" />
            Tests
            {testResults.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {testResults.filter(t => t.status === 'passed').length}/{testResults.length}
              </Badge>
            )}
          </Button>
          <Button
            size="sm"
            variant={currentView === 'analysis' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('analysis')}
            className="h-7 px-3 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Analysis
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-[#a0a0b8]">AI Active</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMaximized(!isMaximized)}
            className="h-7 px-2 text-xs text-[#a0a0b8] hover:text-white hover:bg-[#2a2a3e] transition-colors"
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Terminal View */}
        {currentView === 'terminal' && (
          <div className="flex-1 flex flex-col">
            {!isClient ? (
              <div className="flex-1 flex items-center justify-center text-[#a0a0b8]">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#00bbff] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Loading AI Terminal...</p>
                </div>
              </div>
            ) : (
              <div ref={terminalRef} className="flex-1 p-3" />
            )}
            
            {/* AI Input - Warp style */}
            <div className="p-4 border-t border-[#2a2a3e] bg-[#1a1a25]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#00bbff]" />
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Type what you want to do... (e.g., 'run tests', 'analyze code')"
                  className="flex-1 h-8 text-sm bg-[#15151f] border-[#2a2a3e] text-white placeholder:text-[#606078] focus:border-[#00bbff] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAiSubmit()
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleAiSubmit}
                  className="h-8 px-3 text-xs bg-[#00bbff] hover:bg-[#0099dd] text-white transition-colors"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Test Results View */}
        {currentView === 'tests' && (
          <div className="flex-1 p-4 overflow-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">AI Test Results</h3>
              {isRunningTests && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="text-xs text-yellow-400">Running tests...</span>
                </div>
              )}
            </div>
            
            {testResults.map((test) => (
              <Card key={test.id} className="bg-[#1a1a25] border-[#2a2a3e]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {test.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      {test.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                      {test.status === 'running' && <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />}
                      <span className="text-white font-medium">{test.name}</span>
                    </div>
                    {test.duration && (
                      <span className="text-xs text-[#a0a0b8]">{test.duration}ms</span>
                    )}
                  </div>
                  
                  {test.coverage && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#a0a0b8]">Coverage</span>
                        <span className="text-xs text-[#a0a0b8]">{test.coverage}%</span>
                      </div>
                      <Progress value={test.coverage} className="h-1" />
                    </div>
                  )}
                  
                  {test.error && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">
                      {test.error}
                    </div>
                  )}
                  
                  {test.suggestions && test.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-xs text-[#00bbff] font-medium">🤖 AI Suggestions:</span>
                      {test.suggestions.map((suggestion, i) => (
                        <div key={i} className="text-xs text-[#a0a0b8] pl-4">
                          • {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {testResults.length === 0 && !isRunningTests && (
              <div className="text-center text-[#a0a0b8] py-8">
                <TestTube2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tests run yet. Try: "run tests for portfolio component"</p>
              </div>
            )}
          </div>
        )}

        {/* Code Analysis View */}
        {currentView === 'analysis' && (
          <div className="flex-1 p-4 overflow-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">AI Code Analysis</h3>
              {isAnalyzing && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs text-blue-400">Analyzing...</span>
                </div>
              )}
            </div>
            
            {codeAnalysis.map((analysis, idx) => (
              <Card key={idx} className="bg-[#1a1a25] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    {analysis.file}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3 h-3" />
                      <span className="text-[#a0a0b8]">Complexity: {analysis.complexity}/10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TestTube2 className="w-3 h-3" />
                      <span className="text-[#a0a0b8]">Coverage: {analysis.coverage}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Issues */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Issues Found</h4>
                    {analysis.issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-[#15151f] mb-2">
                        {issue.type === 'error' && <XCircle className="w-4 h-4 text-red-400 mt-0.5" />}
                        {issue.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />}
                        {issue.type === 'suggestion' && <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5" />}
                        <div className="flex-1">
                          <div className="text-xs text-[#a0a0b8]">Line {issue.line}</div>
                          <div className="text-sm text-white">{issue.message}</div>
                          {issue.fix && (
                            <div className="text-xs text-[#00bbff] mt-1">Fix: {issue.fix}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* AI Suggestions */}
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">🤖 AI Recommendations</h4>
                    {analysis.suggestions.map((suggestion, i) => (
                      <div key={i} className="text-sm text-[#a0a0b8] mb-1">
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {codeAnalysis.length === 0 && !isAnalyzing && (
              <div className="text-center text-[#a0a0b8] py-8">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No code analyzed yet. Try: "analyze the risk management code"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
