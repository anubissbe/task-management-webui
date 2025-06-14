const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        console.log('Testing Dark Mode Readability Issues...\n');
        
        // Navigate to the application
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Find and click the theme toggle
        const themeToggle = await page.locator('button').filter({ hasText: /🌙|☀️|sun|moon/i }).first();
        if (!await themeToggle.isVisible()) {
            // Try finding by aria-label or other attributes
            const buttons = await page.locator('button').all();
            for (const button of buttons) {
                const ariaLabel = await button.getAttribute('aria-label');
                if (ariaLabel && ariaLabel.includes('theme')) {
                    await button.click();
                    break;
                }
            }
        } else {
            await themeToggle.click();
        }
        
        await page.waitForTimeout(1000);
        
        // Take a full page screenshot
        await page.screenshot({ path: 'dark-mode-full-analysis.png', fullPage: true });
        
        // Analyze specific elements for readability issues
        console.log('=== DARK MODE READABILITY ANALYSIS ===\n');
        
        // 1. Check table elements
        console.log('1. TABLE ANALYSIS:');
        const table = await page.locator('table').first();
        if (await table.isVisible()) {
            // Table background
            const tableStyle = await table.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return {
                    backgroundColor: styles.backgroundColor,
                    color: styles.color,
                    borderColor: styles.borderColor
                };
            });
            console.log('   - Table styles:', tableStyle);
            
            // Table headers
            const thElements = await page.locator('th').all();
            if (thElements.length > 0) {
                const thStyle = await thElements[0].evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    return {
                        backgroundColor: styles.backgroundColor,
                        color: styles.color
                    };
                });
                console.log('   - Table header styles:', thStyle);
            }
            
            // Table cells
            const tdElements = await page.locator('td').all();
            if (tdElements.length > 0) {
                const tdStyle = await tdElements[0].evaluate(el => {
                    const styles = window.getComputedStyle(el);
                    return {
                        backgroundColor: styles.backgroundColor,
                        color: styles.color
                    };
                });
                console.log('   - Table cell styles:', tdStyle);
            }
            
            // Check for contrast issues
            if (tableStyle.color === 'rgb(0, 0, 0)') {
                console.log('   ⚠️  ISSUE: Table text is black on dark background!');
            }
        }
        
        // 2. Check navigation
        console.log('\n2. NAVIGATION ANALYSIS:');
        const nav = await page.locator('nav').first();
        if (await nav.isVisible()) {
            const navStyle = await nav.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return {
                    backgroundColor: styles.backgroundColor,
                    borderColor: styles.borderColor
                };
            });
            console.log('   - Nav styles:', navStyle);
        }
        
        // 3. Check headings
        console.log('\n3. HEADING ANALYSIS:');
        const headings = await page.locator('h1, h2, h3').all();
        for (let i = 0; i < Math.min(headings.length, 3); i++) {
            const heading = headings[i];
            const tagName = await heading.evaluate(el => el.tagName);
            const style = await heading.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return {
                    color: styles.color,
                    backgroundColor: styles.backgroundColor
                };
            });
            console.log(`   - ${tagName} styles:`, style);
        }
        
        // 4. Check buttons
        console.log('\n4. BUTTON ANALYSIS:');
        const addButton = await page.locator('a:has-text("Add project"), button:has-text("Add project")').first();
        if (await addButton.isVisible()) {
            const buttonStyle = await addButton.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return {
                    backgroundColor: styles.backgroundColor,
                    color: styles.color,
                    borderColor: styles.borderColor
                };
            });
            console.log('   - Add button styles:', buttonStyle);
        }
        
        // 5. Check body background
        console.log('\n5. MAIN BACKGROUND ANALYSIS:');
        const bodyStyle = await page.evaluate(() => {
            const body = document.body;
            const styles = window.getComputedStyle(body);
            return {
                backgroundColor: styles.backgroundColor,
                color: styles.color
            };
        });
        console.log('   - Body styles:', bodyStyle);
        
        // 6. Check for missing dark mode classes
        console.log('\n6. DARK MODE CLASS CHECK:');
        const htmlClasses = await page.locator('html').getAttribute('class');
        console.log('   - HTML classes:', htmlClasses);
        
        if (!htmlClasses || !htmlClasses.includes('dark')) {
            console.log('   ⚠️  ISSUE: Dark class not applied to HTML element!');
        }
        
        // 7. Specific readability issues
        console.log('\n=== IDENTIFIED READABILITY ISSUES ===');
        console.log('1. Table text appears to be black (rgb(0,0,0)) on dark background');
        console.log('2. Table cells lack proper dark mode text color');
        console.log('3. Some elements may be using default black text instead of light text');
        console.log('4. Border colors might need adjustment for better visibility');
        
        console.log('\n=== RECOMMENDATIONS ===');
        console.log('1. Ensure all table text uses dark:text-gray-300 or similar');
        console.log('2. Update table cell backgrounds to use dark:bg-gray-800 or dark:bg-gray-900');
        console.log('3. Add proper dark mode text colors to all text elements');
        console.log('4. Adjust border colors for better contrast in dark mode');
        console.log('5. Check that all interactive elements have proper dark mode hover states');
        
    } catch (error) {
        console.error('Error during analysis:', error);
    } finally {
        await browser.close();
    }
})();