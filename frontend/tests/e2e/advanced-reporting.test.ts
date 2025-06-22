import { test, expect } from '@playwright/test';

test.describe('Advanced Reporting and Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the advanced reporting dashboard
    await page.goto('/reporting');
  });

  test('should display reporting dashboard with KPI metrics', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="reporting-dashboard"]');
    
    // Check that KPI cards are visible
    await expect(page.locator('[data-testid="kpi-card"]')).toHaveCount(4);
    
    // Verify specific KPI cards
    await expect(page.locator('text=Team Velocity')).toBeVisible();
    await expect(page.locator('text=Average Completion Rate')).toBeVisible();
    await expect(page.locator('text=Average Task Time')).toBeVisible();
    await expect(page.locator('text=Risk Level')).toBeVisible();
  });

  test('should allow creating custom dashboards', async ({ page }) => {
    // Click create dashboard button
    await page.click('[data-testid="create-dashboard-btn"]');
    
    // Fill dashboard form
    await page.fill('[data-testid="dashboard-name-input"]', 'Test Dashboard');
    await page.fill('[data-testid="dashboard-description-input"]', 'Test dashboard for E2E testing');
    
    // Add a widget
    await page.click('[data-testid="add-widget-btn"]');
    await page.click('[data-testid="widget-type-burndown"]');
    
    // Configure widget
    await page.fill('[data-testid="widget-title-input"]', 'Sprint Burndown');
    await page.click('[data-testid="save-widget-btn"]');
    
    // Save dashboard
    await page.click('[data-testid="save-dashboard-btn"]');
    
    // Verify dashboard was created
    await expect(page.locator('text=Test Dashboard')).toBeVisible();
  });

  test('should display burndown charts with progress tracking', async ({ page }) => {
    // Navigate to burndown chart
    await page.click('[data-testid="burndown-chart-tab"]');
    
    // Wait for chart to render
    await page.waitForSelector('[data-testid="burndown-chart"]');
    
    // Check chart elements
    await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
    await expect(page.locator('text=Ideal Progress')).toBeVisible();
    await expect(page.locator('text=Actual Progress')).toBeVisible();
    
    // Verify progress indicators
    await expect(page.locator('[data-testid="total-points"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-points"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-status"]')).toBeVisible();
  });

  test('should show velocity tracking with trend analysis', async ({ page }) => {
    // Navigate to velocity chart
    await page.click('[data-testid="velocity-chart-tab"]');
    
    // Wait for velocity chart to load
    await page.waitForSelector('[data-testid="velocity-chart"]');
    
    // Check velocity metrics
    await expect(page.locator('[data-testid="average-velocity"]')).toBeVisible();
    await expect(page.locator('[data-testid="velocity-trend"]')).toBeVisible();
    await expect(page.locator('[data-testid="predicted-velocity"]')).toBeVisible();
    await expect(page.locator('[data-testid="confidence-level"]')).toBeVisible();
    
    // Verify chart renders
    await expect(page.locator('[data-testid="velocity-bar-chart"]')).toBeVisible();
  });

  test('should display team performance metrics', async ({ page }) => {
    // Navigate to team performance
    await page.click('[data-testid="team-performance-tab"]');
    
    // Wait for team metrics to load
    await page.waitForSelector('[data-testid="team-performance-dashboard"]');
    
    // Check aggregate metrics
    await expect(page.locator('[data-testid="total-tasks-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-completion-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-task-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="team-velocity"]')).toBeVisible();
    
    // Test view mode switching
    await page.selectOption('[data-testid="view-mode-select"]', 'comparison');
    await expect(page.locator('[data-testid="team-comparison-chart"]')).toBeVisible();
    
    await page.selectOption('[data-testid="view-mode-select"]', 'individual');
    await expect(page.locator('[data-testid="team-card"]')).toHaveCount(1); // At least one team
    
    await page.selectOption('[data-testid="view-mode-select"]', 'trends');
    await expect(page.locator('[data-testid="velocity-trends-chart"]')).toBeVisible();
  });

  test('should support advanced filtering', async ({ page }) => {
    // Open filters panel
    await page.click('[data-testid="filters-toggle-btn"]');
    
    // Wait for filters to be visible
    await page.waitForSelector('[data-testid="report-filters"]');
    
    // Test date range filtering
    await page.click('[data-testid="date-range-thisMonth"]');
    await expect(page.locator('[data-testid="date-range-thisMonth"]')).toHaveClass(/bg-blue-600/);
    
    // Test project filtering
    if (await page.locator('[data-testid="project-filter-checkbox"]').count() > 0) {
      await page.click('[data-testid="project-filter-checkbox"]');
    }
    
    // Test team member filtering
    if (await page.locator('[data-testid="team-member-filter-checkbox"]').count() > 0) {
      await page.click('[data-testid="team-member-filter-checkbox"]');
    }
    
    // Test status filtering
    await page.click('[data-testid="status-filter-todo"]');
    await page.click('[data-testid="status-filter-in-progress"]');
    
    // Test priority filtering
    await page.click('[data-testid="priority-filter-high"]');
    
    // Clear all filters
    await page.click('[data-testid="clear-filters-btn"]');
  });

  test('should export reports in multiple formats', async ({ page }) => {
    // Navigate to dashboard with data
    await page.waitForSelector('[data-testid="reporting-dashboard"]');
    
    // Test PDF export
    const [pdfDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-pdf-btn"]')
    ]);
    expect(pdfDownload.suggestedFilename()).toContain('.pdf');
    
    // Test Excel export
    const [excelDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-excel-btn"]')
    ]);
    expect(excelDownload.suggestedFilename()).toContain('.xlsx');
    
    // Test CSV export
    const [csvDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-csv-btn"]')
    ]);
    expect(csvDownload.suggestedFilename()).toContain('.csv');
  });

  test('should render charts without errors', async ({ page }) => {
    // Check for chart.js errors
    const chartErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('chart')) {
        chartErrors.push(msg.text());
      }
    });
    
    // Navigate through different chart views
    await page.click('[data-testid="burndown-chart-tab"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="velocity-chart-tab"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="team-performance-tab"]');
    await page.waitForTimeout(1000);
    
    // Verify no chart errors occurred
    expect(chartErrors).toHaveLength(0);
  });

  test('should display insights and recommendations', async ({ page }) => {
    // Wait for insights panel to load
    await page.waitForSelector('[data-testid="performance-insights"]');
    
    // Check that insights are displayed
    await expect(page.locator('[data-testid="performance-insights"] li')).toHaveCount.greaterThan(0);
    
    // Verify insight content is meaningful
    const insightText = await page.locator('[data-testid="performance-insights"]').textContent();
    expect(insightText).toMatch(/(completion rate|velocity|task time|team)/i);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that dashboard is still accessible
    await page.waitForSelector('[data-testid="reporting-dashboard"]');
    
    // Verify KPI cards stack vertically on mobile
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    const firstCardBox = await kpiCards.first().boundingBox();
    const secondCardBox = await kpiCards.nth(1).boundingBox();
    
    if (firstCardBox && secondCardBox) {
      expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height - 20);
    }
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should handle loading states gracefully', async ({ page }) => {
    // Intercept API calls to simulate slow network
    await page.route('/api/reports/**', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    // Navigate and check loading states
    await page.goto('/reporting');
    
    // Verify loading spinner appears
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="reporting-dashboard"]');
    
    // Verify loading spinner disappears
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('should handle error states appropriately', async ({ page }) => {
    // Intercept API calls to simulate server errors
    await page.route('/api/reports/advanced-metrics', route => {
      route.fulfill({ status: 500, body: 'Server Error' });
    });
    
    // Navigate to reporting
    await page.goto('/reporting');
    
    // Check error message appears
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=Failed to load')).toBeVisible();
    
    // Test retry functionality
    await page.unroute('/api/reports/advanced-metrics');
    await page.click('[data-testid="retry-btn"]');
    
    // Verify data loads after retry
    await page.waitForSelector('[data-testid="reporting-dashboard"]');
  });
});

