// Analyze and fix frontend auth
const fs = require('fs');

const filePath = '/usr/share/nginx/html/assets/index-CFpqZcW1.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('Analyzing frontend code...');

// Find the API wrapper function that should add auth headers
// Looking for the pattern where the fetch config is built
// Typically: const P={...E,headers:{...}}

// Search for the function that gets the token from localStorage
const tokenGetterPattern = /const\s+(\w+)=\(\)=>localStorage\.getItem\("access_token"\)/;
const tokenGetterMatch = content.match(tokenGetterPattern);
if (tokenGetterMatch) {
  console.log(`Found token getter function: ${tokenGetterMatch[1]}`);
}

// Find where the API call configuration is built
// Looking for patterns like: headers:{"Content-Type":"application/json",...
const configPatterns = [
  /const\s+P=\{[^}]+headers:\{[^}]+\}[^}]+\}/g,
  /headers:\{"Content-Type":"application\/json"[^}]*\}/g,
];

configPatterns.forEach((pattern, index) => {
  const matches = content.match(pattern);
  if (matches) {
    console.log(`Pattern ${index + 1} found ${matches.length} times`);
    matches.slice(0, 3).forEach((match, i) => {
      console.log(`  Match ${i + 1}: ${match.substring(0, 100)}...`);
    });
  }
});

// Look for the specific API wrapper - usually follows pattern:
// const _=u(), where u() gets the token
// Then builds config object P
const apiWrapperPattern = /const\s+_=(\w+)\(\),T=`\$\{(\w+)\}\$\{(\w+)\}`,P=\{([^}]+)headers:\{([^}]+)\}([^}]+)\}/;
const wrapperMatch = content.match(apiWrapperPattern);
if (wrapperMatch) {
  console.log('Found API wrapper function:');
  console.log(`  Token getter: ${wrapperMatch[1]}()`);
  console.log(`  Headers section: ${wrapperMatch[5]}`);
  
  // Check if Authorization is already in the headers
  if (!wrapperMatch[5].includes('Authorization')) {
    console.log('  WARNING: Authorization header not found in headers!');
  }
}

// Save analysis results
fs.writeFileSync('/tmp/frontend-analysis.txt', JSON.stringify({
  hasTokenGetter: !!tokenGetterMatch,
  configPatternsFound: configPatterns.map(p => !!content.match(p)),
  hasApiWrapper: !!wrapperMatch
}, null, 2));

console.log('Analysis complete. Results saved to /tmp/frontend-analysis.txt');