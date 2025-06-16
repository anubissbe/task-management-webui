#!/bin/bash

# ProjectHub-MCP Installer Script
# This script installs ProjectHub-MCP with all required components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
POSTGRES_PASSWORD="projecthub_secure_2024"
POSTGRES_USER="projecthub"
POSTGRES_DB="projecthub_mcp"
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-secret-key-$(date +%s)")

# Functions
print_header() {
    echo -e "${BLUE}=================================================${NC}"
    echo -e "${BLUE}       ProjectHub-MCP Installer${NC}"
    echo -e "${BLUE}=================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
}

check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is installed"
        return 0
    elif docker compose version &> /dev/null; then
        print_success "Docker Compose (plugin) is installed"
        return 0
    else
        print_error "Docker Compose is not installed. Please install Docker Compose."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# Check if PostgreSQL is already running
check_postgres() {
    if docker ps --format '{{.Names}}' | grep -q "projecthub-postgres"; then
        print_info "PostgreSQL container already exists"
        return 0
    fi
    
    # Check if port 5432 is in use
    if nc -z localhost 5432 2>/dev/null; then
        print_info "Port 5432 is already in use. Using existing PostgreSQL."
        read -p "Enter PostgreSQL host [localhost]: " PG_HOST
        PG_HOST=${PG_HOST:-localhost}
        read -p "Enter PostgreSQL port [5432]: " PG_PORT
        PG_PORT=${PG_PORT:-5432}
        read -p "Enter PostgreSQL user: " PG_USER
        read -sp "Enter PostgreSQL password: " PG_PASSWORD
        echo ""
        POSTGRES_USER=$PG_USER
        POSTGRES_PASSWORD=$PG_PASSWORD
        USE_EXTERNAL_DB=true
    else
        USE_EXTERNAL_DB=false
    fi
}

# Create network if it doesn't exist
create_network() {
    if ! docker network ls | grep -q "projecthub-network"; then
        docker network create projecthub-network
        print_success "Created Docker network: projecthub-network"
    else
        print_info "Docker network already exists: projecthub-network"
    fi
}

# Install PostgreSQL if needed
install_postgres() {
    if [ "$USE_EXTERNAL_DB" = false ]; then
        print_info "Installing PostgreSQL..."
        
        docker run -d \
            --name projecthub-postgres \
            --network projecthub-network \
            -e POSTGRES_USER=$POSTGRES_USER \
            -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
            -e POSTGRES_DB=$POSTGRES_DB \
            -p 5432:5432 \
            -v projecthub_postgres_data:/var/lib/postgresql/data \
            --restart unless-stopped \
            postgres:16-alpine
        
        print_success "PostgreSQL installed"
        
        # Wait for PostgreSQL to be ready
        print_info "Waiting for PostgreSQL to be ready..."
        sleep 10
        
        # Initialize database schema
        print_info "Initializing database schema..."
        docker exec projecthub-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "
CREATE SCHEMA IF NOT EXISTS project_management;

CREATE TABLE IF NOT EXISTS project_management.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS project_management.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES project_management.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    assignee VARCHAR(100),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON project_management.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_management.tasks(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON project_management.projects(status);
"
        print_success "Database schema initialized"
    fi
}

# Install Backend
install_backend() {
    print_info "Installing ProjectHub-MCP Backend..."
    
    # Stop and remove existing backend if it exists
    docker stop projecthub-mcp-backend 2>/dev/null || true
    docker rm projecthub-mcp-backend 2>/dev/null || true
    
    # Pull latest backend image
    docker pull ghcr.io/anubissbe/projecthub-mcp-backend:latest
    
    # Determine database URL
    if [ "$USE_EXTERNAL_DB" = true ]; then
        DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${PG_HOST}:${PG_PORT}/${POSTGRES_DB}"
    else
        DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@projecthub-postgres:5432/${POSTGRES_DB}"
    fi
    
    # Run backend
    docker run -d \
        --name projecthub-mcp-backend \
        --network projecthub-network \
        -p 3001:3001 \
        -e NODE_ENV=production \
        -e DATABASE_URL="$DATABASE_URL" \
        -e CORS_ORIGIN="http://localhost:5173,http://$(hostname -I | awk '{print $1}'):5173" \
        -e JWT_SECRET="$JWT_SECRET" \
        -e LOG_LEVEL=info \
        --restart unless-stopped \
        ghcr.io/anubissbe/projecthub-mcp-backend:latest
    
    print_success "Backend installed and running on port 3001"
}

# Install Frontend
install_frontend() {
    print_info "Installing ProjectHub-MCP Frontend..."
    
    # Stop and remove existing frontend if it exists
    docker stop projecthub-mcp-frontend 2>/dev/null || true
    docker rm projecthub-mcp-frontend 2>/dev/null || true
    
    # Pull latest frontend image
    docker pull ghcr.io/anubissbe/projecthub-mcp-frontend:branded
    
    # Get host IP
    HOST_IP=$(hostname -I | awk '{print $1}')
    
    # Run frontend
    docker run -d \
        --name projecthub-mcp-frontend \
        --network projecthub-network \
        -p 5173:5173 \
        -e VITE_API_URL="http://localhost:3001/api" \
        -e VITE_WS_URL="http://localhost:3001" \
        --restart unless-stopped \
        ghcr.io/anubissbe/projecthub-mcp-frontend:branded
    
    print_success "Frontend installed and running on port 5173"
}

# Verify installation
verify_installation() {
    print_info "Verifying installation..."
    sleep 5
    
    # Check if containers are running
    if docker ps | grep -q projecthub-mcp-backend; then
        print_success "Backend is running"
    else
        print_error "Backend is not running"
        docker logs projecthub-mcp-backend --tail 20
    fi
    
    if docker ps | grep -q projecthub-mcp-frontend; then
        print_success "Frontend is running"
    else
        print_error "Frontend is not running"
        docker logs projecthub-mcp-frontend --tail 20
    fi
    
    # Test backend health
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Backend API is healthy"
    else
        print_error "Backend API is not responding"
    fi
}

# Main installation flow
main() {
    print_header
    
    print_info "Checking prerequisites..."
    check_docker
    check_docker_compose
    
    print_info "Setting up ProjectHub-MCP..."
    check_postgres
    create_network
    install_postgres
    install_backend
    install_frontend
    verify_installation
    
    echo ""
    print_header
    print_success "ProjectHub-MCP installation completed!"
    echo ""
    echo "Access your ProjectHub-MCP instance at:"
    echo -e "${GREEN}  • Local: http://localhost:5173${NC}"
    echo -e "${GREEN}  • Network: http://$(hostname -I | awk '{print $1}'):5173${NC}"
    echo ""
    echo "Default credentials have been set up."
    echo "Database: $POSTGRES_DB"
    echo ""
    echo "To stop ProjectHub-MCP:"
    echo "  docker stop projecthub-mcp-frontend projecthub-mcp-backend projecthub-postgres"
    echo ""
    echo "To start ProjectHub-MCP:"
    echo "  docker start projecthub-postgres projecthub-mcp-backend projecthub-mcp-frontend"
    echo ""
    echo "To view logs:"
    echo "  docker logs -f projecthub-mcp-backend"
    echo "  docker logs -f projecthub-mcp-frontend"
    echo ""
    print_info "Enjoy using ProjectHub-MCP! 🚀"
}

# Run main function
main