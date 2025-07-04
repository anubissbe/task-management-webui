#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

async function testConnection() {
  console.log('🧪 Testing ProjectHub MCP Connection...\n');
  
  const apiUrl = process.env.PROJECTHUB_API_URL || 'http://localhost:3008/api';
  const email = process.env.PROJECTHUB_EMAIL;
  const password = process.env.PROJECTHUB_PASSWORD;
  
  if (!email || !password) {
    console.error('❌ Missing credentials!');
    console.error('Please set PROJECTHUB_EMAIL and PROJECTHUB_PASSWORD environment variables');
    process.exit(1);
  }
  
  console.log(`API URL: ${apiUrl}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${'*'.repeat(password.length)}\n`);
  
  const api = axios.create({
    baseURL: apiUrl,
    timeout: 5000
  });
  
  try {
    // Test API health
    console.log('1. Testing API health...');
    try {
      const health = await api.get('/health');
      console.log('✓ API is healthy\n');
    } catch (error) {
      // Try without /api prefix
      console.log('   Trying alternate health endpoint...');
      const baseUrl = apiUrl.replace('/api', '');
      const health = await axios.get(`${baseUrl}/health`);
      console.log('✓ API is healthy (using base URL)\n');
    }
    
    // Test authentication
    console.log('2. Testing authentication...');
    const auth = await api.post('/auth/login', {
      email: email,
      password: password
    });
    console.log('✓ Authentication successful');
    console.log(`   User: ${auth.data.user.first_name} ${auth.data.user.last_name}`);
    console.log(`   Role: ${auth.data.user.role}\n`);
    
    // Set auth token
    api.defaults.headers.common['Authorization'] = `Bearer ${auth.data.token}`;
    
    // Test listing projects
    console.log('3. Testing project listing...');
    const projects = await api.get('/projects');
    console.log(`✓ Found ${projects.data.length} projects`);
    if (projects.data.length > 0) {
      console.log('   Sample projects:');
      projects.data.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id}, Status: ${p.status})`);
      });
    }
    console.log('');
    
    // Test listing tasks
    console.log('4. Testing task listing...');
    const tasks = await api.get('/tasks');
    console.log(`✓ Found ${tasks.data.length} tasks`);
    if (tasks.data.length > 0) {
      console.log('   Sample tasks:');
      tasks.data.slice(0, 3).forEach(t => {
        console.log(`   - ${t.title} (ID: ${t.id}, Status: ${t.status}, Priority: ${t.priority})`);
      });
    }
    console.log('');
    
    // Test analytics
    console.log('5. Testing analytics endpoint...');
    const analytics = await api.get('/analytics');
    console.log('✓ Analytics data retrieved');
    console.log(`   Total projects: ${analytics.data.projectStats?.total || 0}`);
    console.log(`   Total tasks: ${analytics.data.taskStats?.total || 0}`);
    console.log('');
    
    console.log('✅ All tests passed! MCP server is ready to use.\n');
    
    // Show MCP configuration
    console.log('📋 Add this to your AI assistant\'s MCP configuration:\n');
    console.log(JSON.stringify({
      "projecthub": {
        "command": "node",
        "args": [`${process.cwd()}/projecthub-mcp-wrapper.js`],
        "env": {
          "PROJECTHUB_API_URL": apiUrl,
          "PROJECTHUB_EMAIL": email,
          "PROJECTHUB_PASSWORD": "your-password-here"
        }
      }
    }, null, 2));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify ProjectHub is running at', apiUrl);
    console.error('2. Check the email and password are correct');
    console.error('3. Ensure the user has proper permissions');
    console.error('4. Check for any firewall or network issues');
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);