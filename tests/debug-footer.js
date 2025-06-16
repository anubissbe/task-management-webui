const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:5173/');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  
  // Get the entire page HTML to debug
  const pageHTML = await page.content();
  console.log('Page HTML contains GitHub links:', pageHTML.includes('github.com'));
  
  // Check if Layout component is being used
  const layoutInfo = await page.evaluate(() => {
    const footers = document.querySelectorAll('footer');
    console.log(`Found ${footers.length} footer elements`);
    
    if (footers.length > 0) {
      const footer = footers[0];
      const allLinks = footer.querySelectorAll('a');
      console.log(`Footer has ${allLinks.length} links`);
      
      return {
        footerHTML: footer.outerHTML,
        linkCount: allLinks.length,
        links: Array.from(allLinks).map(a => ({ href: a.href, text: a.textContent.trim() }))
      };
    }
    return { error: 'No footer found' };
  });
  
  console.log('Layout Debug Info:', JSON.stringify(layoutInfo, null, 2));
  
  await browser.close();
})().catch(console.error);