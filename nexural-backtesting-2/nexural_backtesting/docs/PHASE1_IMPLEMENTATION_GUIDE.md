# 🚀 Phase 1 Implementation Guide - Core Trading Interface

**Week 1-8: Building the Foundation for 99+ Platform**

---

## 🎯 **Week 1-2: Enhanced Dashboard**

### **Day 1-2: Project Setup**
```bash
# Create React + TypeScript project
npx create-react-app nexural-ui --template typescript
cd nexural-ui

# Install essential dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @reduxjs/toolkit react-redux
npm install lightweight-charts  # TradingView charts
npm install d3 @types/d3
npm install socket.io-client
npm install react-router-dom
npm install @mui/icons-material
npm install recharts  # For additional charts
```

### **Day 3-4: Basic Layout Structure**
```typescript
// src/components/Layout/MainLayout.tsx
import React from 'react';
import { Box, Drawer, AppBar, Toolbar } from '@mui/material';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6">Nexural Backtesting Engine</Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer variant="permanent" open={sidebarOpen}>
        <Sidebar />
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};
```

### **Day 5-7: TradingView Chart Integration**
```typescript
// src/components/Charts/TradingViewChart.tsx
import { createChart, IChartApi } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  data: OHLCV[];
  symbol: string;
  realTime?: boolean;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  data, 
  symbol, 
  realTime = false 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
  useEffect(() => {
    if (chartContainerRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: 800,
        height: 400,
        layout: {
          backgroundColor: '#1e1e1e',
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2B2B43' },
          horzLines: { color: '#2B2B43' },
        },
      });
      
      const candlestickSeries = chartRef.current.addCandlestickSeries();
      candlestickSeries.setData(data);
    }
    
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data]);
  
  return <div ref={chartContainerRef} />;
};
```

### **Day 8-14: Real-time Data Integration**
```typescript
// src/hooks/useRealTimeData.ts
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

export const useRealTimeData = (symbols: string[]) => {
  const [data, setData] = useState<Record<string, MarketData>>({});
  
  useEffect(() => {
    const socket = io('http://localhost:8000');
    
    socket.on('market_data', (marketData: MarketData) => {
      setData(prev => ({
        ...prev,
        [marketData.symbol]: marketData
      }));
    });
    
    socket.emit('subscribe', symbols);
    
    return () => {
      socket.disconnect();
    };
  }, [symbols]);
  
  return data;
};
```

---

## 🎯 **Week 3-4: Backtesting Module**

### **Day 15-17: Strategy Builder Interface**
```typescript
// src/components/Backtesting/StrategyBuilder.tsx
import React, { useState } from 'react';
import { Box, Paper, Grid, Typography } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface StrategyRule {
  id: string;
  type: 'entry' | 'exit' | 'filter';
  condition: string;
  parameters: Record<string, any>;
}

const StrategyBuilder: React.FC = () => {
  const [rules, setRules] = useState<StrategyRule[]>([]);
  
  const addRule = (type: 'entry' | 'exit' | 'filter') => {
    const newRule: StrategyRule = {
      id: `rule-${Date.now()}`,
      type,
      condition: '',
      parameters: {}
    };
    setRules([...rules, newRule]);
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Strategy Builder</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Conditions</Typography>
            <Button onClick={() => addRule('entry')}>Add Entry Rule</Button>
            <Button onClick={() => addRule('exit')}>Add Exit Rule</Button>
            <Button onClick={() => addRule('filter')}>Add Filter</Button>
          </Paper>
        </Grid>
        
        <Grid item xs={9}>
          <Paper sx={{ p: 2, minHeight: 400 }}>
            <DragDropContext>
              <Droppable droppableId="strategy-rules">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {rules.map((rule, index) => (
                      <Draggable key={rule.id} draggableId={rule.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <RuleCard rule={rule} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
```

