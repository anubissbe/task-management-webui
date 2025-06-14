const puppeteer = require('puppeteer');

async function debugAPI() {
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
    console.log(`Request: ${request.method()} ${url}`);
    if (url.includes('api') || url.includes('3001')) {
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
  
  // Monitor console
  page.on('console', msg => {
    console.log('Browser console:', msg.type(), msg.text());
  });
  
  console.log('Navigating to http://localhost:5176...');
  
  try {
    await page.goto('http://localhost:5176', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('\nPage loaded, waiting for React Query...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check React Query state
    const queryState = await page.evaluate(() => {
      const table = document.querySelector('table');
      const emptyState = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent?.includes('No projects yet')
      );
      const loadingState = document.querySelector('.animate-spin');
      const errorState = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent?.includes('Failed to load projects')
      );
      
      return {
        hasTable: !!table,
        tableRows: table ? table.querySelectorAll('tbody tr').length : 0,
        hasEmptyState: !!emptyState,
        hasLoadingState: !!loadingState,
        hasErrorState: !!errorState,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('\nQuery State:', queryState);
    
    // Check if projectService is available
    const serviceCheck = await page.evaluate(() => {
      try {
        // Check if modules are loaded
        return {
          hasReactQuery: typeof window.ReactQuery !== 'undefined',
          moduleKeys: Object.keys(window).filter(k => k.includes('service') || k.includes('api'))
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('\nService Check:', serviceCheck);
    
    // Take screenshot
    await page.screenshot({ path: 'api-debug.png', fullPage: true });
    console.log('\nScreenshot saved as api-debug.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugAPI().catch(console.error);