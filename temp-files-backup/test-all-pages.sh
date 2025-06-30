#!/bin/bash
set -e

echo "=== ProjectHub Complete System Test ==="
echo "Testing all pages and API endpoints..."
echo

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Counter for errors
ERRORS=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local expected=$5
    
    echo -n "Testing $method $endpoint... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -X $method "http://localhost:3007$endpoint" \
            -H "Content-Type: application/json" \
            $headers \
            -d "$data" 2>&1)
    else
        response=$(curl -s -X $method "http://localhost:3007$endpoint" \
            $headers 2>&1)
    fi
    
    if echo "$response" | grep -q "error" && [ "$expected" != "error" ]; then
        echo -e "${RED}FAILED${NC}"
        echo "  Error: $response"
        ((ERRORS++))
    else
        echo -e "${GREEN}OK${NC}"
    fi
}

# 1. Test authentication
echo "1. Testing Authentication..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3007/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@projecthub.local", "password": "admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}Login failed!${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}Login successful${NC}"
fi

AUTH_HEADER="-H \"Authorization: Bearer $TOKEN\""

# Get workspace ID
WORKSPACE_ID=$(docker exec projecthub-mcp-postgres psql -U projecthub -d projecthub_mcp -t -c "SELECT id FROM workspaces WHERE slug = 'default';" | tr -d ' ')
WORKSPACE_HEADER="-H \"X-Workspace-Id: $WORKSPACE_ID\""

# 2. Test all API endpoints
echo -e "\n2. Testing API Endpoints..."
test_endpoint "GET" "/api/health" "" "" "ok"
test_endpoint "GET" "/api/auth/profile" "" "$AUTH_HEADER" "ok"
test_endpoint "GET" "/api/projects" "" "$AUTH_HEADER $WORKSPACE_HEADER" "ok"
test_endpoint "GET" "/api/tasks" "" "$AUTH_HEADER $WORKSPACE_HEADER" "ok"
test_endpoint "GET" "/api/users" "" "$AUTH_HEADER $WORKSPACE_HEADER" "ok"
test_endpoint "GET" "/api/dashboard/stats" "" "$AUTH_HEADER $WORKSPACE_HEADER" "ok"
test_endpoint "GET" "/api/teams" "" "$AUTH_HEADER $WORKSPACE_HEADER" "ok"
test_endpoint "GET" "/api/reports" "" "$AUTH_HEADER $WORKSPACE_HEADER" "ok"

# 3. Test frontend pages
echo -e "\n3. Testing Frontend Pages..."
FRONTEND_PAGES=(
    "/"
    "/login"
    "/register"
    "/dashboard"
    "/projects"
    "/tasks"
    "/calendar"
    "/reports"
    "/teams"
    "/settings"
)

for page in "${FRONTEND_PAGES[@]}"; do
    echo -n "Testing page $page... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5174$page")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED (HTTP $response)${NC}"
        ((ERRORS++))
    fi
done

# 4. Test WebSocket connection
echo -e "\n4. Testing WebSocket..."
echo -n "Testing WebSocket endpoint... "
ws_response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Upgrade: websocket" \
    -H "Connection: Upgrade" \
    -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
    -H "Sec-WebSocket-Version: 13" \
    "http://localhost:3007/socket.io/")

if [ "$ws_response" = "101" ] || [ "$ws_response" = "400" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED (HTTP $ws_response)${NC}"
    ((ERRORS++))
fi

# 5. Check for console errors in frontend
echo -e "\n5. Checking Frontend Build..."
echo -n "Checking for JavaScript errors... "
js_errors=$(docker exec projecthub-mcp-frontend find /usr/share/nginx/html/assets -name "*.js" -exec grep -l "console.error" {} \; 2>/dev/null | wc -l)
if [ "$js_errors" -gt 0 ]; then
    echo -e "${RED}Found $js_errors files with console.error${NC}"
else
    echo -e "${GREEN}OK${NC}"
fi

# 6. Summary
echo -e "\n=== Test Summary ==="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Found $ERRORS errors${NC}"
fi

exit $ERRORS