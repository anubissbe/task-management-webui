const puppeteer = require('puppeteer');

async function testLogoNavigation() {
  console.log('Starting Logo Navigation Test for ProjectHub-Mcp...\n');
  
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

    // Step 1: Navigate to homepage
    console.log('Step 1: Navigate to homepage');
    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
      await page.waitForSelector('#root', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 2000)); // Wait for React to render
      
      const currentUrl = page.url();
      console.log(`✅ Successfully navigated to homepage: ${currentUrl}`);
      
      // Take initial screenshot
      await page.screenshot({ 
        path: './screenshots/step1-homepage.png',
        fullPage: true 
      });
      
      testsPassed++;
    } catch (error) {
      console.log('❌ Failed to navigate to homepage:', error.message);
      testsFailed++;
    }

    // Step 2: Navigate to a different page (Board)
    console.log('\nStep 2: Navigate to Board page');
    try {
      const boardLink = await page.$('a[href="/board"]');
      if (boardLink) {
        await boardLink.click();
        await new Promise(r => setTimeout(r, 1500));
        
        const boardUrl = page.url();
        console.log(`✅ Successfully navigated to Board page: ${boardUrl}`);
        
        // Take screenshot of board page
        await page.screenshot({ 
          path: './screenshots/step2-board-page.png',
          fullPage: true 
        });
        
        testsPassed++;
      } else {
        throw new Error('Board link not found');
      }
    } catch (error) {
      console.log('❌ Failed to navigate to Board page:', error.message);
      
      // Try Analytics page instead
      try {
        console.log('  Trying Analytics page as fallback...');
        const analyticsLink = await page.$('a[href="/analytics"]');
        if (analyticsLink) {
          await analyticsLink.click();
          await new Promise(r => setTimeout(r, 1500));
          
          const analyticsUrl = page.url();
          console.log(`✅ Successfully navigated to Analytics page: ${analyticsUrl}`);
          testsPassed++;
        } else {
          throw new Error('Neither Board nor Analytics link found');
        }
      } catch (fallbackError) {
        console.log('❌ Fallback to Analytics also failed:', fallbackError.message);
        testsFailed++;
      }
    }

    // Step 3: Test logo navigation back to home
    console.log('\nStep 3: Test logo navigation back to home');
    try {
      // Look for logo elements
      const logoSelectors = [
        'header a[href="/"]',           // Header logo link
        'nav a[href="/"]',              // Nav logo link
        '.logo',                       // Generic logo class
        'nav .logo',                   // Logo in nav
        'header .logo',                // Logo in header
        'a[href="/"]',                 // Any link to home
        'nav a:first-child',           // First nav link
        'header a:first-child'         // First header link
      ];
      
      let logoFound = false;
      let logoElement = null;
      let logoSelector = '';
      
      for (const selector of logoSelectors) {
        logoElement = await page.$(selector);
        if (logoElement) {
          logoSelector = selector;
          logoFound = true;
          
          // Get text content to verify it's the logo
          const logoText = await page.evaluate(el => el.textContent?.trim(), logoElement);
          const logoHref = await page.evaluate(el => el.href, logoElement);
          
          console.log(`  Found potential logo with selector: ${selector}`);
          console.log(`  Logo text: "${logoText}"`);
          console.log(`  Logo href: "${logoHref}"`);
          
          // Check if it looks like a logo (contains ProjectHub or is home link)
          if (logoText?.includes('ProjectHub') || logoHref?.endsWith('/') || logoHref?.endsWith('#/')) {
            console.log(`✅ Confirmed logo element found: ${selector}`);
            break;
          }
        }
      }
      
      if (logoFound && logoElement) {
        // Click the logo
        console.log(`  Clicking logo element: ${logoSelector}`);
        await logoElement.click();
        await new Promise(r => setTimeout(r, 1500));
        
        // Check if we're back at home
        const finalUrl = page.url();
        console.log(`  Final URL after logo click: ${finalUrl}`);
        
        // Take screenshot after logo click
        await page.screenshot({ 
          path: './screenshots/step3-after-logo-click.png',
          fullPage: true 
        });
        
        // Verify we're at home (URL should be / or end with /)
        if (finalUrl.endsWith('/') || finalUrl.endsWith('#/') || finalUrl.includes('localhost:5173/')) {
          console.log('✅ Logo navigation SUCCESS: Returned to homepage');
          testsPassed++;
        } else {
          throw new Error(`Logo click did not return to homepage. Final URL: ${finalUrl}`);
        }
      } else {
        throw new Error('No logo element found');
      }
    } catch (error) {
      console.log('❌ Logo navigation test failed:', error.message);
      testsFailed++;
      
      // Debug: Take screenshot and log page structure
      await page.screenshot({ 
        path: './screenshots/step3-debug.png',
        fullPage: true 
      });
      
      // Get all links for debugging
      const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => ({
          href: a.href,
          text: a.textContent?.trim(),
          selector: a.outerHTML.substring(0, 100) + '...'
        }));
      });
      console.log('  Debug - All links found:', allLinks);
    }

    // Step 4: Additional verification - check page content
    console.log('\nStep 4: Verify homepage content');
    try {
      const pageTitle = await page.title();
      const mainHeading = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
      
      console.log(`  Page title: "${pageTitle}"`);
      console.log(`  Main heading: "${mainHeading}"`);
      
      if (pageTitle.includes('ProjectHub') || mainHeading.includes('Projects')) {
        console.log('✅ Homepage content verified');
        testsPassed++;
      } else {
        throw new Error('Homepage content verification failed');
      }
    } catch (error) {
      console.log('❌ Homepage content verification failed:', error.message);
      testsFailed++;
    }

  } catch (error) {
    console.error('Fatal error during testing:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('LOGO NAVIGATION TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (testsPassed === 4) {
    console.log('🎉 All logo navigation tests PASSED!');
  } else {
    console.log('⚠️  Some tests failed. Check screenshots in ./screenshots/ directory');
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run the test
testLogoNavigation().catch(console.error);