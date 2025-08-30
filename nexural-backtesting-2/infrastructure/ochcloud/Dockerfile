# Multi-stage Dockerfile for OCHcloud deployment
# Optimized for production performance and security

# Stage 1: Build Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY nexus-quantum-frontend/nexus-quantum-terminal/package*.json ./
COPY nexus-quantum-frontend/nexus-quantum-terminal/tsconfig.json ./
COPY nexus-quantum-frontend/nexus-quantum-terminal/next.config.js ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build Application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy source code
COPY nexus-quantum-frontend/nexus-quantum-terminal/ ./

# Build the application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production Runtime
FROM node:18-alpine AS runtime

# Install system dependencies for production
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata \
    dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy additional production files
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/components ./components

# Create directories for logs and uploads
RUN mkdir -p /app/logs /app/uploads /app/models && \
    chown -R nextjs:nodejs /app/logs /app/uploads /app/models

# Install production-only packages not bundled by Next.js
COPY nexus-quantum-frontend/nexus-quantum-terminal/package.json ./
RUN npm install --only=production \
    pg \
    redis \
    amqplib \
    @tensorflow/tfjs-node \
    crypto \
    bcryptjs \
    jsonwebtoken \
    helmet \
    rate-limiter-flexible && \
    npm cache clean --force

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
