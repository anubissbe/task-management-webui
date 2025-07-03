#!/bin/bash

# ProjectHub Cleanup and Clean Deployment Script
# This script removes old containers, builds clean images, and deploys fresh containers

set -e

echo "🧹 ProjectHub Cleanup and Clean Deployment"
echo "============================================"
echo ""

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_USER="Bert"
SYNOLOGY_PORT="2222"
DOCKER_USER="telkombe"
PROJECT_NAME="projecthub-mcp"

# Step 1: Build and push clean images to Docker Hub
echo "🐳 Step 1: Building and pushing clean images to Docker Hub..."
echo "--------------------------------------------------------------"

# Build backend (using backend-fix which has no hardcoded data, connects to DB)
echo "🔧 Building backend from backend-fix (clean version)..."
docker build -t ${DOCKER_USER}/projecthub-backend:latest ./backend-fix

# Build frontend 
echo "🔧 Building frontend..."
docker build -t ${DOCKER_USER}/projecthub-frontend:latest ./frontend

# Push to Docker Hub
echo "📤 Pushing images to Docker Hub..."
docker push ${DOCKER_USER}/projecthub-backend:latest
docker push ${DOCKER_USER}/projecthub-frontend:latest

# Also tag and push as version 2.0.0 (clean version)
docker tag ${DOCKER_USER}/projecthub-backend:latest ${DOCKER_USER}/projecthub-backend:2.0.0
docker tag ${DOCKER_USER}/projecthub-frontend:latest ${DOCKER_USER}/projecthub-frontend:2.0.0
docker push ${DOCKER_USER}/projecthub-backend:2.0.0
docker push ${DOCKER_USER}/projecthub-frontend:2.0.0

echo "✅ Images pushed to Docker Hub successfully!"
echo ""

# Step 2: Create clean deployment package
echo "📦 Step 2: Creating clean deployment package..."
echo "------------------------------------------------"

# Create a clean docker-compose file for deployment
cat > docker-compose.clean.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: projecthub-mcp-postgres
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
      - projecthub-mcp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U projecthub -d projecthub_mcp"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Backend API (Clean version - connects to PostgreSQL)
  backend:
    image: telkombe/projecthub-backend:2.0.0
    container_name: projecthub-mcp-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://projecthub:projecthub_password@postgres:5432/projecthub_mcp
      CORS_ORIGIN: "*"
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      PORT: 3001
    ports:
      - "3007:3001"
    networks:
      - projecthub-mcp-network
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Frontend (React App)
  frontend:
    image: telkombe/projecthub-frontend:2.0.0
    container_name: projecthub-mcp-frontend
    environment:
      REACT_APP_API_URL: http://192.168.1.24:3007
    ports:
      - "5174:80"
    networks:
      - projecthub-mcp-network
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
  projecthub-mcp-network:
    driver: bridge
EOF

