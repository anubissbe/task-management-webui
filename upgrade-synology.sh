#!/bin/bash

# ProjectHub-Mcp Synology Upgrade Script
# This script upgrades ProjectHub-Mcp containers on Synology NAS

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== ProjectHub-Mcp Synology Upgrade Script ===${NC}"
echo ""

# Configuration
FRONTEND_IMAGE="ghcr.io/anubissbe/projecthub-mcp-frontend:branded"
BACKEND_IMAGE="ghcr.io/anubissbe/projecthub-mcp-backend:latest"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running on Synology
if [ ! -f /etc/synoinfo.conf ]; then
    print_error "This script should be run on a Synology NAS"
    exit 1
fi

print_info "Starting upgrade process..."

# Step 1: Pull latest images
print_info "Pulling latest container images..."
docker pull $FRONTEND_IMAGE
if [ $? -eq 0 ]; then
    print_success "Frontend image pulled successfully"
else
    print_error "Failed to pull frontend image"
    exit 1
fi

docker pull $BACKEND_IMAGE
if [ $? -eq 0 ]; then
    print_success "Backend image pulled successfully"
else
    print_error "Failed to pull backend image"
    exit 1
fi

# Step 2: Find existing containers
print_info "Finding existing ProjectHub containers..."
FRONTEND_CONTAINER=$(docker ps -a --format "{{.Names}}" | grep -E "projecthub.*frontend|frontend.*projecthub" | head -1)
BACKEND_CONTAINER=$(docker ps -a --format "{{.Names}}" | grep -E "projecthub.*backend|backend.*projecthub" | head -1)

if [ -z "$FRONTEND_CONTAINER" ]; then
    print_error "No frontend container found. Please check your setup."
    echo "Available containers:"
    docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
    exit 1
fi

if [ -z "$BACKEND_CONTAINER" ]; then
    print_error "No backend container found. Please check your setup."
    echo "Available containers:"
    docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
    exit 1
fi

print_success "Found containers:"
echo "  - Frontend: $FRONTEND_CONTAINER"
echo "  - Backend: $BACKEND_CONTAINER"

# Step 3: Stop existing containers
print_info "Stopping existing containers..."
docker stop $FRONTEND_CONTAINER $BACKEND_CONTAINER
print_success "Containers stopped"

# Step 4: Backup container configurations
print_info "Backing up container configurations..."
docker inspect $FRONTEND_CONTAINER > /tmp/frontend-config-backup.json
docker inspect $BACKEND_CONTAINER > /tmp/backend-config-backup.json
print_success "Configurations backed up"

# Step 5: Get environment variables and settings from existing containers
print_info "Extracting container settings..."

# Get backend environment variables
BACKEND_ENV=$(docker inspect $BACKEND_CONTAINER | jq -r '.[0].Config.Env[]' | grep -E "DATABASE_URL|CORS_ORIGIN|JWT_SECRET|NODE_ENV" | sed 's/^/-e /')
BACKEND_PORT=$(docker inspect $BACKEND_CONTAINER | jq -r '.[0].NetworkSettings.Ports."3001/tcp"[0].HostPort // "3001"')

# Get frontend environment variables  
FRONTEND_ENV=$(docker inspect $FRONTEND_CONTAINER | jq -r '.[0].Config.Env[]' | grep -E "VITE_API_URL|VITE_WS_URL" | sed 's/^/-e /')
FRONTEND_PORT=$(docker inspect $FRONTEND_CONTAINER | jq -r '.[0].NetworkSettings.Ports."5173/tcp"[0].HostPort // "5173"')

# Get network
NETWORK=$(docker inspect $BACKEND_CONTAINER | jq -r '.[0].NetworkSettings.Networks | keys[0]')

# Step 6: Remove old containers
print_info "Removing old containers..."
docker rm $FRONTEND_CONTAINER $BACKEND_CONTAINER
print_success "Old containers removed"

# Step 7: Create new containers with same settings
print_info "Creating new containers..."

# Create backend container
docker run -d \
    --name $BACKEND_CONTAINER \
    --network $NETWORK \
    -p $BACKEND_PORT:3001 \
    $BACKEND_ENV \
    --restart unless-stopped \
    $BACKEND_IMAGE

if [ $? -eq 0 ]; then
    print_success "Backend container created"
else
    print_error "Failed to create backend container"
    exit 1
fi

# Create frontend container
docker run -d \
    --name $FRONTEND_CONTAINER \
    --network $NETWORK \
    -p $FRONTEND_PORT:5173 \
    $FRONTEND_ENV \
    --restart unless-stopped \
    $FRONTEND_IMAGE

if [ $? -eq 0 ]; then
    print_success "Frontend container created"
else
    print_error "Failed to create frontend container"
    exit 1
fi

# Step 8: Verify containers are running
print_info "Verifying containers..."
sleep 5

if docker ps | grep -q $FRONTEND_CONTAINER; then
    print_success "Frontend container is running"
else
    print_error "Frontend container is not running"
    docker logs $FRONTEND_CONTAINER --tail 20
fi

if docker ps | grep -q $BACKEND_CONTAINER; then
    print_success "Backend container is running"
else
    print_error "Backend container is not running"
    docker logs $BACKEND_CONTAINER --tail 20
fi

# Step 9: Test connectivity
print_info "Testing backend health..."
if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    print_success "Backend API is healthy"
else
    print_error "Backend API is not responding"
fi

# Step 10: Summary
echo ""
echo -e "${GREEN}=== Upgrade Complete ===${NC}"
echo ""
echo "Container Status:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAMES|$FRONTEND_CONTAINER|$BACKEND_CONTAINER"
echo ""
echo "Access your upgraded ProjectHub-Mcp at:"
echo "  http://$(hostname -I | awk '{print $1}'):$FRONTEND_PORT"
echo ""
echo "Backup configurations saved to:"
echo "  - /tmp/frontend-config-backup.json"
echo "  - /tmp/backend-config-backup.json"
echo ""
print_info "If you encounter any issues, you can restore from these backups."