#!/usr/bin/env python3
"""
Take fresh screenshots of ProjectHub interface using Playwright
"""
import asyncio
from playwright.async_api import async_playwright

async def take_screenshots():
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
            
            # Check if login is needed
            try:
                # Look for email input field
                email_input = await page.wait_for_selector('input[type="email"], input[name="email"]', timeout=5000)
                
                print("Login form found, logging in...")
                await email_input.fill('admin@projecthub.com')
                
                password_input = await page.locator('input[type="password"]').first
                await password_input.fill('admin123')
                
                # Click login button
                login_button = await page.locator('button[type="submit"]').first
                await login_button.click()
                
                # Wait for login to complete
                await page.wait_for_timeout(5000)
                
            except:
                print("No login form found or already logged in")
            
            # Take homepage screenshot
            print("Taking homepage screenshot...")
            await page.wait_for_timeout(2000)
            await page.screenshot(path='docs/images/new-homepage.png', full_page=False)
            
            # Navigate to Board view
            try:
                print("Navigating to Board view...")
                board_button = page.locator('text=BOARD')
                await board_button.click()
                await page.wait_for_timeout(3000)
                
                print("Taking kanban board screenshot...")
                await page.screenshot(path='docs/images/new-kanban-board.png', full_page=False)
                
            except Exception as e:
                print(f"Could not navigate to Board: {e}")
            
            # Navigate to Analytics view
            try:
                print("Navigating to Analytics view...")
                analytics_button = page.locator('text=ANALYTICS')
                await analytics_button.click()
                await page.wait_for_timeout(3000)
                
                print("Taking analytics screenshot...")
                await page.screenshot(path='docs/images/new-analytics.png', full_page=False)
                
            except Exception as e:
                print(f"Could not navigate to Analytics: {e}")
            
            # Navigate back to Projects view
            try:
                print("Navigating back to Projects view...")
                projects_button = page.locator('text=PROJECTS')
                await projects_button.click()
                await page.wait_for_timeout(3000)
                
                print("Taking projects list screenshot...")
                await page.screenshot(path='docs/images/new-projects-list.png', full_page=False)
                
            except Exception as e:
                print(f"Could not navigate to Projects: {e}")
            
            print("Screenshots completed!")
            
        except Exception as e:
            print(f"Error taking screenshots: {e}")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(take_screenshots())