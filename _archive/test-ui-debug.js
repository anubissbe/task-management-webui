const puppeteer = require('puppeteer');

async function runTests() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', error => console.log('Page error:', error.message));
    page.on('requestfailed', request => console.log('Request failed:', request.url()));
    
    await page.setViewport({ width: 1280, height: 800 });
    
    try {
        console.log('Navigating to http://localhost:5174...');
        const response = await page.goto('http://localhost:5174', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log('Response status:', response.status());
        console.log('Response headers:', response.headers());
        
        // Wait a bit for React to render
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get page content
        const content = await page.content();
        console.log('\nPage content length:', content.length);
        
        // Check for root element
        const hasRoot = await page.evaluate(() => {
            const root = document.getElementById('root');
            return {
                exists: !!root,
                innerHTML: root ? root.innerHTML.substring(0, 200) : null,
                childCount: root ? root.children.length : 0
            };
        });
        
        console.log('\nRoot element:', hasRoot);
        
        // Check for any visible text
        const visibleText = await page.evaluate(() => {
            return document.body.innerText || document.body.textContent;
        });
        
        console.log('\nVisible text:', visibleText ? visibleText.substring(0, 200) : 'No visible text');
        
        // Take screenshot
        await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
        console.log('\nSaved debug screenshot');
        
        // Check for any errors in the body
        const bodyHTML = await page.evaluate(() => document.body.innerHTML);
        console.log('\nBody HTML preview:', bodyHTML.substring(0, 300));
        
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await browser.close();
    }
}

runTests().catch(console.error);