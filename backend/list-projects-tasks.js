const { Client } = require('pg');

async function listProjectsAndTasks() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'mcp_user',
    password: 'mcp_secure_password_2024',
    database: 'mcp_learning'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database\n');
    
    // List all projects
    console.log('=== ALL PROJECTS ===\n');
    const projectsResult = await client.query(`
      SELECT 
        p.id,
        p.name,
        p.status,
        p.description,
        p.created_at,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as pending_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as in_progress_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks
      FROM project_management.projects p
      LEFT JOIN project_management.tasks t ON t.project_id = p.id
      GROUP BY p.id, p.name, p.status, p.description, p.created_at
      ORDER BY p.created_at DESC
    `);
    
    if (projectsResult.rows.length === 0) {
      console.log('No projects found in the database.\n');
    } else {
      projectsResult.rows.forEach((project, index) => {
        console.log(`${index + 1}. Project: ${project.name} (ID: ${project.id})`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Description: ${project.description}`);
        console.log(`   Total Tasks: ${project.task_count} (Pending: ${project.pending_tasks}, In Progress: ${project.in_progress_tasks}, Completed: ${project.completed_tasks})`);
        console.log(`   Created: ${new Date(project.created_at).toLocaleString()}\n`);
      });
    }
    
    // Now get all tasks, specifically looking for "Task 1" or first tasks
    console.log('\n=== CURRENT TASKS (Focus on Task 1) ===\n');
    const tasksResult = await client.query(`
      SELECT 
        t.id,
        t.name,
        t.description,
        t.status,
        t.priority,
        t.estimated_hours,
        t.actual_hours,
        t.test_criteria,
        p.name as project_name,
        p.id as project_id,
        t.created_at
      FROM project_management.tasks t
      JOIN project_management.projects p ON t.project_id = p.id
      WHERE t.status IN ('pending', 'in_progress')
      ORDER BY 
        CASE 
          WHEN t.name LIKE '%Task 1%' OR t.name LIKE '%1.1%' OR t.name LIKE '%Phase 1%' THEN 0 
          WHEN t.status = 'in_progress' THEN 1
          WHEN t.priority = 'high' THEN 2
          WHEN t.priority = 'medium' THEN 3
          ELSE 4
        END,
        t.created_at ASC
    `);
    
    if (tasksResult.rows.length === 0) {
      console.log('No pending or in-progress tasks found.\n');
    } else {
      console.log(`Found ${tasksResult.rows.length} active tasks:\n`);
      
      // Group tasks by project
      const tasksByProject = {};
      tasksResult.rows.forEach(task => {
        if (!tasksByProject[task.project_id]) {
          tasksByProject[task.project_id] = {
            name: task.project_name,
            tasks: []
          };
        }
        tasksByProject[task.project_id].tasks.push(task);
      });
      
      Object.entries(tasksByProject).forEach(([projectId, project]) => {
        console.log(`\n📁 Project: ${project.name}`);
        console.log('─'.repeat(50));
        
        project.tasks.forEach((task, index) => {
          const isTask1 = task.name.includes('Task 1') || task.name.includes('1.1') || task.name.includes('Phase 1');
          const prefix = isTask1 ? '⭐' : '  ';
          
          console.log(`\n${prefix} ${index + 1}. [${task.priority.toUpperCase()}] ${task.name}`);
          console.log(`     Status: ${task.status}`);
          console.log(`     Description: ${task.description}`);
          if (task.test_criteria) {
            console.log(`     Test Criteria: ${task.test_criteria}`);
          }
          if (task.estimated_hours) {
            console.log(`     Estimated Hours: ${task.estimated_hours}`);
          }
          if (task.actual_hours) {
            console.log(`     Actual Hours: ${task.actual_hours}`);
          }
        });
      });
    }
    
    // Check for any completed tasks in the last 24 hours
    console.log('\n\n=== RECENTLY COMPLETED TASKS (Last 24 hours) ===\n');
    const recentResult = await client.query(`
      SELECT 
        t.name,
        t.status,
        p.name as project_name,
        t.updated_at
      FROM project_management.tasks t
      JOIN project_management.projects p ON t.project_id = p.id
      WHERE t.status = 'completed' 
      AND t.updated_at > NOW() - INTERVAL '24 hours'
      ORDER BY t.updated_at DESC
    `);
    
    if (recentResult.rows.length > 0) {
      recentResult.rows.forEach(task => {
        console.log(`✅ ${task.name} (${task.project_name})`);
        console.log(`   Completed: ${new Date(task.updated_at).toLocaleString()}\n`);
      });
    } else {
      console.log('No tasks completed in the last 24 hours.\n');
    }
    
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    console.error('Make sure PostgreSQL is running and credentials are correct.');
  } finally {
    await client.end();
  }
}

// Run the script
listProjectsAndTasks().catch(console.error);