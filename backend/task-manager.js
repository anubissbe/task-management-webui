const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://app_user:app_secure_2024@192.168.1.24:5433/mcp_learning"
});

async function getTasks() {
  try {
    const result = await pool.query(`
      SELECT id, name as title, description, status, priority, created_at, updated_at 
      FROM project_management.tasks 
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

async function updateTaskStatus(taskId, status, implementationNotes = null) {
  try {
    const updateQuery = implementationNotes 
      ? `UPDATE project_management.tasks SET status = $1, implementation_notes = $2, updated_at = NOW(), completed_at = NOW() WHERE id = $3 RETURNING *`
      : `UPDATE project_management.tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
    
    const params = implementationNotes 
      ? [status, implementationNotes, taskId]
      : [status, taskId];
    
    const result = await pool.query(updateQuery, params);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

async function getNextPendingTask() {
  try {
    const result = await pool.query(`
      SELECT id, name as title, description, status, priority, created_at, updated_at 
      FROM project_management.tasks 
      WHERE status = 'pending' 
      ORDER BY priority DESC, created_at ASC 
      LIMIT 1
    `);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting next task:', error);
    return null;
  }
}

async function main() {
  const command = process.argv[2];
  const taskId = process.argv[3];
  const status = process.argv[4];
  const completionNotes = process.argv[5];

  try {
    switch (command) {
      case 'tables':
        const tables = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        console.log('Available tables:', JSON.stringify(tables.rows, null, 2));
        break;
      
      case 'list':
        const tasks = await getTasks();
        console.log(JSON.stringify(tasks, null, 2));
        break;
      
      case 'schema':
        const schemaResult = await pool.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_schema = 'project_management' AND table_name = 'tasks'
          ORDER BY ordinal_position
        `);
        console.log('Task table schema:', JSON.stringify(schemaResult.rows, null, 2));
        break;
      
      case 'update':
        if (!taskId || !status) {
          console.error('Usage: node task-manager.js update <taskId> <status> [completionNotes]');
          process.exit(1);
        }
        const updatedTask = await updateTaskStatus(taskId, status, completionNotes);
        console.log('Updated task:', JSON.stringify(updatedTask, null, 2));
        break;
      
      case 'pending':
        const pendingTasks = await pool.query(`
          SELECT id, name as title, description, status, priority, created_at, updated_at 
          FROM project_management.tasks 
          WHERE status = 'pending' 
          ORDER BY priority DESC, created_at ASC
        `);
        console.log('All pending tasks:', JSON.stringify(pendingTasks.rows, null, 2));
        break;
      
      case 'high-priority':
        const highPriorityTasks = await pool.query(`
          SELECT id, name as title, description, status, priority, created_at, updated_at 
          FROM project_management.tasks 
          WHERE status = 'pending' AND priority = 'high'
          ORDER BY created_at ASC
        `);
        console.log('High priority pending tasks:', JSON.stringify(highPriorityTasks.rows, null, 2));
        break;
      
      case 'next':
        const nextTask = await getNextPendingTask();
        console.log('Next pending task:', JSON.stringify(nextTask, null, 2));
        break;
      
      case 'find-email':
        const emailTasks = await pool.query(`
          SELECT id, name as title, description, status, priority, created_at, updated_at 
          FROM project_management.tasks 
          WHERE name ILIKE '%email%' OR description ILIKE '%email%' OR name ILIKE '%notification%' OR description ILIKE '%notification%'
          ORDER BY created_at DESC
        `);
        console.log('Email-related tasks:', JSON.stringify(emailTasks.rows, null, 2));
        break;
      
      default:
        console.log('Available commands: list, update, next, find-email');
        console.log('Usage examples:');
        console.log('  node task-manager.js list');
        console.log('  node task-manager.js update <taskId> completed "Implementation details"');
        console.log('  node task-manager.js next');
        console.log('  node task-manager.js find-email');
        break;
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();