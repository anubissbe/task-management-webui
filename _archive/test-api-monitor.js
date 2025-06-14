const puppeteer = require('puppeteer');

async function monitorAPI() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Enable request interception
  await page.setRequestInterception(true);
  
  const apiCalls = [];
  
  // Monitor all requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('3001')) {
      console.log(`API Request: ${request.method()} ${url}`);
      apiCalls.push({
        method: request.method(),
        url: url,
        headers: request.headers()
      });
    }
    request.continue();
  });
  
  // Monitor responses
  page.on('response', response => {
    const url = response.url();
    if (url.includes('api') || url.includes('3001')) {
      console.log(`API Response: ${response.status()} ${url}`);
    }
  });
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  
  console.log('Navigating to http://localhost:5176...');
  
  try {
    await page.goto('http://localhost:5176', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('Page loaded, waiting for potential API calls...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log(`\nTotal API calls made: ${apiCalls.length}`);
    
    if (apiCalls.length === 0) {
      console.log('\nNo API calls detected. Checking for errors...');
      
      // Check browser console for errors
      const errors = await page.evaluate(() => {
        return window.__errors || [];
      });
      
      // Check if API service is configured
      const apiConfig = await page.evaluate(() => {
        // Try to find API configuration
        return {
          hasAxios: typeof window.axios !== 'undefined',
          hasApiService: typeof window.apiService !== 'undefined',
          localStorage: Object.keys(localStorage),
          apiBaseUrl: window.API_BASE_URL || 'not found'
        };
      });
      
      console.log('\nAPI Configuration:', apiConfig);
      
      // Try to manually trigger an API call
      console.log('\nAttempting to trigger API call manually...');
      const apiResult = await page.evaluate(async () => {
        try {
          const response = await fetch('http://localhost:3001/api/projects');
          return {
            success: true,
            status: response.status,
            data: await response.text()
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      console.log('Manual API call result:', apiResult);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

monitorAPI().catch(console.error);