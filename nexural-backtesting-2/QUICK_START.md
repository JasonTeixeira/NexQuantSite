# ⚡ **QUICK START GUIDE**
## Get Your Trading Platform Running in 5 Minutes

---

## 🚀 **STEP 1: Start Backend Services (Terminal 1)**

```bash
# Navigate to backend directory
cd nexus-99-quantum-backend

# Install requirements (one time)
pip install fastapi uvicorn httpx pydantic yfinance pandas

# Start services one by one (for debugging)
cd services/api-gateway/src && py gateway.py &
cd ../../../services/data-service/src && py data_service.py &
cd ../../../services/auth-service/src && py auth_service.py &
cd ../../../services/portfolio-service/src && py portfolio_service.py &
cd ../../../services/ai-service/src && py ai_service.py &
```

**OR use the automated script:**
```bash
py start_all_services.py
```

---

## 🌐 **STEP 2: Start Frontend (Terminal 2)**

```bash
# Navigate to frontend directory  
cd nexus-quantum-frontend/nexus-quantum-terminal

# Install dependencies (one time)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

---

## 🔍 **STEP 3: Verify Connection**

```bash
# Check backend services
curl http://localhost:3010/health
curl http://localhost:3013/health  
curl http://localhost:3014/health

# Open frontend
# Browser: http://localhost:3000
```

---

## ✅ **EXPECTED RESULTS**

**Backend Services Running:**
- ✅ API Gateway: http://localhost:3010
- ✅ Auth Service: http://localhost:3013  
- ✅ Portfolio Service: http://localhost:3014
- ✅ Data Service: http://localhost:3012
- ✅ AI Service: http://localhost:3015
- ✅ WebSocket Service: http://localhost:3016

**Frontend Running:**
- ✅ Trading Terminal: http://localhost:3000

**Connection Test:**
- ✅ Frontend → API Gateway → Backend Services
- ✅ User can register, login, view portfolio
- ✅ Paper trading orders execute
- ✅ Real-time data streaming works

---

## 🐛 **TROUBLESHOOTING**

### **Services Won't Start**
```bash
# Check what's using ports
netstat -ano | findstr :3010
netstat -ano | findstr :3000

# Kill processes if needed
taskkill /PID [process_id] /F
```

### **Frontend Won't Connect**
```bash
# Check .env.local configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3010
NEXT_PUBLIC_WS_URL=ws://localhost:3016
```

### **Import Errors**
```bash
# Install missing packages
pip install [package_name]
npm install [package_name]
```

---

## 🎯 **CUSTOMER TESTING**

Once everything is running, test the customer workflow:

1. **Register Account**: http://localhost:3000
2. **Add Broker API Keys**: Settings → Broker Integration  
3. **Paper Trade**: Place test orders
4. **Monitor Portfolio**: Real-time P&L tracking
5. **AI Analysis**: Query the AI terminal

**This simulates exactly what your customers will experience!**
