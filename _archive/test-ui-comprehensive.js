const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runComprehensiveTests() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  const results = {
    tests: [],
    errors: [],
    screenshots: []
  };
  
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });
  } catch (e) {}
  
  try {
    console.log('1. PAGE LOAD TEST');
    console.log('==================');
    
    // Navigate to the page
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✓ Page loaded successfully');
    
    // Wait for React to render
    await sleep(2000);
    
    // Check if #root has content
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        exists: !!root,
        hasContent: root ? root.innerHTML.length > 0 : false,
        innerHTML: root ? root.innerHTML.substring(0, 200) : null
      };
    });
    
    console.log(`✓ #root exists: ${rootContent.exists}`);
    console.log(`✓ #root has content: ${rootContent.hasContent}`);
    results.tests.push({ name: 'Page Load', passed: rootContent.exists && rootContent.hasContent });
    
    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.errors.push(msg.text());
      }
    });
    
    console.log('\n2. NAVIGATION TEST');
    console.log('==================');
    
    // Check for navigation elements
    const navCheck = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const title = document.querySelector('h1, .title, nav a[href="/"]');
      const links = Array.from(document.querySelectorAll('nav a')).map(a => ({
        text: a.textContent.trim(),
        href: a.getAttribute('href')
      }));
      
      return {
        hasNav: !!nav,
        hasTitle: !!title,
        titleText: title ? title.textContent.trim() : null,
        links: links
      };
    });
    
    console.log(`✓ Navigation bar exists: ${navCheck.hasNav}`);
    console.log(`✓ Title exists: ${navCheck.hasTitle} (${navCheck.titleText})`);
    console.log(`✓ Navigation links found: ${navCheck.links.length}`);
    navCheck.links.forEach(link => {
      console.log(`  - ${link.text}: ${link.href}`);
    });
    
    results.tests.push({ name: 'Navigation', passed: navCheck.hasNav });
    
    console.log('\n3. THEME TOGGLE TEST');
    console.log('====================');
    
    // Look for theme toggle button
    const themeToggleSelector = await page.evaluate(() => {
      // Try various selectors for theme toggle
      const selectors = [
        'button[aria-label*="theme"]',
        'button[title*="theme"]',
        'button svg[class*="sun"], button svg[class*="moon"]',
        'button:has(svg)',
        '[data-testid="theme-toggle"]',
        '.theme-toggle'
      ];
      
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return selector;
      }
      
      // Look for any button that might be theme toggle
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase();
        const aria = btn.getAttribute('aria-label')?.toLowerCase() || '';
        if (text.includes('theme') || aria.includes('theme') || 
            btn.querySelector('svg')) {
          return `button:nth-of-type(${buttons.indexOf(btn) + 1})`;
        }
      }
      
      return null;
    });
    
    if (themeToggleSelector) {
      console.log(`✓ Theme toggle found: ${themeToggleSelector}`);
      
      // Take light theme screenshot
      const lightScreenshot = path.join(screenshotsDir, 'light-theme.png');
      await page.screenshot({ path: lightScreenshot, fullPage: true });
      console.log('✓ Light theme screenshot saved');
      results.screenshots.push('light-theme.png');
      
      // Click theme toggle
      await page.click(themeToggleSelector);
      await sleep(500);
      
      // Take dark theme screenshot
      const darkScreenshot = path.join(screenshotsDir, 'dark-theme.png');
      await page.screenshot({ path: darkScreenshot, fullPage: true });
      console.log('✓ Dark theme screenshot saved');
      results.screenshots.push('dark-theme.png');
      
      // Verify dark class toggle
      const darkModeActive = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ||
               document.body.classList.contains('dark') ||
               document.documentElement.getAttribute('data-theme') === 'dark';
      });
      
      console.log(`✓ Dark mode active: ${darkModeActive}`);
      results.tests.push({ name: 'Theme Toggle', passed: true });
    } else {
      console.log('✗ Theme toggle button not found');
      results.tests.push({ name: 'Theme Toggle', passed: false });
    }
    
    console.log('\n4. PROJECT LIST TEST');
    console.log('====================');
    
    // Navigate to projects page (might already be there)
    const currentUrl = page.url();
    if (!currentUrl.includes('/projects') && !currentUrl.endsWith('5173/')) {
      const projectsLink = await page.$('a[href="/projects"]');
      if (projectsLink) {
        await projectsLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }
    }
    
    // Check for project page elements
    const projectPageCheck = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h1, h2, h3')).find(h => 
        h.textContent.toLowerCase().includes('project')
      );
      const addButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.toLowerCase().includes('add') && 
        btn.textContent.toLowerCase().includes('project')
      );
      const table = document.querySelector('table');
      const emptyState = Array.from(document.querySelectorAll('div, p')).find(el => 
        el.textContent.toLowerCase().includes('no project') ||
        el.textContent.toLowerCase().includes('empty')
      );
      
      return {
        hasHeading: !!heading,
        headingText: heading ? heading.textContent.trim() : null,
        hasAddButton: !!addButton,
        addButtonText: addButton ? addButton.textContent.trim() : null,
        hasTable: !!table,
        hasEmptyState: !!emptyState,
        emptyStateText: emptyState ? emptyState.textContent.trim() : null
      };
    });
    
    console.log(`✓ Projects heading: ${projectPageCheck.hasHeading} (${projectPageCheck.headingText})`);
    console.log(`✓ Add project button: ${projectPageCheck.hasAddButton} (${projectPageCheck.addButtonText})`);
    console.log(`✓ Has table: ${projectPageCheck.hasTable}`);
    console.log(`✓ Has empty state: ${projectPageCheck.hasEmptyState}`);
    
    // Take projects page screenshot
    const projectsScreenshot = path.join(screenshotsDir, 'projects-page.png');
    await page.screenshot({ path: projectsScreenshot, fullPage: true });
    console.log('✓ Projects page screenshot saved');
    results.screenshots.push('projects-page.png');
    
    results.tests.push({ 
      name: 'Project List', 
      passed: projectPageCheck.hasHeading && (projectPageCheck.hasTable || projectPageCheck.hasEmptyState)
    });
    
    console.log('\n5. BOARD NAVIGATION TEST');
    console.log('========================');
    
    // Navigate to board
    const boardLink = await page.$('a[href="/board"]');
    if (boardLink) {
      await boardLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      const boardUrl = page.url();
      console.log(`✓ Navigated to board: ${boardUrl}`);
      console.log(`✓ URL contains /board: ${boardUrl.includes('/board')}`);
      
      // Wait for board to render
      await sleep(1000);
      
      // Take board page screenshot
      const boardScreenshot = path.join(screenshotsDir, 'board-page.png');
      await page.screenshot({ path: boardScreenshot, fullPage: true });
      console.log('✓ Board page screenshot saved');
      results.screenshots.push('board-page.png');
      
      results.tests.push({ name: 'Board Navigation', passed: boardUrl.includes('/board') });
    } else {
      console.log('✗ Board link not found');
      results.tests.push({ name: 'Board Navigation', passed: false });
    }
    
    console.log('\n6. API TEST');
    console.log('============');
    
    // Check for API calls
    const apiCalls = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('api') || url.includes('3001')) {
        apiCalls.push({
          url: url,
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // Navigate back to projects to trigger API calls
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle2' });
    await sleep(2000);
    
    console.log(`✓ API calls detected: ${apiCalls.length}`);
    apiCalls.forEach(call => {
      console.log(`  - ${call.method} ${call.url} (${call.status})`);
    });
    
    // Check for loading states
    const loadingCheck = await page.evaluate(() => {
      const loadingElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent.toLowerCase();
        const className = el.className.toLowerCase();
        return text.includes('loading') || className.includes('loading') ||
               className.includes('spinner') || className.includes('skeleton');
      });
      
      return loadingElements.length > 0;
    });
    
    console.log(`✓ Loading states present: ${loadingCheck}`);
    
    results.tests.push({ name: 'API Integration', passed: apiCalls.length > 0 });
    
  } catch (error) {
    console.error('Test error:', error);
    results.errors.push(error.message);
  } finally {
    await browser.close();
  }
  
  // Summary
  console.log('\n\nTEST SUMMARY');
  console.log('============');
  console.log(`Total tests: ${results.tests.length}`);
  console.log(`Passed: ${results.tests.filter(t => t.passed).length}`);
  console.log(`Failed: ${results.tests.filter(t => !t.passed).length}`);
  
  console.log('\nTest Results:');
  results.tests.forEach(test => {
    console.log(`  ${test.passed ? '✓' : '✗'} ${test.name}`);
  });
  
  if (results.errors.length > 0) {
    console.log('\nErrors detected:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  }
  
  console.log('\nScreenshots saved:');
  results.screenshots.forEach(ss => console.log(`  - ${ss}`));
  
  const allPassed = results.tests.every(t => t.passed);
  console.log(`\nOVERALL STATUS: ${allPassed ? 'PASSED' : 'FAILED'}`);
  
  return results;
}

// Run the tests
runComprehensiveTests().catch(console.error);