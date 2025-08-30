# 🚀 QUICK START GUIDE - GET NEXURAL RUNNING ON PORT 3075

## **PROBLEM IDENTIFIED:**
The npm commands are running from the wrong directory, causing "package.json not found" errors.

## **🔧 IMMEDIATE SOLUTIONS:**

### **OPTION 1: Use the Batch File**
1. Double-click `start-3075-simple.bat`
2. It will automatically:
   - Navigate to correct directory
   - Kill existing processes  
   - Start server on port 3075

### **OPTION 2: Manual Steps**
Open PowerShell and run these commands **exactly**:

```powershell
# Step 1: Navigate to correct directory
cd "C:\Users\Jason\OneDrive\Desktop\Nexural Backtesting\nexus-quantum-frontend\nexus-quantum-terminal"

# Step 2: Verify you're in right place
Get-ChildItem package.json

# Step 3: Kill any running node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Step 4: Start the server
npm run dev -- --port 3075
```

### **OPTION 3: Using npx directly**
```powershell
cd "C:\Users\Jason\OneDrive\Desktop\Nexural Backtesting\nexus-quantum-frontend\nexus-quantum-terminal"
npx next dev --port 3075
```

## **🎯 WHAT TO EXPECT:**
- Server should show "Ready - started server on 0.0.0.0:3075"  
- Browser should work at http://localhost:3075
- You should see your Nexural platform interface

## **🚨 IF STILL NOT WORKING:**
1. Check if port 3075 is blocked by firewall
2. Try a different port: `--port 3076` or `--port 3080`
3. Make sure Node.js version is 18+ (`node --version`)

## **📱 NEXT STEPS ONCE RUNNING:**
1. Test the main interface
2. Check mobile responsiveness  
3. Test paper trading features
4. Polish any UI elements you want to improve
