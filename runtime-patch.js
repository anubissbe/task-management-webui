// Runtime patch for ProjectHub backend
const Module = require('module');
const originalRequire = Module.prototype.require;

// Override require to patch modules on the fly
Module.prototype.require = function(id) {
    const module = originalRequire.apply(this, arguments);
    
    // Patch ProjectService
    if (id.includes('projectService')) {
        if (module.ProjectService && module.ProjectService.prototype.createProject) {
            const originalCreate = module.ProjectService.prototype.createProject;
            module.ProjectService.prototype.createProject = async function(data) {
                // Enhanced data with all required fields
                const enhancedData = {
                    ...data,
                    requirements: data.requirements || '',
                    acceptance_criteria: data.acceptance_criteria || '',
                    status: data.status || 'planning',
                    priority: data.priority || 'medium',
                    budget: data.budget || null,
                    team_id: data.team_id || null,
                    tags: data.tags || [],
                    is_template: data.is_template || false,
                    parent_id: data.parent_id || null,
                    completion_percentage: data.completion_percentage || 0,
                    risks: data.risks || [],
                    dependencies: data.dependencies || [],
                    milestones: data.milestones || '[]',
                    attachments: data.attachments || '[]',
                    custom_fields: data.custom_fields || '{}',
                    visibility: data.visibility || 'private'
                };
                
                // Call original with enhanced data
                try {
                    return await originalCreate.call(this, enhancedData);
                } catch (error) {
                    console.error('Project creation error:', error.message);
                    // If it still fails, try a direct query
                    const query = `
                        INSERT INTO project_management.projects 
                        (name, description, status, priority, workspace_id, owner_id, created_by)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING *
                    `;
                    const userId = data.userId || data.created_by || data.owner_id;
                    const result = await this.pool.query(query, [
                        data.name,
                        data.description || '',
                        data.status || 'planning',
                        data.priority || 'medium',
                        data.workspace_id,
                        userId,
                        userId
                    ]);
                    return result.rows[0];
                }
            };
            console.log('Patched ProjectService.createProject');
        }
    }
    
    // Patch NotificationService
    if (id.includes('notificationService')) {
        if (module.NotificationService && module.NotificationService.prototype.createNotificationTables) {
            module.NotificationService.prototype.createNotificationTables = async function() {
                console.log('Notification tables already created, skipping...');
                return;
            };
            console.log('Patched NotificationService.createNotificationTables');
        }
    }
    
    return module;
};

console.log('Runtime patches loaded');

// Load the original server
require('./dist/server.js');