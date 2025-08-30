#!/bin/bash

# Nexural Platform - OCHcloud Deployment Script
# Zero cloud provider dependencies - works entirely on OCHcloud infrastructure
# Version: 1.0.0

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.production.yml"
ENV_FILE="${SCRIPT_DIR}/.env.production"

# Functions
print_banner() {
    echo -e "${PURPLE}"
    echo "  ╔═══════════════════════════════════════════════════════════════╗"
    echo "  ║                  🚀 NEXURAL OCHCLOUD DEPLOY 🚀                ║"
    echo "  ║                                                               ║"
    echo "  ║    Enterprise-Grade Paper Trading Platform Deployment        ║"
    echo "  ║    • Multi-tenant SaaS Architecture                          ║"
    echo "  ║    • Zero AWS/GCP Dependencies                               ║"
    echo "  ║    • Military-Grade Security                                 ║"
    echo "  ║    • Auto-scaling & High Availability                       ║"
    echo "  ║                                                               ║"
    echo "  ╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    local missing_deps=()
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    # Check OpenSSL for certificate generation
    if ! command -v openssl &> /dev/null; then
        missing_deps+=("openssl")
    fi
    
    # Check curl for health checks
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        error "Missing required dependencies: ${missing_deps[*]}"
        error "Please install the missing dependencies and run again"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi
    
    log "✅ All prerequisites satisfied"
}

# Generate environment file
generate_env_file() {
    log "📝 Generating environment configuration..."
    
    if [ -f "$ENV_FILE" ]; then
        warn "Environment file already exists: $ENV_FILE"
        read -p "Do you want to regenerate it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Using existing environment file"
            return
        fi
    fi
    
    # Generate secure random passwords
    local postgres_password=$(openssl rand -base64 32)
    local postgres_replication_password=$(openssl rand -base64 32)
    local redis_password=$(openssl rand -base64 32)
    local rabbitmq_password=$(openssl rand -base64 32)
    local rabbitmq_cookie=$(openssl rand -base64 32)
    local jwt_secret=$(openssl rand -base64 64)
    local hsm_master_password=$(openssl rand -base64 64)
    local hsm_master_salt=$(openssl rand -hex 32)
    local grafana_password=$(openssl rand -base64 16)
    
    cat > "$ENV_FILE" << EOF
# Nexural OCHcloud Production Environment
# Generated on: $(date '+%Y-%m-%d %H:%M:%S')

# Database Configuration
POSTGRES_DB=nexural_production
POSTGRES_USER=nexural_admin
POSTGRES_PASSWORD=${postgres_password}
POSTGRES_REPLICATION_USER=replicator
POSTGRES_REPLICATION_PASSWORD=${postgres_replication_password}

# Redis Configuration
REDIS_PASSWORD=${redis_password}

# Message Queue Configuration
RABBITMQ_USER=nexural_mq
RABBITMQ_PASSWORD=${rabbitmq_password}
RABBITMQ_ERLANG_COOKIE=${rabbitmq_cookie}

# Application Security
JWT_SECRET=${jwt_secret}
HSM_MASTER_PASSWORD=${hsm_master_password}
HSM_MASTER_SALT=${hsm_master_salt}

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=${grafana_password}

# Performance Settings
WORKER_CONCURRENCY=10
USE_GPU=false

# Environment
NODE_ENV=production
DEPLOYMENT_ENV=${DEPLOYMENT_ENV}
EOF
    
    chmod 600 "$ENV_FILE"
    log "✅ Environment file generated: $ENV_FILE"
}

# Generate SSL certificates
generate_ssl_certificates() {
    log "🔐 Generating SSL certificates..."
    
    local ssl_dir="${SCRIPT_DIR}/nginx/ssl"
    mkdir -p "$ssl_dir"
    
    if [ -f "${ssl_dir}/nexural.crt" ] && [ -f "${ssl_dir}/nexural.key" ]; then
        warn "SSL certificates already exist"
        read -p "Do you want to regenerate them? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Using existing SSL certificates"
            return
        fi
    fi
    
    # Generate private key
    openssl genrsa -out "${ssl_dir}/nexural.key" 4096
    
    # Generate certificate signing request
    openssl req -new -key "${ssl_dir}/nexural.key" -out "${ssl_dir}/nexural.csr" -subj "/C=US/ST=State/L=City/O=Nexural/CN=nexural.ochcloud.com/subjectAltName=DNS:*.nexural.ochcloud.com,DNS:monitor.nexural.ochcloud.com"
    
    # Generate self-signed certificate (replace with real certificate in production)
    openssl x509 -req -days 365 -in "${ssl_dir}/nexural.csr" -signkey "${ssl_dir}/nexural.key" -out "${ssl_dir}/nexural.crt" -extensions v3_req -config <(
cat << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Nexural
CN = nexural.ochcloud.com

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = nexural.ochcloud.com
DNS.2 = *.nexural.ochcloud.com
DNS.3 = monitor.nexural.ochcloud.com
EOF
    )
    
    # Set permissions
    chmod 600 "${ssl_dir}/nexural.key"
    chmod 644 "${ssl_dir}/nexural.crt"
    
    # Clean up CSR
    rm -f "${ssl_dir}/nexural.csr"
    
    log "✅ SSL certificates generated (self-signed for development)"
    warn "⚠️  Replace with proper certificates from a CA for production use"
}

