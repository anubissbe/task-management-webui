# ProjectHub Clean Deployment Instructions for Synology NAS

## Overview
This document provides step-by-step instructions for deploying the clean ProjectHub containers to the Synology NAS at 192.168.1.24.

## Prerequisites
- SSH access to Synology NAS (Port 2222, User: Bert)
- Docker and Docker Compose installed on Synology
- MCP server running on port 3001
- Clean deployment package available

## Deployment Process

### Step 1: Verify MCP Server Status
```bash
# Check if MCP server is running
curl -X POST http://192.168.1.24:3001/tools/list
```

### Step 2: Connect to Synology NAS
```bash
# SSH to Synology (use port 2222)
ssh -p 2222 Bert@192.168.1.24
```

### Step 3: Clean Up Existing Containers
```bash
# Stop existing ProjectHub containers
docker stop projecthub-mcp-backend projecthub-mcp-frontend projecthub-mcp-postgres 2>/dev/null || true

# Remove existing containers
docker rm projecthub-mcp-backend projecthub-mcp-frontend projecthub-mcp-postgres 2>/dev/null || true

# Remove old networks and volumes
docker network rm projecthub-mcp-server_projecthub-mcp-network 2>/dev/null || true
docker volume rm projecthub-mcp-server_postgres_data 2>/dev/null || true
```

### Step 4: Create Deployment Directory
```bash
# Create deployment directory
mkdir -p /volume1/docker/projecthub-clean
cd /volume1/docker/projecthub-clean
```

### Step 5: Create Docker Compose Configuration
```bash
# Create docker-compose.clean.yml
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
```

### Step 6: Create Database Initialization Script
```bash
# Create init-db.sql
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
```

### Step 7: Pull Docker Images
```bash
# Pull the required Docker images
docker pull telkombe/projecthub-backend:2.0.0
docker pull telkombe/projecthub-frontend:2.0.0
docker pull postgres:15-alpine
```

### Step 8: Start Services
```bash
# Start all services with Docker Compose
docker-compose -f docker-compose.clean.yml up -d
```

### Step 9: Wait for Services to Initialize
```bash
# Wait for services to fully start
sleep 30
```

### Step 10: Verify Deployment
```bash
# Check container status
docker ps | grep projecthub

# Test backend health
curl -f http://localhost:3007/health

# Test frontend
curl -f http://localhost:5174/

# Test database
docker exec projecthub-mcp-postgres pg_isready -U projecthub -d projecthub_mcp
```

### Step 11: Check Logs
```bash
# View recent logs for each service
echo "=== Backend logs ==="
docker logs --tail 10 projecthub-mcp-backend

echo "=== Frontend logs ==="
docker logs --tail 10 projecthub-mcp-frontend

echo "=== Database logs ==="
docker logs --tail 10 projecthub-mcp-postgres
```

## Post-Deployment Access

After successful deployment, the services will be available at:

- **Frontend**: http://192.168.1.24:5174
- **Backend API**: http://192.168.1.24:3007
- **Database**: Port 5433 (internal PostgreSQL)

## Troubleshooting

### Common Issues

1. **Port Conflicts**: If ports 3007 or 5174 are already in use, stop existing services first
2. **Database Connection**: Check if the database container is healthy before starting backend
3. **Network Issues**: Ensure the custom network is created properly

### Useful Commands

```bash
# Stop all services
docker-compose -f docker-compose.clean.yml down

# Stop and remove volumes
docker-compose -f docker-compose.clean.yml down -v

# View real-time logs
docker-compose -f docker-compose.clean.yml logs -f

# Restart specific service
docker-compose -f docker-compose.clean.yml restart backend
```

## MCP Server Integration

The deployment creates containers that can be managed via the Synology MCP server:

```bash
# List containers via MCP
curl -X POST http://192.168.1.24:3001/tools/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "list_docker_containers", "arguments": {}}'
```

## Security Notes

1. Change the default JWT secret in the backend environment
2. Update the default admin password in the database
3. Consider using environment files for sensitive configuration
4. Review firewall rules for the exposed ports

## Monitoring

Monitor the deployment using:
- Docker health checks (built into each service)
- MCP server tools for container status
- Application logs for troubleshooting
- Health endpoints for service verification