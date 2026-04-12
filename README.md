# NexQuantSite - Integrated Trading Platform

This repository contains a comprehensive trading platform with integrated ML capabilities, desktop application, and Discord signal distribution.

## Architecture Overview

The platform consists of the following main components:

### 1. Web Application (Next.js)
- Public website with user management
- Performance dashboards
- Admin interfaces
- API endpoints for ML and trading functionality

### 2. ML Server
- Python-based machine learning infrastructure
- Model training and signal generation
- Backtesting capabilities
- Real-time data processing

### 3. Desktop Trading Application
- C#/WPF desktop application
- Subscription-based access to trading signals
- Real-time trading interface
- Connectivity to ML server

### 4. Discord Bot
- Signal distribution to Discord channels
- Performance updates
- User management and subscription tiers

## Directory Structure

```
NexQuantSite/
├── app/                    # Next.js frontend and API routes
│   └── api/                # API endpoints
│       ├── trading/        # Trading-related endpoints
│       ├── ml-gateway/     # Gateway to ML server
│       └── auth/           # Authentication endpoints
│
├── ml-server/              # ML infrastructure
│   ├── api/                # ML API endpoints
│   ├── models/             # ML models
│   ├── backtesting/        # Backtesting framework
│   └── deployment/         # Deployment configuration
│
├── desktop-app/            # Trading desktop application
│   ├── src/                # Application source code
│   ├── installer/          # Distribution packaging
│   └── api-client/         # ML server client
│
├── discord-bot/            # Discord integration
│   ├── commands/           # Bot commands
│   ├── formatters/         # Signal formatting
│   └── permissions/        # User permission management
│
├── shared/                 # Shared utilities and types
│   ├── api-schema/         # API schemas
│   ├── authentication/     # Authentication utilities
│   └── monitoring/         # System monitoring
│
└── scripts/                # Utility scripts
```

## Setup and Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- .NET Framework (v6.0+)
- Visual Studio (for desktop app development)
- SQLite database

### Environment Setup
1. Copy `.env.development` to `.env.local` and update with your credentials
2. Install dependencies:
   ```
   npm install
   cd ml-server && pip install -r requirements.txt
   ```

### Starting the Services
1. Start the web application:
   ```
   npm run dev
   ```
2. Start the ML server:
   ```
   cd ml-server && python api/server.py
   ```
3. Start the Discord bot:
   ```
   cd discord-bot && npm run start
   ```
4. Build the desktop app:
   ```
   cd desktop-app && dotnet build
   ```

## Communication Flow

The components communicate through a series of API endpoints:

1. **ML Server → Web App**:
   - Performance metrics and strategy data
   - System status updates

2. **Web App → ML Server**:
   - User authentication and subscription status
   - Strategy configuration

3. **Desktop App → ML Server**:
   - Signal subscription and configuration
   - Authentication verification

4. **ML Server → Discord Bot**:
   - Signal distribution to channels
   - Performance updates

## Authentication and Security

The platform uses a unified authentication system:

1. Web application authentication via NextAuth
2. Desktop app authentication through token-based system
3. Discord permissions managed through bot roles
4. API gateway with permission validation

## Deployment

For production deployment, follow these steps:

1. Build the web application:
   ```
   npm run build
   ```
2. Package the ML server:
   ```
   cd ml-server && python setup.py bdist_wheel
   ```
3. Build the desktop app installer:
   ```
   cd desktop-app && dotnet publish -c Release
   ```
4. Deploy the Discord bot to a hosting service

## Testing

Run the integration tests to verify the system is working correctly:

```
npm run test:integration
```

## License

This project is proprietary software. All rights reserved.
