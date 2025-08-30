"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Code, 
  Copy, 
  ExternalLink, 
  Key, 
  Shield, 
  Zap,
  BarChart3,
  Settings,
  Globe,
  Database,
  Webhook,
  Book,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

export default function ApiDocumentationClient() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const codeExamples = {
    auth: `curl -X POST "https://api.nexural.com/v1/auth/token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "your_api_key",
    "secret": "your_secret"
  }'`,
    
    signals: `curl -X GET "https://api.nexural.com/v1/signals" \\
  -H "Authorization: Bearer your_token" \\
  -H "Content-Type: application/json"`,
    
    backtest: `curl -X POST "https://api.nexural.com/v1/backtests" \\
  -H "Authorization: Bearer your_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "strategy": "your_strategy_id",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "initial_balance": 10000
  }'`,
    
    portfolio: `curl -X GET "https://api.nexural.com/v1/portfolios/123" \\
  -H "Authorization: Bearer your_token" \\
  -H "Content-Type: application/json"`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Build powerful trading applications with our comprehensive REST API. 
            Access real-time signals, run backtests, and manage portfolios programmatically.
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-8 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              Quick Start
            </CardTitle>
            <CardDescription>Get started with the Nexural Trading API in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Get API Keys</h3>
                  <p className="text-sm text-gray-400">Generate your API keys from the dashboard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Authenticate</h3>
                  <p className="text-sm text-gray-400">Get your access token using your keys</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Make Requests</h3>
                  <p className="text-sm text-gray-400">Start building your trading application</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-900">
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="signals">Trading Signals</TabsTrigger>
            <TabsTrigger value="backtesting">Backtesting</TabsTrigger>
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          </TabsList>

          {/* Authentication Tab */}
          <TabsContent value="authentication">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    The Nexural Trading API uses API key authentication. All requests must be authenticated.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-400 mb-2">
                        <Key className="w-4 h-4" />
                        <span className="font-semibold">API Key Management</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Generate and manage your API keys from the <a href="/dashboard/settings" className="text-cyan-400 hover:underline">Dashboard Settings</a> page.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Get Access Token</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        <Badge variant="secondary" className="mr-2">POST</Badge>
                        <code className="text-cyan-400">/v1/auth/token</code>
                      </p>
                      <div className="relative">
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{codeExamples.auth}</code>
                        </pre>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(codeExamples.auth)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Response</h4>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}`}</code>
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Using the Token</h4>
                      <p className="text-gray-400 text-sm">
                        Include the access token in the Authorization header for all API requests:
                      </p>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm mt-2">
                        <code>Authorization: Bearer your_access_token</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trading Signals Tab */}
          <TabsContent value="signals">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Trading Signals API
                  </CardTitle>
                  <CardDescription>
                    Access real-time AI-powered trading signals and market analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Get All Signals</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        <Badge variant="secondary" className="mr-2">GET</Badge>
                        <code className="text-cyan-400">/v1/signals</code>
                      </p>
                      <div className="relative">
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{codeExamples.signals}</code>
                        </pre>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(codeExamples.signals)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Query Parameters</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 p-2 bg-gray-800 rounded">
                          <code className="text-cyan-400">symbol</code>
                          <span className="text-sm text-gray-400">Filter by trading symbol (e.g., AAPL, TSLA)</span>
                        </div>
                        <div className="flex items-center gap-4 p-2 bg-gray-800 rounded">
                          <code className="text-cyan-400">type</code>
                          <span className="text-sm text-gray-400">Signal type: buy, sell, hold</span>
                        </div>
                        <div className="flex items-center gap-4 p-2 bg-gray-800 rounded">
                          <code className="text-cyan-400">confidence</code>
                          <span className="text-sm text-gray-400">Minimum confidence level (0-100)</span>
                        </div>
                        <div className="flex items-center gap-4 p-2 bg-gray-800 rounded">
                          <code className="text-cyan-400">limit</code>
                          <span className="text-sm text-gray-400">Number of results (default: 50, max: 200)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Response Example</h4>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`{
  "signals": [
    {
      "id": "signal_123",
      "symbol": "AAPL",
      "type": "buy",
      "confidence": 87,
      "price": 175.50,
      "target_price": 185.00,
      "stop_loss": 165.00,
      "created_at": "2024-01-15T10:30:00Z",
      "expires_at": "2024-01-15T16:30:00Z",
      "analysis": {
        "technical_score": 8.5,
        "fundamental_score": 7.8,
        "sentiment_score": 9.2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 150
  }
}`}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backtesting Tab */}
          <TabsContent value="backtesting">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    Backtesting API
                  </CardTitle>
                  <CardDescription>
                    Run comprehensive backtests on your trading strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Create Backtest</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        <Badge variant="secondary" className="mr-2">POST</Badge>
                        <code className="text-cyan-400">/v1/backtests</code>
                      </p>
                      <div className="relative">
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{codeExamples.backtest}</code>
                        </pre>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(codeExamples.backtest)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Response Example</h4>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`{
  "backtest_id": "bt_456",
  "status": "running",
  "created_at": "2024-01-15T10:30:00Z",
  "estimated_completion": "2024-01-15T10:35:00Z",
  "webhook_url": "https://your-app.com/webhook"
}`}</code>
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Get Results</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        <Badge variant="secondary" className="mr-2">GET</Badge>
                        <code className="text-cyan-400">/v1/backtests/{`{backtest_id}`}/results</code>
                      </p>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`{
  "backtest_id": "bt_456",
  "status": "completed",
  "results": {
    "total_return": 23.45,
    "sharpe_ratio": 1.87,
    "max_drawdown": 8.23,
    "win_rate": 67.8,
    "total_trades": 145,
    "profit_factor": 1.94
  },
  "equity_curve": [...],
  "trades": [...]
}`}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Portfolios Tab */}
          <TabsContent value="portfolios">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Portfolio Management API
                  </CardTitle>
                  <CardDescription>
                    Manage and monitor your trading portfolios programmatically
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Get Portfolio</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        <Badge variant="secondary" className="mr-2">GET</Badge>
                        <code className="text-cyan-400">/v1/portfolios/{`{portfolio_id}`}</code>
                      </p>
                      <div className="relative">
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{codeExamples.portfolio}</code>
                        </pre>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(codeExamples.portfolio)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Response Example</h4>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`{
  "portfolio_id": "pf_123",
  "name": "My Trading Portfolio",
  "total_value": 25750.80,
  "cash_balance": 5230.45,
  "unrealized_pnl": 1250.35,
  "day_change": 2.45,
  "day_change_percent": 0.95,
  "positions": [
    {
      "symbol": "AAPL",
      "quantity": 100,
      "avg_cost": 170.50,
      "current_price": 175.30,
      "unrealized_pnl": 480.00,
      "weight": 0.68
    }
  ],
  "performance": {
    "total_return": 23.45,
    "ytd_return": 12.34,
    "sharpe_ratio": 1.67
  }
}`}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-amber-400" />
                    Webhooks
                  </CardTitle>
                  <CardDescription>
                    Receive real-time notifications when events occur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Available Events</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <div className="font-semibold text-cyan-400">signal.created</div>
                          <div className="text-sm text-gray-400">New trading signal generated</div>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <div className="font-semibold text-cyan-400">backtest.completed</div>
                          <div className="text-sm text-gray-400">Backtest analysis finished</div>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <div className="font-semibold text-cyan-400">portfolio.updated</div>
                          <div className="text-sm text-gray-400">Portfolio value changed significantly</div>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <div className="font-semibold text-cyan-400">alert.triggered</div>
                          <div className="text-sm text-gray-400">Price or technical alert triggered</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Webhook Payload Example</h4>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`{
  "event": "signal.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "signal_id": "signal_123",
    "symbol": "AAPL",
    "type": "buy",
    "confidence": 87,
    "price": 175.50
  }
}`}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rate Limits Tab */}
          <TabsContent value="rate-limits">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-red-400" />
                    Rate Limits & Usage
                  </CardTitle>
                  <CardDescription>
                    Understanding API limits and best practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-4">Rate Limits by Plan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <div className="font-semibold text-gray-400">Free Plan</div>
                          <div className="text-2xl font-bold text-cyan-400">100</div>
                          <div className="text-sm text-gray-400">requests/hour</div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg border-2 border-cyan-600">
                          <div className="font-semibold text-cyan-400">Pro Plan</div>
                          <div className="text-2xl font-bold text-green-400">10,000</div>
                          <div className="text-sm text-gray-400">requests/hour</div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <div className="font-semibold text-blue-400">Enterprise</div>
                          <div className="text-2xl font-bold text-purple-400">Unlimited</div>
                          <div className="text-sm text-gray-400">custom limits</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Rate Limit Headers</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Every API response includes rate limit information in the headers:
                      </p>
                      <pre className="bg-gray-900 p-4 rounded-lg text-sm">
                        <code>{`X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9995
X-RateLimit-Reset: 1642281600`}</code>
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Best Practices</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold">Use Webhooks</div>
                            <div className="text-sm text-gray-400">Subscribe to webhooks instead of polling</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold">Cache Responses</div>
                            <div className="text-sm text-gray-400">Cache API responses when appropriate</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold">Handle Errors</div>
                            <div className="text-sm text-gray-400">Implement proper error handling and retries</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* SDKs and Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                Official SDKs
              </CardTitle>
              <CardDescription>Use our official libraries to get started faster</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-semibold">Python SDK</div>
                    <div className="text-sm text-gray-400">pip install nexural-trading</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-semibold">JavaScript SDK</div>
                    <div className="text-sm text-gray-400">npm install @nexural/trading-sdk</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-semibold">Go SDK</div>
                    <div className="text-sm text-gray-400">go get github.com/nexural/go-sdk</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-cyan-400" />
                Resources & Support
              </CardTitle>
              <CardDescription>Additional resources to help you succeed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-between">
                  <span>API Changelog</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Code Examples</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Community Forum</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>API Support</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span>All systems operational</span>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Check our <a href="/status" className="text-cyan-400 hover:underline">status page</a> for real-time API health
          </div>
        </div>
      </div>
    </div>
  )
}


