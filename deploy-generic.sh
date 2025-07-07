#!/bin/bash

# ProjectHub MCP Generic Deployment Script
# This script provides a generic deployment template for any environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration variables
DEPLOY_DIR="${DEPLOY_DIR:-/opt/projecthub}"
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker-compose.yml}"
ENV_FILE="${ENV_FILE:-.env}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Function to create deployment directory
create_deploy_dir() {
    if [ ! -d "$DEPLOY_DIR" ]; then
        print_status "Creating deployment directory: $DEPLOY_DIR"
        sudo mkdir -p "$DEPLOY_DIR"
        sudo chown $USER:$USER "$DEPLOY_DIR"
    fi
}

# Function to copy files
copy_files() {
    print_status "Copying files to deployment directory..."
    cp -r . "$DEPLOY_DIR/"
    cd "$DEPLOY_DIR"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example "$ENV_FILE"
            print_warning "Created $ENV_FILE from template. Please review and update the configuration."
        else
            print_error "No .env.example file found. Please create $ENV_FILE manually."
            exit 1
        fi
    fi
    
    # Generate random passwords if they're still using defaults
    if grep -q "your_secure_password" "$ENV_FILE"; then
        RANDOM_PASSWORD=$(openssl rand -base64 32 | tr -d '/')
        sed -i "s/your_secure_password/$RANDOM_PASSWORD/g" "$ENV_FILE"
        print_status "Generated random database password"
    fi
    
    if grep -q "your_jwt_secret_key_here" "$ENV_FILE"; then
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '/')
        sed -i "s/your_jwt_secret_key_here/$JWT_SECRET/g" "$ENV_FILE"
        print_status "Generated random JWT secret"
    fi
}

# Function to deploy services
deploy_services() {
    print_status "Pulling latest images and starting services..."
    
    # Pull latest images from Docker Hub
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    
    # Start services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    print_status "Services started successfully!"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T postgres pg_isready -U projecthub; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Database failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for backend API
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -s http://localhost:3009/health > /dev/null; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Backend API failed to start within 60 seconds"
        exit 1
    fi
    
    print_status "All services are ready!"
}

# Function to show deployment info
show_deployment_info() {
    print_status "Deployment completed successfully!"
    echo ""
    echo "Access your ProjectHub installation at:"
    echo "  - Web Interface: http://localhost:8090"
    echo "  - API: http://localhost:3009"
    echo "  - MCP Server: http://localhost:3013"
    echo ""
    echo "Default admin credentials:"
    echo "  - Email: admin@projecthub.local"
    echo "  - Password: admin123"
    echo ""
    print_warning "Please change the default admin password after first login!"
    echo ""
    echo "To check service status:"
    echo "  docker-compose ps"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f [service_name]"
}

# Main deployment function
main() {
    print_status "Starting ProjectHub MCP deployment..."
    
    check_prerequisites
    create_deploy_dir
    copy_files
    setup_environment
    deploy_services
    wait_for_services
    show_deployment_info
}

# Handle script arguments
case "${1:-}" in
    "check")
        check_prerequisites
        ;;
    "setup-env")
        setup_environment
        ;;
    "deploy")
        deploy_services
        ;;
    "status")
        docker-compose ps
        ;;
    "logs")
        docker-compose logs -f "${2:-}"
        ;;
    "stop")
        docker-compose down
        ;;
    "restart")
        docker-compose restart
        ;;
    "update")
        docker-compose pull
        docker-compose up -d
        ;;
    *)
        main
        ;;
esac