-- 🗄️ NEXUS QUANTUM TERMINAL - PRODUCTION DATABASE SCHEMA
-- World-class database design for institutional trading platform

-- ============================================================================
-- USER MANAGEMENT & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'trader',
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    api_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PORTFOLIO & POSITIONS
-- ============================================================================

CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    initial_capital DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2),
    cash_balance DECIMAL(15,2),
    total_pnl DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    asset_type VARCHAR(20) DEFAULT 'stock',
    quantity DECIMAL(15,8) NOT NULL,
    avg_price DECIMAL(15,4),
    current_price DECIMAL(15,4),
    market_value DECIMAL(15,2),
    unrealized_pnl DECIMAL(15,2),
    realized_pnl DECIMAL(15,2) DEFAULT 0,
    opened_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(portfolio_id, symbol)
);

-- ============================================================================
-- TRADING & ORDERS
-- ============================================================================

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
    order_type VARCHAR(20) DEFAULT 'market', -- 'market', 'limit', 'stop'
    quantity DECIMAL(15,8) NOT NULL,
    price DECIMAL(15,4),
    stop_price DECIMAL(15,4),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'filled', 'cancelled', 'rejected'
    filled_quantity DECIMAL(15,8) DEFAULT 0,
    avg_fill_price DECIMAL(15,4),
    commission DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    filled_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    order_data JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity DECIMAL(15,8) NOT NULL,
    price DECIMAL(15,4) NOT NULL,
    commission DECIMAL(10,2) DEFAULT 0,
    trade_value DECIMAL(15,2) GENERATED ALWAYS AS (quantity * price) STORED,
    executed_at TIMESTAMP DEFAULT NOW(),
    trade_data JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- STRATEGIES & BACKTESTS
-- ============================================================================

CREATE TABLE strategies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy_type VARCHAR(50),
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    code TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    performance_metrics JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE backtests (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER REFERENCES strategies(id) ON DELETE CASCADE,
    name VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital DECIMAL(15,2) NOT NULL,
    final_value DECIMAL(15,2),
    total_return DECIMAL(8,4),
    sharpe_ratio DECIMAL(8,4),
    max_drawdown DECIMAL(8,4),
    win_rate DECIMAL(8,4),
    total_trades INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    results JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'running', 'completed', 'failed'
);

-- ============================================================================
-- MARKET DATA & TIME SERIES
-- ============================================================================

CREATE TABLE market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    open DECIMAL(15,4),
    high DECIMAL(15,4),
    low DECIMAL(15,4),
    close DECIMAL(15,4),
    volume BIGINT,
    adjusted_close DECIMAL(15,4),
    data_source VARCHAR(50) DEFAULT 'yahoo',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(symbol, timestamp, data_source)
);

-- Convert to hypertable for time-series optimization (TimescaleDB)
-- SELECT create_hypertable('market_data', 'timestamp');

CREATE TABLE indicators (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    indicator_type VARCHAR(50) NOT NULL, -- 'rsi', 'macd', 'sma', etc.
    value DECIMAL(15,8),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(symbol, timestamp, indicator_type)
);

-- ============================================================================
-- AI/ML MODELS & PREDICTIONS
-- ============================================================================

CREATE TABLE ml_models (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'xgboost', 'lstm', 'catboost'
    parameters JSONB DEFAULT '{}'::jsonb,
    training_data JSONB,
    model_binary BYTEA, -- Serialized model
    accuracy DECIMAL(8,4),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES ml_models(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    prediction_type VARCHAR(50), -- 'price', 'direction', 'volatility'
    predicted_value DECIMAL(15,8),
    confidence DECIMAL(5,4),
    prediction_horizon VARCHAR(20), -- '1d', '1w', '1m'
    created_at TIMESTAMP DEFAULT NOW(),
    actual_value DECIMAL(15,8), -- For backtesting accuracy
    actual_date TIMESTAMP
);

-- ============================================================================
-- RISK MANAGEMENT
-- ============================================================================

CREATE TABLE risk_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    limit_type VARCHAR(50) NOT NULL, -- 'position_size', 'daily_loss', 'var'
    limit_value DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2),
    is_breached BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE risk_metrics (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL,
    var_95 DECIMAL(15,2), -- Value at Risk 95%
    var_99 DECIMAL(15,2), -- Value at Risk 99%
    expected_shortfall DECIMAL(15,2),
    beta DECIMAL(8,4),
    correlation_spy DECIMAL(8,4),
    volatility DECIMAL(8,4),
    sharpe_ratio DECIMAL(8,4),
    max_drawdown DECIMAL(8,4),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(portfolio_id, calculation_date)
);

-- ============================================================================
-- AUDIT & COMPLIANCE
-- ============================================================================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE compliance_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data JSONB NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    file_path VARCHAR(500)
);

-- ============================================================================
-- PERFORMANCE & SYSTEM
-- ============================================================================

CREATE TABLE system_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(15,4),
    unit VARCHAR(20),
    tags JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User & Session indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key ON users(api_key);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Portfolio & Position indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_positions_portfolio_id ON positions(portfolio_id);
CREATE INDEX idx_positions_symbol ON positions(symbol);

-- Trading indexes
CREATE INDEX idx_orders_portfolio_id ON orders(portfolio_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_trades_portfolio_id ON trades(portfolio_id);
CREATE INDEX idx_trades_executed_at ON trades(executed_at);

-- Strategy indexes
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_backtests_strategy_id ON backtests(strategy_id);
CREATE INDEX idx_backtests_created_at ON backtests(created_at);

-- Market Data indexes (critical for performance)
CREATE INDEX idx_market_data_symbol_timestamp ON market_data(symbol, timestamp DESC);
CREATE INDEX idx_market_data_timestamp ON market_data(timestamp DESC);
CREATE INDEX idx_indicators_symbol_type_timestamp ON indicators(symbol, indicator_type, timestamp DESC);

-- AI/ML indexes
CREATE INDEX idx_ml_models_user_id ON ml_models(user_id);
CREATE INDEX idx_predictions_model_id ON predictions(model_id);
CREATE INDEX idx_predictions_symbol ON predictions(symbol);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);

-- Risk indexes
CREATE INDEX idx_risk_limits_portfolio_id ON risk_limits(portfolio_id);
CREATE INDEX idx_risk_metrics_portfolio_date ON risk_metrics(portfolio_id, calculation_date);

-- Audit indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp);

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- ============================================================================

-- Insert demo user
INSERT INTO users (email, password_hash, full_name, role, subscription_tier) 
VALUES ('demo@nexusquant.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD6d2JQNVhb5mCKe', 'Demo User', 'trader', 'pro');

-- Insert demo portfolio
INSERT INTO portfolios (user_id, name, initial_capital, current_value, cash_balance) 
VALUES (1, 'Demo Portfolio', 100000.00, 125340.50, 23450.75);

-- Insert demo positions
INSERT INTO positions (portfolio_id, symbol, quantity, avg_price, current_price, market_value, unrealized_pnl)
VALUES 
(1, 'AAPL', 100, 175.50, 185.20, 18520.00, 970.00),
(1, 'MSFT', 50, 380.25, 395.80, 19790.00, 777.50),
(1, 'GOOGL', 25, 140.80, 143.22, 3580.50, 60.50);

-- Success message
SELECT 'Nexus Quantum Database Schema Created Successfully! 🚀' AS status;
