#!/bin/bash

# Simple script to update ProjectHub containers on Synology
# Run this on your Synology NAS after containers are pushed to Docker Hub

echo "🚀 Updating ProjectHub containers with webhook fix..."
echo "================================================"

# Navigate to project directory
cd /volume1/docker/projecthub-mcp-server || exit 1

# Pull latest containers from Docker Hub
echo ""
echo "📥 Pulling latest containers from Docker Hub..."
docker pull telkombe/projecthub-backend:latest
docker pull telkombe/projecthub-frontend:latest

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose down

# Start updated containers
echo ""
echo "🚀 Starting updated containers..."
docker-compose up -d

# Wait for containers to start
echo ""
echo "⏳ Waiting for containers to start..."
sleep 10

# Check status
echo ""
echo "📊 Container status:"
docker-compose ps

# Show logs for backend to verify webhook functionality
echo ""
echo "📋 Recent backend logs (checking for webhook endpoints):"
docker logs projecthub-backend --tail 20 | grep -E "(webhook|Webhook|WEBHOOK)" || echo "No webhook logs yet"

echo ""
echo "✅ Update complete!"
echo ""
echo "🧪 To test the webhook fix:"
echo "1. Open http://192.168.1.24:5174"
echo "2. Go to Settings > Webhooks"
echo "3. Add your Slack webhook URL"
echo "4. Click 'Test' - should work without CORS errors!"
echo ""
echo "📝 Monitor webhook activity:"
echo "docker logs -f projecthub-backend | grep -i webhook"