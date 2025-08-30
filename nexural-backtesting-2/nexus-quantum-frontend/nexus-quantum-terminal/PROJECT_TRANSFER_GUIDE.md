# 📦 **PROJECT TRANSFER & SETUP GUIDE**

## **🚀 QUICK TRANSFER TO DESKTOP**

### **Option 1: Using Terminal (Recommended)**
```bash
# Run this command from your current project directory:
cp -r . ~/Desktop/nexus-quantum-terminal-complete

# Or if you want to create a zip file:
zip -r ~/Desktop/nexus-quantum-terminal.zip . -x "node_modules/*" ".next/*" ".git/*"
```

### **Option 2: Manual Transfer**
1. Open Finder
2. Navigate to: `/Users/Sage/Downloads/quant-terminal (6)`
3. Select all files (Cmd+A)
4. Copy (Cmd+C)
5. Go to Desktop
6. Create new folder: "nexus-quantum-terminal"
7. Paste (Cmd+V)

---

## **📋 PROJECT CONTENTS CHECKLIST**

### **Essential Files to Transfer:**
```
✅ /app                    - Next.js app directory
✅ /components             - All UI components
✅ /lib                    - Utilities and AI engines
✅ /hooks                  - Custom React hooks
✅ /public                 - Static assets
✅ /__tests__              - Test files
✅ package.json            - Dependencies
✅ package-lock.json       - Lock file
✅ tsconfig.json           - TypeScript config
✅ tailwind.config.js      - Tailwind config
✅ next.config.js          - Next.js config
✅ .env.local.example      - Environment template
✅ BACKEND_INTEGRATION_SPECS.md - Backend specs
✅ WORLD_CLASS_AUDIT_REPORT.md  - Audit report
✅ PROJECT_TRANSFER_GUIDE.md    - This file
```

### **Optional (Can Skip):**
```
⚠️ /node_modules          - Will reinstall (900MB+)
⚠️ /.next                 - Build cache (can regenerate)
⚠️ /.git                  - Git history (if not needed)
⚠️ /coverage              - Test coverage reports
```

---

## **🔧 SETTING UP ON NEW MACHINE**

### **Prerequisites on Backend Machine:**
- Node.js 18+ installed
- npm or yarn installed
- Git (optional)
- 8GB+ RAM recommended
- 10GB+ free disk space

### **Step 1: Transfer Files**
```bash
# On current machine - Create archive:
cd /Users/Sage/Downloads/quant-terminal\ \(6\)
tar -czf nexus-frontend.tar.gz --exclude=node_modules --exclude=.next .

# Transfer to backend machine via:
# - USB drive
# - Network transfer (scp)
# - Cloud storage (Google Drive, Dropbox)
# - GitHub (if you have a repo)
```

### **Step 2: Extract on Backend Machine**
```bash
# On backend machine:
cd ~/Desktop
tar -xzf nexus-frontend.tar.gz
cd nexus-quantum-terminal
```

### **Step 3: Install Dependencies**
```bash
# Install all dependencies:
npm install

# If you're adding the AI packages:
npm install openai @anthropic-ai/sdk @catboost/catboost \
           polygon-io alpaca-trade-api @supabase/supabase-js
```

### **Step 4: Configure Environment**
```bash
# Create .env.local file:
cp .env.local.example .env.local

# Edit with your backend URL:
nano .env.local
```

Add these values:
```env
# Backend Connection (CHANGE THESE!)
NEXT_PUBLIC_BACKEND_URL=http://YOUR_BACKEND_IP:8000
NEXT_PUBLIC_WS_URL=ws://YOUR_BACKEND_IP:8000
NEXT_PUBLIC_API_VERSION=v1

# If your backend is on same machine:
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### **Step 5: Connect to Backend**
```bash
# Test backend connection:
curl http://YOUR_BACKEND_IP:8000/api/health

# If successful, start frontend:
npm run dev

# Access at:
http://localhost:3025
```

---

## **🔌 BACKEND CONNECTION FILES TO MODIFY**

### **1. Create API Client** 
Create `lib/api-client.ts`:
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export class APIClient {
  async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })
    return response.json()
  }
}

export const apiClient = new APIClient()
```

### **2. Update Terminal AI**
In `components/nexus-quant-terminal.tsx`, line ~2424:
```typescript
// Replace mock processAICommand with:
import { apiClient } from '@/lib/api-client'

const processAICommand = useCallback(async (command: string) => {
  const response = await apiClient.request('/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({ query: command })
  })
  return response.analysis
}, [])
```

### **3. Switch Data Adapter**
In `lib/data-adapters.ts`, line ~399:
```typescript
// Change from:
this.adapter = new MockDataAdapter()

// To:
this.adapter = new RealDataAdapter() // You'll need to implement this
```

---

## **📡 NETWORK CONFIGURATION**

### **If Frontend and Backend on Same Machine:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### **If Frontend and Backend on Different Machines (Same Network):**
```env
# Use local IP of backend machine
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
NEXT_PUBLIC_WS_URL=ws://192.168.1.100:8000
```

### **If Using Cloud/Production:**
```env
NEXT_PUBLIC_BACKEND_URL=https://api.yourplatform.com
NEXT_PUBLIC_WS_URL=wss://api.yourplatform.com
```

