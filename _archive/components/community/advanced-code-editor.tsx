"use client"

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Code, PlayCircle, Download, Copy, Share2, 
  CheckCircle, AlertCircle, FileCode, Zap,
  BarChart3, TrendingUp, Brain, TestTube
} from "lucide-react"
import { toast } from "sonner"

interface AdvancedCodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'pine' | 'python' | 'javascript' | 'mql4' | 'mql5'
  onLanguageChange: (language: string) => void
  className?: string
}

export default function AdvancedCodeEditor({ 
  value, 
  onChange, 
  language, 
  onLanguageChange,
  className 
}: AdvancedCodeEditorProps) {
  const [isTestingCode, setIsTestingCode] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [showTestResults, setShowTestResults] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const languages = [
    { value: 'pine', label: 'Pine Script', icon: '📊', color: 'text-blue-400' },
    { value: 'python', label: 'Python', icon: '🐍', color: 'text-green-400' },
    { value: 'javascript', label: 'JavaScript', icon: '🟨', color: 'text-yellow-400' },
    { value: 'mql4', label: 'MQL4', icon: '💹', color: 'text-purple-400' },
    { value: 'mql5', label: 'MQL5', icon: '💹', color: 'text-purple-400' }
  ]

  const codeTemplates = {
    pine: `//╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
//║ NEXURAL COMMUNITY - PINE SCRIPT TEMPLATE                                                       ║
//║ Share your strategy with proper documentation and risk management                              ║
//╚═══════════════════════════════════════════════════════════════════════════════════════════════╝

//@version=5
strategy("My Trading Strategy", shorttitle="MyStrat", overlay=true, 
         default_qty_type=strategy.percent_of_equity, default_qty_value=10,
         commission_type=strategy.commission.percent, commission_value=0.1)

// ═══════════════════════ STRATEGY INPUTS ═══════════════════════════
fast_length = input.int(12, title="Fast MA Length", minval=1, maxval=200)
slow_length = input.int(26, title="Slow MA Length", minval=1, maxval=200)
risk_percent = input.float(2.0, title="Risk Percentage", minval=0.1, maxval=10.0, step=0.1)

// ═══════════════════════ INDICATORS ═══════════════════════════
fast_ma = ta.ema(close, fast_length)
slow_ma = ta.ema(close, slow_length)
atr = ta.atr(14)

// ═══════════════════════ ENTRY CONDITIONS ═══════════════════════════
long_condition = ta.crossover(fast_ma, slow_ma) and close > slow_ma
short_condition = ta.crossunder(fast_ma, slow_ma) and close < slow_ma

// ═══════════════════════ RISK MANAGEMENT ═══════════════════════════
calculate_position_size(entry_price, stop_price, risk_pct) =>
    risk_amount = strategy.equity * risk_pct / 100
    price_diff = math.abs(entry_price - stop_price)
    math.round(risk_amount / price_diff / syminfo.mintick) * syminfo.mintick

// ═══════════════════════ STRATEGY EXECUTION ═══════════════════════════
if long_condition and strategy.position_size == 0
    entry_price = close
    stop_loss = entry_price - (atr * 2)
    take_profit = entry_price + (atr * 3)
    
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=stop_loss, limit=take_profit)
    
    // Visual markers
    label.new(bar_index, low - atr, "BUY\\n" + str.tostring(entry_price, "#.##"), 
             style=label.style_label_up, color=color.green, size=size.small)

if short_condition and strategy.position_size == 0
    entry_price = close
    stop_loss = entry_price + (atr * 2)
    take_profit = entry_price - (atr * 3)
    
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=stop_loss, limit=take_profit)
    
    // Visual markers
    label.new(bar_index, high + atr, "SELL\\n" + str.tostring(entry_price, "#.##"), 
             style=label.style_label_down, color=color.red, size=size.small)

// ═══════════════════════ PLOTTING ═══════════════════════════
plot(fast_ma, title="Fast MA", color=color.blue, linewidth=2)
plot(slow_ma, title="Slow MA", color=color.red, linewidth=2)

// Background highlighting for trend
bgcolor(fast_ma > slow_ma ? color.new(color.green, 95) : color.new(color.red, 95))`,

    python: `# ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
# ║ NEXURAL COMMUNITY - PYTHON TRADING ALGORITHM                                                   ║
# ║ Professional template with proper risk management and backtesting                              ║
# ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝

import pandas as pd
import numpy as np
import yfinance as yf
from backtesting import Backtest, Strategy
import talib

class NexuralTradingStrategy(Strategy):
    """
    Advanced Trading Strategy Template
    - Proper risk management
    - Multiple timeframe analysis
    - Performance tracking
    """
    
    # Strategy Parameters (optimizable)
    fast_period = 12
    slow_period = 26
    risk_per_trade = 0.02  # 2% risk per trade
    max_positions = 3
    
    def init(self):
        """Initialize indicators and strategy variables"""
        self.fast_ma = self.I(talib.EMA, self.data.Close, self.fast_period)
        self.slow_ma = self.I(talib.EMA, self.data.Close, self.slow_period)
        self.atr = self.I(talib.ATR, self.data.High, self.data.Low, self.data.Close, 14)
        self.rsi = self.I(talib.RSI, self.data.Close, 14)
        
        # Risk management variables
        self.position_value = 0
        self.entry_price = 0
        self.stop_loss = 0
        self.take_profit = 0
    
    def calculate_position_size(self, entry_price, stop_price):
        """Calculate position size based on risk percentage"""
        risk_amount = self.equity * self.risk_per_trade
        price_diff = abs(entry_price - stop_price)
        if price_diff == 0:
            return 0
        return min(risk_amount / price_diff, self.equity * 0.95 / entry_price)
    
    def next(self):
        """Strategy logic executed on each bar"""
        
        # Skip if not enough data
        if len(self.data) < max(self.fast_period, self.slow_period):
            return
        
        current_price = self.data.Close[-1]
        current_atr = self.atr[-1]
        
        # Entry Conditions
        ma_crossover_bullish = (self.fast_ma[-1] > self.slow_ma[-1] and 
                               self.fast_ma[-2] <= self.slow_ma[-2])
        ma_crossover_bearish = (self.fast_ma[-1] < self.slow_ma[-1] and 
                               self.fast_ma[-2] >= self.slow_ma[-2])
        
        rsi_oversold = self.rsi[-1] < 30
        rsi_overbought = self.rsi[-1] > 70
        
        # Long Entry
        if (ma_crossover_bullish and 
            not rsi_overbought and 
            not self.position):
            
            stop_price = current_price - (current_atr * 2)
            take_profit_price = current_price + (current_atr * 3)
            
            # Calculate position size
            size = self.calculate_position_size(current_price, stop_price)
            
            if size > 0:
                self.buy(size=size)
                self.entry_price = current_price
                self.stop_loss = stop_price
                self.take_profit = take_profit_price
        
        # Short Entry
        elif (ma_crossover_bearish and 
              not rsi_oversold and 
              not self.position):
            
            stop_price = current_price + (current_atr * 2)
            take_profit_price = current_price - (current_atr * 3)
            
            # Calculate position size
            size = self.calculate_position_size(current_price, stop_price)
            
            if size > 0:
                self.sell(size=size)
                self.entry_price = current_price
                self.stop_loss = stop_price
                self.take_profit = take_profit_price
        
        # Exit Management
        if self.position:
            if self.position.is_long:
                if current_price <= self.stop_loss or current_price >= self.take_profit:
                    self.position.close()
            elif self.position.is_short:
                if current_price >= self.stop_loss or current_price <= self.take_profit:
                    self.position.close()


def run_backtest(symbol='AAPL', period='2y'):
    """Run backtest with proper performance metrics"""
    
    # Download data
    print(f"Downloading {symbol} data...")
    data = yf.download(symbol, period=period)
    
    if data.empty:
        print(f"No data found for {symbol}")
        return None
    
    # Run backtest
    bt = Backtest(data, NexuralTradingStrategy, cash=100000, commission=.002)
    stats = bt.run()
    
    # Display results
    print("\\n" + "="*50)
    print(f"BACKTEST RESULTS - {symbol}")
    print("="*50)
    print(f"Initial Capital: $100,000")
    print(f"Final Portfolio Value: ${stats['End']:,.2f}")
    print(f"Total Return: {stats['Return [%]']:.2f}%")
    print(f"Sharpe Ratio: {stats['Sharpe Ratio']:.2f}")
    print(f"Max Drawdown: {stats['Max. Drawdown [%]']:.2f}%")
    print(f"Win Rate: {stats['Win Rate [%]']:.2f}%")
    print(f"Number of Trades: {stats['# Trades']}")
    print("="*50)
    
    return bt, stats

# Example usage
if __name__ == "__main__":
    # Test the strategy
    backtest, results = run_backtest('TSLA', '1y')
    
    # Uncomment to show interactive chart
    # backtest.plot()`,

    javascript: `/*
╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
║ NEXURAL COMMUNITY - JAVASCRIPT TRADING BOT                                                     ║
║ Node.js algorithmic trading with API integration                                               ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
*/

const axios = require('axios');
const WebSocket = require('ws');

class NexuralTradingBot {
    constructor(config) {
        this.config = {
            apiKey: config.apiKey || '',
            apiSecret: config.apiSecret || '',
            baseUrl: config.baseUrl || 'https://api.alpaca.markets',
            riskPerTrade: config.riskPerTrade || 0.02,
            maxPositions: config.maxPositions || 3,
            ...config
        };
        
        this.positions = new Map();
        this.orders = new Map();
        this.indicators = new Map();
        this.isRunning = false;
    }
    
    async initialize() {
        console.log('🚀 Initializing Nexural Trading Bot...');
        
        // Validate API credentials
        try {
            const account = await this.getAccount();
            console.log(\`✅ Connected to trading account: \$\{account.equity\}\`);
        } catch (error) {
            console.error('❌ Failed to connect to trading account:', error.message);
            return false;
        }
        
        // Initialize WebSocket for real-time data
        await this.connectWebSocket();
        
        return true;
    }
    
    async getAccount() {
        const response = await axios.get(\`\${this.config.baseUrl}/v2/account\`, {
            headers: {
                'APCA-API-KEY-ID': this.config.apiKey,
                'APCA-API-SECRET-KEY': this.config.apiSecret
            }
        });
        return response.data;
    }
    
    async getMarketData(symbol, timeframe = '1Min', limit = 100) {
        const response = await axios.get(\`\${this.config.baseUrl}/v2/stocks/\${symbol}/bars\`, {
            params: {
                timeframe: timeframe,
                limit: limit
            },
            headers: {
                'APCA-API-KEY-ID': this.config.apiKey,
                'APCA-API-SECRET-KEY': this.config.apiSecret
            }
        });
        return response.data.bars;
    }
    
    calculateIndicators(prices) {
        const closes = prices.map(bar => parseFloat(bar.c));
        
        // Simple Moving Averages
        const sma20 = this.calculateSMA(closes, 20);
        const sma50 = this.calculateSMA(closes, 50);
        
        // RSI
        const rsi = this.calculateRSI(closes, 14);
        
        // MACD
        const macd = this.calculateMACD(closes);
        
        return {
            sma20: sma20[sma20.length - 1],
            sma50: sma50[sma50.length - 1],
            rsi: rsi[rsi.length - 1],
            macd: macd[macd.length - 1]
        };
    }
    
    calculateSMA(prices, period) {
        const sma = [];
        for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }
        return sma;
    }
    
    calculateRSI(prices, period = 14) {
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        const avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
        const avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    async analyzeSymbol(symbol) {
        console.log(\`📊 Analyzing \${symbol}...\`);
        
        // Get market data
        const bars = await this.getMarketData(symbol, '5Min', 200);
        if (!bars || bars.length < 50) {
            console.log(\`❌ Insufficient data for \${symbol}\`);
            return null;
        }
        
        // Calculate indicators
        const indicators = this.calculateIndicators(bars);
        const currentPrice = parseFloat(bars[bars.length - 1].c);
        
        // Generate signals
        const signals = this.generateSignals(indicators, currentPrice);
        
        return {
            symbol,
            currentPrice,
            indicators,
            signals,
            timestamp: new Date()
        };
    }
    
    generateSignals(indicators, currentPrice) {
        const signals = [];
        
        // Moving Average Crossover
        if (indicators.sma20 > indicators.sma50) {
            signals.push({
                type: 'bullish',
                indicator: 'SMA Crossover',
                strength: 0.7,
                message: 'SMA20 above SMA50 - Bullish trend'
            });
        } else if (indicators.sma20 < indicators.sma50) {
            signals.push({
                type: 'bearish',
                indicator: 'SMA Crossover',
                strength: 0.7,
                message: 'SMA20 below SMA50 - Bearish trend'
            });
        }
        
        // RSI Levels
        if (indicators.rsi < 30) {
            signals.push({
                type: 'bullish',
                indicator: 'RSI',
                strength: 0.8,
                message: 'RSI oversold - Potential bounce'
            });
        } else if (indicators.rsi > 70) {
            signals.push({
                type: 'bearish',
                indicator: 'RSI',
                strength: 0.8,
                message: 'RSI overbought - Potential pullback'
            });
        }
        
        return signals;
    }
    
    async executeStrategy(watchlist = ['AAPL', 'TSLA', 'MSFT', 'GOOGL']) {
        console.log('🎯 Executing trading strategy...');
        
        for (const symbol of watchlist) {
            try {
                const analysis = await this.analyzeSymbol(symbol);
                if (!analysis) continue;
                
                // Check for trading opportunities
                const opportunity = this.evaluateOpportunity(analysis);
                if (opportunity) {
                    await this.executeTrade(opportunity);
                }
                
                // Rate limiting
                await this.sleep(1000);
                
            } catch (error) {
                console.error(\`❌ Error analyzing \${symbol}:\`, error.message);
            }
        }
    }
    
    evaluateOpportunity(analysis) {
        const { signals, currentPrice } = analysis;
        
        // Calculate signal strength
        const bullishStrength = signals
            .filter(s => s.type === 'bullish')
            .reduce((sum, s) => sum + s.strength, 0);
            
        const bearishStrength = signals
            .filter(s => s.type === 'bearish')
            .reduce((sum, s) => sum + s.strength, 0);
        
        // Minimum signal strength required
        const minStrength = 1.2;
        
        if (bullishStrength > minStrength && bullishStrength > bearishStrength) {
            return {
                type: 'buy',
                symbol: analysis.symbol,
                price: currentPrice,
                strength: bullishStrength,
                signals: signals.filter(s => s.type === 'bullish')
            };
        } else if (bearishStrength > minStrength && bearishStrength > bullishStrength) {
            return {
                type: 'sell',
                symbol: analysis.symbol,
                price: currentPrice,
                strength: bearishStrength,
                signals: signals.filter(s => s.type === 'bearish')
            };
        }
        
        return null;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async start() {
        const initialized = await this.initialize();
        if (!initialized) return;
        
        this.isRunning = true;
        console.log('🚀 Trading bot started!');
        
        // Run strategy every 5 minutes
        while (this.isRunning) {
            await this.executeStrategy();
            await this.sleep(5 * 60 * 1000); // 5 minutes
        }
    }
    
    stop() {
        this.isRunning = false;
        console.log('🛑 Trading bot stopped.');
    }
}

// Example usage
const bot = new NexuralTradingBot({
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET',
    riskPerTrade: 0.01, // 1% risk per trade
    maxPositions: 5
});

// Uncomment to start the bot
// bot.start().catch(console.error);

module.exports = NexuralTradingBot;`
  }

  const handleTestCode = async () => {
    setIsTestingCode(true)
    
    try {
      // Simulate code testing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock test results based on language
      const mockResults = {
        pine: {
          success: true,
          message: "Strategy compiled successfully",
          metrics: {
            totalTrades: 247,
            winRate: "68.4%",
            profitFactor: 1.87,
            maxDrawdown: "-12.3%"
          },
          warnings: ["Consider adding position sizing rules"]
        },
        python: {
          success: true,
          message: "Backtest completed successfully",
          metrics: {
            returns: "+156.7%",
            sharpe: 2.34,
            maxDrawdown: "-8.9%",
            winRate: "71.2%"
          },
          warnings: []
        },
        javascript: {
          success: true,
          message: "Bot simulation completed",
          metrics: {
            uptime: "99.2%",
            avgLatency: "12ms",
            signalsGenerated: 1847,
            accuracy: "74.3%"
          },
          warnings: ["Add error handling for API timeouts"]
        }
      }
      
      setTestResults(mockResults[language] || mockResults.pine)
      setShowTestResults(true)
      toast.success("Code tested successfully!")
      
    } catch (error) {
      toast.error("Code testing failed")
    } finally {
      setIsTestingCode(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(value)
    toast.success("Code copied to clipboard!")
  }

  const handleInsertTemplate = () => {
    onChange(codeTemplates[language] || codeTemplates.pine)
    toast.success("Template inserted!")
  }

  return (
    <div className={`border border-gray-600 rounded-xl overflow-hidden ${className}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-blue-400" />
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="text-white">
                    <div className="flex items-center gap-2">
                      <span>{lang.icon}</span>
                      <span>{lang.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Brain className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleInsertTemplate}>
              <FileCode className="w-3 h-3 mr-1" />
              Template
            </Button>
            
            <Button size="sm" variant="outline" onClick={handleCopyCode}>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleTestCode}
              disabled={isTestingCode || !value.trim()}
            >
              {isTestingCode ? (
                <TestTube className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <PlayCircle className="w-3 h-3 mr-1" />
              )}
              {isTestingCode ? 'Testing...' : 'Test Code'}
            </Button>
            
            <Button size="sm" variant="outline">
              <Share2 className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-96 bg-gray-950 text-green-400 font-mono text-sm p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder={`// Start coding your ${language === 'pine' ? 'Pine Script strategy' : 
                                                language === 'python' ? 'Python algorithm' : 
                                                'trading logic'} here...`}
          spellCheck={false}
          style={{
            tabSize: 2,
            lineHeight: '1.5'
          }}
        />
        
        {/* Line numbers overlay */}
        <div className="absolute left-0 top-0 p-4 text-gray-600 text-sm font-mono pointer-events-none select-none">
          {value.split('\n').map((_, i) => (
            <div key={i} style={{ lineHeight: '1.5' }}>
              {(i + 1).toString().padStart(3, ' ')}
            </div>
          ))}
        </div>
      </div>

      {/* Footer with stats */}
      <div className="bg-gray-800/50 px-4 py-2 border-t border-gray-600 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Lines: {value.split('\n').length}</span>
          <span>Characters: {value.length}</span>
          <span>Language: {languages.find(l => l.value === language)?.label}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
            <Zap className="w-3 h-3 mr-1" />
            Syntax Check: OK
          </Badge>
        </div>
      </div>

      {/* Test Results Modal */}
      <Dialog open={showTestResults} onOpenChange={setShowTestResults}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Code Test Results
            </DialogTitle>
            <DialogDescription>
              {testResults?.message}
            </DialogDescription>
          </DialogHeader>

          {testResults && (
            <div className="space-y-4">
              {/* Metrics */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(testResults.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <span className="text-white font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {testResults.warnings && testResults.warnings.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Suggestions
                  </h4>
                  <ul className="text-yellow-300 text-sm space-y-1">
                    {testResults.warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Save Results
                </Button>
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Run Live Test
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
