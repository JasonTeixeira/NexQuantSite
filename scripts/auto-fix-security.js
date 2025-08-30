#!/usr/bin/env node

// 🔧 AUTO-FIX SECURITY ISSUES
// This script automatically fixes hardcoded secrets in the codebase

const fs = require('fs');
const path = require('path');

console.log('🔧 Auto-fixing security issues...\n');

const fixes = [
  {
    file: 'lib/auth/production-auth.ts',
    pattern: /const JWT_SECRET = process\.env\.JWT_SECRET \|\| '[^']+'/g,
    replacement: `const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}`,
    description: 'Removing JWT_SECRET fallback'
  },
  {
    file: 'lib/security/advanced-security.ts', 
    pattern: /secret: process\.env\.CSRF_SECRET \|\| '[^']+'/g,
    replacement: `secret: process.env.CSRF_SECRET || (() => {
      throw new Error('CSRF_SECRET environment variable is required')
    })()`,
    description: 'Removing CSRF_SECRET fallback'
  },
  {
    file: 'app/api/admin/auth/login/route.ts',
    pattern: /const validCredentials = \[[\s\S]*?\]/g,
    replacement: `// Admin authentication now uses database
const validCredentials: any[] = []`,
    description: 'Removing hardcoded admin credentials'
  },
  {
    file: 'lib/database/cluster-manager.ts',
    pattern: /password: process\.env\.POSTGRES_PASSWORD \|\| '[^']+'/g,
    replacement: `password: process.env.POSTGRES_PASSWORD || (() => {
      throw new Error('POSTGRES_PASSWORD environment variable is required')
    })()`,
    description: 'Removing database password fallback'
  }
];

let fixedCount = 0;
let errorCount = 0;

fixes.forEach(fix => {
  const filePath = path.join(process.cwd(), fix.file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${fix.file} (file not found)`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = content.replace(fix.pattern, fix.replacement);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${fix.file}`);
      console.log(`   ${fix.description}`);
      fixedCount++;
    } else {
      console.log(`✨ Already fixed: ${fix.file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${fix.file}: ${error.message}`);
    errorCount++;
  }
});

// Fix the authentication bug
console.log('\n🐛 Fixing authentication bugs...');

const mockDbPath = 'lib/database/mock-connection.ts';
try {
  if (fs.existsSync(mockDbPath)) {
    let content = fs.readFileSync(mockDbPath, 'utf8');
    
    // Ensure all mock users have status field
    if (!content.includes("status: 'active'")) {
      content = content.replace(
        /role: 'admin',/g,
        `role: 'admin',\n    status: 'active',`
      );
      content = content.replace(
        /role: 'user',/g,
        `role: 'user',\n    status: 'active',`
      );
      
      fs.writeFileSync(mockDbPath, content, 'utf8');
      console.log('✅ Fixed: Added status field to mock users');
      fixedCount++;
    }
  }
} catch (error) {
  console.error(`❌ Error fixing mock database: ${error.message}`);
  errorCount++;
}

// Create secure admin authentication
console.log('\n🔐 Creating secure admin authentication...');

const secureAdminAuth = `// 🔐 SECURE ADMIN AUTHENTICATION
import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth/production-auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }
    
    // Use production authentication
    const result = await authenticateUser({ email, password })
    
    // Check if user is admin
    if (result.success && result.user) {
      if (result.user.role !== 'admin' && result.user.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
      
      // Admin authenticated successfully
      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          name: result.user.firstName + ' ' + result.user.lastName
        },
        token: result.session?.sessionToken
      })
      
      // Set admin session cookie
      if (result.session?.sessionToken) {
        response.cookies.set('admin_token', result.session.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 // 24 hours
        })
      }
      
      return response
    }
    
    return NextResponse.json(
      { error: 'Invalid admin credentials' },
      { status: 401 }
    )
  } catch (error: any) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}`;

try {
  const adminAuthPath = 'app/api/admin/auth/login/route.ts';
  fs.writeFileSync(adminAuthPath, secureAdminAuth, 'utf8');
  console.log('✅ Created secure admin authentication');
  fixedCount++;
} catch (error) {
  console.error(`❌ Error creating admin auth: ${error.message}`);
  errorCount++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Security Fix Summary:');
console.log('='.repeat(50));
console.log(`✅ Fixed: ${fixedCount} issues`);
if (errorCount > 0) {
  console.log(`❌ Errors: ${errorCount} issues`);
}
console.log('\n✨ Security improvements applied!');
console.log('📋 Next: Update .env.production with your real values');
console.log('🚀 Then: npm run build && npm start');

