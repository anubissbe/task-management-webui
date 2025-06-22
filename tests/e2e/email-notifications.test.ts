import { test, expect } from '@playwright/test';

// Test data for email notifications
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User'
};

const TEST_TASK = {
  name: 'Test Email Notification Task',
  description: 'This task tests email notification functionality',
  priority: 'high'
};

test.describe('Email Notifications System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Login with test user (assuming login functionality exists)
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test.describe('Notification Preferences', () => {
    test('should load notification settings page', async ({ page }) => {
      // Navigate to notification settings
      await page.goto('/settings/notifications');
      
      // Verify page loaded correctly
      await expect(page.locator('h1')).toContainText('Notification Settings');
      await expect(page.locator('[data-testid="email-toggle"]')).toBeVisible();
    });

    test('should display default notification preferences', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Check default preferences are loaded
      await expect(page.locator('[data-testid="task-assignment-toggle"]')).toBeChecked();
      await expect(page.locator('[data-testid="due-date-toggle"]')).toBeChecked();
      await expect(page.locator('[data-testid="project-updates-toggle"]')).toBeChecked();
      await expect(page.locator('[data-testid="daily-digest-toggle"]')).not.toBeChecked();
      await expect(page.locator('[data-testid="weekly-digest-toggle"]')).toBeChecked();
    });

    test('should save notification preferences', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Toggle daily digest on
      await page.click('[data-testid="daily-digest-toggle"]');
      
      // Change digest time
      await page.selectOption('[data-testid="digest-time-select"]', '09:00');
      
      // Change timezone
      await page.selectOption('[data-testid="timezone-select"]', 'America/New_York');
      
      // Save preferences
      await page.click('[data-testid="save-preferences-button"]');
      
      // Verify success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Preferences saved successfully');
      
      // Reload page and verify settings persisted
      await page.reload();
      await expect(page.locator('[data-testid="daily-digest-toggle"]')).toBeChecked();
      await expect(page.locator('[data-testid="digest-time-select"]')).toHaveValue('09:00');
      await expect(page.locator('[data-testid="timezone-select"]')).toHaveValue('America/New_York');
    });

    test('should configure digest days', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Toggle weekly digest day selection
      await page.click('[data-testid="digest-day-1"]'); // Monday
      await page.click('[data-testid="digest-day-3"]'); // Wednesday
      await page.click('[data-testid="digest-day-5"]'); // Friday
      
      // Save preferences
      await page.click('[data-testid="save-preferences-button"]');
      
      // Verify success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });
  });

  test.describe('Email Testing', () => {
    test('should send test task assignment email', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Find task assignment section and send test
      await page.click('[data-testid="test-task-assignment"]');
      
      // Verify test sent message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Test task assignment notification sent');
      
      // Wait for any async operations
      await page.waitForTimeout(1000);
    });

    test('should send test due date reminder email', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Send test due date reminder
      await page.click('[data-testid="test-due-date-reminder"]');
      
      // Verify test sent message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Test due date reminder notification sent');
    });

    test('should send test project update email', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Send test project update
      await page.click('[data-testid="test-project-update"]');
      
      // Verify test sent message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Test project update notification sent');
    });

    test('should send test daily digest email', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Enable daily digest first
      await page.click('[data-testid="daily-digest-toggle"]');
      
      // Send test daily digest
      await page.click('[data-testid="test-daily-digest"]');
      
      // Verify test sent message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Test daily digest notification sent');
    });

    test('should send test weekly digest email', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Send test weekly digest
      await page.click('[data-testid="test-weekly-digest"]');
      
      // Verify test sent message
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Test weekly digest notification sent');
    });
  });

  test.describe('Rate Limiting Display', () => {
    test('should display rate limit status', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Check if rate limit section is visible
      await expect(page.locator('[data-testid="rate-limits-section"]')).toBeVisible();
      
      // Verify rate limit cards are displayed
      await expect(page.locator('[data-testid="rate-limit-task-assignment"]')).toBeVisible();
      await expect(page.locator('[data-testid="rate-limit-due-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="rate-limit-project-update"]')).toBeVisible();
    });

    test('should show rate limit progress bars', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Check progress bars are visible
      await expect(page.locator('[data-testid="progress-bar-task-assignment"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-bar-due-date"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-bar-project-update"]')).toBeVisible();
    });
  });

  test.describe('Email Triggers Integration', () => {
    test('should trigger email when creating task with assignment', async ({ page }) => {
      // Navigate to project creation
      await page.goto('/projects/new');
      
      // Create a test project first
      await page.fill('[data-testid="project-name"]', 'Test Email Project');
      await page.fill('[data-testid="project-description"]', 'Project for testing email notifications');
      await page.click('[data-testid="create-project-button"]');
      
      // Wait for project creation
      await expect(page).toHaveURL(/\/projects\/[^\/]+$/);
      
      // Create a task with assignment
      await page.click('[data-testid="add-task-button"]');
      await page.fill('[data-testid="task-name"]', TEST_TASK.name);
      await page.fill('[data-testid="task-description"]', TEST_TASK.description);
      await page.selectOption('[data-testid="task-priority"]', TEST_TASK.priority);
      
      // Assign to current user (this should trigger email)
      await page.selectOption('[data-testid="assign-to"]', TEST_USER.email);
      
      // Create the task
      await page.click('[data-testid="create-task-button"]');
      
      // Verify task was created
      await expect(page.locator('[data-testid="task-list"]')).toContainText(TEST_TASK.name);
      
      // Note: In a real test, you would verify the email was sent
      // This could be done with email testing tools or mock services
    });

    test('should handle project updates notifications', async ({ page }) => {
      // Go to existing project
      await page.goto('/projects');
      
      // Select first project
      await page.click('[data-testid="project-card"]:first-child');
      
      // Update project status (should trigger notifications)
      await page.click('[data-testid="project-settings"]');
      await page.selectOption('[data-testid="project-status"]', 'completed');
      await page.click('[data-testid="save-project-button"]');
      
      // Verify update was saved
      await expect(page.locator('[data-testid="project-status-display"]')).toContainText('Completed');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle email service errors gracefully', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Try to send test email when service might be down
      // This test would need to mock email service failure
      await page.click('[data-testid="test-task-assignment"]');
      
      // Should either succeed or show appropriate error message
      const message = page.locator('[data-testid="message"]');
      await expect(message).toBeVisible();
    });

    test('should validate notification preferences input', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Try invalid digest time
      await page.fill('[data-testid="digest-time-input"]', '25:00');
      await page.click('[data-testid="save-preferences-button"]');
      
      // Should show validation error
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/settings/notifications');
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="notification-settings"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/settings/notifications');
      
      // Verify tablet layout
      await expect(page.locator('[data-testid="notification-settings"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space'); // Toggle a setting
      
      // Verify focus management
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Check for ARIA labels on important elements
      await expect(page.locator('[data-testid="email-toggle"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="save-preferences-button"]')).toHaveAttribute('aria-label');
    });

    test('should work with screen readers', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      // Verify semantic HTML structure
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('form')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load notification settings quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/settings/notifications');
      await expect(page.locator('[data-testid="notification-settings"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should save preferences quickly', async ({ page }) => {
      await page.goto('/settings/notifications');
      
      const startTime = Date.now();
      
      // Toggle a setting and save
      await page.click('[data-testid="daily-digest-toggle"]');
      await page.click('[data-testid="save-preferences-button"]');
      
      // Wait for success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      
      const saveTime = Date.now() - startTime;
      expect(saveTime).toBeLessThan(2000); // Should save within 2 seconds
    });
  });

  test.describe('Security', () => {
    test('should require authentication for preferences', async ({ page }) => {
      // Try accessing notifications without login
      await page.goto('/settings/notifications');
      
      // Should redirect to login or show error
      await expect(page).toHaveURL(/\/login/);
    });

    test('should validate unsubscribe tokens', async ({ page }) => {
      // Try invalid unsubscribe token
      await page.goto('/api/notifications/unsubscribe?token=invalid-token');
      
      // Should show error page
      await expect(page.locator('body')).toContainText('Invalid or expired');
    });
  });
});

