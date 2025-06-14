# UI Tests for Task Management Web UI

This directory contains automated UI tests using Puppeteer.

## Prerequisites

- Frontend running on http://localhost:5173
- Backend API running on http://localhost:3001
- Puppeteer installed (via MCP server or locally)

## Running Tests

### Using MCP Puppeteer Server
The puppeteer MCP server is configured and can run these tests.

### Local Testing
```bash
# Install puppeteer locally if needed
npm install puppeteer

# Run tests
node tests/ui-test.js
```

## Test Coverage

1. **Page Load Test**
   - Verifies the application loads successfully
   - Checks for #root element

2. **Navigation Test**
   - Verifies navigation bar exists
   - Checks for Projects, Board, and Analytics links

3. **Theme Toggle Test**
   - Verifies theme toggle button exists
   - Tests theme switching functionality
   - Takes screenshots before and after toggle

4. **Project List Test**
   - Checks for project list heading
   - Verifies component renders

5. **API Health Test**
   - Tests backend connectivity
   - Verifies API health endpoint

## Screenshots

Screenshots are saved to `tests/screenshots/`:
- `before-theme-toggle.png` - Initial theme state
- `after-theme-toggle.png` - After theme change
- `final-state.png` - Final application state

## Expected Results

All tests should pass with output similar to:
```
Starting UI tests for Task Management Web UI...

Test 1: Page Load
✅ Page loaded successfully

Test 2: Navigation Elements
✅ All navigation elements found

Test 3: Theme Toggle Button
✅ Theme toggle button found

Test 4: Theme Toggle Functionality
✅ Theme toggle works correctly
   Theme changed from light to dark

Test 5: Project List Component
✅ Project list heading found

Test 6: Backend API Health Check
✅ Backend API is healthy

==================================================
TEST SUMMARY
==================================================
Total Tests: 6
Passed: 6
Failed: 0
Success Rate: 100.0%
==================================================
```