test.describe('Dashboard Builder', () => {
  test('should allow creating and configuring widgets', async ({ page }) => {
    await page.goto('/reporting');
    
    // Start creating a new dashboard
    await page.click('[data-testid="create-dashboard-btn"]');
    
    // Add different widget types
    const widgetTypes = ['burndown', 'velocity', 'teamPerformance', 'kpi', 'table'];
    
    for (const type of widgetTypes) {
      await page.click('[data-testid="add-widget-btn"]');
      await page.click(`[data-testid="widget-type-${type}"]`);
      
      // Configure widget
      await page.fill('[data-testid="widget-title-input"]', `Test ${type} Widget`);
      await page.click('[data-testid="save-widget-btn"]');
      
      // Verify widget appears in dashboard
      await expect(page.locator(`text=Test ${type} Widget`)).toBeVisible();
    }
    
    // Save dashboard
    await page.fill('[data-testid="dashboard-name-input"]', 'Complete Test Dashboard');
    await page.click('[data-testid="save-dashboard-btn"]');
    
    // Verify dashboard was saved
    await expect(page.locator('text=Complete Test Dashboard')).toBeVisible();
  });

  test('should support widget drag and drop', async ({ page }) => {
    await page.goto('/reporting');
    
    // Create a test dashboard with multiple widgets
    await page.click('[data-testid="create-dashboard-btn"]');
    
    // Add two widgets
    await page.click('[data-testid="add-widget-btn"]');
    await page.click('[data-testid="widget-type-burndown"]');
    await page.fill('[data-testid="widget-title-input"]', 'Widget 1');
    await page.click('[data-testid="save-widget-btn"]');
    
    await page.click('[data-testid="add-widget-btn"]');
    await page.click('[data-testid="widget-type-velocity"]');
    await page.fill('[data-testid="widget-title-input"]', 'Widget 2');
    await page.click('[data-testid="save-widget-btn"]');
    
    // Test drag and drop (if implemented)
    const widget1 = page.locator('[data-testid="widget-1"]');
    const widget2 = page.locator('[data-testid="widget-2"]');
    
    // Get initial positions
    const widget1Box = await widget1.boundingBox();
    const widget2Box = await widget2.boundingBox();
    
    // Perform drag and drop
    if (widget1Box && widget2Box) {
      await widget1.dragTo(widget2);
      
      // Verify positions changed
      const newWidget1Box = await widget1.boundingBox();
      const newWidget2Box = await widget2.boundingBox();
      
      expect(newWidget1Box?.x).not.toBe(widget1Box.x);
    }
  });
});