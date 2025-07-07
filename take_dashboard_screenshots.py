#!/usr/bin/env python3
"""
Take screenshots of logged-in ProjectHub dashboard
"""
import asyncio
from playwright.async_api import async_playwright

async def take_dashboard_screenshots():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Set viewport size
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        try:
            print("Navigating to ProjectHub...")
            await page.goto('http://192.168.1.24:5174')
            
            # Wait for page to load
            await page.wait_for_timeout(3000)
            
            # Fill in login form
            print("Filling login form...")
            await page.fill('input[type="email"]', 'admin@projecthub.com')
            await page.fill('input[type="password"]', 'admin123')
            
            # Click login button
            print("Clicking login button...")
            await page.click('button[type="submit"]')
            
            # Wait for login to complete
            await page.wait_for_timeout(5000)
            
            # Take dashboard/projects screenshot
            print("Taking dashboard screenshot...")
            await page.screenshot(path='docs/images/new-dashboard.png', full_page=False)
            
            # Try to navigate to different views
            nav_items = ['BOARD', 'ANALYTICS', 'WEBHOOKS']
            
            for nav_item in nav_items:
                try:
                    print(f"Navigating to {nav_item}...")
                    # Try multiple selectors for navigation
                    selectors = [
                        f'text={nav_item}',
                        f'button:has-text("{nav_item}")',
                        f'a:has-text("{nav_item}")',
                        f'[data-view="{nav_item.lower()}"]'
                    ]
                    
                    clicked = False
                    for selector in selectors:
                        try:
                            await page.click(selector, timeout=2000)
                            clicked = True
                            break
                        except:
                            continue
                    
                    if clicked:
                        await page.wait_for_timeout(3000)
                        filename = f'docs/images/new-{nav_item.lower()}.png'
                        print(f"Taking {nav_item} screenshot...")
                        await page.screenshot(path=filename, full_page=False)
                    else:
                        print(f"Could not find navigation for {nav_item}")
                        
                except Exception as e:
                    print(f"Error navigating to {nav_item}: {e}")
            
            print("Screenshots completed!")
            
        except Exception as e:
            print(f"Error taking screenshots: {e}")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(take_dashboard_screenshots())