import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  email: 'test@projecthub.local',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User'
};

const testTeam = {
  name: 'E2E Test Team',
  description: 'Team created during E2E testing',
  slug: 'e2e-test-team'
};

const teamMember = {
  email: 'member@projecthub.local',
  role: 'member' as const
};

test.describe('Team Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create a new team successfully', async ({ page }) => {
    // Navigate to team management
    await page.click('[data-testid="team-management-nav"]');
    await expect(page).toHaveURL('/teams');

    // Click create team button
    await page.click('[data-testid="create-team-button"]');

    // Fill out team creation form
    await page.fill('[data-testid="team-name-input"]', testTeam.name);
    await page.fill('[data-testid="team-description-input"]', testTeam.description);
    
    // Check if slug is auto-generated
    const slugValue = await page.inputValue('[data-testid="team-slug-input"]');
    expect(slugValue).toBe(testTeam.slug);

    // Submit form
    await page.click('[data-testid="create-team-submit"]');

    // Verify team was created
    await expect(page.locator('[data-testid="team-list"]')).toContainText(testTeam.name);
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should invite a team member', async ({ page }) => {
    // Navigate to team management and select existing team
    await page.goto('/teams');
    await page.click(`[data-testid="team-item-${testTeam.slug}"]`);

    // Click invite member button
    await page.click('[data-testid="invite-member-button"]');

    // Fill invitation form
    await page.fill('[data-testid="invite-email-input"]', teamMember.email);
    await page.selectOption('[data-testid="invite-role-select"]', teamMember.role);

    // Submit invitation
    await page.click('[data-testid="send-invitation-button"]');

    // Verify invitation was sent
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Invitation sent');
    
    // Verify member appears in pending invitations
    await expect(page.locator('[data-testid="team-invitations"]')).toContainText(teamMember.email);
  });

  test('should update team member role', async ({ page }) => {
    // Navigate to team with existing members
    await page.goto('/teams');
    await page.click(`[data-testid="team-item-${testTeam.slug}"]`);

    // Find a team member (not owner) and change role
    const memberRow = page.locator('[data-testid="team-member-row"]').first();
    await memberRow.locator('[data-testid="member-role-select"]').selectOption('admin');

    // Verify role was updated
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Role updated');
    await expect(memberRow.locator('[data-testid="member-role-badge"]')).toContainText('admin');
  });

  test('should remove team member', async ({ page }) => {
    // Navigate to team management
    await page.goto('/teams');
    await page.click(`[data-testid="team-item-${testTeam.slug}"]`);

    // Get initial member count
    const initialCount = await page.locator('[data-testid="team-member-row"]').count();

    // Remove a member (not owner)
    const memberRow = page.locator('[data-testid="team-member-row"]').first();
    await memberRow.locator('[data-testid="remove-member-button"]').click();

    // Confirm removal in dialog
    await page.click('[data-testid="confirm-remove-button"]');

    // Verify member was removed
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Member removed');
    const newCount = await page.locator('[data-testid="team-member-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should validate team creation form', async ({ page }) => {
    // Navigate to team management
    await page.goto('/teams');
    await page.click('[data-testid="create-team-button"]');

    // Try to submit empty form
    await page.click('[data-testid="create-team-submit"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="team-name-error"]')).toContainText('Team name is required');
    await expect(page.locator('[data-testid="team-slug-error"]')).toContainText('Team slug is required');

    // Test invalid slug
    await page.fill('[data-testid="team-name-input"]', 'Test Team');
    await page.fill('[data-testid="team-slug-input"]', 'invalid slug!');
    await page.click('[data-testid="create-team-submit"]');

    await expect(page.locator('[data-testid="team-slug-error"]')).toContainText('Slug must contain only letters, numbers, and hyphens');
  });

  test('should handle permission restrictions', async ({ page }) => {
    // Login as viewer role user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'viewer@projecthub.local');
    await page.fill('[data-testid="password-input"]', 'viewerpass');
    await page.click('[data-testid="login-button"]');

    // Navigate to team management
    await page.goto('/teams');

    // Verify create team button is not visible for viewer
    await expect(page.locator('[data-testid="create-team-button"]')).not.toBeVisible();

    // Select a team where user is viewer
    await page.click('[data-testid="team-item"]').first();

    // Verify invite and management buttons are not visible
    await expect(page.locator('[data-testid="invite-member-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="remove-member-button"]')).not.toBeVisible();
  });

  test('should display team statistics', async ({ page }) => {
    // Navigate to team with projects and tasks
    await page.goto('/teams');
    await page.click(`[data-testid="team-item-${testTeam.slug}"]`);

    // Verify team stats are displayed
    await expect(page.locator('[data-testid="team-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="member-count"]')).toContainText(/\d+ members?/);
    await expect(page.locator('[data-testid="project-count"]')).toContainText(/\d+ projects?/);
  });

  test('should search and filter teams', async ({ page }) => {
    // Navigate to team management
    await page.goto('/teams');

    // Use search functionality
    await page.fill('[data-testid="team-search-input"]', 'E2E');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="team-list"]')).toContainText(testTeam.name);
    
    // Clear search
    await page.fill('[data-testid="team-search-input"]', '');
    
    // Verify all teams are shown again
    const teamCount = await page.locator('[data-testid="team-item"]').count();
    expect(teamCount).toBeGreaterThan(0);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Remove test team if it exists
    try {
      await page.goto('/teams');
      const testTeamExists = await page.locator(`[data-testid="team-item-${testTeam.slug}"]`).isVisible();
      
      if (testTeamExists) {
        await page.click(`[data-testid="team-item-${testTeam.slug}"]`);
        await page.click('[data-testid="team-settings-button"]');
        await page.click('[data-testid="delete-team-button"]');
        await page.fill('[data-testid="confirm-delete-input"]', testTeam.name);
        await page.click('[data-testid="confirm-delete-button"]');
      }
    } catch (error) {
      console.log('Cleanup failed:', error);
    }
  });
});