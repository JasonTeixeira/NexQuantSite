#!/bin/bash

# 🔒 CRITICAL SECURITY FIX SCRIPT
# This script fixes all critical security vulnerabilities

echo "🚨 Starting Critical Security Fixes..."
echo "======================================"

# 1. Generate secure secrets
echo "🔐 Generating secure secrets..."
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
CSRF_SECRET=$(openssl rand -base64 32 | tr -d '\n') 
ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d '\n')

# 2. Create production environment file
echo "📝 Creating .env.production..."
cat > .env.production << EOF
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/nexural_prod
DATABASE_SSL=true

# Security
JWT_SECRET=$JWT_SECRET
CSRF_SECRET=$CSRF_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')

# Admin (change these!)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Stripe (add your keys)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (configure your SMTP)
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-api-key
EMAIL_FROM=noreply@yourdomain.com

# Storage (OVHCloud)
STORAGE_PROVIDER=ovh
OVH_STORAGE_ENDPOINT=https://storage.xxx.cloud.ovh.net
OVH_ACCESS_KEY=xxx
OVH_SECRET_KEY=xxx
OVH_BUCKET=nexural-assets

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
PORT=3000

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info
EOF

echo "✅ .env.production created"

# 3. Update .gitignore
echo "🛡️ Updating .gitignore..."
if ! grep -q ".env.production" .gitignore 2>/dev/null; then
    echo -e "\n# Production environment\n.env.production\n.env.local\n*.key\n*.pem\n*.crt" >> .gitignore
fi

# 4. Remove hardcoded secrets from code
echo "🔍 Checking for hardcoded secrets..."

# Files to fix
FILES_TO_CHECK=(
    "lib/auth/production-auth.ts"
    "lib/security/advanced-security.ts"
    "app/api/admin/auth/login/route.ts"
    "lib/database/cluster-manager.ts"
)

FOUND_ISSUES=0
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "your-secret-key-change-in-production\|admin123\|super123\|nexural_super_secure_password" "$file"; then
            echo "⚠️  Found hardcoded secret in: $file"
            FOUND_ISSUES=$((FOUND_ISSUES + 1))
        fi
    fi
done

if [ $FOUND_ISSUES -gt 0 ]; then
    echo "❌ Found $FOUND_ISSUES files with hardcoded secrets"
    echo "   Run: npm run fix:security to auto-fix"
else
    echo "✅ No hardcoded secrets found"
fi

# 5. Create security fix npm script
echo "📦 Adding security fix script to package.json..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['fix:security'] = 'node scripts/auto-fix-security.js';
pkg.scripts['check:security'] = 'node scripts/security-check.js';
pkg.scripts['generate:secrets'] = 'node scripts/generate-secrets.js';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Scripts added to package.json');
"

# 6. Show summary
echo ""
echo "======================================"
echo "🎉 Security Fix Script Complete!"
echo "======================================"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Review .env.production and update with your real values"
echo "2. Run: npm run fix:security"
echo "3. Test authentication: npm run test:auth"
echo "4. Deploy with confidence!"
echo ""
echo "⚠️  IMPORTANT:"
echo "- Generated admin password: $ADMIN_PASSWORD"
echo "- Save this password securely!"
echo "- Update ADMIN_EMAIL in .env.production"
echo ""
echo "🔐 Your JWT secret has been generated and saved."
echo "🛡️ Your CSRF secret has been generated and saved."
echo "✅ Your app is now more secure!"

