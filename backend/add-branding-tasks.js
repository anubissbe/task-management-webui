const { Client } = require('pg');

async function addBrandingTasksToProjectHub() {
  console.log('🎯 Adding branding tasks to ProjectHub-Mcp project\n');
  
  const client = new Client({
    host: '192.168.1.24', // Synology PostgreSQL server
    port: 5433,
    user: 'app_user',
    password: 'app_secure_2024',
    database: 'mcp_learning'
  });

  try {
    await client.connect();
    console.log('✅ Connected to Synology PostgreSQL at 192.168.1.24:5433\n');
    
    // ProjectHub-Mcp Project ID
    const projectId = '0a4eb0b4-a844-4835-a911-cad4b9e77350';
    
    // Define the tasks to add
    const tasksToAdd = [
      {
        name: 'Improve branding consistency - ensure all UI elements use the black (#0a0a0a) and orange (#ff6500) color scheme throughout the application',
        description: 'Review and update all UI components to ensure consistent use of the ProjectHub-Mcp branding colors: black (#0a0a0a) background and orange (#ff6500) accents. This includes buttons, links, headers, sidebars, and all other UI elements.',
        priority: 'high',
        test_criteria: 'All UI elements consistently use the defined color scheme, no deviations from brand colors',
        estimated_hours: 4
      },
      {
        name: 'Make top logo clickable to navigate back to home page (/) of the task manager',
        description: 'Update the ProjectHub-Mcp logo in the header to be a clickable link that navigates users back to the home page (/). Ensure proper cursor feedback and accessibility.',
        priority: 'high',
        test_criteria: 'Logo is clickable, navigates to home page, has proper hover state and cursor',
        estimated_hours: 1
      },
      {
        name: 'Add GitHub logo/link in footer that opens https://github.com/anubissbe/ProjectHub-Mcp in new tab',
        description: 'Add a GitHub icon/logo in the footer that links to the ProjectHub-Mcp repository. The link should open in a new tab and include proper accessibility attributes.',
        priority: 'high',
        test_criteria: 'GitHub logo present in footer, opens repository in new tab, has proper accessibility attributes',
        estimated_hours: 1
      },
      {
        name: 'Audit all pages and components for branding inconsistencies - document any deviations from black/orange theme',
        description: 'Perform a comprehensive audit of all pages and components to identify any branding inconsistencies. Document all deviations from the black (#0a0a0a) and orange (#ff6500) color scheme and create a checklist for fixes.',
        priority: 'medium',
        test_criteria: 'Complete audit document listing all branding inconsistencies, checklist created for fixes',
        estimated_hours: 3
      },
      {
        name: 'Ensure favicon and page title reflect ProjectHub-Mcp branding',
        description: 'Update the favicon to match ProjectHub-Mcp branding (black/orange theme) and ensure all page titles properly reflect "ProjectHub-Mcp" branding throughout the application.',
        priority: 'medium',
        test_criteria: 'Favicon matches brand colors, all page titles include "ProjectHub-Mcp" appropriately',
        estimated_hours: 2
      }
    ];
    
    console.log('📝 Adding branding tasks to ProjectHub-Mcp...\n');
    
    let addedCount = 0;
    for (const task of tasksToAdd) {
      // Check if task already exists
      const existingTask = await client.query(`
        SELECT id FROM project_management.tasks
        WHERE project_id = $1 AND name = $2
      `, [projectId, task.name]);
      
      if (existingTask.rows.length === 0) {
        await client.query(`
          INSERT INTO project_management.tasks 
          (project_id, name, description, priority, test_criteria, estimated_hours, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
        `, [projectId, task.name, task.description, task.priority, task.test_criteria, task.estimated_hours]);
        
        console.log(`✅ Added: ${task.name.substring(0, 60)}...`);
        addedCount++;
      } else {
        console.log(`⏭️  Already exists: ${task.name.substring(0, 60)}...`);
      }
    }
    
    console.log(`\n✨ Successfully added ${addedCount} new tasks!\n`);
    
    // Get updated project status
    console.log('📊 Getting updated project status...');
    const projectStatus = await client.query(`
      SELECT 
        p.name,
        p.phase,
        COUNT(t.*) as total_tasks,
        COUNT(*) FILTER (WHERE t.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE t.status = 'pending') as pending
      FROM project_management.projects p
      LEFT JOIN project_management.tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.phase
    `, [projectId]);
    
    const status = projectStatus.rows[0];
    const completionPercentage = status.total_tasks > 0 ? (status.completed / status.total_tasks * 100).toFixed(1) : 0;
    
    console.log(`\n📈 Updated ProjectHub-Mcp Status:`);
    console.log(`   Project: ${status.name}`);
    console.log(`   Total tasks: ${status.total_tasks}`);
    console.log(`   Completed: ${status.completed}`);
    console.log(`   In Progress: ${status.in_progress}`);
    console.log(`   Pending: ${status.pending}`);
    console.log(`   Completion: ${completionPercentage}%`);
    
    console.log('\n✅ All branding tasks successfully added to ProjectHub-Mcp!');
    console.log('🌐 Access the task manager at: http://192.168.1.24:5173');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Ensure the Synology PostgreSQL server is running and accessible');
    }
  } finally {
    await client.end();
  }
}

// Check if pg module is available
try {
  require('pg');
} catch (e) {
  console.log('Installing pg module...');
  const { execSync } = require('child_process');
  execSync('npm install pg', { stdio: 'inherit' });
}

addBrandingTasksToProjectHub();