# Create database initialization script
cat > init-db.sql << 'EOF'
-- ProjectHub Database Initialization Script
-- This creates the basic schema for a clean ProjectHub installation

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning',
    priority VARCHAR(20) DEFAULT 'medium',
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    completion_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert a default admin user (password: 'admin123' - CHANGE THIS!)
INSERT INTO users (first_name, last_name, email, password, role) 
VALUES ('Admin', 'User', 'admin@projecthub.com', '$2a$10$YourHashedPasswordHere', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create default workspace
INSERT INTO workspaces (name, slug, owner_id)
SELECT 'Default Workspace', 'default', u.id
FROM users u WHERE u.email = 'admin@projecthub.com'
ON CONFLICT (slug) DO NOTHING;

COMMIT;
EOF

# Create deployment package
tar -czf projecthub-clean-deployment.tar.gz docker-compose.clean.yml init-db.sql

echo "✅ Clean deployment package created: projecthub-clean-deployment.tar.gz"
echo ""

# Step 3: Create Synology cleanup and deployment script
echo "📝 Step 3: Creating Synology deployment script..."
echo "--------------------------------------------------"

cat > deploy-to-synology.sh << 'EOF'
#!/bin/bash

# Deploy Clean ProjectHub to Synology NAS
# This script removes old containers and deploys clean containers from Docker Hub

echo "🚀 Deploying Clean ProjectHub to Synology NAS..."
echo "================================================"

# Configuration
SYNOLOGY_HOST="192.168.1.24"
SYNOLOGY_USER="Bert"
SYNOLOGY_PORT="2222"
REMOTE_DIR="/volume1/docker/projecthub-clean"

# Function to run command on Synology
run_remote() {
    ssh -p $SYNOLOGY_PORT $SYNOLOGY_USER@$SYNOLOGY_HOST "$1"
}

# Function to copy file to Synology
copy_to_synology() {
    scp -P $SYNOLOGY_PORT "$1" $SYNOLOGY_USER@$SYNOLOGY_HOST:"$2"
}

echo "🧹 Step 1: Cleaning up old containers..."
echo "----------------------------------------"

# Remove all old ProjectHub containers
run_remote "docker stop projecthub-mcp-backend projecthub-mcp-frontend projecthub-mcp-postgres 2>/dev/null || true"
run_remote "docker rm projecthub-mcp-backend projecthub-mcp-frontend projecthub-mcp-postgres 2>/dev/null || true"

# Remove old networks
run_remote "docker network rm projecthub-mcp-server_projecthub-mcp-network 2>/dev/null || true"

# Remove old volumes (CAUTION: This removes all data!)
echo "⚠️  Removing old volumes (this will delete all data)..."
run_remote "docker volume rm projecthub-mcp-server_postgres_data 2>/dev/null || true"

# Remove old images
echo "🗑️  Removing old images..."
run_remote "docker rmi \$(docker images --filter='reference=*projecthub*' -q) 2>/dev/null || true"

echo "✅ Cleanup complete!"
echo ""

echo "📦 Step 2: Setting up clean deployment..."
echo "------------------------------------------"

# Create remote directory
run_remote "mkdir -p $REMOTE_DIR"

# Copy deployment files
echo "📤 Uploading deployment files..."
copy_to_synology "projecthub-clean-deployment.tar.gz" "$REMOTE_DIR/"

# Extract and deploy
echo "🚀 Extracting and deploying..."
run_remote "cd $REMOTE_DIR && tar -xzf projecthub-clean-deployment.tar.gz"

# Pull latest images
echo "📥 Pulling latest clean images from Docker Hub..."
run_remote "docker pull telkombe/projecthub-backend:2.0.0"
run_remote "docker pull telkombe/projecthub-frontend:2.0.0"
run_remote "docker pull postgres:15-alpine"

# Start services
echo "🚀 Starting clean ProjectHub services..."
run_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.clean.yml up -d"

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check status
echo "📊 Checking service status..."
run_remote "cd $REMOTE_DIR && docker-compose -f docker-compose.clean.yml ps"

# Test services
echo "🧪 Testing services..."
echo "Database:"
run_remote "docker exec projecthub-mcp-postgres pg_isready -U projecthub -d projecthub_mcp"

echo "Backend:"
run_remote "curl -s http://localhost:3007/health | jq . || curl -s http://localhost:3007/health"

echo "Frontend:"
run_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost:5174"

echo ""
echo "✅ Clean ProjectHub deployment complete!"
echo ""
echo "🔗 Access Points:"
echo "   - Frontend: http://192.168.1.24:5174"
echo "   - Backend API: http://192.168.1.24:3007"
echo "   - Database: 192.168.1.24:5433"
echo ""
echo "👤 Default Login:"
echo "   - Email: admin@projecthub.com"
echo "   - Password: admin123 (CHANGE THIS!)"
echo ""
echo "📋 To view logs:"
echo "   docker logs projecthub-mcp-backend"
echo "   docker logs projecthub-mcp-frontend"
echo "   docker logs projecthub-mcp-postgres"
EOF

chmod +x deploy-to-synology.sh

echo "✅ Synology deployment script created: deploy-to-synology.sh"
echo ""

echo "🎯 Summary:"
echo "==========="
echo "✅ Clean backend and frontend images built and pushed to Docker Hub"
echo "✅ Clean deployment package created: projecthub-clean-deployment.tar.gz"
echo "✅ Synology deployment script created: deploy-to-synology.sh"
echo ""
echo "📝 Next Steps:"
echo "1. Commit and push changes to GitHub:"
echo "   git add -A"
echo "   git commit -m 'Add clean deployment without mock data'"
echo "   git push origin main"
echo ""
echo "2. Deploy to Synology (removes ALL existing data):"
echo "   ./deploy-to-synology.sh"
echo ""
echo "⚠️  WARNING: This will remove all existing ProjectHub data!"
echo "💡 The new deployment uses clean containers with empty database"