# Create configuration files
create_config_files() {
    log "⚙️ Creating configuration files..."
    
    # PostgreSQL configuration
    local postgres_dir="${SCRIPT_DIR}/postgresql"
    mkdir -p "$postgres_dir"
    
    # PostgreSQL main configuration
    cat > "${postgres_dir}/postgresql.conf" << 'EOF'
# PostgreSQL Configuration for High Performance
listen_addresses = '*'
port = 5432
max_connections = 200
shared_buffers = 512MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB

# Replication settings
wal_level = replica
hot_standby = on
max_wal_senders = 10
max_replication_slots = 10
hot_standby_feedback = on

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_file_mode = 0600
log_truncate_on_rotation = on
log_rotation_age = 1d
log_rotation_size = 10MB
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_lock_waits = on
log_statement = 'ddl'
log_temp_files = 0

# Autovacuum
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 20s
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
EOF
    
    # PostgreSQL authentication
    cat > "${postgres_dir}/pg_hba.conf" << 'EOF'
# PostgreSQL Client Authentication Configuration
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
host    all             all             172.20.0.0/16           md5
host    replication     replicator      172.20.0.0/16           md5
EOF
    
    # Replication setup script
    cat > "${postgres_dir}/setup-replication.sh" << 'EOF'
#!/bin/bash
set -e

# Create replication user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER ${POSTGRES_REPLICATION_USER} REPLICATION LOGIN ENCRYPTED PASSWORD '${POSTGRES_REPLICATION_PASSWORD}';
EOSQL

echo "Replication user created successfully"
EOF
    chmod +x "${postgres_dir}/setup-replication.sh"
    
    # Redis configurations
    local redis_dir="${SCRIPT_DIR}/redis"
    mkdir -p "$redis_dir"
    
    cat > "${redis_dir}/redis-master.conf" << 'EOF'
# Redis Master Configuration
bind 0.0.0.0
port 6379
timeout 300
tcp-keepalive 60
tcp-backlog 511
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data
replica-serve-stale-data yes
replica-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
replica-priority 100
maxmemory 1gb
maxmemory-policy allkeys-lru
lazyfree-lazy-eviction no
lazyfree-lazy-expire no
lazyfree-lazy-server-del no
replica-lazy-flush no
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
aof-use-rdb-preamble yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 0
notify-keyspace-events ""
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
list-compress-depth 0
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
stream-node-max-bytes 4096
stream-node-max-entries 100
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
dynamic-hz yes
aof-rewrite-incremental-fsync yes
rdb-save-incremental-fsync yes
EOF
    
    cat > "${redis_dir}/redis-replica.conf" << 'EOF'
# Redis Replica Configuration
include /usr/local/etc/redis/redis-master.conf
replica-read-only yes
EOF
    
    # RabbitMQ configuration
    local rabbitmq_dir="${SCRIPT_DIR}/rabbitmq"
    mkdir -p "$rabbitmq_dir"
    
    cat > "${rabbitmq_dir}/rabbitmq.conf" << 'EOF'
# RabbitMQ Configuration
listeners.tcp.default = 5672
management.tcp.port = 15672
management.tcp.ip = 0.0.0.0
loopback_users.guest = false
default_vhost = /
default_user = nexural_mq
default_permissions.configure = .*
default_permissions.read = .*
default_permissions.write = .*
disk_free_limit.absolute = 1GB
vm_memory_calculation_strategy = rss
vm_memory_high_watermark.relative = 0.6
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config
EOF
    
    cat > "${rabbitmq_dir}/enabled_plugins" << 'EOF'
[rabbitmq_management,rabbitmq_management_agent,rabbitmq_web_dispatch,rabbitmq_amqp1_0].
EOF
    
    log "✅ Configuration files created"
}

