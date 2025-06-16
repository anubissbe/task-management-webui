const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('1. Navigating to http://192.168.1.24:5173/');
  await page.goto('http://192.168.1.24:5173/', { waitUntil: 'networkidle2' });
  
  console.log('2. Waiting for page to fully load');
  await page.waitForSelector('footer');
  
  // Scroll to footer
  await page.evaluate(() => {
    document.querySelector('footer').scrollIntoView();
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('3. Analyzing footer structure in detail');
  
  const footerAnalysis = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return { error: 'No footer found' };
    
    // Get all elements in footer
    const allElements = footer.querySelectorAll('*');
    const elementInfo = Array.from(allElements).map(el => ({
      tagName: el.tagName,
      className: el.className,
      href: el.href || null,
      textContent: el.textContent?.trim().substring(0, 50) || '',
      hasClickEvent: el.onclick !== null
    }));
    
    // Specifically look for any href attributes
    const elementsWithHref = Array.from(footer.querySelectorAll('[href]'));
    const hrefElements = elementsWithHref.map(el => ({
      tagName: el.tagName,
      href: el.href,
      text: el.textContent?.trim()
    }));
    
    return {
      totalElements: allElements.length,
      elementsWithHref: hrefElements,
      allElementsInfo: elementInfo,
      footerOuterHTML: footer.outerHTML
    };
  });
  
  console.log('Footer Analysis:');
  console.log('Total elements in footer:', footerAnalysis.totalElements);
  console.log('Elements with href:', JSON.stringify(footerAnalysis.elementsWithHref, null, 2));
  
  // Take a more focused screenshot
  await page.screenshot({ 
    path: '/opt/projects/projects/ProjectHub-Mcp/tests/detailed-footer-screenshot.png',
    clip: { x: 0, y: 500, width: 1920, height: 400 }
  });
  
  console.log('4. Looking for any clickable elements');
  const clickableElements = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const clickable = footer.querySelectorAll('button, a, [onclick], [role="button"]');
    return Array.from(clickable).map(el => ({
      tagName: el.tagName,
      text: el.textContent?.trim(),
      href: el.href || null,
      onclick: el.onclick !== null
    }));
  });
  
  console.log('Clickable elements in footer:', JSON.stringify(clickableElements, null, 2));
  
  await browser.close();
  console.log('Detailed analysis completed');
})().catch(console.error);