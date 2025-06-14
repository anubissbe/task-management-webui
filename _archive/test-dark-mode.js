const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('Navigating to http://localhost:5173...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        
        // Wait for the page to load
        await page.waitForTimeout(2000);
        
        // Take screenshot in light mode
        await page.screenshot({ path: 'light-mode-screenshot.png', fullPage: true });
        console.log('Light mode screenshot saved');
        
        // Find and click the theme toggle button
        console.log('Looking for theme toggle button...');
        
        // Try multiple selectors
        let themeToggle = await page.locator('button:has-text("🌙")').first();
        if (!await themeToggle.isVisible()) {
            themeToggle = await page.locator('button:has-text("☀️")').first();
        }
        if (!await themeToggle.isVisible()) {
            themeToggle = await page.locator('[aria-label*="theme"]').first();
        }
        if (!await themeToggle.isVisible()) {
            themeToggle = await page.locator('button').filter({ hasText: /theme|dark|light/i }).first();
        }
        
        // Log all buttons for debugging
        const buttons = await page.locator('button').all();
        console.log(`Found ${buttons.length} buttons on the page`);
        for (let i = 0; i < buttons.length; i++) {
            const text = await buttons[i].textContent();
            console.log(`Button ${i}: "${text}"`);
        }
        
        if (await themeToggle.isVisible()) {
            await themeToggle.click();
            console.log('Clicked theme toggle');
            
            // Wait for theme transition
            await page.waitForTimeout(1000);
            
            // Take screenshot in dark mode
            await page.screenshot({ path: 'dark-mode-screenshot.png', fullPage: true });
            console.log('Dark mode screenshot saved');
            
            // Check for dark mode classes
            const htmlElement = await page.locator('html');
            const classList = await htmlElement.getAttribute('class');
            console.log('HTML classes:', classList);
            
            // Analyze readability issues
            console.log('\nAnalyzing dark mode elements...');
            
            // Check table visibility
            const table = await page.locator('table').first();
            if (await table.isVisible()) {
                const tableStyles = await table.evaluate(el => window.getComputedStyle(el));
                console.log('Table background:', await table.evaluate(el => window.getComputedStyle(el).backgroundColor));
                console.log('Table color:', await table.evaluate(el => window.getComputedStyle(el).color));
            }
            
            // Check text elements
            const textElements = await page.locator('td, th, p, h1, h2, h3').all();
            console.log(`Found ${textElements.length} text elements`);
            
            // Keep browser open for manual inspection
            console.log('\nBrowser will remain open for manual inspection. Press Ctrl+C to close.');
            await page.waitForTimeout(30000);
            
        } else {
            console.log('Theme toggle button not found');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
})();