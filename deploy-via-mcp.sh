#!/bin/bash

# ProjectHub Clean Deployment via MCP Server
# This script deploys clean ProjectHub containers using the Synology MCP server

set -e

echo "🚀 Starting ProjectHub Clean Deployment via MCP Server"
echo "======================================================"

# Configuration
MCP_SERVER_URL="http://192.168.1.24:3001"
SYNOLOGY_HOST="192.168.1.24"

echo "📋 Step 1: Checking current container status..."
curl -X POST ${MCP_SERVER_URL}/tools/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "list_docker_containers", "arguments": {}}' \
  | jq '.result.containers[]?' || echo "No containers found"

echo -e "\n🔧 Step 2: Getting system information..."
curl -X POST ${MCP_SERVER_URL}/tools/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_system_info", "arguments": {}}' \
  | jq '.result'

echo -e "\n📁 Step 3: Checking shared folders..."
curl -X POST ${MCP_SERVER_URL}/tools/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "list_shared_folders", "arguments": {}}' \
  | jq '.result'

echo -e "\n💾 Step 4: Checking disk usage..."
curl -X POST ${MCP_SERVER_URL}/tools/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_disk_usage", "arguments": {}}' \
  | jq '.result'

echo -e "\n📦 Step 5: Extracting deployment files locally..."
mkdir -p /tmp/projecthub-clean
cd /tmp/projecthub-clean
tar -xzf /opt/projects/projects/projecthub-mcp-server/projecthub-clean-deployment.tar.gz

echo -e "\n📝 Step 6: Deployment package contents:"
ls -la

echo -e "\n✅ MCP Server connectivity verified!"
echo "Next steps would require SSH/SCP access to complete deployment."
echo "Please use the following deployment commands manually:"
echo ""
echo "1. Copy files to Synology:"
echo "   scp -P 2222 /tmp/projecthub-clean/* Bert@192.168.1.24:/volume1/docker/projecthub-clean/"
echo ""
echo "2. Execute deployment on Synology:"
echo "   ssh -p 2222 Bert@192.168.1.24"
echo "   cd /volume1/docker/projecthub-clean"
echo "   docker-compose -f docker-compose.clean.yml pull"
echo "   docker-compose -f docker-compose.clean.yml up -d"
echo ""
echo "3. Test endpoints:"
echo "   curl http://192.168.1.24:3007/health"
echo "   curl http://192.168.1.24:5174/"

echo -e "\n🏁 MCP deployment preparation complete!"