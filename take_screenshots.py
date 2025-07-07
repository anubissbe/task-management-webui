#!/usr/bin/env python3
"""
Take fresh screenshots of ProjectHub interface
"""
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

def setup_driver():
    """Setup Chrome driver with headless mode"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-extensions')
    
    # Use snap chromium
    chrome_options.binary_location = '/snap/bin/chromium'
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def login_to_projecthub(driver):
    """Login to ProjectHub"""
    print("Navigating to ProjectHub...")
    driver.get('http://192.168.1.24:5174')
    
    # Wait for page to load
    time.sleep(3)
    
    # Check if already logged in or need to login
    try:
        # Look for login form
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[name='email']"))
        )
        
        print("Login form found, logging in...")
        email_input.clear()
        email_input.send_keys('admin@projecthub.com')
        
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password'], input[name='password']")
        password_input.clear()
        password_input.send_keys('admin123')
        
        # Submit form
        login_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .login-btn, button:contains('Sign in')")
        login_btn.click()
        
        # Wait for login to complete
        time.sleep(5)
        
    except:
        print("No login form found or already logged in")
    
    return driver

def take_screenshot(driver, view_name, filename):
    """Take a screenshot of current view"""
    print(f"Taking screenshot: {view_name}")
    
    # Wait for page to fully load
    time.sleep(3)
    
    # Take screenshot
    driver.save_screenshot(f'docs/images/{filename}')
    print(f"Saved: docs/images/{filename}")

def navigate_to_view(driver, view_button_text):
    """Navigate to a specific view"""
    try:
        # Look for navigation buttons
        nav_buttons = driver.find_elements(By.CSS_SELECTOR, "button, a, .nav-item")
        
        for button in nav_buttons:
            if view_button_text.lower() in button.text.lower():
                button.click()
                time.sleep(3)
                return True
                
        # Try clicking by text content
        elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{view_button_text}')]")
        if elements:
            elements[0].click()
            time.sleep(3)
            return True
            
    except Exception as e:
        print(f"Could not navigate to {view_button_text}: {e}")
        
    return False

def main():
    """Main function to take all screenshots"""
    driver = None
    try:
        print("Setting up browser...")
        driver = setup_driver()
        
        print("Logging into ProjectHub...")
        login_to_projecthub(driver)
        
        # Take homepage/projects screenshot
        take_screenshot(driver, "Homepage/Projects", "new-homepage.png")
        
        # Navigate to Board/Kanban view
        if navigate_to_view(driver, "BOARD"):
            take_screenshot(driver, "Kanban Board", "new-kanban-board.png")
        
        # Navigate to Analytics view  
        if navigate_to_view(driver, "ANALYTICS"):
            take_screenshot(driver, "Analytics Dashboard", "new-analytics.png")
        
        # Go back to Projects view
        if navigate_to_view(driver, "PROJECTS"):
            take_screenshot(driver, "Projects List", "new-projects-list.png")
        
        print("Screenshots completed!")
        
    except Exception as e:
        print(f"Error taking screenshots: {e}")
        
    finally:
        if driver:
            driver.quit()

if __name__ == "__main__":
    main()