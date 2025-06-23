const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'docs', 'images');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  
  const page = await context.newPage();

  try {
    console.log('🚀 Starting screenshot capture...');

    // 1. Homepage/Project List Screenshot
    console.log('📸 Capturing homepage...');
    await page.goto('http://192.168.1.24:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for any animations
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'homepage.png'),
      fullPage: false
    });

    // 2. Try to navigate to a project board (if any projects exist)
    console.log('📸 Attempting to capture Kanban board...');
    try {
      // Look for any project links
      const projectLinks = await page.$$('a[href*="/projects/"]');
      if (projectLinks.length > 0) {
        await projectLinks[0].click();
        await page.waitForTimeout(3000);
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'kanban.png'),
          fullPage: false
        });
      } else {
        console.log('⚠️ No projects found for Kanban screenshot');
      }
    } catch (e) {
      console.log('⚠️ Could not capture Kanban board:', e.message);
    }

    // 3. Analytics page
    console.log('📸 Capturing analytics dashboard...');
    try {
      await page.goto('http://192.168.1.24:5173/analytics', { waitUntil: 'networkidle' });
      await page.waitForTimeout(4000); // Wait for charts to render
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'analytics.png'),
        fullPage: false
      });
    } catch (e) {
      console.log('⚠️ Could not capture analytics:', e.message);
    }

    // 4. Mobile view (responsive)
    console.log('📸 Capturing mobile view...');
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size
    await page.goto('http://192.168.1.24:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'mobile-view.png'),
      fullPage: false
    });

    // 5. Dark mode screenshot
    console.log('📸 Capturing dark mode...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://192.168.1.24:5173/', { waitUntil: 'networkidle' });
    
    // Try to toggle dark mode
    try {
      const themeToggle = await page.$('[data-testid="theme-toggle"]') || 
                         await page.$('button[aria-label*="theme"]') ||
                         await page.$('button:has-text("dark")');
      if (themeToggle) {
        await themeToggle.click();
        await page.waitForTimeout(1000);
      } else {
        // Try to add dark class manually
        await page.evaluate(() => {
          document.documentElement.classList.add('dark');
        });
        await page.waitForTimeout(1000);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'homepage-dark.png'),
        fullPage: false
      });
    } catch (e) {
      console.log('⚠️ Could not capture dark mode:', e.message);
    }

    console.log('✅ Screenshot capture completed!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot capture
captureScreenshots().catch(console.error);