# Create monitoring configuration
create_monitoring_config() {
    log "📊 Creating monitoring configuration..."
    
    local monitoring_dir="${SCRIPT_DIR}/monitoring"
    mkdir -p "$monitoring_dir"
    
    # Prometheus configuration
    cat > "${monitoring_dir}/prometheus.yml" << 'EOF'
# Prometheus Configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'nexural-ochcloud'
    environment: 'production'

rule_files:
  - "alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  # cAdvisor
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  # Nexural Application
  - job_name: 'nexural-app'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['nexural-app:3000']

  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-master:6379']

  # PostgreSQL
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-primary:5432']

  # RabbitMQ
  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['rabbitmq:15692']
EOF
    
    # Alert rules
    cat > "${monitoring_dir}/alerts.yml" << 'EOF'
groups:
  - name: nexural_alerts
    rules:
      # High CPU usage
      - alert: HighCpuUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for 5 minutes"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85%"

      # High disk usage
      - alert: HighDiskUsage
        expr: (node_filesystem_size_bytes - node_filesystem_avail_bytes) / node_filesystem_size_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High disk usage detected"
          description: "Disk usage is above 80%"

      # PostgreSQL down
      - alert: PostgreSQLDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "PostgreSQL instance is not reachable"

      # Redis down
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis instance is not reachable"

      # RabbitMQ down
      - alert: RabbitMQDown
        expr: up{job="rabbitmq"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "RabbitMQ is down"
          description: "RabbitMQ instance is not reachable"

      # Application down
      - alert: NexuralAppDown
        expr: up{job="nexural-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Nexural application is down"
          description: "Main application is not responding"
EOF
    
    log "✅ Monitoring configuration created"
}

# Deploy the platform
deploy_platform() {
    log "🚀 Deploying Nexural platform..."
    
    # Pull latest images
    info "Pulling Docker images..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
    
    # Build custom images
    info "Building custom images..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --parallel
    
    # Start services
    info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    log "✅ Platform deployment initiated"
}

# Wait for services to be healthy
wait_for_services() {
    log "⏳ Waiting for services to be healthy..."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local healthy_count=0
        local total_services=0
        
        # Check database
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres-primary pg_isready -U nexural_admin -d nexural_production &>/dev/null; then
            ((healthy_count++))
        fi
        ((total_services++))
        
        # Check Redis
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T redis-master redis-cli -a "$(grep REDIS_PASSWORD "$ENV_FILE" | cut -d'=' -f2)" ping &>/dev/null; then
            ((healthy_count++))
        fi
        ((total_services++))
        
        # Check RabbitMQ
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T rabbitmq rabbitmq-diagnostics -q ping &>/dev/null; then
            ((healthy_count++))
        fi
        ((total_services++))
        
        # Check application
        if curl -sf http://localhost:3000/api/health &>/dev/null; then
            ((healthy_count++))
        fi
        ((total_services++))
        
        info "Health check: $healthy_count/$total_services services healthy (attempt $attempt/$max_attempts)"
        
        if [ $healthy_count -eq $total_services ]; then
            log "✅ All services are healthy!"
            return 0
        fi
        
        sleep 10
        ((attempt++))
    done
    
    error "Services failed to become healthy within expected time"
    return 1
}

# Show deployment status
show_status() {
    log "📋 Deployment Status"
    echo
    
    # Service status
    echo -e "${CYAN}Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
    echo
    
    # Access URLs
    echo -e "${CYAN}Access URLs:${NC}"
    echo -e "${GREEN}• Application:${NC} https://nexural.ochcloud.com"
    echo -e "${GREEN}• Monitoring:${NC} https://monitor.nexural.ochcloud.com/grafana/"
    echo -e "${GREEN}• RabbitMQ:${NC} https://monitor.nexural.ochcloud.com/rabbitmq/"
    echo -e "${GREEN}• Metrics:${NC} https://monitor.nexural.ochcloud.com/metrics"
    echo
    
    # Database info
    echo -e "${CYAN}Database Connection:${NC}"
    echo -e "${GREEN}• Primary:${NC} localhost:5432"
    echo -e "${GREEN}• Replica:${NC} localhost:5433"
    echo -e "${GREEN}• Database:${NC} nexural_production"
    echo -e "${GREEN}• User:${NC} nexural_admin"
    echo
    
    # Cache info
    echo -e "${CYAN}Redis Connection:${NC}"
    echo -e "${GREEN}• Master:${NC} localhost:6379"
    echo -e "${GREEN}• Replica:${NC} localhost:6380"
    echo
    
    # Performance metrics
    echo -e "${CYAN}Performance:${NC}"
    echo -e "${GREEN}• CPU Cores:${NC} $(docker system df | grep -c 'CONTAINER')"
    echo -e "${GREEN}• Memory Usage:${NC} $(docker system df --verbose | grep 'Total' | awk '{print $2}')"
    echo -e "${GREEN}• Disk Usage:${NC} $(docker system df | grep 'Total' | awk '{print $3}')"
    echo
    
    # Next steps
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Update DNS records to point to this server"
    echo "2. Replace self-signed certificates with proper SSL certificates"
    echo "3. Configure backup schedules for databases"
    echo "4. Set up monitoring alerts and notifications"
    echo "5. Review and update security configurations"
    echo
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        error "Deployment failed. Check the logs above for details."
        echo
        echo "To view service logs:"
        echo "docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs"
        echo
        echo "To cleanup partial deployment:"
        echo "docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down -v"
    fi
}

# Main execution
main() {
    trap cleanup EXIT
    
    print_banner
    
    check_prerequisites
    generate_env_file
    generate_ssl_certificates
    create_config_files
    create_monitoring_config
    deploy_platform
    
    if wait_for_services; then
        show_status
        log "🎉 Nexural platform deployed successfully on OCHcloud!"
    else
        error "Deployment completed but some services are not healthy"
        echo "Check logs with: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs"
        exit 1
    fi
}

# Execute main function
main "$@"
