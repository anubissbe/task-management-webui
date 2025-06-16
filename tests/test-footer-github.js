const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('1. Navigating to http://192.168.1.24:5173/');
  await page.goto('http://192.168.1.24:5173/', { waitUntil: 'networkidle2' });
  
  console.log('2. Waiting for page to load and scrolling down to footer');
  await page.waitForSelector('body');
  
  // Scroll to bottom to see footer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  // Wait a moment for any dynamic content
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('3. Looking for GitHub link in footer');
  
  // Look for various possible GitHub link selectors
  const selectors = [
    'footer a[href*="github"]',
    'a[href*="github.com/anubissbe/ProjectHub-Mcp"]',
    'footer a[href="https://github.com/anubissbe/ProjectHub-Mcp"]',
    'footer svg[data-testid*="github"]',
    'footer .github',
    '[data-testid="github-link"]',
    'footer a[href*="ProjectHub-Mcp"]'
  ];
  
  let githubElement = null;
  let foundSelector = null;
  
  for (const selector of selectors) {
    try {
      githubElement = await page.$(selector);
      if (githubElement) {
        foundSelector = selector;
        console.log(`Found GitHub element with selector: ${selector}`);
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  if (!githubElement) {
    console.log('No GitHub link found with common selectors. Checking footer content...');
    
    // Get all footer content
    const footerContent = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer ? footer.innerHTML : 'No footer found';
    });
    
    console.log('Footer HTML:');
    console.log(footerContent);
    
    // Get all links in footer
    const footerLinks = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return [];
      const links = footer.querySelectorAll('a');
      return Array.from(links).map(link => ({
        text: link.textContent.trim(),
        href: link.href,
        innerHTML: link.innerHTML
      }));
    });
    
    console.log('Footer links found:');
    console.log(JSON.stringify(footerLinks, null, 2));
  }
  
  console.log('4. Taking screenshot of footer');
  
  // Take screenshot of entire page
  await page.screenshot({ 
    path: '/opt/projects/projects/ProjectHub-Mcp/tests/footer-screenshot.png', 
    fullPage: true 
  });
  
  console.log('5. Attempting to click GitHub elements');
  
  if (githubElement) {
    try {
      // Get the href before clicking
      const href = await page.evaluate(el => el.href, githubElement);
      console.log(`GitHub link href: ${href}`);
      
      // Click the element
      await githubElement.click();
      console.log('Successfully clicked GitHub link');
      
      // Wait for any navigation or new tab
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`Error clicking GitHub link: ${error.message}`);
    }
  } else {
    console.log('No GitHub element found to click');
  }
  
  await browser.close();
  console.log('Test completed');
})().catch(console.error);