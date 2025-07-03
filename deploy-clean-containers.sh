#!/bin/bash

# Direct Clean Container Deployment Script
# This replaces the running containers with clean versions

echo "🚀 Deploying Clean ProjectHub Containers..."
echo "=============================================="

# Configuration
SYNOLOGY_HOST="192.168.1.24"
BACKEND_PORT="3008"
FRONTEND_PORT="5174"
DB_PORT="5433"

echo "📋 Current Status Check..."
echo "Frontend: $(curl -s -o /dev/null -w '%{http_code}' http://$SYNOLOGY_HOST:$FRONTEND_PORT)"
echo "Backend: $(curl -s -o /dev/null -w '%{http_code}' http://$SYNOLOGY_HOST:$BACKEND_PORT)"

# Test if backend returns mock data
echo ""
echo "🔍 Checking if backend has mock data..."
RESPONSE=$(curl -s http://$SYNOLOGY_HOST:$BACKEND_PORT/api/projects)
if echo "$RESPONSE" | grep -q "Website Redesign"; then
    echo "❌ Backend still has mock data - needs replacement"
    NEEDS_REPLACEMENT=true
else
    echo "✅ Backend appears clean"
    NEEDS_REPLACEMENT=false
fi

if [ "$NEEDS_REPLACEMENT" = true ]; then
    echo ""
    echo "🔄 Backend needs replacement with clean version"
    echo ""
    echo "🏗️  Manual Deployment Steps Required:"
    echo "======================================"
    echo ""
    echo "1. SSH into Synology:"
    echo "   ssh -p 2222 Bert@192.168.1.24"
    echo ""
    echo "2. Find and stop the old backend container:"
    echo "   docker ps | grep -E '(projecthub|backend)'"
    echo "   docker stop [CONTAINER_NAME_OR_ID]"
    echo "   docker rm [CONTAINER_NAME_OR_ID]"
    echo ""
    echo "3. Run the clean backend:"
    echo "   docker run -d \\"
    echo "     --name projecthub-clean-backend \\"
    echo "     -p $BACKEND_PORT:3001 \\"
    echo "     -e NODE_ENV=production \\"
    echo "     -e DATABASE_URL=postgresql://projecthub:projecthub_password@projecthub-postgres:5432/projecthub_mcp \\"
    echo "     -e CORS_ORIGIN=\"*\" \\"
    echo "     --restart unless-stopped \\"
    echo "     telkombe/projecthub-backend:2.0.0"
    echo ""
    echo "4. Verify the backend is clean:"
    echo "   curl http://localhost:$BACKEND_PORT/health"
    echo "   curl http://localhost:$BACKEND_PORT/api/projects"
    echo ""
    echo "5. If frontend needs update, replace it too:"
    echo "   docker ps | grep -E '(projecthub|frontend)'"
    echo "   docker stop [FRONTEND_CONTAINER]"
    echo "   docker rm [FRONTEND_CONTAINER]"
    echo "   docker run -d \\"
    echo "     --name projecthub-clean-frontend \\"
    echo "     -p $FRONTEND_PORT:80 \\"
    echo "     -e REACT_APP_API_URL=http://$SYNOLOGY_HOST:$BACKEND_PORT \\"
    echo "     --restart unless-stopped \\"
    echo "     telkombe/projecthub-frontend:2.0.0"
    echo ""
    echo "🎯 Expected Clean Backend Response:"
    echo "=================================="
    echo "GET /api/projects should return: []"
    echo "GET /health should return: {\"status\":\"ok\",\"timestamp\":\"...\"}"
    echo ""
    echo "❌ Current Response (with mock data):"
    echo "$RESPONSE" | jq '.[0].name' 2>/dev/null || echo "$RESPONSE"
    
else
    echo ""
    echo "✅ Deployment appears to be clean already!"
    echo ""
    echo "🔗 Access Points:"
    echo "   - Frontend: http://$SYNOLOGY_HOST:$FRONTEND_PORT"
    echo "   - Backend: http://$SYNOLOGY_HOST:$BACKEND_PORT"
    echo "   - Database: $SYNOLOGY_HOST:$DB_PORT"
    echo ""
    echo "🧪 Quick Tests:"
    echo "   curl http://$SYNOLOGY_HOST:$BACKEND_PORT/health"
    echo "   curl http://$SYNOLOGY_HOST:$BACKEND_PORT/api/projects"
fi

echo ""
echo "📦 Clean Docker Images Available:"
echo "   - telkombe/projecthub-backend:2.0.0"
echo "   - telkombe/projecthub-frontend:2.0.0"
echo "   - postgres:15-alpine"