#!/bin/bash

# ==============================================
# ProjectHub-MCP Quick Start Script (Fixed Version)
# ==============================================
# 
# This script starts ProjectHub with all the fixes applied:
# - Proper CORS configuration
# - Fixed Alpine.js variables
# - Correct script loading order
#
# Usage: ./start-fixed.sh
#
# ==============================================

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting ProjectHub-MCP (Fixed Version)${NC}"
echo "========================================"

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose found${NC}"
    
    # Use the fixed docker-compose file
    if [ -f docker-compose-fixed.yml ]; then
        echo -e "${BLUE}Starting services with Docker Compose...${NC}"
        docker-compose -f docker-compose-fixed.yml up -d --build
        
        echo -e "\n${GREEN}✅ Services started successfully!${NC}"
        echo -e "\n${BLUE}Access your application at:${NC}"
        echo -e "  📱 Frontend: ${GREEN}http://localhost:8090${NC}"
        echo -e "  🔌 Backend API: ${GREEN}http://localhost:3009${NC}"
        echo -e "  🗄️  PostgreSQL: ${GREEN}localhost:5433${NC}"
    else
        echo -e "${RED}❌ docker-compose-fixed.yml not found${NC}"
        echo "Please ensure you have the fixed docker-compose file"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Docker Compose not found. Starting services manually...${NC}"
    
    # Start PostgreSQL if not running
    if ! nc -z localhost 5433 2>/dev/null; then
        echo -e "${BLUE}Starting PostgreSQL...${NC}"
        docker run -d --name projecthub-postgres \
            -e POSTGRES_USER=projecthub \
            -e POSTGRES_PASSWORD=projecthub_password \
            -e POSTGRES_DB=projecthub_mcp \
            -p 5433:5432 \
            postgres:16-alpine 2>/dev/null || echo "PostgreSQL already exists"
    fi
    
    # Wait for PostgreSQL
    echo -e "${BLUE}Waiting for PostgreSQL to start...${NC}"
    sleep 5
    
    # Start backend
    echo -e "${BLUE}Starting backend API...${NC}"
    cd backend-fix
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    node complete_backend.js &
    BACKEND_PID=$!
    cd ..
    
    # Give backend time to start
    sleep 2
    
    # Start frontend
    echo -e "${BLUE}Starting frontend...${NC}"
    cd new-frontend
    python3 -m http.server 8090 --bind 0.0.0.0 &
    FRONTEND_PID=$!
    cd ..
    
    echo -e "\n${GREEN}✅ Services started successfully!${NC}"
    echo -e "\n${BLUE}Access your application at:${NC}"
    echo -e "  📱 Frontend: ${GREEN}http://localhost:8090${NC}"
    echo -e "  🔌 Backend API: ${GREEN}http://localhost:3009${NC}"
    echo -e "  🗄️  PostgreSQL: ${GREEN}localhost:5433${NC}"
    
    echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"
    
    # Wait and handle cleanup
    trap "echo -e '\n${YELLOW}Stopping services...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
fi

echo -e "\n${BLUE}💡 Tips:${NC}"
echo "  - The application uses demo authentication (no login required)"
echo "  - All Alpine.js issues have been fixed"
echo "  - CORS is properly configured for all environments"
echo "  - For production deployment, use docker-compose-fixed.yml"