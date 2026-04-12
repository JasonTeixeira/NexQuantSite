"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  BookOpen, 
  Play, 
  Save, 
  Download,
  Upload,
  Code,
  BarChart3,
  FileText,
  Folder,
  Plus,
  Share,
  GitBranch,
  Clock,
  User,
  Zap
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter
} from "recharts"

interface Notebook {
  id: string
  name: string
  description: string
  author: string
  lastModified: string
  language: "python" | "r" | "sql" | "javascript"
  category: "strategy" | "analysis" | "backtest" | "research"
  status: "draft" | "published" | "archived"
  cells: NotebookCell[]
}

interface NotebookCell {
  id: string
  type: "code" | "markdown" | "output"
  content: string
  language?: string
  executed: boolean
  executionTime?: number
  output?: any
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  language: string
  cells: number
  popularity: number
}

export function ResearchNotebooks() {
  const [activeNotebook, setActiveNotebook] = useState<string | null>(null)
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockNotebooks: Notebook[] = [
      {
        id: "nb_001",
        name: "Momentum Strategy Analysis",
        description: "Comprehensive analysis of momentum strategies across different timeframes",
        author: "Research Team",
        lastModified: "2024-01-15T14:30:00Z",
        language: "python",
        category: "strategy",
        status: "published",
        cells: [
          {
            id: "cell_001",
            type: "markdown",
            content: "# Momentum Strategy Analysis\n\nThis notebook analyzes momentum strategies across different asset classes and timeframes.",
            executed: true
          },
          {
            id: "cell_002", 
            type: "code",
            content: "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom backtesting import Backtest, Strategy\n\n# Load market data\ndata = pd.read_csv('market_data.csv')\nprint(f'Data shape: {data.shape}')",
            language: "python",
            executed: true,
            executionTime: 1.2,
            output: "Data shape: (2520, 6)"
          },
          {
            id: "cell_003",
            type: "code", 
            content: "# Calculate momentum indicators\ndata['SMA_20'] = data['Close'].rolling(20).mean()\ndata['SMA_50'] = data['Close'].rolling(50).mean()\ndata['momentum'] = data['Close'] / data['Close'].shift(20) - 1\n\ndata[['Close', 'SMA_20', 'SMA_50', 'momentum']].tail()",
            language: "python",
            executed: true,
            executionTime: 0.8
          }
        ]
      },
      {
        id: "nb_002",
        name: "Factor Analysis Deep Dive",
        description: "Multi-factor model analysis and factor timing strategies",
        author: "Quant Team",
        lastModified: "2024-01-14T16:45:00Z",
        language: "r",
        category: "analysis",
        status: "draft",
        cells: []
      },
      {
        id: "nb_003",
        name: "Options Volatility Surface",
        description: "Analysis of implied volatility surfaces and volatility trading strategies",
        author: "Options Desk",
        lastModified: "2024-01-13T11:20:00Z",
        language: "python",
        category: "research",
        status: "published",
        cells: []
      }
    ]

    const mockTemplates: Template[] = [
      {
        id: "tpl_001",
        name: "Basic Strategy Template",
        description: "Template for developing and backtesting trading strategies",
        category: "Strategy Development",
        language: "python",
        cells: 8,
        popularity: 95
      },
      {
        id: "tpl_002",
        name: "Factor Analysis Template",
        description: "Template for multi-factor model analysis",
        category: "Factor Analysis",
        language: "r",
        cells: 12,
        popularity: 87
      },
      {
        id: "tpl_003",
        name: "Risk Analysis Template",
        description: "Template for portfolio risk analysis and VaR calculations",
        category: "Risk Management",
        language: "python",
        cells: 10,
        popularity: 82
      },
      {
        id: "tpl_004",
        name: "ML Model Template",
        description: "Template for machine learning model development",
        category: "Machine Learning",
        language: "python",
        cells: 15,
        popularity: 91
      },
      {
        id: "tpl_005",
        name: "Options Analysis Template",
        description: "Template for options pricing and Greeks analysis",
        category: "Options",
        language: "python",
        cells: 9,
        popularity: 78
      },
      {
        id: "tpl_006",
        name: "Alternative Data Template",
        description: "Template for integrating alternative data sources",
        category: "Alternative Data",
        language: "python",
        cells: 11,
        popularity: 73
      }
    ]

    setNotebooks(mockNotebooks)
    setTemplates(mockTemplates)
    setActiveNotebook("nb_001")
  }, [])

  const executeCell = async (cellId: string) => {
    setIsExecuting(true)
    setSelectedCell(cellId)
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsExecuting(false)
    setSelectedCell(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-green-400 border-green-500/30"
      case "draft": return "text-yellow-400 border-yellow-500/30"
      case "archived": return "text-gray-400 border-gray-500/30"
      default: return "text-gray-400 border-gray-500/30"
    }
  }

  const getLanguageColor = (language: string) => {
    switch (language) {
      case "python": return "text-blue-400 border-blue-500/30"
      case "r": return "text-purple-400 border-purple-500/30"
      case "sql": return "text-orange-400 border-orange-500/30"
      case "javascript": return "text-yellow-400 border-yellow-500/30"
      default: return "text-gray-400 border-gray-500/30"
    }
  }

  const activeNotebookData = notebooks.find(nb => nb.id === activeNotebook)

  return (
    <div className="h-full bg-[#15151f] text-white p-6 overflow-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-[#00bbff]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Research Notebooks</h1>
              <p className="text-sm text-[#a0a0b8]">Interactive research and strategy development environment</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button 
              onClick={() => {
                console.log('New notebook clicked')
                alert('Creating new notebook... Select a template to get started.')
              }}
              className="bg-[#00bbff] hover:bg-[#0099cc] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Notebook
            </Button>
          </div>
        </div>

        <Tabs defaultValue="notebooks" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#1a1a2e]">
            <TabsTrigger value="notebooks" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              My Notebooks
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Templates
            </TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Notebook Editor
            </TabsTrigger>
            <TabsTrigger value="shared" className="data-[state=active]:bg-[#00bbff]/20 data-[state=active]:text-[#00bbff]">
              Shared
            </TabsTrigger>
          </TabsList>

          {/* My Notebooks Tab */}
          <TabsContent value="notebooks" className="space-y-6">
            {/* Notebook Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notebooks.map((notebook) => (
                <Card key={notebook.id} className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{notebook.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getLanguageColor(notebook.language)}>
                          {notebook.language}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(notebook.status)}>
                          {notebook.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#a0a0b8] mb-4">{notebook.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Author:</span>
                        <span className="text-white">{notebook.author}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white capitalize">{notebook.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Modified:</span>
                        <span className="text-white">{new Date(notebook.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                        onClick={() => setActiveNotebook(notebook.id)}
                      >
                        Open
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => {
                      console.log('New strategy notebook clicked')
                      alert('Creating new strategy notebook with trading templates...')
                    }}
                    className="h-20 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30 flex flex-col items-center justify-center"
                  >
                    <Code className="h-6 w-6 mb-2" />
                    New Strategy Notebook
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('New analysis notebook clicked')
                      alert('Creating new analysis notebook with data visualization templates...')
                    }}
                    className="h-20 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 flex flex-col items-center justify-center"
                  >
                    <BarChart3 className="h-6 w-6 mb-2" />
                    New Analysis Notebook
                  </Button>
                  <Button className="h-20 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 mb-2" />
                    New Research Notebook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Template Categories */}
            <div className="flex space-x-4 mb-6">
              <Button variant="outline" className="border-[#00bbff]/30 text-[#00bbff] bg-[#00bbff]/10">
                All Templates
              </Button>
              <Button variant="outline" className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]">
                Strategy Development
              </Button>
              <Button variant="outline" className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]">
                Factor Analysis
              </Button>
              <Button variant="outline" className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]">
                Machine Learning
              </Button>
              <Button variant="outline" className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]">
                Risk Management
              </Button>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="bg-[#1a1a2e] border-[#2a2a3e] hover:border-[#00bbff]/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getLanguageColor(template.language)}>
                          {template.language}
                        </Badge>
                        <div className="flex items-center text-yellow-400">
                          <span className="text-xs">{template.popularity}%</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#a0a0b8] mb-4">{template.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white">{template.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Cells:</span>
                        <span className="text-white">{template.cells}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Popularity:</span>
                        <div className="w-16 bg-[#2a2a3e] rounded-full h-2 mt-1">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${template.popularity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        console.log(`Using template: ${template.name}`)
                        alert(`Loading ${template.name} template...`)
                      }}
                      className="w-full mt-4 bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notebook Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            {activeNotebookData ? (
              <div className="space-y-6">
                {/* Notebook Header */}
                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <BookOpen className="h-6 w-6 text-[#00bbff]" />
                        <div>
                          <h2 className="text-xl font-bold text-white">{activeNotebookData.name}</h2>
                          <p className="text-sm text-[#a0a0b8]">{activeNotebookData.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className={getLanguageColor(activeNotebookData.language)}>
                          {activeNotebookData.language}
                        </Badge>
                        <Button size="sm" variant="outline" className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" className="bg-[#00bbff] hover:bg-[#0099cc] text-white">
                          <Play className="h-4 w-4 mr-2" />
                          Run All
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Notebook Cells */}
                <div className="space-y-4">
                  {activeNotebookData.cells.map((cell, index) => (
                    <Card key={cell.id} className="bg-[#1a1a2e] border-[#2a2a3e]">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Cell Number */}
                          <div className="w-16 bg-[#15151f] border-r border-[#2a2a3e] flex items-center justify-center text-sm text-gray-400">
                            [{index + 1}]
                          </div>
                          
                          {/* Cell Content */}
                          <div className="flex-1">
                            {cell.type === "markdown" ? (
                              <div className="p-4">
                                <div className="prose prose-invert max-w-none">
                                  <div className="text-white whitespace-pre-wrap">{cell.content}</div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {/* Code Input */}
                                <div className="relative">
                                  <Textarea
                                    value={cell.content}
                                    className="min-h-32 bg-[#0d1117] border-0 font-mono text-sm text-white resize-none"
                                    placeholder="Enter your code here..."
                                  />
                                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                                    {cell.language && (
                                      <Badge variant="outline" className={getLanguageColor(cell.language)}>
                                        {cell.language}
                                      </Badge>
                                    )}
                                    <Button
                                      size="sm"
                                      onClick={() => executeCell(cell.id)}
                                      disabled={isExecuting && selectedCell === cell.id}
                                      className="bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30"
                                    >
                                      {isExecuting && selectedCell === cell.id ? (
                                        <Clock className="h-3 w-3" />
                                      ) : (
                                        <Play className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Code Output */}
                                {cell.executed && (
                                  <div className="border-t border-[#2a2a3e] bg-[#0d1117] p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-gray-400">Output</span>
                                      {cell.executionTime && (
                                        <span className="text-xs text-gray-400">
                                          Executed in {cell.executionTime}s
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-mono text-sm text-green-400">
                                      {cell.output || "Code executed successfully"}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add Cell Button */}
                  <div className="flex justify-center">
                    <Button variant="outline" className="border-[#2a2a3e] text-[#a0a0b8] hover:bg-[#2a2a3e]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Cell
                    </Button>
                  </div>
                </div>

                {/* Sample Output Visualization */}
                <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                  <CardHeader>
                    <CardTitle className="text-white">Sample Output: Strategy Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[
                        { date: '2023-01', strategy: 100, benchmark: 100 },
                        { date: '2023-02', strategy: 102.5, benchmark: 101.2 },
                        { date: '2023-03', strategy: 105.8, benchmark: 102.8 },
                        { date: '2023-04', strategy: 103.2, benchmark: 104.1 },
                        { date: '2023-05', strategy: 108.7, benchmark: 105.5 },
                        { date: '2023-06', strategy: 112.3, benchmark: 107.2 },
                        { date: '2023-07', strategy: 115.8, benchmark: 108.9 },
                        { date: '2023-08', strategy: 118.4, benchmark: 110.1 },
                        { date: '2023-09', strategy: 121.7, benchmark: 111.8 },
                        { date: '2023-10', strategy: 119.2, benchmark: 113.2 },
                        { date: '2023-11', strategy: 125.6, benchmark: 115.4 },
                        { date: '2023-12', strategy: 128.9, benchmark: 117.1 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a1a2e",
                            border: "1px solid #2a2a3e",
                            borderRadius: "8px",
                          }}
                        />
                        <Line type="monotone" dataKey="strategy" stroke="#00bbff" strokeWidth={2} name="Strategy" />
                        <Line type="monotone" dataKey="benchmark" stroke="#888" strokeWidth={2} name="Benchmark" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-[#2a2a3e] mx-auto mb-4" />
                    <p className="text-[#a0a0b8]">Select a notebook to start editing</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Shared Tab */}
          <TabsContent value="shared" className="space-y-6">
            {/* Shared Notebooks */}
            <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
              <CardHeader>
                <CardTitle className="text-white">Shared with Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Volatility Trading Strategies",
                      author: "Sarah Chen",
                      shared: "2024-01-14",
                      language: "python",
                      category: "strategy"
                    },
                    {
                      name: "ESG Factor Analysis",
                      author: "Michael Rodriguez",
                      shared: "2024-01-13",
                      language: "r",
                      category: "analysis"
                    },
                    {
                      name: "Crypto Market Microstructure",
                      author: "Alex Kim",
                      shared: "2024-01-12",
                      language: "python",
                      category: "research"
                    }
                  ].map((notebook, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#15151f] rounded-lg border border-[#2a2a3e]">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-[#00bbff]" />
                          <span className="text-sm text-gray-400">{notebook.author}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{notebook.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span className="capitalize">{notebook.category}</span>
                            <span>•</span>
                            <span>Shared {notebook.shared}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getLanguageColor(notebook.language)}>
                          {notebook.language}
                        </Badge>
                        <Button size="sm" className="bg-[#00bbff]/20 hover:bg-[#00bbff]/30 text-[#00bbff] border border-[#00bbff]/30">
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Collaboration Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Share className="h-5 w-5 mr-2" />
                    Sharing Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Share with Team</label>
                      <Select defaultValue="team">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="team">Research Team</SelectItem>
                          <SelectItem value="quant">Quant Team</SelectItem>
                          <SelectItem value="risk">Risk Team</SelectItem>
                          <SelectItem value="all">All Users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Permission Level</label>
                      <Select defaultValue="view">
                        <SelectTrigger className="bg-[#15151f] border-[#2a2a3e] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-[#2a2a3e]">
                          <SelectItem value="view">View Only</SelectItem>
                          <SelectItem value="comment">Can Comment</SelectItem>
                          <SelectItem value="edit">Can Edit</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full bg-[#00bbff] hover:bg-[#0099cc] text-white">
                      Share Notebook
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a2e] border-[#2a2a3e]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <GitBranch className="h-5 w-5 mr-2" />
                    Version Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {[
                        { version: "v1.3", author: "You", date: "2024-01-15", current: true },
                        { version: "v1.2", author: "Sarah Chen", date: "2024-01-14", current: false },
                        { version: "v1.1", author: "You", date: "2024-01-13", current: false },
                        { version: "v1.0", author: "You", date: "2024-01-12", current: false }
                      ].map((version, i) => (
                        <div key={i} className={`flex items-center justify-between p-2 rounded ${version.current ? 'bg-[#00bbff]/20 border border-[#00bbff]/30' : 'bg-[#15151f]'}`}>
                          <div>
                            <div className="text-sm font-semibold text-white">{version.version}</div>
                            <div className="text-xs text-gray-400">{version.author} • {version.date}</div>
                          </div>
                          {version.current && (
                            <Badge variant="outline" className="text-[#00bbff] border-[#00bbff]/30">
                              Current
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
