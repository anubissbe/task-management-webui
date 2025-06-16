const { Client } = require('pg');

async function verifyBrandingTasks() {
  console.log('🔍 Verifying branding tasks in ProjectHub-Mcp project\n');
  
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
    
    // Get all tasks for the project
    console.log('📋 Listing all branding-related tasks in ProjectHub-Mcp:\n');
    const tasksQuery = await client.query(`
      SELECT 
        id,
        name,
        priority,
        status,
        estimated_hours,
        created_at
      FROM project_management.tasks
      WHERE project_id = $1 
      AND (
        LOWER(name) LIKE '%brand%' 
        OR LOWER(name) LIKE '%logo%' 
        OR LOWER(name) LIKE '%github%' 
        OR LOWER(name) LIKE '%favicon%'
        OR LOWER(name) LIKE '%color%'
        OR LOWER(name) LIKE '%orange%'
      )
      ORDER BY created_at DESC
    `, [projectId]);
    
    if (tasksQuery.rows.length === 0) {
      console.log('❌ No branding tasks found');
    } else {
      console.log(`Found ${tasksQuery.rows.length} branding-related tasks:\n`);
      tasksQuery.rows.forEach((task, index) => {
        console.log(`${index + 1}. ${task.name.substring(0, 80)}...`);
        console.log(`   Priority: ${task.priority} | Status: ${task.status} | Est. Hours: ${task.estimated_hours}`);
        console.log(`   Created: ${new Date(task.created_at).toLocaleString()}`);
        console.log(`   ID: ${task.id}\n`);
      });
    }
    
    // Get overall project statistics
    console.log('📊 Getting project statistics...');
    const projectStats = await client.query(`
      SELECT 
        p.name,
        p.description,
        COUNT(t.*) as total_tasks,
        COUNT(*) FILTER (WHERE t.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE t.status = 'pending') as pending,
        COUNT(*) FILTER (WHERE t.priority = 'high') as high_priority,
        COUNT(*) FILTER (WHERE t.priority = 'medium') as medium_priority,
        COUNT(*) FILTER (WHERE t.priority = 'low') as low_priority
      FROM project_management.projects p
      LEFT JOIN project_management.tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.description
    `, [projectId]);
    
    if (projectStats.rows.length > 0) {
      const stats = projectStats.rows[0];
      const completionPercentage = stats.total_tasks > 0 ? (stats.completed / stats.total_tasks * 100).toFixed(1) : 0;
      
      console.log(`\n📈 ProjectHub-Mcp Overall Status:`);
      console.log(`   Project: ${stats.name}`);
      console.log(`   Description: ${stats.description || 'N/A'}`);
      console.log(`   Total tasks: ${stats.total_tasks}`);
      console.log(`   Completed: ${stats.completed}`);
      console.log(`   In Progress: ${stats.in_progress}`);
      console.log(`   Pending: ${stats.pending}`);
      console.log(`   Completion: ${completionPercentage}%`);
      console.log(`\n   Priority Distribution:`);
      console.log(`   High: ${stats.high_priority}`);
      console.log(`   Medium: ${stats.medium_priority}`);
      console.log(`   Low: ${stats.low_priority}`);
    }
    
    console.log('\n✅ Verification complete!');
    console.log('🌐 Access the task manager at: http://192.168.1.24:5173');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
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

verifyBrandingTasks();