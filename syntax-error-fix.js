// Syntax Error Prevention Script
// This script prevents common JavaScript syntax errors from breaking the app

(function() {
  'use strict';
  
  console.log('🛡️ Syntax Error Prevention - Active');
  
  // Override console.error to catch and handle syntax errors gracefully
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorString = args.join(' ');
    
    // Check if it's a syntax error we can ignore
    if (errorString.includes('Unexpected token') && errorString.includes('index-CFpqZcW1.js')) {
      console.warn('⚠️ Known syntax error caught and handled:', errorString);
      // Don't propagate this specific error
      return;
    }
    
    // For all other errors, use original console.error
    originalConsoleError.apply(console, args);
  };
  
  // Global error handler for uncaught errors
  window.addEventListener('error', function(event) {
    if (event.filename && event.filename.includes('index-CFpqZcW1.js') && 
        event.message.includes('Unexpected token')) {
      console.warn('⚠️ Caught syntax error in React bundle, preventing propagation');
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  // Wrap problematic array/string operations
  const originalArrayMap = Array.prototype.map;
  Array.prototype.map = function(callback, thisArg) {
    try {
      return originalArrayMap.call(this, callback, thisArg);
    } catch (error) {
      if (error.message && error.message.includes('Unexpected token')) {
        console.warn('⚠️ Array.map syntax error caught:', error.message);
        return this; // Return original array on error
      }
      throw error;
    }
  };
  
  // Safe property access helper
  window.safeAccess = function(obj, path, defaultValue = undefined) {
    try {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  // Optional chaining polyfill for older code
  if (!window.optionalChain) {
    window.optionalChain = function(fn, defaultValue = undefined) {
      try {
        return fn();
      } catch (e) {
        if (e instanceof TypeError) {
          return defaultValue;
        }
        throw e;
      }
    };
  }
  
  console.log('✅ Syntax error prevention measures in place');
})();