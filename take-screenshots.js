const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
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
    console.log('🚀 Starting ProjectHub v2.0.0 screenshot capture...');

    // Login page
    console.log('📸 Capturing login page...');
    await page.goto('http://localhost:8090/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'login-page.png'),
      fullPage: false
    });

    // Login
    console.log('📸 Logging in...');
    await page.fill('input[placeholder="Email address"]', 'admin@projecthub.local');
    await page.fill('input[placeholder="Password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Dashboard
    console.log('📸 Capturing dashboard...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard.png'),
      fullPage: false
    });

    // Projects page
    console.log('📸 Capturing projects page...');
    await page.click('text=Projects');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'projects-page.png'),
      fullPage: false
    });

    // Kanban board
    console.log('📸 Capturing kanban board...');
    await page.click('text=Board');
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'kanban-board.png'),
      fullPage: false
    });

    // Analytics
    console.log('📸 Capturing analytics dashboard...');
    await page.click('text=Analytics');
    await page.waitForTimeout(4000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'analytics-dashboard.png'),
      fullPage: false
    });

    // Dark mode
    console.log('📸 Capturing dark mode...');
    await page.click('button[aria-label="Toggle theme"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'dashboard-dark.png'),
      fullPage: false
    });

    console.log('✅ Screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
