#!/bin/bash

# ==============================================
# ProjectHub-MCP Automated Deployment Script
# ==============================================
# 
# This script automatically deploys ProjectHub-MCP with PostgreSQL
# and provides a complete, ready-to-use environment.
#
# Usage: ./start.sh [options]
# Options:
#   --production    Deploy in production mode
#   --dev          Deploy in development mode (default)
#   --stop         Stop all services
#   --restart      Restart all services
#   --logs         Show logs
#   --clean        Clean up containers and volumes
#   --help         Show this help message
#
# ==============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="projecthub-mcp"
COMPOSE_PROJECT_NAME="projecthub-mcp"
DEFAULT_MODE="dev"
MODE=${DEFAULT_MODE}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}"
    echo "========================================"
    echo "   ProjectHub-MCP Deployment Tool"
    echo "========================================"
    echo -e "${NC}"
}

# Function to check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker is ready"
}

# Function to create environment file if it doesn't exist
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        if [ -f .env.example ]; then
            cp .env.example .env
        else
            # Create a basic .env file
            cat > .env << EOF
# ProjectHub-MCP Environment Configuration
NODE_ENV=${MODE}
PORT=3007

# Database Configuration
DATABASE_URL=postgresql://projecthub:projecthub_password@postgres:5432/projecthub_mcp
POSTGRES_USER=projecthub
POSTGRES_PASSWORD=projecthub_password
POSTGRES_DB=projecthub_mcp

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-change-this-in-production

# Email Configuration (Optional - configure for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Webhook Configuration
WEBHOOK_SECRET=your-webhook-secret-change-this-in-production

# Frontend Configuration
REACT_APP_API_URL=http://localhost:3007/api
VITE_API_URL=http://localhost:3007/api
EOF
        fi
        print_success "Environment file created"
        print_warning "Please update .env file with your actual configuration values"
    else
        print_success "Environment file already exists"
    fi
}

# Function to create docker-compose.yml if it doesn't exist
setup_docker_compose() {
    print_status "Setting up Docker Compose configuration..."
    
    if [ ! -f docker-compose.yml ]; then
        print_status "Creating docker-compose.yml..."
        cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: projecthub-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-projecthub}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-projecthub_password}
      POSTGRES_DB: ${POSTGRES_DB:-projecthub_mcp}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./complete-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
    ports:
      - "5433:5432"
    networks:
      - projecthub-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-projecthub} -d ${POSTGRES_DB:-projecthub_mcp}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: projecthub-backend
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_SECURE: ${SMTP_SECURE}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
      WEBHOOK_SECRET: ${WEBHOOK_SECRET}
    ports:
      - "3007:3007"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - projecthub-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3007/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (Alpine.js - Lightweight option)
  frontend-alpine:
    build:
      context: ./new-frontend
      dockerfile: Dockerfile
    container_name: projecthub-frontend-alpine
    restart: unless-stopped
    ports:
      - "8090:80"
    depends_on:
      - backend
    networks:
      - projecthub-network
    environment:
      - API_URL=http://backend:3007/api

  # Frontend (React - Full-featured option)
  frontend-react:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: projecthub-frontend-react
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - projecthub-network
    environment:
      - REACT_APP_API_URL=http://localhost:3007/api

volumes:
  postgres_data:
    driver: local

networks:
  projecthub-network:
    driver: bridge
EOF
        print_success "Docker Compose configuration created"
    else
        print_success "Docker Compose configuration already exists"
    fi
}

# Function to start services
start_services() {
    print_status "Starting ProjectHub-MCP services..."
    
    # Use the simplified demo compose file by default
    if [ -f docker-compose.demo.yml ]; then
        print_status "Using lightweight Alpine.js frontend deployment..."
        docker-compose -f docker-compose.demo.yml --project-name ${COMPOSE_PROJECT_NAME} up -d --build
    else
        # Fallback to main compose file
        docker-compose --project-name ${COMPOSE_PROJECT_NAME} up -d --build
    fi
    
    print_success "Services started successfully!"
    echo ""
    print_status "Service URLs:"
    echo -e "  ${CYAN}• PostgreSQL Database:${NC} localhost:5433"
    echo -e "  ${CYAN}• Backend API:${NC} http://localhost:3007"
    echo -e "  ${CYAN}• Alpine.js Frontend:${NC} http://localhost:8090"
    echo -e "  ${CYAN}• React Frontend:${NC} http://localhost:3000"
    echo ""
    print_status "API Health Check: http://localhost:3007/health"
    print_status "API Documentation: http://localhost:3007/api-docs"
    echo ""
}