// Utility functions for email testing
export class EmailTestUtils {
  static async waitForEmail(page: any, timeout = 5000) {
    // In a real implementation, this would wait for an email to be received
    // Could integrate with email testing services like MailHog or similar
    await page.waitForTimeout(timeout);
  }

  static async verifyEmailContent(emailContent: string, expectedContent: string) {
    // Verify email contains expected content
    expect(emailContent).toContain(expectedContent);
  }

  static async verifyEmailTemplate(emailContent: string, templateType: string) {
    // Verify email uses correct template
    switch (templateType) {
      case 'task-assignment':
        expect(emailContent).toContain('Task Assigned');
        expect(emailContent).toContain('View Task Details');
        break;
      case 'due-date-reminder':
        expect(emailContent).toContain('Task Reminder');
        expect(emailContent).toContain('Work on Task Now');
        break;
      case 'project-update':
        expect(emailContent).toContain('Project Update');
        expect(emailContent).toContain('View Project');
        break;
      case 'daily-digest':
        expect(emailContent).toContain('Daily Digest');
        expect(emailContent).toContain('View Dashboard');
        break;
      case 'weekly-digest':
        expect(emailContent).toContain('Weekly Digest');
        expect(emailContent).toContain('See Detailed Reports');
        break;
    }
  }
}

// Test configuration
export const emailTestConfig = {
  timeout: 30000,
  retries: 2,
  use: {
    // Test-specific settings
    actionTimeout: 10000,
    navigationTimeout: 15000
  }
};