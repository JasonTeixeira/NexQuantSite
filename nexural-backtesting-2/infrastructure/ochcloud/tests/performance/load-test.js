/**
 * K6 Performance Test Suite for Nexural Platform
 * Comprehensive load testing for OCHcloud deployment
 * Tests all critical endpoints under various load conditions
 */

import http from 'k6/http'
import ws from 'k6/ws'
import { check, sleep, group } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

// Custom metrics
const errorRate = new Rate('errors')
const authSuccessRate = new Rate('auth_success')
const apiResponseTime = new Trend('api_response_time')
const wsConnectionSuccess = new Rate('websocket_connections')
const tradeExecutionTime = new Trend('trade_execution_time')
const portfolioUpdateTime = new Trend('portfolio_update_time')

// Test configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'
const WS_URL = BASE_URL.replace('http', 'ws')

// Test scenarios configuration
export const options = {
  scenarios: {
    // Smoke test - basic functionality
    smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { scenario: 'smoke' },
      exec: 'smokeTest'
    },
    
    // Load test - normal traffic simulation
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },   // Ramp up
        { duration: '5m', target: 10 },   // Stay at normal load
        { duration: '2m', target: 20 },   // Ramp to high load
        { duration: '5m', target: 20 },   // Stay at high load
        { duration: '2m', target: 0 }     // Ramp down
      ],
      tags: { scenario: 'load' },
      exec: 'loadTest'
    },
    
    // Stress test - beyond normal capacity
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to stress level
        { duration: '5m', target: 50 },   // Maintain stress
        { duration: '2m', target: 100 },  // Peak stress
        { duration: '2m', target: 100 },  // Hold peak
        { duration: '3m', target: 0 }     // Ramp down
      ],
      tags: { scenario: 'stress' },
      exec: 'stressTest'
    },
    
    // Spike test - sudden traffic spikes
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },   // Normal traffic
        { duration: '30s', target: 100 }, // Sudden spike
        { duration: '30s', target: 5 },   // Back to normal
        { duration: '30s', target: 0 }    // End
      ],
      tags: { scenario: 'spike' },
      exec: 'spikeTest'
    },
    
    // API-focused test
    api_test: {
      executor: 'constant-arrival-rate',
      rate: 30, // 30 requests per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 10,
      maxVUs: 50,
      tags: { scenario: 'api' },
      exec: 'apiTest'
    },
    
    // WebSocket connection test
    websocket_test: {
      executor: 'constant-vus',
      vus: 20,
      duration: '3m',
      tags: { scenario: 'websocket' },
      exec: 'websocketTest'
    },
    
    // Authentication load test
    auth_test: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 15 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 }
      ],
      preAllocatedVUs: 5,
      maxVUs: 20,
      tags: { scenario: 'auth' },
      exec: 'authTest'
    }
  },
  
  thresholds: {
    // Overall error rate should be less than 1%
    'errors': ['rate<0.01'],
    
    // 95% of requests should be below 800ms
    'http_req_duration': ['p(95)<800'],
    
    // Authentication should succeed 99% of the time
    'auth_success': ['rate>0.99'],
    
    // WebSocket connections should succeed 95% of the time
    'websocket_connections': ['rate>0.95'],
    
    // API response time should be reasonable
    'api_response_time': ['p(95)<500'],
    
    // Trade execution should complete within 2 seconds
    'trade_execution_time': ['p(95)<2000'],
    
    // Portfolio updates should be fast
    'portfolio_update_time': ['p(95)<300']
  }
}

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'TestPassword123!' },
  { email: 'test2@example.com', password: 'TestPassword123!' },
  { email: 'test3@example.com', password: 'TestPassword123!' }
]

const tradingSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX']

// Helper functions
function authenticate(userIndex = 0) {
  const user = testUsers[userIndex % testUsers.length]
  
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password
  }), {
    headers: {
      'Content-Type': 'application/json'
    },
    tags: { endpoint: 'auth/login' }
  })
  
  const success = check(loginResponse, {
    'login successful': (r) => r.status === 200,
    'login response time OK': (r) => r.timings.duration < 1000,
    'login returns token': (r) => JSON.parse(r.body).token !== undefined
  })
  
  authSuccessRate.add(success)
  apiResponseTime.add(loginResponse.timings.duration)
  
  if (success) {
    return JSON.parse(loginResponse.body).token
  }
  return null
}

