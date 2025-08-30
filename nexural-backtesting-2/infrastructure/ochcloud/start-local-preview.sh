#!/bin/bash

# Nexural Local Preview Startup Script
# Starts the platform on port 3090 for testing and polishing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
}

# Help function
show_help() {
    echo ""
    echo -e "${CYAN}🚀 Nexural Local Preview Startup${NC}"
    echo ""
    echo "Usage: ./start-local-preview.sh [options]"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --clean   Clean build (remove containers and volumes)"
    echo "  --help    Show this help message"
    echo ""
    echo -e "${GREEN}After startup, access your platform at:${NC}"
    echo "• Main App: http://localhost:3090"
    echo "• RabbitMQ Management: http://localhost:15673"
    echo "• Database: localhost:5434"
    echo "• Redis: localhost:6381"
    echo ""
    exit 0
}

# Parse arguments
CLEAN_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_BUILD=true
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            error "Unknown option: $1"
            show_help
            ;;
    esac
done

echo ""
echo -e "${CYAN}🚀 STARTING NEXURAL LOCAL PREVIEW ON PORT 3090${NC}"
echo -e "${CYAN}=====================================================${NC}"
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
    exit 1
fi

log "✅ Docker is running"

# Change to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ "$CLEAN_BUILD" = true ]; then
    warn "🧹 Cleaning previous installation..."
    docker-compose -f docker-compose.local.yml down -v --remove-orphans
    docker system prune -f
    log "✅ Cleanup completed"
    echo ""
fi

# Check if environment file exists
if [ ! -f "env.local" ]; then
    error "Environment file 'env.local' not found!"
    warn "Creating default environment file..."
    
    cat > env.local << 'EOF'
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
EOF
    
    log "✅ Environment file created"
fi

info "📦 Building and starting services..."
echo ""

# Start services
docker-compose -f docker-compose.local.yml --env-file env.local up -d --build

echo ""
warn "⏳ Waiting for services to be ready..."

# Wait for services to be healthy
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    ((attempt++))
    sleep 5
    
    healthy_services=0
    total_services=4
    
    # Check PostgreSQL
    if docker-compose -f docker-compose.local.yml exec -T postgres pg_isready -U nexural -d nexural_dev >/dev/null 2>&1; then
        ((healthy_services++))
    fi
    
    # Check Redis
    if docker-compose -f docker-compose.local.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
        ((healthy_services++))
    fi
    
    # Check RabbitMQ
    if docker-compose -f docker-compose.local.yml exec -T rabbitmq rabbitmq-diagnostics -q ping >/dev/null 2>&1; then
        ((healthy_services++))
    fi
    
    # Check Application
    if curl -sf http://localhost:3090/api/health >/dev/null 2>&1; then
        ((healthy_services++))
    fi
    
    info "🔍 Health Check: $healthy_services/$total_services services ready (attempt $attempt/$max_attempts)"
    
    if [ $healthy_services -eq $total_services ]; then
        break
    fi
done

echo ""

if [ $healthy_services -eq $total_services ]; then
    log "🎉 ALL SERVICES READY!"
    echo ""
    echo -e "${CYAN}🌐 ACCESS URLS:${NC}"
    echo -e "${CYAN}=================${NC}"
    echo -e "${GREEN}• 🚀 Main Application:    http://localhost:3090${NC}"
    echo -e "${GREEN}• 🐰 RabbitMQ Management: http://localhost:15673 (nexural/dev123)${NC}"
    echo -e "${GREEN}• 🗄️ PostgreSQL:          localhost:5434 (nexural/dev123)${NC}"
    echo -e "${GREEN}• ⚡ Redis:               localhost:6381${NC}"
    echo ""
    echo -e "${CYAN}📊 SERVICE STATUS:${NC}"
    echo -e "${CYAN}==================${NC}"
    docker-compose -f docker-compose.local.yml ps
    echo ""
    echo -e "${YELLOW}🎯 Your platform is ready for testing and polishing!${NC}"
    echo ""
    echo -e "${CYAN}💡 COMMANDS:${NC}"
    echo "• View logs: docker-compose -f docker-compose.local.yml logs -f"
    echo "• Stop services: docker-compose -f docker-compose.local.yml down"
    echo "• Restart: docker-compose -f docker-compose.local.yml restart"
    echo ""
    
    # Try to open browser (Linux)
    if command -v xdg-open >/dev/null 2>&1; then
        info "🌐 Opening browser..."
        xdg-open http://localhost:3090 >/dev/null 2>&1 &
    fi
    
else
    warn "⚠️ Some services are not ready yet."
    echo "Check logs with: docker-compose -f docker-compose.local.yml logs"
    echo ""
    echo -e "${CYAN}Current service status:${NC}"
    docker-compose -f docker-compose.local.yml ps
fi

log "🚀 Local preview startup completed!"
echo ""
