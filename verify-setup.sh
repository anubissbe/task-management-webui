#!/bin/bash

# ProjectHub MCP Setup Verification Script
# This script verifies that ProjectHub is properly configured and running

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Verification functions
check_docker() {
    print_header "Docker Environment"
    
    if command -v docker &> /dev/null; then
        print_status "Docker is installed"
        docker --version
    else
        print_error "Docker is not installed"
        return 1
    fi
    
    if command -v docker-compose &> /dev/null; then
        print_status "Docker Compose is installed"
        docker-compose --version
    else
        print_error "Docker Compose is not installed"
        return 1
    fi
}

check_environment() {
    print_header "Environment Configuration"
    
    if [ -f ".env" ]; then
        print_status ".env file exists"
        
        # Check for required variables
        if grep -q "JWT_SECRET=" .env && ! grep -q "your_jwt_secret_key_here" .env; then
            print_status "JWT_SECRET is configured"
        else
            print_warning "JWT_SECRET needs to be set in .env file"
        fi
        
        if grep -q "DB_PASSWORD=" .env && ! grep -q "your_secure_password" .env; then
            print_status "DB_PASSWORD is configured"
        else
            print_warning "DB_PASSWORD should be customized in .env file"
        fi
    else
        print_error ".env file not found. Copy from .env.example"
        return 1
    fi
}

check_ports() {
    print_header "Port Availability"
    
    # Check default ports
    local ports=(3009 8090 5434)
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            if docker-compose ps | grep -q ":$port->"; then
                print_status "Port $port is in use by ProjectHub"
            else
                print_warning "Port $port is in use by another service"
            fi
        else
            print_status "Port $port is available"
        fi
    done
}

check_containers() {
    print_header "Container Status"
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found"
        return 1
    fi
    
    # Check container status
    if docker-compose ps | grep -q "Up"; then
        print_status "Some containers are running"
        
        # Check individual services
        if docker-compose ps postgres | grep -q "Up"; then
            print_status "PostgreSQL database is running"
        else
            print_warning "PostgreSQL database is not running"
        fi
        
        if docker-compose ps backend | grep -q "Up"; then
            print_status "Backend API is running"
        else
            print_warning "Backend API is not running"
        fi
        
        if docker-compose ps frontend | grep -q "Up"; then
            print_status "Frontend is running"
        else
            print_warning "Frontend is not running"
        fi
    else
        print_warning "No containers are running. Start with: docker-compose up -d"
    fi
}

check_health() {
    print_header "Health Checks"
    
    # Check backend health
    if curl -s http://localhost:3009/health > /dev/null 2>&1; then
        print_status "Backend API is healthy"
        
        # Get health details
        response=$(curl -s http://localhost:3009/health)
        if echo "$response" | grep -q '"status":"healthy"'; then
            print_status "Backend reports healthy status"
        fi
    else
        print_error "Backend API health check failed"
        print_info "Try: curl http://localhost:3009/health"
    fi
    
    # Check frontend
    if curl -s http://localhost:8090 > /dev/null 2>&1; then
        print_status "Frontend is accessible"
    else
        print_error "Frontend is not accessible"
        print_info "Try: curl http://localhost:8090"
    fi
    
    # Check database connectivity (if backend is up)
    if curl -s http://localhost:3009/api/health/db > /dev/null 2>&1; then
        print_status "Database connectivity is working"
    else
        print_warning "Database connectivity check failed"
    fi
}

show_access_info() {
    print_header "Access Information"
    
    echo -e "${GREEN}Web Interface:${NC}  http://localhost:8090"
    echo -e "${GREEN}Backend API:${NC}    http://localhost:3009"
    echo -e "${GREEN}Health Check:${NC}   http://localhost:3009/health"
    echo -e "${GREEN}Database:${NC}       localhost:5434 (external access)"
    echo ""
    echo -e "${YELLOW}Default Login:${NC}"
    echo -e "  Email:    admin@projecthub.local"
    echo -e "  Password: admin123"
    echo ""
    echo -e "${RED}⚠️  Remember to change the default password after first login!${NC}"
}

show_troubleshooting() {
    print_header "Troubleshooting Commands"
    
    echo "View container status:"
    echo "  docker-compose ps"
    echo ""
    echo "View logs:"
    echo "  docker-compose logs backend"
    echo "  docker-compose logs frontend"
    echo "  docker-compose logs postgres"
    echo ""
    echo "Restart services:"
    echo "  docker-compose restart"
    echo ""
    echo "Full reset (DELETES ALL DATA):"
    echo "  docker-compose down -v"
    echo "  docker-compose up -d"
}

# Main verification process
main() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "    ProjectHub MCP Setup Verification"
    echo "=================================================="
    echo -e "${NC}"
    
    # Run all checks
    check_docker || exit 1
    check_environment || exit 1
    check_ports
    check_containers
    check_health
    show_access_info
    
    # Final status
    print_header "Verification Complete"
    
    if curl -s http://localhost:3009/health > /dev/null 2>&1 && curl -s http://localhost:8090 > /dev/null 2>&1; then
        print_status "ProjectHub appears to be running correctly!"
        echo ""
        echo -e "${GREEN}🎉 You can now access ProjectHub at: http://localhost:8090${NC}"
    else
        print_warning "Some issues were detected. Check the troubleshooting section below."
        show_troubleshooting
    fi
}

# Handle script arguments
case "${1:-}" in
    "docker")
        check_docker
        ;;
    "env")
        check_environment
        ;;
    "ports")
        check_ports
        ;;
    "containers")
        check_containers
        ;;
    "health")
        check_health
        ;;
    "info")
        show_access_info
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [check]"
        echo ""
        echo "Available checks:"
        echo "  docker      - Check Docker installation"
        echo "  env         - Check environment configuration"
        echo "  ports       - Check port availability"
        echo "  containers  - Check container status"
        echo "  health      - Check service health"
        echo "  info        - Show access information"
        echo ""
        echo "Run without arguments to perform all checks"
        ;;
    *)
        main
        ;;
esac