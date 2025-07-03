#!/bin/bash

# ProjectHub v4.7.0 Clean Release Build Script
# Builds and pushes clean containers with proper version tags

set -e

echo "🚀 ProjectHub v4.7.0 Clean Release Build"
echo "========================================"

# Configuration
VERSION="4.7.0"
DOCKER_USER="telkombe"
PROJECT_NAME="projecthub"

echo "📋 Build Configuration:"
echo "   Version: v$VERSION"
echo "   Docker Hub: $DOCKER_USER"
echo "   Build Date: $(date)"
echo ""

# Step 1: Build Backend (Clean version from backend-fix)
echo "🔧 Step 1: Building Backend v$VERSION..."
echo "----------------------------------------"
cd backend-fix

# Build with version labels
docker build \
  --label "version=$VERSION" \
  --label "build-date=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  --label "description=ProjectHub Backend - Clean version without mock data" \
  -t ${DOCKER_USER}/${PROJECT_NAME}-backend:latest \
  -t ${DOCKER_USER}/${PROJECT_NAME}-backend:v${VERSION} \
  -t ${DOCKER_USER}/${PROJECT_NAME}-backend:4.7 \
  -t ${DOCKER_USER}/${PROJECT_NAME}-backend:4 \
  .

cd ..
echo "✅ Backend built successfully"

# Step 2: Build Frontend
echo ""
echo "🔧 Step 2: Building Frontend v$VERSION..."
echo "-----------------------------------------"
cd frontend

# Build with version labels
docker build \
  --label "version=$VERSION" \
  --label "build-date=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  --label "description=ProjectHub Frontend - Clean version" \
  -t ${DOCKER_USER}/${PROJECT_NAME}-frontend:latest \
  -t ${DOCKER_USER}/${PROJECT_NAME}-frontend:v${VERSION} \
  -t ${DOCKER_USER}/${PROJECT_NAME}-frontend:4.7 \
  -t ${DOCKER_USER}/${PROJECT_NAME}-frontend:4 \
  .

cd ..
echo "✅ Frontend built successfully"

# Step 3: Push to Docker Hub
echo ""
echo "📤 Step 3: Pushing to Docker Hub..."
echo "-----------------------------------"

# Push backend tags
echo "📤 Pushing backend tags..."
docker push ${DOCKER_USER}/${PROJECT_NAME}-backend:latest
docker push ${DOCKER_USER}/${PROJECT_NAME}-backend:v${VERSION}
docker push ${DOCKER_USER}/${PROJECT_NAME}-backend:4.7
docker push ${DOCKER_USER}/${PROJECT_NAME}-backend:4

# Push frontend tags
echo "📤 Pushing frontend tags..."
docker push ${DOCKER_USER}/${PROJECT_NAME}-frontend:latest
docker push ${DOCKER_USER}/${PROJECT_NAME}-frontend:v${VERSION}
docker push ${DOCKER_USER}/${PROJECT_NAME}-frontend:4.7
docker push ${DOCKER_USER}/${PROJECT_NAME}-frontend:4

echo "✅ All images pushed to Docker Hub successfully!"

# Step 4: Create Updated Docker Compose
echo ""
echo "📦 Step 4: Creating v$VERSION Deployment Files..."
echo "------------------------------------------------"

cat > docker-compose.v4.7.yml << EOF
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: projecthub-postgres
    environment:
      POSTGRES_DB: projecthub_mcp
      POSTGRES_USER: projecthub
      POSTGRES_PASSWORD: projecthub_password
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    ports:
      - "5433:5432"
    networks:
      - projecthub-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U projecthub -d projecthub_mcp"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Backend API (Clean v4.7.0)
  backend:
    image: ${DOCKER_USER}/${PROJECT_NAME}-backend:latest
    container_name: projecthub-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://projecthub:projecthub_password@postgres:5432/projecthub_mcp
      CORS_ORIGIN: "*"
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      PORT: 3001
    ports:
      - "3007:3001"
    networks:
      - projecthub-network
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Frontend (React App v4.7.0)
  frontend:
    image: ${DOCKER_USER}/${PROJECT_NAME}-frontend:latest
    container_name: projecthub-frontend
    environment:
      REACT_APP_API_URL: http://192.168.1.24:3007
    ports:
      - "5174:80"
    networks:
      - projecthub-network
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  postgres_data:
    driver: local

networks:
  projecthub-network:
    driver: bridge
EOF

# Step 5: Create Git Tag
echo ""
echo "🏷️  Step 5: Creating Git Tag v$VERSION..."
echo "----------------------------------------"

# Commit version change
git add package.json
git commit -m "Bump version to v$VERSION

- Clean release without mock data
- Backend connects to PostgreSQL database
- Frontend uses clean API endpoints
- Docker images built with proper versioning
- Ready for production deployment"

# Create and push tag
git tag -a v$VERSION -m "Release v$VERSION

🚀 ProjectHub v$VERSION - Clean Release

✨ Features:
- Clean backend without hardcoded mock data
- Real PostgreSQL database connection
- Proper JWT authentication
- Clean frontend with dynamic API calls
- Full Docker Hub integration

🐳 Docker Images:
- ${DOCKER_USER}/${PROJECT_NAME}-backend:latest
- ${DOCKER_USER}/${PROJECT_NAME}-frontend:latest
- ${DOCKER_USER}/${PROJECT_NAME}-backend:v$VERSION
- ${DOCKER_USER}/${PROJECT_NAME}-frontend:v$VERSION

📦 Deployment:
docker-compose -f docker-compose.v4.7.yml up -d"

git push origin main
git push origin v$VERSION

echo "✅ Git tag v$VERSION created and pushed"

# Step 6: Create Deployment Package
echo ""
echo "📦 Step 6: Creating Deployment Package..."
echo "----------------------------------------"

tar -czf projecthub-v${VERSION}-deployment.tar.gz \
  docker-compose.v4.7.yml \
  init-db.sql \
  README.md

echo "✅ Deployment package created: projecthub-v${VERSION}-deployment.tar.gz"

# Summary
echo ""
echo "🎉 ProjectHub v$VERSION Release Complete!"
echo "========================================"
echo ""
echo "🐳 Docker Hub Images:"
echo "   - ${DOCKER_USER}/${PROJECT_NAME}-backend:latest"
echo "   - ${DOCKER_USER}/${PROJECT_NAME}-backend:v$VERSION"
echo "   - ${DOCKER_USER}/${PROJECT_NAME}-frontend:latest"  
echo "   - ${DOCKER_USER}/${PROJECT_NAME}-frontend:v$VERSION"
echo ""
echo "🏷️  Git Tag: v$VERSION"
echo "📦 Deployment Package: projecthub-v${VERSION}-deployment.tar.gz"
echo ""
echo "🚀 Quick Deploy Commands:"
echo "   docker pull ${DOCKER_USER}/${PROJECT_NAME}-backend:latest"
echo "   docker pull ${DOCKER_USER}/${PROJECT_NAME}-frontend:latest"
echo "   docker-compose -f docker-compose.v4.7.yml up -d"
echo ""
echo "🔗 Access Points (after deployment):"
echo "   - Frontend: http://192.168.1.24:5174"
echo "   - Backend: http://192.168.1.24:3007"
echo "   - Database: 192.168.1.24:5433"