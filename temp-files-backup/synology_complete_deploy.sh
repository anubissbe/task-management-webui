#!/bin/bash

# Complete ProjectHub deployment script for Synology
# This script contains everything needed to deploy ProjectHub

echo "🚀 ProjectHub Complete Deployment for Synology"
echo "============================================="

# Configuration
PROJECT_DIR="/volume1/docker/projecthub"
POSTGRES_PASSWORD="projecthub_secure_2025"
JWT_SECRET="projecthub_access_secret_change_me_in_production_min_32_chars"

# Create project directory
echo "Creating project directory..."
mkdir -p $PROJECT_DIR/{postgres,redis,backend,frontend}
cd $PROJECT_DIR

# Create docker-compose.yml
echo "Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    container_name: projecthub-postgres
    environment:
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: projecthub_secure_2025
      POSTGRES_DB: projecthub_mcp
    volumes:
      - ./postgres:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - projecthub-network
    restart: unless-stopped

  backend:
    image: node:22-alpine
    container_name: projecthub-backend
    working_dir: /app
    command: sh -c "cd backend && npm install && npm run build && npm start"
    ports:
      - "3007:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://projecthub:projecthub_secure_2025@postgres:5432/projecthub_mcp
      - JWT_ACCESS_SECRET=projecthub_access_secret_change_me_in_production_min_32_chars
      - JWT_REFRESH_SECRET=projecthub_refresh_secret_change_me_in_production_min_32_chars
      - CORS_ORIGIN=http://192.168.1.24:5174
    volumes:
      - ./backend:/app/backend
      - ./backend/node_modules:/app/backend/node_modules
    depends_on:
      - postgres
    networks:
      - projecthub-network
    restart: unless-stopped

  frontend:
    image: node:22-alpine
    container_name: projecthub-frontend
    working_dir: /app
    command: sh -c "cd frontend && npm install && npm run build && npx serve -s dist -l 80"
    ports:
      - "5174:80"
    environment:
      - VITE_API_URL=http://192.168.1.24:3007/api
      - VITE_WS_URL=ws://192.168.1.24:3007
    volumes:
      - ./frontend:/app/frontend
      - ./frontend/node_modules:/app/frontend/node_modules
    depends_on:
      - backend
    networks:
      - projecthub-network
    restart: unless-stopped

networks:
  projecthub-network:
    driver: bridge
EOF

# Create .env file
echo "Creating .env file..."
cat > .env << EOF
# Database
DB_USER=projecthub
DB_PASSWORD=$POSTGRES_PASSWORD
DB_NAME=projecthub_mcp
DB_PORT=5433

# Backend
BACKEND_PORT=3007
NODE_ENV=production

# Frontend
FRONTEND_PORT=5174
VITE_API_URL=http://192.168.1.24:3007/api
VITE_WS_URL=ws://192.168.1.24:3007

# JWT
JWT_ACCESS_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_SECRET
EOF

echo "✓ Configuration files created"

# Check if source files exist
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo ""
    echo "⚠️  Source files not found!"
    echo ""
    echo "Please copy the backend and frontend directories from:"
    echo "  /opt/projects/projects/projecthub-mcp-server/backend"
    echo "  /opt/projects/projects/projecthub-mcp-server/frontend"
    echo ""
    echo "To:"
    echo "  $PROJECT_DIR/backend"
    echo "  $PROJECT_DIR/frontend"
    echo ""
    echo "Then run: docker-compose up -d"
    exit 1
fi

# Pull Docker images
echo "Pulling Docker images..."
docker pull postgres:17-alpine
docker pull node:22-alpine

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start services
echo "Starting services..."
docker-compose up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Services will be available at:"
echo "  Frontend: http://192.168.1.24:5174"
echo "  Backend API: http://192.168.1.24:3007/api"
echo "  PostgreSQL: 192.168.1.24:5433"
echo ""
echo "Note: It may take 1-2 minutes for services to fully initialize."
echo "Check logs with: docker-compose logs -f"