function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// Smoke Test - Basic functionality check
export function smokeTest() {
  group('Smoke Test - Basic Health Checks', () => {
    // Health check
    const healthResponse = http.get(`${BASE_URL}/api/health`, {
      tags: { endpoint: 'health' }
    })
    
    check(healthResponse, {
      'health check passes': (r) => r.status === 200,
      'health response time OK': (r) => r.timings.duration < 200
    })
    
    // Static assets
    const assetsResponse = http.get(`${BASE_URL}/_next/static/css/app.css`, {
      tags: { endpoint: 'static' }
    })
    
    check(assetsResponse, {
      'static assets load': (r) => r.status === 200 || r.status === 404 // 404 is OK if file doesn't exist
    })
    
    // Basic API endpoint
    const marketsResponse = http.get(`${BASE_URL}/api/market-data/AAPL`, {
      tags: { endpoint: 'market-data' }
    })
    
    check(marketsResponse, {
      'market data endpoint responds': (r) => r.status === 200 || r.status === 401 // 401 is expected without auth
    })
  })
  
  sleep(1)
}

// Load Test - Simulate normal user behavior
export function loadTest() {
  const token = authenticate()
  if (!token) return
  
  const headers = getHeaders(token)
  
  group('Load Test - Normal User Flow', () => {
    // Get portfolio
    const portfolioResponse = http.get(`${BASE_URL}/api/portfolio`, {
      headers,
      tags: { endpoint: 'portfolio' }
    })
    
    check(portfolioResponse, {
      'portfolio loads': (r) => r.status === 200,
      'portfolio response time OK': (r) => r.timings.duration < 500
    })
    
    portfolioUpdateTime.add(portfolioResponse.timings.duration)
    
    // Get market data for multiple symbols
    tradingSymbols.slice(0, 3).forEach(symbol => {
      const marketResponse = http.get(`${BASE_URL}/api/market-data/${symbol}`, {
        headers,
        tags: { endpoint: 'market-data', symbol }
      })
      
      check(marketResponse, {
        [`market data for ${symbol} loads`]: (r) => r.status === 200
      })
      
      apiResponseTime.add(marketResponse.timings.duration)
    })
    
    // Execute a paper trade
    const tradeResponse = http.post(`${BASE_URL}/api/trades`, JSON.stringify({
      symbol: tradingSymbols[Math.floor(Math.random() * tradingSymbols.length)],
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      quantity: Math.floor(Math.random() * 100) + 1,
      orderType: 'market',
      broker: 'paper'
    }), {
      headers,
      tags: { endpoint: 'trades' }
    })
    
    check(tradeResponse, {
      'trade executes successfully': (r) => r.status === 200 || r.status === 201,
      'trade execution time OK': (r) => r.timings.duration < 2000
    })
    
    tradeExecutionTime.add(tradeResponse.timings.duration)
  })
  
  sleep(Math.random() * 3 + 1) // Random sleep 1-4 seconds
}

// Stress Test - Push beyond normal limits
export function stressTest() {
  const token = authenticate()
  if (!token) return
  
  const headers = getHeaders(token)
  
  group('Stress Test - High Load Scenario', () => {
    // Rapid-fire requests
    for (let i = 0; i < 5; i++) {
      const response = http.get(`${BASE_URL}/api/portfolio`, {
        headers,
        tags: { endpoint: 'portfolio', iteration: i }
      })
      
      check(response, {
        'stress request succeeds': (r) => r.status < 500, // Allow 4xx but not 5xx
        'stress response time acceptable': (r) => r.timings.duration < 2000
      })
      
      if (response.status >= 400) {
        errorRate.add(1)
      }
    }
    
    // Concurrent trades
    const trades = []
    for (let i = 0; i < 3; i++) {
      trades.push(http.asyncRequest('POST', `${BASE_URL}/api/trades`, JSON.stringify({
        symbol: tradingSymbols[i % tradingSymbols.length],
        side: 'buy',
        quantity: 10,
        orderType: 'market',
        broker: 'paper'
      }), { headers }))
    }
    
    // Wait for all trades
    const responses = http.batch(trades)
    responses.forEach(response => {
      check(response, {
        'concurrent trade succeeds': (r) => r.status < 500
      })
    })
  })
  
  sleep(0.1) // Minimal sleep for stress test
}

