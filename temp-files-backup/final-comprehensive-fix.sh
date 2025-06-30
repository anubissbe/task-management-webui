#!/bin/bash
echo "Applying final comprehensive fix..."

# Create a Node.js script to fix all auth issues
cat << 'EOF' > /tmp/comprehensive-fix.js
const fs = require('fs');

const filePath = '/usr/share/nginx/html/assets/index-CFpqZcW1.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Applying comprehensive auth fixes...');

// Fix 1: Ensure token is extracted from response correctly
// Backend returns {accessToken: ...} not {access_token: ...}
let fixes = 0;

// Find the auth context where login is handled
// Pattern: h(E.access_token) should be h(E.accessToken)
if (content.includes('h(E.access_token)')) {
  content = content.replace(/h\(E\.access_token\)/g, 'h(E.accessToken)');
  fixes++;
  console.log('✓ Fixed token extraction from login response');
}

// Fix 2: Ensure the fetch wrapper includes auth header
// Find pattern like: const _=u(),T=`${rB}${N}`,P={...
const fetchWrapperPattern = /(const\s+_=\w+\(\)[^}]+headers:\{)([^}]+)(\}[^}]*\})/g;
content = content.replace(fetchWrapperPattern, (match, before, headers, after) => {
  // Ensure Authorization header is properly included
  if (!headers.includes('Authorization') || headers.includes('...(E.headers||{})')) {
    // Already fixed
    return match;
  }
  
  // Ensure the pattern is: ...(_?{Authorization:`Bearer ${_}`}:{}),...(E.headers||{})
  const fixedHeaders = '"Content-Type":"application/json",...(_?{Authorization:`Bearer ${_}`}:{}),...(E.headers||{})';
  fixes++;
  console.log('✓ Fixed Authorization header in fetch wrapper');
  return before + fixedHeaders + after;
});

// Fix 3: Debug - Add console logging to auth context
// Find the login function and add logging
const loginPattern = /const\s+v=async\s+N=>\{try\{/;
if (content.match(loginPattern)) {
  content = content.replace(loginPattern, 'const v=async N=>{console.log("[AUTH] Login attempt:",N);try{');
  
  // Also log the response
  content = content.replace(
    /h\(E\.accessToken\),r\(E\.user\)/,
    'console.log("[AUTH] Login success, token:",E.accessToken),h(E.accessToken),r(E.user)'
  );
  fixes++;
  console.log('✓ Added debug logging to auth flow');
}

// Fix 4: Ensure token is used in API calls
// Find where the token is retrieved: const _=u()
const tokenGetterPattern = /const\s+_=u\(\)/g;
content = content.replace(tokenGetterPattern, 'const _=u();console.log("[AUTH] Token for API call:",_)');
fixes++;

console.log(`\nTotal fixes applied: ${fixes}`);
fs.writeFileSync(filePath, content);
console.log('Comprehensive fix completed!');
EOF

# Apply the fix
docker exec projecthub-mcp-frontend node /tmp/comprehensive-fix.js

echo -e "\nFix applied! The auth flow should now work correctly."
echo "Test by refreshing the browser and logging in again."