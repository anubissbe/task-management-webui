// Security utilities for ProjectHub backend

const { URL } = require('url');

// Sanitize string for safe logging (prevent log injection)
function sanitizeForLog(str) {
  if (typeof str !== 'string') {
    return JSON.stringify(str).replace(/[\r\n]/g, ' ');
  }
  return str.replace(/[\r\n]/g, ' ');
}

// Validate webhook URL to prevent SSRF attacks
function isValidWebhookUrl(urlString) {
  try {
    const url = new URL(urlString);
    
    // Only allow HTTPS URLs
    if (url.protocol !== 'https:') {
      return false;
    }
    
    // Prevent local network access (SSRF protection)
    const hostname = url.hostname.toLowerCase();
    
    // Block localhost and common local addresses
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '[::1]',
      '[::ffff:127.0.0.1]'
    ];
    
    if (blockedHosts.includes(hostname)) {
      return false;
    }
    
    // Block private IP ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    
    if (match) {
      const octets = match.slice(1).map(Number);
      
      // 10.0.0.0/8
      if (octets[0] === 10) return false;
      
      // 172.16.0.0/12
      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false;
      
      // 192.168.0.0/16
      if (octets[0] === 192 && octets[1] === 168) return false;
      
      // 169.254.0.0/16 (link-local)
      if (octets[0] === 169 && octets[1] === 254) return false;
    }
    
    // Block metadata endpoints (AWS, GCP, Azure)
    const blockedDomains = [
      'metadata.google.internal',
      'metadata.goog',
      '169.254.169.254'
    ];
    
    if (blockedDomains.some(domain => hostname.includes(domain))) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Rate limiting map (simple in-memory for now)
const rateLimitMap = new Map();

// Simple rate limiter
function checkRateLimit(key, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const userLimits = rateLimitMap.get(key) || [];
  
  // Remove old entries
  const validLimits = userLimits.filter(time => now - time < windowMs);
  
  if (validLimits.length >= maxRequests) {
    return false;
  }
  
  validLimits.push(now);
  rateLimitMap.set(key, validLimits);
  
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, times] of rateLimitMap.entries()) {
    const validTimes = times.filter(time => now - time < 3600000); // Keep last hour
    if (validTimes.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, validTimes);
    }
  }
}, 300000); // Clean every 5 minutes

module.exports = {
  sanitizeForLog,
  isValidWebhookUrl,
  checkRateLimit
};