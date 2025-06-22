import { test, expect } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost:3001/api';
const APP_URL = process.env.E2E_APP_URL || 'http://localhost:5173';

test.describe('Workspace Management', () => {
  let authToken: string;
  let userId: string;
  let workspaceId: string;

  test.beforeAll(async ({ request }) => {
    // Login and get auth token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'testpass123'
      }
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.tokens.accessToken;
    userId = loginData.user.id;
  });

  test.beforeEach(async ({ page }) => {
    // Set auth token in localStorage
    await page.goto(APP_URL);
    await page.evaluate((token) => {
      localStorage.setItem('access_token', token);
    }, authToken);
  });

  test('should create a new workspace', async ({ page, request }) => {
    // Navigate to workspace selector
    await page.goto(APP_URL);
    
    // Click on workspace selector
    await page.click('[data-testid="workspace-selector"]');
    
    // Click create new workspace
    await page.click('text=Create New Workspace');
    
    // Fill in workspace details
    await page.fill('input[name="name"]', 'Test Workspace');
    await page.fill('textarea[name="description"]', 'E2E test workspace');
    
    // Submit form
    await page.click('button:has-text("Create Workspace")');
    
    // Wait for workspace to be created
    await page.waitForTimeout(1000);
    
    // Verify workspace appears in selector
    await page.click('[data-testid="workspace-selector"]');
    await expect(page.locator('text=Test Workspace')).toBeVisible();
    
    // Get workspace ID for cleanup
    const workspaces = await request.get(`${API_URL}/workspaces`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const workspaceData = await workspaces.json();
    workspaceId = workspaceData.find((w: any) => w.name === 'Test Workspace')?.id;
  });

  test('should switch between workspaces', async ({ page }) => {
    // Create second workspace via API
    const response = await page.request.post(`${API_URL}/workspaces`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        name: 'Second Workspace',
        description: 'Another test workspace'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const secondWorkspace = await response.json();
    
    // Navigate to app
    await page.goto(APP_URL);
    
    // Switch to second workspace
    await page.click('[data-testid="workspace-selector"]');
    await page.click(`text=${secondWorkspace.name}`);
    
    // Verify workspace switched
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="workspace-selector"]')).toContainText(secondWorkspace.name);
    
    // Verify localStorage updated
    const currentWorkspaceId = await page.evaluate(() => {
      return localStorage.getItem('current_workspace_id');
    });
    expect(currentWorkspaceId).toBe(secondWorkspace.id);
  });

  test('should enforce workspace isolation for projects', async ({ page, request }) => {
    // Create workspace A
    const workspaceA = await request.post(`${API_URL}/workspaces`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      data: { name: 'Workspace A' }
    });
    const wsA = await workspaceA.json();
    
    // Create workspace B
    const workspaceB = await request.post(`${API_URL}/workspaces`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      data: { name: 'Workspace B' }
    });
    const wsB = await workspaceB.json();
    
    // Create project in workspace A
    const projectA = await request.post(`${API_URL}/projects`, {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'X-Workspace-Id': wsA.id
      },
      data: {
        name: 'Project in Workspace A',
        description: 'Should only be visible in workspace A'
      }
    });
    expect(projectA.ok()).toBeTruthy();
    
    // Switch to workspace A and verify project is visible
    await page.goto(APP_URL);
    await page.click('[data-testid="workspace-selector"]');
    await page.click('text=Workspace A');
    await page.waitForTimeout(500);
    
    await page.goto(`${APP_URL}/`);
    await expect(page.locator('text=Project in Workspace A')).toBeVisible();
    
    // Switch to workspace B and verify project is NOT visible
    await page.click('[data-testid="workspace-selector"]');
    await page.click('text=Workspace B');
    await page.waitForTimeout(500);
    
    await page.goto(`${APP_URL}/`);
    await expect(page.locator('text=Project in Workspace A')).not.toBeVisible();
  });

  test('should manage workspace members', async ({ page }) => {
    // Navigate to workspace settings
    await page.goto(`${APP_URL}/workspace/${workspaceId}/settings`);
    
    // Click invite member button
    await page.click('button:has-text("Invite Member")');
    
    // Fill invitation form
    await page.fill('input[name="email"]', 'newmember@example.com');
    await page.selectOption('select[name="role"]', 'member');
    
    // Send invitation
    await page.click('button:has-text("Send Invitation")');
    
    // Verify success message
    await expect(page.locator('text=Invitation sent successfully')).toBeVisible();
  });

  test('should update workspace settings', async ({ page }) => {
    // Navigate to workspace settings
    await page.goto(`${APP_URL}/workspace/${workspaceId}/settings`);
    
    // Click edit workspace name
    await page.click('button:has-text("Edit")');
    
    // Update workspace name
    await page.fill('input[type="text"]', 'Updated Workspace Name');
    await page.click('button:has-text("Save")');
    
    // Verify update
    await expect(page.locator('text=Workspace updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated Workspace Name')).toBeVisible();
  });

  test('should handle workspace permissions', async ({ page, request }) => {
    // Create a workspace
    const workspace = await request.post(`${API_URL}/workspaces`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      data: { name: 'Permission Test Workspace' }
    });
    const ws = await workspace.json();
    
    // Try to access workspace settings (should be allowed as owner)
    await page.goto(`${APP_URL}/workspace/${ws.id}/settings`);
    await expect(page.locator('h1:has-text("Workspace Settings")')).toBeVisible();
    
    // Verify owner badge
    await expect(page.locator('text=owner')).toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    // Cleanup: Delete test workspaces
    const workspaces = await request.get(`${API_URL}/workspaces`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const workspaceList = await workspaces.json();
    const testWorkspaces = workspaceList.filter((w: any) => 
      w.name.includes('Test Workspace') || 
      w.name.includes('Workspace A') || 
      w.name.includes('Workspace B') ||
      w.name.includes('Permission Test')
    );
    
    for (const workspace of testWorkspaces) {
      await request.delete(`${API_URL}/workspaces/${workspace.id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    }
  });
});