# Function to stop services
stop_services() {
    print_status "Stopping ProjectHub-MCP services..."
    if [ -f docker-compose.demo.yml ]; then
        docker-compose -f docker-compose.demo.yml --project-name ${COMPOSE_PROJECT_NAME} down
    else
        docker-compose --project-name ${COMPOSE_PROJECT_NAME} down
    fi
    print_success "Services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting ProjectHub-MCP services..."
    docker-compose --project-name ${COMPOSE_PROJECT_NAME} restart
    print_success "Services restarted"
}

# Function to show logs
show_logs() {
    print_status "Showing service logs (Ctrl+C to exit)..."
    docker-compose --project-name ${COMPOSE_PROJECT_NAME} logs -f
}

# Function to clean up
clean_services() {
    print_warning "This will remove all containers, volumes, and data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up ProjectHub-MCP..."
        docker-compose --project-name ${COMPOSE_PROJECT_NAME} down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    echo -e "\n${BLUE}Database Status:${NC}"
    if docker-compose --project-name ${COMPOSE_PROJECT_NAME} exec -T postgres pg_isready -U projecthub -d projecthub_mcp; then
        print_success "Database is healthy"
    else
        print_error "Database is not healthy"
    fi
    
    echo -e "\n${BLUE}Backend API Status:${NC}"
    if curl -f -s http://localhost:3007/health > /dev/null; then
        print_success "Backend API is healthy"
    else
        print_error "Backend API is not responding"
    fi
    
    echo -e "\n${BLUE}Frontend Status:${NC}"
    if curl -f -s http://localhost:8090 > /dev/null; then
        print_success "Alpine.js Frontend is healthy"
    else
        print_error "Alpine.js Frontend is not responding"
    fi
    
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_success "React Frontend is healthy"
    else
        print_error "React Frontend is not responding"
    fi
}

# Function to show help
show_help() {
    echo "ProjectHub-MCP Deployment Script"
    echo ""
    echo "Usage: ./start.sh [options]"
    echo ""
    echo "Options:"
    echo "  --production    Deploy in production mode"
    echo "  --dev          Deploy in development mode (default)"
    echo "  --stop         Stop all services"
    echo "  --restart      Restart all services"
    echo "  --logs         Show logs"
    echo "  --health       Check service health"
    echo "  --clean        Clean up containers and volumes"
    echo "  --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh                 # Start in development mode"
    echo "  ./start.sh --production    # Start in production mode"
    echo "  ./start.sh --stop          # Stop all services"
    echo "  ./start.sh --logs          # Show service logs"
    echo "  ./start.sh --clean         # Clean up everything"
    echo ""
}

# Parse command line arguments
case "${1:-}" in
    --production)
        MODE="production"
        export NODE_ENV=production
        ;;
    --dev)
        MODE="development"
        export NODE_ENV=development
        ;;
    --stop)
        print_header
        stop_services
        exit 0
        ;;
    --restart)
        print_header
        restart_services
        exit 0
        ;;
    --logs)
        show_logs
        exit 0
        ;;
    --health)
        print_header
        check_health
        exit 0
        ;;
    --clean)
        print_header
        clean_services
        exit 0
        ;;
    --help|-h)
        show_help
        exit 0
        ;;
    "")
        # Default: start in development mode
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac

# Main execution
main() {
    print_header
    print_status "Starting ProjectHub-MCP deployment in ${MODE} mode..."
    
    check_docker
    setup_environment
    setup_docker_compose
    start_services
    
    echo ""
    print_success "🚀 ProjectHub-MCP is now running!"
    echo ""
    print_status "Next steps:"
    echo -e "  ${CYAN}1.${NC} Visit http://localhost:8090 (Alpine.js) or http://localhost:3000 (React)"
    echo -e "  ${CYAN}2.${NC} Check service health: ./start.sh --health"
    echo -e "  ${CYAN}3.${NC} View logs: ./start.sh --logs"
    echo -e "  ${CYAN}4.${NC} Stop services: ./start.sh --stop"
    echo ""
    print_warning "Remember to configure your .env file for production use!"
    echo ""
}

# Run main function
main "$@"