// Add debug logging to auth middleware
const fs = require('fs');
const authPath = '/app/dist/middleware/auth.js';
let content = fs.readFileSync(authPath, 'utf8');

// Add logging at the beginning of authenticate function
content = content.replace(
  'const authenticate = async (req, res, next) => {',
  `const authenticate = async (req, res, next) => {
    console.log('=== AUTH DEBUG ===');
    console.log('Headers:', Object.keys(req.headers));
    console.log('Authorization header:', req.headers.authorization);
    console.log('Cookie header:', req.headers.cookie);`
);

// Add logging to getTokenFromHeader
content = content.replace(
  'static getTokenFromHeader(authHeader) {',
  `static getTokenFromHeader(authHeader) {
    console.log('getTokenFromHeader called with:', authHeader);`
);

// Add logging to verifyAccessToken
content = content.replace(
  'static verifyAccessToken(token) {',
  `static verifyAccessToken(token) {
    console.log('verifyAccessToken called with token length:', token ? token.length : 'null');
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');`
);

fs.writeFileSync(authPath, content);
console.log('Debug logging added successfully');