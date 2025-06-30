#!/bin/bash
echo "Testing complete auth flow..."

# Step 1: Login to get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@projecthub.local","password":"admin123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token from response (backend returns accessToken, not access_token)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token extracted: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "ERROR: No token received from login"
  exit 1
fi

# Step 2: Use token to access protected endpoint
echo -e "\n2. Accessing /api/workspaces with token..."
WORKSPACES_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET http://localhost:3007/api/workspaces \
  -H "Authorization: Bearer $TOKEN")

echo "Workspaces response: $WORKSPACES_RESPONSE"

# Step 3: Check projects endpoint too
echo -e "\n3. Accessing /api/projects with token..."
PROJECTS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X GET http://localhost:3007/api/projects \
  -H "Authorization: Bearer $TOKEN")

echo "Projects response: $PROJECTS_RESPONSE"

# Check backend logs for the requests
echo -e "\n4. Recent backend logs:"
docker logs projecthub-mcp-backend --tail 20 | grep -E "(AUTH DEBUG|Token preview|Authorization header)" | tail -10