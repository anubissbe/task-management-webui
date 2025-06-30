// Final comprehensive auth fix
const fs = require('fs');

const filePath = '/usr/share/nginx/html/assets/index-CFpqZcW1.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Applying final auth fix...');

// First, ensure localStorage uses correct key consistently
content = content.replace(/localStorage\.getItem\("token"\)/g, 'localStorage.getItem("access_token")');
console.log('✓ Fixed localStorage key references');

// Fix the main API wrapper function
// The pattern seems to be: headers:{"Content-Type":"application/json",...(_?{Authorization:`Bearer ${_}`}:{}),...
// But it might be malformed. Let's find and fix it properly

// Find the exact pattern and fix it
const brokenPattern = /headers:\{"Content-Type":"application\/json",\.\.\.\(_\?\{Authorization:`Bearer \$\{_/g;
if (content.match(brokenPattern)) {
  console.log('Found broken Authorization pattern, fixing...');
  
  // First attempt - fix the truncated pattern
  content = content.replace(
    /headers:\{"Content-Type":"application\/json",\.\.\.\(_\?\{Authorization:`Bearer \$\{_[^}]*\}/g,
    'headers:{"Content-Type":"application/json",...(_?{Authorization:`Bearer ${_}`}:{})'
  );
}

// Alternative fix - look for the complete fetch configuration and ensure it's correct
// Pattern: const _=u(),T=`${rB}${N}`,P={...E,headers:{...},credentials:"include"}
const fetchConfigPattern = /(const\s+_=\w+\(\),T=`[^`]+`,P=\{[^}]+headers:\{)([^}]+)(\}[^}]*\})/g;
content = content.replace(fetchConfigPattern, (match, before, headers, after) => {
  console.log('Found fetch config, checking headers...');
  
  // Check if Authorization is properly included
  if (!headers.includes('Authorization') || headers.includes('..._?{')) {
    console.log('Fixing malformed Authorization header...');
    // Ensure proper header configuration
    const fixedHeaders = '"Content-Type":"application/json",...(_?{Authorization:`Bearer ${_}`}:{}),...(E.headers||{})';
    return before + fixedHeaders + after;
  }
  
  return match;
});

// Also check for any standalone Authorization header patterns that might be broken
content = content.replace(
  /\.\.\.\(_\?\{Authorization:`Bearer \$\{_\}`\}:\{\}\)/g,
  '...(_?{Authorization:`Bearer ${_}`}:{})'
);

// One more pattern - sometimes the ternary operator is written differently
content = content.replace(
  /\.\.\._&&\{Authorization:`Bearer \$\{_\}`\}/g,
  '...(_?{Authorization:`Bearer ${_}`}:{})'
);

// Verify the fix worked
if (content.includes('Authorization:`Bearer ${_}`')) {
  console.log('✓ Authorization header pattern found and verified');
} else {
  console.log('⚠️  Warning: Authorization header pattern not found after fixes');
}

fs.writeFileSync(filePath, content);
console.log('Final auth fix completed!');