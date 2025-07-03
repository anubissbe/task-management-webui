#!/bin/bash

# Deploy ProjectHub v4.7.0 with Latest Tags to Synology
# This script replaces old containers with properly versioned clean containers

echo "🚀 ProjectHub v4.7.0 Deployment to Synology"
echo "============================================"
echo ""

# Configuration
SYNOLOGY_HOST="192.168.1.24"
BACKEND_PORT="3008"
FRONTEND_PORT="5174"
VERSION="4.7.0"

echo "📋 Deployment Configuration:"
echo "   Version: v$VERSION"
echo "   Target: $SYNOLOGY_HOST"
echo "   Backend Port: $BACKEND_PORT"
echo "   Frontend Port: $FRONTEND_PORT"
echo ""

# Step 1: Check current status
echo "🔍 Step 1: Checking Current Status..."
echo "------------------------------------"

FRONTEND_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://$SYNOLOGY_HOST:$FRONTEND_PORT)
BACKEND_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://$SYNOLOGY_HOST:$BACKEND_PORT)

echo "Frontend Status: $FRONTEND_STATUS"
echo "Backend Status: $BACKEND_STATUS"

# Check if backend has mock data
MOCK_CHECK=$(curl -s http://$SYNOLOGY_HOST:$BACKEND_PORT/api/projects 2>/dev/null | grep -c "Website Redesign" || echo "0")
if [ "$MOCK_CHECK" -gt 0 ]; then
    echo "❌ Backend has mock data - needs replacement"
    BACKEND_NEEDS_UPDATE=true
else
    echo "✅ Backend appears clean"
    BACKEND_NEEDS_UPDATE=false
fi

echo ""

# Step 2: Create deployment commands
echo "🛠️  Step 2: Container Replacement Commands"
echo "============================================"
echo ""

if [ "$BACKEND_NEEDS_UPDATE" = true ] || [ "$1" = "--force" ]; then
    echo "🐳 Backend Container Replacement:"
    echo "SSH Command: ssh -p 2222 Bert@$SYNOLOGY_HOST"
    echo ""
    echo "# Stop old backend"
    echo "docker ps | grep -E '(backend|projecthub)' | grep '$BACKEND_PORT'"
    echo "docker stop [CONTAINER_NAME_FROM_ABOVE]"
    echo "docker rm [CONTAINER_NAME_FROM_ABOVE]"
    echo ""
    echo "# Run clean backend v$VERSION"
    echo "docker run -d \\"
    echo "  --name projecthub-backend-v4.7 \\"
    echo "  -p $BACKEND_PORT:3001 \\"
    echo "  -e NODE_ENV=production \\"
    echo "  -e DATABASE_URL=postgresql://projecthub:projecthub_password@projecthub-postgres:5432/projecthub_mcp \\"
    echo "  -e CORS_ORIGIN=\"*\" \\"
    echo "  -e JWT_SECRET=change-this-jwt-secret-in-production \\"
    echo "  --restart unless-stopped \\"
    echo "  telkombe/projecthub-backend:latest"
    echo ""
    echo "# Verify clean deployment"
    echo "curl http://localhost:$BACKEND_PORT/health"
    echo "curl http://localhost:$BACKEND_PORT/api/projects  # Should return []"
    echo ""
fi

echo "🐳 Frontend Container Replacement (Optional):"
echo "# Stop old frontend"
echo "docker ps | grep -E '(frontend|projecthub)' | grep '$FRONTEND_PORT'"
echo "docker stop [CONTAINER_NAME_FROM_ABOVE]"
echo "docker rm [CONTAINER_NAME_FROM_ABOVE]"
echo ""
echo "# Run clean frontend v$VERSION"
echo "docker run -d \\"
echo "  --name projecthub-frontend-v4.7 \\"
echo "  -p $FRONTEND_PORT:80 \\"
echo "  -e REACT_APP_API_URL=http://$SYNOLOGY_HOST:$BACKEND_PORT \\"
echo "  --restart unless-stopped \\"
echo "  telkombe/projecthub-frontend:latest"
echo ""

# Step 3: Database setup (if needed)
echo "🗄️  Database Setup (if PostgreSQL not running):"
echo "docker run -d \\"
echo "  --name projecthub-postgres \\"
echo "  -p 5433:5432 \\"
echo "  -e POSTGRES_DB=projecthub_mcp \\"
echo "  -e POSTGRES_USER=projecthub \\"
echo "  -e POSTGRES_PASSWORD=projecthub_password \\"
echo "  -v projecthub_postgres_data:/var/lib/postgresql/data \\"
echo "  --restart unless-stopped \\"
echo "  postgres:15-alpine"
echo ""

# Step 4: Verification commands  
echo "🧪 Step 3: Post-Deployment Verification"
echo "======================================="
echo ""
echo "After running the deployment commands above, verify:"
echo ""
echo "1. Backend Health:"
echo "   curl http://$SYNOLOGY_HOST:$BACKEND_PORT/health"
echo "   Expected: {\"status\":\"ok\",\"timestamp\":\"...\"}"
echo ""
echo "2. Clean API Response:"
echo "   curl http://$SYNOLOGY_HOST:$BACKEND_PORT/api/projects"
echo "   Expected: [] (empty array, no mock data)"
echo ""
echo "3. Frontend Access:"
echo "   curl -I http://$SYNOLOGY_HOST:$FRONTEND_PORT"
echo "   Expected: HTTP/1.1 200 OK"
echo ""
echo "4. Container Status:"
echo "   docker ps | grep projecthub"
echo "   Expected: Both frontend and backend running"
echo ""

# Step 5: Available images info
echo "📦 Available Docker Hub Images:"
echo "==============================="
echo "Backend Tags:"
echo "  - telkombe/projecthub-backend:latest"
echo "  - telkombe/projecthub-backend:v$VERSION"
echo "  - telkombe/projecthub-backend:4.7"
echo "  - telkombe/projecthub-backend:4"
echo ""
echo "Frontend Tags:"
echo "  - telkombe/projecthub-frontend:latest"
echo "  - telkombe/projecthub-frontend:v$VERSION"
echo "  - telkombe/projecthub-frontend:4.7" 
echo "  - telkombe/projecthub-frontend:4"
echo ""

# Summary
echo "🎯 Summary:"
echo "==========="
if [ "$BACKEND_NEEDS_UPDATE" = true ]; then
    echo "❌ Backend needs update - currently serving mock data"
    echo "✅ Clean v$VERSION images available on Docker Hub"
    echo "📋 Manual deployment commands provided above"
else
    echo "✅ Backend appears clean"
    echo "✅ All v$VERSION images available on Docker Hub"
    echo "🔄 Use --force flag to replace containers anyway"
fi
echo ""
echo "🔗 Access URLs (after deployment):"
echo "   Frontend: http://$SYNOLOGY_HOST:$FRONTEND_PORT"
echo "   Backend:  http://$SYNOLOGY_HOST:$BACKEND_PORT"
echo "   Database: $SYNOLOGY_HOST:5433"