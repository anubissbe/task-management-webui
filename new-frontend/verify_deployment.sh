#!/bin/bash
# Verify ProjectHub deployment

echo "🔍 Verifying ProjectHub deployment..."
echo ""

# Check Backend API
echo "1. Checking Backend API (http://192.168.1.24:3009)..."
curl -s http://192.168.1.24:3009/health | jq . 2>/dev/null || echo "   ❌ Backend API not responding"

# Check Frontend
echo ""
echo "2. Checking Frontend (http://192.168.1.24:5174)..."
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://192.168.1.24:5174/

# Check API endpoints
echo ""
echo "3. Testing API endpoints..."
echo "   - Projects endpoint:"
curl -s http://192.168.1.24:3009/api/projects | jq -r '.projects[0].name' 2>/dev/null && echo "   ✅ API is returning data" || echo "   ❌ API endpoint not working"

echo ""
echo "4. Summary:"
echo "   - Backend API: http://192.168.1.24:3009"
echo "   - Frontend UI: http://192.168.1.24:5174"
echo "   - PostgreSQL: 192.168.1.24:5434"
echo ""
echo "📋 To view container logs:"
echo "   ssh -p 2222 Bert@192.168.1.24"
echo "   cd /volume1/docker/projecthub"
echo "   sudo docker-compose logs -f"