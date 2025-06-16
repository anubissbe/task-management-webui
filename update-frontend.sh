#!/bin/bash

echo "🚀 Updating ProjectHub-MCP Frontend with Dramatic Branding..."

# Navigate to frontend directory
cd /app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the production version
echo "🔨 Building production bundle with new branding..."
npm run build

# The nginx container will serve from the dist directory
echo "✅ Frontend updated successfully!"
echo "🎨 New branding includes:"
echo "   - Dramatic black/orange gradients"
echo "   - Larger fonts and animations"
echo "   - Enhanced shadows and borders"
echo "   - Glowing effects on hover"
echo ""
echo "🔄 Please refresh your browser (Ctrl+F5) to see the changes!"