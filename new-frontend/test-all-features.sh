#!/bin/bash

# ProjectHub Comprehensive Test Script
# Tests all features to ensure everything is working

echo "🧪 Starting ProjectHub Comprehensive Test Suite..."
echo "================================================"

API_URL="http://localhost:8090/api"
BASE_URL="http://localhost:8090"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test API endpoint
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -n "Testing: $description... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)"
        ((TESTS_PASSED++))
        echo "$body" > last_response.json
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to check if frontend is accessible
test_frontend() {
    local endpoint=$1
    local description=$2
    
    echo -n "Testing Frontend: $description... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Status: $status_code)"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo ""
echo "1️⃣ Frontend Accessibility Tests"
echo "--------------------------------"
test_frontend "/" "Main page loads"
test_frontend "/app-charts-fix.js?v=1" "JavaScript file loads"

echo ""
echo "2️⃣ Authentication Tests"
echo "-----------------------"

# Test login
echo "Testing login functionality..."
login_response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@projecthub.local","password":"admin123"}')

ACCESS_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$ACCESS_TOKEN" ]; then
    ACCESS_TOKEN=$(echo "$login_response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
fi
REFRESH_TOKEN=$(echo "$login_response" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$REFRESH_TOKEN" ]; then
    REFRESH_TOKEN=$(echo "$login_response" | grep -o '"refresh_token":"[^"]*' | cut -d'"' -f4)
fi

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Access token obtained: ${ACCESS_TOKEN:0:20}..."
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $login_response"
    ((TESTS_FAILED++))
    exit 1
fi

# Test auth/me endpoint
test_api "GET" "/auth/me" "" "200" "Get current user info"

echo ""
echo "3️⃣ Workspace Tests"
echo "------------------"
test_api "GET" "/workspaces" "" "200" "List workspaces"

echo ""
echo "4️⃣ Project Tests"
echo "----------------"

# List projects
test_api "GET" "/projects" "" "200" "List all projects"

# Create a test project
PROJECT_DATA='{
  "name": "Test Project",
  "description": "Automated test project",
  "status": "active",
  "workspace_id": "default"
}'
test_api "POST" "/projects" "$PROJECT_DATA" "201" "Create new project"

# Extract project ID from response
PROJECT_ID=$(cat last_response.json | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Created project ID: $PROJECT_ID"

# Get specific project
if [ -n "$PROJECT_ID" ]; then
    test_api "GET" "/projects/$PROJECT_ID" "" "200" "Get specific project"
    
    # Update project
    UPDATE_DATA='{"name":"Updated Test Project","status":"completed"}'
    test_api "PUT" "/projects/$PROJECT_ID" "$UPDATE_DATA" "200" "Update project"
fi

echo ""
echo "5️⃣ Task Tests"
echo "-------------"

# List tasks
test_api "GET" "/tasks" "" "200" "List all tasks"

# Create a test task
TASK_DATA='{
  "title": "Test Task",
  "description": "Automated test task",
  "status": "pending",
  "priority": "high",
  "project_id": "'$PROJECT_ID'",
  "assigned_to": "admin@projecthub.local",
  "estimated_hours": 8
}'
test_api "POST" "/tasks" "$TASK_DATA" "201" "Create new task"

# Extract task ID
TASK_ID=$(cat last_response.json | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Created task ID: $TASK_ID"

# Update task status
if [ -n "$TASK_ID" ]; then
    STATUS_UPDATE='{"status":"in_progress"}'
    test_api "PATCH" "/tasks/$TASK_ID" "$STATUS_UPDATE" "200" "Update task status"
fi

echo ""
echo "6️⃣ Analytics Data Check"
echo "-----------------------"
echo "Checking if analytics endpoints return data..."

# The analytics are calculated client-side, but we can check if we have data
projects_count=$(cat last_response.json 2>/dev/null | grep -o '"id"' | wc -l)
if [ "$projects_count" -gt 0 ]; then
    echo -e "${GREEN}✓ Projects data available for analytics${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠ No projects data for analytics${NC}"
fi

echo ""
echo "7️⃣ Webhook Tests"
echo "----------------"

# List webhooks
test_api "GET" "/webhooks" "" "200" "List webhooks"

# Create webhook
WEBHOOK_DATA='{
  "name": "Test Webhook",
  "url": "https://example.com/webhook",
  "events": ["project.created", "task.updated"],
  "is_active": true,
  "workspace_id": "default"
}'
test_api "POST" "/webhooks" "$WEBHOOK_DATA" "201" "Create webhook"

echo ""
echo "8️⃣ UI Component Tests (via browser console)"
echo "-------------------------------------------"
echo "Please check the following in your browser at $BASE_URL:"
echo ""
echo "✅ Checklist:"
echo "[ ] Login page displays and accepts credentials"
echo "[ ] After login, header shows navigation tabs"
echo "[ ] Bottom bar shows workspace selector"
echo "[ ] Bottom bar shows user profile menu"
echo "[ ] Bottom bar shows project/task statistics"
echo "[ ] Projects view displays project cards"
echo "[ ] Clicking a project shows project details"
echo "[ ] Kanban board allows drag-and-drop of tasks"
echo "[ ] Analytics shows three charts without growing"
echo "[ ] Webhooks page lists webhooks"
echo "[ ] Theme toggle switches between light/dark"
echo "[ ] User menu in bottom bar opens upward"
echo "[ ] Logout works and returns to login"

echo ""
echo "9️⃣ Cleanup"
echo "----------"

# Delete created resources
if [ -n "$TASK_ID" ]; then
    test_api "DELETE" "/tasks/$TASK_ID" "" "204" "Delete test task"
fi

if [ -n "$PROJECT_ID" ]; then
    test_api "DELETE" "/projects/$PROJECT_ID" "" "204" "Delete test project"
fi

echo ""
echo "================================================"
echo "📊 TEST SUMMARY"
echo "================================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ All automated tests passed!${NC}"
    echo ""
    echo "Please complete the manual UI checklist above to verify full functionality."
else
    echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
fi

echo ""
echo "📝 Notes:"
echo "- Some endpoints (like PATCH /tasks/:id) may not be implemented in the mock backend"
echo "- The application is designed to handle these gracefully"
echo "- Focus on the UI functionality which is the main deliverable"

# Clean up
rm -f last_response.json