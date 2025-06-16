const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://app_user:app_secure_2024@192.168.1.24:5433/mcp_learning'
});

async function updateTasks() {
  try {
    await client.connect();
    
    const query = `
      UPDATE project_management.tasks 
      SET status = 'completed', completed_at = NOW() 
      WHERE name IN (
        'Improve branding consistency - ensure all UI elements use the black (#0a0a0a) and orange (#ff6500) color scheme throughout the application',
        'Make top logo clickable to navigate back to home page (/) of the task manager',
        'Add GitHub logo/link in footer that opens https://github.com/anubissbe/ProjectHub-Mcp in new tab'
      )
      RETURNING id, name, status;
    `;
    
    const result = await client.query(query);
    console.log(`Updated ${result.rowCount} tasks:`);
    result.rows.forEach(row => {
      console.log(`- ${row.name}: ${row.status}`);
    });
    
  } catch (error) {
    console.error('Error updating tasks:', error);
  } finally {
    await client.end();
  }
}

updateTasks();