// Spike Test - Handle sudden traffic spikes
export function spikeTest() {
  loadTest() // Use same logic as load test
}

// API Test - Focus on API endpoints
export function apiTest() {
  const token = authenticate()
  if (!token) return
  
  const headers = getHeaders(token)
  
  group('API Test - Endpoint Performance', () => {
    const endpoints = [
      { method: 'GET', url: '/api/portfolio', name: 'portfolio' },
      { method: 'GET', url: '/api/market-data/AAPL', name: 'market-data' },
      { method: 'GET', url: '/api/trades', name: 'trades-list' },
      { method: 'GET', url: '/api/health', name: 'health' }
    ]
    
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
    
    const response = http.request(endpoint.method, `${BASE_URL}${endpoint.url}`, null, {
      headers: endpoint.name === 'health' ? {} : headers,
      tags: { endpoint: endpoint.name, method: endpoint.method }
    })
    
    check(response, {
      [`${endpoint.name} API responds`]: (r) => r.status < 500,
      [`${endpoint.name} response time OK`]: (r) => r.timings.duration < 500
    })
    
    apiResponseTime.add(response.timings.duration)
    
    if (response.status >= 400) {
      errorRate.add(1)
    }
  })
  
  sleep(0.5)
}

// WebSocket Test - Real-time connections
export function websocketTest() {
  const token = authenticate()
  if (!token) return
  
  group('WebSocket Test - Real-time Connections', () => {
    const wsUrl = `${WS_URL}/api/websocket?token=${token}`
    
    const response = ws.connect(wsUrl, {}, (socket) => {
      socket.on('open', () => {
        console.log('WebSocket connected')
        wsConnectionSuccess.add(1)
        
        // Subscribe to market data
        socket.send(JSON.stringify({
          type: 'subscribe',
          channels: ['market-data', 'portfolio-updates']
        }))
      })
      
      socket.on('message', (message) => {
        const data = JSON.parse(message)
        check(data, {
          'WebSocket message valid': (d) => d.type !== undefined,
          'WebSocket data present': (d) => d.data !== undefined
        })
      })
      
      socket.on('close', () => {
        console.log('WebSocket disconnected')
      })
      
      socket.on('error', (e) => {
        console.log('WebSocket error:', e)
        wsConnectionSuccess.add(0)
        errorRate.add(1)
      })
      
      // Keep connection alive for test duration
      socket.setTimeout(() => {
        socket.close()
      }, 10000) // 10 seconds
    })
    
    check(response, {
      'WebSocket connection established': (r) => r !== null
    })
  })
  
  sleep(1)
}

// Auth Test - Authentication load
export function authTest() {
  group('Auth Test - Authentication Performance', () => {
    // Test login
    const token = authenticate()
    
    if (token) {
      // Test protected endpoint
      const protectedResponse = http.get(`${BASE_URL}/api/portfolio`, {
        headers: getHeaders(token),
        tags: { endpoint: 'protected' }
      })
      
      check(protectedResponse, {
        'authenticated request succeeds': (r) => r.status === 200,
        'authenticated response time OK': (r) => r.timings.duration < 1000
      })
      
      // Test logout
      const logoutResponse = http.post(`${BASE_URL}/api/auth/logout`, null, {
        headers: getHeaders(token),
        tags: { endpoint: 'auth/logout' }
      })
      
      check(logoutResponse, {
        'logout succeeds': (r) => r.status === 200
      })
    }
  })
  
  sleep(1)
}

// Custom HTML report generation
export function handleSummary(data) {
  return {
    'performance-report.html': htmlReport(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true })
  }
}

// Setup function - runs before all scenarios
export function setup() {
  console.log('🚀 Starting Nexural Performance Tests')
  console.log(`Testing against: ${BASE_URL}`)
  
  // Verify the application is running
  const healthCheck = http.get(`${BASE_URL}/api/health`)
  if (healthCheck.status !== 200) {
    console.error(`❌ Application not ready. Health check failed with status: ${healthCheck.status}`)
    return null
  }
  
  console.log('✅ Application is ready for testing')
  return { baseUrl: BASE_URL }
}

// Teardown function - runs after all scenarios
export function teardown(data) {
  console.log('🏁 Performance tests completed')
  
  // Could add cleanup logic here if needed
  // For example, cleaning up test data, sending notifications, etc.
}
