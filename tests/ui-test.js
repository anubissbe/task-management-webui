const puppeteer = require('puppeteer');

async function runUITests() {
  console.log('Starting UI tests for Task Management Web UI...\n');
  
  let browser;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Enable console logging from the page
    page.on('console', msg => console.log('  Page console:', msg.text()));
    page.on('error', err => console.log('  Page error:', err.message));
    
    // Log network failures
    page.on('requestfailed', request => {
      console.log(`  Network request failed: ${request.url()} - ${request.failure().errorText}`);
    });

    // Test 1: Page Load
    console.log('Test 1: Page Load');
    try {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
      await page.waitForSelector('#root', { timeout: 5000 });
      // Extra wait for React to fully render
      await new Promise(r => setTimeout(r, 3000));
      
      // Take initial screenshot
      await page.screenshot({ 
        path: '/opt/projects/project-tasks-webui/tests/screenshots/initial-load.png',
        fullPage: true 
      });
      console.log('✅ Page loaded successfully');
      
      // Debug: Get page content structure
      const pageStructure = await page.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body.innerText.substring(0, 200),
          rootContent: document.getElementById('root')?.innerHTML.substring(0, 200)
        };
      });
      console.log('  Page structure:', pageStructure);
      
      testsPassed++;
    } catch (error) {
      console.log('❌ Page load failed:', error.message);
      testsFailed++;
    }

    // Test 2: Navigation Elements
    console.log('\nTest 2: Navigation Elements');
    try {
      const navExists = await page.$('nav') !== null;
      const projectsLink = await page.$('a[href="/"]') !== null;
      const boardLink = await page.$('a[href="/board"]') !== null;
      const analyticsLink = await page.$('a[href="/analytics"]') !== null;
      
      // Debug: log what was found
      console.log(`  Navigation bar: ${navExists ? '✓' : '✗'}`);
      console.log(`  Projects link: ${projectsLink ? '✓' : '✗'}`);
      console.log(`  Board link: ${boardLink ? '✓' : '✗'}`);
      console.log(`  Analytics link: ${analyticsLink ? '✓' : '✗'}`);
      
      if (navExists && projectsLink && boardLink && analyticsLink) {
        console.log('✅ All navigation elements found');
        testsPassed++;
      } else {
        throw new Error('Some navigation elements missing');
      }
    } catch (error) {
      console.log('❌ Navigation test failed:', error.message);
      testsFailed++;
    }

    // Test 3: Theme Toggle Button
    console.log('\nTest 3: Theme Toggle Button');
    try {
      // Try different selectors for theme toggle
      const themeToggle = await page.$('[aria-label="Toggle theme"]') || 
                         await page.$('button[title*="theme"]') ||
                         await page.$('button svg');
      
      // Debug: log all buttons on page
      const buttons = await page.$$eval('button', buttons => 
        buttons.map(b => ({ text: b.textContent, ariaLabel: b.getAttribute('aria-label') }))
      );
      console.log('  Found buttons:', buttons);
      
      if (themeToggle) {
        console.log('✅ Theme toggle button found');
        testsPassed++;
      } else {
        throw new Error('Theme toggle button not found');
      }
    } catch (error) {
      console.log('❌ Theme toggle test failed:', error.message);
      testsFailed++;
    }

    // Test 4: Theme Toggle Functionality
    console.log('\nTest 4: Theme Toggle Functionality');
    try {
      // Get initial theme state
      const initialIsDark = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      
      // Take screenshot before toggle
      await page.screenshot({ 
        path: '/opt/projects/project-tasks-webui/tests/screenshots/before-theme-toggle.png',
        fullPage: true 
      });
      
      // Click theme toggle
      await page.click('[aria-label="Toggle theme"]');
      await new Promise(r => setTimeout(r, 500)); // Wait for transition
      
      // Get new theme state
      const afterIsDark = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      
      // Take screenshot after toggle
      await page.screenshot({ 
        path: '/opt/projects/project-tasks-webui/tests/screenshots/after-theme-toggle.png',
        fullPage: true 
      });
      
      if (initialIsDark !== afterIsDark) {
        console.log('✅ Theme toggle works correctly');
        console.log(`   Theme changed from ${initialIsDark ? 'dark' : 'light'} to ${afterIsDark ? 'dark' : 'light'}`);
        testsPassed++;
      } else {
        throw new Error('Theme did not change after toggle');
      }
    } catch (error) {
      console.log('❌ Theme toggle functionality test failed:', error.message);
      testsFailed++;
    }

    // Test 5: Project List Component
    console.log('\nTest 5: Project List Component');
    try {
      // Check for main heading
      const headingExists = await page.$('h1') !== null;
      if (headingExists) {
        const heading = await page.$eval('h1', el => el.textContent);
        console.log(`  Found h1 with text: "${heading}"`);
        if (heading.includes('Projects')) {
          console.log('✅ Project list heading found');
          testsPassed++;
        } else {
          throw new Error(`Project list heading has wrong text: "${heading}"`);
        }
      } else {
        // Try alternative headings
        const allHeadings = await page.$$eval('h1, h2, h3', els => 
          els.map(el => ({ tag: el.tagName, text: el.textContent }))
        );
        console.log('  All headings found:', allHeadings);
        throw new Error('No h1 element found on page');
      }
    } catch (error) {
      console.log('❌ Project list component test failed:', error.message);
      testsFailed++;
    }

    // Test 6: API Health Check
    console.log('\nTest 6: Backend API Health Check');
    try {
      const apiResponse = await page.evaluate(async () => {
        const response = await fetch('http://localhost:3001/api/health');
        return {
          status: response.status,
          data: await response.json()
        };
      });
      
      if (apiResponse.status === 200 && apiResponse.data.status === 'ok') {
        console.log('✅ Backend API is healthy');
        testsPassed++;
      } else {
        throw new Error('API health check failed');
      }
    } catch (error) {
      console.log('❌ API health check failed:', error.message);
      testsFailed++;
    }

    // Final screenshot
    await page.screenshot({ 
      path: '/opt/projects/project-tasks-webui/tests/screenshots/final-state.png',
      fullPage: true 
    });

  } catch (error) {
    console.error('Fatal error during testing:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runUITests().catch(console.error);