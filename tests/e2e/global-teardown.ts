import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test global teardown...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Login as admin to clean up test data
    console.log('🔑 Logging in as admin for cleanup...');
    
    const loginResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@projecthub.local',
            password: 'admin123'
          })
        });
        return response.json();
      } catch (error) {
        console.error('Login failed during teardown:', error);
        return null;
      }
    });

    if (loginResponse?.accessToken) {
      console.log('🗑️ Cleaning up test projects...');
      await cleanupTestProjects(page, loginResponse.accessToken);
      
      console.log('🗑️ Cleaning up test teams...');
      await cleanupTestTeams(page, loginResponse.accessToken);
      
      console.log('🗑️ Cleaning up test dashboards...');
      await cleanupTestDashboards(page, loginResponse.accessToken);
    }

    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to prevent test failures due to cleanup issues
  } finally {
    await browser.close();
  }
}

async function cleanupTestProjects(page: any, token: string) {
  try {
    // Get all projects
    const projects = await page.evaluate(async (authToken) => {
      const response = await fetch('http://localhost:3001/api/projects', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      return data.projects || [];
    }, token);

    // Delete test projects
    const testProjectNames = ['E2E Test Project', 'Reporting Test Project'];
    
    for (const project of projects) {
      if (testProjectNames.some(name => project.name.includes(name))) {
        await page.evaluate(async ({ projectId, authToken }) => {
          await fetch(`http://localhost:3001/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
        }, { projectId: project.id, authToken: token });
        
        console.log(`Deleted test project: ${project.name}`);
      }
    }
  } catch (error) {
    console.log('Failed to cleanup test projects:', error);
  }
}

async function cleanupTestTeams(page: any, token: string) {
  try {
    // Get all teams
    const teams = await page.evaluate(async (authToken) => {
      const response = await fetch('http://localhost:3001/api/teams', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      return response.json();
    }, token);

    // Delete test teams
    const testTeamNames = ['E2E Test Team', 'Frontend Team'];
    
    for (const team of teams) {
      if (testTeamNames.some(name => team.name.includes(name))) {
        await page.evaluate(async ({ teamId, authToken }) => {
          await fetch(`http://localhost:3001/api/teams/${teamId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
        }, { teamId: team.id, authToken: token });
        
        console.log(`Deleted test team: ${team.name}`);
      }
    }
  } catch (error) {
    console.log('Failed to cleanup test teams:', error);
  }
}

async function cleanupTestDashboards(page: any, token: string) {
  try {
    // Get all dashboards
    const dashboards = await page.evaluate(async (authToken) => {
      const response = await fetch('http://localhost:3001/api/reports/dashboards', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      return response.json();
    }, token);

    // Delete test dashboards
    const testDashboardNames = ['E2E Test Dashboard', 'Drag Test Dashboard'];
    
    for (const dashboard of dashboards) {
      if (testDashboardNames.some(name => dashboard.name.includes(name))) {
        await page.evaluate(async ({ dashboardId, authToken }) => {
          await fetch(`http://localhost:3001/api/reports/dashboards/${dashboardId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
        }, { dashboardId: dashboard.id, authToken: token });
        
        console.log(`Deleted test dashboard: ${dashboard.name}`);
      }
    }
  } catch (error) {
    console.log('Failed to cleanup test dashboards:', error);
  }
}

export default globalTeardown;