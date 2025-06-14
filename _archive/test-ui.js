const puppeteer = require('puppeteer');
const path = require('path');

async function runTests() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    const results = {
        pageLoad: false,
        navigation: false,
        themeToggle: false,
        projectList: false,
        apiHealth: false,
        navigationClick: false
    };
    
    try {
        // 1. Page Load Test
        console.log('\n=== Page Load Test ===');
        await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });
        await page.waitForSelector('#root', { timeout: 5000 });
        const rootContent = await page.$eval('#root', el => el.innerHTML);
        if (rootContent && rootContent.length > 0) {
            results.pageLoad = true;
            console.log('✓ Page loaded successfully');
            console.log(`✓ #root element exists with ${rootContent.length} characters of content`);
        } else {
            console.log('✗ Page load failed or #root is empty');
        }
        
        // 2. Navigation Test
        console.log('\n=== Navigation Test ===');
        try {
            // Check for navigation links
            const navLinks = await page.evaluate(() => {
                const links = document.querySelectorAll('nav a');
                return Array.from(links).map(link => link.textContent);
            });
            
            console.log(`Found navigation links: ${navLinks.join(', ')}`);
            
            const requiredLinks = ['Projects', 'Board', 'Analytics'];
            const hasAllLinks = requiredLinks.every(link => navLinks.includes(link));
            
            // Check for title
            const titleExists = await page.evaluate(() => {
                const elements = document.querySelectorAll('*');
                for (let el of elements) {
                    if (el.textContent && el.textContent.includes('Task Management')) {
                        return true;
                    }
                }
                return false;
            });
            
            if (hasAllLinks && titleExists) {
                results.navigation = true;
                console.log('✓ All navigation elements found');
            } else {
                console.log(`✗ Missing navigation elements. Has all links: ${hasAllLinks}, Title exists: ${titleExists}`);
            }
        } catch (navError) {
            console.log(`✗ Navigation test error: ${navError.message}`);
        }
        
        // 3. Theme Toggle Test
        console.log('\n=== Theme Toggle Test ===');
        try {
            // Take initial screenshot
            await page.screenshot({ path: 'initial-state.png', fullPage: true });
            console.log('✓ Saved initial-state.png');
            
            // Check initial theme
            const initialTheme = await page.evaluate(() => {
                return document.documentElement.classList.contains('dark');
            });
            console.log(`Initial theme: ${initialTheme ? 'dark' : 'light'}`);
            
            // Find and click theme toggle
            const themeButton = await page.$('[aria-label="Toggle theme"]');
            if (themeButton) {
                await themeButton.click();
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait for transition
                
                const newTheme = await page.evaluate(() => {
                    return document.documentElement.classList.contains('dark');
                });
                
                if (newTheme !== initialTheme) {
                    results.themeToggle = true;
                    console.log(`✓ Theme toggled successfully to ${newTheme ? 'dark' : 'light'}`);
                    await page.screenshot({ path: 'dark-theme.png', fullPage: true });
                    console.log('✓ Saved dark-theme.png');
                } else {
                    console.log('✗ Theme did not change after toggle');
                }
            } else {
                console.log('✗ Theme toggle button not found');
            }
        } catch (themeError) {
            console.log(`✗ Theme toggle test error: ${themeError.message}`);
        }
        
        // 4. Project List Test
        console.log('\n=== Project List Test ===');
        try {
            // Check for Projects heading
            const hasProjectsHeading = await page.evaluate(() => {
                const headings = document.querySelectorAll('h1, h2');
                return Array.from(headings).some(h => h.textContent.includes('Projects'));
            });
            
            // Check for Add project button
            const hasAddButton = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button');
                return Array.from(buttons).some(btn => 
                    btn.textContent.toLowerCase().includes('add project')
                );
            });
            
            // Check for table or empty state
            const hasTable = await page.evaluate(() => {
                return document.querySelector('table') !== null;
            });
            
            const hasEmptyState = await page.evaluate(() => {
                const elements = document.querySelectorAll('*');
                return Array.from(elements).some(el => 
                    el.textContent && (
                        el.textContent.includes('No projects') || 
                        el.textContent.includes('Create your first project')
                    )
                );
            });
            
            console.log(`Projects heading: ${hasProjectsHeading ? '✓' : '✗'}`);
            console.log(`Add project button: ${hasAddButton ? '✓' : '✗'}`);
            console.log(`Table or empty state: ${(hasTable || hasEmptyState) ? '✓' : '✗'}`);
            
            if (hasProjectsHeading && hasAddButton && (hasTable || hasEmptyState)) {
                results.projectList = true;
                console.log('✓ Project list elements found');
            } else {
                console.log('✗ Missing project list elements');
            }
        } catch (projectError) {
            console.log(`✗ Project list test error: ${projectError.message}`);
        }
        
        // 5. API Health Check
        console.log('\n=== API Health Check ===');
        try {
            const response = await page.evaluate(async () => {
                const res = await fetch('http://localhost:3001/api/health');
                return {
                    status: res.status,
                    data: await res.json()
                };
            });
            
            if (response.status === 200 && response.data.status === 'ok') {
                results.apiHealth = true;
                console.log('✓ API health check passed');
                console.log(`Response: ${JSON.stringify(response.data)}`);
            } else {
                console.log(`✗ API health check failed. Status: ${response.status}`);
            }
        } catch (apiError) {
            console.log(`✗ API health check error: ${apiError.message}`);
        }
        
        // 6. Navigation Click Test
        console.log('\n=== Navigation Click Test ===');
        try {
            // Click on Board link
            const boardLink = await page.evaluate(() => {
                const links = document.querySelectorAll('a');
                for (let link of links) {
                    if (link.textContent === 'Board') {
                        link.click();
                        return true;
                    }
                }
                return false;
            });
            
            if (boardLink) {
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait for navigation
                
                const currentUrl = page.url();
                const isOnBoard = currentUrl.includes('/board');
                
                // Check for board content
                const hasBoardContent = await page.evaluate(() => {
                    const pageText = document.body.textContent;
                    return pageText.includes('Board') || pageText.includes('board');
                });
                
                if (isOnBoard && hasBoardContent) {
                    results.navigationClick = true;
                    console.log('✓ Navigation to Board page successful');
                    console.log(`Current URL: ${currentUrl}`);
                    await page.screenshot({ path: 'board-page.png', fullPage: true });
                    console.log('✓ Saved board-page.png');
                } else {
                    console.log(`✗ Navigation failed. On board: ${isOnBoard}, Has content: ${hasBoardContent}`);
                }
            } else {
                console.log('✗ Board link not found');
            }
        } catch (navClickError) {
            console.log(`✗ Navigation click test error: ${navClickError.message}`);
        }
        
    } catch (error) {
        console.error('Test execution error:', error);
    } finally {
        // Print summary
        console.log('\n=== TEST SUMMARY ===');
        console.log(`Page Load Test: ${results.pageLoad ? 'PASS ✓' : 'FAIL ✗'}`);
        console.log(`Navigation Test: ${results.navigation ? 'PASS ✓' : 'FAIL ✗'}`);
        console.log(`Theme Toggle Test: ${results.themeToggle ? 'PASS ✓' : 'FAIL ✗'}`);
        console.log(`Project List Test: ${results.projectList ? 'PASS ✓' : 'FAIL ✗'}`);
        console.log(`API Health Check: ${results.apiHealth ? 'PASS ✓' : 'FAIL ✗'}`);
        console.log(`Navigation Click Test: ${results.navigationClick ? 'PASS ✓' : 'FAIL ✗'}`);
        
        const totalPassed = Object.values(results).filter(r => r).length;
        console.log(`\nTotal: ${totalPassed}/6 tests passed`);
        
        await browser.close();
    }
}

runTests().catch(console.error);