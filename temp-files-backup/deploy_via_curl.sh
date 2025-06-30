#!/bin/bash

# Create a deployment payload that can be sent via curl
cat > /tmp/deploy_command.txt << 'EOF'
cd /tmp && \
mkdir -p /volume1/docker/projecthub && \
cd /volume1/docker/projecthub && \
cat > docker-compose.yml << 'COMPOSE_EOF'
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
    image: ghcr.io/anubissbe/projecthub-mcp-backend:latest
    container_name: projecthub-backend
    ports:
      - "3007:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://projecthub:projecthub_secure_2025@postgres:5432/projecthub_mcp
      - JWT_ACCESS_SECRET=projecthub_access_secret_change_me_in_production_min_32_chars
      - JWT_REFRESH_SECRET=projecthub_refresh_secret_change_me_in_production_min_32_chars
      - CORS_ORIGIN=http://192.168.1.24:5174
    depends_on:
      - postgres
    networks:
      - projecthub-network
    restart: unless-stopped

  frontend:
    image: ghcr.io/anubissbe/projecthub-mcp-frontend:latest
    container_name: projecthub-frontend
    ports:
      - "5174:80"
    environment:
      - VITE_API_URL=http://192.168.1.24:3007/api
      - VITE_WS_URL=ws://192.168.1.24:3007
    depends_on:
      - backend
    networks:
      - projecthub-network
    restart: unless-stopped

networks:
  projecthub-network:
    driver: bridge
COMPOSE_EOF

docker-compose pull && \
docker-compose up -d
EOF

echo "Deployment command created. This uses pre-built images from GitHub Container Registry."