// Final comprehensive fix for backend
const fs = require('fs');

console.log('Applying final fixes to backend...');

// 1. Fix projectController to properly extract user ID
const controllerPath = '/app/dist/controllers/projectController.js';
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

// Add user ID to project data in controller
const createProjectFixed = `
        const project = await projectService.createProject({
            ...req.body,
            workspace_id: workspace.id,
            owner_id: req.user.id || req.user.userId,
            created_by: req.user.id || req.user.userId
        });`;

controllerContent = controllerContent.replace(
    /const project = await projectService\.createProject\([\s\S]*?\);/,
    createProjectFixed
);

fs.writeFileSync(controllerPath, controllerContent);
console.log('✓ Fixed project controller');

// 2. Fix the SQL query parameter mapping
const servicePath = '/app/dist/services/projectService.js';
let serviceContent = fs.readFileSync(servicePath, 'utf8');

// Ensure the parameters match the VALUES placeholders
const fixedQuery = `async createProject(data) {
        const query = \`
      INSERT INTO project_management.projects 
      (name, description, requirements, acceptance_criteria, status, workspace_id, owner_id, created_by, priority, start_date, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    \`;
        const result = await database_1.pool.query(query, [
            data.name,
            data.description || '',
            data.requirements || '',
            data.acceptance_criteria || '',
            data.status || 'planning',
            data.workspace_id,
            data.owner_id,
            data.created_by || data.owner_id,
            data.priority || 'medium',
            data.start_date || null,
            data.due_date || null
        ]);
        return result.rows[0];
    }`;

// Replace the entire createProject method
serviceContent = serviceContent.replace(
    /async createProject\(data\) \{[\s\S]*?return result\.rows\[0\];\s*\}/,
    fixedQuery
);

fs.writeFileSync(servicePath, serviceContent);
console.log('✓ Fixed project service');

// 3. Verify notification service is disabled
const notificationPath = '/app/dist/services/notificationService.js';
if (fs.existsSync(notificationPath)) {
    let notifContent = fs.readFileSync(notificationPath, 'utf8');
    notifContent = notifContent.replace(
        'await this.createNotificationTables();',
        '// Disabled: await this.createNotificationTables();'
    );
    fs.writeFileSync(notificationPath, notifContent);
    console.log('✓ Disabled notification table creation');
}

console.log('\nAll fixes applied successfully!');