### **CORS Configuration (Backend Must Allow Frontend)**
```javascript
// Your backend should have:
app.use(cors({
  origin: ['http://localhost:3025', 'https://yourfrontend.com'],
  credentials: true
}))
```

---

## **🧪 TESTING THE CONNECTION**

### **Quick Test Script**
Create `test-backend.js`:
```javascript
const BACKEND_URL = 'http://localhost:8000' // Change this

async function testBackend() {
  console.log('Testing backend connection...')
  
  try {
    // 1. Test health endpoint
    const health = await fetch(`${BACKEND_URL}/api/health`)
    console.log('✅ Health check:', health.ok ? 'Connected' : 'Failed')
    
    // 2. Test auth endpoint
    const auth = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    })
    console.log('✅ Auth endpoint:', auth.ok ? 'Working' : 'Failed')
    
    // 3. Test WebSocket
    const ws = new WebSocket(`ws://localhost:8000/api/ws`)
    ws.onopen = () => {
      console.log('✅ WebSocket: Connected')
      ws.close()
    }
    ws.onerror = () => {
      console.log('❌ WebSocket: Failed')
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

testBackend()
```

Run with: `node test-backend.js`

---

## **🐛 TROUBLESHOOTING**

### **Issue: "Cannot connect to backend"**
```bash
# Check if backend is running:
curl http://localhost:8000/api/health

# Check firewall:
sudo ufw status  # Linux
sudo pfctl -s info  # macOS

# Check if ports are open:
netstat -an | grep 8000
```

### **Issue: "CORS errors"**
```javascript
// Backend needs to allow frontend origin:
app.use(cors({
  origin: 'http://localhost:3025',
  credentials: true
}))
```

### **Issue: "Module not found"**
```bash
# Clear cache and reinstall:
rm -rf node_modules package-lock.json
npm install
```

### **Issue: "Environment variables not loading"**
```bash
# Make sure .env.local exists:
ls -la .env.local

# Restart dev server:
npm run dev
```

---

## **📊 PROJECT STRUCTURE OVERVIEW**

```
nexus-quantum-terminal/
├── app/                      # Next.js 15 app directory
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   └── api/                 # API routes (to be created)
├── components/              # React components
│   ├── nexus-quant-terminal.tsx  # Main app (7000+ lines)
│   ├── ui/                  # UI components
│   ├── phase1/              # Phase 1 features
│   ├── phase2/              # Phase 2 features
│   ├── phase3/              # Phase 3 features
│   └── phase4/              # Phase 4 features
├── lib/                     # Utilities & logic
│   ├── ai/                  # AI engines (not connected yet)
│   │   ├── world-class-ai-engine.ts
│   │   ├── cutting-edge-ensemble.ts
│   │   ├── api-integrations.ts
│   │   └── terminal-ai-integration.ts
│   ├── data-adapters.ts    # Data layer (using mock)
│   ├── utils.ts             # Utilities
│   └── validation.ts        # Validation logic
├── hooks/                   # Custom React hooks
├── public/                  # Static assets
├── __tests__/              # Test files
├── styles/                 # CSS files
└── [Config Files]          # package.json, etc.
```

---

## **💾 SIZE ESTIMATES**

### **Project Size (Without node_modules):**
- **Source Code:** ~5MB
- **Documentation:** ~1MB
- **Config Files:** ~100KB
- **Total Transfer Size:** ~6MB compressed

### **After Installation (With node_modules):**
- **node_modules:** ~900MB
- **Total Size:** ~906MB

### **With AI Packages Added:**
- **Additional:** ~500MB
- **Total Size:** ~1.4GB

---

## **🚨 CRITICAL REMINDERS**

### **Before Transfer:**
1. **Save any unsaved work**
2. **Note current Node version:** `node --version`
3. **Export any browser localStorage data if needed**

### **After Transfer:**
1. **Update all backend URLs in .env.local**
2. **Test backend connection before development**
3. **Install exact Node version if different**

### **Security:**
1. **Never commit .env.local to git**
2. **Keep API keys on backend only**
3. **Use HTTPS in production**

---

## **📞 CONNECTION REQUIREMENTS SUMMARY**

Your backend must provide these endpoints for the frontend to work:

### **Minimum Required (MVP):**
- `GET /api/health` - Health check
- `POST /api/auth/login` - Authentication
- `GET /api/portfolio` - Portfolio data
- `GET /api/market/quote/:symbol` - Market quotes
- `POST /api/ai/analyze` - AI processing

### **Full Feature Set:**
- All endpoints in `BACKEND_INTEGRATION_SPECS.md`
- WebSocket server for real-time data
- PostgreSQL database
- Redis cache
- AI model serving

---

## **✅ FINAL CHECKLIST**

Before starting on new machine:
- [ ] Files transferred successfully
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] .env.local configured with backend URL
- [ ] Backend is running and accessible
- [ ] Test connection with curl or test script
- [ ] CORS configured on backend
- [ ] Can access http://localhost:3025

---

**Document Version:** 1.0.0
**Last Updated:** January 2024
**Support:** Check BACKEND_INTEGRATION_SPECS.md for detailed API specifications