### **Day 18-21: Backtest Configuration**
```typescript
// src/components/Backtesting/BacktestConfig.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';

interface BacktestConfig {
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
  symbols: string[];
}

const BacktestConfig: React.FC = () => {
  const [config, setConfig] = useState<BacktestConfig>({
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    initialCapital: 100000,
    commission: 0.001,
    slippage: 0.0005,
    symbols: ['AAPL', 'MSFT', 'GOOGL']
  });
  
  const runBacktest = async () => {
    try {
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const result = await response.json();
      // Handle backtest results
    } catch (error) {
      console.error('Backtest failed:', error);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Backtest Configuration</Typography>
      
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
        <TextField
          label="Start Date"
          type="date"
          value={config.startDate}
          onChange={(e) => setConfig({...config, startDate: e.target.value})}
        />
        
        <TextField
          label="End Date"
          type="date"
          value={config.endDate}
          onChange={(e) => setConfig({...config, endDate: e.target.value})}
        />
        
        <TextField
          label="Initial Capital"
          type="number"
          value={config.initialCapital}
          onChange={(e) => setConfig({...config, initialCapital: Number(e.target.value)})}
        />
        
        <TextField
          label="Commission (%)"
          type="number"
          value={config.commission}
          onChange={(e) => setConfig({...config, commission: Number(e.target.value)})}
        />
      </Box>
      
      <Button 
        variant="contained" 
        onClick={runBacktest}
        sx={{ mt: 2 }}
      >
        Run Backtest
      </Button>
    </Paper>
  );
};
```

### **Day 22-28: Results Analysis Dashboard**
```typescript
// src/components/Backtesting/ResultsAnalysis.tsx
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface BacktestResult {
  equityCurve: Array<{date: string, equity: number}>;
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
  trades: Array<{
    date: string;
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    price: number;
    pnl: number;
  }>;
}

const ResultsAnalysis: React.FC<{ result: BacktestResult }> = ({ result }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Backtest Results</Typography>
      
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Performance Metrics</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography>Total Return: {(result.metrics.totalReturn * 100).toFixed(2)}%</Typography>
              <Typography>Sharpe Ratio: {result.metrics.sharpeRatio.toFixed(2)}</Typography>
              <Typography>Max Drawdown: {(result.metrics.maxDrawdown * 100).toFixed(2)}%</Typography>
              <Typography>Win Rate: {(result.metrics.winRate * 100).toFixed(1)}%</Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Equity Curve */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Equity Curve</Typography>
            <LineChart width={800} height={300} data={result.equityCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="equity" stroke="#8884d8" />
            </LineChart>
          </Paper>
        </Grid>
        
        {/* Trade List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Trade History</Typography>
            <TradeTable trades={result.trades} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
```

---

## 🎯 **Week 5-6: Risk Management**

### **Day 29-35: Risk Dashboard**
```typescript
// src/components/Risk/RiskDashboard.tsx
import React from 'react';
import { Box, Grid, Paper, Typography, Alert } from '@mui/material';
import { GaugeChart } from 'recharts';

interface RiskMetrics {
  var95: number;
  leverage: number;
  concentration: number;
  correlation: number;
  drawdown: number;
}

const RiskDashboard: React.FC<{ metrics: RiskMetrics }> = ({ metrics }) => {
  const getRiskLevel = (value: number, threshold: number) => {
    if (value > threshold * 0.8) return 'high';
    if (value > threshold * 0.5) return 'medium';
    return 'low';
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Risk Dashboard</Typography>
      
      <Grid container spacing={3}>
        {/* VaR Gauge */}
        <Grid item xs={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">VaR (95%)</Typography>
            <GaugeChart
              value={metrics.var95}
              max={0.1}
              color={getRiskLevel(metrics.var95, 0.1) === 'high' ? '#f44336' : '#4caf50'}
            />
            <Typography>{(metrics.var95 * 100).toFixed(2)}%</Typography>
          </Paper>
        </Grid>
        
        {/* Leverage Gauge */}
        <Grid item xs={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Leverage</Typography>
            <GaugeChart
              value={metrics.leverage}
              max={3}
              color={getRiskLevel(metrics.leverage, 3) === 'high' ? '#f44336' : '#4caf50'}
            />
            <Typography>{metrics.leverage.toFixed(2)}x</Typography>
          </Paper>
        </Grid>
        
        {/* Risk Alerts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Risk Alerts</Typography>
            {metrics.var95 > 0.08 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                VaR exceeds 8% threshold
              </Alert>
            )}
            {metrics.leverage > 2.5 && (
              <Alert severity="error" sx={{ mb: 1 }}>
                Leverage exceeds 2.5x limit
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
```

