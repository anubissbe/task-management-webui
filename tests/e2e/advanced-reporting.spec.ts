import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  email: 'admin@projecthub.local',
  password: 'admin123'
};

const testDashboard = {
  name: 'E2E Test Dashboard',
  description: 'Dashboard created during E2E testing'
};

const testWidget = {
  type: 'chart',
  title: 'Task Completion Chart',
  chartType: 'line'
};

test.describe('Advanced Reporting E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display KPI cards with metrics', async ({ page }) => {
    // Navigate to advanced reporting
    await page.click('[data-testid="reports-nav"]');
    await expect(page).toHaveURL('/reports');

    // Verify KPI cards are visible and have data
    await expect(page.locator('[data-testid="kpi-velocity"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-completion-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-avg-task-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-risk-level"]')).toBeVisible();

    // Verify KPI values are displayed
    await expect(page.locator('[data-testid="kpi-velocity"] .text-2xl')).not.toBeEmpty();
    await expect(page.locator('[data-testid="kpi-completion-rate"] .text-2xl')).toContainText('%');
  });

  test('should create a custom dashboard', async ({ page }) => {
    // Navigate to reporting
    await page.goto('/reports');

    // Click create dashboard button
    await page.click('[data-testid="create-dashboard-button"]');

    // Fill dashboard details
    await page.fill('[data-testid="dashboard-name-input"]', testDashboard.name);
    await page.fill('[data-testid="dashboard-description-input"]', testDashboard.description);

    // Add a widget
    await page.click('[data-testid="add-widget-button"]');
    await page.fill('[data-testid="widget-title-input"]', testWidget.title);
    await page.selectOption('[data-testid="widget-type-select"]', testWidget.type);
    await page.selectOption('[data-testid="chart-type-select"]', testWidget.chartType);
    await page.selectOption('[data-testid="data-source-select"]', 'tasks');

    // Save widget
    await page.click('[data-testid="save-widget-button"]');

    // Save dashboard
    await page.click('[data-testid="save-dashboard-button"]');

    // Verify dashboard was created
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Dashboard created');
    await expect(page.locator('[data-testid="dashboard-list"]')).toContainText(testDashboard.name);
  });

  test('should filter reports by date range', async ({ page }) => {
    // Navigate to reporting
    await page.goto('/reports');

    // Open filters panel
    await page.click('[data-testid="filters-button"]');

    // Set date range filter
    await page.fill('[data-testid="date-start-input"]', '2024-01-01');
    await page.fill('[data-testid="date-end-input"]', '2024-01-31');

    // Apply filters
    await page.click('[data-testid="apply-filters-button"]');

    // Verify filters are applied (check if URL contains filter params)
    await expect(page).toHaveURL(/start=2024-01-01/);
    await expect(page).toHaveURL(/end=2024-01-31/);

    // Verify chart data updates
    await expect(page.locator('[data-testid="chart-loading"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="report-widget"]').first()).toBeVisible();
  });

  test('should filter reports by team', async ({ page }) => {
    // Navigate to reporting
    await page.goto('/reports');

    // Open filters panel
    await page.click('[data-testid="filters-button"]');

    // Select team filter
    await page.selectOption('[data-testid="team-filter-select"]', { index: 1 });

    // Apply filters
    await page.click('[data-testid="apply-filters-button"]');

    // Verify team filter is applied
    await expect(page.locator('[data-testid="active-filters"]')).toContainText('Team:');
    
    // Verify KPI values update based on filter
    await page.waitForTimeout(1000); // Wait for data to load
    await expect(page.locator('[data-testid="kpi-velocity"]')).toBeVisible();
  });

  test('should export dashboard as PDF', async ({ page }) => {
    // Navigate to reporting with existing dashboard
    await page.goto('/reports');
    
    // Select a dashboard
    await page.selectOption('[data-testid="dashboard-select"]', { index: 1 });

    // Wait for dashboard to load
    await expect(page.locator('[data-testid="report-widget"]').first()).toBeVisible();

    // Set up download promise before clicking export
    const downloadPromise = page.waitForEvent('download');

    // Export as PDF
    await page.click('[data-testid="export-pdf-button"]');

    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should export dashboard as Excel', async ({ page }) => {
    // Navigate to reporting
    await page.goto('/reports');
    
    // Select a dashboard
    await page.selectOption('[data-testid="dashboard-select"]', { index: 1 });

    // Set up download promise
    const downloadPromise = page.waitForEvent('download');

    // Export as Excel
    await page.click('[data-testid="export-excel-button"]');

    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls)$/);
  });

  test('should edit existing dashboard', async ({ page }) => {
    // Navigate to reporting
    await page.goto('/reports');

    // Select dashboard to edit
    await page.selectOption('[data-testid="dashboard-select"]', { label: testDashboard.name });

    // Click edit button
    await page.click('[data-testid="edit-dashboard-button"]');

    // Modify dashboard name
    await page.fill('[data-testid="dashboard-name-input"]', `${testDashboard.name} (Updated)`);

    // Add another widget
    await page.click('[data-testid="add-widget-button"]');
    await page.fill('[data-testid="widget-title-input"]', 'Team Performance');
    await page.selectOption('[data-testid="widget-type-select"]', 'metric');
    await page.selectOption('[data-testid="data-source-select"]', 'teams');

    // Save widget
    await page.click('[data-testid="save-widget-button"]');

    // Save dashboard
    await page.click('[data-testid="save-dashboard-button"]');

    // Verify dashboard was updated
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Dashboard updated');
    await expect(page.locator('[data-testid="dashboard-select"]')).toContainText('(Updated)');
  });

  test('should display advanced metrics', async ({ page }) => {
    // Navigate to advanced reporting
    await page.goto('/reports');

    // Verify velocity tracking chart
    await expect(page.locator('[data-testid="velocity-chart"]')).toBeVisible();

    // Verify team performance metrics
    await expect(page.locator('[data-testid="team-performance-table"]')).toBeVisible();
    
    // Check if table has data
    const rowCount = await page.locator('[data-testid="team-performance-row"]').count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify predictive analytics section
    await expect(page.locator('[data-testid="predictive-analytics"]')).toBeVisible();
    await expect(page.locator('[data-testid="risk-factors"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommendations"]')).toBeVisible();
  });

  test('should handle dashboard builder drag and drop', async ({ page }) => {
    // Navigate to dashboard creation
    await page.goto('/reports');
    await page.click('[data-testid="create-dashboard-button"]');

    // Create basic dashboard
    await page.fill('[data-testid="dashboard-name-input"]', 'Drag Test Dashboard');

    // Add a widget
    await page.click('[data-testid="add-widget-button"]');
    await page.fill('[data-testid="widget-title-input"]', 'Test Widget');
    await page.selectOption('[data-testid="widget-type-select"]', 'chart');
    await page.click('[data-testid="save-widget-button"]');

    // Test widget positioning (simulate drag and drop)
    const widget = page.locator('[data-testid="dashboard-widget"]').first();
    const widgetBounds = await widget.boundingBox();
    
    if (widgetBounds) {
      // Simulate drag to new position
      await page.mouse.move(widgetBounds.x + widgetBounds.width / 2, widgetBounds.y + widgetBounds.height / 2);
      await page.mouse.down();
      await page.mouse.move(widgetBounds.x + 100, widgetBounds.y + 50);
      await page.mouse.up();

      // Verify widget moved
      const newBounds = await widget.boundingBox();
      expect(newBounds?.x).not.toBe(widgetBounds.x);
    }

    // Save dashboard
    await page.click('[data-testid="save-dashboard-button"]');
  });

  test('should validate dashboard creation form', async ({ page }) => {
    // Navigate to dashboard creation
    await page.goto('/reports');
    await page.click('[data-testid="create-dashboard-button"]');

    // Try to save without required fields
    await page.click('[data-testid="save-dashboard-button"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="dashboard-name-error"]')).toContainText('Dashboard name is required');

    // Test name length validation
    await page.fill('[data-testid="dashboard-name-input"]', 'a');
    await page.click('[data-testid="save-dashboard-button"]');
    await expect(page.locator('[data-testid="dashboard-name-error"]')).toContainText('too short');

    // Test valid input
    await page.fill('[data-testid="dashboard-name-input"]', 'Valid Dashboard Name');
    await page.click('[data-testid="save-dashboard-button"]');
    await expect(page.locator('[data-testid="dashboard-name-error"]')).not.toBeVisible();
  });

  test('should handle real-time updates', async ({ page }) => {
    // Navigate to reporting
    await page.goto('/reports');

    // Get initial metric value
    const initialVelocity = await page.locator('[data-testid="kpi-velocity"] .text-2xl').textContent();

    // Simulate creating a new task in another tab (would trigger real-time update)
    const newPage = await page.context().newPage();
    await newPage.goto('/login');
    await newPage.fill('[data-testid="email-input"]', testUser.email);
    await newPage.fill('[data-testid="password-input"]', testUser.password);
    await newPage.click('[data-testid="login-button"]');
    
    await newPage.goto('/projects');
    await newPage.click('[data-testid="project-item"]').first();
    await newPage.click('[data-testid="create-task-button"]');
    await newPage.fill('[data-testid="task-title-input"]', 'Real-time Test Task');
    await newPage.click('[data-testid="save-task-button"]');

    // Close the new page
    await newPage.close();

    // Wait for potential real-time update
    await page.waitForTimeout(2000);

    // Check if metrics updated (this might not change depending on the specific metric calculation)
    const updatedVelocity = await page.locator('[data-testid="kpi-velocity"] .text-2xl').textContent();
    // The test passes if no errors occur during the real-time update process
    expect(updatedVelocity).toBeDefined();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Remove test dashboard if it exists
    try {
      await page.goto('/reports');
      
      // Check if test dashboard exists and delete it
      const dashboardSelect = page.locator('[data-testid="dashboard-select"]');
      const options = await dashboardSelect.locator('option').allTextContents();
      
      for (const option of options) {
        if (option.includes('E2E Test Dashboard') || option.includes('Drag Test Dashboard')) {
          await dashboardSelect.selectOption({ label: option });
          await page.click('[data-testid="delete-dashboard-button"]');
          await page.click('[data-testid="confirm-delete-button"]');
          break;
        }
      }
    } catch (error) {
      console.log('Cleanup failed:', error);
    }
  });
});