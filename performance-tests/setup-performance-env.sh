#!/bin/bash
# Performance Testing Environment Setup Script
# This script prepares the environment for running performance tests

# Exit on any error
set -e

echo "Setting up Performance Testing Environment for NexQuantSite..."
mkdir -p performance-tests/results
mkdir -p performance-tests/logs

# Check if JMeter is installed
if ! command -v jmeter &> /dev/null; then
    echo "JMeter not found. Please install JMeter first."
    echo "You can download it from: https://jmeter.apache.org/download_jmeter.cgi"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please install Node.js first."
    exit 1
fi

# Install necessary npm packages
echo "Installing required npm packages..."
npm install -g artillery@latest
npm install --save-dev @types/jmeter

# Create an .env file with performance testing configuration
echo "Creating performance testing environment configuration..."
cat > performance-tests/.env <<EOL
# Performance Testing Environment Configuration
PERF_TEST_HOST=localhost
PERF_TEST_PORT=3000
PERF_TEST_PROTOCOL=http
PERF_TEST_API_TOKEN=performance-test-token
PERF_TEST_NUM_USERS=100
PERF_TEST_RAMP_UP=60
PERF_TEST_DURATION=900
EOL

# Create a script to run the JMeter tests
echo "Creating test runner script..."
cat > performance-tests/run-tests.sh <<EOL
#!/bin/bash
# Performance Test Runner Script

# Load environment variables
source performance-tests/.env

# Create timestamp for results
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="performance-tests/results/\$TIMESTAMP"
mkdir -p \$RESULTS_DIR

echo "Starting ML Prediction Performance Test..."
jmeter -n \\
  -t performance-tests/ml-prediction-performance.jmx \\
  -l \$RESULTS_DIR/ml-prediction-results.jtl \\
  -j \$RESULTS_DIR/jmeter.log \\
  -e -o \$RESULTS_DIR/report \\
  -Japi_token=\$PERF_TEST_API_TOKEN \\
  -JHOST=\$PERF_TEST_HOST \\
  -JPORT=\$PERF_TEST_PORT \\
  -JPROTOCOL=\$PERF_TEST_PROTOCOL

echo "Tests completed. Results available in \$RESULTS_DIR"
EOL

# Make the runner script executable
chmod +x performance-tests/run-tests.sh

# Create an example database seeding script for performance testing
echo "Creating database seeding script for test data..."
cat > performance-tests/seed-test-data.js <<EOL
/**
 * Database Seeding Script for Performance Testing
 * 
 * This script populates the database with test data for performance testing.
 * It creates models and other necessary data for the tests to run.
 */

require('dotenv').config({ path: 'performance-tests/.env' });
const { db } = require('../lib/database/database');
const { createModels } = require('../scripts/init-db');

async function seedTestData() {
  console.log('Seeding database with performance test data...');
  
  // Create test models matching those in the CSV file
  const models = [
    { id: 'model-1', name: 'Small Crypto Model', type: 'classification', size: 'small' },
    { id: 'model-2', name: 'Small Crypto Model Alt', type: 'classification', size: 'small' },
    { id: 'model-3', name: 'Large Crypto Model', type: 'ensemble', size: 'large' },
    { id: 'model-4', name: 'Large Crypto Model Alt', type: 'ensemble', size: 'large' },
    { id: 'model-5', name: 'Small Stock Model', type: 'classification', size: 'small' },
    { id: 'model-6', name: 'Small Stock Model Alt', type: 'classification', size: 'small' },
    { id: 'model-7', name: 'Large Stock Model', type: 'ensemble', size: 'large' },
    { id: 'model-8', name: 'Large Stock Model Alt', type: 'ensemble', size: 'large' },
    { id: 'model-9', name: 'Small Forex Model', type: 'classification', size: 'small' },
    { id: 'model-10', name: 'Large Forex Model', type: 'ensemble', size: 'large' },
  ];
  
  // Clear existing test models if they exist
  console.log('Clearing existing test models...');
  await db.query('DELETE FROM ml_models WHERE id LIKE $1', ['model-%']);
  
  // Insert test models
  console.log('Inserting test models...');
  for (const model of models) {
    await db.query(
      'INSERT INTO ml_models (id, name, version, type, status, metadata) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        model.id,
        model.name,
        'v1.0.0',
        model.type,
        'active',
        JSON.stringify({
          description: \`\${model.size} \${model.type} model for performance testing\`,
          size: model.size,
          accuracy: model.size === 'small' ? 0.8 : 0.9
        })
      ]
    );
  }
  
  console.log('Database seeded successfully!');
}

// Run the seeding function
seedTestData()
  .then(() => {
    console.log('Performance test data seeding complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding performance test data:', err);
    process.exit(1);
  });
EOL

# Create a monitoring configuration file for performance tests
echo "Creating monitoring configuration..."
cat > performance-tests/monitoring-config.js <<EOL
/**
 * Monitoring Configuration for Performance Tests
 *
 * This file configures the monitoring system for performance tests,
 * setting up appropriate sampling rates and endpoints.
 */

const { configureMonitoring } = require('../lib/monitoring/index');

// Configure monitoring for performance tests
configureMonitoring({
  enableConsoleLogging: true,
  enableMetricCollection: true,
  sampleRate: 1.0, // Capture all metrics during performance testing
  flushInterval: 5000, // Flush metrics more frequently during testing
  maxBatchSize: 100,
  metricsEndpoint: process.env.METRICS_ENDPOINT || 'http://localhost:9090/metrics',
  errorReportingEndpoint: process.env.ERROR_ENDPOINT || 'http://localhost:9090/errors'
});

console.log('Performance test monitoring configured');
EOL

# Create a shell script to run integration tests
echo "Creating integration test script..."
cat > performance-tests/run-integration-tests.sh <<EOL
#!/bin/bash
# Run integration tests before performance tests
# to ensure the system is working correctly

echo "Running integration tests..."
npm test -- --testPathPattern=__tests__/ml/integration.test.ts

if [ \$? -ne 0 ]; then
  echo "Integration tests failed. Please fix before running performance tests."
  exit 1
fi

echo "Integration tests passed. Ready for performance testing."
EOL

chmod +x performance-tests/run-integration-tests.sh

echo "Performance testing environment setup complete!"
echo "To run the tests:"
echo "1. Start your application server"
echo "2. Run ./performance-tests/run-integration-tests.sh to verify system readiness"
echo "3. Run ./performance-tests/run-tests.sh to execute the performance tests"
echo "4. Results will be available in the performance-tests/results directory"
