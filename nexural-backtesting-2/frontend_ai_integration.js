// Frontend AI Integration for React Strategy Lab
// =============================================
// Add this to your React components to connect with AI backend

// API Configuration
const API_BASE_URL = 'http://localhost:3011';
const WS_BASE_URL = 'ws://localhost:3011';

// AI Integration Service
class AIIntegrationService {
    constructor() {
        this.wsConnections = new Map();
        this.cache = new Map();
    }

    // Get system status
    async getSystemStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/system/status`);
            return await response.json();
        } catch (error) {
            console.error('System status error:', error);
            return { error: error.message };
        }
    }

    // Get live market data
    async getLiveData(symbol) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/market/live/${symbol}`);
            const data = await response.json();
            
            // Cache the data
            this.cache.set(`live_${symbol}`, data);
            
            return data;
        } catch (error) {
            console.error('Live data error:', error);
            return { error: error.message };
        }
    }

    // Get AI ensemble analysis
    async getAIAnalysis(symbol) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/analyze/${symbol}`);
            const analysis = await response.json();
            
            // Cache the analysis
            this.cache.set(`ai_${symbol}`, analysis);
            
            return analysis;
        } catch (error) {
            console.error('AI analysis error:', error);
            return { error: error.message };
        }
    }

    // Analyze strategy with AI
    async analyzeStrategy(strategyData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/strategy/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(strategyData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Strategy analysis error:', error);
            return { error: error.message };
        }
    }

    // Start live data stream via WebSocket
    startLiveStream(symbol, onData, onError) {
        const wsUrl = `${WS_BASE_URL}/ws/live/${symbol}`;
        
        try {
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                console.log(`Live stream started for ${symbol}`);
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onData(data);
                } catch (error) {
                    console.error('WebSocket data parse error:', error);
                }
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (onError) onError(error);
            };
            
            ws.onclose = () => {
                console.log(`Live stream closed for ${symbol}`);
                this.wsConnections.delete(symbol);
            };
            
            this.wsConnections.set(symbol, ws);
            return ws;
            
        } catch (error) {
            console.error('WebSocket connection error:', error);
            if (onError) onError(error);
        }
    }

    // Stop live data stream
    stopLiveStream(symbol) {
        const ws = this.wsConnections.get(symbol);
        if (ws) {
            ws.close();
            this.wsConnections.delete(symbol);
        }
    }

    // Get cached data
    getCachedData(key) {
        return this.cache.get(key);
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }
}

// React Hook for AI Integration
function useAIIntegration() {
    const [aiService] = useState(() => new AIIntegrationService());
    const [systemStatus, setSystemStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load system status
    useEffect(() => {
        const loadStatus = async () => {
            setLoading(true);
            try {
                const status = await aiService.getSystemStatus();
                setSystemStatus(status);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadStatus();
    }, [aiService]);

    return {
        aiService,
        systemStatus,
        loading,
        error,
        isAIAvailable: systemStatus?.ai_providers?.ensemble_active || false,
        isLiveDataAvailable: systemStatus?.data_providers?.live_feeds_active || false
    };
}

// Strategy Lab AI Component
function StrategyLabAI({ strategy, onAnalysisComplete }) {
    const { aiService, isAIAvailable } = useAIIntegration();
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const analyzeStrategy = async () => {
        if (!isAIAvailable) {
            alert('AI system not available. Check backend connection.');
            return;
        }

        setAnalyzing(true);
        try {
            const result = await aiService.analyzeStrategy(strategy);
            setAnalysis(result);
            if (onAnalysisComplete) {
                onAnalysisComplete(result);
            }
        } catch (error) {
            console.error('Strategy analysis failed:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="strategy-lab-ai">
            <div className="ai-status">
                <span className={`status-indicator ${isAIAvailable ? 'active' : 'inactive'}`}>
                    🤖 AI Ensemble {isAIAvailable ? 'Active' : 'Inactive'}
                </span>
            </div>
            
            <button 
                onClick={analyzeStrategy}
                disabled={!isAIAvailable || analyzing}
                className="ai-analyze-btn"
            >
                {analyzing ? '🔄 Analyzing...' : '🧠 Analyze with AI'}
            </button>

            {analysis && (
                <div className="ai-analysis-result">
                    <h3>🎯 AI Analysis Result</h3>
                    <div className="analysis-content">
                        {analysis.ai_analysis || 'Analysis completed'}
                    </div>
                    {analysis.total_cost && (
                        <div className="analysis-cost">
                            💰 Cost: ${analysis.total_cost.toFixed(4)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Live Market Data Component
function LiveMarketData({ symbol }) {
    const { aiService, isLiveDataAvailable } = useAIIntegration();
    const [marketData, setMarketData] = useState(null);
    const [aiAnalysis, setAIAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadLiveData = async () => {
        setLoading(true);
        try {
            // Get live market data
            const data = await aiService.getLiveData(symbol);
            setMarketData(data);

            // Get AI analysis
            const analysis = await aiService.getAIAnalysis(symbol);
            setAIAnalysis(analysis);
        } catch (error) {
            console.error('Live data error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (symbol && isLiveDataAvailable) {
            loadLiveData();
        }
    }, [symbol, isLiveDataAvailable]);

    if (!isLiveDataAvailable) {
        return <div>📡 Live data not available</div>;
    }

    return (
        <div className="live-market-data">
            <h3>📈 Live Market Data: {symbol}</h3>
            
            {loading && <div>🔄 Loading...</div>}
            
            {marketData && !marketData.error && (
                <div className="market-info">
                    <div className="price">
                        ${marketData.price?.toFixed(2)}
                        <span className={marketData.change >= 0 ? 'positive' : 'negative'}>
                            {marketData.change >= 0 ? '+' : ''}{marketData.change?.toFixed(2)} 
                            ({(marketData.change_percent * 100)?.toFixed(2)}%)
                        </span>
                    </div>
                    <div className="volume">Volume: {marketData.volume?.toLocaleString()}</div>
                    <div className="timestamp">Updated: {new Date(marketData.timestamp).toLocaleTimeString()}</div>
                </div>
            )}

            {aiAnalysis && !aiAnalysis.error && (
                <div className="ai-recommendation">
                    <h4>🤖 AI Recommendation</h4>
                    <div className="consensus">
                        {aiAnalysis.consensus?.source}: {aiAnalysis.consensus?.confidence && 
                            `${(aiAnalysis.consensus.confidence * 100).toFixed(0)}% confidence`}
                    </div>
                    <div className="cost">💰 Analysis cost: ${aiAnalysis.total_cost?.toFixed(4)}</div>
                </div>
            )}

            <button onClick={loadLiveData} disabled={loading}>
                🔄 Refresh Data & AI Analysis
            </button>
        </div>
    );
}

// Export for use in your React components
export {
    AIIntegrationService,
    useAIIntegration,
    StrategyLabAI,
    LiveMarketData
};

// CSS Styles (add to your stylesheet)
const aiIntegrationStyles = `
.strategy-lab-ai {
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
    background: #1a1a1a;
}

.ai-status .status-indicator {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.status-indicator.active {
    background: #0f5132;
    color: #d1e7dd;
}

.status-indicator.inactive {
    background: #842029;
    color: #f8d7da;
}

.ai-analyze-btn {
    background: #0d6efd;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 8px;
}

.ai-analyze-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.ai-analysis-result {
    margin-top: 16px;
    padding: 12px;
    background: #2d3748;
    border-radius: 4px;
}

.live-market-data {
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
    background: #1a1a1a;
}

.market-info .price {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
}

.positive { color: #22c55e; }
.negative { color: #ef4444; }

.ai-recommendation {
    margin-top: 16px;
    padding: 12px;
    background: #2d3748;
    border-radius: 4px;
}
`;

export { aiIntegrationStyles };
