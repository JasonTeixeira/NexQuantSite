#!/bin/bash

echo "🚀 Nexus Quantum Terminal - Quick Setup"
echo "========================================"
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required (you have $(node -v))"
    exit 1
fi

echo "✅ Node.js version OK: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation succeeded
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed!"
else
    echo "❌ Installation failed. Please check errors above."
    exit 1
fi

# Create .env.local from template
if [ ! -f .env.local ]; then
    echo ""
    echo "📋 Creating .env.local from template..."
    cp ENV_TEMPLATE .env.local
    echo "✅ .env.local created!"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and update:"
    echo "   - NEXT_PUBLIC_BACKEND_URL"
    echo "   - NEXT_PUBLIC_WS_URL"
    echo ""
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Edit .env.local with your backend URL"
echo "2. Start your backend server"
echo "3. Run: npm run dev"
echo "4. Open: http://localhost:3025"
echo ""
echo "📚 Documentation:"
echo "   - BACKEND_INTEGRATION_SPECS.md"
echo "   - PROJECT_TRANSFER_GUIDE.md"
