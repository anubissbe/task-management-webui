import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');

  // Start browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for services to be ready
    console.log('⏳ Waiting for frontend to be ready...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    console.log('⏳ Waiting for backend to be ready...');
    await page.goto('http://localhost:3001/api/health');
    
    // Check if response is healthy
    const healthResponse = await page.textContent('body');
    if (!healthResponse?.includes('"status":"ok"')) {
      throw new Error('Backend health check failed');
    }

    // Setup test data
    console.log('📊 Setting up test data...');
    
    // Create test users if they don't exist
    await setupTestUsers(page);
    
    // Create test projects and tasks
    await setupTestProjects(page);

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestUsers(page: any) {
  // Admin user should already exist from migration
  // Create additional test users for E2E tests
  
  // gitleaks:allow - These are test credentials for E2E testing only
  const testUsers = [
    {
      email: 'test@projecthub.local',
      password: 'testpassword123', // gitleaks:allow
      firstName: 'Test',
      lastName: 'User',
      role: 'developer'
    },
    {
      email: 'manager@projecthub.local',
      password: 'managerpass', // gitleaks:allow
      firstName: 'Test',
      lastName: 'Manager',
      role: 'manager'
    },
    {
      email: 'viewer@projecthub.local',
      password: 'viewerpass', // gitleaks:allow
      firstName: 'Test',
      lastName: 'Viewer',
      role: 'viewer'
    },
    {
      email: 'member@projecthub.local',
      password: 'memberpass', // gitleaks:allow
      firstName: 'Team',
      lastName: 'Member',
      role: 'developer'
    }
  ];

  for (const user of testUsers) {
    try {
      // Try to register user (will fail if already exists, which is fine)
      await page.evaluate(async (userData) => {
        const response = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        return response.ok;
      }, user);
    } catch (error) {
      // User probably already exists, continue
      console.log(`User ${user.email} already exists or creation failed`);
    }
  }
}

async function setupTestProjects(page: any) {
  try {
    // Login as admin to create test projects
    const loginResponse = await page.evaluate(async () => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@projecthub.local',
          password: 'admin123' // gitleaks:allow - test admin credential
        })
      });
      return response.json();
    });

    if (loginResponse.accessToken) {
      // Create test projects
      const testProjects = [
        {
          name: 'E2E Test Project',
          description: 'Project for E2E testing',
          status: 'active',
          priority: 'medium'
        },
        {
          name: 'Reporting Test Project',
          description: 'Project for testing reporting features',
          status: 'active',
          priority: 'high'
        }
      ];

      for (const project of testProjects) {
        await page.evaluate(async ({ projectData, token }) => {
          const response = await fetch('http://localhost:3001/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData)
          });
          return response.json();
        }, { projectData: project, token: loginResponse.accessToken });
      }
    }
  } catch (error) {
    console.log('Failed to create test projects:', error);
  }
}

export default globalSetup;