---

## 🎯 **Week 7-8: Data Center**

### **Day 36-42: Market Scanner**
```typescript
// src/components/Data/MarketScanner.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow 
} from '@mui/material';

interface ScanResult {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  pe: number;
}

const MarketScanner: React.FC = () => {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [filters, setFilters] = useState({
    minVolume: 1000000,
    maxPE: 50,
    minChange: -0.1,
    maxChange: 0.1
  });
  
  const runScan = async () => {
    try {
      const response = await fetch('/api/market-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      const results = await response.json();
      setScanResults(results);
    } catch (error) {
      console.error('Scan failed:', error);
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Market Scanner</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <TextField
            label="Min Volume"
            type="number"
            value={filters.minVolume}
            onChange={(e) => setFilters({...filters, minVolume: Number(e.target.value)})}
          />
          <TextField
            label="Max P/E"
            type="number"
            value={filters.maxPE}
            onChange={(e) => setFilters({...filters, maxPE: Number(e.target.value)})}
          />
          <TextField
            label="Min Change %"
            type="number"
            value={filters.minChange}
            onChange={(e) => setFilters({...filters, minChange: Number(e.target.value)})}
          />
          <TextField
            label="Max Change %"
            type="number"
            value={filters.maxChange}
            onChange={(e) => setFilters({...filters, maxChange: Number(e.target.value)})}
          />
        </Box>
        
        <Button variant="contained" onClick={runScan} sx={{ mt: 2 }}>
          Run Scan
        </Button>
      </Paper>
      
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Change %</TableCell>
              <TableCell>Volume</TableCell>
              <TableCell>Market Cap</TableCell>
              <TableCell>P/E</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scanResults.map((result) => (
              <TableRow key={result.symbol}>
                <TableCell>{result.symbol}</TableCell>
                <TableCell>${result.price.toFixed(2)}</TableCell>
                <TableCell sx={{ color: result.change > 0 ? 'green' : 'red' }}>
                  {(result.change * 100).toFixed(2)}%
                </TableCell>
                <TableCell>{result.volume.toLocaleString()}</TableCell>
                <TableCell>${(result.marketCap / 1e9).toFixed(2)}B</TableCell>
                <TableCell>{result.pe.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
```

---

## 🔧 **Backend API Extensions**

### **FastAPI Integration**
```python
# api/main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

app = FastAPI(title="Nexural Backtesting API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket for real-time data
@app.websocket("/ws/market-data")
async def market_data_websocket(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Get real-time data from existing backend
            market_data = await get_real_time_market_data()
            await websocket.send_text(json.dumps(market_data))
            await asyncio.sleep(1)  # Update every second
    except Exception as e:
        print(f"WebSocket error: {e}")

# Backtest API
@app.post("/api/backtest")
async def run_backtest(config: BacktestConfig):
    """Run backtest with real-time progress updates"""
    try:
        # Use existing backend engine
        engine = UltimateBacktestEngine()
        results = await engine.run_backtest_async(config)
        return results
    except Exception as e:
        return {"error": str(e)}

# Market scanner API
@app.post("/api/market-scanner")
async def market_scanner(filters: ScanFilters):
    """Run market scanner with filters"""
    try:
        # Use existing data connectors
        scanner = MarketScanner()
        results = await scanner.scan(filters)
        return results
    except Exception as e:
        return {"error": str(e)}
```

---

## 🚀 **Next Steps**

### **Immediate Actions (This Week)**
1. **Set up React project** with TypeScript
2. **Install dependencies** (Material-UI, TradingView, etc.)
3. **Create basic layout** with sidebar navigation
4. **Integrate TradingView charts** for basic charting

### **Week 2 Goals**
1. **Real-time data integration** with WebSocket
2. **Basic dashboard** with live market data
3. **Connect to existing backend** APIs
4. **Test basic functionality**

### **Success Criteria for Phase 1**
- ✅ **Dashboard** - Real-time charts, live data feeds
- ✅ **Backtesting** - Visual strategy builder, results analysis
- ✅ **Risk Management** - Real-time risk monitoring
- ✅ **Data Center** - Feed management, market scanner

**This foundation will transform your 95/100 backend into a complete 99+ institutional platform!** 🚀
