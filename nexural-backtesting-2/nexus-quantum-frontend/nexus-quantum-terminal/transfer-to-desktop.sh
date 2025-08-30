#!/bin/bash

# ====================================
# NEXUS QUANTUM TERMINAL - PROJECT TRANSFER SCRIPT
# ====================================
# This script transfers the project to your desktop
# and prepares it for backend integration

echo "🚀 Nexus Quantum Terminal - Project Transfer Script"
echo "===================================================="
echo ""

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current directory
CURRENT_DIR=$(pwd)
PROJECT_NAME="nexus-quantum-terminal"
DESKTOP_PATH="$HOME/Desktop"
TARGET_PATH="$DESKTOP_PATH/$PROJECT_NAME"

echo "📍 Current directory: $CURRENT_DIR"
echo "📂 Target directory: $TARGET_PATH"
echo ""

# Check if target already exists
if [ -d "$TARGET_PATH" ]; then
    echo -e "${YELLOW}⚠️  Target directory already exists!${NC}"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
    echo "Removing existing directory..."
    rm -rf "$TARGET_PATH"
fi

# Create target directory
echo "📁 Creating target directory..."
mkdir -p "$TARGET_PATH"

# Copy files (excluding node_modules and build folders)
echo "📦 Copying project files..."
rsync -av \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='coverage' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    . "$TARGET_PATH/"

echo -e "${GREEN}✅ Files copied successfully!${NC}"
echo ""

# Create a project info file
echo "📝 Creating project info file..."
cat > "$TARGET_PATH/PROJECT_INFO.txt" << EOF
====================================
NEXUS QUANTUM TERMINAL - PROJECT INFO
====================================

Transfer Date: $(date)
Source Path: $CURRENT_DIR
Node Version Required: 18+
Package Manager: npm

QUICK START:
1. cd $TARGET_PATH
2. npm install
3. cp ENV_TEMPLATE .env.local
4. Edit .env.local with your backend URL
5. npm run dev

IMPORTANT FILES:
- BACKEND_INTEGRATION_SPECS.md - Complete backend API specifications
- PROJECT_TRANSFER_GUIDE.md - Setup instructions
- WORLD_CLASS_AUDIT_REPORT.md - Current state analysis
- ENV_TEMPLATE - Environment variables template

BACKEND REQUIREMENTS:
- PostgreSQL database
- Redis cache
- WebSocket server
- AI processing endpoints
- Authentication system

See BACKEND_INTEGRATION_SPECS.md for complete details.
EOF

echo -e "${GREEN}✅ Project info created!${NC}"
echo ""

# Create a quick setup script
echo "📜 Creating quick setup script..."
cat > "$TARGET_PATH/quick-setup.sh" << 'EOF'
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
EOF

chmod +x "$TARGET_PATH/quick-setup.sh"
echo -e "${GREEN}✅ Quick setup script created!${NC}"
echo ""

# Create a compressed archive for easy transfer
echo "🗜️  Creating compressed archive..."
cd "$DESKTOP_PATH"
tar -czf "$PROJECT_NAME.tar.gz" "$PROJECT_NAME" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git'

ARCHIVE_SIZE=$(du -h "$PROJECT_NAME.tar.gz" | cut -f1)
echo -e "${GREEN}✅ Archive created: $PROJECT_NAME.tar.gz (Size: $ARCHIVE_SIZE)${NC}"
echo ""

# Summary
echo "========================================="
echo -e "${GREEN}✅ PROJECT TRANSFER COMPLETE!${NC}"
echo "========================================="
echo ""
echo "📂 Project location: $TARGET_PATH"
echo "📦 Archive location: $DESKTOP_PATH/$PROJECT_NAME.tar.gz"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Navigate to: cd $TARGET_PATH"
echo "2. Run setup: ./quick-setup.sh"
echo "3. Configure backend URL in .env.local"
echo "4. Start development: npm run dev"
echo ""
echo "🔌 BACKEND CONNECTION:"
echo "- See BACKEND_INTEGRATION_SPECS.md for API requirements"
echo "- See PROJECT_TRANSFER_GUIDE.md for setup instructions"
echo ""
echo "💾 TO TRANSFER TO ANOTHER MACHINE:"
echo "- Use the archive: $PROJECT_NAME.tar.gz"
echo "- Or copy the folder: $TARGET_PATH"
echo ""
echo "Need help? Check the documentation files in the project."
echo ""
