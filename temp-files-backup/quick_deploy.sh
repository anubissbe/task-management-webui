#!/bin/bash

# Quick deployment script for ProjectHub on Synology
# This creates a minimal deployment without building images

echo "🚀 Quick ProjectHub Deployment for Synology"
echo "=========================================="

# Create a minimal docker-compose for Synology
cat > docker-compose.synology-minimal.yml << 'EOF'
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
      - /volume1/docker/projecthub/postgres:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - projecthub-network
    restart: unless-stopped

  backend:
    image: node:22-alpine
    container_name: projecthub-backend
    working_dir: /app
    command: sh -c "npm install && npm run build && npm start"
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
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
    networks:
      - projecthub-network
    restart: unless-stopped

  frontend:
    image: node:22-alpine
    container_name: projecthub-frontend
    working_dir: /app
    command: sh -c "npm install && npm run build && npx serve -s dist -l 80"
    ports:
      - "5174:80"
    environment:
      - VITE_API_URL=http://192.168.1.24:3007/api
      - VITE_WS_URL=ws://192.168.1.24:3007
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - projecthub-network
    restart: unless-stopped

networks:
  projecthub-network:
    driver: bridge
EOF

echo "✅ Created minimal docker-compose configuration"
echo ""
echo "To deploy on Synology:"
echo "1. Copy this entire project directory to Synology at /volume1/docker/projecthub"
echo "2. SSH to Synology and run:"
echo "   cd /volume1/docker/projecthub"
echo "   docker-compose -f docker-compose.synology-minimal.yml up -d"
echo ""
echo "The services will be available at:"
echo "  Frontend: http://192.168.1.24:5174"
echo "  Backend API: http://192.168.1.24:3007/api"