# 🔌 **NEXUS QUANTUM TERMINAL - BACKEND INTEGRATION SPECIFICATIONS**

## **📋 TABLE OF CONTENTS**
1. [Frontend Overview & Requirements](#frontend-overview)
2. [Required Backend API Endpoints](#required-api-endpoints)
3. [Data Models & Schemas](#data-models)
4. [WebSocket Requirements](#websocket-requirements)
5. [Authentication Flow](#authentication-flow)
6. [AI Integration Requirements](#ai-integration)
7. [Database Schema](#database-schema)
8. [Environment Variables](#environment-variables)
9. [Connection Instructions](#connection-instructions)
10. [Testing Checklist](#testing-checklist)

---

## **📊 FRONTEND OVERVIEW**

### **Technology Stack:**
- **Framework:** Next.js 15.2.4
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4.1.9
- **Charts:** Recharts
- **State:** React Hooks (no Redux)
- **Terminal:** XTerm.js
- **AI:** Prepared for OpenAI/Anthropic/CatBoost

### **Key Components Requiring Backend:**
1. **NexusQuantTerminal** (`components/nexus-quant-terminal.tsx`)
   - Main application shell
   - Expects real-time data feeds
   - Needs portfolio persistence

2. **AI Terminal** (`components/enhanced-ai-terminal.tsx`)
   - Requires AI processing endpoints
   - Needs streaming responses

3. **Data Adapters** (`lib/data-adapters.ts`)
   - Currently using `MockDataAdapter`
   - Needs to switch to real data source

---

## **🔗 REQUIRED BACKEND API ENDPOINTS**

### **1. Authentication Endpoints**
```typescript
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/user
POST   /api/auth/verify-email
POST   /api/auth/reset-password

// Expected Request/Response:
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "subscription": "pro",
    "apiKeys": {
      "polygon": "encrypted_key",
      "alpaca": "encrypted_key"
    }
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "expiresIn": 3600
}
```

### **2. Portfolio Management**
```typescript
GET    /api/portfolio                    // Get user portfolio
POST   /api/portfolio/positions          // Add position
PUT    /api/portfolio/positions/:id      // Update position
DELETE /api/portfolio/positions/:id      // Remove position
GET    /api/portfolio/performance        // Performance metrics
GET    /api/portfolio/history           // Historical data

// Expected Response:
GET /api/portfolio
{
  "positions": [
    {
      "id": "pos_1",
      "symbol": "AAPL",
      "quantity": 100,
      "avgPrice": 150.25,
      "currentPrice": 175.50,
      "pnl": 2525.00,
      "pnlPercent": 16.8
    }
  ],
  "totalValue": 175500,
  "cash": 50000,
  "totalEquity": 225500,
  "dayChange": 1250.50,
  "dayChangePercent": 0.56
}
```

### **3. Market Data**
```typescript
GET    /api/market/quote/:symbol         // Real-time quote
GET    /api/market/bars/:symbol          // Historical bars
GET    /api/market/news/:symbol          // News for symbol
GET    /api/market/options/:symbol       // Options chain
WS     /api/market/stream                // WebSocket stream

// Expected Response:
GET /api/market/quote/AAPL
{
  "symbol": "AAPL",
  "price": 175.50,
  "change": 2.25,
  "changePercent": 1.30,
  "volume": 52341234,
  "bid": 175.48,
  "ask": 175.52,
  "high": 176.80,
  "low": 173.20,
  "open": 174.00,
  "previousClose": 173.25,
  "timestamp": "2024-01-15T15:30:00Z"
}
```

### **4. Strategy & Backtesting**
```typescript
GET    /api/strategies                   // List user strategies
POST   /api/strategies                   // Create strategy
PUT    /api/strategies/:id               // Update strategy
DELETE /api/strategies/:id               // Delete strategy
POST   /api/strategies/:id/backtest      // Run backtest
GET    /api/strategies/:id/results       // Get results
POST   /api/strategies/:id/deploy        // Deploy live

// Expected Request:
POST /api/strategies/:id/backtest
{
  "startDate": "2023-01-01",
  "endDate": "2024-01-01",
  "initialCapital": 100000,
  "symbols": ["AAPL", "GOOGL", "MSFT"],
  "parameters": {
    "stopLoss": 0.02,
    "takeProfit": 0.05,
    "positionSize": 0.1
  }
}

Response:
{
  "id": "backtest_123",
  "status": "completed",
  "results": {
    "totalReturn": 34.5,
    "sharpeRatio": 2.1,
    "maxDrawdown": -8.2,
    "winRate": 68.5,
    "totalTrades": 245,
    "profitFactor": 2.3
  },
  "equity": [...],  // Array of equity curve data
  "trades": [...]    // Array of all trades
}
```

### **5. AI Processing**
```typescript
POST   /api/ai/analyze                   // Analyze query
POST   /api/ai/generate-strategy         // Generate strategy
POST   /api/ai/optimize                  // Optimize parameters
POST   /api/ai/predict                   // Price prediction
POST   /api/ai/sentiment                 // Sentiment analysis
WS     /api/ai/stream                    // Streaming responses

// Expected Request:
POST /api/ai/analyze
{
  "query": "analyze my portfolio risk",
  "context": {
    "portfolioId": "portfolio_123",
    "timeframe": "1M"
  },
  "model": "gpt-4-turbo"  // or "claude-3", "catboost", etc.
}

Response:
{
  "analysis": "Based on your portfolio...",
  "metrics": {
    "var95": -5.2,
    "sharpeRatio": 1.8,
    "correlation": 0.73
  },
  "recommendations": [
    "Reduce tech exposure",
    "Add defensive positions"
  ],
  "confidence": 0.85
}
```

### **6. Order Management**
```typescript
GET    /api/orders                       // List orders
POST   /api/orders                       // Place order
PUT    /api/orders/:id                   // Modify order
DELETE /api/orders/:id                   // Cancel order
GET    /api/orders/:id/status            // Order status

// Expected Request:
POST /api/orders
{
  "symbol": "AAPL",
  "quantity": 100,
  "side": "buy",
  "type": "limit",
  "limitPrice": 175.00,
  "timeInForce": "day",
  "strategyId": "strategy_123"
}
```

### **7. Data Pipeline**
```typescript
GET    /api/data/status                  // Pipeline status
POST   /api/data/import                  // Import data
GET    /api/data/exports                 // List exports
POST   /api/data/export                  // Export data
GET    /api/data/feeds                   // Active feeds
```

### **8. User Settings**
```typescript
GET    /api/settings                     // Get settings
PUT    /api/settings                     // Update settings
POST   /api/settings/api-keys            // Store API keys
DELETE /api/settings/api-keys/:provider  // Remove API key
```

---

## **📊 DATA MODELS**

### **User Model**
```typescript
interface User {
  id: string
  email: string
  name: string
  subscription: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  settings: UserSettings
  apiKeys: EncryptedAPIKeys
}
```

### **Portfolio Model**
```typescript
interface Portfolio {
  id: string
  userId: string
  positions: Position[]
  cash: number
  totalValue: number
  performance: PerformanceMetrics
  createdAt: Date
  updatedAt: Date
}

interface Position {
  id: string
  portfolioId: string
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  openedAt: Date
}
```

### **Strategy Model**
```typescript
interface Strategy {
  id: string
  userId: string
  name: string
  description: string
  type: 'momentum' | 'mean-reversion' | 'ml-driven' | 'custom'
  code: string  // Pine Script or Python
  parameters: Record<string, any>
  performance: BacktestResults
  status: 'draft' | 'testing' | 'live' | 'paused'
  createdAt: Date
  updatedAt: Date
}
```

### **Order Model**
```typescript
interface Order {
  id: string
  userId: string
  strategyId?: string
  symbol: string
  quantity: number
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop'
  limitPrice?: number
  stopPrice?: number
  status: 'pending' | 'filled' | 'cancelled' | 'rejected'
  filledAt?: Date
  filledPrice?: number
  createdAt: Date
}
```

---

## **🔌 WEBSOCKET REQUIREMENTS**

### **Market Data Stream**
```typescript
// Client connects to: wss://your-backend.com/api/market/stream

// Subscribe message:
{
  "action": "subscribe",
  "symbols": ["AAPL", "GOOGL", "MSFT"],
  "channels": ["trades", "quotes", "bars"]
}

// Server sends:
{
  "type": "trade",
  "symbol": "AAPL",
  "price": 175.50,
  "size": 100,
  "timestamp": "2024-01-15T15:30:00.123Z"
}
```

### **AI Streaming**
```typescript
// Client connects to: wss://your-backend.com/api/ai/stream

// Request:
{
  "action": "analyze",
  "query": "explain market conditions",
  "streamResponse": true
}

// Server streams chunks:
{
  "type": "chunk",
  "content": "Based on current market...",
  "finished": false
}
```

---

## **🔐 AUTHENTICATION FLOW**

### **JWT Token Structure**
```typescript
// Access Token Payload:
{
  "sub": "user_id",
  "email": "user@example.com",
  "subscription": "pro",
  "iat": 1234567890,
  "exp": 1234571490
}

// Refresh Token stored in httpOnly cookie
// Access Token in Authorization header: "Bearer <token>"
```

### **Frontend Auth Implementation**
```typescript
// lib/auth.ts (you'll need to create this)
import { createClient } from '@/lib/backend-client'

export async function login(email: string, password: string) {
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // For cookies
    body: JSON.stringify({ email, password })
  })
  
  const data = await response.json()
  localStorage.setItem('accessToken', data.accessToken)
  return data
}
```

---

## **🧠 AI INTEGRATION REQUIREMENTS**

### **Required AI Services (Backend Must Provide)**
1. **OpenAI GPT-4** - Natural language processing
2. **Anthropic Claude 3** - Advanced reasoning
3. **CatBoost** - Gradient boosting predictions
4. **TensorFlow/PyTorch** - Neural networks
5. **FinBERT** - Financial sentiment analysis

### **AI Processing Flow**
```mermaid
graph LR
    Frontend[Frontend Query] --> API[Backend API]
    API --> Queue[Task Queue]
    Queue --> AI[AI Processor]
    AI --> GPT[GPT-4]
    AI --> Claude[Claude 3]
    AI --> ML[ML Models]
    ML --> Cache[Redis Cache]
    Cache --> Response[Response to Frontend]
```

---

## **🗄️ DATABASE SCHEMA**

### **PostgreSQL Tables Required**
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    subscription VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255),
    cash DECIMAL(15,2) DEFAULT 100000,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Positions table
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id),
    symbol VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    avg_price DECIMAL(10,2) NOT NULL,
    opened_at TIMESTAMP DEFAULT NOW()
);

-- Strategies table
CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    code TEXT,
    parameters JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    strategy_id UUID REFERENCES strategies(id),
    symbol VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    side VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL,
    limit_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Backtests table
CREATE TABLE backtests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES strategies(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital DECIMAL(15,2),
    results JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **Redis Keys Structure**
```typescript
// Cache structure:
market:quote:AAPL              // Real-time quote
market:bars:AAPL:1D:20240115   // Historical bars
portfolio:user_123              // User portfolio
ai:cache:query_hash             // AI response cache
session:user_123                // User session
ratelimit:user_123:ai           // Rate limiting
```

---

## **🔧 ENVIRONMENT VARIABLES**

### **Frontend (.env.local)**
```env
# Backend Connection
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# Features Flags
NEXT_PUBLIC_ENABLE_LIVE_TRADING=false
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_BACKTESTING=true

# Frontend Config
NEXT_PUBLIC_APP_NAME="Nexus Quantum Terminal"
NEXT_PUBLIC_DEFAULT_THEME=dark
```

### **Backend (.env)**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nexus
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
HUGGINGFACE_API_KEY=hf_...

# Market Data
POLYGON_API_KEY=...
ALPACA_API_KEY=...
ALPACA_SECRET_KEY=...
ALPHA_VANTAGE_KEY=...

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Services
SENTRY_DSN=...
STRIPE_API_KEY=...
SENDGRID_API_KEY=...

# Server
PORT=8000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3025
```

---

## **🔌 CONNECTION INSTRUCTIONS**

### **Step 1: Update Frontend Configuration**
```typescript
// 1. Create lib/config.ts
export const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  apiVersion: process.env.NEXT_PUBLIC_API_VERSION || 'v1'
}

// 2. Create lib/api-client.ts
import { config } from './config'

class APIClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = `${config.backendUrl}/api/${config.apiVersion}`
    this.token = localStorage.getItem('accessToken')
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Auth methods
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    this.token = data.accessToken
    localStorage.setItem('accessToken', data.accessToken)
    return data
  }

  // Portfolio methods
  async getPortfolio() {
    return this.request('/portfolio')
  }

  // Market data methods
  async getQuote(symbol: string) {
    return this.request(`/market/quote/${symbol}`)
  }

  // AI methods
  async analyzeQuery(query: string, context: any) {
    return this.request('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ query, context })
    })
  }
}

export const apiClient = new APIClient()
```

### **Step 2: Update Data Adapter**
```typescript
// In lib/data-adapters.ts, create RealDataAdapter:

import { apiClient } from './api-client'

export class RealDataAdapter extends DataAdapter {
  async connect(): Promise<void> {
    // Verify backend connection
    const status = await apiClient.request('/health')
    if (status.ok) {
      this.connected = true
    }
  }

  async getMarketData(symbols: string[]): Promise<MarketDataPoint[]> {
    const promises = symbols.map(s => apiClient.getQuote(s))
    const quotes = await Promise.all(promises)
    return quotes.map(q => ({
      symbol: q.symbol,
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      volume: q.volume,
      timestamp: new Date(q.timestamp)
    }))
  }

  async getPortfolioData(): Promise<PortfolioData> {
    return apiClient.getPortfolio()
  }
}

// In DataManager, switch to real adapter:
const dataManager = DataManager.getInstance()
dataManager.setAdapter(new RealDataAdapter())
```

### **Step 3: Connect WebSocket**
```typescript
// Create lib/websocket-client.ts
import { config } from './config'

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  
  connect() {
    this.ws = new WebSocket(config.wsUrl)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.authenticate()
      this.subscribe(['AAPL', 'GOOGL', 'MSFT'])
    }
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.reconnect()
    }
  }
  
  private authenticate() {
    const token = localStorage.getItem('accessToken')
    this.send({ action: 'auth', token })
  }
  
  private subscribe(symbols: string[]) {
    this.send({
      action: 'subscribe',
      symbols,
      channels: ['trades', 'quotes']
    })
  }
  
  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
  
  private handleMessage(data: any) {
    // Update UI with real-time data
    window.dispatchEvent(new CustomEvent('marketData', { detail: data }))
  }
  
  private reconnect() {
    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, 5000)
  }
}

