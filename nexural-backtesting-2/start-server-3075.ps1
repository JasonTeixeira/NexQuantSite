# Simple Server Startup Script for Port 3075
# Nexural Platform Local Preview

Write-Host ""
Write-Host "🚀 NEXURAL PLATFORM - PORT 3075 STARTUP" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Kill existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Show current directory
Write-Host "📁 Current Directory: $(Get-Location)" -ForegroundColor Blue

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "✅ package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ package.json NOT found - wrong directory!" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

Write-Host ""
Write-Host "🚀 Starting Next.js server on port 3075..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start server directly (not in background)
npx next dev --port 3075
