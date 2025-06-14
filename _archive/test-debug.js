const puppeteer = require('puppeteer');

async function debugTest() {
  const browser = await puppeteer.launch({ 
    headless: false,  // Open visible browser
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Listen to console messages
  page.on('console', msg => {
    console.log('Browser console:', msg.type(), msg.text());
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });
  
  // Listen to request failures
  page.on('requestfailed', request => {
    console.error('Request failed:', request.url(), request.failure().errorText);
  });
  
  console.log('Navigating to http://localhost:5173...');
  
  try {
    const response = await page.goto('http://localhost:5173', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    console.log('Response status:', response.status());
    console.log('Response URL:', response.url());
    
    // Wait a bit for any JS to execute
    await page.waitForTimeout(3000);
    
    // Get page content
    const content = await page.content();
    console.log('\nPage content length:', content.length);
    
    // Check what's in the body
    const bodyContent = await page.evaluate(() => {
      return {
        bodyHTML: document.body.innerHTML.substring(0, 500),
        rootElement: document.getElementById('root')?.innerHTML || 'No root element',
        allScripts: Array.from(document.scripts).map(s => s.src || s.innerHTML.substring(0, 100)),
        errors: window.__errors || []
      };
    });
    
    console.log('\nBody content:', bodyContent.bodyHTML);
    console.log('\nRoot element:', bodyContent.rootElement);
    console.log('\nScripts:', bodyContent.allScripts);
    
    // Take a screenshot
    await page.screenshot({ path: 'debug-page.png', fullPage: true });
    console.log('\nScreenshot saved as debug-page.png');
    
  } catch (error) {
    console.error('Navigation error:', error);
  }
  
  // Keep browser open for manual inspection
  console.log('\nBrowser will stay open. Press Ctrl+C to close.');
  
  // Wait indefinitely
  await new Promise(() => {});
}

debugTest().catch(console.error);