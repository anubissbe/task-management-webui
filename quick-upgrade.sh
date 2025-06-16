#!/bin/bash
# Quick upgrade for ProjectHub-Mcp on Synology

echo "🚀 Quick Upgrade for ProjectHub-Mcp"
echo ""
echo "This will upgrade your containers to the latest version."
echo "Your data will be preserved."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Pulling latest images..."
    docker pull ghcr.io/anubissbe/projecthub-mcp-frontend:branded
    docker pull ghcr.io/anubissbe/projecthub-mcp-backend:latest
    
    echo "🔄 Restarting containers..."
    docker stop projecthub-mcp-frontend projecthub-mcp-backend 2>/dev/null || true
    
    # Try to get existing container settings
    BACKEND_PORT=$(docker port projecthub-mcp-backend 3001 2>/dev/null | cut -d: -f2 || echo "3001")
    FRONTEND_PORT=$(docker port projecthub-mcp-frontend 5173 2>/dev/null | cut -d: -f2 || echo "5173")
    
    docker rm projecthub-mcp-frontend projecthub-mcp-backend 2>/dev/null || true
    
    # Recreate with common settings
    docker run -d \
        --name projecthub-mcp-backend \
        -p ${BACKEND_PORT:-3001}:3001 \
        -e NODE_ENV=production \
        -e DATABASE_URL="postgresql://app_user:app_secure_2024@192.168.1.24:5433/mcp_learning" \
        -e CORS_ORIGIN="http://192.168.1.24:5173" \
        --restart unless-stopped \
        ghcr.io/anubissbe/projecthub-mcp-backend:latest
    
    docker run -d \
        --name projecthub-mcp-frontend \
        -p ${FRONTEND_PORT:-5173}:5173 \
        -e VITE_API_URL="http://192.168.1.24:3001/api" \
        --restart unless-stopped \
        ghcr.io/anubissbe/projecthub-mcp-frontend:branded
    
    echo ""
    echo "✅ Upgrade complete!"
    echo ""
    echo "Access ProjectHub-Mcp at: http://192.168.1.24:5173"
    echo ""
    docker ps | grep projecthub
else
    echo "❌ Upgrade cancelled"
fi