#!/bin/bash

# ProjectHub-Mcp Backend Diagnostic Script
# Run this on your Synology to diagnose the 500 error

echo "=== ProjectHub-Mcp Backend Diagnostics ==="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo: sudo ./diagnose-backend.sh"
    exit 1
fi

# Find docker command
DOCKER_CMD=$(which docker || echo "/usr/local/bin/docker")
echo "Using Docker: $DOCKER_CMD"
echo ""

# Check container status
echo "1. Container Status:"
$DOCKER_CMD ps -a | grep -E "NAMES|projecthub" || echo "No ProjectHub containers found"
echo ""

# Check backend logs
echo "2. Backend Logs (last 50 lines):"
BACKEND_CONTAINER=$($DOCKER_CMD ps -a --format "{{.Names}}" | grep -E "projecthub.*backend|backend.*projecthub" | head -1)
if [ -n "$BACKEND_CONTAINER" ]; then
    $DOCKER_CMD logs $BACKEND_CONTAINER --tail 50 2>&1
else
    echo "❌ No backend container found"
fi
echo ""

# Check database connectivity
echo "3. Database Connection Test:"
if [ -n "$BACKEND_CONTAINER" ]; then
    echo "Checking DATABASE_URL environment variable..."
    $DOCKER_CMD exec $BACKEND_CONTAINER printenv DATABASE_URL || echo "DATABASE_URL not set"
    
    echo ""
    echo "Testing PostgreSQL connection..."
    # Extract database details
    DB_HOST="192.168.1.24"
    DB_PORT="5433"
    
    # Test network connectivity
    nc -zv $DB_HOST $DB_PORT 2>&1 || echo "Cannot connect to PostgreSQL at $DB_HOST:$DB_PORT"
fi
echo ""

# Check backend health endpoint
echo "4. Backend Health Check:"
BACKEND_PORT=$($DOCKER_CMD port $BACKEND_CONTAINER 3001 2>/dev/null | cut -d: -f2 || echo "3001")
curl -s http://localhost:$BACKEND_PORT/api/health || echo "❌ Health endpoint not responding"
echo ""

# Check for common issues
echo "5. Common Issues Check:"

# Check if schema exists
echo "Checking if project_management schema exists..."
if [ -n "$BACKEND_CONTAINER" ]; then
    $DOCKER_CMD exec $BACKEND_CONTAINER sh -c 'echo "SELECT schema_name FROM information_schema.schemata WHERE schema_name = '\''project_management'\'';" | psql $DATABASE_URL -t 2>&1' || echo "Cannot query database"
fi

echo ""
echo "6. Container Environment:"
if [ -n "$BACKEND_CONTAINER" ]; then
    $DOCKER_CMD exec $BACKEND_CONTAINER printenv | grep -E "NODE_ENV|DATABASE_URL|CORS_ORIGIN" | sed 's/PASSWORD=[^&]*/PASSWORD=***/'
fi

echo ""
echo "=== Diagnostic Summary ==="
echo ""
echo "Most common causes of 500 errors:"
echo "1. Database connection failed (wrong credentials or host)"
echo "2. Missing project_management schema in database"
echo "3. Database user lacks permissions"
echo "4. Network connectivity issues"
echo ""
echo "To fix schema issues, run this SQL on your PostgreSQL:"
echo "CREATE SCHEMA IF NOT EXISTS project_management;"
echo ""