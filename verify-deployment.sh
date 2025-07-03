#!/bin/bash

# ProjectHub Clean Deployment Verification Script
# This script verifies the deployment status of ProjectHub on Synology NAS

set -e

echo "🔍 ProjectHub Deployment Verification"
echo "====================================="

# Configuration
SYNOLOGY_HOST="192.168.1.24"
MCP_SERVER_URL="http://${SYNOLOGY_HOST}:3001"
BACKEND_URL="http://${SYNOLOGY_HOST}:3007"
FRONTEND_URL="http://${SYNOLOGY_HOST}:5174"
DATABASE_PORT="5433"

echo "📋 Step 1: Testing MCP Server connectivity..."
if curl -s -X POST ${MCP_SERVER_URL}/tools/list > /dev/null; then
    echo "✅ MCP Server is responding"
else
    echo "❌ MCP Server is not responding"
    exit 1
fi

echo -e "\n🐳 Step 2: Checking Docker containers via MCP..."
CONTAINERS=$(curl -s -X POST ${MCP_SERVER_URL}/tools/call \
    -H "Content-Type: application/json" \
    -d '{"tool": "list_docker_containers", "arguments": {}}')

if echo "$CONTAINERS" | grep -q "projecthub"; then
    echo "✅ ProjectHub containers found"
    echo "$CONTAINERS" | jq '.result.containers[]? | select(.name | contains("projecthub"))'
else
    echo "❌ No ProjectHub containers found"
fi

echo -e "\n🏥 Step 3: Testing Backend health endpoint..."
if curl -s -f ${BACKEND_URL}/health > /dev/null; then
    echo "✅ Backend health endpoint is responding"
    curl -s ${BACKEND_URL}/health | jq '.'
else
    echo "❌ Backend health endpoint is not responding"
fi

echo -e "\n🖥️  Step 4: Testing Frontend accessibility..."
if curl -s -f ${FRONTEND_URL}/ > /dev/null; then
    echo "✅ Frontend is accessible"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${FRONTEND_URL}/)
    echo "Frontend HTTP Status: $HTTP_STATUS"
else
    echo "❌ Frontend is not accessible"
fi

echo -e "\n💾 Step 5: Testing Database connectivity..."
if nc -z ${SYNOLOGY_HOST} ${DATABASE_PORT} 2>/dev/null; then
    echo "✅ Database port ${DATABASE_PORT} is accessible"
else
    echo "❌ Database port ${DATABASE_PORT} is not accessible"
fi

echo -e "\n📊 Step 6: Getting system information..."
SYSTEM_INFO=$(curl -s -X POST ${MCP_SERVER_URL}/tools/call \
    -H "Content-Type: application/json" \
    -d '{"tool": "get_system_info", "arguments": {}}')
echo "System Info:"
echo "$SYSTEM_INFO" | jq '.result'

echo -e "\n💿 Step 7: Checking disk usage..."
DISK_INFO=$(curl -s -X POST ${MCP_SERVER_URL}/tools/call \
    -H "Content-Type: application/json" \
    -d '{"tool": "get_disk_usage", "arguments": {}}')
echo "Disk Usage:"
echo "$DISK_INFO" | jq '.result.output' | sed 's/\\n/\n/g' | tr -d '"'

echo -e "\n🔗 Step 8: Service URLs Summary"
echo "================================"
echo "Frontend:     ${FRONTEND_URL}"
echo "Backend API:  ${BACKEND_URL}"
echo "Database:     ${SYNOLOGY_HOST}:${DATABASE_PORT}"
echo "MCP Server:   ${MCP_SERVER_URL}"

echo -e "\n✅ Deployment verification completed!"
echo "If all services are responding, the deployment is successful."
echo ""
echo "Next steps:"
echo "1. Access the frontend at: ${FRONTEND_URL}"
echo "2. Test API endpoints at: ${BACKEND_URL}/health"
echo "3. Monitor logs via SSH: ssh -p 2222 Bert@${SYNOLOGY_HOST}"