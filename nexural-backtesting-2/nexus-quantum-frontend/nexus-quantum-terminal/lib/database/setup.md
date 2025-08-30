# 🗄️ DATABASE SETUP GUIDE

## Required Dependencies

Add these to your package.json:

```bash
npm install pg @types/pg ioredis @types/ioredis
npm install bcryptjs jsonwebtoken @types/jsonwebtoken
npm install dotenv
```

## Environment Variables

Create `.env.local` with:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=nexus_quantum
DATABASE_USER=nexus_user
DATABASE_PASSWORD=secure_password
DATABASE_POOL_SIZE=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# AI APIs
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Security
JWT_SECRET=your_super_secret_jwt_key
```

## Database Setup Commands

1. **Install PostgreSQL:**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows - Download from https://postgresql.org
```

2. **Create Database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create user and database
CREATE USER nexus_user WITH PASSWORD 'secure_password';
CREATE DATABASE nexus_quantum OWNER nexus_user;
GRANT ALL PRIVILEGES ON DATABASE nexus_quantum TO nexus_user;

# Exit PostgreSQL
\q
```

3. **Run Schema:**
```bash
# Apply the schema
psql -U nexus_user -d nexus_quantum -f lib/database/schema.sql
```

4. **Install Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian  
sudo apt-get install redis-server
sudo systemctl start redis

# Windows - Download from GitHub releases
```

## Production Setup (TimescaleDB for Performance)

For 25k+ users, use TimescaleDB for time-series optimization:

```bash
# Install TimescaleDB extension
sudo apt-get install timescaledb-postgresql-14

# Connect and enable
psql -U nexus_user -d nexus_quantum
CREATE EXTENSION IF NOT EXISTS timescaledb;

# Convert market_data to hypertable
SELECT create_hypertable('market_data', 'timestamp');
```

## Docker Setup (Alternative)

Use Docker for easy setup:

```bash
# Create docker-compose.yml
version: '3.8'
services:
  postgres:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_DB: nexus_quantum
      POSTGRES_USER: nexus_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./lib/database/schema.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:

# Start services
docker-compose up -d
```

## Usage in Code

```typescript
import { db } from '@/lib/database/database'

// Get user data
const user = await db.getUserById(1)

// Get portfolio positions
const positions = await db.getPortfolioPositions(1)

// Record a trade
const trade = await db.recordTrade({
  portfolio_id: 1,
  symbol: 'AAPL',
  side: 'buy',
  quantity: 100,
  price: 185.50
})
```

## Performance Optimization

The database includes:
- ✅ Connection pooling (20 connections)
- ✅ Redis caching with TTL
- ✅ Proper indexes on all queries
- ✅ Prepared statements for security
- ✅ Transaction support for trades
- ✅ Time-series optimization ready

This setup can handle **25,000+ users** with proper server resources.
