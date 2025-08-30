# Nexural Backtesting - Production Dockerfile
# Multi-stage build for optimized production deployment

# Build stage
FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY pyproject.toml ./
COPY nexural_backtesting/ ./nexural_backtesting/

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Production stage
FROM python:3.11-slim as production

# Create non-root user for security
RUN groupadd -r nexural && useradd -r -g nexural nexural

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy application from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app/nexural_backtesting ./nexural_backtesting

# Copy configuration files
COPY nexural_backtesting/config/ ./config/
COPY nexural_backtesting/.env.example ./.env

# Create necessary directories
RUN mkdir -p logs data artifacts build && \
    chown -R nexural:nexural /app

# Switch to non-root user
USER nexural

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Environment variables
ENV PYTHONPATH=/app
ENV ENVIRONMENT=production
ENV LOG_LEVEL=INFO

# Default command
CMD ["python", "-m", "uvicorn", "nexural_backtesting.api.secured_server:app", "--host", "0.0.0.0", "--port", "8000"]





