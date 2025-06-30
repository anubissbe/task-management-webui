// Fix frontend authorization header
const fs = require('fs');

const filePath = '/usr/share/nginx/html/assets/index-CFpqZcW1.js';
let content = fs.readFileSync(filePath, 'utf8');

// Log the current auth setup
console.log('Analyzing frontend auth setup...');

// Find the fetch wrapper function that should add auth headers
// Looking for patterns like: headers:{"Content-Type":"application/json",..._&&{Authorization:`Bearer ${_}`}
const authPatterns = [
  /\.\.\._&&\{Authorization:`Bearer \$\{_\}`\}/g,
  /Authorization:`Bearer \$\{_\}`/g,
  /Authorization:"Bearer " \+ _/g,
];

let foundAuth = false;
authPatterns.forEach(pattern => {
  if (content.match(pattern)) {
    console.log(`Found auth pattern: ${pattern}`);
    foundAuth = true;
  }
});

if (!foundAuth) {
  console.log('No Bearer auth pattern found, this might be the issue');
  
  // Look for where headers are being set in API calls
  // Find the pattern: headers:{"Content-Type":"application/json",...
  const headerPattern = /headers:\{"Content-Type":"application\/json"[^}]*\}/g;
  const matches = content.match(headerPattern);
  
  if (matches) {
    console.log(`Found ${matches.length} header configurations to fix`);
    
    // Replace to ensure Authorization header is included
    content = content.replace(
      /headers:\{"Content-Type":"application\/json",\.\.\._&&\{Authorization:`Bearer \$\{_\}`\},\.\.\.E\.headers\}/g,
      'headers:{"Content-Type":"application/json",...(_?{Authorization:`Bearer ${_}`}:{}),...(E.headers||{})}'
    );
    
    // Also try a more general pattern
    content = content.replace(
      /const P=\{([^}]+)headers:\{([^}]+)\}([^}]+)\}/g,
      (match, before, headers, after) => {
        // Check if Authorization is already in headers
        if (!headers.includes('Authorization')) {
          // Add authorization if token exists
          return `const P={${before}headers:{"Content-Type":"application/json",...(_?{Authorization:\`Bearer \${_}\`}:{}),${headers}}${after}}`;
        }
        return match;
      }
    );
  }
}

// Ensure localStorage uses correct key
content = content.replace(/localStorage\.getItem\("token"\)/g, 'localStorage.getItem("access_token")');

// Fix the specific API wrapper function
// Looking for: const _=u(),T=`${rB}${N}`,P={...E,headers:{"Content-Type":"application/json",..._&&{Authorization:`Bearer ${_}`},...E.headers}
const apiWrapperPattern = /const _=u\(\),T=`\$\{rB\}\$\{N\}`,P=\{\.\.\.E,headers:\{[^}]+\}/;
if (content.match(apiWrapperPattern)) {
  console.log('Found API wrapper pattern, fixing...');
  content = content.replace(
    /const _=u\(\),T=`\$\{rB\}\$\{N\}`,P=\{\.\.\.E,headers:\{"Content-Type":"application\/json",\.\.\._&&\{Authorization:`Bearer \$\{_\}`\},\.\.\.E\.headers\}/g,
    'const _=u(),T=`${rB}${N}`,P={...E,headers:{"Content-Type":"application/json",...(_?{Authorization:`Bearer ${_}`}:{}),...(E.headers||{})}}'
  );
}

fs.writeFileSync(filePath, content);
console.log('Frontend auth fix completed');