export const wsClient = new WebSocketClient()
```

### **Step 4: Update Terminal AI**
```typescript
// In components/nexus-quant-terminal.tsx

import { apiClient } from '@/lib/api-client'

// Replace the mock processAICommand with:
const processAICommand = useCallback(async (command: string) => {
  try {
    // Send to real backend AI
    const response = await apiClient.analyzeQuery(command, {
      portfolioId: currentPortfolioId,
      currentView: activeMainTab
    })
    
    return response.analysis
  } catch (error) {
    console.error('AI Error:', error)
    return 'AI service temporarily unavailable'
  }
}, [currentPortfolioId, activeMainTab])
```

---

## **✅ TESTING CHECKLIST**

### **Backend Connectivity Tests**
```typescript
// Create __tests__/backend-integration.test.ts

describe('Backend Integration', () => {
  test('Health check', async () => {
    const response = await fetch(`${BACKEND_URL}/api/health`)
    expect(response.ok).toBe(true)
  })
  
  test('Authentication flow', async () => {
    const { user, accessToken } = await apiClient.login('test@example.com', 'password')
    expect(user).toBeDefined()
    expect(accessToken).toBeDefined()
  })
  
  test('Portfolio data', async () => {
    const portfolio = await apiClient.getPortfolio()
    expect(portfolio.positions).toBeInstanceOf(Array)
  })
  
  test('Market data', async () => {
    const quote = await apiClient.getQuote('AAPL')
    expect(quote.price).toBeGreaterThan(0)
  })
  
  test('AI processing', async () => {
    const response = await apiClient.analyzeQuery('test query', {})
    expect(response.analysis).toBeDefined()
  })
  
  test('WebSocket connection', (done) => {
    wsClient.connect()
    window.addEventListener('marketData', (event) => {
      expect(event.detail).toBeDefined()
      done()
    })
  })
})
```

---

## **📦 DEPLOYMENT CONFIGURATION**

### **Frontend Deployment (Vercel/Netlify)**
```json
// vercel.json
{
  "env": {
    "NEXT_PUBLIC_BACKEND_URL": "@backend-url",
    "NEXT_PUBLIC_WS_URL": "@ws-url"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### **Docker Compose (Full Stack)**
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3025:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:8000
      - NEXT_PUBLIC_WS_URL=ws://backend:8000
    depends_on:
      - backend

  backend:
    image: your-backend-image
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/nexus
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=nexus
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## **🎯 CRITICAL BACKEND REQUIREMENTS**

Your backend MUST provide:

1. **Authentication System**
   - JWT tokens with refresh mechanism
   - User registration/login
   - Session management

2. **Real-time Data Pipeline**
   - WebSocket server for streaming
   - Market data integration (Polygon/Alpaca)
   - <10ms latency for quotes

3. **AI Processing Layer**
   - OpenAI GPT-4 integration
   - CatBoost model serving
   - Response caching in Redis

4. **Database Layer**
   - PostgreSQL for persistent data
   - Redis for caching and sessions
   - Proper indexing for performance

5. **Security Layer**
   - Rate limiting (especially AI endpoints)
   - API key encryption
   - CORS configuration
   - Input validation

6. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Audit logging

---

## **📞 SUPPORT & CONTACT**

If your backend team needs clarification on any endpoint or data model, they should check:

1. This document: `BACKEND_INTEGRATION_SPECS.md`
2. API integration files: `lib/api-client.ts` (to be created)
3. Data models: `lib/types.ts` (existing)
4. Component requirements: `components/nexus-quant-terminal.tsx`

---

## **VERSION COMPATIBILITY**

- **Frontend Version:** 0.1.0
- **Expected Backend API Version:** v1
- **Minimum Backend Requirements:**
  - Node.js 18+
  - PostgreSQL 14+
  - Redis 6+
  - Python 3.9+ (for ML models)

---

**Last Updated:** January 2024
**Document Version:** 1.0.0
