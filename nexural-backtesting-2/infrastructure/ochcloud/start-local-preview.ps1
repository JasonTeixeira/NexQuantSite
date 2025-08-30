# Nexural Local Preview Startup Script
# Starts the platform on port 3090 for testing and polishing

param(
    [switch]$Clean = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host ""
    Write-Host "🚀 Nexural Local Preview Startup" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\start-local-preview.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Clean    Clean build (remove containers and volumes)" -ForegroundColor White
    Write-Host "  -Help     Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "After startup, access your platform at:" -ForegroundColor Green
    Write-Host "• Main App: http://localhost:3090" -ForegroundColor White
    Write-Host "• RabbitMQ Management: http://localhost:15673" -ForegroundColor White
    Write-Host "• Database: localhost:5434" -ForegroundColor White
    Write-Host "• Redis: localhost:6381" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "🚀 STARTING NEXURAL LOCAL PREVIEW ON PORT 3090" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Change to the correct directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if ($Clean) {
    Write-Host "🧹 Cleaning previous installation..." -ForegroundColor Yellow
    docker-compose -f docker-compose.local.yml down -v --remove-orphans
    docker system prune -f
    Write-Host "✅ Cleanup completed" -ForegroundColor Green
    Write-Host ""
}

# Check if environment file exists
if (-not (Test-Path "env.local")) {
    Write-Host "❌ Environment file 'env.local' not found!" -ForegroundColor Red
    Write-Host "Creating default environment file..." -ForegroundColor Yellow
    
    @"
# Local Development Environment
DATABASE_URL=postgresql://nexural:dev123@localhost:5434/nexural_dev
REDIS_URL=redis://localhost:6381/0
RABBITMQ_URL=amqp://nexural:dev123@localhost:5673/
JWT_SECRET=dev-jwt-secret-key-local-only
HSM_MASTER_PASSWORD=dev-hsm-master-password-local
HSM_MASTER_SALT=dev-hsm-salt-local
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3090
WORKER_CONCURRENCY=3
USE_GPU=false
"@ | Out-File -FilePath "env.local" -Encoding UTF8
    
    Write-Host "✅ Environment file created" -ForegroundColor Green
}

Write-Host "📦 Building and starting services..." -ForegroundColor Blue
Write-Host ""

# Start services
try {
    docker-compose -f docker-compose.local.yml --env-file env.local up -d --build
    
    Write-Host ""
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    
    # Wait for services to be healthy
    $maxAttempts = 30
    $attempt = 0
    
    do {
        $attempt++
        Start-Sleep 5
        
        $healthyServices = 0
        $totalServices = 4
        
        # Check PostgreSQL
        try {
            $pgResult = docker-compose -f docker-compose.local.yml exec -T postgres pg_isready -U nexural -d nexural_dev 2>$null
            if ($LASTEXITCODE -eq 0) { $healthyServices++ }
        } catch { }
        
        # Check Redis
        try {
            $redisResult = docker-compose -f docker-compose.local.yml exec -T redis redis-cli ping 2>$null
            if ($LASTEXITCODE -eq 0) { $healthyServices++ }
        } catch { }
        
        # Check RabbitMQ
        try {
            $rabbitResult = docker-compose -f docker-compose.local.yml exec -T rabbitmq rabbitmq-diagnostics -q ping 2>$null
            if ($LASTEXITCODE -eq 0) { $healthyServices++ }
        } catch { }
        
        # Check Application
        try {
            $appResult = Invoke-WebRequest -Uri "http://localhost:3090/api/health" -TimeoutSec 5 -UseBasicParsing 2>$null
            if ($appResult.StatusCode -eq 200) { $healthyServices++ }
        } catch { }
        
        Write-Host "🔍 Health Check: $healthyServices/$totalServices services ready (attempt $attempt/$maxAttempts)" -ForegroundColor White
        
        if ($healthyServices -eq $totalServices) {
            break
        }
        
    } while ($attempt -lt $maxAttempts)
    
    Write-Host ""
    
    if ($healthyServices -eq $totalServices) {
        Write-Host "🎉 ALL SERVICES READY!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 ACCESS URLS:" -ForegroundColor Cyan
        Write-Host "=================" -ForegroundColor Cyan
        Write-Host "• 🚀 Main Application:    http://localhost:3090" -ForegroundColor Green
        Write-Host "• 🐰 RabbitMQ Management: http://localhost:15673 (nexural/dev123)" -ForegroundColor Green
        Write-Host "• 🗄️ PostgreSQL:          localhost:5434 (nexural/dev123)" -ForegroundColor Green
        Write-Host "• ⚡ Redis:               localhost:6381" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 SERVICE STATUS:" -ForegroundColor Cyan
        Write-Host "==================" -ForegroundColor Cyan
        docker-compose -f docker-compose.local.yml ps
        Write-Host ""
        Write-Host "🎯 Your platform is ready for testing and polishing!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 COMMANDS:" -ForegroundColor Cyan
        Write-Host "• View logs: docker-compose -f docker-compose.local.yml logs -f" -ForegroundColor White
        Write-Host "• Stop services: docker-compose -f docker-compose.local.yml down" -ForegroundColor White
        Write-Host "• Restart: docker-compose -f docker-compose.local.yml restart" -ForegroundColor White
        Write-Host ""
        
        # Open browser automatically
        Write-Host "🌐 Opening browser..." -ForegroundColor Blue
        Start-Process "http://localhost:3090"
        
    } else {
        Write-Host "⚠️ Some services are not ready yet." -ForegroundColor Yellow
        Write-Host "Check logs with: docker-compose -f docker-compose.local.yml logs" -ForegroundColor White
        Write-Host ""
        Write-Host "Current service status:" -ForegroundColor Cyan
        docker-compose -f docker-compose.local.yml ps
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Error starting services:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "• Check Docker Desktop is running" -ForegroundColor White
    Write-Host "• Try: .\start-local-preview.ps1 -Clean" -ForegroundColor White
    Write-Host "• View logs: docker-compose -f docker-compose.local.yml logs" -ForegroundColor White
    exit 1
}

Write-Host "🚀 Local preview startup completed!" -ForegroundColor Green
Write-Host ""
